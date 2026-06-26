// 教育訓練投資報酬率（VPDashboard ROI 計算器）資料存取，存於 Supabase，所有裝置同步。

import { supabase } from './supabaseClient';
import type { TrainingRoiInputsRow } from '../types/database';

export interface RoiInputs {
  trainingCost: number;
  qualityLossReduction: number;
  safetyImprovementSavings: number;
  efficiencyGains: number;
}

export const DEFAULT_ROI: RoiInputs = {
  trainingCost: 50,
  qualityLossReduction: 120,
  safetyImprovementSavings: 30,
  efficiencyGains: 40,
};

export async function loadRoi(): Promise<RoiInputs> {
  const { data, error } = await supabase.from('training_roi_inputs').select('*').eq('id', true).maybeSingle();
  if (error || !data) return { ...DEFAULT_ROI };
  const row = data as TrainingRoiInputsRow;
  return {
    trainingCost: row.training_cost,
    qualityLossReduction: row.quality_loss_reduction,
    safetyImprovementSavings: row.safety_improvement_savings,
    efficiencyGains: row.efficiency_gains,
  };
}

export async function saveRoi(roi: RoiInputs): Promise<void> {
  await supabase.from('training_roi_inputs').upsert({
    id: true,
    training_cost: roi.trainingCost,
    quality_loss_reduction: roi.qualityLossReduction,
    safety_improvement_savings: roi.safetyImprovementSavings,
    efficiency_gains: roi.efficiencyGains,
  });
}
