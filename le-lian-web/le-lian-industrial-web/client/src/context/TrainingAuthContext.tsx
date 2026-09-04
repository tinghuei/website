import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { deleteCourseVideo } from '../lib/videoStorage';
import { deletePresentationFile } from '../lib/presentationStorage';
import type {
  User,
  Course,
  QuizQuestion,
  Enrollment,
  Discussion,
  Notification,
  AuditLog,
  CourseAssignment,
  QuestionReport,
  FreeCourse,
} from '../data/trainingMockData';
import type {
  ProfileRow,
  CourseRow,
  QuizQuestionRow,
  EnrollmentRow,
  DiscussionRow,
  NotificationRow,
  AuditLogRow,
  CourseAssignmentRow,
  QuestionReportRow,
  FreeCourseRow,
} from '../types/database';

// ============================================================================
// Row → 前端型別映射（snake_case ↔ camelCase）
// ============================================================================

function mapProfile(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: '',
    role: row.role,
    department: row.department || '',
    managerId: row.manager_id || undefined,
    avatar: row.avatar || row.name.slice(0, 1),
    joinDate: row.join_date || '',
    status: row.status,
    employeeId: row.employee_id || undefined,
    title: row.title || undefined,
  };
}

function mapCourse(row: CourseRow, quizQuestions: QuizQuestion[]): Course {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: row.category || '',
    instructor: row.instructor || '',
    duration: row.duration || 0,
    mandatory: row.mandatory,
    thumbnail: row.thumbnail || 'bg-blue-500',
    passingScore: row.passing_score ?? 70,
    status: row.status,
    createdAt: (row.created_at || '').split('T')[0],
    quizQuestions,
    videoId: row.video_id || undefined,
    localVideo: row.local_video,
    localPresentation: row.local_presentation,
    presentationName: row.presentation_name || undefined,
    videoTranscript: row.video_transcript || undefined,
    externalVideoUrl: row.external_video_url || undefined,
  };
}

function mapQuizQuestionFull(row: QuizQuestionRow): QuizQuestion {
  return { id: row.id, question: row.question, options: row.options, answerIndex: row.answer_index };
}

function mapEnrollment(row: EnrollmentRow): Enrollment {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    status: row.status,
    progressPercent: row.progress_percent,
    watchTimeMinutes: row.watch_time_minutes,
    enrolledAt: (row.enrolled_at || '').split('T')[0],
    reportSubmitted: row.report_submitted,
    surveySubmitted: row.survey_submitted,
    quizSubmitted: row.quiz_submitted,
    quizScore: row.quiz_score,
    reviewStatus: row.review_status,
    certificateIssued: row.certificate_issued,
    managerComment: row.manager_comment,
    submittedAt: row.submitted_at || undefined,
    completedAt: row.completed_at || undefined,
    reportContent: row.report_content || undefined,
    surveyData: row.survey_data || undefined,
    videoWatched: row.video_watched ?? undefined,
    managerApproved: row.manager_approved ?? undefined,
    hrApproved: row.hr_approved ?? undefined,
    managerApprovedAt: row.manager_approved_at || undefined,
    hrApprovedAt: row.hr_approved_at || undefined,
    managerApprovedBy: row.manager_approved_by || undefined,
    hrApprovedBy: row.hr_approved_by || undefined,
  };
}

function mapDiscussion(row: DiscussionRow): Discussion {
  return {
    id: row.id,
    courseId: row.course_id,
    userId: row.user_id,
    userName: row.user_name,
    message: row.message,
    timestamp: new Date(row.created_at).toLocaleString('zh-TW'),
  };
}

function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    message: row.message,
    read: row.read,
    createdAt: new Date(row.created_at).toLocaleString('zh-TW'),
  };
}

function mapAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    userId: row.user_id || '',
    userName: row.user_name || 'Unknown',
    action: row.action,
    target: row.target || '',
    details: row.details || '',
    timestamp: new Date(row.created_at).toLocaleString('zh-TW'),
  };
}

function mapAssignment(row: CourseAssignmentRow): CourseAssignment {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    assignedBy: row.assigned_by || '',
    assignedByName: row.assigned_by_name || '',
    assignedAt: (row.assigned_at || '').split('T')[0],
    dueDate: row.due_date || undefined,
    note: row.note || undefined,
  };
}

function mapQuestionReport(row: QuestionReportRow): QuestionReport {
  return {
    id: row.id,
    courseId: row.course_id,
    courseName: row.course_name || '',
    questionId: row.question_id,
    questionText: row.question_text || '',
    userId: row.user_id,
    userName: row.user_name || '',
    reason: row.reason,
    comment: row.comment || undefined,
    createdAt: new Date(row.created_at).toLocaleString('zh-TW'),
    status: row.status,
    resolvedBy: row.resolved_by || undefined,
    resolvedAt: row.resolved_at ? new Date(row.resolved_at).toLocaleString('zh-TW') : undefined,
  };
}

function mapFreeCourse(row: FreeCourseRow, addedByName?: string): FreeCourse {
  return {
    id: row.id,
    source: row.source || '',
    sourceColor: row.source_color || 'bg-gray-500',
    title: row.title,
    category: row.category || '',
    hours: row.hours || 0,
    langs: row.langs || [],
    isNew: row.is_new,
    desc: row.description || '',
    url: row.url || '',
    videoId: row.video_id || undefined,
    addedBy: addedByName,
  };
}

const today = () => new Date().toISOString().split('T')[0];

interface TrainingAuthContextValue {
  currentUser: User | null;
  authLoading: boolean;
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  discussions: Discussion[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  assignments: CourseAssignment[];
  questionReports: QuestionReport[];
  customFreeCourses: FreeCourse[];
  login: (email: string, password: string) => Promise<User | null>;
  register: (
    email: string,
    password: string,
    name: string,
    department: string
  ) => Promise<{ user: User | null; pendingConfirmation: boolean; error?: string }>;
  logout: () => Promise<void>;
  getEnrollmentForUser: (userId: string, courseId: string) => Enrollment | undefined;
  getUserEnrollments: (userId: string) => Enrollment[];
  enrollInCourse: (userId: string, courseId: string) => Promise<Enrollment>;
  updateEnrollment: (enrollmentId: string, updates: Partial<Enrollment>) => Promise<void>;
  submitReport: (enrollmentId: string, reportContent: string, surveyData: Record<string, number | string>) => Promise<void>;
  submitQuiz: (enrollmentId: string, courseId: string, answers: Record<string, number>) => Promise<number>;
  getQuizAnswerKey: (courseId: string) => Promise<Record<string, number>>;
  checkAndSetPendingReview: (enrollmentId: string) => Promise<void>;
  approveEnrollment: (enrollmentId: string, comment?: string) => Promise<void>;
  rejectEnrollment: (enrollmentId: string, comment: string) => Promise<void>;
  approveAsManager: (enrollmentId: string, comment?: string) => Promise<void>;
  approveAsHR: (enrollmentId: string, comment?: string) => Promise<void>;
  addDiscussion: (courseId: string, userId: string, userName: string, message: string) => Promise<void>;
  addNotification: (userId: string, type: string, message: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: (userId: string) => Promise<void>;
  addCourse: (courseData: Partial<Course>) => Promise<Course>;
  updateCourse: (courseId: string, updates: Partial<Course>) => Promise<void>;
  toggleCourseStatus: (courseId: string) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  getPendingReviews: () => Enrollment[];
  getUserNotifications: (userId: string) => Notification[];
  getCourseDiscussions: (courseId: string) => Discussion[];
  setUserRole: (userId: string, role: User['role']) => Promise<void>;
  setUserManager: (userId: string, managerId: string | null) => Promise<void>;
  addUser: (userData: { name: string; email: string; department: string; role: User['role'] }) => Promise<void>;
  setUserStatus: (userId: string, status: 'active' | 'resigned') => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateMyProfile: (updates: { employeeId?: string; name?: string; department?: string; title?: string }) => Promise<void>;
  updateUserProfile: (userId: string, updates: { name?: string; employeeId?: string; department?: string; title?: string; joinDate?: string }) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  addAuditLog: (userId: string, action: string, target: string, details: string) => Promise<void>;
  clearAuditLogsByActions: (actions: string[]) => Promise<void>;
  assignCourse: (userId: string, courseId: string, dueDate?: string, note?: string) => Promise<CourseAssignment>;
  revokeAssignment: (assignmentId: string) => Promise<void>;
  getAssignmentsForUser: (userId: string) => CourseAssignment[];
  getAssignmentsForCourse: (courseId: string) => CourseAssignment[];
  reportQuizQuestion: (courseId: string, questionId: string, questionText: string, reason: string, comment?: string) => Promise<void>;
  resolveQuestionReport: (reportId: string, status: 'resolved' | 'dismissed') => Promise<void>;
  addFreeCourse: (courseData: Omit<FreeCourse, 'id'>) => Promise<FreeCourse>;
  removeFreeCourse: (courseId: string) => Promise<void>;
}

const TrainingAuthContext = createContext<TrainingAuthContextValue | null>(null);

export function TrainingAuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [questionReports, setQuestionReports] = useState<QuestionReport[]>([]);
  const [customFreeCourses, setCustomFreeCourses] = useState<FreeCourse[]>([]);

  // ── 載入課程的測驗題目：admin/hr 直接查全表（含正解），其他角色透過
  // get_quiz_questions RPC 逐課程取得（不含正解，避免外洩到前端）。
  async function loadQuizQuestions(courseIds: string[], role: User['role']): Promise<Record<string, QuizQuestion[]>> {
    const byCourseId: Record<string, QuizQuestion[]> = {};
    if (courseIds.length === 0) return byCourseId;
    if (role === 'admin' || role === 'hr') {
      const { data } = await supabase.from('quiz_questions').select('*').in('course_id', courseIds);
      for (const row of (data as QuizQuestionRow[] | null) || []) {
        const q = mapQuizQuestionFull(row);
        (byCourseId[row.course_id] ||= []).push(q);
      }
    } else {
      await Promise.all(
        courseIds.map(async (courseId) => {
          const { data } = await supabase.rpc('get_quiz_questions', { p_course_id: courseId });
          byCourseId[courseId] = ((data as { id: string; question: string; options: string[] }[] | null) || []).map((q) => ({
            id: q.id,
            question: q.question,
            options: q.options,
          }));
        })
      );
    }
    return byCourseId;
  }

  async function loadCourses(role: User['role']): Promise<Course[]> {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    const rows = (data as CourseRow[] | null) || [];
    const quizByCourseId = await loadQuizQuestions(rows.map((r) => r.id), role);
    return rows.map((row) => mapCourse(row, quizByCourseId[row.id] || []));
  }

  async function loadAllData(user: User) {
    const [
      usersRes,
      coursesData,
      enrollmentsRes,
      discussionsRes,
      notificationsRes,
      auditLogsRes,
      assignmentsRes,
      questionReportsRes,
      freeCoursesRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*'),
      loadCourses(user.role),
      supabase.from('enrollments').select('*'),
      supabase.from('discussions').select('*').order('created_at', { ascending: true }),
      supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }),
      supabase.from('course_assignments').select('*'),
      supabase.from('question_reports').select('*').order('created_at', { ascending: false }),
      supabase.from('free_courses').select('*').order('created_at', { ascending: false }),
    ]);

    const usersList = ((usersRes.data as ProfileRow[] | null) || []).map(mapProfile);
    setUsers(usersList);
    setCourses(coursesData);
    setEnrollments(((enrollmentsRes.data as EnrollmentRow[] | null) || []).map(mapEnrollment));
    setDiscussions(((discussionsRes.data as DiscussionRow[] | null) || []).map(mapDiscussion));
    setNotifications(((notificationsRes.data as NotificationRow[] | null) || []).map(mapNotification));
    setAuditLogs(((auditLogsRes.data as AuditLogRow[] | null) || []).map(mapAuditLog));
    setAssignments(((assignmentsRes.data as CourseAssignmentRow[] | null) || []).map(mapAssignment));
    setQuestionReports(((questionReportsRes.data as QuestionReportRow[] | null) || []).map(mapQuestionReport));
    const nameById = new Map(usersList.map((u) => [u.id, u.name]));
    setCustomFreeCourses(
      ((freeCoursesRes.data as FreeCourseRow[] | null) || []).map((row) =>
        mapFreeCourse(row, row.added_by ? nameById.get(row.added_by) : undefined)
      )
    );
  }

  function clearAllData() {
    setUsers([]);
    setCourses([]);
    setEnrollments([]);
    setDiscussions([]);
    setNotifications([]);
    setAuditLogs([]);
    setAssignments([]);
    setQuestionReports([]);
    setCustomFreeCourses([]);
  }

  async function fetchProfile(userId: string): Promise<ProfileRow | null> {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    return (data as ProfileRow | null) || null;
  }

  // ── 還原既有登入狀態（重新整理頁面後不應被踢回登入頁）
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;
      if (sessionUser) {
        const profile = await fetchProfile(sessionUser.id);
        if (!mounted) return;
        if (profile && profile.status !== 'resigned') {
          const user = mapProfile(profile);
          setCurrentUser(user);
          await loadAllData(user);
        } else {
          await supabase.auth.signOut();
        }
      }
      if (mounted) setAuthLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        clearAllData();
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return null;
    const profile = await fetchProfile(data.user.id);
    if (!profile || profile.status === 'resigned') {
      await supabase.auth.signOut();
      return null;
    }
    const user = mapProfile(profile);
    setCurrentUser(user);
    await loadAllData(user);
    return user;
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    department: string
  ): Promise<{ user: User | null; pendingConfirmation: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, department } },
    });
    if (error) return { user: null, pendingConfirmation: false, error: error.message };
    if (!data.user) return { user: null, pendingConfirmation: false, error: '註冊失敗，請再試一次。' };
    if (!data.session) {
      // 信箱驗證機制已啟用，需等使用者點擊驗證信中的連結後才能登入
      return { user: null, pendingConfirmation: true };
    }
    const profile = await fetchProfile(data.user.id);
    if (!profile) return { user: null, pendingConfirmation: false, error: '帳號建立後讀取個人資料失敗，請重新整理頁面再試。' };
    const user = mapProfile(profile);
    setCurrentUser(user);
    await loadAllData(user);
    return { user, pendingConfirmation: false };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    clearAllData();
  };

  const getEnrollmentForUser = (userId: string, courseId: string) => {
    return enrollments.find((e) => e.userId === userId && e.courseId === courseId);
  };

  const getUserEnrollments = (userId: string) => {
    return enrollments.filter((e) => e.userId === userId);
  };

  const addAuditLog = async (userId: string, action: string, target: string, details: string) => {
    const user = users.find((u) => u.id === userId);
    const { data } = await supabase
      .from('audit_logs')
      .insert({ user_id: userId, user_name: user?.name || 'Unknown', action, target, details })
      .select()
      .single();
    if (data) setAuditLogs((prev) => [mapAuditLog(data as AuditLogRow), ...prev]);
  };

  const clearAuditLogsByActions = async (actions: string[]) => {
    await supabase.from('audit_logs').delete().in('action', actions);
    setAuditLogs((prev) => prev.filter((l) => !actions.includes(l.action)));
  };

  const addNotification = async (userId: string, type: string, message: string) => {
    const { data } = await supabase
      .from('notifications')
      .insert({ user_id: userId, type, message, read: false })
      .select()
      .single();
    if (data && userId === currentUser?.id) {
      setNotifications((prev) => [mapNotification(data as NotificationRow), ...prev]);
    }
  };

  const enrollInCourse = async (userId: string, courseId: string): Promise<Enrollment> => {
    const existing = getEnrollmentForUser(userId, courseId);
    if (existing) return existing;
    const { data, error } = await supabase
      .from('enrollments')
      .insert({ user_id: userId, course_id: courseId })
      .select()
      .single();
    if (error || !data) throw error || new Error('報名失敗');
    const enrollment = mapEnrollment(data as EnrollmentRow);
    setEnrollments((prev) => [...prev, enrollment]);
    await addAuditLog(userId, '完成課程報名', courseId, '員工自主報名課程');
    return enrollment;
  };

  function enrollmentUpdatesToRow(updates: Partial<Enrollment>): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.progressPercent !== undefined) row.progress_percent = updates.progressPercent;
    if (updates.watchTimeMinutes !== undefined) row.watch_time_minutes = updates.watchTimeMinutes;
    if (updates.reportSubmitted !== undefined) row.report_submitted = updates.reportSubmitted;
    if (updates.surveySubmitted !== undefined) row.survey_submitted = updates.surveySubmitted;
    if (updates.quizSubmitted !== undefined) row.quiz_submitted = updates.quizSubmitted;
    if (updates.quizScore !== undefined) row.quiz_score = updates.quizScore;
    if (updates.reviewStatus !== undefined) row.review_status = updates.reviewStatus;
    if (updates.certificateIssued !== undefined) row.certificate_issued = updates.certificateIssued;
    if (updates.managerComment !== undefined) row.manager_comment = updates.managerComment;
    if (updates.submittedAt !== undefined) row.submitted_at = updates.submittedAt;
    if (updates.completedAt !== undefined) row.completed_at = updates.completedAt;
    if (updates.reportContent !== undefined) row.report_content = updates.reportContent;
    if (updates.surveyData !== undefined) row.survey_data = updates.surveyData;
    if (updates.videoWatched !== undefined) row.video_watched = updates.videoWatched;
    if (updates.managerApproved !== undefined) row.manager_approved = updates.managerApproved;
    if (updates.hrApproved !== undefined) row.hr_approved = updates.hrApproved;
    if (updates.managerApprovedAt !== undefined) row.manager_approved_at = updates.managerApprovedAt;
    if (updates.hrApprovedAt !== undefined) row.hr_approved_at = updates.hrApprovedAt;
    if (updates.managerApprovedBy !== undefined) row.manager_approved_by = updates.managerApprovedBy;
    if (updates.hrApprovedBy !== undefined) row.hr_approved_by = updates.hrApprovedBy;
    return row;
  }

  const updateEnrollment = async (enrollmentId: string, updates: Partial<Enrollment>) => {
    const row = enrollmentUpdatesToRow(updates);
    const { error } = await supabase.from('enrollments').update(row).eq('id', enrollmentId);
    if (error) throw error;
    setEnrollments((prev) => prev.map((e) => (e.id === enrollmentId ? { ...e, ...updates } : e)));
  };

  const submitReport = async (
    enrollmentId: string,
    reportContent: string,
    surveyData: Record<string, number | string>
  ) => {
    await updateEnrollment(enrollmentId, {
      reportSubmitted: !!reportContent,
      surveySubmitted: !!surveyData,
      reportContent,
      surveyData,
    });
    const enr = enrollments.find((e) => e.id === enrollmentId);
    if (enr) {
      await addAuditLog(enr.userId, '提交心得報告', enr.courseId, '員工提交訓練心得報告及滿意度調查');
    }
  };

  // 測驗評分改由後端 grade_quiz() RPC 計算，前端不再持有/比對正解，避免正解外洩
  const submitQuiz = async (enrollmentId: string, courseId: string, answers: Record<string, number>): Promise<number> => {
    const payload = Object.entries(answers).map(([questionId, answerIndex]) => ({ questionId, answerIndex }));
    const { data: score, error } = await supabase.rpc('grade_quiz', { p_course_id: courseId, p_answers: payload });
    if (error) throw error;
    const finalScore = Number(score) || 0;
    await updateEnrollment(enrollmentId, { quizSubmitted: true, quizScore: finalScore });
    const enr = enrollments.find((e) => e.id === enrollmentId);
    const course = courses.find((c) => c.id === courseId);
    const passed = course ? finalScore >= course.passingScore : finalScore >= 70;
    if (enr) {
      await addAuditLog(enr.userId, '提交測驗', enr.courseId, `測驗成績：${finalScore}分，${passed ? '通過' : '未通過'}`);
    }
    return finalScore;
  };

  // 繳卷後才允許查看正解，供「答題結果檢討」畫面使用
  const getQuizAnswerKey = async (courseId: string): Promise<Record<string, number>> => {
    const { data } = await supabase.rpc('get_quiz_answer_key', { p_course_id: courseId });
    const key: Record<string, number> = {};
    for (const row of (data as { id: string; answer_index: number }[] | null) || []) {
      key[row.id] = row.answer_index;
    }
    return key;
  };

  const checkAndSetPendingReview = async (enrollmentId: string) => {
    const enr = enrollments.find((e) => e.id === enrollmentId);
    if (enr && enr.reportSubmitted && enr.surveySubmitted && enr.quizSubmitted) {
      await updateEnrollment(enrollmentId, {
        status: 'pending_review',
        reviewStatus: 'pending',
        submittedAt: today(),
      });
    }
  };

  const approveEnrollment = async (enrollmentId: string, comment?: string) => {
    await updateEnrollment(enrollmentId, {
      status: 'completed',
      reviewStatus: 'approved',
      certificateIssued: true,
      managerComment: comment || null,
      completedAt: today(),
      managerApproved: true,
      hrApproved: true,
    });
    const enr = enrollments.find((e) => e.id === enrollmentId);
    if (enr) {
      await addAuditLog(currentUser?.id || '', '審核通過', enr.courseId, `已核發結業證書${comment ? '，備註：' + comment : ''}`);
      await addNotification(enr.userId, 'review_approved', `您的課程已通過審核，證書已核發！`);
    }
  };

  const approveAsManager = async (enrollmentId: string, comment?: string) => {
    const enr = enrollments.find((e) => e.id === enrollmentId);
    if (!enr) return;
    const now = today();
    const updates: Partial<Enrollment> = {
      managerApproved: true,
      managerApprovedAt: now,
      managerApprovedBy: currentUser?.id,
      managerComment: comment || null,
    };
    if (enr.hrApproved) {
      updates.status = 'completed';
      updates.reviewStatus = 'approved';
      updates.certificateIssued = true;
      updates.completedAt = now;
      await addNotification(enr.userId, 'review_approved', `您的課程已通過主管及人資雙重審核，結業證書已核發！`);
      await addAuditLog(currentUser?.id || '', '主管審核通過（雙重審核完成）', enr.courseId, `已核發結業證書`);
    } else {
      await addNotification(enr.userId, 'review_pending', `您的課程已通過主管審核，待人資確認後即可取得證書。`);
      await addAuditLog(currentUser?.id || '', '主管審核通過', enr.courseId, `等待人資審核`);
    }
    await updateEnrollment(enrollmentId, updates);
  };

  const approveAsHR = async (enrollmentId: string, comment?: string) => {
    const enr = enrollments.find((e) => e.id === enrollmentId);
    if (!enr) return;
    const now = today();
    const updates: Partial<Enrollment> = {
      hrApproved: true,
      hrApprovedAt: now,
      hrApprovedBy: currentUser?.id,
    };
    if (enr.managerApproved) {
      updates.status = 'completed';
      updates.reviewStatus = 'approved';
      updates.certificateIssued = true;
      updates.completedAt = now;
      await addNotification(enr.userId, 'review_approved', `您的課程已通過主管及人資雙重審核，結業證書已核發！`);
      await addAuditLog(currentUser?.id || '', '人資審核通過（雙重審核完成）', enr.courseId, `已核發結業證書${comment ? '，備註：' + comment : ''}`);
    } else {
      await addNotification(enr.userId, 'review_pending', `您的課程已通過人資確認，待主管審核後即可取得證書。`);
      await addAuditLog(currentUser?.id || '', '人資審核通過', enr.courseId, `等待主管審核`);
    }
    await updateEnrollment(enrollmentId, updates);
  };

  const rejectEnrollment = async (enrollmentId: string, comment: string) => {
    await updateEnrollment(enrollmentId, {
      status: 'rejected',
      reviewStatus: 'rejected',
      managerComment: comment,
    });
    const enr = enrollments.find((e) => e.id === enrollmentId);
    if (enr) {
      await addAuditLog(currentUser?.id || '', '審核退回', enr.courseId, `退回原因：${comment}`);
      await addNotification(enr.userId, 'review_rejected', `您的課程審核未通過，請查看主管意見後重新提交。`);
    }
  };

  const addDiscussion = async (courseId: string, userId: string, userName: string, message: string) => {
    const { data } = await supabase
      .from('discussions')
      .insert({ course_id: courseId, user_id: userId, user_name: userName, message })
      .select()
      .single();
    if (data) setDiscussions((prev) => [...prev, mapDiscussion(data as DiscussionRow)]);
  };

  const markNotificationRead = async (notificationId: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = async (userId: string) => {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
    setNotifications((prev) => prev.map((n) => (n.userId === userId ? { ...n, read: true } : n)));
  };

  const addCourse = async (courseData: Partial<Course>): Promise<Course> => {
    const id = crypto.randomUUID();
    const { data, error } = await supabase
      .from('courses')
      .insert({
        id,
        title: courseData.title || '',
        description: courseData.description || '',
        category: courseData.category || '',
        instructor: courseData.instructor || '',
        duration: courseData.duration || 60,
        mandatory: courseData.mandatory || false,
        thumbnail: courseData.thumbnail || 'bg-blue-500',
        passing_score: courseData.passingScore || 70,
        status: 'active',
        video_id: courseData.videoId,
        local_video: courseData.localVideo || false,
        local_presentation: courseData.localPresentation || false,
        presentation_name: courseData.presentationName,
        video_transcript: courseData.videoTranscript,
        external_video_url: courseData.externalVideoUrl,
      })
      .select()
      .single();
    if (error || !data) throw error || new Error('新增課程失敗');

    const questions = courseData.quizQuestions || [];
    if (questions.length > 0) {
      await supabase.from('quiz_questions').insert(
        questions.map((q) => ({
          id: q.id && q.id.length > 8 ? q.id : crypto.randomUUID(),
          course_id: id,
          question: q.question,
          options: q.options,
          answer_index: q.answerIndex ?? 0,
        }))
      );
    }

    const newCourse = mapCourse(data as CourseRow, questions);
    setCourses((prev) => [newCourse, ...prev]);
    await addAuditLog(currentUser?.id || '', '新增課程', courseData.title || '', 'AI 自動生成課程內容及測驗題目');
    return newCourse;
  };

  function courseUpdatesToRow(updates: Partial<Course>): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.description !== undefined) row.description = updates.description;
    if (updates.category !== undefined) row.category = updates.category;
    if (updates.instructor !== undefined) row.instructor = updates.instructor;
    if (updates.duration !== undefined) row.duration = updates.duration;
    if (updates.mandatory !== undefined) row.mandatory = updates.mandatory;
    if (updates.thumbnail !== undefined) row.thumbnail = updates.thumbnail;
    if (updates.passingScore !== undefined) row.passing_score = updates.passingScore;
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.videoId !== undefined) row.video_id = updates.videoId;
    if (updates.localVideo !== undefined) row.local_video = updates.localVideo;
    if (updates.localPresentation !== undefined) row.local_presentation = updates.localPresentation;
    if (updates.presentationName !== undefined) row.presentation_name = updates.presentationName;
    if (updates.videoTranscript !== undefined) row.video_transcript = updates.videoTranscript;
    if (updates.externalVideoUrl !== undefined) row.external_video_url = updates.externalVideoUrl;
    return row;
  }

  const updateCourse = async (courseId: string, updates: Partial<Course>) => {
    const row = courseUpdatesToRow(updates);
    if (Object.keys(row).length > 0) {
      await supabase.from('courses').update(row).eq('id', courseId);
    }
    setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, ...updates } : c)));
  };

  const toggleCourseStatus = async (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    await updateCourse(courseId, { status: course.status === 'active' ? 'inactive' : 'active' });
  };

  const deleteCourse = async (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    await supabase.from('courses').delete().eq('id', courseId);
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setEnrollments((prev) => prev.filter((e) => e.courseId !== courseId));
    setAssignments((prev) => prev.filter((a) => a.courseId !== courseId));
    deleteCourseVideo(courseId).catch(() => {});
    deletePresentationFile(courseId).catch(() => {});
    await addAuditLog(currentUser?.id || '', '刪除課程', course?.title || courseId, '');
  };

  const getPendingReviews = () => {
    return enrollments.filter(
      (e) => e.reportSubmitted && e.surveySubmitted && e.quizSubmitted && e.reviewStatus === 'pending'
    );
  };

  const getUserNotifications = (userId: string) => {
    return notifications.filter((n) => n.userId === userId);
  };

  const getCourseDiscussions = (courseId: string) => {
    return discussions.filter((d) => d.courseId === courseId);
  };

  const setUserRole = async (userId: string, role: User['role']) => {
    await supabase.from('profiles').update({ role }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    if (currentUser?.id === userId) setCurrentUser((prev) => (prev ? { ...prev, role } : prev));
    await addAuditLog(currentUser?.id || '', '變更角色', userId, `將使用者角色設為：${role}`);
  };

  // 新增使用者＝建立邀請（pending_invites）。由於前端無法在不切換目前登入狀態的
  // 情況下直接建立新的登入帳號，須等該員工日後以同一個 email 自行註冊時，
  // 由資料庫的 handle_new_user() trigger 自動套用此處指定的角色／部門。
  const addUser = async (userData: { name: string; email: string; department: string; role: User['role'] }) => {
    await supabase.from('pending_invites').upsert({
      email: userData.email,
      name: userData.name,
      department: userData.department,
      role: userData.role,
      invited_by: currentUser?.id,
    });
    await addAuditLog(currentUser?.id || '', '新增使用者邀請', userData.name, `Email: ${userData.email}`);
  };

  const setUserManager = async (userId: string, managerId: string | null) => {
    const user = users.find((u) => u.id === userId);
    const manager = managerId ? users.find((u) => u.id === managerId) : null;
    await supabase.from('profiles').update({ manager_id: managerId }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, managerId: managerId || undefined } : u)));
    await addAuditLog(currentUser?.id || '', '設定直屬主管', user?.name || userId, manager ? `直屬主管：${manager.name}` : '清除直屬主管');
  };

  const setUserStatus = async (userId: string, status: 'active' | 'resigned') => {
    const user = users.find((u) => u.id === userId);
    await supabase.from('profiles').update({ status }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));
    await addAuditLog(
      currentUser?.id || '',
      status === 'resigned' ? '停用使用者帳號（標記已離職）' : '恢復使用者帳號',
      user?.name || userId,
      status === 'resigned' ? '帳號已無法登入系統' : '帳號已恢復可登入'
    );
  };

  const deleteUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    await supabase.from('profiles').delete().eq('id', userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    await addAuditLog(currentUser?.id || '', '刪除使用者帳號', user?.name || userId, `Email: ${user?.email || ''}`);
  };

  // 員工自助填寫入職基本資料（TrainingDashboard.tsx 首次登入表單）
  const updateMyProfile = async (updates: { employeeId?: string; name?: string; department?: string; title?: string }) => {
    if (!currentUser) return;
    await supabase
      .from('profiles')
      .update({
        employee_id: updates.employeeId,
        name: updates.name,
        department: updates.department,
        title: updates.title,
      })
      .eq('id', currentUser.id);
    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : prev));
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u)));
  };

  // 人資/管理員修改員工基本資料
  const updateUserProfile = async (userId: string, updates: { name?: string; employeeId?: string; department?: string; title?: string; joinDate?: string }) => {
    const user = users.find((u) => u.id === userId);
    await supabase
      .from('profiles')
      .update({
        name: updates.name,
        employee_id: updates.employeeId,
        department: updates.department,
        title: updates.title,
        join_date: updates.joinDate,
      })
      .eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : prev));
    }
    const changed: string[] = [];
    if (updates.name && updates.name !== user?.name) changed.push(`姓名：${updates.name}`);
    if (updates.employeeId && updates.employeeId !== user?.employeeId) changed.push(`工號：${updates.employeeId}`);
    if (updates.department && updates.department !== user?.department) changed.push(`部門：${updates.department}`);
    if (updates.title && updates.title !== user?.title) changed.push(`職稱：${updates.title}`);
    if (updates.joinDate && updates.joinDate !== user?.joinDate) changed.push(`入職日期：${updates.joinDate}`);
    await addAuditLog(currentUser?.id || '', '修改員工基本資料', user?.name || userId, changed.join('、') || '無變更');
  };

  const sendPasswordResetEmail = async (email: string) => {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/website/training/login`,
    });
    await addAuditLog(currentUser?.id || '', '發送重設密碼信', email, '由人資/管理員觸發');
  };

  const assignCourse = async (
    userId: string,
    courseId: string,
    dueDate?: string,
    note?: string
  ): Promise<CourseAssignment> => {
    const existing = assignments.find((a) => a.userId === userId && a.courseId === courseId);
    if (existing) return existing;
    const { data, error } = await supabase
      .from('course_assignments')
      .insert({
        user_id: userId,
        course_id: courseId,
        assigned_by: currentUser?.id,
        assigned_by_name: currentUser?.name || '',
        due_date: dueDate || null,
        note: note || null,
      })
      .select()
      .single();
    if (error || !data) throw error || new Error('派發課程失敗');
    const newAssignment = mapAssignment(data as CourseAssignmentRow);
    setAssignments((prev) => [...prev, newAssignment]);
    const course = courses.find((c) => c.id === courseId);
    const user = users.find((u) => u.id === userId);
    await addNotification(userId, 'new_course', `管理員已指派「${course?.title || ''}」課程給您，請於${dueDate || '規定日期'}前完成。`);
    await addAuditLog(currentUser?.id || '', '派發課程', courseId, `指派給 ${user?.name || userId}${dueDate ? '，截止日：' + dueDate : ''}`);
    return newAssignment;
  };

  const revokeAssignment = async (assignmentId: string) => {
    const asgn = assignments.find((a) => a.id === assignmentId);
    await supabase.from('course_assignments').delete().eq('id', assignmentId);
    if (asgn) {
      await addAuditLog(currentUser?.id || '', '取消派發', asgn.courseId, `取消對 ${asgn.userId} 的派發`);
    }
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
  };

  const getAssignmentsForUser = (userId: string) => assignments.filter((a) => a.userId === userId);
  const getAssignmentsForCourse = (courseId: string) => assignments.filter((a) => a.courseId === courseId);

  const reportQuizQuestion = async (
    courseId: string,
    questionId: string,
    questionText: string,
    reason: string,
    comment?: string
  ) => {
    const course = courses.find((c) => c.id === courseId);
    const { data } = await supabase
      .from('question_reports')
      .insert({
        course_id: courseId,
        course_name: course?.title || '',
        question_id: questionId,
        question_text: questionText,
        user_id: currentUser?.id,
        user_name: currentUser?.name || '',
        reason,
        comment: comment || null,
        status: 'open',
      })
      .select()
      .single();
    if (data) setQuestionReports((prev) => [mapQuestionReport(data as QuestionReportRow), ...prev]);
    await addAuditLog(currentUser?.id || '', '回報測驗題目問題', course?.title || courseId, `題目：${questionText}｜原因：${reason}`);
  };

  const resolveQuestionReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    await supabase
      .from('question_reports')
      .update({ status, resolved_by: currentUser?.id, resolved_at: new Date().toISOString() })
      .eq('id', reportId);
    setQuestionReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, status, resolvedBy: currentUser?.name || 'HR/管理員', resolvedAt: new Date().toLocaleString('zh-TW') }
          : r
      )
    );
  };

  const addFreeCourse = async (courseData: Omit<FreeCourse, 'id'>): Promise<FreeCourse> => {
    const { data, error } = await supabase
      .from('free_courses')
      .insert({
        source: courseData.source,
        source_color: courseData.sourceColor,
        title: courseData.title,
        category: courseData.category,
        hours: courseData.hours,
        langs: courseData.langs,
        is_new: courseData.isNew,
        description: courseData.desc,
        url: courseData.url,
        video_id: courseData.videoId || null,
        added_by: currentUser?.id,
      })
      .select()
      .single();
    if (error || !data) throw error || new Error('新增免費課程資源失敗');
    const newCourse = mapFreeCourse(data as FreeCourseRow, currentUser?.name);
    setCustomFreeCourses((prev) => [newCourse, ...prev]);
    await addAuditLog(currentUser?.id || '', '新增免費課程資源', courseData.title, `來源：${courseData.source}`);
    return newCourse;
  };

  const removeFreeCourse = async (courseId: string) => {
    const course = customFreeCourses.find((c) => c.id === courseId);
    await supabase.from('free_courses').delete().eq('id', courseId);
    setCustomFreeCourses((prev) => prev.filter((c) => c.id !== courseId));
    await addAuditLog(currentUser?.id || '', '刪除免費課程資源', course?.title || courseId, '');
  };

  return (
    <TrainingAuthContext.Provider
      value={{
        currentUser,
        authLoading,
        users,
        courses,
        enrollments,
        discussions,
        notifications,
        auditLogs,
        assignments,
        questionReports,
        customFreeCourses,
        login,
        register,
        logout,
        getEnrollmentForUser,
        getUserEnrollments,
        enrollInCourse,
        updateEnrollment,
        submitReport,
        submitQuiz,
        getQuizAnswerKey,
        checkAndSetPendingReview,
        approveEnrollment,
        rejectEnrollment,
        approveAsManager,
        approveAsHR,
        addDiscussion,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        addCourse,
        updateCourse,
        toggleCourseStatus,
        deleteCourse,
        getPendingReviews,
        getUserNotifications,
        getCourseDiscussions,
        setUserRole,
        setUserManager,
        addUser,
        setUserStatus,
        deleteUser,
        updateMyProfile,
        updateUserProfile,
        sendPasswordResetEmail,
        addAuditLog,
        clearAuditLogsByActions,
        assignCourse,
        revokeAssignment,
        getAssignmentsForUser,
        getAssignmentsForCourse,
        reportQuizQuestion,
        resolveQuestionReport,
        addFreeCourse,
        removeFreeCourse,
      }}
    >
      {children}
    </TrainingAuthContext.Provider>
  );
}

export function useTrainingAuth() {
  const ctx = useContext(TrainingAuthContext);
  if (!ctx) throw new Error('useTrainingAuth must be used within TrainingAuthProvider');
  return ctx;
}

export default TrainingAuthContext;
