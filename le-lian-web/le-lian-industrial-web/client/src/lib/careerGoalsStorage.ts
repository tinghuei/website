// 職涯目標設定（CareerPlanning）資料存取，存於 Supabase，所有裝置同步。

import { supabase } from './supabaseClient';
import type { CareerGoalRow } from '../types/database';

export interface CareerGoalRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  targetPosition: string;
  targetDate: string;
  motivation: string;
  status: 'proposed' | 'approved' | 'rejected' | 'revised';
  managerComment: string;
  managerId: string;
  managerName: string;
  proposedAt: string;
  reviewedAt?: string;
}

function mapRow(row: CareerGoalRow): CareerGoalRecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    targetPosition: row.target_position,
    targetDate: row.target_date,
    motivation: row.motivation,
    status: row.status,
    managerComment: row.manager_comment,
    managerId: row.manager_id || '',
    managerName: row.manager_name || '',
    proposedAt: row.proposed_at,
    reviewedAt: row.reviewed_at || undefined,
  };
}

function goalToRow(g: CareerGoalRecord) {
  return {
    id: g.id,
    employee_id: g.employeeId,
    employee_name: g.employeeName,
    target_position: g.targetPosition,
    target_date: g.targetDate,
    motivation: g.motivation,
    status: g.status,
    manager_comment: g.managerComment,
    manager_id: g.managerId || null,
    manager_name: g.managerName || null,
    proposed_at: g.proposedAt,
    reviewed_at: g.reviewedAt || null,
  };
}

export async function loadCareerGoals(): Promise<CareerGoalRecord[]> {
  const { data, error } = await supabase.from('career_goals').select('*').order('proposed_at');
  if (error || !data) return [];
  return (data as CareerGoalRow[]).map(mapRow);
}

/** 員工新增自己的職涯目標提案。 */
export async function proposeCareerGoal(goal: CareerGoalRecord): Promise<void> {
  const { error } = await supabase.from('career_goals').insert(goalToRow(goal));
  if (error) throw error;
}

/** 主管審核（核准／退回／需修改）既有提案。 */
export async function reviewCareerGoal(goal: CareerGoalRecord): Promise<void> {
  const { error } = await supabase.from('career_goals').update(goalToRow(goal)).eq('id', goal.id);
  if (error) throw error;
}
