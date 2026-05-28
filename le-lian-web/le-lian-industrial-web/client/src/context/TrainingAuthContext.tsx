import { createContext, useContext, useState, ReactNode } from 'react';
import {
  USERS,
  COURSES,
  ENROLLMENTS,
  DISCUSSIONS,
  NOTIFICATIONS,
  AUDIT_LOGS,
  User,
  Course,
  Enrollment,
  Discussion,
  Notification,
  AuditLog,
} from '../data/trainingMockData';

interface TrainingAuthContextValue {
  currentUser: User | null;
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  discussions: Discussion[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  login: (email: string) => User | null;
  logout: () => void;
  getEnrollmentForUser: (userId: string, courseId: string) => Enrollment | undefined;
  getUserEnrollments: (userId: string) => Enrollment[];
  enrollInCourse: (userId: string, courseId: string) => Enrollment;
  updateEnrollment: (enrollmentId: string, updates: Partial<Enrollment>) => void;
  submitReport: (enrollmentId: string, reportContent: string, surveyData: Record<string, number | string>) => void;
  submitQuiz: (enrollmentId: string, score: number) => void;
  checkAndSetPendingReview: (enrollmentId: string) => void;
  approveEnrollment: (enrollmentId: string, comment?: string) => void;
  rejectEnrollment: (enrollmentId: string, comment: string) => void;
  addDiscussion: (courseId: string, userId: string, userName: string, message: string) => void;
  addNotification: (userId: string, type: string, message: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: (userId: string) => void;
  addCourse: (courseData: Partial<Course>) => Course;
  toggleCourseStatus: (courseId: string) => void;
  getPendingReviews: () => Enrollment[];
  getUserNotifications: (userId: string) => Notification[];
  getCourseDiscussions: (courseId: string) => Discussion[];
}

const TrainingAuthContext = createContext<TrainingAuthContextValue | null>(null);

export function TrainingAuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users] = useState<User[]>(USERS);
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(ENROLLMENTS);
  const [discussions, setDiscussions] = useState<Discussion[]>(DISCUSSIONS);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(AUDIT_LOGS);

  const login = (email: string): User | null => {
    const user = USERS.find((u) => u.email === email);
    if (user) {
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const getEnrollmentForUser = (userId: string, courseId: string) => {
    return enrollments.find((e) => e.userId === userId && e.courseId === courseId);
  };

  const getUserEnrollments = (userId: string) => {
    return enrollments.filter((e) => e.userId === userId);
  };

  const enrollInCourse = (userId: string, courseId: string): Enrollment => {
    const existing = getEnrollmentForUser(userId, courseId);
    if (existing) return existing;
    const newEnrollment: Enrollment = {
      id: `e${Date.now()}`,
      userId,
      courseId,
      status: 'in_progress',
      progressPercent: 0,
      watchTimeMinutes: 0,
      enrolledAt: new Date().toISOString().split('T')[0],
      reportSubmitted: false,
      surveySubmitted: false,
      quizSubmitted: false,
      quizScore: null,
      reviewStatus: null,
      certificateIssued: false,
      managerComment: null,
    };
    setEnrollments((prev) => [...prev, newEnrollment]);
    addAuditLog(userId, '完成課程報名', courseId, '員工自主報名課程');
    return newEnrollment;
  };

  const updateEnrollment = (enrollmentId: string, updates: Partial<Enrollment>) => {
    setEnrollments((prev) =>
      prev.map((e) => (e.id === enrollmentId ? { ...e, ...updates } : e))
    );
  };

  const submitReport = (enrollmentId: string, reportContent: string, surveyData: Record<string, number | string>) => {
    updateEnrollment(enrollmentId, {
      reportSubmitted: !!reportContent,
      surveySubmitted: !!surveyData,
      reportContent,
      surveyData,
    });
    const enr = enrollments.find((e) => e.id === enrollmentId);
    if (enr) {
      addAuditLog(enr.userId, '提交心得報告', enr.courseId, '員工提交訓練心得報告及滿意度調查');
    }
  };

  const submitQuiz = (enrollmentId: string, score: number) => {
    const enr = enrollments.find((e) => e.id === enrollmentId);
    const course = enr ? courses.find((c) => c.id === enr.courseId) : null;
    const passed = course ? score >= course.passingScore : score >= 70;
    updateEnrollment(enrollmentId, {
      quizSubmitted: true,
      quizScore: score,
    });
    if (enr) {
      addAuditLog(enr.userId, '提交測驗', enr.courseId, `測驗成績：${score}分，${passed ? '通過' : '未通過'}`);
    }
  };

  const checkAndSetPendingReview = (enrollmentId: string) => {
    const enr = enrollments.find((e) => e.id === enrollmentId);
    if (enr && enr.reportSubmitted && enr.surveySubmitted && enr.quizSubmitted) {
      updateEnrollment(enrollmentId, {
        status: 'pending_review',
        reviewStatus: 'pending',
        submittedAt: new Date().toISOString().split('T')[0],
      });
    }
  };

  const approveEnrollment = (enrollmentId: string, comment?: string) => {
    updateEnrollment(enrollmentId, {
      status: 'completed',
      reviewStatus: 'approved',
      certificateIssued: true,
      managerComment: comment || null,
      completedAt: new Date().toISOString().split('T')[0],
    });
    const enr = enrollments.find((e) => e.id === enrollmentId);
    if (enr) {
      addAuditLog(currentUser?.id || '', '審核通過', enr.courseId, `已核發結業證書${comment ? '，備註：' + comment : ''}`);
      addNotification(enr.userId, 'review_approved', `您的課程已通過審核，證書已核發！`);
    }
  };

  const rejectEnrollment = (enrollmentId: string, comment: string) => {
    updateEnrollment(enrollmentId, {
      status: 'rejected',
      reviewStatus: 'rejected',
      managerComment: comment,
    });
    const enr = enrollments.find((e) => e.id === enrollmentId);
    if (enr) {
      addAuditLog(currentUser?.id || '', '審核退回', enr.courseId, `退回原因：${comment}`);
      addNotification(enr.userId, 'review_rejected', `您的課程審核未通過，請查看主管意見後重新提交。`);
    }
  };

  const addDiscussion = (courseId: string, userId: string, userName: string, message: string) => {
    const newDiscussion: Discussion = {
      id: `d${Date.now()}`,
      courseId,
      userId,
      userName,
      message,
      timestamp: new Date().toLocaleString('zh-TW'),
    };
    setDiscussions((prev) => [...prev, newDiscussion]);
  };

  const addNotification = (userId: string, type: string, message: string) => {
    const newNotification: Notification = {
      id: `n${Date.now()}`,
      userId,
      type,
      message,
      read: false,
      createdAt: new Date().toLocaleString('zh-TW'),
    };
    setNotifications((prev) => [...prev, newNotification]);
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = (userId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === userId ? { ...n, read: true } : n))
    );
  };

  const addAuditLog = (userId: string, action: string, target: string, details: string) => {
    const user = USERS.find((u) => u.id === userId);
    const newLog: AuditLog = {
      id: `al${Date.now()}`,
      userId,
      userName: user?.name || 'Unknown',
      action,
      target,
      details,
      timestamp: new Date().toLocaleString('zh-TW'),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addCourse = (courseData: Partial<Course>): Course => {
    const newCourse: Course = {
      id: `c${Date.now()}`,
      title: courseData.title || '',
      description: courseData.description || '',
      category: courseData.category || '',
      instructor: courseData.instructor || '',
      duration: courseData.duration || 60,
      mandatory: courseData.mandatory || false,
      thumbnail: courseData.thumbnail || 'bg-blue-500',
      passingScore: courseData.passingScore || 70,
      quizQuestions: courseData.quizQuestions || [],
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCourses((prev) => [...prev, newCourse]);
    addAuditLog(currentUser?.id || '', '新增課程', courseData.title || '', 'AI 自動生成課程內容及測驗題目');
    return newCourse;
  };

  const toggleCourseStatus = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
      )
    );
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

  return (
    <TrainingAuthContext.Provider
      value={{
        currentUser,
        users,
        courses,
        enrollments,
        discussions,
        notifications,
        auditLogs,
        login,
        logout,
        getEnrollmentForUser,
        getUserEnrollments,
        enrollInCourse,
        updateEnrollment,
        submitReport,
        submitQuiz,
        checkAndSetPendingReview,
        approveEnrollment,
        rejectEnrollment,
        addDiscussion,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        addCourse,
        toggleCourseStatus,
        getPendingReviews,
        getUserNotifications,
        getCourseDiscussions,
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
