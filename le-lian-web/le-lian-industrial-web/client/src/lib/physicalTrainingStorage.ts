// 實體教育訓練記錄 / 例行課程 共用資料存取
// 供「實體教育訓練記錄」頁面與「年度教育訓練計畫」頁面（歷年成效查詢）共用，
// 統一存取 localStorage 中的訓練記錄與例行課程資料，避免重複定義初始資料。

export interface PhysicalRecord {
  id: string;
  courseName: string;
  trainingType: '內訓' | '外訓';
  date: string;
  hours: number;
  venue: string;
  instructor: string;
  department: string;
  participants: number;
  ttqsPhase: 'Plan' | 'Design' | 'Do' | 'Review' | 'Action';
  outcome: string;
  evidence: string;
  status: '待審核' | '已審核' | '已存檔';
  photos?: string[];
  /** 平均滿意度（1-5 分），由講師/承辦人填寫問卷結果後輸入 */
  satisfactionScore?: number;
  /** 平均測驗分數（0-100） */
  quizAvgScore?: number;
  /** 測驗及格率（0-100，單位：%） */
  quizPassRate?: number;
}

export interface RoutineCourse {
  id: string;
  courseName: string;
  instructor: string;
  date: string;
  hours: number;
  department: string;
  participants: string[];
  outline: string;
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  submittedBy: string;
  photos?: string[];
  /** 表單一：教育訓練課程大綱表（TTQS Design 階段） */
  design?: CourseDesign;
  /** 表單二：教育訓練成效追蹤表（建議課後30天填寫，TTQS Review/Action 階段） */
  effectiveness?: EffectivenessTracking;
}

/** 簽核狀態 */
export interface SignOff {
  applicant?: { name: string; date: string };
  deptManager?: { name: string; date: string };
  hr?: { name: string; date: string };
  vp?: { name: string; date: string };
}

/** 課程大綱單元（單元/內容/時數） */
export interface SyllabusUnit {
  unit: string;
  content: string;
  hours: number;
}

/** 表單一：教育訓練課程大綱表 */
export interface CourseDesign {
  category: '新人' | '專業' | '管理' | '工安' | '其他';
  targetAudience: string;
  needSources: string[];
  purpose: string;
  competencies: string[];
  syllabus: SyllabusUnit[];
  teachingMethods: string[];
  expectedBenefits: {
    qualityIssueReduction: number;
    complaintReduction: number;
    safetyViolationReduction: number;
    efficiencyImprovement: number;
  };
  signOff: SignOff;
}

/** 表單二：教育訓練成效追蹤表 */
export interface EffectivenessTracking {
  trackingDate: string;
  learningOutcome: {
    attendanceRate: number;
    quizAvgScore: number;
    passRate: number;
    satisfaction: number;
  };
  managerEvaluation: {
    efficiencyImprovement: number;
    qualityImprovement: number;
    safetyAwarenessImprovement: number;
    problemAnalysisImprovement: number;
    attitudeImprovement: number;
  };
  kpiBefore: {
    qualityIssues: number;
    complaints: number;
    safetyViolations: number;
    equipmentAnomalies: number;
  };
  kpiAfter30Days: {
    qualityIssues: number;
    complaints: number;
    safetyViolations: number;
    equipmentAnomalies: number;
  };
  judgment: '成效顯著' | '符合預期' | '部分達成' | '需再訓練';
  suggestion: string;
  filledBy: string;
}

export const TTQS_PHASES = [
  { value: 'Plan',   label: '計劃 (Plan)',   color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'Design', label: '設計 (Design)', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'Do',     label: '執行 (Do)',     color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'Review', label: '查核 (Review)', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'Action', label: '改善 (Action)', color: 'bg-orange-100 text-orange-700 border-orange-300' },
] as const;

export const LS_KEY = 'physical_training_records_v1';
export const LS_ROUTINE_KEY = 'routine_courses_v1';

export function getInitialRecords(): PhysicalRecord[] {
  return [
    {
      id: 'pt1', courseName: '防災研習--消防演練', trainingType: '內訓',
      date: '2026-01-15', hours: 2, venue: '廠區集合廣場', instructor: '消防隊員 / 陳安全',
      department: '全體員工', participants: 118,
      ttqsPhase: 'Do', outcome: '全體員工完成演練，緊急疏散時間縮短至3分鐘以內',
      evidence: '簽到表、現場照片、演練記錄表', status: '已審核', photos: [],
    },
    {
      id: 'pt2', courseName: '性別平等教育', trainingType: '外訓',
      date: '2026-01-22', hours: 3, venue: '會議室A', instructor: '外部講師',
      department: '全體員工', participants: 120,
      ttqsPhase: 'Do', outcome: '員工對性騷擾防治及申訴程序瞭解度提升',
      evidence: '簽到表、測驗成績單、滿意度調查表', status: '已審核', photos: [],
    },
    {
      id: 'pt3', courseName: '一般安全衛生教育訓練', trainingType: '外訓',
      date: '2026-01-28', hours: 6, venue: '會議室B', instructor: '勞動部認可訓練機構',
      department: '全體員工', participants: 120,
      ttqsPhase: 'Do', outcome: '達成法定6小時安衛訓練要求，測驗平均通過率92%',
      evidence: '簽到表、測驗成績單、結訓證書、機構訓練合格文件', status: '已審核', photos: [],
    },
  ];
}

export function getInitialRoutine(): RoutineCourse[] {
  return [
    {
      id: 'rc1', courseName: '新進員工職前訓練', instructor: '人資安全組',
      date: '2026-01-08', hours: 8, department: '全體員工',
      participants: ['王小明', '陳美玲'], outline: '公司規定、安全衛生、基本作業流程介紹',
      status: 'completed', submittedBy: '人資安全組', photos: [],
    },
    {
      id: 'rc2', courseName: '品質管理基礎訓練', instructor: '品保課 張品管',
      date: '2026-02-10', hours: 3, department: '品保課',
      participants: ['陳小芳', '林志偉', '黃品質'],
      outline: '品質管理基本概念、ISO 9001要求、不合格品處理',
      status: 'approved', submittedBy: '張品管', photos: [],
    },
  ];
}

export function loadRecords(): PhysicalRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : getInitialRecords();
  } catch { return getInitialRecords(); }
}

export function saveRecords(records: PhysicalRecord[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(records));
}

export function loadRoutine(): RoutineCourse[] {
  try {
    const raw = localStorage.getItem(LS_ROUTINE_KEY);
    return raw ? JSON.parse(raw) : getInitialRoutine();
  } catch { return getInitialRoutine(); }
}

export function saveRoutine(list: RoutineCourse[]) {
  localStorage.setItem(LS_ROUTINE_KEY, JSON.stringify(list));
}
