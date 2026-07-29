import { createContext, useContext, useState } from 'react';
import { USERS, COURSES, ENROLLMENTS, DISCUSSIONS, NOTIFICATIONS, AUDIT_LOGS } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users] = useState(USERS);
  const [courses, setCourses] = useState(COURSES);
  const [enrollments, setEnrollments] = useState(ENROLLMENTS);
  const [discussions, setDiscussions] = useState(DISCUSSIONS);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState(AUDIT_LOGS);

  const login = (email) => {
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

  const getEnrollmentForUser = (userId, courseId) => {
    return enrollments.find((e) => e.userId === userId && e.courseId === courseId);
  };

  const getUserEnrollments = (userId) => {
    return enrollments.filter((e) => e.userId === userId);
  };

  const enrollInCourse = (userId, courseId) => {
    const existing = getEnrollmentForUser(userId, courseId);
    if (existing) return existing;
    const newEnrollment = {
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

  const updateEnrollment = (enrollmentId, updates) => {
    setEnrollments((prev) =>
      prev.map((e) => (e.id === enrollmentId ? { ...e, ...updates } : e))
    );
  };

  const submitReport = (enrollmentId, reportContent, surveyData) => {
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

  const submitQuiz = (enrollmentId, score) => {
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

  const checkAndSetPendingReview = (enrollmentId) => {
    const enr = enrollments.find((e) => e.id === enrollmentId);
    if (enr && enr.reportSubmitted && enr.surveySubmitted && enr.quizSubmitted) {
      updateEnrollment(enrollmentId, {
        status: 'pending_review',
        reviewStatus: 'pending',
        submittedAt: new Date().toISOString().split('T')[0],
      });
    }
  };

  const approveEnrollment = (enrollmentId, comment) => {
    updateEnrollment(enrollmentId, {
      status: 'completed',
      reviewStatus: 'approved',
      certificateIssued: true,
      managerComment: comment || null,
      completedAt: new Date().toISOString().split('T')[0],
    });
    const enr = enrollments.find((e) => e.id === enrollmentId);
    if (enr) {
      addAuditLog(currentUser?.id, '審核通過', enr.courseId, `已核發結業證書${comment ? '，備註：' + comment : ''}`);
      addNotification(enr.userId, 'review_approved', `您的課程已通過審核，證書已核發！`);
    }
  };

  const rejectEnrollment = (enrollmentId, comment) => {
    updateEnrollment(enrollmentId, {
      status: 'rejected',
      reviewStatus: 'rejected',
      managerComment: comment,
    });
    const enr = enrollments.find((e) => e.id === enrollmentId);
    if (enr) {
      addAuditLog(currentUser?.id, '審核退回', enr.courseId, `退回原因：${comment}`);
      addNotification(enr.userId, 'review_rejected', `您的課程審核未通過，請查看主管意見後重新提交。`);
    }
  };

  const addDiscussion = (courseId, userId, userName, message) => {
    const newDiscussion = {
      id: `d${Date.now()}`,
      courseId,
      userId,
      userName,
      message,
      timestamp: new Date().toLocaleString('zh-TW'),
    };
    setDiscussions((prev) => [...prev, newDiscussion]);
  };

  const addNotification = (userId, type, message) => {
    const newNotification = {
      id: `n${Date.now()}`,
      userId,
      type,
      message,
      read: false,
      createdAt: new Date().toLocaleString('zh-TW'),
    };
    setNotifications((prev) => [...prev, newNotification]);
  };

  const markNotificationRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = (userId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === userId ? { ...n, read: true } : n))
    );
  };

  const addAuditLog = (userId, action, target, details) => {
    const user = USERS.find((u) => u.id === userId);
    const newLog = {
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

  const addCourse = (courseData) => {
    const newCourse = {
      id: `c${Date.now()}`,
      ...courseData,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCourses((prev) => [...prev, newCourse]);
    addAuditLog(currentUser?.id, '新增課程', courseData.title, 'AI 自動生成課程內容及測驗題目');
    return newCourse;
  };

  const toggleCourseStatus = (courseId) => {
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

  const getUserNotifications = (userId) => {
    return notifications.filter((n) => n.userId === userId);
  };

  const getCourseDiscussions = (courseId) => {
    return discussions.filter((d) => d.courseId === courseId);
  };

  return (
    <AuthContext.Provider
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
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
