import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { X, ChevronRight, ArrowLeft, Mail, Lock, User as UserIcon, Building2 } from 'lucide-react';
import { ORG_UNITS } from '../../data/orgChartData';

// 測試帳號（僅供示範，員工應使用自己的公司信箱）
// 注意：這些示範帳號需先在 Supabase 中以相同 email/密碼自行註冊（或由管理員於 Supabase Dashboard 建立）才能登入。
const TEST_ACCOUNT_PASSWORD = 'demo1234';
const TEST_ACCOUNTS = [
  { email: 'wang@company.com',  name: '王小明',    photo: 'W', color: 'bg-green-500',  role: '員工',   dept: '製造課' },
  { email: 'li@company.com',    name: '李主管',    photo: 'L', color: 'bg-blue-500',   role: '主管',   dept: '製造課' },
  { email: 'admin@company.com', name: 'Admin 管理員', photo: 'A', color: 'bg-purple-500', role: '管理員', dept: '總務課' },
  { email: 'hr@company.com',    name: '林人資',    photo: 'H', color: 'bg-rose-500',   role: '人資',   dept: '人資安全組' },
  { email: 'chen@company.com',  name: '陳小芳',    photo: 'C', color: 'bg-orange-400', role: '員工',   dept: '品保課' },
  { email: 'vp@company.com',    name: '黃副總',    photo: 'V', color: 'bg-indigo-600', role: '副總',   dept: '總經理室' },
];

// 公司所有單位清單（供新員工選擇所屬單位）
const DEPT_OPTIONS = ORG_UNITS.map((u) => u.name);

export default function TrainingLogin() {
  const { login, register, users } = useTrainingAuth();
  const [, navigate] = useLocation();

  // Email + 密碼登入流程
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'register'>('email');
  const [regName, setRegName] = useState('');
  const [regDept, setRegDept] = useState(DEPT_OPTIONS[0] ?? '');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 測試帳號選擇器
  const [showTestPicker, setShowTestPicker] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setError('請輸入有效的電子郵件地址。');
      return;
    }
    if (!password) {
      setError('請輸入密碼。');
      return;
    }
    const existing = users.find((u) => u.email === trimmed);
    if (existing?.status === 'resigned') {
      setError('此帳號已停用，如有任何問題請洽人資。');
      return;
    }
    // 先嘗試登入（users 登出後可能為空，不能單靠本地清單判斷是否已有帳號）
    setSubmitting(true);
    const user = await login(trimmed, password);
    setSubmitting(false);
    if (user) {
      navigate('/training/dashboard');
    } else if (!existing) {
      // 本地清單找不到且登入也失敗 → 新使用者，進入註冊流程
      setStep('register');
    } else {
      setError('登入失敗，請確認電子郵件與密碼是否正確。');
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!regName.trim()) { setError('請輸入您的姓名。'); return; }
    if (!regDept) { setError('請選擇所屬單位。'); return; }
    setSubmitting(true);
    const result = await register(email.trim().toLowerCase(), password, regName.trim(), regDept);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else if (result.pendingConfirmation) {
      setInfo('註冊成功！請至您的信箱完成驗證信件後再回來登入。');
    } else if (result.user) {
      navigate('/training/dashboard');
    } else {
      setError('帳號建立後登入失敗，請重新整理頁面再試。');
    }
  }

  function handleTestSelect(testEmail: string) {
    setShowTestPicker(false);
    setStep('email');
    setError('');
    setInfo('');
    setEmail(testEmail);
    setPassword(TEST_ACCOUNT_PASSWORD);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* 測試帳號選擇器 overlay */}
      {showTestPicker && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowTestPicker(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-700">選擇測試帳號</span>
              <button onClick={() => setShowTestPicker(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
              <p className="text-xs text-amber-700">
                以下為示範用測試帳號，員工請使用公司信箱登入。點選後會自動帶入帳號密碼，仍需按下「繼續」才會登入；
                該帳號須已於系統中完成註冊才可使用。
              </p>
            </div>
            <div className="py-2">
              {TEST_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleTestSelect(acc.email)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-10 h-10 ${acc.color} rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                    {acc.photo}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{acc.name}</p>
                    <p className="text-xs text-gray-400 truncate">{acc.email}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{acc.role}</span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                </button>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-center text-gray-400">測試帳號僅供系統示範使用</p>
            </div>
          </div>
        </div>
      )}

      {/* 主登入卡片 */}
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/website/choice-logo.svg" alt="CHOICE" className="h-14 mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-gray-900">樂聯工業</h1>
          <p className="text-sm text-gray-500 mt-1">員工訓練系統</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          {/* ── Step 1: Email + 密碼 ── */}
          {step === 'email' && (
            <>
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">登入帳號</h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                輸入您的公司電子郵件地址與密碼
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.name@company.com"
                    required
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300"
                  />
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="密碼"
                    required
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                )}
                {info && (
                  <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{info}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : '繼續'}
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs text-gray-400">
                  <span className="bg-white px-3">或</span>
                </div>
              </div>

              <button
                onClick={() => setShowTestPicker(true)}
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                使用測試帳號登入
              </button>
            </>
          )}

          {/* ── Step 2: 新員工填寫資料 ── */}
          {step === 'register' && (
            <>
              <button
                onClick={() => { setStep('email'); setError(''); setInfo(''); }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors"
              >
                <ArrowLeft size={14} /> 返回
              </button>

              <h2 className="text-lg font-semibold text-gray-900 mb-1">完成帳號設定</h2>
              <p className="text-xs text-gray-500 mb-5">
                此信箱尚未註冊，請填寫您的基本資料以完成首次登入
              </p>

              {/* 顯示 email（唯讀） */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-4 text-sm text-gray-600">
                <Mail size={14} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{email}</span>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="請輸入您的姓名"
                    required
                    autoFocus
                    maxLength={20}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300"
                  />
                </div>

                <div className="relative">
                  <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-700"
                  >
                    {DEPT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                )}
                {info && (
                  <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{info}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : '完成並登入'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-400">
          <span>中文（繁體）</span>
          <span>·</span>
          <a href="#" className="hover:text-gray-600 transition-colors">隱私權政策</a>
          <span>·</span>
          <a href="#" className="hover:text-gray-600 transition-colors">條款</a>
        </div>
      </div>
    </div>
  );
}
