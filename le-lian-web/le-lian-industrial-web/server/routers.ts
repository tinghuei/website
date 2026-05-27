import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createContactSubmission, getContactSubmissions, updateContactSubmissionStatus, createJobPosition, getJobPositions, createCompetency, getCompetencies, addPositionCompetency, getPositionCompetencies, addEmployeeCompetency, getEmployeeCompetencies, createGapAnalysis, getGapAnalysisResults, calculateGapAnalysis, createSelfAssessment, getSelfAssessmentsByEmployee, getSelfAssessmentDetail, addSelfAssessmentDetail, updateSelfAssessmentStatus, addCompetencyFramework, getCompetencyFramework, calculateGapWithSelfAssessment, saveAssessmentResult, getAllAssessmentResults, getAssessmentResultsByDepartment, getAssessmentResultsByPosition, getAssessmentResultsByEmployee, getDepartmentStatistics, getCompanyStatistics } from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          email: z.string().email(),
          phone: z.string().optional(),
          company: z.string().optional(),
          message: z.string().min(1).max(5000),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await createContactSubmission({
            name: input.name,
            email: input.email,
            phone: input.phone || null,
            company: input.company || null,
            message: input.message,
            status: "new",
          });

          await notifyOwner({
            title: "新的聯絡表單提交",
            content: `來自 ${input.name} (${input.email}) 的新訊息: ${input.message}`,
          });

          return { success: true };
        } catch (error) {
          console.error("Failed to submit contact form:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit contact form",
          });
        }
      }),

    getSubmissions: publicProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return await getContactSubmissions(input.limit || 50, input.offset || 0);
      }),

    updateStatus: publicProcedure
      .input(z.object({ id: z.number(), status: z.enum(["new", "read", "replied", "archived"]) }))
      .mutation(async ({ input }) => {
        return await updateContactSubmissionStatus(input.id, input.status);
      }),
  }),

  competency: router({
    getPositions: publicProcedure.query(async () => {
      return await getJobPositions();
    }),

    getPositionCompetencies: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await getPositionCompetencies(input);
      }),

    getAllCompetencies: publicProcedure.query(async () => {
      return await getCompetencies();
    }),
  }),

  init: router({
    seedData: publicProcedure.mutation(async () => {
      const { initializeData } = await import("./initializeData");
      const success = await initializeData();
      return { success, message: success ? "數據初始化成功" : "數據初始化失敗" };
    }),
  }),

  selfAssessment: router({
    create: publicProcedure
      .input(z.object({ employeeId: z.number(), employeeName: z.string(), positionId: z.number(), notes: z.string().optional() }))
      .mutation(async ({ input }) => {
        const result = await createSelfAssessment({
          employeeId: input.employeeId,
          employeeName: input.employeeName,
          positionId: input.positionId,
          notes: input.notes || null,
          status: "draft",
        });
        return result;
      }),

    getByEmployee: publicProcedure
      .input(z.object({ employeeName: z.string() }))
      .query(async ({ input }) => {
        return await getSelfAssessmentsByEmployee(input.employeeName);
      }),

    getDetails: publicProcedure
      .input(z.object({ assessmentId: z.number() }))
      .query(async ({ input }) => {
        return await getSelfAssessmentDetail(input.assessmentId);
      }),

    addDetail: publicProcedure
      .input(z.object({ assessmentId: z.number(), competencyId: z.number(), selfRatedLevel: z.number(), evidenceDescription: z.string().optional() }))
      .mutation(async ({ input }) => {
        return await addSelfAssessmentDetail({
          assessmentId: input.assessmentId,
          competencyId: input.competencyId,
          selfRatedLevel: input.selfRatedLevel,
          evidenceDescription: input.evidenceDescription || null,
        });
      }),

    submit: publicProcedure
      .input(z.object({ assessmentId: z.number() }))
      .mutation(async ({ input }) => {
        return await updateSelfAssessmentStatus(input.assessmentId, "submitted");
      }),

    calculateGap: publicProcedure
      .input(z.object({ employeeName: z.string(), positionId: z.number(), assessmentId: z.number() }))
      .query(async ({ input }) => {
        return await calculateGapWithSelfAssessment(input.employeeName, input.positionId, input.assessmentId);
      }),
  }),

  adminDashboard: router({
    saveAssessment: publicProcedure
      .input(z.object({
        employeeName: z.string(),
        department: z.string(),
        positionId: z.number(),
        positionName: z.string(),
        assessmentData: z.string(),
        totalCompetencies: z.number(),
        acquiredCompetencies: z.number(),
        gapCompetencies: z.number(),
        completionPercentage: z.number(),
        gapPercentage: z.number(),
        recommendations: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await saveAssessmentResult({
          employeeName: input.employeeName,
          department: input.department,
          positionId: input.positionId,
          positionName: input.positionName,
          assessmentData: input.assessmentData,
          totalCompetencies: input.totalCompetencies,
          acquiredCompetencies: input.acquiredCompetencies,
          gapCompetencies: input.gapCompetencies,
          completionPercentage: input.completionPercentage,
          gapPercentage: input.gapPercentage,
          recommendations: input.recommendations || null,
        });
      }),

    getAllResults: publicProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return await getAllAssessmentResults(input.limit || 100, input.offset || 0);
      }),

    getByDepartment: publicProcedure
      .input(z.object({ department: z.string() }))
      .query(async ({ input }) => {
        return await getAssessmentResultsByDepartment(input.department);
      }),

    getByPosition: publicProcedure
      .input(z.object({ positionId: z.number() }))
      .query(async ({ input }) => {
        return await getAssessmentResultsByPosition(input.positionId);
      }),

    getByEmployee: publicProcedure
      .input(z.object({ employeeName: z.string() }))
      .query(async ({ input }) => {
        return await getAssessmentResultsByEmployee(input.employeeName);
      }),

    getDepartmentStats: publicProcedure
      .input(z.object({ department: z.string() }))
      .query(async ({ input }) => {
        return await getDepartmentStatistics(input.department);
      }),

    getCompanyStats: publicProcedure.query(async () => {
      return await getCompanyStatistics();
    }),
  }),
});

export type AppRouter = typeof appRouter;
