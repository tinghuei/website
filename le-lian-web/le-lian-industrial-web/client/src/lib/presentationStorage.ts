// 課程教材（簡報/文件）儲存（Supabase Storage）
// 供管理員上傳課程簡報或教材檔案（PDF/PPT/PPTX/DOC/DOCX），儲存於 Supabase Storage 的
// training-presentations bucket，供學員瀏覽或下載，所有裝置皆可同步存取。

import { supabase } from './supabaseClient';

const BUCKET = 'training-presentations';

export const MAX_PRESENTATION_SIZE = 100 * 1024 * 1024; // 100MB

async function clearPresentationFile(courseId: string) {
  const { data } = await supabase.storage.from(BUCKET).list(courseId);
  if (data && data.length > 0) {
    await supabase.storage.from(BUCKET).remove(data.map((f) => `${courseId}/${f.name}`));
  }
}

export async function savePresentationFile(courseId: string, file: File): Promise<void> {
  await clearPresentationFile(courseId);
  const { error } = await supabase.storage.from(BUCKET).upload(`${courseId}/${file.name}`, file, { upsert: true });
  if (error) throw error;
}

export async function getPresentationFile(courseId: string): Promise<File | null> {
  const { data: list } = await supabase.storage.from(BUCKET).list(courseId);
  if (!list || list.length === 0) return null;
  const name = list[0].name;
  const { data, error } = await supabase.storage.from(BUCKET).download(`${courseId}/${name}`);
  if (error || !data) return null;
  return new File([data], name, { type: data.type });
}

export async function deletePresentationFile(courseId: string): Promise<void> {
  await clearPresentationFile(courseId);
}
