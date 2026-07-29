// 組織圖月份快照資料存取 — HR/管理員可於組織圖頁面新增「當月組織圖」快照，
// 存於 Supabase，所有裝置同步；不影響 orgChartData.ts 既有的基準組織圖資料。

import { supabase } from './supabaseClient';
import type { OrgSnapshotRow } from '../types/database';
import type { OrgMember, OrgUnit } from '../data/orgChartData';

export interface OrgSnapshot {
  id: string;
  monthLabel: string;
  createdAt: string;
  createdBy: string;
  leadership: OrgMember[];
  units: OrgUnit[];
}

function mapRow(row: OrgSnapshotRow): OrgSnapshot {
  return {
    id: row.id,
    monthLabel: row.month_label,
    createdAt: row.created_date,
    createdBy: row.created_by || '',
    leadership: (row.leadership as OrgMember[]) || [],
    units: (row.units as OrgUnit[]) || [],
  };
}

function snapshotToRow(s: OrgSnapshot) {
  return {
    id: s.id,
    month_label: s.monthLabel,
    created_date: s.createdAt,
    created_by: s.createdBy,
    leadership: s.leadership,
    units: s.units,
  };
}

export async function loadSnapshots(): Promise<OrgSnapshot[]> {
  const { data, error } = await supabase.from('org_snapshots').select('*').order('id');
  if (error || !data) return [];
  return (data as OrgSnapshotRow[]).map(mapRow);
}

export async function saveSnapshots(list: OrgSnapshot[]): Promise<void> {
  const ids = list.map((s) => s.id);
  const { data: existing } = await supabase.from('org_snapshots').select('id');
  const toDelete = (existing || []).map((e) => e.id as string).filter((id) => !ids.includes(id));
  if (toDelete.length) {
    await supabase.from('org_snapshots').delete().in('id', toDelete);
  }
  if (list.length) {
    await supabase.from('org_snapshots').upsert(list.map(snapshotToRow));
  }
}
