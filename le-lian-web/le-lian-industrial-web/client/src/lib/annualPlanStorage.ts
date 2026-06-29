// 年度訓練計畫「歷年成效查詢」送審簽核、CF-CM-HR-39 差異分析表資料存取，存於 Supabase，所有裝置同步。

import { supabase } from './supabaseClient';
import type {
  AnnualSignoffRow, VarianceEntryRow, VarianceSignoffRow,
  AnnualPlanRowRow, AnnualPlanCourseTrackRow, PlanSubmissionRow,
} from '../types/database';

export interface AnnualSignoff {
  hrSubmittedAt: string | null;
  vpApproved: boolean;
  vpApprovedAt: string | null;
  vpComment: string;
  gmApproved: boolean;
  gmApprovedAt: string | null;
  gmComment: string;
}

export const EMPTY_SIGNOFF: AnnualSignoff = {
  hrSubmittedAt: null, vpApproved: false, vpApprovedAt: null, vpComment: '',
  gmApproved: false, gmApprovedAt: null, gmComment: '',
};

function mapSignoffRow(row: AnnualSignoffRow): AnnualSignoff {
  return {
    hrSubmittedAt: row.hr_submitted_at,
    vpApproved: row.vp_approved,
    vpApprovedAt: row.vp_approved_at,
    vpComment: row.vp_comment,
    gmApproved: row.gm_approved,
    gmApprovedAt: row.gm_approved_at,
    gmComment: row.gm_comment,
  };
}

export async function loadAnnualSignoffs(): Promise<Record<string, AnnualSignoff>> {
  const { data, error } = await supabase.from('annual_signoffs').select('*');
  if (error || !data) return {};
  const result: Record<string, AnnualSignoff> = {};
  (data as AnnualSignoffRow[]).forEach((row) => {
    result[row.year] = mapSignoffRow(row);
  });
  return result;
}

export async function saveAnnualSignoff(year: string, signoff: AnnualSignoff): Promise<void> {
  await supabase.from('annual_signoffs').upsert({
    year,
    hr_submitted_at: signoff.hrSubmittedAt,
    vp_approved: signoff.vpApproved,
    vp_approved_at: signoff.vpApprovedAt,
    vp_comment: signoff.vpComment,
    gm_approved: signoff.gmApproved,
    gm_approved_at: signoff.gmApprovedAt,
    gm_comment: signoff.gmComment,
  });
}

// ── CF-CM-HR-39 教育訓練計畫與實際差異分析表 ──────────────────────────────────
export interface VarianceEntry {
  id: number;
  year: string;
  department: string;
  category: string;
  courseName: string;
  plannedHours: number;
  actualHours: number;
  plannedCount: number;
  actualCount: number;
  plannedMonth: string;
  actualMonth: string;
  attendanceRate: number;
  judgment: string;
  actualDate: string;
  instructor: string;
  varianceMethod: boolean;
  varianceHours: boolean;
  varianceCount: boolean;
  varianceNotHeld: boolean;
  varianceOther: boolean;
  varianceOtherNote: string;
  plannedCost: number;
  actualCost: number;
  diffReason: string;
  improvement: string;
}

function mapVarianceRow(row: VarianceEntryRow): VarianceEntry {
  return {
    id: row.id,
    year: row.year,
    department: row.department,
    category: row.category,
    courseName: row.course_name,
    plannedHours: row.planned_hours,
    actualHours: row.actual_hours,
    plannedCount: row.planned_count,
    actualCount: row.actual_count,
    plannedMonth: row.planned_month || '',
    actualMonth: row.actual_month || '',
    attendanceRate: row.attendance_rate,
    judgment: row.judgment,
    actualDate: row.actual_date || '',
    instructor: row.instructor || '',
    varianceMethod: row.variance_method,
    varianceHours: row.variance_hours,
    varianceCount: row.variance_count,
    varianceNotHeld: row.variance_not_held,
    varianceOther: row.variance_other,
    varianceOtherNote: row.variance_other_note,
    plannedCost: row.planned_cost,
    actualCost: row.actual_cost,
    diffReason: row.diff_reason,
    improvement: row.improvement,
  };
}

function varianceToRow(e: VarianceEntry) {
  return {
    id: e.id,
    year: e.year,
    department: e.department,
    category: e.category,
    course_name: e.courseName,
    planned_hours: e.plannedHours,
    actual_hours: e.actualHours,
    planned_count: e.plannedCount,
    actual_count: e.actualCount,
    planned_month: e.plannedMonth || null,
    actual_month: e.actualMonth || null,
    attendance_rate: e.attendanceRate,
    judgment: e.judgment,
    actual_date: e.actualDate || null,
    instructor: e.instructor || null,
    variance_method: e.varianceMethod,
    variance_hours: e.varianceHours,
    variance_count: e.varianceCount,
    variance_not_held: e.varianceNotHeld,
    variance_other: e.varianceOther,
    variance_other_note: e.varianceOtherNote,
    planned_cost: e.plannedCost,
    actual_cost: e.actualCost,
    diff_reason: e.diffReason,
    improvement: e.improvement,
  };
}

export async function loadVarianceEntries(): Promise<VarianceEntry[]> {
  const { data, error } = await supabase.from('variance_entries').select('*').order('id');
  if (error || !data) return [];
  return (data as VarianceEntryRow[]).map(mapVarianceRow);
}

export async function saveVarianceEntries(list: VarianceEntry[]): Promise<void> {
  const ids = list.map((e) => e.id);
  const { data: existing } = await supabase.from('variance_entries').select('id');
  const toDelete = (existing || []).map((e) => e.id as number).filter((id) => !ids.includes(id));
  if (toDelete.length) {
    await supabase.from('variance_entries').delete().in('id', toDelete);
  }
  if (list.length) {
    await supabase.from('variance_entries').upsert(list.map(varianceToRow));
  }
}

export interface VarianceSignoff {
  gmName: string;
  gmDate: string;
  adminName: string;
  adminDate: string;
  applicantUnit: string;
}

export const EMPTY_VARIANCE_SIGNOFF: VarianceSignoff = { gmName: '', gmDate: '', adminName: '', adminDate: '', applicantUnit: '' };

export async function loadVarianceSignoff(): Promise<VarianceSignoff> {
  const { data, error } = await supabase.from('variance_signoffs').select('*').eq('id', true).maybeSingle();
  if (error || !data) return { ...EMPTY_VARIANCE_SIGNOFF };
  const row = data as VarianceSignoffRow;
  return {
    gmName: row.gm_name,
    gmDate: row.gm_date,
    adminName: row.admin_name,
    adminDate: row.admin_date,
    applicantUnit: row.applicant_unit,
  };
}

export async function saveVarianceSignoff(signoff: VarianceSignoff): Promise<void> {
  await supabase.from('variance_signoffs').upsert({
    id: true,
    gm_name: signoff.gmName,
    gm_date: signoff.gmDate,
    admin_name: signoff.adminName,
    admin_date: signoff.adminDate,
    applicant_unit: signoff.applicantUnit,
  });
}

// ── 年度訓練計畫制定：課程清單 ──────────────────────────────────────────────
export interface PlanRow {
  id: number;
  name: string;
  cat: string;
  type: string;
  target: string;
  hours: number;
  month: string;
  count: number;
  note: string;
}

function mapPlanRow(row: AnnualPlanRowRow): PlanRow {
  return {
    id: row.id,
    name: row.name,
    cat: row.cat,
    type: row.type,
    target: row.target,
    hours: row.hours,
    month: row.month,
    count: row.count,
    note: row.note,
  };
}

function planRowToRow(r: PlanRow) {
  return {
    id: r.id,
    name: r.name,
    cat: r.cat,
    type: r.type,
    target: r.target,
    hours: r.hours,
    month: r.month,
    count: r.count,
    note: r.note,
  };
}

export async function loadAnnualPlanRows(): Promise<PlanRow[]> {
  const { data, error } = await supabase.from('annual_plan_rows').select('*').order('id');
  if (error || !data) return [];
  return (data as AnnualPlanRowRow[]).map(mapPlanRow);
}

export async function saveAnnualPlanRows(list: PlanRow[]): Promise<void> {
  const ids = list.map((r) => r.id);
  const { data: existing } = await supabase.from('annual_plan_rows').select('id');
  const toDelete = (existing || []).map((r) => r.id as number).filter((id) => !ids.includes(id));
  if (toDelete.length) {
    await supabase.from('annual_plan_rows').delete().in('id', toDelete);
  }
  if (list.length) {
    await supabase.from('annual_plan_rows').upsert(list.map(planRowToRow));
  }
}

// ── 年度訓練計畫制定：提交審核狀態（依年度／部門） ──────────────────────────
export interface PlanSubmission {
  status: '草稿' | '提交' | '核准';
  submittedAt: string | null;
  signOff: Record<string, { name: string; date: string; comment?: string }>;
  designatedSigners: Record<string, string>;
}

export const EMPTY_PLAN_SUBMISSION: PlanSubmission = {
  status: '草稿', submittedAt: null, signOff: {}, designatedSigners: {},
};

export async function loadPlanSubmission(year: string, department: string): Promise<PlanSubmission> {
  const { data, error } = await supabase
    .from('plan_submissions')
    .select('*')
    .eq('year', year)
    .eq('department', department)
    .maybeSingle();
  if (error || !data) return { ...EMPTY_PLAN_SUBMISSION };
  const row = data as PlanSubmissionRow;
  return {
    status: row.status,
    submittedAt: row.submitted_at,
    signOff: row.sign_off || {},
    designatedSigners: row.designated_signers || {},
  };
}

export async function savePlanSubmission(year: string, department: string, submission: PlanSubmission): Promise<void> {
  const { error } = await supabase.from('plan_submissions').upsert({
    year,
    department,
    status: submission.status,
    submitted_at: submission.submittedAt,
    sign_off: submission.signOff,
    designated_signers: submission.designatedSigners,
  });
  if (error) throw error;
}

// ── 年度訓練計畫「課程執行追蹤」(TTQS執行追蹤) ─────────────────────────────
export interface CourseTrackItem {
  name: string;
  planned: number;
  actual: number;
  rate: number;
  participants: number;
  status: string;
}

function mapCourseTrackRow(row: AnnualPlanCourseTrackRow): CourseTrackItem {
  return {
    name: row.name,
    planned: row.planned,
    actual: row.actual,
    rate: row.rate,
    participants: row.participants,
    status: row.status,
  };
}

export async function loadCourseTrack(): Promise<CourseTrackItem[]> {
  const { data, error } = await supabase.from('annual_plan_course_track').select('*');
  if (error || !data) return [];
  return (data as AnnualPlanCourseTrackRow[]).map(mapCourseTrackRow);
}

export async function saveCourseTrack(list: CourseTrackItem[]): Promise<void> {
  const names = list.map((r) => r.name);
  const { data: existing } = await supabase.from('annual_plan_course_track').select('name');
  const toDelete = (existing || []).map((r) => r.name as string).filter((name) => !names.includes(name));
  if (toDelete.length) {
    await supabase.from('annual_plan_course_track').delete().in('name', toDelete);
  }
  if (list.length) {
    await supabase.from('annual_plan_course_track').upsert(list);
  }
}
