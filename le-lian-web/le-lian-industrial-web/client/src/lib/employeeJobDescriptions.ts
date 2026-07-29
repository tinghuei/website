// 員工工作說明書紀錄（Supabase 持久化）
// 以員工姓名為鍵，儲存每位員工上傳之工作說明書辨識結果與對應的職能評分標準。
// 管理員／人資／主管可在「職能落差分析」頁面的「員工職能說明書檔案庫」檢視所有記錄。

import { supabase } from './supabaseClient';
import type { CompetencyCategory } from '../data/competencyFramework';
import type { EmployeeJobDescriptionRow } from '../types/database';

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

function mapRow(row: EmployeeJobDescriptionRow): EmployeeJDRecord {
  return {
    employeeName: row.employee_name,
    userId: row.user_id || '',
    positionName: row.position_name || '',
    department: row.department || '',
    jobSummary: row.job_summary || '',
    professionalSkills: row.professional_skills || [],
    trainingNeeds: row.training_needs || [],
    competencies: (row.competencies as CompetencyCategory[]) || [],
    standards: row.standards || {},
    sourceFileName: row.source_file_name || '',
    uploadedAt: row.uploaded_at,
  };
}

function recordToRow(r: EmployeeJDRecord) {
  return {
    employee_name: r.employeeName,
    user_id: r.userId || null,
    position_name: r.positionName,
    department: r.department,
    job_summary: r.jobSummary,
    professional_skills: r.professionalSkills,
    training_needs: r.trainingNeeds,
    competencies: r.competencies,
    standards: r.standards,
    source_file_name: r.sourceFileName,
    uploaded_at: r.uploadedAt,
  };
}

export async function loadEmployeeJDs(): Promise<Record<string, EmployeeJDRecord>> {
  const { data, error } = await supabase.from('employee_job_descriptions').select('*');
  if (error || !data) return {};
  const result: Record<string, EmployeeJDRecord> = {};
  (data as EmployeeJobDescriptionRow[]).forEach((row) => {
    result[row.employee_name] = mapRow(row);
  });
  return result;
}

export async function saveEmployeeJDs(data: Record<string, EmployeeJDRecord>): Promise<void> {
  const names = Object.keys(data);
  const { data: existing } = await supabase.from('employee_job_descriptions').select('employee_name');
  const toDelete = (existing || [])
    .map((e) => e.employee_name as string)
    .filter((name) => !names.includes(name));
  if (toDelete.length) {
    await supabase.from('employee_job_descriptions').delete().in('employee_name', toDelete);
  }
  if (names.length) {
    await supabase
      .from('employee_job_descriptions')
      .upsert(names.map((name) => recordToRow(data[name])), { onConflict: 'employee_name' });
  }
}
