// Supabase 資料庫 row 型別，欄位命名對應 supabase/schema.sql（snake_case）。
// 與 client/src/data/trainingMockData.ts 等檔案中既有的 camelCase 前端型別是兩套不同命名，
// 由 client/src/lib/*Storage.ts 中的轉換函式互相映射。

export type UserRole = 'employee' | 'manager' | 'admin' | 'hr' | 'vp';
export type UserStatus = 'active' | 'resigned';

export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string | null;
  manager_id: string | null;
  avatar: string | null;
  join_date: string | null;
  status: UserStatus;
  employee_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  instructor: string | null;
  duration: number | null;
  mandatory: boolean;
  thumbnail: string | null;
  passing_score: number | null;
  status: 'active' | 'inactive';
  video_id: string | null;
  local_video: boolean;
  local_presentation: boolean;
  presentation_name: string | null;
  video_transcript: string | null;
  external_video_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestionRow {
  id: string;
  course_id: string;
  question: string;
  options: string[];
  answer_index: number;
}

export interface QuizQuestionPublicRow {
  id: string;
  course_id: string;
  question: string;
  options: string[];
}

export interface CourseAssignmentRow {
  id: string;
  user_id: string;
  course_id: string;
  assigned_by: string | null;
  assigned_by_name: string | null;
  assigned_at: string;
  due_date: string | null;
  note: string | null;
}

export type EnrollmentStatus = 'in_progress' | 'pending_review' | 'completed' | 'rejected';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface EnrollmentRow {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  progress_percent: number;
  watch_time_minutes: number;
  enrolled_at: string;
  report_submitted: boolean;
  survey_submitted: boolean;
  quiz_submitted: boolean;
  quiz_score: number | null;
  review_status: ReviewStatus | null;
  certificate_issued: boolean;
  manager_comment: string | null;
  submitted_at: string | null;
  completed_at: string | null;
  report_content: string | null;
  survey_data: Record<string, number | string> | null;
  video_watched: boolean | null;
  manager_approved: boolean | null;
  hr_approved: boolean | null;
  manager_approved_at: string | null;
  hr_approved_at: string | null;
  manager_approved_by: string | null;
  hr_approved_by: string | null;
}

export interface DiscussionRow {
  id: string;
  course_id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

export type QuestionReportStatus = 'open' | 'resolved' | 'dismissed';

export interface QuestionReportRow {
  id: string;
  course_id: string;
  course_name: string | null;
  question_id: string;
  question_text: string | null;
  user_id: string;
  user_name: string | null;
  reason: string;
  comment: string | null;
  status: QuestionReportStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface FreeCourseRow {
  id: string;
  source: string | null;
  source_color: string | null;
  title: string;
  category: string | null;
  hours: number | null;
  langs: string[] | null;
  is_new: boolean;
  description: string | null;
  url: string | null;
  video_id: string | null;
  added_by: string | null;
  created_at: string;
}

export interface OrgUnitRow {
  id: string;
  name: string;
  parent_id: string | null;
  member_count: string | null;
}

export interface OrgMemberRow {
  id: string;
  org_unit_id: string;
  name: string;
  title: string;
  sort_order: number;
}

export interface OrgLeadershipRow {
  id: string;
  name: string;
  title: string;
  sort_order: number;
}

export interface JobTitleCategoryRow {
  id: string;
  title: string;
  category: string;
}

export interface PositionCompetencyFrameworkRow {
  position_name: string;
  category: string | null;
  level: string | null;
  required_level: number | null;
  competencies: unknown;
}

export interface EmployeeJobDescriptionRow {
  id: string;
  employee_name: string;
  user_id: string | null;
  position_name: string | null;
  department: string | null;
  job_summary: string | null;
  professional_skills: string[] | null;
  training_needs: string[] | null;
  competencies: unknown;
  standards: Record<string, number> | null;
  source_file_name: string | null;
  uploaded_at: string;
}

export interface PositionCompetencyOverrideRow {
  position_name: string;
  department: string | null;
  job_summary: string | null;
  competencies: unknown;
  standards: Record<string, number> | null;
  training_needs: string[] | null;
  source_file_name: string | null;
  updated_at: string;
}

export interface OrgSnapshotRow {
  id: string;
  month_label: string;
  created_date: string;
  created_by: string | null;
  leadership: unknown;
  units: unknown;
}

export interface InstructorRow {
  id: string;
  name: string;
  type: '內部' | '外部';
  title: string | null;
  department: string | null;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  certifications: string | null;
  total_courses: number | null;
}

export interface StudentRow {
  id: string;
  name: string;
  birthday: string | null;
  department: string | null;
  title: string | null;
  employee_id: string | null;
  join_date: string | null;
  email: string | null;
}

export interface AnnouncementRow {
  id: string;
  title: string;
  content: string;
  category: string | null;
  published_at: string;
  published_by: string | null;
  pinned: boolean;
  important: boolean;
  target_audience: '全體員工' | '主管以上' | '特定部門';
  target_dept: string | null;
  require_confirmation: boolean;
  expires_at: string | null;
  edit_history: unknown;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface AnnouncementReadRow {
  announcement_id: string;
  user_id: string;
  read_at: string;
}

export interface NotifCenterNotificationRow {
  id: string;
  type: 'deadline_reminder' | 'review_result' | 'new_course' | 'system';
  is_read: boolean;
  title: string;
  message: string;
  time: string | null;
  course: string | null;
  urgent: boolean;
}

export type TrainingType = '內訓' | '外訓';
export type TtqsPhase = 'Plan' | 'Design' | 'Do' | 'Review' | 'Action';
export type PhysicalRecordStatus = '待審核' | '已審核' | '已存檔';

export interface PhysicalRecordRow {
  id: string;
  course_name: string;
  training_type: TrainingType | null;
  date: string | null;
  hours: number | null;
  venue: string | null;
  instructor: string | null;
  department: string | null;
  participants: number | null;
  ttqs_phase: TtqsPhase | null;
  outcome: string | null;
  evidence: string | null;
  status: PhysicalRecordStatus | null;
  satisfaction_score: number | null;
  quiz_avg_score: number | null;
  quiz_pass_rate: number | null;
  created_by: string | null;
  created_at: string;
}

export interface PhysicalRecordPhotoRow {
  id: string;
  record_id: string;
  photo_url: string;
  sort_order: number;
}

export type RoutineCourseStatus = 'draft' | 'submitted' | 'approved' | 'completed';

export interface RoutineCourseRow {
  id: string;
  course_name: string;
  instructor: string | null;
  date: string | null;
  hours: number | null;
  department: string | null;
  participants: string[] | null;
  outline: string | null;
  status: RoutineCourseStatus;
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoutineCoursePhotoRow {
  id: string;
  routine_course_id: string;
  photo_url: string;
  sort_order: number;
}

export interface CourseDesignRow {
  id: string;
  routine_course_id: string;
  category: '新人' | '專業' | '管理' | '工安' | '其他' | null;
  target_audience: string | null;
  need_sources: string[] | null;
  purpose: string | null;
  competencies: string[] | null;
  syllabus: unknown;
  teaching_methods: string[] | null;
  expected_benefits: unknown;
  sign_off: Record<string, { name: string; date: string; signature?: string }>;
  designated_signers: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface EffectivenessTrackingRow {
  id: string;
  routine_course_id: string;
  tracking_date: string | null;
  learning_outcome: unknown;
  manager_evaluation: unknown;
  kpi_before: unknown;
  kpi_after_30_days: unknown;
  judgment: '成效顯著' | '符合預期' | '部分達成' | '需再訓練' | null;
  suggestion: string | null;
  filled_by: string | null;
  created_at: string;
}

export interface TrainingApplicationRow {
  id: string;
  routine_course_id: string;
  department: string | null;
  apply_date: string | null;
  applicant_name: string | null;
  applicant_title: string | null;
  employee_id: string | null;
  application_type: string | null;
  application_type_other: string | null;
  course_category: string | null;
  course_category_other: string | null;
  host_unit: string | null;
  class_mode: '實體課程' | '線上課程' | null;
  change_reasons: unknown;
  expected_benefit: string | null;
  costs: unknown;
  participants: unknown;
  sign_off: Record<string, { name: string; date: string; signature?: string }>;
  designated_signers: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface PreClassCheckRow {
  id: string;
  routine_course_id: string;
  pre_class: unknown;
  in_class: unknown;
  post_class: unknown;
  sign_off: Record<string, { name: string; date: string; signature?: string }>;
  designated_signers: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export type FeeAgreementStatus = 'pending_sign' | 'signed' | 'archived';

export interface FeeAgreementRow {
  id: string;
  recipient_user_id: string | null;
  employee_name: string;
  employee_id: string | null;
  join_date: string | null;
  department: string | null;
  title: string | null;
  grade: string | null;
  service_years: string | null;
  course_name: string | null;
  training_type: '外部訓練' | '內部訓練' | null;
  institution: string | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  total_fee: number | null;
  before_service_yrs: number | null;
  before_service_mons: number | null;
  added_service_yrs: number | null;
  added_service_mons: number | null;
  after_service_yrs: number | null;
  after_service_mons: number | null;
  sent_at: string;
  sent_by: string | null;
  status: FeeAgreementStatus;
  signed_at: string | null;
  signature_image: string | null;
  id_number: string | null;
  address: string | null;
  phone: string | null;
  sign_off: Record<string, { name: string; date: string; comment?: string }>;
  designated_signers: Record<string, string>;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  user_name: string | null;
  action: string;
  target: string | null;
  details: string | null;
  created_at: string;
}

export interface CareerGoalRow {
  id: string;
  employee_id: string;
  employee_name: string;
  target_position: string;
  target_date: string;
  motivation: string;
  status: 'proposed' | 'approved' | 'rejected' | 'revised';
  manager_comment: string;
  manager_id: string | null;
  manager_name: string | null;
  proposed_at: string;
  reviewed_at: string | null;
}

export interface RotationAssessmentRow {
  id: string;
  employee_id: string;
  employee_name: string;
  target_dept: string;
  answers: Record<string, number>;
  score: number;
  recommendation: string;
  level: 'excellent' | 'good' | 'warn' | 'no';
  courses: string[];
  submitted_at: string;
  sent_to_manager: boolean;
  sent_at: string | null;
  manager_comment: string;
}

export interface AnnualSignoffRow {
  year: string;
  hr_submitted_at: string | null;
  vp_approved: boolean;
  vp_approved_at: string | null;
  vp_comment: string;
  gm_approved: boolean;
  gm_approved_at: string | null;
  gm_comment: string;
  sign_off: Record<string, { name: string; date: string; comment?: string }>;
  designated_signers: Record<string, string>;
}

export interface PlanSubmissionRow {
  id: string;
  year: string;
  department: string;
  status: '草稿' | '提交' | '核准';
  submitted_at: string | null;
  sign_off: Record<string, { name: string; date: string; comment?: string }>;
  designated_signers: Record<string, string>;
}

export interface VarianceEntryRow {
  id: number;
  year: string;
  department: string;
  category: string;
  course_name: string;
  planned_hours: number;
  actual_hours: number;
  planned_count: number;
  actual_count: number;
  planned_month: string | null;
  actual_month: string | null;
  attendance_rate: number;
  judgment: string;
  actual_date: string | null;
  instructor: string | null;
  variance_method: boolean;
  variance_hours: boolean;
  variance_count: boolean;
  variance_not_held: boolean;
  variance_other: boolean;
  variance_other_note: string;
  planned_cost: number;
  actual_cost: number;
  diff_reason: string;
  improvement: string;
}

export interface VarianceSignoffRow {
  id: true;
  gm_name: string;
  gm_date: string;
  admin_name: string;
  admin_date: string;
  applicant_unit: string;
}

export interface TrainingRoiInputsRow {
  id: true;
  training_cost: number;
  quality_loss_reduction: number;
  safety_improvement_savings: number;
  efficiency_gains: number;
}

export interface AnnualPlanRowRow {
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

export interface AnnualPlanCourseTrackRow {
  name: string;
  planned: number;
  actual: number;
  rate: number;
  participants: number;
  status: string;
}

export interface AchievementRedeemItemRow {
  id: string;
  name: string;
  icon: string;
  points: number;
  stock: number;
  desc: string;
}

export interface AchievementRedeemRecordRow {
  id: string;
  user_id: string;
  item_id: string;
  item_name: string;
  item_icon: string;
  points: number;
  status: 'pending' | 'approved' | 'cancelled';
  redeemed_at: string;
}

export interface AchievementPointsRow {
  user_id: string;
  available_points: number;
}

export interface AdminRoutineCourseRow {
  id: string;
  course_name: string;
  instructor: string;
  date: string;
  hours: number;
  department: string;
  participants: string[];
  outline: string;
  status: 'draft' | 'pending_hr' | 'hr_approved' | 'sign_in_sent' | 'completed';
  submitted_by: string;
  submitted_at: string;
  hr_comment: string | null;
  signed_participants: string[] | null;
  survey_count: number | null;
}

export interface PermissionMatrixRow {
  id: true;
  matrix: Record<string, Record<string, boolean>>;
}

export interface PerfL3RecordRow {
  id: string;
  enrollment_id: string;
  user_id: string;
  course_id: string;
  course_name: string;
  user_name: string;
  quarter: string;
  application_content: string;
  confirmed_at: string | null;
  status: string;
  kpi_note: string;
  due_date: string | null;
  attachments: { id: string; name: string; dataUrl: string }[] | null;
  submitted_at: string | null;
  manager_approval: { by: string; at: string; decision: 'approved' | 'rejected'; comment?: string } | null;
  dept_head_approval: { by: string; at: string; decision: 'approved' | 'rejected'; comment?: string } | null;
}

export interface PerfL4CampaignRow {
  id: string;
  course_id: string;
  course_name: string;
  department: string;
  kpi_type: string;
  unit: string;
  baseline_value: number;
  target_value: number;
  higher_is_better: boolean;
  entries: { quarter: string; actualValue: number; note?: string; reportedBy: string; reportedAt: string }[];
  created_by: string;
  created_at: string;
}
