// 績效追蹤（PerformanceTracking.tsx）L3 行為應用追蹤／L4 課程成效評估資料存取，存於 Supabase，所有裝置同步。

import { supabase } from './supabaseClient';
import type { PerfL3RecordRow, PerfL4CampaignRow } from '../types/database';

export interface L3Attachment {
  id: string;
  name: string;
  dataUrl: string;
}

export interface L3ApprovalStep {
  by: string;
  at: string;
  decision: 'approved' | 'rejected';
  comment?: string;
}

export interface L3Confirmation {
  id: string;
  enrollmentId: string;
  userId: string;
  courseId: string;
  courseName: string;
  userName: string;
  quarter: string;
  applicationContent: string;
  confirmedAt: string | null;
  status: 'not_due' | 'pending' | 'submitted_manager' | 'submitted_depthead' | 'confirmed' | 'rejected' | 'overdue';
  kpiNote: string;
  dueDate?: string;
  attachments?: L3Attachment[];
  submittedAt?: string;
  managerApproval?: L3ApprovalStep;
  deptHeadApproval?: L3ApprovalStep;
}

export interface L4QuarterEntry {
  quarter: string;
  actualValue: number;
  note?: string;
  reportedBy: string;
  reportedAt: string;
}

export interface L4Campaign {
  id: string;
  courseId: string;
  courseName: string;
  department: string;
  kpiType: string;
  unit: string;
  baselineValue: number;
  targetValue: number;
  higherIsBetter: boolean;
  entries: L4QuarterEntry[];
  createdBy: string;
  createdAt: string;
}

function l3FromRow(row: PerfL3RecordRow): L3Confirmation {
  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    userId: row.user_id,
    courseId: row.course_id,
    courseName: row.course_name,
    userName: row.user_name,
    quarter: row.quarter,
    applicationContent: row.application_content,
    confirmedAt: row.confirmed_at,
    status: row.status as L3Confirmation['status'],
    kpiNote: row.kpi_note,
    dueDate: row.due_date ?? undefined,
    attachments: row.attachments ?? undefined,
    submittedAt: row.submitted_at ?? undefined,
    managerApproval: row.manager_approval ?? undefined,
    deptHeadApproval: row.dept_head_approval ?? undefined,
  };
}

function l3ToRow(r: L3Confirmation) {
  return {
    id: r.id,
    enrollment_id: r.enrollmentId,
    user_id: r.userId,
    course_id: r.courseId,
    course_name: r.courseName,
    user_name: r.userName,
    quarter: r.quarter,
    application_content: r.applicationContent,
    confirmed_at: r.confirmedAt,
    status: r.status,
    kpi_note: r.kpiNote,
    due_date: r.dueDate ?? null,
    attachments: r.attachments ?? null,
    submitted_at: r.submittedAt ?? null,
    manager_approval: r.managerApproval ?? null,
    dept_head_approval: r.deptHeadApproval ?? null,
  };
}

export async function loadL3Records(): Promise<L3Confirmation[]> {
  const { data, error } = await supabase.from('perf_l3_records').select('*').order('id');
  if (error || !data) return [];
  return (data as PerfL3RecordRow[]).map(l3FromRow);
}

export async function saveL3Records(list: L3Confirmation[]): Promise<void> {
  const ids = list.map((r) => r.id);
  const { data: existing } = await supabase.from('perf_l3_records').select('id');
  const toDelete = (existing || []).map((e) => e.id as string).filter((id) => !ids.includes(id));
  if (toDelete.length) {
    await supabase.from('perf_l3_records').delete().in('id', toDelete);
  }
  if (list.length) {
    await supabase.from('perf_l3_records').upsert(list.map(l3ToRow));
  }
}

function l4FromRow(row: PerfL4CampaignRow): L4Campaign {
  return {
    id: row.id,
    courseId: row.course_id,
    courseName: row.course_name,
    department: row.department,
    kpiType: row.kpi_type,
    unit: row.unit,
    baselineValue: row.baseline_value,
    targetValue: row.target_value,
    higherIsBetter: row.higher_is_better,
    entries: row.entries,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function l4ToRow(c: L4Campaign) {
  return {
    id: c.id,
    course_id: c.courseId,
    course_name: c.courseName,
    department: c.department,
    kpi_type: c.kpiType,
    unit: c.unit,
    baseline_value: c.baselineValue,
    target_value: c.targetValue,
    higher_is_better: c.higherIsBetter,
    entries: c.entries,
    created_by: c.createdBy,
    created_at: c.createdAt,
  };
}

export async function loadL4Campaigns(): Promise<L4Campaign[]> {
  const { data, error } = await supabase.from('perf_l4_campaigns').select('*').order('id');
  if (error || !data) return [];
  return (data as PerfL4CampaignRow[]).map(l4FromRow);
}

export async function saveL4Campaigns(list: L4Campaign[]): Promise<void> {
  const ids = list.map((c) => c.id);
  const { data: existing } = await supabase.from('perf_l4_campaigns').select('id');
  const toDelete = (existing || []).map((e) => e.id as string).filter((id) => !ids.includes(id));
  if (toDelete.length) {
    await supabase.from('perf_l4_campaigns').delete().in('id', toDelete);
  }
  if (list.length) {
    await supabase.from('perf_l4_campaigns').upsert(list.map(l4ToRow));
  }
}
