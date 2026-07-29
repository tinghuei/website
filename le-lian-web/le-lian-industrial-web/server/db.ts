import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, contactSubmissions, InsertContactSubmission, jobPositions, competencies, positionCompetencies, employeeCompetencies, gapAnalysisResults, employeeSelfAssessments, selfAssessmentDetails, competencyFrameworks, assessmentResults, InsertJobPosition, InsertCompetency, InsertPositionCompetency, InsertEmployeeCompetency, InsertGapAnalysisResult, InsertEmployeeSelfAssessment, InsertSelfAssessmentDetail, InsertCompetencyFramework, InsertAssessmentResult } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Contact submission queries
export async function createContactSubmission(submission: InsertContactSubmission) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(contactSubmissions).values(submission);
  return result;
}

export async function getContactSubmissions(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateContactSubmissionStatus(
  id: number,
  status: "new" | "read" | "replied" | "archived"
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db
    .update(contactSubmissions)
    .set({ status })
    .where(eq(contactSubmissions.id, id));
}


// Competency Gap Analysis queries
export async function createJobPosition(position: InsertJobPosition) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(jobPositions).values(position);
}

export async function getJobPositions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(jobPositions);
}

export async function createCompetency(competency: InsertCompetency) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(competencies).values(competency);
}

export async function getCompetencies() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(competencies);
}

export async function addPositionCompetency(posComp: InsertPositionCompetency) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(positionCompetencies).values(posComp);
}

export async function getPositionCompetencies(positionId: number) {
  const db = await getDb();
  if (!db) return [];
  const { eq: eqOp } = require('drizzle-orm');
  const result = await db
    .select({
      id: competencies.id,
      name: competencies.name,
      category: competencies.category,
      description: competencies.description,
      requiredLevel: positionCompetencies.requiredLevel,
      importance: positionCompetencies.importance,
    })
    .from(positionCompetencies)
    .innerJoin(competencies, eq(positionCompetencies.competencyId, competencies.id))
    .where(eq(positionCompetencies.positionId, positionId));
  return result;
}

export async function addEmployeeCompetency(empComp: InsertEmployeeCompetency) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(employeeCompetencies).values(empComp);
}

export async function getEmployeeCompetencies(employeeName: string, positionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(employeeCompetencies)
    .where(eq(employeeCompetencies.employeeName, employeeName) && eq(employeeCompetencies.positionId, positionId));
}

export async function createGapAnalysis(analysis: InsertGapAnalysisResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(gapAnalysisResults).values(analysis);
}

export async function getGapAnalysisResults(employeeName: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(gapAnalysisResults)
    .where(eq(gapAnalysisResults.employeeName, employeeName))
    .orderBy(desc(gapAnalysisResults.analysisDate));
}

export async function calculateGapAnalysis(employeeName: string, positionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const requiredComps = await db.select().from(positionCompetencies)
    .where(eq(positionCompetencies.positionId, positionId));

  const employeeComps = await db.select().from(employeeCompetencies)
    .where(eq(employeeCompetencies.employeeName, employeeName) && eq(employeeCompetencies.positionId, positionId));

  let totalGap = 0;
  let totalRequired = 0;

  for (const req of requiredComps) {
    const emp = employeeComps.find(e => e.competencyId === req.competencyId);
    const gap = Math.max(0, req.requiredLevel - (emp?.currentLevel || 0));
    totalGap += gap;
    totalRequired += req.requiredLevel;
  }

  const gapPercentage = totalRequired > 0 ? Math.round((totalGap / totalRequired) * 100) : 0;

  return { totalGap, gapPercentage, totalRequired };
}


// Employee Self-Assessment queries
export async function createSelfAssessment(assessment: InsertEmployeeSelfAssessment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(employeeSelfAssessments).values(assessment);
  return result;
}

export async function getSelfAssessmentsByEmployee(employeeName: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(employeeSelfAssessments)
    .where(eq(employeeSelfAssessments.employeeName, employeeName))
    .orderBy(desc(employeeSelfAssessments.assessmentDate));
}

export async function getSelfAssessmentDetail(assessmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(selfAssessmentDetails)
    .where(eq(selfAssessmentDetails.assessmentId, assessmentId));
}

export async function addSelfAssessmentDetail(detail: InsertSelfAssessmentDetail) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(selfAssessmentDetails).values(detail);
}

export async function updateSelfAssessmentStatus(assessmentId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(employeeSelfAssessments)
    .set({ status: status as any })
    .where(eq(employeeSelfAssessments.id, assessmentId));
}

export async function addCompetencyFramework(framework: InsertCompetencyFramework) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(competencyFrameworks).values(framework);
}

export async function getCompetencyFramework(competencyId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(competencyFrameworks)
    .where(eq(competencyFrameworks.competencyId, competencyId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function calculateGapWithSelfAssessment(employeeName: string, positionId: number, assessmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const requiredComps = await db.select().from(positionCompetencies)
    .where(eq(positionCompetencies.positionId, positionId));

  const selfAssessedComps = await db.select().from(selfAssessmentDetails)
    .where(eq(selfAssessmentDetails.assessmentId, assessmentId));

  let totalGap = 0;
  let totalRequired = 0;
  const gapDetails: any[] = [];

  for (const req of requiredComps) {
    const selfAssessed = selfAssessedComps.find(s => s.competencyId === req.competencyId);
    const gap = Math.max(0, req.requiredLevel - (selfAssessed?.selfRatedLevel || 0));
    totalGap += gap;
    totalRequired += req.requiredLevel;

    gapDetails.push({
      competencyId: req.competencyId,
      requiredLevel: req.requiredLevel,
      selfRatedLevel: selfAssessed?.selfRatedLevel || 0,
      gap: gap,
      importance: req.importance,
    });
  }

  const gapPercentage = totalRequired > 0 ? Math.round((totalGap / totalRequired) * 100) : 0;

  return { totalGap, gapPercentage, totalRequired, gapDetails };
}


// Assessment Results queries for Admin Dashboard
export async function saveAssessmentResult(result: InsertAssessmentResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(assessmentResults).values(result);
}

export async function getAllAssessmentResults(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(assessmentResults)
    .orderBy(desc(assessmentResults.assessmentDate))
    .limit(limit)
    .offset(offset);
}

export async function getAssessmentResultsByDepartment(department: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(assessmentResults)
    .where(eq(assessmentResults.department, department))
    .orderBy(desc(assessmentResults.assessmentDate));
}

export async function getAssessmentResultsByPosition(positionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(assessmentResults)
    .where(eq(assessmentResults.positionId, positionId))
    .orderBy(desc(assessmentResults.assessmentDate));
}

export async function getAssessmentResultsByEmployee(employeeName: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(assessmentResults)
    .where(eq(assessmentResults.employeeName, employeeName))
    .orderBy(desc(assessmentResults.assessmentDate));
}

export async function getDepartmentStatistics(department: string) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(assessmentResults)
    .where(eq(assessmentResults.department, department));
  
  if (results.length === 0) return null;
  
  const totalEmployees = results.length;
  const avgCompletion = Math.round(
    results.reduce((sum, r) => sum + r.completionPercentage, 0) / totalEmployees
  );
  const avgGap = Math.round(
    results.reduce((sum, r) => sum + r.gapPercentage, 0) / totalEmployees
  );
  
  return {
    department,
    totalEmployees,
    avgCompletion,
    avgGap,
    results,
  };
}

export async function getCompanyStatistics() {
  const db = await getDb();
  if (!db) return null;
  
  const allResults = await db.select().from(assessmentResults);
  
  if (allResults.length === 0) return null;
  
  const departments = Array.from(new Set(allResults.map(r => r.department)));
  const totalEmployees = allResults.length;
  const avgCompletion = Math.round(
    allResults.reduce((sum, r) => sum + r.completionPercentage, 0) / totalEmployees
  );
  const avgGap = Math.round(
    allResults.reduce((sum, r) => sum + r.gapPercentage, 0) / totalEmployees
  );
  
  return {
    totalEmployees,
    totalDepartments: departments.length,
    avgCompletion,
    avgGap,
    departments,
  };
}
