import { useState, useMemo } from 'react';
import { TrendingUp, CheckCircle, Clock, AlertCircle, ChevronDown, X, Plus } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface L3Confirmation {
  id: string;
  enrollmentId: string;
  userId: string;
  courseId: string;
  courseName: string;
  userName: string;
  quarter: string; // e.g. "2026-Q2"
  applicationContent: string; // 實際應用內容
  confirmedAt: string | null;
  status: 'pending' | 'confirmed' | 'overdue';
  kpiNote: string;
}

interface L4Report {
  id: string;
  courseId: string;
  courseName: string;
  department: string;
  period: string;
  kpiType: string;
  baselineValue: string;
  currentValue: string;
  improvement: string;
  reportedBy: string;
  reportedAt: string;
}

const currentQuarter = (() => {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `${now.getFullYear()}-Q${q}`;
})();

const INITIAL_L3: L3Confirmation[] = [
  { id: 'l3-1', enrollmentId: 'enr1', userId: 'u2', courseId: 'c1', courseName: '職業安全衛生法規研習', userName: '王小明', quarter: '2026-Q2', applicationContent: '在工作中主動確認個人防護裝備的使用，並提醒同事注意安全規範', confirmedAt: '2026-04-15', status: 'confirmed', kpiNote: '本季零工傷事故' },
  { id: 'l3-2', enrollmentId: 'enr2', userId: 'u3', courseId: 'c2', courseName: '5S推行與現場管理', userName: '陳美玲', quarter: '2026-Q2', applicationContent: '', confirmedAt: null, status: 'pending', kpiNote: '' },
  { id: 'l3-3', enrollmentId: 'enr3', userId: 'u4', courseId: 'c3', courseName: 'ISO 9001 品質管理系統', userName: '林志偉', quarter: '2026-Q1', applicationContent: '協助部門完成ISO內部稽核，運用課程學到的稽核技巧找出3個改善點', confirmedAt: '2026-03-20', status: 'confirmed', kpiNote: '不合格品率降低 2%' },
  { id: 'l3-4', enrollmentId: 'enr4', userId: 'u5', courseId: 'c4', courseName: '精實生產與浪費消除', userName: '黃雅婷', quarter: '2026-Q2', applicationContent: '', confirmedAt: null, status: 'overdue', kpiNote: '' },
  { id: 'l3-5', enrollmentId: 'enr5', userId: 'u2', courseId: 'c2', courseName: '5S推行與現場管理', userName: '王小明', quarter: '2026-Q1', applicationContent: '帶領小組完成工作區域整理整頓，減少尋找工具時間約15分鐘/天', confirmedAt: '2026-03-10', status: 'confirmed', kpiNote: '作業效率提升 8%' },
];

const INITIAL_L4: L4Report[] = [
  { id: 'l4-1', courseId: 'c1', courseName: '職業安全衛生法規研習', department: '管理部', period: '2026-Q1', kpiType: '工安事故率', baselineValue: '2件/月', currentValue: '0件/月', improvement: '下降 100%', reportedBy: '李主管', reportedAt: '2026-04-01' },
  { id: 'l4-2', courseId: 'c3', courseName: 'ISO 9001 品質管理系統', department: '品保課', period: '2026-Q1', kpiType: '不合格品率', baselineValue: '3.2%', currentValue: '1.8%', improvement: '下降 43.75%', reportedBy: '品保主管', reportedAt: '2026-04-05' },
];

const QUARTERS = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4', '2025-Q4'];
const DEPARTMENTS = ['全部', '品保課', '管理部', '工程課', '生管課', '製造課'];

type TabId = 'overview' | 'l1' | 'l2' | 'l3' | 'l4';

export default function PerformanceTracking() {
  const { currentUser, enrollments, users, courses } = useTrainingAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [l3Records, setL3Records] = useState<L3Confirmation[]>(INITIAL_L3);
  const [l4Reports, setL4Reports] = useState<L4Report[]>(INITIAL_L4);
  const [quarterFilter, setQuarterFilter] = useState(currentQuarter);
  const [deptFilter, setDeptFilter] = useState('全部');
  const [selectedL3, setSelectedL3] = useState<string | null>(null);
  const [applicationText, setApplicationText] = useState('');
  const [kpiNote, setKpiNote] = useState('');
  const [showAddL4, setShowAddL4] = useState(false);
  const [l4Form, setL4Form] = useState({ courseId: '', department: '', period: currentQuarter, kpiType: '', baselineValue: '', currentValue: '', improvement: '' });
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const isHRAdmin = currentUser && ['admin', 'hr', 'manager'].includes(currentUser.role);
  const isEmployee = currentUser?.role === 'employee';

  // My L3 items (for employee view)
  const myL3 = useMemo(() =>
    l3Records.filter(r => r.userId === currentUser?.id || r.userName === currentUser?.name),
    [l3Records, currentUser]
  );

  // All L3 filtered (for hr/admin)
  const filteredL3 = useMemo(() => {
    return l3Records.filter(r =>
      (quarterFilter === 'all' || r.quarter === quarterFilter)
    );
  }, [l3Records, quarterFilter]);

  // L1: satisfaction from enrollments
  const l1Data = useMemo(() => {
    const surveyEnrs = enrollments.filter(e => e.surveyData);
    const avgPerCourse = courses.slice(0, 8).map(c => {
      const ces = surveyEnrs.filter(e => e.courseId === c.id);
      const avgOverall = ces.length ? ces.reduce((s, e) => s + Number(e.surveyData?.overall || 0), 0) / ces.length : 0;
      return { name: c.title.length > 10 ? c.title.slice(0, 10) + '…' : c.title, 滿意度: parseFloat(avgOverall.toFixed(1)), 回覆數: ces.length };
    }).filter(d => d.回覆數 > 0);
    return avgPerCourse;
  }, [enrollments, courses]);

  // L2: quiz scores
  const l2Data = useMemo(() => {
    const scored = enrollments.filter(e => e.quizScore !== null);
    const avgPerCourse = courses.slice(0, 8).map(c => {
      const ces = scored.filter(e => e.courseId === c.id);
      const avgScore = ces.length ? ces.reduce((s, e) => s + (e.quizScore || 0), 0) / ces.length : 0;
      return { name: c.title.length > 10 ? c.title.slice(0, 10) + '…' : c.title, 平均分數: parseFloat(avgScore.toFixed(0)), 人數: ces.length };
    }).filter(d => d.人數 > 0);
    return avgPerCourse;
  }, [enrollments, courses]);

  // Overview stats
  const l3ConfirmedCount = l3Records.filter(r => r.status === 'confirmed').length;
  const l3PendingCount = l3Records.filter(r => r.status === 'pending').length;
  const l3OverdueCount = l3Records.filter(r => r.status === 'overdue').length;
  const overallSat = enrollments.filter(e => e.surveyData?.overall).length > 0
    ? (enrollments.reduce((s, e) => s + Number(e.surveyData?.overall || 0), 0) / enrollments.filter(e => e.surveyData?.overall).length).toFixed(1)
    : '-';
  const avgScore = enrollments.filter(e => e.quizScore).length > 0
    ? Math.round(enrollments.reduce((s, e) => s + (e.quizScore || 0), 0) / enrollments.filter(e => e.quizScore).length)
    : 0;

  const handleConfirmL3 = (id: string) => {
    if (!applicationText.trim()) return;
    setL3Records(prev => prev.map(r =>
      r.id === id ? { ...r, applicationContent: applicationText, kpiNote, confirmedAt: new Date().toLocaleDateString('zh-TW'), status: 'confirmed' as const } : r
    ));
    setSelectedL3(null);
    setApplicationText('');
    setKpiNote('');
    showToast('✓ 績效確認已提交');
  };

  const handleAddL4 = () => {
    if (!l4Form.courseId || !l4Form.kpiType) return;
    const course = courses.find(c => c.id === l4Form.courseId);
    setL4Reports(prev => [...prev, {
      id: `l4-${Date.now()}`,
      courseId: l4Form.courseId,
      courseName: course?.title || '',
      department: l4Form.department,
      period: l4Form.period,
      kpiType: l4Form.kpiType,
      baselineValue: l4Form.baselineValue,
      currentValue: l4Form.currentValue,
      improvement: l4Form.improvement,
      reportedBy: currentUser?.name || '系統',
      reportedAt: new Date().toISOString().split('T')[0],
    }]);
    setL4Form({ courseId: '', department: '', period: currentQuarter, kpiType: '', baselineValue: '', currentValue: '', improvement: '' });
    setShowAddL4(false);
    showToast('L4 成果報告已新增');
  };

  const TABS: { id: TabId; label: string; color: string }[] = [
    { id: 'overview', label: '總覽', color: 'gray' },
    { id: 'l1', label: 'L1 反應評估', color: 'blue' },
    { id: 'l2', label: 'L2 學習評估', color: 'green' },
    { id: 'l3', label: 'L3 行為評估', color: 'orange' },
    { id: 'l4', label: 'L4 成果評估', color: 'purple' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <span className="text-green-400">✓</span>{toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <TrendingUp size={22} className="text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">訓練績效追蹤</h1>
          <p className="text-sm text-gray-500">Kirkpatrick 四層次評估模型 · L1 反應 / L2 學習 / L3 行為 / L4 成果</p>
        </div>
      </div>

      {/* Kirkpatrick explanation */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { level: 'L1', label: '反應評估', desc: '學員滿意度調查', color: 'blue', icon: '😊' },
          { level: 'L2', label: '學習評估', desc: '課程測驗成績', color: 'green', icon: '📝' },
          { level: 'L3', label: '行為評估', desc: '每季工作應用確認', color: 'orange', icon: '⚙️' },
          { level: 'L4', label: '成果評估', desc: '業績/KPI改善成效', color: 'purple', icon: '📈' },
        ].map(({ level, label, desc, color, icon }) => (
          <div key={level} className={`bg-white rounded-xl border border-${color}-100 shadow-sm p-4 text-center`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className={`text-xs font-bold text-${color}-600 mb-0.5`}>{level}</div>
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap px-3 ${activeTab === id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'L1 平均滿意度', value: `${overallSat} ★`, sub: '/ 5.0 分', color: 'blue' },
              { label: 'L2 平均測驗分', value: `${avgScore} 分`, sub: `${enrollments.filter(e => e.quizScore).length} 人作答`, color: 'green' },
              { label: 'L3 已確認', value: `${l3ConfirmedCount}`, sub: `待確認 ${l3PendingCount} · 逾期 ${l3OverdueCount}`, color: 'orange' },
              { label: 'L4 成果報告', value: `${l4Reports.length}`, sub: '份已提交', color: 'purple' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
                <p className={`text-3xl font-bold text-${color}-600 mb-1`}>{value}</p>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* L3 Status summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4">L3 本季在職應用確認狀態（{currentQuarter}）</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center bg-green-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-600">{l3ConfirmedCount}</p>
                <p className="text-sm text-green-700 font-medium mt-1">已確認</p>
              </div>
              <div className="text-center bg-yellow-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-yellow-600">{l3PendingCount}</p>
                <p className="text-sm text-yellow-700 font-medium mt-1">待確認</p>
              </div>
              <div className="text-center bg-red-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-red-600">{l3OverdueCount}</p>
                <p className="text-sm text-red-700 font-medium mt-1">逾期未確認</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* L1: Satisfaction */}
      {activeTab === 'l1' && (
        <div className="space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">L1 反應評估 — 學員滿意度調查</p>
            <p>測量學員對課程的即時反應，包含課程內容、授課講師、教材品質及實用性，由完訓後的滿意度調查收集。</p>
          </div>
          {l1Data.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
              <p>尚無滿意度資料。員工完訓並提交調查後，資料將在此顯示。</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">各課程整體滿意度評分</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={l1Data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v} ★`, '滿意度']} />
                  <Bar dataKey="滿意度" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* L2: Learning */}
      {activeTab === 'l2' && (
        <div className="space-y-5">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
            <p className="font-semibold mb-1">L2 學習評估 — 知識測驗成績</p>
            <p>透過課程結束後的測驗評量學員的知識吸收程度，及格分數為 70 分，反映學習成效。</p>
          </div>
          {l2Data.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
              <p>尚無測驗資料。員工完成課程測驗後，資料將在此顯示。</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-4">各課程平均測驗分數</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={l2Data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="平均分數" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Score table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">測驗成績明細</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['員工', '課程', '測驗分數', '狀態'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {enrollments.filter(e => e.quizScore !== null).map(e => {
                    const u = users.find(u => u.id === e.userId);
                    const c = courses.find(c => c.id === e.courseId);
                    return (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-800">{u?.name || '-'}</td>
                        <td className="px-4 py-2 text-gray-600 max-w-[180px] truncate">{c?.title || '-'}</td>
                        <td className="px-4 py-2">
                          <span className={`text-sm font-bold ${(e.quizScore || 0) >= 70 ? 'text-green-600' : 'text-red-500'}`}>{e.quizScore} 分</span>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(e.quizScore || 0) >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {(e.quizScore || 0) >= 70 ? '及格' : '不及格'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* L3: Behavior - Quarterly Confirmation */}
      {activeTab === 'l3' && (
        <div className="space-y-5">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
            <p className="font-semibold mb-1">L3 行為評估 — 每季在職應用確認</p>
            <p>每位完成訓練的員工每三個月需確認是否將訓練內容實際應用於工作，並描述具體應用情形。此項目為 TTQS 評核重點，請員工認真填寫。</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select value={quarterFilter} onChange={e => setQuarterFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white">
              <option value="all">全部季度</option>
              {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
            <span className="text-sm text-gray-500">{isEmployee ? `我的確認項目：${myL3.length} 項` : `共 ${filteredL3.length} 筆`}</span>
          </div>

          {/* Employee view: my items to confirm */}
          {isEmployee && (
            <div className="space-y-3">
              {myL3.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                  <p>目前沒有需要確認的在職應用項目</p>
                </div>
              ) : myL3.map(r => (
                <div key={r.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${r.status === 'overdue' ? 'border-red-200' : r.status === 'confirmed' ? 'border-green-200' : 'border-orange-200'}`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{r.courseName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{r.quarter} 季度確認</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${r.status === 'confirmed' ? 'bg-green-100 text-green-700' : r.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-700'}`}>
                        {r.status === 'confirmed' ? '已確認' : r.status === 'overdue' ? '逾期' : '待確認'}
                      </span>
                    </div>

                    {r.status === 'confirmed' ? (
                      <div className="bg-green-50 rounded-lg p-3 mt-2">
                        <p className="text-xs font-semibold text-green-700 mb-1">應用內容</p>
                        <p className="text-sm text-green-800">{r.applicationContent}</p>
                        {r.kpiNote && <p className="text-xs text-green-600 mt-1">績效指標：{r.kpiNote}</p>}
                        <p className="text-xs text-green-500 mt-1">確認時間：{r.confirmedAt}</p>
                      </div>
                    ) : (
                      selectedL3 === r.id ? (
                        <div className="mt-3 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                              請描述您如何將「{r.courseName}」的訓練內容應用於實際工作 *
                            </label>
                            <textarea
                              value={applicationText}
                              onChange={e => setApplicationText(e.target.value)}
                              placeholder="例如：在工作中使用了課程中學到的...，並因此改善了..."
                              rows={3}
                              className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">績效改善指標（選填）</label>
                            <input
                              type="text"
                              value={kpiNote}
                              onChange={e => setKpiNote(e.target.value)}
                              placeholder="例如：不良率降低 X%、作業時間縮短 X 分鐘..."
                              className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setSelectedL3(null); setApplicationText(''); setKpiNote(''); }} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">取消</button>
                            <button
                              onClick={() => handleConfirmL3(r.id)}
                              disabled={!applicationText.trim()}
                              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                              確認已應用到工作
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setSelectedL3(r.id); setApplicationText(''); setKpiNote(''); }}
                          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <CheckCircle size={15} />
                          填寫在職應用確認
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* HR/Admin view: all records */}
          {!isEmployee && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">L3 在職應用確認總覽</h3>
                <div className="flex gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">已確認 {l3Records.filter(r => r.status === 'confirmed').length}</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium">待確認 {l3Records.filter(r => r.status === 'pending').length}</span>
                  <span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium">逾期 {l3Records.filter(r => r.status === 'overdue').length}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['員工', '課程名稱', '季度', '應用內容', '績效指標', '確認時間', '狀態'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredL3.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{r.userName}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{r.courseName}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{r.quarter}</td>
                        <td className="px-4 py-3 max-w-[200px]">
                          {r.applicationContent ? (
                            <p className="text-xs text-gray-700 line-clamp-2">{r.applicationContent}</p>
                          ) : <span className="text-xs text-gray-400">（未填寫）</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-[100px] truncate">{r.kpiNote || '-'}</td>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{r.confirmedAt || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === 'confirmed' ? 'bg-green-100 text-green-700' : r.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                            {r.status === 'confirmed' ? '已確認' : r.status === 'overdue' ? '逾期' : '待確認'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* L4: Results */}
      {activeTab === 'l4' && (
        <div className="space-y-5">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-800">
            <p className="font-semibold mb-1">L4 成果評估 — 業績與 KPI 改善</p>
            <p>評估訓練對組織業績或關鍵績效指標的實際影響，由部門主管或HR填寫。此層次最難量化，但對於證明訓練投資效益最為重要。</p>
          </div>

          {isHRAdmin && (
            <div className="flex justify-end">
              <button onClick={() => setShowAddL4(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Plus size={15} /> 新增成果報告
              </button>
            </div>
          )}

          <div className="space-y-4">
            {l4Reports.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
                <p>尚無 L4 成果報告</p>
                <p className="text-xs mt-1">由 HR 或主管填寫訓練成果後，資料將在此顯示</p>
              </div>
            ) : l4Reports.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-purple-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{r.courseName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.department} · {r.period} · 填報：{r.reportedBy}</p>
                  </div>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">{r.reportedAt}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">KPI 指標</p>
                    <p className="text-sm font-semibold text-gray-800">{r.kpiType}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">基準值 → 現值</p>
                    <p className="text-sm font-semibold text-gray-800">{r.baselineValue} → {r.currentValue}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 mb-1">改善幅度</p>
                    <p className="text-sm font-bold text-green-700">{r.improvement}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add L4 Report Modal */}
          {showAddL4 && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">新增 L4 成果報告</h3>
                  <button onClick={() => setShowAddL4(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">相關課程 *</label>
                      <select value={l4Form.courseId} onChange={e => setL4Form(f => ({ ...f, courseId: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white">
                        <option value="">請選擇課程</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">部門</label>
                      <input type="text" value={l4Form.department} onChange={e => setL4Form(f => ({ ...f, department: e.target.value }))} placeholder="品保課" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">評估期間</label>
                      <select value={l4Form.period} onChange={e => setL4Form(f => ({ ...f, period: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white">
                        {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">KPI 指標名稱 *</label>
                      <input type="text" value={l4Form.kpiType} onChange={e => setL4Form(f => ({ ...f, kpiType: e.target.value }))} placeholder="不合格品率 / 工安事故數 / 作業效率" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">基準值（訓前）</label>
                      <input type="text" value={l4Form.baselineValue} onChange={e => setL4Form(f => ({ ...f, baselineValue: e.target.value }))} placeholder="3.2%" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">現行值（訓後）</label>
                      <input type="text" value={l4Form.currentValue} onChange={e => setL4Form(f => ({ ...f, currentValue: e.target.value }))} placeholder="1.8%" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">改善幅度</label>
                      <input type="text" value={l4Form.improvement} onChange={e => setL4Form(f => ({ ...f, improvement: e.target.value }))} placeholder="下降 43.75%" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 flex gap-3">
                  <button onClick={() => setShowAddL4(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">取消</button>
                  <button onClick={handleAddL4} disabled={!l4Form.courseId || !l4Form.kpiType} className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    提交成果報告
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
