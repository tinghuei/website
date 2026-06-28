// 成就獎勵中心（積分兌換項目／個人兌換紀錄／個人可兌換積分）資料存取，存於 Supabase，所有裝置同步。

import { supabase } from './supabaseClient';
import type {
  AchievementRedeemItemRow,
  AchievementRedeemRecordRow,
  AchievementPointsRow,
} from '../types/database';

export interface RedeemItem {
  id: string;
  name: string;
  icon: string;
  points: number;
  stock: number;
  desc: string;
}

export interface RedeemRecord {
  id: string;
  itemId: string;
  itemName: string;
  itemIcon: string;
  points: number;
  status: 'pending' | 'approved' | 'cancelled';
  redeemedAt: string;
}

function itemFromRow(row: AchievementRedeemItemRow): RedeemItem {
  return { id: row.id, name: row.name, icon: row.icon, points: row.points, stock: row.stock, desc: row.desc };
}

function itemToRow(item: RedeemItem) {
  return { id: item.id, name: item.name, icon: item.icon, points: item.points, stock: item.stock, desc: item.desc };
}

export async function loadRedeemItems(): Promise<RedeemItem[]> {
  const { data, error } = await supabase.from('achievement_redeem_items').select('*').order('id');
  if (error || !data) return [];
  return (data as AchievementRedeemItemRow[]).map(itemFromRow);
}

export async function saveRedeemItems(items: RedeemItem[]): Promise<void> {
  const ids = items.map((i) => i.id);
  const { data: existing } = await supabase.from('achievement_redeem_items').select('id');
  const toDelete = (existing || []).map((e) => e.id as string).filter((id) => !ids.includes(id));
  if (toDelete.length) {
    await supabase.from('achievement_redeem_items').delete().in('id', toDelete);
  }
  if (items.length) {
    await supabase.from('achievement_redeem_items').upsert(items.map(itemToRow));
  }
}

function recordFromRow(row: AchievementRedeemRecordRow): RedeemRecord {
  return {
    id: row.id,
    itemId: row.item_id,
    itemName: row.item_name,
    itemIcon: row.item_icon,
    points: row.points,
    status: row.status,
    redeemedAt: row.redeemed_at,
  };
}

export async function loadRedeemHistory(userId: string): Promise<RedeemRecord[]> {
  const { data, error } = await supabase
    .from('achievement_redeem_records')
    .select('*')
    .eq('user_id', userId)
    .order('redeemed_at', { ascending: false });
  if (error || !data) return [];
  return (data as AchievementRedeemRecordRow[]).map(recordFromRow);
}

export async function addRedeemRecord(userId: string, record: RedeemRecord): Promise<void> {
  await supabase.from('achievement_redeem_records').insert({
    id: record.id,
    user_id: userId,
    item_id: record.itemId,
    item_name: record.itemName,
    item_icon: record.itemIcon,
    points: record.points,
    status: record.status,
    redeemed_at: record.redeemedAt,
  });
}

export async function updateRedeemRecordStatus(recordId: string, status: RedeemRecord['status']): Promise<void> {
  await supabase.from('achievement_redeem_records').update({ status }).eq('id', recordId);
}

export async function loadAvailablePoints(userId: string, defaultPoints: number): Promise<number> {
  const { data, error } = await supabase
    .from('achievement_points')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return defaultPoints;
  return (data as AchievementPointsRow).available_points;
}

export async function saveAvailablePoints(userId: string, points: number): Promise<void> {
  await supabase.from('achievement_points').upsert({ user_id: userId, available_points: points });
}
