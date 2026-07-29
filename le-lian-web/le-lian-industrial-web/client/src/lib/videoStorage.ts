// 課程影片儲存（Supabase Storage）
// 供管理員上傳已下載的影片檔，儲存於 Supabase Storage 的 training-videos bucket，
// 課程內容播放時下載讀取使用，所有裝置皆可同步存取。

import { supabase } from './supabaseClient';

const BUCKET = 'training-videos';

export const MAX_VIDEO_SIZE = 300 * 1024 * 1024; // 300MB

async function clearCourseVideo(courseId: string) {
  const { data } = await supabase.storage.from(BUCKET).list(courseId);
  if (data && data.length > 0) {
    await supabase.storage.from(BUCKET).remove(data.map((f) => `${courseId}/${f.name}`));
  }
}

export async function saveCourseVideo(courseId: string, file: File | Blob): Promise<void> {
  await clearCourseVideo(courseId);
  const name = file instanceof File ? file.name : 'video';
  const { error } = await supabase.storage.from(BUCKET).upload(`${courseId}/${name}`, file, { upsert: true });
  if (error) throw error;
}

export async function getCourseVideo(courseId: string): Promise<Blob | null> {
  const { data: list } = await supabase.storage.from(BUCKET).list(courseId);
  if (!list || list.length === 0) return null;
  const { data, error } = await supabase.storage.from(BUCKET).download(`${courseId}/${list[0].name}`);
  if (error || !data) return null;
  return data;
}

export async function deleteCourseVideo(courseId: string): Promise<void> {
  await clearCourseVideo(courseId);
}
