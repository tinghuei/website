// 各職位「職能評分標準」之自訂覆寫資料 — 由「職能落差分析」頁面的「上傳工作職能書」功能產生，
// 以 localStorage 持久化，並以職位名稱為鍵獨立儲存：上傳特定職位的工作說明書僅會新增／更新
// 該職位的職能評分標準，不會影響共用的 iCAP 職能基準框架或其他職位的標準。

import type { CompetencyCategory } from '../data/competencyFramework';

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

const LS_KEY = 'competency_position_overrides_v1';

/** 讀取各職位已儲存的職能評分標準覆寫資料（依職位名稱為鍵）。 */
export function loadOverrides(): Record<string, PositionCompetencyOverride> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** 儲存各職位的職能評分標準覆寫資料。 */
export function saveOverrides(data: Record<string, PositionCompetencyOverride>): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    // localStorage 無法寫入時（例如隱私模式）靜默忽略
  }
}
