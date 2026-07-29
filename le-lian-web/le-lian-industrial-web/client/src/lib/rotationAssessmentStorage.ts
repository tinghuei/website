// 部門輪調適合度評估（CareerPlanning.tsx 部門輪調評估區塊）資料存取，存於 Supabase，所有裝置同步。

import { supabase } from './supabaseClient';
import type { RotationAssessmentRow } from '../types/database';

export interface RotationAssessmentRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  targetDept: string;
  answers: Record<number, number>;
  score: number;
  recommendation: string;
  level: 'excellent' | 'good' | 'warn' | 'no';
  courses: string[];
  submittedAt: string;
  sentToManager: boolean;
  sentAt?: string;
  managerComment: string;
}

function mapRow(row: RotationAssessmentRow): RotationAssessmentRecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    targetDept: row.target_dept,
    answers: row.answers,
    score: row.score,
    recommendation: row.recommendation,
    level: row.level,
    courses: row.courses,
    submittedAt: row.submitted_at,
    sentToManager: row.sent_to_manager,
    sentAt: row.sent_at || undefined,
    managerComment: row.manager_comment,
  };
}

function recordToRow(r: RotationAssessmentRecord) {
  return {
    id: r.id,
    employee_id: r.employeeId,
    employee_name: r.employeeName,
    target_dept: r.targetDept,
    answers: r.answers,
    score: r.score,
    recommendation: r.recommendation,
    level: r.level,
    courses: r.courses,
    submitted_at: r.submittedAt,
    sent_to_manager: r.sentToManager,
    sent_at: r.sentAt || null,
    manager_comment: r.managerComment,
  };
}

/** 載入指定員工的歷次部門輪調評估紀錄（最新在前）。 */
export async function loadRotationAssessments(employeeId: string): Promise<RotationAssessmentRecord[]> {
  const { data, error } = await supabase
    .from('rotation_assessments')
    .select('*')
    .eq('employee_id', employeeId)
    .order('submitted_at', { ascending: false });
  if (error || !data) return [];
  return (data as RotationAssessmentRow[]).map(mapRow);
}

/** 員工提交一次部門輪調適合度評估結果。 */
export async function saveRotationAssessment(record: RotationAssessmentRecord): Promise<void> {
  const { error } = await supabase.from('rotation_assessments').insert(recordToRow(record));
  if (error) throw error;
}

/** 將評估結果送交主管查看。 */
export async function sendRotationAssessmentToManager(id: string, sentAt: string): Promise<void> {
  const { error } = await supabase
    .from('rotation_assessments')
    .update({ sent_to_manager: true, sent_at: sentAt })
    .eq('id', id);
  if (error) throw error;
}
