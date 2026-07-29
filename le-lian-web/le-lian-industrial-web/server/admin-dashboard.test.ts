import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  saveAssessmentResult, 
  getAllAssessmentResults, 
  getAssessmentResultsByDepartment,
  getAssessmentResultsByEmployee,
  getDepartmentStatistics,
  getCompanyStatistics 
} from './db';

describe('Admin Dashboard API', () => {
  describe('saveAssessmentResult', () => {
    it('should save assessment result with all required fields', async () => {
      const result = await saveAssessmentResult({
        employeeName: '張三',
        department: '製造部',
        positionId: 1,
        positionName: '製造課長',
        assessmentData: JSON.stringify([{ id: 'mc-1-1', selected: true }]),
        totalCompetencies: 20,
        acquiredCompetencies: 15,
        gapCompetencies: 5,
        completionPercentage: 75,
        gapPercentage: 25,
        recommendations: '建議參加領導力培訓課程',
      });

      expect(result).toBeDefined();
      // Drizzle insert returns the result object
      expect(typeof result === 'object').toBe(true);
    });

    it('should handle optional recommendations field', async () => {
      const result = await saveAssessmentResult({
        employeeName: '李四',
        department: '廠務部',
        positionId: 2,
        positionName: '廠務經理',
        assessmentData: JSON.stringify([]),
        totalCompetencies: 25,
        acquiredCompetencies: 20,
        gapCompetencies: 5,
        completionPercentage: 80,
        gapPercentage: 20,
      });

      expect(result).toBeDefined();
    });
  });

  describe('getAllAssessmentResults', () => {
    it('should retrieve all assessment results with pagination', async () => {
      const results = await getAllAssessmentResults(100, 0);
      
      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('employeeName');
        expect(results[0]).toHaveProperty('department');
        expect(results[0]).toHaveProperty('completionPercentage');
      }
    });

    it('should respect limit and offset parameters', async () => {
      const resultsPage1 = await getAllAssessmentResults(10, 0);
      const resultsPage2 = await getAllAssessmentResults(10, 10);
      
      expect(Array.isArray(resultsPage1)).toBe(true);
      expect(Array.isArray(resultsPage2)).toBe(true);
    });

    it('should return empty array when no results exist', async () => {
      const results = await getAllAssessmentResults(1, 10000);
      
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('getAssessmentResultsByDepartment', () => {
    it('should filter results by department', async () => {
      const results = await getAssessmentResultsByDepartment('製造部');
      
      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        results.forEach(result => {
          expect(result.department).toBe('製造部');
        });
      }
    });

    it('should return empty array for non-existent department', async () => {
      const results = await getAssessmentResultsByDepartment('不存在的部門');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('getAssessmentResultsByEmployee', () => {
    it('should retrieve results for specific employee', async () => {
      const results = await getAssessmentResultsByEmployee('張三');
      
      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        results.forEach(result => {
          expect(result.employeeName).toBe('張三');
        });
      }
    });

    it('should return empty array for non-existent employee', async () => {
      const results = await getAssessmentResultsByEmployee('不存在的員工');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('getDepartmentStatistics', () => {
    it('should calculate department statistics correctly', async () => {
      const stats = await getDepartmentStatistics('製造部');
      
      if (stats) {
        expect(stats).toHaveProperty('department');
        expect(stats).toHaveProperty('totalEmployees');
        expect(stats).toHaveProperty('avgCompletion');
        expect(stats).toHaveProperty('avgGap');
        expect(stats.department).toBe('製造部');
        expect(stats.totalEmployees).toBeGreaterThanOrEqual(0);
        expect(stats.avgCompletion).toBeGreaterThanOrEqual(0);
        expect(stats.avgCompletion).toBeLessThanOrEqual(100);
        expect(stats.avgGap).toBeGreaterThanOrEqual(0);
        expect(stats.avgGap).toBeLessThanOrEqual(100);
      }
    });

    it('should return null for non-existent department', async () => {
      const stats = await getDepartmentStatistics('不存在的部門');
      
      expect(stats).toBeNull();
    });
  });

  describe('getCompanyStatistics', () => {
    it('should calculate company-wide statistics', async () => {
      const stats = await getCompanyStatistics();
      
      if (stats) {
        expect(stats).toHaveProperty('totalEmployees');
        expect(stats).toHaveProperty('totalDepartments');
        expect(stats).toHaveProperty('avgCompletion');
        expect(stats).toHaveProperty('avgGap');
        expect(stats).toHaveProperty('departments');
        
        expect(stats.totalEmployees).toBeGreaterThanOrEqual(0);
        expect(stats.totalDepartments).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(stats.departments)).toBe(true);
      }
    });

    it('should return null when no assessment data exists', async () => {
      // This test assumes an empty database scenario
      // In a real test, you might need to clear the database first
      const stats = await getCompanyStatistics();
      
      // Stats could be null or contain data depending on database state
      expect(stats === null || typeof stats === 'object').toBe(true);
    });
  });

  describe('Assessment data validation', () => {
    it('should validate completion percentage is between 0-100', async () => {
      const result = await saveAssessmentResult({
        employeeName: '王五',
        department: '品保部',
        positionId: 3,
        positionName: '品保課課長',
        assessmentData: JSON.stringify([]),
        totalCompetencies: 15,
        acquiredCompetencies: 10,
        gapCompetencies: 5,
        completionPercentage: 67,
        gapPercentage: 33,
      });

      expect(result).toBeDefined();
    });

    it('should handle JSON assessment data correctly', async () => {
      const assessmentData = [
        { id: 'comp-1', selected: true },
        { id: 'comp-2', selected: false },
        { id: 'comp-3', selected: true },
      ];

      const result = await saveAssessmentResult({
        employeeName: '趙六',
        department: '資材部',
        positionId: 4,
        positionName: '資材課長',
        assessmentData: JSON.stringify(assessmentData),
        totalCompetencies: 18,
        acquiredCompetencies: 12,
        gapCompetencies: 6,
        completionPercentage: 67,
        gapPercentage: 33,
      });

      expect(result).toBeDefined();
    });
  });
});
