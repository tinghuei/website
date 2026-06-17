import { useEffect, useState, Dispatch, SetStateAction } from 'react';

// 訓練模組資料的 localStorage 持久化工具。
// 目的：避免使用者手動新增/編輯/刪除的資料，因重新整理頁面或網站重新部署而被重置回預設 mock 資料。
// 僅在瀏覽器第一次載入（尚無對應 key 的已儲存資料）時，才會使用傳入的預設值；
// 一旦使用者有任何操作觸發狀態變更，便會寫入 localStorage，之後永遠以 localStorage 內容為準。
const STORAGE_PREFIX = 'training_data_v1:';

function loadPersisted<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function savePersisted<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // 儲存空間不足或瀏覽器封鎖 localStorage 時靜默忽略，不影響當前畫面操作
  }
}

export function usePersistentState<T>(key: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() =>
    loadPersisted(key, typeof initial === 'function' ? (initial as () => T)() : initial)
  );
  useEffect(() => {
    savePersisted(key, state);
  }, [key, state]);
  return [state, setState];
}

export function clearPersistedState(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // ignore
  }
}
