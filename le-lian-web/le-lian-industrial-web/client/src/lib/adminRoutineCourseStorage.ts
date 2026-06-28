// 系統管理「例行課程管理」tab 資料存取，存於 Supabase，所有裝置同步。
// 與 PhysicalTraining.tsx 既有的 routine_courses 資料表為不同功能，分開儲存避免混用。

import { supabase } from './supabaseClient';
import type { AdminRoutineCourseRow } from '../types/database';

export interface AdminRoutineCourse {
  id: string;
  courseName: string;
  instructor: string;
  date: string;
  hours: number;
  department: string;
  participants: string[];
  outline: string;
  status: 'draft' | 'pending_hr' | 'hr_approved' | 'sign_in_sent' | 'completed';
  submittedBy: string;
  submittedAt: string;
  hrComment?: string;
  signedParticipants?: string[];
  surveyCount?: number;
}

function fromRow(row: AdminRoutineCourseRow): AdminRoutineCourse {
  return {
    id: row.id,
    courseName: row.course_name,
    instructor: row.instructor,
    date: row.date,
    hours: row.hours,
    department: row.department,
    participants: row.participants || [],
    outline: row.outline,
    status: row.status,
    submittedBy: row.submitted_by,
    submittedAt: row.submitted_at,
    hrComment: row.hr_comment ?? undefined,
    signedParticipants: row.signed_participants ?? undefined,
    surveyCount: row.survey_count ?? undefined,
  };
}

function toRow(c: AdminRoutineCourse) {
  return {
    id: c.id,
    course_name: c.courseName,
    instructor: c.instructor,
    date: c.date,
    hours: c.hours,
    department: c.department,
    participants: c.participants,
    outline: c.outline,
    status: c.status,
    submitted_by: c.submittedBy,
    submitted_at: c.submittedAt,
    hr_comment: c.hrComment ?? null,
    signed_participants: c.signedParticipants ?? null,
    survey_count: c.surveyCount ?? null,
  };
}

export async function loadAdminRoutineCourses(): Promise<AdminRoutineCourse[]> {
  const { data, error } = await supabase.from('admin_routine_courses').select('*').order('submitted_at', { ascending: false });
  if (error || !data) return [];
  return (data as AdminRoutineCourseRow[]).map(fromRow);
}

export async function saveAdminRoutineCourses(list: AdminRoutineCourse[]): Promise<void> {
  const ids = list.map((c) => c.id);
  const { data: existing } = await supabase.from('admin_routine_courses').select('id');
  const toDelete = (existing || []).map((e) => e.id as string).filter((id) => !ids.includes(id));
  if (toDelete.length) {
    await supabase.from('admin_routine_courses').delete().in('id', toDelete);
  }
  if (list.length) {
    await supabase.from('admin_routine_courses').upsert(list.map(toRow));
  }
}
