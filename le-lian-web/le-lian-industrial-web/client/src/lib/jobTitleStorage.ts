// 職稱類別資料存取（管理員／人資可於後台編輯各職稱所屬類別）
// 供「系統管理」後台的「職稱類別管理」分頁使用，存於 Supabase，所有裝置同步。
// 不影響 orgChartData.ts 既有的組織圖資料。

import { supabase } from './supabaseClient';
import type { JobTitleCategoryRow } from '../types/database';

export interface JobTitleCategory {
  id: string;
  title: string;
  category: string;
}

export const JOB_TITLE_CATEGORY_OPTIONS = ['高階主管', '管理職', '專業職', '技術/作業職', '其他'];

function mapRow(row: JobTitleCategoryRow): JobTitleCategory {
  return { id: row.id, title: row.title, category: row.category };
}

export async function loadJobTitles(): Promise<JobTitleCategory[]> {
  const { data, error } = await supabase.from('job_title_categories').select('*').order('id');
  if (error || !data) return [];
  return (data as JobTitleCategoryRow[]).map(mapRow);
}

export async function saveJobTitles(list: JobTitleCategory[]): Promise<void> {
  const ids = list.map((j) => j.id);
  const { data: existing } = await supabase.from('job_title_categories').select('id');
  const toDelete = (existing || []).map((e) => e.id as string).filter((id) => !ids.includes(id));
  if (toDelete.length) {
    await supabase.from('job_title_categories').delete().in('id', toDelete);
  }
  if (list.length) {
    await supabase.from('job_title_categories').upsert(list);
  }
}
