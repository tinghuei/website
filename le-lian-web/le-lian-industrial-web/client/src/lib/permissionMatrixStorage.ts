// 系統管理「權限管理」tab 的功能權限矩陣，存於 Supabase，所有裝置同步。

import { supabase } from './supabaseClient';
import type { PermissionMatrixRow } from '../types/database';

export type PermMatrix = Record<string, Record<string, boolean>>;

export async function loadPermissionMatrix(): Promise<PermMatrix | null> {
  const { data, error } = await supabase.from('permission_matrix').select('*').eq('id', true).maybeSingle();
  if (error || !data) return null;
  return (data as PermissionMatrixRow).matrix;
}

export async function savePermissionMatrix(matrix: PermMatrix): Promise<void> {
  await supabase.from('permission_matrix').upsert({ id: true, matrix });
}
