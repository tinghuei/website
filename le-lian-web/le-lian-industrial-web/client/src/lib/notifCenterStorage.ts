// 通知中心個人通知資料存取，存於 Supabase，所有裝置同步。

import { supabase } from './supabaseClient';
import type { NotifCenterNotificationRow } from '../types/database';

export type NotifType = 'deadline_reminder' | 'review_result' | 'new_course' | 'system';

export interface MockNotification {
  id: string;
  type: NotifType;
  isRead: boolean;
  title: string;
  message: string;
  time: string;
  course: string | null;
  urgent: boolean;
}

function mapRow(row: NotifCenterNotificationRow): MockNotification {
  return {
    id: row.id,
    type: row.type,
    isRead: row.is_read,
    title: row.title,
    message: row.message,
    time: row.time || '',
    course: row.course,
    urgent: row.urgent,
  };
}

function notificationToRow(n: MockNotification) {
  return {
    id: n.id,
    type: n.type,
    is_read: n.isRead,
    title: n.title,
    message: n.message,
    time: n.time,
    course: n.course,
    urgent: n.urgent,
  };
}

export async function loadNotifications(): Promise<MockNotification[]> {
  const { data, error } = await supabase.from('notif_center_notifications').select('*').order('id');
  if (error || !data) return [];
  return (data as NotifCenterNotificationRow[]).map(mapRow);
}

export async function saveNotifications(list: MockNotification[]): Promise<void> {
  const ids = list.map((n) => n.id);
  const { data: existing } = await supabase.from('notif_center_notifications').select('id');
  const toDelete = (existing || []).map((e) => e.id as string).filter((id) => !ids.includes(id));
  if (toDelete.length) {
    await supabase.from('notif_center_notifications').delete().in('id', toDelete);
  }
  if (list.length) {
    await supabase.from('notif_center_notifications').upsert(list.map(notificationToRow));
  }
}
