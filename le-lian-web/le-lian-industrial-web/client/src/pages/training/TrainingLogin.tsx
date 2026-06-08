import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { X, ChevronRight } from 'lucide-react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
    </g>
  </svg>
);

const mockGoogleAccounts = [
  { email: 'wang@company.com',  name: '王小明',    photo: 'W', color: 'bg-green-500',  role: '員工',   dept: '組裝一線' },
  { email: 'li@company.com',    name: '李主管',    photo: 'L', color: 'bg-blue-500',   role: '主管',   dept: '組裝一線' },
  { email: 'admin@company.com', name: 'Admin 管理員', photo: 'A', color: 'bg-purple-500', role: '管理員', dept: '資訊部' },
  { email: 'chen@company.com',  name: '陳小芳',    photo: 'C', color: 'bg-orange-400', role: '員工',   dept: '組裝一線' },
  { email: 'zhang@company.com', name: '張泰勒',    photo: 'Z', color: 'bg-teal-500',   role: '員工',   dept: '品管部' },
];

export default function TrainingLogin() {
  const { login } = useTrainingAuth();
  const [, navigate] = useLocation();
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState('');

  const handleGoogleSelect = (email: string) => {
    setSigningIn(email);
    setLoading(true);
    setTimeout(() => {
      const user = login(email);
      if (user) navigate('/training/dashboard');
      setLoading(false);
      setSigningIn('');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Google account picker overlay */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowPicker(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Picker header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <GoogleIcon />
                <span className="text-sm font-medium text-gray-700">選擇帳號</span>
              </div>
              <button onClick={() => setShowPicker(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Subtitle */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <p className="text-xs text-gray-500">繼續前往 <span className="font-medium text-gray-700">樂聯工業員工訓練系統</span></p>
            </div>

            {/* Account list */}
            <div className="py-2">
              {mockGoogleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleGoogleSelect(acc.email)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-60 group"
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 ${acc.color} rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                    {signingIn === acc.email ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : acc.photo}
                  </div>
                  {/* Info */}
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{acc.name}</p>
                    <p className="text-xs text-gray-500 truncate">{acc.email}</p>
                  </div>
                  {/* Role badge */}
                  <span className="text-xs text-gray-400 flex-shrink-0">{acc.role}</span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-center text-gray-400">
                使用 Google 帳號登入即表示您同意公司教育訓練系統使用條款
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main login card */}
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/website/choice-logo.svg" alt="CHOICE" className="h-14 mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-gray-900">樂聯工業</h1>
          <p className="text-sm text-gray-500 mt-1">員工訓練系統</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">登入帳號</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            使用您的公司 Google 帳號繼續
          </p>

          {/* Sign in with Google button */}
          <button
            onClick={() => setShowPicker(true)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all font-medium text-gray-700 text-sm disabled:opacity-60 mb-4"
          >
            <GoogleIcon />
            使用 Google 帳號登入
          </button>

          <p className="text-xs text-center text-gray-400 mt-2">
            使用公司核發的 Google 帳號登入
          </p>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-400">
          <a href="#" className="hover:text-gray-600 transition-colors">中文（繁體）</a>
          <span>·</span>
          <a href="#" className="hover:text-gray-600 transition-colors">隱私權政策</a>
          <span>·</span>
          <a href="#" className="hover:text-gray-600 transition-colors">條款</a>
        </div>
      </div>
    </div>
  );
}
