// 講師名冊 / 學員名冊資料存取，存於 Supabase，所有裝置同步。

import { supabase } from './supabaseClient';
import type { InstructorRow, StudentRow } from '../types/database';

export interface Instructor {
  id: string;
  name: string;
  type: '內部' | '外部';
  title: string;
  department: string;
  specialty: string;
  phone: string;
  email: string;
  certifications: string;
  totalCourses: number;
}

export interface Student {
  id: string;
  name: string;
  birthday: string;
  department: string;
  title: string;
  employeeId: string;
  joinDate: string;
  email: string;
}

function mapInstructorRow(row: InstructorRow): Instructor {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    title: row.title || '',
    department: row.department || '',
    specialty: row.specialty || '',
    phone: row.phone || '',
    email: row.email || '',
    certifications: row.certifications || '',
    totalCourses: row.total_courses || 0,
  };
}

function instructorToRow(i: Instructor) {
  return {
    id: i.id,
    name: i.name,
    type: i.type,
    title: i.title,
    department: i.department,
    specialty: i.specialty,
    phone: i.phone,
    email: i.email,
    certifications: i.certifications,
    total_courses: i.totalCourses,
  };
}

function mapStudentRow(row: StudentRow): Student {
  return {
    id: row.id,
    name: row.name,
    birthday: row.birthday || '',
    department: row.department || '',
    title: row.title || '',
    employeeId: row.employee_id || '',
    joinDate: row.join_date || '',
    email: row.email || '',
  };
}

function studentToRow(s: Student) {
  return {
    id: s.id,
    name: s.name,
    birthday: s.birthday,
    department: s.department,
    title: s.title,
    employee_id: s.employeeId,
    join_date: s.joinDate,
    email: s.email,
  };
}

export async function loadInstructors(): Promise<Instructor[]> {
  const { data, error } = await supabase.from('instructors').select('*').order('id');
  if (error || !data) return [];
  return (data as InstructorRow[]).map(mapInstructorRow);
}

export async function saveInstructors(list: Instructor[]): Promise<void> {
  const ids = list.map((i) => i.id);
  const { data: existing } = await supabase.from('instructors').select('id');
  const toDelete = (existing || []).map((e) => e.id as string).filter((id) => !ids.includes(id));
  if (toDelete.length) {
    await supabase.from('instructors').delete().in('id', toDelete);
  }
  if (list.length) {
    await supabase.from('instructors').upsert(list.map(instructorToRow));
  }
}

export async function loadStudents(): Promise<Student[]> {
  const { data, error } = await supabase.from('students').select('*').order('id');
  if (error || !data) return [];
  return (data as StudentRow[]).map(mapStudentRow);
}

export async function saveStudents(list: Student[]): Promise<void> {
  const ids = list.map((s) => s.id);
  const { data: existing } = await supabase.from('students').select('id');
  const toDelete = (existing || []).map((e) => e.id as string).filter((id) => !ids.includes(id));
  if (toDelete.length) {
    await supabase.from('students').delete().in('id', toDelete);
  }
  if (list.length) {
    await supabase.from('students').upsert(list.map(studentToRow));
  }
}
