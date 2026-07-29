// 公司公告資料存取，存於 Supabase，所有裝置同步。
// 「已讀確認」名單存放於獨立的 announcement_reads 表（而非公告本身的欄位），
// 讓任何員工都能記錄自己已讀，但不會因此取得修改公告內容的權限。

import { supabase } from './supabaseClient';
import type { AnnouncementRow, AnnouncementReadRow } from '../types/database';

export interface AnnEditLogEntry {
  action: '建立' | '編輯' | '刪除' | '還原';
  editedAt: string;
  editedBy: string;
  summary: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  publishedAt: string;
  publishedBy: string;
  pinned: boolean;
  important: boolean;
  targetAudience: '全體員工' | '主管以上' | '特定部門';
  targetDept: string;
  requireConfirmation: boolean;
  readBy: string[];
  expiresAt?: string;
  editHistory: AnnEditLogEntry[];
  deletedAt?: string;
  deletedBy?: string;
}

function mapRow(row: AnnouncementRow, readBy: string[]): Announcement {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category || '',
    publishedAt: row.published_at,
    publishedBy: row.published_by || '',
    pinned: row.pinned,
    important: row.important,
    targetAudience: row.target_audience,
    targetDept: row.target_dept || '',
    requireConfirmation: row.require_confirmation,
    readBy,
    expiresAt: row.expires_at || undefined,
    editHistory: (row.edit_history as AnnEditLogEntry[]) || [],
    deletedAt: row.deleted_at || undefined,
    deletedBy: row.deleted_by || undefined,
  };
}

function announcementToRow(a: Announcement) {
  return {
    id: a.id,
    title: a.title,
    content: a.content,
    category: a.category,
    published_at: a.publishedAt,
    published_by: a.publishedBy,
    pinned: a.pinned,
    important: a.important,
    target_audience: a.targetAudience,
    target_dept: a.targetDept,
    require_confirmation: a.requireConfirmation,
    expires_at: a.expiresAt || null,
    edit_history: a.editHistory,
    deleted_at: a.deletedAt || null,
    deleted_by: a.deletedBy || null,
  };
}

export async function loadAnnouncements(): Promise<Announcement[]> {
  const [{ data: rows, error }, { data: reads }] = await Promise.all([
    supabase.from('announcements').select('*').order('id'),
    supabase.from('announcement_reads').select('*'),
  ]);
  if (error || !rows) return [];
  const readsByAnn: Record<string, string[]> = {};
  ((reads || []) as AnnouncementReadRow[]).forEach((r) => {
    (readsByAnn[r.announcement_id] ||= []).push(r.user_id);
  });
  return (rows as AnnouncementRow[]).map((row) => mapRow(row, readsByAnn[row.id] || []));
}

export async function saveAnnouncements(list: Announcement[]): Promise<void> {
  const ids = list.map((a) => a.id);
  const { data: existing } = await supabase.from('announcements').select('id');
  const toDelete = (existing || []).map((e) => e.id as string).filter((id) => !ids.includes(id));
  if (toDelete.length) {
    await supabase.from('announcements').delete().in('id', toDelete);
  }
  if (list.length) {
    await supabase.from('announcements').upsert(list.map(announcementToRow));
  }
}

/** 記錄使用者已讀確認某則公告（不影響公告內容本身）。 */
export async function confirmRead(announcementId: string, userId: string): Promise<void> {
  await supabase
    .from('announcement_reads')
    .upsert({ announcement_id: announcementId, user_id: userId }, { onConflict: 'announcement_id,user_id', ignoreDuplicates: true });
}
