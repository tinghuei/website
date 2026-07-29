// 員工職能自評紀錄，存於 Supabase，供跨職位職能缺口分析彙整使用。

import { supabase } from './supabaseClient';
import type { CompetencySelfAssessmentRow } from '../types/database';

export interface CompetencySelfAssessment {
  userId: string;
  employeeName: string;
  department: string;
  positionName: string;
  selfScores: Record<string, number>;
  managerScores: Record<string, number>;
  submittedAt: string;
  managerSubmittedAt?: string | null;
  managerId?: string | null;
  managerName?: string | null;
}

function mapRow(row: CompetencySelfAssessmentRow): CompetencySelfAssessment {
  return {
    userId: row.user_id,
    employeeName: row.employee_name,
    department: row.department || '',
    positionName: row.position_name,
    selfScores: row.self_scores || {},
    managerScores: row.manager_scores || {},
    submittedAt: row.submitted_at,
    managerSubmittedAt: row.manager_submitted_at,
    managerId: row.manager_id,
    managerName: row.manager_name,
  };
}

function employeeRowFields(a: CompetencySelfAssessment) {
  return {
    user_id: a.userId,
    employee_name: a.employeeName,
    department: a.department || null,
    position_name: a.positionName,
    self_scores: a.selfScores,
    submitted_at: a.submittedAt,
  };
}

export async function loadSelfAssessments(): Promise<CompetencySelfAssessment[]> {
  const { data, error } = await supabase.from('competency_self_assessments').select('*');
  if (error || !data) return [];
  return (data as CompetencySelfAssessmentRow[]).map(mapRow);
}

/** 員工送出（或更新）自己的職能自評紀錄；不覆寫主管評估欄位。 */
export async function saveSelfAssessment(assessment: CompetencySelfAssessment): Promise<void> {
  const { error } = await supabase
    .from('competency_self_assessments')
    .upsert(employeeRowFields(assessment), { onConflict: 'user_id' });
  if (error) throw error;
}

/** 主管填寫並送出指定員工的職能評估分數。 */
export async function saveManagerAssessment(
  employeeUserId: string,
  managerScores: Record<string, number>,
  managerId: string,
  managerName: string,
): Promise<void> {
  const { error } = await supabase
    .from('competency_self_assessments')
    .update({
      manager_scores: managerScores,
      manager_submitted_at: new Date().toISOString(),
      manager_id: managerId,
      manager_name: managerName,
    })
    .eq('user_id', employeeUserId);
  if (error) throw error;
}
