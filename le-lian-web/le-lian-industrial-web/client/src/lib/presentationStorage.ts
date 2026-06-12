// 課程教材（簡報/文件）本機儲存（IndexedDB）
// 供管理員上傳課程簡報或教材檔案（PDF/PPT/PPTX/DOC/DOCX），儲存於目前瀏覽器供學員瀏覽或下載。
// 注意：此儲存僅存在於目前裝置/瀏覽器，清除瀏覽器資料後將會遺失，且不會同步到其他裝置。

const DB_NAME = 'lelian-training-presentations';
const STORE_NAME = 'presentations';
const DB_VERSION = 1;

export const MAX_PRESENTATION_SIZE = 100 * 1024 * 1024; // 100MB

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePresentationFile(courseId: string, file: File): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(file, courseId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPresentationFile(courseId: string): Promise<File | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(courseId);
    req.onsuccess = () => resolve((req.result as File) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deletePresentationFile(courseId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(courseId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
