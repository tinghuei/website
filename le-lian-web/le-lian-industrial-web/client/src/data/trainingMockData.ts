export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'employee' | 'manager' | 'admin';
  department: string;
  managerId?: string;
  avatar: string;
  joinDate: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration: number;
  mandatory: boolean;
  thumbnail: string;
  passingScore: number;
  status: 'active' | 'inactive';
  createdAt: string;
  quizQuestions: QuizQuestion[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'in_progress' | 'pending_review' | 'completed' | 'rejected';
  progressPercent: number;
  watchTimeMinutes: number;
  enrolledAt: string;
  reportSubmitted: boolean;
  surveySubmitted: boolean;
  quizSubmitted: boolean;
  quizScore: number | null;
  reviewStatus: 'pending' | 'approved' | 'rejected' | null;
  certificateIssued: boolean;
  managerComment: string | null;
  submittedAt?: string;
  completedAt?: string;
  reportContent?: string;
  surveyData?: Record<string, number | string>;
  videoWatched?: boolean;
}

export interface Discussion {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export const USERS: User[] = [
  {
    id: '1',
    name: '王小明',
    email: 'wang@company.com',
    password: '1234',
    role: 'employee',
    department: '組裝一線',
    managerId: '2',
    avatar: 'W',
    joinDate: '2023-03-15',
  },
  {
    id: '2',
    name: '李主管',
    email: 'li@company.com',
    password: '1234',
    role: 'manager',
    department: '組裝一線',
    avatar: 'L',
    joinDate: '2021-06-01',
  },
  {
    id: '3',
    name: 'Admin管理員',
    email: 'admin@company.com',
    password: '1234',
    role: 'admin',
    department: '資訊部',
    avatar: 'A',
    joinDate: '2020-01-10',
  },
  {
    id: '4',
    name: '陳小芳',
    email: 'chen@company.com',
    password: '1234',
    role: 'employee',
    department: '組裝一線',
    managerId: '2',
    avatar: 'C',
    joinDate: '2023-07-20',
  },
  {
    id: '5',
    name: '林阿明',
    email: 'lin@company.com',
    password: '1234',
    role: 'employee',
    department: '品管部',
    managerId: '2',
    avatar: 'L',
    joinDate: '2022-11-05',
  },
];

export const COURSES: Course[] = [
  {
    id: 'c1',
    title: '工廠安全衛生教育訓練',
    description: '本課程涵蓋工廠作業環境中必要的安全衛生知識，包括個人防護裝備使用、緊急疏散程序、危險物品處理及職業傷害預防等核心內容。完成本課程後，員工將具備在製造環境中安全作業的基本能力。',
    category: '安全衛生',
    instructor: '張安全主任',
    duration: 120,
    mandatory: true,
    thumbnail: 'bg-blue-500',
    passingScore: 70,
    status: 'active',
    createdAt: '2024-01-10',
    quizQuestions: [
      {
        id: 'q1',
        question: '在工廠作業時，下列哪項個人防護裝備是必須配戴的？',
        options: ['太陽眼鏡', '安全帽', '普通帽子', '無需配戴'],
        answerIndex: 1,
      },
      {
        id: 'q2',
        question: '發生火災時，應優先採取什麼行動？',
        options: ['繼續工作直到確認火源', '立即關閉所有機器後逃生', '依緊急疏散程序撤離並通報', '先搶救個人財物'],
        answerIndex: 2,
      },
      {
        id: 'q3',
        question: '接觸化學藥品前，應先做什麼？',
        options: ['直接使用', '閱讀安全資料表(SDS)', '詢問同事', '戴上普通手套即可'],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'c2',
    title: '精實生產與5S管理實務',
    description: '精實生產是現代製造業提升效率、消除浪費的重要管理方法。本課程介紹5S（整理、整頓、清掃、清潔、素養）的核心概念與實際執行方法，幫助員工建立系統化的工作環境管理習慣，提升生產效率及品質。',
    category: '生產管理',
    instructor: '劉效率顧問',
    duration: 90,
    mandatory: true,
    thumbnail: 'bg-green-500',
    passingScore: 70,
    status: 'active',
    createdAt: '2024-02-05',
    quizQuestions: [
      {
        id: 'q1',
        question: '5S中的第一個S「整理」是指？',
        options: ['將物品分類放整齊', '區分必要與不必要的物品並清除不必要的', '定期清掃工作環境', '建立良好工作習慣'],
        answerIndex: 1,
      },
      {
        id: 'q2',
        question: '精實生產中「七大浪費」不包括以下哪項？',
        options: ['等待浪費', '過度生產', '良好的溝通', '不必要的搬運'],
        answerIndex: 2,
      },
      {
        id: 'q3',
        question: '5S活動最終的目的是？',
        options: ['讓工廠看起來乾淨美觀', '養成員工良好的工作素養與習慣', '節省清潔費用', '應付稽核檢查'],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'c3',
    title: '品質管理系統 ISO 9001:2015 認識',
    description: '本課程介紹 ISO 9001:2015 品質管理系統的核心要求與實施方法。內容涵蓋品質政策制定、過程管理、風險評估、持續改善及稽核程序，協助員工了解如何在日常工作中符合品質管理系統的要求，共同維護公司的品質標準。',
    category: '品質管理',
    instructor: '黃品質工程師',
    duration: 150,
    mandatory: false,
    thumbnail: 'bg-purple-500',
    passingScore: 75,
    status: 'active',
    createdAt: '2024-03-01',
    quizQuestions: [
      {
        id: 'q1',
        question: 'ISO 9001:2015 採用什麼管理思維框架？',
        options: ['7S管理', 'PDCA循環', '六標準差', 'OKR目標管理'],
        answerIndex: 1,
      },
      {
        id: 'q2',
        question: '品質管理系統中「不符合」發生後，首要步驟是？',
        options: ['隱瞞問題避免被發現', '立即採取矯正措施並記錄', '繼續生產等待後續處理', '推卸責任給上游供應商'],
        answerIndex: 1,
      },
      {
        id: 'q3',
        question: 'ISO 9001:2015 強調以下哪個核心原則？',
        options: ['以利潤為導向', '以顧客為焦點', '以速度為優先', '以成本為考量'],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'c4',
    title: '多元文化職場溝通與合作',
    description: '本課程專為擁有台灣、泰國、越南、印尼籍員工的多元文化職場設計。課程內容包括跨文化溝通技巧、文化差異認識、工作場所禮儀、衝突解決方法及有效團隊合作策略。透過本課程，員工將能在多元文化環境中有效協作，提升整體團隊效能。',
    category: '職場技能',
    instructor: '許跨文化顧問',
    duration: 60,
    mandatory: true,
    thumbnail: 'bg-orange-500',
    passingScore: 70,
    status: 'active',
    createdAt: '2024-04-15',
    quizQuestions: [
      {
        id: 'q1',
        question: '在多元文化職場中，遇到語言溝通障礙時，最好的做法是？',
        options: ['忽略不理', '使用簡單清楚的語言並確認對方理解', '只與同語言的人合作', '強迫對方學習自己的語言'],
        answerIndex: 1,
      },
      {
        id: 'q2',
        question: '跨文化溝通中，「高情境文化」的特點是？',
        options: ['溝通直接明確，訊息清楚表達', '依賴情境、非語言訊號和關係來傳達意義', '避免任何非正式溝通', '所有訊息都以書面形式確認'],
        answerIndex: 1,
      },
      {
        id: 'q3',
        question: '在多元文化團隊中促進良好合作的關鍵要素是？',
        options: ['要求所有人遵循同一文化習慣', '相互尊重、開放態度與有效溝通', '避免討論文化差異', '指派文化協調員處理所有衝突'],
        answerIndex: 1,
      },
    ],
  },
];

export const ENROLLMENTS: Enrollment[] = [
  {
    id: 'e1',
    userId: '1',
    courseId: 'c1',
    status: 'in_progress',
    progressPercent: 75,
    watchTimeMinutes: 90,
    enrolledAt: '2024-04-01',
    reportSubmitted: false,
    surveySubmitted: false,
    quizSubmitted: false,
    quizScore: null,
    reviewStatus: null,
    certificateIssued: false,
    managerComment: null,
  },
  {
    id: 'e2',
    userId: '1',
    courseId: 'c2',
    status: 'pending_review',
    progressPercent: 100,
    watchTimeMinutes: 90,
    enrolledAt: '2024-03-10',
    reportSubmitted: true,
    surveySubmitted: true,
    quizSubmitted: true,
    quizScore: 85,
    reviewStatus: 'pending',
    certificateIssued: false,
    managerComment: null,
    submittedAt: '2024-03-25',
  },
  {
    id: 'e3',
    userId: '1',
    courseId: 'c4',
    status: 'completed',
    progressPercent: 100,
    watchTimeMinutes: 60,
    enrolledAt: '2024-02-01',
    reportSubmitted: true,
    surveySubmitted: true,
    quizSubmitted: true,
    quizScore: 90,
    reviewStatus: 'approved',
    certificateIssued: true,
    managerComment: null,
    submittedAt: '2024-02-20',
    completedAt: '2024-02-28',
  },
  {
    id: 'e4',
    userId: '4',
    courseId: 'c1',
    status: 'pending_review',
    progressPercent: 100,
    watchTimeMinutes: 120,
    enrolledAt: '2024-04-02',
    reportSubmitted: true,
    surveySubmitted: true,
    quizSubmitted: true,
    quizScore: 78,
    reviewStatus: 'pending',
    certificateIssued: false,
    managerComment: null,
    submittedAt: '2024-04-18',
  },
  {
    id: 'e5',
    userId: '4',
    courseId: 'c2',
    status: 'rejected',
    progressPercent: 100,
    watchTimeMinutes: 90,
    enrolledAt: '2024-03-05',
    reportSubmitted: true,
    surveySubmitted: true,
    quizSubmitted: true,
    quizScore: 55,
    reviewStatus: 'rejected',
    certificateIssued: false,
    managerComment: '測驗成績未達標準，請重新複習後再次提交。',
    submittedAt: '2024-03-22',
  },
  {
    id: 'e6',
    userId: '5',
    courseId: 'c3',
    status: 'pending_review',
    progressPercent: 100,
    watchTimeMinutes: 150,
    enrolledAt: '2024-04-10',
    reportSubmitted: true,
    surveySubmitted: true,
    quizSubmitted: true,
    quizScore: 80,
    reviewStatus: 'pending',
    certificateIssued: false,
    managerComment: null,
    submittedAt: '2024-04-28',
  },
];

export const DISCUSSIONS: Discussion[] = [
  {
    id: 'd1',
    courseId: 'c1',
    userId: '1',
    userName: '王小明',
    message: '這個課程非常實用！之前工廠發生過一次小意外，如果早點學到緊急疏散程序就好了。',
    timestamp: '2024-04-10 14:30',
  },
  {
    id: 'd2',
    courseId: 'c1',
    userId: '4',
    userName: '陳小芳',
    message: '關於個人防護裝備的部分講解得很清楚，建議增加更多實際操作示範影片。',
    timestamp: '2024-04-12 09:15',
  },
  {
    id: 'd3',
    courseId: 'c1',
    userId: '2',
    userName: '李主管',
    message: '感謝大家的積極參與！這門課是所有新進員工的必修課，請務必認真學習。',
    timestamp: '2024-04-13 11:00',
  },
  {
    id: 'd4',
    courseId: 'c2',
    userId: '1',
    userName: '王小明',
    message: '5S實施後，我的工作站整潔多了，找工具的時間減少了很多！',
    timestamp: '2024-03-20 16:45',
  },
  {
    id: 'd5',
    courseId: 'c2',
    userId: '5',
    userName: '林阿明',
    message: '精實生產的概念很好，但實際執行時還是會遇到很多挑戰，希望能有更多案例分享。',
    timestamp: '2024-03-21 10:30',
  },
  {
    id: 'd6',
    courseId: 'c3',
    userId: '5',
    userName: '林阿明',
    message: 'ISO 9001的要求挺複雜的，這門課程幫助我更好地理解了品質管理的核心理念。',
    timestamp: '2024-04-22 13:20',
  },
  {
    id: 'd7',
    courseId: 'c4',
    userId: '1',
    userName: '王小明',
    message: '和越南、泰國同事一起工作，這門課真的很有幫助！了解彼此的文化差異後，合作更順暢了。',
    timestamp: '2024-02-15 15:00',
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: '1',
    type: 'review_approved',
    message: '您的「多元文化職場溝通與合作」課程已通過審核，證書已核發！',
    read: false,
    createdAt: '2024-02-28 10:00',
  },
  {
    id: 'n2',
    userId: '1',
    type: 'enrollment_reminder',
    message: '提醒：「工廠安全衛生教育訓練」課程尚未完成，請盡快完成學習。',
    read: false,
    createdAt: '2024-04-20 09:00',
  },
  {
    id: 'n3',
    userId: '2',
    type: 'review_pending',
    message: '有 2 份課程完成申請等待您審核，請前往審核面板處理。',
    read: false,
    createdAt: '2024-04-28 14:00',
  },
  {
    id: 'n4',
    userId: '4',
    type: 'review_rejected',
    message: '您的「精實生產與5S管理實務」課程審核未通過，請查看主管意見後重新提交。',
    read: true,
    createdAt: '2024-03-28 11:30',
  },
];

export const AUDIT_LOGS: AuditLog[] = [
  {
    id: 'al1',
    userId: '3',
    userName: 'Admin管理員',
    action: '新增課程',
    target: '工廠安全衛生教育訓練',
    timestamp: '2024-01-10 09:00',
    details: '建立新課程，設定為必修課程',
  },
  {
    id: 'al2',
    userId: '3',
    userName: 'Admin管理員',
    action: '新增課程',
    target: '精實生產與5S管理實務',
    timestamp: '2024-02-05 10:30',
    details: '建立新課程，設定為必修課程',
  },
  {
    id: 'al3',
    userId: '2',
    userName: '李主管',
    action: '審核通過',
    target: '王小明 - 多元文化職場溝通與合作',
    timestamp: '2024-02-28 10:00',
    details: '審核通過並核發結業證書',
  },
  {
    id: 'al4',
    userId: '2',
    userName: '李主管',
    action: '審核退回',
    target: '陳小芳 - 精實生產與5S管理實務',
    timestamp: '2024-03-28 11:30',
    details: '測驗成績未達標準（55分），退回重新提交',
  },
  {
    id: 'al5',
    userId: '1',
    userName: '王小明',
    action: '完成課程報名',
    target: '工廠安全衛生教育訓練',
    timestamp: '2024-04-01 08:30',
    details: '員工自主報名必修課程',
  },
  {
    id: 'al6',
    userId: '3',
    userName: 'Admin管理員',
    action: '上傳教材',
    target: '品質管理系統 ISO 9001:2015 認識',
    timestamp: '2024-03-01 14:00',
    details: 'AI 自動生成課程內容及測驗題目',
  },
];
