// 員工工作說明書紀錄（localStorage 持久化）
// 以員工姓名為鍵，儲存每位員工上傳之工作說明書辨識結果與對應的職能評分標準。
// 管理員／人資可在「職能落差分析」頁面的「員工職能說明書檔案庫」檢視所有記錄。

import type { CompetencyCategory } from '../data/competencyFramework';

export interface EmployeeJDRecord {
  employeeName: string;
  userId: string;
  positionName: string;
  department: string;
  jobSummary: string;
  professionalSkills: string[];
  trainingNeeds: string[];
  competencies: CompetencyCategory[];
  standards: Record<string, number>;
  sourceFileName: string;
  uploadedAt: string;
}

const LS_KEY = 'employee_job_descriptions_v1';

export function loadEmployeeJDs(): Record<string, EmployeeJDRecord> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveEmployeeJDs(data: Record<string, EmployeeJDRecord>): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {}
}
