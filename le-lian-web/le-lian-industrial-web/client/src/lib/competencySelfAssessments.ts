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
  };
}

function assessmentToRow(a: CompetencySelfAssessment) {
  return {
    user_id: a.userId,
    employee_name: a.employeeName,
    department: a.department || null,
    position_name: a.positionName,
    self_scores: a.selfScores,
    manager_scores: a.managerScores,
    submitted_at: a.submittedAt,
  };
}

export async function loadSelfAssessments(): Promise<CompetencySelfAssessment[]> {
  const { data, error } = await supabase.from('competency_self_assessments').select('*');
  if (error || !data) return [];
  return (data as CompetencySelfAssessmentRow[]).map(mapRow);
}

/** 員工送出（或更新）自己的職能自評紀錄，以最新資料覆寫。 */
export async function saveSelfAssessment(assessment: CompetencySelfAssessment): Promise<void> {
  const { error } = await supabase
    .from('competency_self_assessments')
    .upsert(assessmentToRow(assessment), { onConflict: 'user_id' });
  if (error) throw error;
}
