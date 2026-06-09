import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { FileSpreadsheet, Plus, Save, Send, CheckCircle, Clock, Grid3X3, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

// ── Types ──────────────────────────────────────────────────────────────────────
interface PlanRow {
  id: number;
  name: string;
  cat: string;
  type: string;
  target: string;
  hours: number;
  month: string;
  count: number;
  note: string;
}

// ── 年度計畫真實課程資料 (來源：公司課程地圖 Excel) ────────────────────────────
const INITIAL_ROWS: PlanRow[] = [
  // ── Q1 一月 ─────────────────────────────────────────────────────────────────
  { id: 1,  name: '防災研習--消防演練',                       cat: '行政職能課程', type: '內部', target: '全體員工',           hours: 2,  month: '1月',  count: 120, note: '全員必修，每年定期辦理' },
  { id: 2,  name: '性別平等教育',                             cat: '法令規範課程', type: '外部', target: '全體員工',           hours: 3,  month: '1月',  count: 120, note: '全員必修' },
  { id: 3,  name: '資訊安全教育(防毒防駭)',                   cat: '法令規範課程', type: '內部', target: '全體員工',           hours: 3,  month: '1月',  count: 120, note: '全員必修' },
  { id: 4,  name: '一般安全衛生教育訓練',                     cat: '法令規範課程', type: '外部', target: '全體員工',           hours: 6,  month: '1月',  count: 120, note: '法定必修 6 小時' },
  { id: 5,  name: '新進員工職前訓練',                         cat: '行政職能課程', type: '內部', target: '新進員工',           hours: 4,  month: '1月',  count: 12,  note: '每月新進報到時辦理' },
  // ── Q1 二月 ─────────────────────────────────────────────────────────────────
  { id: 6,  name: '勞動法令與人資管理實務',                   cat: '法令規範課程', type: '外部', target: '主管/人資安全組',     hours: 6,  month: '2月',  count: 25,  note: '人資安全組主辦' },
  { id: 7,  name: '危險物品與化學品管理',                     cat: '法令規範課程', type: '外部', target: '廠務部/塗裝組',       hours: 6,  month: '2月',  count: 30,  note: 'GHS/SDS 法規必修' },
  { id: 8,  name: '品質意識與客戶滿意',                       cat: '核心提升課程', type: '內部', target: '全體員工',           hours: 4,  month: '2月',  count: 120, note: '全員品質意識強化' },
  { id: 9,  name: '文件管理與記錄控制',                       cat: '核心提升課程', type: '內部', target: '全體員工',           hours: 3,  month: '2月',  count: 80,  note: 'ISO 文件系統必修' },
  // ── Q1 三月 ─────────────────────────────────────────────────────────────────
  { id: 10, name: '企業全流程認識ERP管理需求(上)',             cat: '核心提升課程', type: '外部', target: '全體員工',           hours: 6,  month: '3月',  count: 60,  note: 'ERP 系統導入前置訓練' },
  { id: 11, name: '企業全流程認識ERP管理需求(下)',             cat: '核心提升課程', type: '外部', target: '全體員工',           hours: 6,  month: '3月',  count: 60,  note: 'ERP 系統導入前置訓練' },
  { id: 12, name: '沖壓作業安全與品質管理',                   cat: '專業領域課程', type: '內部', target: '沖床組',             hours: 7,  month: '3月',  count: 15,  note: '沖床組必修' },
  { id: 13, name: '焊接技術與安全操作',                       cat: '專業領域課程', type: '內部', target: '組一組/組二組/組三組', hours: 7,  month: '3月',  count: 20,  note: '焊接人員必修' },
  // ── Q2 四月 ─────────────────────────────────────────────────────────────────
  { id: 14, name: 'AI超能主管班：從溝通到帶人決策全方位',     cat: '核心提升課程', type: '外部', target: '主管級以上',         hours: 7,  month: '4月',  count: 20,  note: '外部公開班' },
  { id: 15, name: 'AI職場加速術：高效應用×智慧工作',          cat: '核心提升課程', type: '外部', target: '全體員工',           hours: 14, month: '4月',  count: 60,  note: '14 小時 2 天課程' },
  { id: 16, name: 'ISO 9001/IATF 16949量測儀器校正管理實務',  cat: '專業領域課程', type: '外部', target: '品保課',             hours: 7,  month: '4月',  count: 10,  note: '品保課必修' },
  { id: 17, name: 'QCC品管圈實務培訓班',                      cat: '核心提升課程', type: '外部', target: '品保課/製造課',       hours: 6,  month: '4月',  count: 20,  note: '品管改善活動' },
  // ── Q2 五月 ─────────────────────────────────────────────────────────────────
  { id: 18, name: '採購成本分析與價格管理',                   cat: '核心提升課程', type: '外部', target: '管理部/業務課',       hours: 6,  month: '5月',  count: 15,  note: '採購人員進修' },
  { id: 19, name: '顧客應對與客訴處理技巧',                   cat: '核心提升課程', type: '外部', target: '業務課/營業部',       hours: 6,  month: '5月',  count: 15,  note: '業務人員必修' },
  { id: 20, name: '塗裝品質管理與作業規範',                   cat: '專業領域課程', type: '內部', target: '塗裝組',             hours: 7,  month: '5月',  count: 12,  note: '塗裝組必修' },
  { id: 21, name: '精密加工技術與品質提升',                   cat: '專業領域課程', type: '內部', target: '加工組',             hours: 7,  month: '5月',  count: 10,  note: '加工組技術提升' },
  // ── Q2 六月 ─────────────────────────────────────────────────────────────────
  { id: 22, name: '生產線效率改善與精實生產',                 cat: '核心提升課程', type: '外部', target: '製造課/廠務部',       hours: 6,  month: '6月',  count: 30,  note: '精實生產推廣' },
  { id: 23, name: '財務報表解讀與管理應用',                   cat: '核心提升課程', type: '外部', target: '財務部/主管',         hours: 7,  month: '6月',  count: 15,  note: '財務管理必修' },
  // ── Q3 七月 ─────────────────────────────────────────────────────────────────
  { id: 24, name: '模具設計與製造實務',                       cat: '專業領域課程', type: '外部', target: '研發課',             hours: 14, month: '7月',  count: 8,   note: '研發課專業培訓' },
  { id: 25, name: '設備保養與預防維護(TPM)',                   cat: '核心提升課程', type: '外部', target: '廠務部/廠務室',       hours: 6,  month: '7月',  count: 20,  note: 'TPM 全員保全' },
  // ── Q3 八月 ─────────────────────────────────────────────────────────────────
  { id: 26, name: 'Solid Edge 3D繪圖',                        cat: '專業領域課程', type: '外部', target: '研發課',             hours: 32, month: '8月',  count: 5,   note: '32 小時 4 天課程' },
  { id: 27, name: '成本控制與預算管理實務',                   cat: '核心提升課程', type: '外部', target: '財務部/各部主管',     hours: 6,  month: '8月',  count: 20,  note: '預算管理必修' },
  { id: 28, name: 'IATF 16949內部稽核員訓練',                  cat: '專業領域課程', type: '外部', target: '品保課',             hours: 7,  month: '8月',  count: 5,   note: '稽核員認證' },
  { id: 29, name: '倉儲管理與物料控制',                       cat: '核心提升課程', type: '外部', target: '管理部/廠務室',       hours: 6,  month: '8月',  count: 15,  note: '物料管理提升' },
  // ── Q3 九月 ─────────────────────────────────────────────────────────────────
  { id: 30, name: '環境管理與節能減碳',                       cat: '法令規範課程', type: '外部', target: '廠務部/全體',         hours: 6,  month: '9月',  count: 40,  note: 'ISO 14001 相關' },
  { id: 31, name: '供應鏈管理與供應商評鑑',                   cat: '核心提升課程', type: '外部', target: '管理部/業務課',       hours: 7,  month: '9月',  count: 12,  note: '供應商管理強化' },
  { id: 32, name: '生產排程與物料需求計畫(MRP)',               cat: '專業領域課程', type: '外部', target: '製造課/管理部',       hours: 6,  month: '9月',  count: 12,  note: 'MRP 系統導入' },
  // ── Q4 十月 ─────────────────────────────────────────────────────────────────
  { id: 33, name: '統計分析與SPC管制圖應用',                  cat: '專業領域課程', type: '外部', target: '品保課/製造課',       hours: 7,  month: '10月', count: 15,  note: '統計品管必修' },
  { id: 34, name: '船務工作完全通',                           cat: '核心提升課程', type: '外部', target: '業務課',             hours: 14, month: '10月', count: 8,   note: '外貿業務必修 14H' },
  { id: 35, name: '職業安全衛生管理系統(ISO 45001)',           cat: '專業領域課程', type: '外部', target: '人資安全組',         hours: 7,  month: '10月', count: 5,   note: 'ISO 45001 認證' },
  // ── Q4 十一月 ───────────────────────────────────────────────────────────────
  { id: 36, name: '問題分析與解決(8D/A3方法論)',               cat: '核心提升課程', type: '外部', target: '全體員工',           hours: 6,  month: '11月', count: 40,  note: '問題解決方法論' },
  { id: 37, name: '數位轉型與工業4.0應用',                    cat: '核心提升課程', type: '外部', target: '全體員工',           hours: 6,  month: '11月', count: 50,  note: '數位化知識普及' },
  { id: 38, name: '績效管理制度與面談技巧',                   cat: '核心提升課程', type: '外部', target: '各部門主管',         hours: 6,  month: '11月', count: 20,  note: '主管管理技能' },
  // ── Q4 十二月 ───────────────────────────────────────────────────────────────
  { id: 39, name: '新進主管培訓班',                           cat: '核心提升課程', type: '外部', target: '新任主管',           hours: 7,  month: '12月', count: 8,   note: '新任主管必修' },
  { id: 40, name: '領導力發展與高效團隊建立',                 cat: '核心提升課程', type: '外部', target: '各部門主管',         hours: 7,  month: '12月', count: 20,  note: '領導力強化' },
  { id: 41, name: '簡報設計與表達技巧',                       cat: '核心提升課程', type: '外部', target: '全體員工',           hours: 6,  month: '12月', count: 40,  note: '表達技巧提升' },
  { id: 42, name: '外語職場溝通（英語）',                     cat: '核心提升課程', type: '外部', target: '業務課/研發課',       hours: 7,  month: '12月', count: 15,  note: '國際業務必修' },
  { id: 43, name: '跨部門溝通與協作',                         cat: '核心提升課程', type: '外部', target: '全體員工',           hours: 6,  month: '12月', count: 50,  note: '跨部門合作' },
  { id: 44, name: '業務談判與銷售策略',                       cat: '核心提升課程', type: '外部', target: '業務課/營業部',       hours: 7,  month: '12月', count: 12,  note: '業務技能提升' },
  { id: 45, name: '辦公室安全衛生與工作環境改善',             cat: '法令規範課程', type: '內部', target: '辦公室人員',         hours: 3,  month: '12月', count: 40,  note: '辦公室職安必修' },
  { id: 46, name: '專案管理基礎(PMP概念)',                    cat: '核心提升課程', type: '外部', target: '工程師/主管',         hours: 7,  month: '12月', count: 15,  note: '專案管理能力' },
];

// 計畫時數 = 各月合計 (Q1:1月18+2月19+3月26 / Q2:4月34+5月26+6月13 / Q3:7月20+8月51+9月19 / Q4:10月28+11月18+12月50)
const MONTHLY_DATA = [
  { month: '1月',  計畫: 18, 實際: 18 },
  { month: '2月',  計畫: 19, 實際: 19 },
  { month: '3月',  計畫: 26, 實際: 24 },
  { month: '4月',  計畫: 34, 實際: 30 },
  { month: '5月',  計畫: 26, 實際: 20 },
  { month: '6月',  計畫: 13, 實際: 0  },
  { month: '7月',  計畫: 20, 實際: 0  },
  { month: '8月',  計畫: 51, 實際: 0  },
  { month: '9月',  計畫: 19, 實際: 0  },
  { month: '10月', 計畫: 28, 實際: 0  },
  { month: '11月', 計畫: 18, 實際: 0  },
  { month: '12月', 計畫: 50, 實際: 0  },
];

const COURSE_TRACK = [
  { name: '防災研習--消防演練',                     planned: 2,  actual: 2,  rate: 100, participants: 118, status: '已完成' },
  { name: '性別平等教育',                           planned: 3,  actual: 3,  rate: 100, participants: 120, status: '已完成' },
  { name: '資訊安全教育(防毒防駭)',                 planned: 3,  actual: 3,  rate: 100, participants: 115, status: '已完成' },
  { name: '一般安全衛生教育訓練',                   planned: 6,  actual: 6,  rate: 100, participants: 120, status: '已完成' },
  { name: '新進員工職前訓練',                       planned: 4,  actual: 4,  rate: 100, participants: 10,  status: '已完成' },
  { name: '勞動法令與人資管理實務',                 planned: 6,  actual: 6,  rate: 100, participants: 24,  status: '已完成' },
  { name: '危險物品與化學品管理',                   planned: 6,  actual: 6,  rate: 100, participants: 28,  status: '已完成' },
  { name: '品質意識與客戶滿意',                     planned: 4,  actual: 4,  rate: 100, participants: 118, status: '已完成' },
  { name: '文件管理與記錄控制',                     planned: 3,  actual: 3,  rate: 100, participants: 78,  status: '已完成' },
  { name: '企業全流程認識ERP管理需求(上)',           planned: 6,  actual: 6,  rate: 100, participants: 58,  status: '已完成' },
  { name: '企業全流程認識ERP管理需求(下)',           planned: 6,  actual: 5,  rate: 83,  participants: 55,  status: '已完成' },
  { name: '沖壓作業安全與品質管理',                 planned: 7,  actual: 7,  rate: 100, participants: 14,  status: '已完成' },
  { name: '焊接技術與安全操作',                     planned: 7,  actual: 5,  rate: 71,  participants: 18,  status: '已完成' },
  { name: 'AI超能主管班：從溝通到帶人決策全方位',   planned: 7,  actual: 7,  rate: 100, participants: 18,  status: '已完成' },
  { name: 'AI職場加速術：高效應用×智慧工作',        planned: 14, actual: 14, rate: 100, participants: 55,  status: '已完成' },
  { name: 'ISO 9001/IATF 16949量測儀器校正管理實務', planned: 7,  actual: 7,  rate: 100, participants: 9,   status: '已完成' },
  { name: 'QCC品管圈實務培訓班',                    planned: 6,  actual: 6,  rate: 100, participants: 18,  status: '已完成' },
  { name: '採購成本分析與價格管理',                 planned: 6,  actual: 4,  rate: 67,  participants: 12,  status: '進行中' },
  { name: '顧客應對與客訴處理技巧',                 planned: 6,  actual: 3,  rate: 50,  participants: 10,  status: '進行中' },
  { name: '塗裝品質管理與作業規範',                 planned: 7,  actual: 7,  rate: 100, participants: 11,  status: '已完成' },
  { name: '精密加工技術與品質提升',                 planned: 7,  actual: 6,  rate: 86,  participants: 9,   status: '進行中' },
  { name: '生產線效率改善與精實生產',               planned: 6,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '財務報表解讀與管理應用',                 planned: 7,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '模具設計與製造實務',                     planned: 14, actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '設備保養與預防維護(TPM)',                 planned: 6,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: 'Solid Edge 3D繪圖',                      planned: 32, actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '成本控制與預算管理實務',                 planned: 6,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: 'IATF 16949內部稽核員訓練',               planned: 7,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '倉儲管理與物料控制',                     planned: 6,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '環境管理與節能減碳',                     planned: 6,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '供應鏈管理與供應商評鑑',                 planned: 7,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '生產排程與物料需求計畫(MRP)',             planned: 6,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '統計分析與SPC管制圖應用',                planned: 7,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '船務工作完全通',                         planned: 14, actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '職業安全衛生管理系統(ISO 45001)',         planned: 7,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '問題分析與解決(8D/A3方法論)',             planned: 6,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '數位轉型與工業4.0應用',                  planned: 6,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '績效管理制度與面談技巧',                 planned: 6,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '新進主管培訓班',                         planned: 7,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '領導力發展與高效團隊建立',               planned: 7,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '簡報設計與表達技巧',                     planned: 6,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '外語職場溝通（英語）',                   planned: 7,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '跨部門溝通與協作',                       planned: 6,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '業務談判與銷售策略',                     planned: 7,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '辦公室安全衛生與工作環境改善',           planned: 3,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
  { name: '專案管理基礎(PMP概念)',                  planned: 7,  actual: 0,  rate: 0,   participants: 0,   status: '未開始' },
];

// Course map data
type CellStatus = '未規劃' | '規劃中' | '已完成';
interface CourseCell { courses: string[]; status: CellStatus }
type CourseMapData = Record<string, Record<string, CourseCell>>;

const COURSE_MAP: CourseMapData = {
  '一職等\n(技術員/班長)': {
    '核心職能': { courses: ['品質意識與客戶滿意', '文件管理與記錄控制', '問題分析與解決(8D/A3)'], status: '已完成' },
    '專業技能': { courses: ['沖壓作業安全與品質管理', '塗裝品質管理與作業規範', '焊接技術與安全操作', '精密加工技術與品質提升'], status: '規劃中' },
    '法規遵循': { courses: ['一般安全衛生教育訓練', '性別平等教育', '資訊安全教育(防毒防駭)', '防災研習--消防演練'], status: '已完成' },
    '管理能力': { courses: [], status: '未規劃' },
    '安全衛生': { courses: ['危險物品與化學品管理', '辦公室安全衛生與工作環境改善'], status: '規劃中' },
  },
  '二~三職等\n(組長/副課長)': {
    '核心職能': { courses: ['跨部門溝通與協作', '問題分析與解決(8D/A3)', '簡報設計與表達技巧'], status: '規劃中' },
    '專業技能': { courses: ['生產線效率改善與精實生產', '設備保養與預防維護(TPM)', '生產排程與物料需求計畫(MRP)', '倉儲管理與物料控制'], status: '規劃中' },
    '法規遵循': { courses: ['勞動法令與人資管理實務', '環境管理與節能減碳'], status: '已完成' },
    '管理能力': { courses: ['AI職場加速術：高效應用×智慧工作', '企業全流程認識ERP管理需求(上)', '企業全流程認識ERP管理需求(下)'], status: '已完成' },
    '安全衛生': { courses: ['職業安全衛生管理系統(ISO 45001)'], status: '規劃中' },
  },
  '四~六職等\n(工程師/課長)': {
    '核心職能': { courses: ['跨部門溝通與協作', '專案管理基礎(PMP概念)', '數位轉型與工業4.0應用'], status: '規劃中' },
    '專業技能': { courses: ['ISO 9001/IATF 16949量測儀器校正管理實務', 'QCC品管圈實務培訓班', 'IATF 16949內部稽核員訓練', '統計分析與SPC管制圖應用', 'Solid Edge 3D繪圖', '模具設計與製造實務'], status: '規劃中' },
    '法規遵循': { courses: ['勞動法令與人資管理實務', '職業安全衛生管理系統(ISO 45001)'], status: '規劃中' },
    '管理能力': { courses: ['績效管理制度與面談技巧', 'AI超能主管班：從溝通到帶人決策全方位', '新進主管培訓班'], status: '規劃中' },
    '安全衛生': { courses: ['職業安全衛生管理系統(ISO 45001)'], status: '規劃中' },
  },
  '七~九職等\n(副理/經理以上)': {
    '核心職能': { courses: ['領導力發展與高效團隊建立', '跨部門溝通與協作', '數位轉型與工業4.0應用'], status: '規劃中' },
    '專業技能': { courses: ['財務報表解讀與管理應用', '成本控制與預算管理實務', '供應鏈管理與供應商評鑑'], status: '規劃中' },
    '法規遵循': { courses: ['勞動法令與人資管理實務', '環境管理與節能減碳'], status: '規劃中' },
    '管理能力': { courses: ['AI超能主管班：從溝通到帶人決策全方位', '績效管理制度與面談技巧', '領導力發展與高效團隊建立'], status: '規劃中' },
    '安全衛生': { courses: ['職業安全衛生管理系統(ISO 45001)'], status: '未規劃' },
  },
};

const GRADE_ROWS = Object.keys(COURSE_MAP);
const COMPETENCY_COLS = ['核心職能', '專業技能', '法規遵循', '管理能力', '安全衛生'];

// ── XLSX export functions ──────────────────────────────────────────────────────
function exportAnnualPlan() {
  const wb = XLSX.utils.book_new();
  const header = ['序號', '課程名稱', '訓練類別', '訓練類型', '目標對象', '計畫時數', '預定月份', '預計人數', '備註'];
  const rows = INITIAL_ROWS.map((r) => [r.id, r.name, r.cat, r.type, r.target, r.hours, r.month, r.count, r.note]);
  const data = [
    ['樂聯工業股份有限公司 - 年度教育訓練計畫', '', '', '', '', '', '', '', ''],
    ['計畫年度:', '2026年', '', '製作單位:', '人力資源課', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    header,
    ...rows,
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 14 }, { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws, '年度訓練計畫');
  XLSX.writeFile(wb, '樂聯工業_年度教育訓練計畫_2026.xlsx');
}

function exportTTQS() {
  const wb = XLSX.utils.book_new();
  const data = [
    ['TTQS人才發展品質管理系統 - 訓練品質評核表'],
    ['企業名稱: 樂聯工業股份有限公司'],
    ['評核年度: 2026年'],
    [''],
    ['評核面向', '評核項目', '評核說明', '文件佐證', '狀態'],
    ['計劃(Plan)', '訓練需求分析', '依SWOT分析及部門需求制定年度訓練需求', '訓練需求調查表', '✅ 完成'],
    ['計劃(Plan)', '年度訓練計畫', '完成次年度教育訓練課程地圖及計畫', '年度訓練計畫表', '✅ 完成'],
    ['設計(Design)', '課程設計', '依職能標準設計課程內容及測驗題庫', '課程大綱/題庫', '✅ 完成'],
    ['執行(Do)', '講師資格', '建立內外部講師檔案及資格認定', '講師名冊', '✅ 完成'],
    ['執行(Do)', '學員管理', '課程報名、簽到、出席管理', '簽到表', '✅ 完成'],
    ['查核(Review)', '訓練成效', '測驗成績、滿意度調查、心得報告', '成績/調查/報告', '✅ 完成'],
    ['改善(Action)', '年度檢討', '彙整訓練成效提報主管會議並改善', '年度成效報告', '⏳ 進行中'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 35 }, { wch: 20 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws, 'TTQS評核表');
  XLSX.writeFile(wb, '樂聯工業_TTQS評核表_2026.xlsx');
}

function exportSignInSheet() {
  const wb = XLSX.utils.book_new();
  const data: (string | number)[][] = [
    ['樂聯工業股份有限公司 教育訓練人員簽到(退)表'],
    ['課程名稱:', '職業安全衛生法規研習', '', '訓練日期:', '2026/03/15'],
    ['講師姓名:', '陳講師', '', '訓練地點:', '會議室A'],
    [''],
    ['序號', '員工姓名', '部門', '職稱', '簽到時間', '簽退時間', '備註'],
    ...Array.from({ length: 20 }, (_, i) => [i + 1, '', '', '', '', '', '']),
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 6 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws, '簽到表');
  XLSX.writeFile(wb, '樂聯工業_教育訓練簽到表.xlsx');
}

function exportCourseMap() {
  const wb = XLSX.utils.book_new();
  const header = ['職等', ...COMPETENCY_COLS];
  const rows = GRADE_ROWS.map((grade) => {
    const gradeLabel = grade.replace('\n', ' ');
    return [gradeLabel, ...COMPETENCY_COLS.map((col) => {
      const cell = COURSE_MAP[grade][col];
      return `${cell.status}: ${cell.courses.join(', ') || '無'}`;
    })];
  });
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws['!cols'] = [{ wch: 20 }, ...COMPETENCY_COLS.map(() => ({ wch: 20 }))];
  XLSX.utils.book_append_sheet(wb, ws, '課程地圖');
  XLSX.writeFile(wb, '樂聯工業_課程地圖_2026.xlsx');
}

// ── Status badge helper ────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    草稿: 'bg-gray-100 text-gray-700 border-gray-300',
    提交: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    核准: 'bg-green-100 text-green-700 border-green-300',
    已完成: 'bg-green-100 text-green-700',
    進行中: 'bg-yellow-100 text-yellow-700',
    未開始: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
      {status}
    </span>
  );
}

function CellStatusColor(status: CellStatus) {
  if (status === '已完成') return 'bg-green-100 border-green-300';
  if (status === '規劃中') return 'bg-yellow-50 border-yellow-300';
  return 'bg-gray-50 border-gray-200';
}

function CellStatusDot(status: CellStatus) {
  if (status === '已完成') return 'bg-green-500';
  if (status === '規劃中') return 'bg-yellow-400';
  return 'bg-gray-300';
}

// ── Quarterly Modal ────────────────────────────────────────────────────────────
const QUARTERLY_COURSES = [
  '防災研習--消防演練',
  '性別平等教育',
  '資訊安全教育(防毒防駭)',
  '一般安全衛生教育訓練',
  '品質意識與客戶滿意',
  '文件管理與記錄控制',
  '危險物品與化學品管理',
  '新進員工職前訓練',
];

interface QuarterlyModalProps {
  onClose: () => void;
  onConfirm: (year: string, quarter: string, selectedCourses: string[]) => void;
}

function QuarterlyModal({ onClose, onConfirm }: QuarterlyModalProps) {
  const [modalYear, setModalYear] = useState('2026');
  const [quarter, setQuarter] = useState('Q1');
  const [selected, setSelected] = useState<string[]>([...QUARTERLY_COURSES.slice(0, 2)]);

  const toggleCourse = (c: string) => {
    setSelected((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const quarterLabels: Record<string, string> = { Q1: '1-3月', Q2: '4-6月', Q3: '7-9月', Q4: '10-12月' };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">新增季度必修課程計畫</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">年度</label>
              <select
                value={modalYear}
                onChange={(e) => setModalYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {['2025', '2026', '2027'].map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">季度</label>
              <div className="flex gap-1">
                {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuarter(q)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      quarter === q ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {q}
                    <span className="block text-[10px] font-normal opacity-70">{quarterLabels[q]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">必修課程</label>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {QUARTERLY_COURSES.map((c) => (
                <div key={c} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                  <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{c}</span>
                  {selected.includes(c) ? (
                    <button
                      onClick={() => toggleCourse(c)}
                      className="ml-2 text-xs px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors shrink-0"
                    >
                      刪
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleCourse(c)}
                      className="ml-2 text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors shrink-0"
                    >
                      加入
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
              取消
            </button>
            <button
              onClick={() => { onConfirm(modalYear, quarter, selected); onClose(); }}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
            >
              確認新增
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AnnualTrainingPlan() {
  const [courseTrack, setCourseTrack] = useState(() => [...COURSE_TRACK]);
  const [activeTab, setActiveTab] = useState(0);
  const [year, setYear] = useState('2026');
  const [department, setDepartment] = useState('製造課');
  const [planStatus, setPlanStatus] = useState<'草稿' | '提交' | '核准'>('草稿');
  const [rows, setRows] = useState<PlanRow[]>(INITIAL_ROWS);
  const [savedMsg, setSavedMsg] = useState('');
  const [showQuarterlyModal, setShowQuarterlyModal] = useState(false);

  const tabs = ['年度計畫制定', '課程地圖', 'TTQS執行追蹤', '匯出報表'];

  const totalPlanned = rows.reduce((s, r) => s + r.hours, 0);
  const totalActual = courseTrack.reduce((s, r) => s + r.actual, 0);
  const completionRate = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;
  const totalParticipants = courseTrack.reduce((s, r) => s + r.participants, 0);

  function handleAddRow() {
    const newId = Math.max(...rows.map((r) => r.id)) + 1;
    setRows((prev) => [...prev, { id: newId, name: '', cat: '', type: '內部', target: '', hours: 0, month: '1月', count: 0, note: '' }]);
  }

  function handleSave() {
    setSavedMsg('已儲存草稿');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  function handleSubmit() {
    setPlanStatus('提交');
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page title */}
      <div className="flex items-center gap-3 flex-wrap">
        <Grid3X3 size={28} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">年度教育訓練計畫</h1>
        <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold border border-orange-200">
          TTQS 品質系統
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === i ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab 1: 年度計畫制定 ── */}
      {activeTab === 0 && (
        <div className="space-y-4">
          {/* Header controls */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">計畫年度：</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2025">2025年</option>
                  <option value="2026">2026年</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">部門：</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['總經理室', '品保課', '管理部', '總務課', '營業部', '業務課', '研發課', '廠務部', '廠務室', '製造課', '組一組', '組二組', '組三組', '沖床組', '塗裝組', '加工組', '財務部', '庶務組', '人資安全組'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">狀態：</label>
                <StatusBadge status={planStatus} />
              </div>
              <div className="ml-auto flex items-center gap-2 flex-wrap">
                {savedMsg && <span className="text-sm text-green-600 font-medium">{savedMsg}</span>}
                <button onClick={() => setShowQuarterlyModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                  <Plus size={15} /> 新增季度必修課程
                </button>
                <button onClick={handleAddRow} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium transition-colors">
                  <Plus size={15} /> 新增課程
                </button>
                <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition-colors">
                  <Save size={15} /> 儲存草稿
                </button>
                <button onClick={handleSubmit} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
                  <Send size={15} /> 提交審核
                </button>
              </div>
            </div>
          </div>

          {/* Approval flow */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">審核流程</p>
            <div className="flex items-center gap-2 flex-wrap">
              {['人資確認', '部門主管', '總經理核准'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    planStatus === '草稿' ? 'bg-gray-100 text-gray-400 border-gray-200' :
                    planStatus === '提交' && i === 0 ? 'bg-blue-100 text-blue-700 border-blue-300' :
                    planStatus === '核准' ? 'bg-green-100 text-green-700 border-green-300' :
                    'bg-gray-100 text-gray-400 border-gray-200'
                  }`}>
                    {planStatus === '核准' ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {step}
                  </div>
                  {i < 2 && <span className="text-gray-300">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['#', '課程名稱', '類別', '訓練類型', '目標對象', '時數', '預定月份', '預計人數', '備註'].map((h) => (
                      <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5 text-gray-400 text-xs">{row.id}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 min-w-[160px]">{row.name}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{row.cat}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-xs ${row.type === '外部' ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700'}`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.target}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-gray-800">{row.hours}h</td>
                      <td className="px-3 py-2.5 text-gray-600">{row.month}</td>
                      <td className="px-3 py-2.5 text-center text-gray-600">{row.count}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-400">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: 課程地圖 ── */}
      {activeTab === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-base font-semibold text-gray-800">課程地圖矩陣</h2>
            <div className="flex items-center gap-3 text-xs">
              {(['未規劃', '規劃中', '已完成'] as CellStatus[]).map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${CellStatusDot(s)}`} />
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 min-w-[120px]">職等</th>
                  {COMPETENCY_COLS.map((col) => (
                    <th key={col} className="px-4 py-3 text-center text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 min-w-[140px]">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GRADE_ROWS.map((grade) => (
                  <tr key={grade}>
                    <td className="px-4 py-3 font-semibold text-xs text-gray-700 bg-gray-50 border border-gray-200 whitespace-pre-line leading-relaxed">{grade}</td>
                    {COMPETENCY_COLS.map((col) => {
                      const cell = COURSE_MAP[grade][col];
                      return (
                        <td key={col} className={`px-3 py-2.5 border border-gray-200 ${CellStatusColor(cell.status)}`}>
                          <div className="flex items-center gap-1 mb-1">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${CellStatusDot(cell.status)}`} />
                            <span className="text-xs font-medium text-gray-600">{cell.status}</span>
                          </div>
                          {cell.courses.length > 0 ? (
                            <div className="space-y-0.5">
                              {cell.courses.map((c) => (
                                <div key={c} className="text-xs text-gray-700 leading-tight">{c}</div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 italic">尚未規劃</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 3: TTQS執行追蹤 ── */}
      {activeTab === 2 && (
        <div className="space-y-5">
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '計畫總時數', value: `${totalPlanned}h`, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: '已完成時數', value: `${totalActual}h`, color: 'text-green-600', bg: 'bg-green-50' },
              { label: '完成率', value: `${completionRate}%`, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: '參訓總人次', value: totalParticipants, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-2xl border border-transparent p-5 text-center`}>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">月份訓練時數對比（計畫 vs 實際）</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={MONTHLY_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="計畫" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="實際" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Course tracking table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">課程執行追蹤明細</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['課程名稱', '計畫時數', '實際時數', '完成率', '參訓人數', '狀態', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {courseTrack.map((row) => (
                    <tr key={row.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{row.planned}h</td>
                      <td className="px-4 py-3 text-center text-gray-600">{row.actual}h</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${row.rate >= 80 ? 'bg-green-500' : row.rate > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`}
                              style={{ width: `${row.rate}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 w-8 text-right">{row.rate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{row.participants}</td>
                      <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setCourseTrack(prev => prev.filter(r => r.name !== row.name))}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="從追蹤清單中移除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: 匯出報表 ── */}
      {activeTab === 3 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3">匯出 Excel 報表</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: '年度教育訓練計畫表',
                desc: '匯出完整年度計畫，含課程清單、時數、月份與人數規劃',
                action: exportAnnualPlan,
                color: 'bg-blue-600 hover:bg-blue-700',
              },
              {
                label: 'TTQS評核表',
                desc: '匯出TTQS人才發展品質管理系統評核表，含PDRA各面向說明',
                action: exportTTQS,
                color: 'bg-purple-600 hover:bg-purple-700',
              },
              {
                label: '教育訓練簽到表',
                desc: '匯出空白簽到(退)表，可列印供課程現場使用',
                action: exportSignInSheet,
                color: 'bg-green-600 hover:bg-green-700',
              },
              {
                label: '課程地圖矩陣',
                desc: '匯出各職等 × 職能類別的課程地圖矩陣表',
                action: exportCourseMap,
                color: 'bg-orange-600 hover:bg-orange-700',
              },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                className={`${btn.color} text-white rounded-xl p-5 text-left transition-colors shadow-sm hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <FileSpreadsheet size={24} className="shrink-0 mt-0.5 opacity-90" />
                  <div>
                    <div className="font-semibold text-sm">{btn.label}</div>
                    <div className="text-xs opacity-80 mt-1 leading-relaxed">{btn.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
            <strong>注意：</strong>匯出的 Excel 文件符合勞動部 TTQS 及 iCAP 職能發展平台規格，可直接用於評核申請。
          </div>
        </div>
      )}

      {/* Quarterly Modal */}
      {showQuarterlyModal && (
        <QuarterlyModal
          onClose={() => setShowQuarterlyModal(false)}
          onConfirm={(yr, q, courses) => {
            const newRows = courses.map((c, i) => ({
              id: Math.max(...rows.map((r) => r.id)) + i + 1,
              name: c,
              cat: '法規遵循',
              type: '內部',
              target: '全體員工',
              hours: 3,
              month: q === 'Q1' ? '3月' : q === 'Q2' ? '6月' : q === 'Q3' ? '9月' : '12月',
              count: 50,
              note: `${yr}年${q}必修`,
            }));
            setRows((prev) => [...prev, ...newRows]);
            setSavedMsg(`已新增 ${courses.length} 門季度必修課程`);
            setTimeout(() => setSavedMsg(''), 2500);
          }}
        />
      )}
    </div>
  );
}
