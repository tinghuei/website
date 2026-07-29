import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Contact form submissions table
 * Stores all contact form submissions from the website
 */
export const contactSubmissions = mysqlTable("contactSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  company: varchar("company", { length: 255 }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "read", "replied", "archived"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;
/**
 * Job Positions table
 * Stores job position definitions with required competencies
 */
export const jobPositions = mysqlTable("jobPositions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobPosition = typeof jobPositions.$inferSelect;
export type InsertJobPosition = typeof jobPositions.$inferInsert;

/**
 * Competencies table
 * Stores skill/competency definitions
 */
export const competencies = mysqlTable("competencies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Competency = typeof competencies.$inferSelect;
export type InsertCompetency = typeof competencies.$inferInsert;

/**
 * Position Competency Requirements
 * Maps required competencies to job positions with proficiency levels
 */
export const positionCompetencies = mysqlTable("positionCompetencies", {
  id: int("id").autoincrement().primaryKey(),
  positionId: int("positionId").notNull(),
  competencyId: int("competencyId").notNull(),
  requiredLevel: int("requiredLevel").notNull(),
  importance: varchar("importance", { length: 50 }).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PositionCompetency = typeof positionCompetencies.$inferSelect;
export type InsertPositionCompetency = typeof positionCompetencies.$inferInsert;

/**
 * Employee Competency Assessments
 * Tracks employee current competency levels
 */
export const employeeCompetencies = mysqlTable("employeeCompetencies", {
  id: int("id").autoincrement().primaryKey(),
  employeeName: varchar("employeeName", { length: 255 }).notNull(),
  positionId: int("positionId").notNull(),
  competencyId: int("competencyId").notNull(),
  currentLevel: int("currentLevel").notNull(),
  assessmentDate: timestamp("assessmentDate").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmployeeCompetency = typeof employeeCompetencies.$inferSelect;
export type InsertEmployeeCompetency = typeof employeeCompetencies.$inferInsert;

/**
 * Competency Gap Analysis Results
 * Stores analysis results for performance tracking
 */
export const gapAnalysisResults = mysqlTable("gapAnalysisResults", {
  id: int("id").autoincrement().primaryKey(),
  employeeName: varchar("employeeName", { length: 255 }).notNull(),
  positionId: int("positionId").notNull(),
  totalGap: int("totalGap").notNull(),
  gapPercentage: int("gapPercentage").notNull(),
  analysisDate: timestamp("analysisDate").defaultNow().notNull(),
  recommendedTraining: text("recommendedTraining"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GapAnalysisResult = typeof gapAnalysisResults.$inferSelect;
export type InsertGapAnalysisResult = typeof gapAnalysisResults.$inferInsert;


/**
 * Employee Self-Assessment Records
 * Tracks employee self-assessed competency levels
 */
export const employeeSelfAssessments = mysqlTable("employeeSelfAssessments", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  employeeName: varchar("employeeName", { length: 255 }).notNull(),
  positionId: int("positionId").notNull(),
  assessmentDate: timestamp("assessmentDate").defaultNow().notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "reviewed", "approved"]).default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmployeeSelfAssessment = typeof employeeSelfAssessments.$inferSelect;
export type InsertEmployeeSelfAssessment = typeof employeeSelfAssessments.$inferInsert;

/**
 * Self-Assessed Competency Details
 * Stores individual competency scores from self-assessment
 */
export const selfAssessmentDetails = mysqlTable("selfAssessmentDetails", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessmentId").notNull(),
  competencyId: int("competencyId").notNull(),
  selfRatedLevel: int("selfRatedLevel").notNull(),
  evidenceDescription: text("evidenceDescription"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SelfAssessmentDetail = typeof selfAssessmentDetails.$inferSelect;
export type InsertSelfAssessmentDetail = typeof selfAssessmentDetails.$inferInsert;

/**
 * Competency Framework Definitions
 * Stores detailed iCAP competency framework information
 */
export const competencyFrameworks = mysqlTable("competencyFrameworks", {
  id: int("id").autoincrement().primaryKey(),
  competencyId: int("competencyId").notNull(),
  icapCode: varchar("icapCode", { length: 50 }),
  knowledgeRequirements: text("knowledgeRequirements"),
  skillRequirements: text("skillRequirements"),
  attitudeRequirements: text("attitudeRequirements"),
  level1Description: text("level1Description"),
  level2Description: text("level2Description"),
  level3Description: text("level3Description"),
  level4Description: text("level4Description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompetencyFramework = typeof competencyFrameworks.$inferSelect;
export type InsertCompetencyFramework = typeof competencyFrameworks.$inferInsert;


/**
 * Assessment Results Storage
 * Stores employee competency assessment results for dashboard analytics
 */
export const assessmentResults = mysqlTable("assessmentResults", {
  id: int("id").autoincrement().primaryKey(),
  employeeName: varchar("employeeName", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }).notNull(),
  positionId: int("positionId").notNull(),
  positionName: varchar("positionName", { length: 255 }).notNull(),
  assessmentData: text("assessmentData").notNull(), // JSON string of competency scores
  totalCompetencies: int("totalCompetencies").notNull(),
  acquiredCompetencies: int("acquiredCompetencies").notNull(),
  gapCompetencies: int("gapCompetencies").notNull(),
  completionPercentage: int("completionPercentage").notNull(), // 0-100
  gapPercentage: int("gapPercentage").notNull(), // 0-100
  recommendations: text("recommendations"), // JSON string of training recommendations
  assessmentDate: timestamp("assessmentDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AssessmentResult = typeof assessmentResults.$inferSelect;
export type InsertAssessmentResult = typeof assessmentResults.$inferInsert;
