// 實體教育訓練記錄 / 例行課程 共用資料存取
// 供「實體教育訓練記錄」頁面與「年度教育訓練計畫」/「副總儀表板」頁面（歷年成效查詢）共用，
// 統一存取 Supabase 中的訓練記錄與例行課程資料（含巢狀表單一～表單四），避免重複定義初始資料。

import { supabase } from './supabaseClient';

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
  /** CF-CM-HR-41：教育訓練申請/異動表（開課前15天提出） */
  application?: TrainingApplication;
  /** CF-CM-HR-40：教育訓練課程執行檢查表（開課前HR確認） */
  executionCheck?: PreClassCheck;
}

/** 簽核狀態（signature 為手寫簽名圖檔，base64 dataURL） */
export interface SignOff {
  applicant?: { name: string; date: string; signature?: string };
  deptManager?: { name: string; date: string; signature?: string };
  hr?: { name: string; date: string; signature?: string };
  vp?: { name: string; date: string; signature?: string };
}

/** 各簽核欄位指定簽核人之使用者 ID，建立表單時依部門主管/人資/副總自動指派，
 *  確保僅該特定人員可簽核該欄位（而非任何同角色人員皆可簽） */
export interface DesignatedSigners {
  applicant?: string;
  deptManager?: string;
  hr?: string;
  vp?: string;
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
  designatedSigners?: DesignatedSigners;
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

/** 異動申請名單中的一筆人員變動 */
export interface ParticipantChange {
  unit: string;
  employeeId: string;
  name: string;
  title: string;
  changeNote: string;
}

/** CF-CM-HR-41：教育訓練申請/異動表 */
export interface TrainingApplication {
  department: string;
  applyDate: string;
  applicantName: string;
  applicantTitle: string;
  employeeId: string;
  applicationType: '新增課程申請' | '課程內容異動' | '課程時數異動' | '課程取消' | '其他';
  applicationTypeOther: string;
  courseCategory: '新人訓練' | '專業訓練' | '管理訓練' | '內部分享' | '其他';
  courseCategoryOther: string;
  hostUnit: string;
  classMode: '實體課程' | '線上課程';
  changeReasons: {
    courseName: string;
    courseCategory: string;
    hours: string;
    instructor: string;
    classMode: string;
    cancellation: string;
    other: string;
  };
  expectedBenefit: string;
  costs: {
    courseCost: number;
    instructorFee: number;
    otherFee: number;
  };
  participants: ParticipantChange[];
  signOff: {
    approver?: { name: string; date: string; signature?: string };
    hrReview?: { name: string; date: string; signature?: string };
    deptManager?: { name: string; date: string; signature?: string };
    handler?: { name: string; date: string; signature?: string };
  };
  /** 各簽核欄位指定簽核人之使用者 ID（同 SignOff 註解說明） */
  designatedSigners?: {
    approver?: string;
    hrReview?: string;
    deptManager?: string;
    handler?: string;
  };
}

/** 檢查清單單一項目 */
export interface ChecklistItem {
  done: boolean;
  note: string;
}

/** CF-CM-HR-40：教育訓練課程執行檢查表 */
export interface PreClassCheck {
  preClass: {
    applicationForm: ChecklistItem;
    instructorConfirmed: ChecklistItem;
    instructorContract: ChecklistItem;
    syllabusMaterials: ChecklistItem;
    venueArranged: ChecklistItem;
    equipment: ChecklistItem;
    catering: ChecklistItem;
    transportLodging: ChecklistItem;
    studentsNotified: ChecklistItem;
    consentForm: ChecklistItem;
  };
  inClass: {
    onTime: ChecklistItem;
    signIn: ChecklistItem;
    equipmentWorking: ChecklistItem;
    followsSyllabus: ChecklistItem;
  };
  postClass: {
    signOut: ChecklistItem;
    satisfactionSurveyCollected: ChecklistItem;
    reportCollected: ChecklistItem;
    quizResultCollected: ChecklistItem;
    certificateSigned: ChecklistItem;
    resultsFiled: ChecklistItem;
    instructorFeeReceiptCollected: ChecklistItem;
    recordsArchived: ChecklistItem;
    documentsArchived: ChecklistItem;
  };
  signOff: {
    secretary?: { name: string; date: string; signature?: string };
    hrManager?: { name: string; date: string; signature?: string };
    handler?: { name: string; date: string; signature?: string };
  };
  /** 各簽核欄位指定簽核人之使用者 ID（同 SignOff 註解說明） */
  designatedSigners?: {
    hrManager?: string;
    handler?: string;
  };
}

export const TTQS_PHASES = [
  { value: 'Plan',   label: '計劃 (Plan)',   color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'Design', label: '設計 (Design)', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'Do',     label: '執行 (Do)',     color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'Review', label: '查核 (Review)', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'Action', label: '改善 (Action)', color: 'bg-orange-100 text-orange-700 border-orange-300' },
] as const;

function toNum(v: unknown): number {
  return typeof v === 'number' ? v : Number(v) || 0;
}

function mapRecordRow(row: Record<string, unknown>, photos: string[]): PhysicalRecord {
  return {
    id: row.id as string,
    courseName: row.course_name as string,
    trainingType: row.training_type as PhysicalRecord['trainingType'],
    date: (row.date as string) || '',
    hours: toNum(row.hours),
    venue: (row.venue as string) || '',
    instructor: (row.instructor as string) || '',
    department: (row.department as string) || '',
    participants: toNum(row.participants),
    ttqsPhase: row.ttqs_phase as PhysicalRecord['ttqsPhase'],
    outcome: (row.outcome as string) || '',
    evidence: (row.evidence as string) || '',
    status: row.status as PhysicalRecord['status'],
    photos,
    satisfactionScore: row.satisfaction_score != null ? toNum(row.satisfaction_score) : undefined,
    quizAvgScore: row.quiz_avg_score != null ? toNum(row.quiz_avg_score) : undefined,
    quizPassRate: row.quiz_pass_rate != null ? toNum(row.quiz_pass_rate) : undefined,
  };
}

function recordToRow(r: PhysicalRecord) {
  return {
    id: r.id,
    course_name: r.courseName,
    training_type: r.trainingType,
    date: r.date || null,
    hours: r.hours,
    venue: r.venue,
    instructor: r.instructor,
    department: r.department,
    participants: r.participants,
    ttqs_phase: r.ttqsPhase,
    outcome: r.outcome,
    evidence: r.evidence,
    status: r.status,
    satisfaction_score: r.satisfactionScore ?? null,
    quiz_avg_score: r.quizAvgScore ?? null,
    quiz_pass_rate: r.quizPassRate ?? null,
  };
}

export async function loadRecords(): Promise<PhysicalRecord[]> {
  const [{ data: records, error: recordsErr }, { data: photoRows, error: photosErr }] = await Promise.all([
    supabase.from('physical_records').select('*').order('created_at', { ascending: false }),
    supabase.from('physical_record_photos').select('*').order('sort_order', { ascending: true }),
  ]);
  if (recordsErr) throw recordsErr;
  if (photosErr) throw photosErr;
  return (records || []).map((row) => {
    const photos = (photoRows || [])
      .filter((p) => p.record_id === row.id)
      .map((p) => p.photo_url as string);
    return mapRecordRow(row as Record<string, unknown>, photos);
  });
}

export async function saveRecords(records: PhysicalRecord[]): Promise<void> {
  const ids = records.map((r) => r.id);
  const { data: existing, error: existingErr } = await supabase.from('physical_records').select('id');
  if (existingErr) throw existingErr;
  const toDelete = (existing || []).map((e) => e.id as string).filter((id) => !ids.includes(id));
  if (toDelete.length) {
    const { error } = await supabase.from('physical_records').delete().in('id', toDelete);
    if (error) throw error;
  }
  if (records.length) {
    const { error } = await supabase.from('physical_records').upsert(records.map(recordToRow));
    if (error) throw error;
  }
  if (ids.length) {
    const { error } = await supabase.from('physical_record_photos').delete().in('record_id', ids);
    if (error) throw error;
  }
  const photoRows = records.flatMap((r) =>
    (r.photos || []).map((url, idx) => ({ record_id: r.id, photo_url: url, sort_order: idx }))
  );
  if (photoRows.length) {
    const { error } = await supabase.from('physical_record_photos').insert(photoRows);
    if (error) throw error;
  }
}

function mapRoutineRow(
  row: Record<string, unknown>,
  photos: string[],
  design?: CourseDesign,
  effectiveness?: EffectivenessTracking,
  application?: TrainingApplication,
  executionCheck?: PreClassCheck
): RoutineCourse {
  return {
    id: row.id as string,
    courseName: row.course_name as string,
    instructor: (row.instructor as string) || '',
    date: (row.date as string) || '',
    hours: toNum(row.hours),
    department: (row.department as string) || '',
    participants: (row.participants as string[]) || [],
    outline: (row.outline as string) || '',
    status: row.status as RoutineCourse['status'],
    submittedBy: (row.submitted_by as string) || '',
    photos,
    design,
    effectiveness,
    application,
    executionCheck,
  };
}

function mapDesignRow(row: Record<string, unknown>): CourseDesign {
  return {
    category: row.category as CourseDesign['category'],
    targetAudience: (row.target_audience as string) || '',
    needSources: (row.need_sources as string[]) || [],
    purpose: (row.purpose as string) || '',
    competencies: (row.competencies as string[]) || [],
    syllabus: (row.syllabus as SyllabusUnit[]) || [],
    teachingMethods: (row.teaching_methods as string[]) || [],
    expectedBenefits: row.expected_benefits as CourseDesign['expectedBenefits'],
    signOff: (row.sign_off as SignOff) || {},
    designatedSigners: (row.designated_signers as DesignatedSigners) || {},
  };
}

function designToRow(routineCourseId: string, d: CourseDesign) {
  return {
    routine_course_id: routineCourseId,
    category: d.category,
    target_audience: d.targetAudience,
    need_sources: d.needSources,
    purpose: d.purpose,
    competencies: d.competencies,
    syllabus: d.syllabus,
    teaching_methods: d.teachingMethods,
    expected_benefits: d.expectedBenefits,
    sign_off: d.signOff,
    designated_signers: d.designatedSigners || {},
  };
}

function mapEffectivenessRow(row: Record<string, unknown>): EffectivenessTracking {
  return {
    trackingDate: (row.tracking_date as string) || '',
    learningOutcome: row.learning_outcome as EffectivenessTracking['learningOutcome'],
    managerEvaluation: row.manager_evaluation as EffectivenessTracking['managerEvaluation'],
    kpiBefore: row.kpi_before as EffectivenessTracking['kpiBefore'],
    kpiAfter30Days: row.kpi_after_30_days as EffectivenessTracking['kpiAfter30Days'],
    judgment: row.judgment as EffectivenessTracking['judgment'],
    suggestion: (row.suggestion as string) || '',
    filledBy: (row.filled_by as string) || '',
  };
}

function effectivenessToRow(routineCourseId: string, e: EffectivenessTracking) {
  return {
    routine_course_id: routineCourseId,
    tracking_date: e.trackingDate || null,
    learning_outcome: e.learningOutcome,
    manager_evaluation: e.managerEvaluation,
    kpi_before: e.kpiBefore,
    kpi_after_30_days: e.kpiAfter30Days,
    judgment: e.judgment,
    suggestion: e.suggestion,
    filled_by: e.filledBy,
  };
}

function mapApplicationRow(row: Record<string, unknown>): TrainingApplication {
  return {
    department: (row.department as string) || '',
    applyDate: (row.apply_date as string) || '',
    applicantName: (row.applicant_name as string) || '',
    applicantTitle: (row.applicant_title as string) || '',
    employeeId: (row.employee_id as string) || '',
    applicationType: row.application_type as TrainingApplication['applicationType'],
    applicationTypeOther: (row.application_type_other as string) || '',
    courseCategory: row.course_category as TrainingApplication['courseCategory'],
    courseCategoryOther: (row.course_category_other as string) || '',
    hostUnit: (row.host_unit as string) || '',
    classMode: row.class_mode as TrainingApplication['classMode'],
    changeReasons: row.change_reasons as TrainingApplication['changeReasons'],
    expectedBenefit: (row.expected_benefit as string) || '',
    costs: row.costs as TrainingApplication['costs'],
    participants: (row.participants as ParticipantChange[]) || [],
    signOff: (row.sign_off as TrainingApplication['signOff']) || {},
    designatedSigners: (row.designated_signers as TrainingApplication['designatedSigners']) || {},
  };
}

function applicationToRow(routineCourseId: string, a: TrainingApplication) {
  return {
    routine_course_id: routineCourseId,
    department: a.department,
    apply_date: a.applyDate || null,
    applicant_name: a.applicantName,
    applicant_title: a.applicantTitle,
    employee_id: a.employeeId,
    application_type: a.applicationType,
    application_type_other: a.applicationTypeOther,
    course_category: a.courseCategory,
    course_category_other: a.courseCategoryOther,
    host_unit: a.hostUnit,
    class_mode: a.classMode,
    change_reasons: a.changeReasons,
    expected_benefit: a.expectedBenefit,
    costs: a.costs,
    participants: a.participants,
    sign_off: a.signOff,
    designated_signers: a.designatedSigners || {},
  };
}

function mapCheckRow(row: Record<string, unknown>): PreClassCheck {
  return {
    preClass: row.pre_class as PreClassCheck['preClass'],
    inClass: row.in_class as PreClassCheck['inClass'],
    postClass: row.post_class as PreClassCheck['postClass'],
    signOff: (row.sign_off as PreClassCheck['signOff']) || {},
    designatedSigners: (row.designated_signers as PreClassCheck['designatedSigners']) || {},
  };
}

function checkToRow(routineCourseId: string, c: PreClassCheck) {
  return {
    routine_course_id: routineCourseId,
    pre_class: c.preClass,
    in_class: c.inClass,
    post_class: c.postClass,
    sign_off: c.signOff,
    designated_signers: c.designatedSigners || {},
  };
}

export async function loadRoutine(): Promise<RoutineCourse[]> {
  const [
    { data: routine, error: routineErr },
    { data: photoRows, error: photosErr },
    { data: designs, error: designsErr },
    { data: effectivenesses, error: effErr },
    { data: applications, error: appErr },
    { data: checks, error: checkErr },
  ] = await Promise.all([
    supabase.from('routine_courses').select('*').order('created_at', { ascending: false }),
    supabase.from('routine_course_photos').select('*').order('sort_order', { ascending: true }),
    supabase.from('course_designs').select('*'),
    supabase.from('effectiveness_trackings').select('*'),
    supabase.from('training_applications').select('*'),
    supabase.from('pre_class_checks').select('*'),
  ]);
  if (routineErr) throw routineErr;
  if (photosErr) throw photosErr;
  if (designsErr) throw designsErr;
  if (effErr) throw effErr;
  if (appErr) throw appErr;
  if (checkErr) throw checkErr;

  return (routine || []).map((row) => {
    const photos = (photoRows || [])
      .filter((p) => p.routine_course_id === row.id)
      .map((p) => p.photo_url as string);
    const design = (designs || []).find((d) => d.routine_course_id === row.id);
    const effectiveness = (effectivenesses || []).find((e) => e.routine_course_id === row.id);
    const application = (applications || []).find((a) => a.routine_course_id === row.id);
    const executionCheck = (checks || []).find((c) => c.routine_course_id === row.id);
    return mapRoutineRow(
      row as Record<string, unknown>,
      photos,
      design ? mapDesignRow(design as Record<string, unknown>) : undefined,
      effectiveness ? mapEffectivenessRow(effectiveness as Record<string, unknown>) : undefined,
      application ? mapApplicationRow(application as Record<string, unknown>) : undefined,
      executionCheck ? mapCheckRow(executionCheck as Record<string, unknown>) : undefined
    );
  });
}

export async function saveRoutine(list: RoutineCourse[]): Promise<void> {
  const ids = list.map((r) => r.id);
  const { data: existing, error: existingErr } = await supabase.from('routine_courses').select('id');
  if (existingErr) throw existingErr;
  const toDelete = (existing || []).map((e) => e.id as string).filter((id) => !ids.includes(id));
  if (toDelete.length) {
    const { error } = await supabase.from('routine_courses').delete().in('id', toDelete);
    if (error) throw error;
  }
  if (list.length) {
    const { error } = await supabase.from('routine_courses').upsert(
      list.map((r) => ({
        id: r.id,
        course_name: r.courseName,
        instructor: r.instructor,
        date: r.date || null,
        hours: r.hours,
        department: r.department,
        participants: r.participants,
        outline: r.outline,
        status: r.status,
        submitted_by: r.submittedBy,
      }))
    );
    if (error) throw error;
  }

  if (ids.length) {
    const { error } = await supabase.from('routine_course_photos').delete().in('routine_course_id', ids);
    if (error) throw error;
  }
  const photoRows = list.flatMap((r) =>
    (r.photos || []).map((url, idx) => ({ routine_course_id: r.id, photo_url: url, sort_order: idx }))
  );
  if (photoRows.length) {
    const { error } = await supabase.from('routine_course_photos').insert(photoRows);
    if (error) throw error;
  }

  const designs = list.filter((r) => r.design).map((r) => designToRow(r.id, r.design!));
  if (designs.length) {
    const { error } = await supabase.from('course_designs').upsert(designs, { onConflict: 'routine_course_id' });
    if (error) throw error;
  }
  const designMissingIds = list.filter((r) => !r.design).map((r) => r.id);
  if (designMissingIds.length) {
    await supabase.from('course_designs').delete().in('routine_course_id', designMissingIds);
  }

  const effectivenesses = list.filter((r) => r.effectiveness).map((r) => effectivenessToRow(r.id, r.effectiveness!));
  if (effectivenesses.length) {
    const { error } = await supabase
      .from('effectiveness_trackings')
      .upsert(effectivenesses, { onConflict: 'routine_course_id' });
    if (error) throw error;
  }
  const effMissingIds = list.filter((r) => !r.effectiveness).map((r) => r.id);
  if (effMissingIds.length) {
    await supabase.from('effectiveness_trackings').delete().in('routine_course_id', effMissingIds);
  }

  const applications = list.filter((r) => r.application).map((r) => applicationToRow(r.id, r.application!));
  if (applications.length) {
    const { error } = await supabase
      .from('training_applications')
      .upsert(applications, { onConflict: 'routine_course_id' });
    if (error) throw error;
  }
  const appMissingIds = list.filter((r) => !r.application).map((r) => r.id);
  if (appMissingIds.length) {
    await supabase.from('training_applications').delete().in('routine_course_id', appMissingIds);
  }

  const checks = list.filter((r) => r.executionCheck).map((r) => checkToRow(r.id, r.executionCheck!));
  if (checks.length) {
    const { error } = await supabase.from('pre_class_checks').upsert(checks, { onConflict: 'routine_course_id' });
    if (error) throw error;
  }
  const checkMissingIds = list.filter((r) => !r.executionCheck).map((r) => r.id);
  if (checkMissingIds.length) {
    await supabase.from('pre_class_checks').delete().in('routine_course_id', checkMissingIds);
  }
}
