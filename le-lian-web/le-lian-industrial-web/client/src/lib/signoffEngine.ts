// 通用簽核引擎：與後端 enforce_signoff_slot() / notify_pending_signoff() 兩個 Postgres trigger
// 配套使用（見 supabase/schema.sql）。任何資料表只要具備 sign_off jsonb + designated_signers jsonb
// 兩個欄位並掛上這兩個 trigger，即可套用本模組提供的指派／權限判斷／通知邏輯，
// 達到「準確派送到指定主管，且只有該指定人才能簽核」的效果。
//
// 本模組原為 PhysicalTraining.tsx 內的區域函式，抽出供 AnnualTrainingPlan.tsx／FeeAgreement.tsx
// 等其他簽核流程共用。

import type { User } from '../data/trainingMockData';

/** 單一簽核欄位已簽核後的內容 */
export interface SignOffEntry {
  name: string;
  date: string;
  signature?: string;
  comment?: string;
}

/** 找出指定部門的主管（角色為 manager 且部門相符），用於指派該部門表單的「部門主管」簽核人 */
export function findDeptManagerId(department: string, users: User[]): string | undefined {
  return users.find(u => u.role === 'manager' && u.department === department)?.id;
}

/** 找出指定角色的使用者（用於指派人資審核／副總核准等簽核人） */
export function findRoleUserId(role: User['role'], users: User[]): string | undefined {
  return users.find(u => u.role === role)?.id;
}

/** 簽核欄位是否可由目前登入者簽核：管理員可代簽；其餘角色須符合允許角色，
 *  且若該欄位已指定特定簽核人，則僅該位指定人本人可簽，非欄位人選不可簽核 */
export function canSignSlot(
  currentUser: User | null | undefined,
  designatedId: string | undefined,
  allowedRoles: Array<User['role']>
): boolean {
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  if (!allowedRoles.includes(currentUser.role)) return false;
  return designatedId ? currentUser.id === designatedId : true;
}

/** 通知各指定簽核人有文件待簽核（排除自己） */
export function notifySigners(
  addNotification: (userId: string, type: string, message: string) => void | Promise<void>,
  currentUserId: string | undefined,
  ids: Array<string | undefined>,
  subjectName: string,
  formLabel: string
) {
  const unique = Array.from(new Set(ids.filter((id): id is string => !!id && id !== currentUserId)));
  unique.forEach(id => addNotification(id, 'sign_pending', `您有一份「${formLabel}」待簽核：${subjectName}`));
}
