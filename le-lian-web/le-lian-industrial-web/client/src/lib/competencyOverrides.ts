// 各職位「職能評分標準」之自訂覆寫資料 — 由「職能落差分析」頁面的「上傳工作職能書」功能產生，
// 以 Supabase 持久化，並以職位名稱為鍵獨立儲存：上傳特定職位的工作說明書僅會新增／更新
// 該職位的職能評分標準，不會影響共用的 iCAP 職能基準框架或其他職位的標準。

import { supabase } from './supabaseClient';
import type { CompetencyCategory } from '../data/competencyFramework';
import type { PositionCompetencyOverrideRow } from '../types/database';

type CompetencyScores = Record<string, number>;

export interface PositionCompetencyOverride {
  department: string;
  jobSummary: string;
  competencies: CompetencyCategory[];
  standards: CompetencyScores;
  trainingNeeds: string[];
  sourceFileName: string;
  updatedAt: string;
}

function mapRow(row: PositionCompetencyOverrideRow): PositionCompetencyOverride {
  return {
    department: row.department || '',
    jobSummary: row.job_summary || '',
    competencies: (row.competencies as CompetencyCategory[]) || [],
    standards: row.standards || {},
    trainingNeeds: row.training_needs || [],
    sourceFileName: row.source_file_name || '',
    updatedAt: row.updated_at,
  };
}

function overrideToRow(positionName: string, o: PositionCompetencyOverride) {
  return {
    position_name: positionName,
    department: o.department,
    job_summary: o.jobSummary,
    competencies: o.competencies,
    standards: o.standards,
    training_needs: o.trainingNeeds,
    source_file_name: o.sourceFileName,
    updated_at: o.updatedAt,
  };
}

/** 讀取各職位已儲存的職能評分標準覆寫資料（依職位名稱為鍵）。 */
export async function loadOverrides(): Promise<Record<string, PositionCompetencyOverride>> {
  const { data, error } = await supabase.from('position_competency_overrides').select('*');
  if (error || !data) return {};
  const result: Record<string, PositionCompetencyOverride> = {};
  (data as PositionCompetencyOverrideRow[]).forEach((row) => {
    result[row.position_name] = mapRow(row);
  });
  return result;
}

/** 儲存各職位的職能評分標準覆寫資料。 */
export async function saveOverrides(data: Record<string, PositionCompetencyOverride>): Promise<void> {
  const positionNames = Object.keys(data);
  const { data: existing } = await supabase.from('position_competency_overrides').select('position_name');
  const toDelete = (existing || [])
    .map((e) => e.position_name as string)
    .filter((name) => !positionNames.includes(name));
  if (toDelete.length) {
    await supabase.from('position_competency_overrides').delete().in('position_name', toDelete);
  }
  if (positionNames.length) {
    await supabase
      .from('position_competency_overrides')
      .upsert(positionNames.map((name) => overrideToRow(name, data[name])), { onConflict: 'position_name' });
  }
}
