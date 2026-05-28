import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { LogIn, User, Lock, ChevronRight } from 'lucide-react';

const demoUsers = [
  { email: 'wang@company.com', role: 'employee', name: '王小明', dept: '組裝一線', color: 'bg-green-500' },
  { email: 'li@company.com', role: 'manager', name: '李主管', dept: '組裝一線', color: 'bg-blue-500' },
  { email: 'admin@company.com', role: 'admin', name: 'Admin管理員', dept: '資訊部', color: 'bg-purple-500' },
];

const roleLabel: Record<string, string> = { employee: '員工', manager: '主管', admin: '管理員' };

export default function TrainingLogin() {
  const { login } = useTrainingAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const user = login(email);
      if (user) {
        navigate('/training/dashboard');
      } else {
        setError('找不到此帳號，請確認電子郵件地址。');
      }
      setLoading(false);
    }, 600);
  };

  const handleQuickLogin = (demoEmail: string) => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const user = login(demoEmail);
      if (user) navigate('/training/dashboard');
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-white/3 rounded-full" />
      </div>

      <div className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Branding */}
        <div className="text-white text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-blue-600 font-black text-2xl">LL</span>
            </div>
            <div>
              <h1 className="text-3xl font-black leading-tight">樂聯工業</h1>
              <p className="text-blue-200 text-sm font-medium">員工訓練系統</p>
            </div>
          </div>
          <h2 className="text-4xl font-black mb-3 leading-tight">
            核心技能<br />訓練平台
          </h2>
          <p className="text-blue-200 text-base leading-relaxed mb-8">
            專為製造業設計的企業培訓管理系統<br />
            支援台灣、泰國、越南、印尼多語言員工
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { num: '4+', label: '訓練課程' },
              { num: '5', label: '員工用戶' },
              { num: '100%', label: '合規達成率' },
            ].map(({ num, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-white">{num}</p>
                <p className="text-blue-200 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900">歡迎登入</h3>
            <p className="text-gray-500 text-sm mt-1">請輸入您的帳號資訊以繼續</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="請輸入電子郵件"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="請輸入密碼（任意）"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  登入
                </>
              )}
            </button>
          </form>

          {/* Quick login */}
          <div>
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-500">快速登入（Demo）</span>
              </div>
            </div>
            <div className="space-y-2">
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  onClick={() => handleQuickLogin(u.email)}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group disabled:opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${u.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                      {u.name[0]}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.dept} · {roleLabel[u.role]}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
