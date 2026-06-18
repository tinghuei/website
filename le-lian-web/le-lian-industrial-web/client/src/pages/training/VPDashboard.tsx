import { useState, useEffect, useMemo } from 'react';
import { Crown, Building2, ShieldAlert, TrendingUp, Calculator, Download, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { loadRoutine, loadRecords, type RoutineCourse } from '../../lib/physicalTrainingStorage';

const LS_ROI_KEY = 'training_roi_inputs_v1';

interface RoiInputs {
  trainingCost: number;
  qualityLossReduction: number;
  safetyImprovementSavings: number;
  efficiencyGains: number;
}

const DEFAULT_ROI: RoiInputs = {
  trainingCost: 50,
  qualityLossReduction: 120,
  safetyImprovementSavings: 30,
  efficiencyGains: 40,
};

function loadRoi(): RoiInputs {
  try {
    const raw = localStorage.getItem(LS_ROI_KEY);
    return raw ? { ...DEFAULT_ROI, ...JSON.parse(raw) } : { ...DEFAULT_ROI };
  } catch { return { ...DEFAULT_ROI }; }
}

function avg(nums: number[]): number | null {
  return nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : null;
}

export default function VPDashboard() {
  const { currentUser } = useTrainingAuth();
  const [routineCourses] = useState<RoutineCourse[]>(() => loadRoutine());
  const [records] = useState(() => loadRecords());
  const [roi, setRoi] = useState<RoiInputs>(() => loadRoi());

  useEffect(() => { localStorage.setItem(LS_ROI_KEY, JSON.stringify(roi)); }, [roi]);

  if (!currentUser || !['vp', 'admin'].includes(currentUser.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">您沒有權限查看此頁面</p>
      </div>
    );
  }

  // ── 例行性教育訓練總覽 ──
  const totalCourses = routineCourses.length;
  const completedCourses = routineCourses.filter(c => c.status === 'completed');
  const completionRate = totalCourses ? (completedCourses.length / totalCourses) * 100 : 0;
  const totalHours = routineCourses.reduce((s, c) => s + c.hours, 0);
  const totalParticipantSlots = routineCourses.reduce((s, c) => s + c.participants.length, 0);
  const distinctEmployees = new Set(routineCourses.flatMap(c => c.participants)).size;
  const avgHoursPerPerson = distinctEmployees ? totalHours / distinctEmployees : 0;

  // ── 部門分析 ──
  const deptStats = useMemo(() => {
    const map = new Map<string, { courseCount: number; completed: number; attendanceSum: number; attendanceCount: number }>();
    routineCourses.forEach(c => {
      const e = map.get(c.department) || { courseCount: 0, completed: 0, attendanceSum: 0, attendanceCount: 0 };
      e.courseCount += 1;
      if (c.status === 'completed') e.completed += 1;
      if (c.effectiveness) { e.attendanceSum += c.effectiveness.learningOutcome.attendanceRate; e.attendanceCount += 1; }
      map.set(c.department, e);
    });
    return Array.from(map.entries()).map(([dept, v]) => ({
      dept,
      courseCount: v.courseCount,
      completionRate: v.courseCount ? Math.round((v.completed / v.courseCount) * 100) : 0,
      attendanceRate: v.attendanceCount ? Math.round(v.attendanceSum / v.attendanceCount) : null,
    }));
  }, [routineCourses]);

  const mostCoursesDept = [...deptStats].sort((a, b) => b.courseCount - a.courseCount)[0];
  const lowestCompletionDept = [...deptStats].sort((a, b) => a.completionRate - b.completionRate)[0];
  const withAttendance = deptStats.filter(d => d.attendanceRate !== null);
  const lowestAttendanceDept = withAttendance.length ? [...withAttendance].sort((a, b) => (a.attendanceRate as number) - (b.attendanceRate as number))[0] : null;

  // ── 工安分析 ──
  const safetyCourses = routineCourses.filter(c => c.design?.category === '工安');
  const safetyWithEff = safetyCourses.filter(c => c.effectiveness);
  const safetyParticipation = avg(safetyWithEff.map(c => c.effectiveness!.learningOutcome.attendanceRate));
  const safetyViolationsBefore = safetyWithEff.reduce((s, c) => s + c.effectiveness!.kpiBefore.safetyViolations, 0);
  const safetyViolationsAfter = safetyWithEff.reduce((s, c) => s + c.effectiveness!.kpiAfter30Days.safetyViolations, 0);
  const safetyTrendData = safetyWithEff.map(c => ({
    name: c.courseName.length > 8 ? c.courseName.slice(0, 8) + '…' : c.courseName,
    課前違規: c.effectiveness!.kpiBefore.safetyViolations,
    課後違規: c.effectiveness!.kpiAfter30Days.safetyViolations,
  }));

  // ── 成效分析 ──
  const effectivenessRows = routineCourses.filter(c => c.effectiveness).map(c => {
    const eff = c.effectiveness!;
    const mgrAvg = avg(Object.values(eff.managerEvaluation));
    const kpiBeforeTotal = eff.kpiBefore.qualityIssues + eff.kpiBefore.complaints + eff.kpiBefore.safetyViolations + eff.kpiBefore.equipmentAnomalies;
    const kpiAfterTotal = eff.kpiAfter30Days.qualityIssues + eff.kpiAfter30Days.complaints + eff.kpiAfter30Days.safetyViolations + eff.kpiAfter30Days.equipmentAnomalies;
    const kpiImprovement = kpiBeforeTotal > 0 ? ((kpiBeforeTotal - kpiAfterTotal) / kpiBeforeTotal) * 100 : null;
    return {
      id: c.id, courseName: c.courseName,
      satisfaction: eff.learningOutcome.satisfaction,
      quizAvgScore: eff.learningOutcome.quizAvgScore,
      mgrAvg, kpiImprovement, judgment: eff.judgment,
    };
  });

  // ── Training ROI ──
  const totalBenefit = roi.qualityLossReduction + roi.safetyImprovementSavings + roi.efficiencyGains;
  const roiPercent = roi.trainingCost > 0 ? ((totalBenefit - roi.trainingCost) / roi.trainingCost) * 100 : 0;

  function exportRoiReport() {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><meta charset="utf-8"><title>教育訓練投資報酬率報告</title>
      <style>
        body { font-family: 'Microsoft JhengHei', sans-serif; padding: 32px; color: #1f2937; }
        h1 { text-align:center; font-size:20px; }
        table { width:100%; border-collapse:collapse; margin-top:20px; font-size:14px; }
        th, td { border:1px solid #d1d5db; padding:10px; text-align:left; }
        th { background:#f3f4f6; }
        .roi { text-align:center; font-size:36px; font-weight:800; color:#4338ca; margin:24px 0; }
      </style></head><body>
      <h1>樂聯工業股份有限公司 教育訓練投資報酬率（Training ROI）報告</h1>
      <p style="text-align:center;color:#6b7280;">列印日期：${new Date().toLocaleDateString('zh-TW')}</p>
      <table>
        <tr><th>教育訓練費用</th><td>${roi.trainingCost} 萬元</td></tr>
        <tr><th>品質損失降低</th><td>${roi.qualityLossReduction} 萬元</td></tr>
        <tr><th>工安改善減少損失</th><td>${roi.safetyImprovementSavings} 萬元</td></tr>
        <tr><th>人工效率提升效益</th><td>${roi.efficiencyGains} 萬元</td></tr>
        <tr><th>總效益</th><td>${totalBenefit} 萬元</td></tr>
      </table>
      <div class="roi">ROI = ${roiPercent.toFixed(0)}%</div>
      <p style="text-align:center;color:#6b7280;font-size:12px;">ROI = (總效益 − 教育訓練費用) ÷ 教育訓練費用 × 100%</p>
      <script>window.onload=()=>window.print();</script>
      </body></html>
    `);
    win.document.close();
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl p-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Crown size={28} className="text-yellow-300" />
          <div>
            <h1 className="text-xl font-bold text-white">經營層儀表板</h1>
            <p className="text-indigo-200 text-sm mt-0.5">例行性教育訓練成效總覽與投資報酬率分析</p>
          </div>
        </div>
        <button onClick={exportRoiReport} className="flex items-center gap-1.5 px-3 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg text-xs font-medium">
          <Download size={14} />匯出ROI報告
        </button>
      </div>

      {/* 例行性教育訓練總覽 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">例行性教育訓練總覽</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: '年度課程數', value: totalCourses, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: '完成率', value: `${completionRate.toFixed(0)}%`, color: 'text-green-600', bg: 'bg-green-50' },
            { label: '總訓練時數', value: `${totalHours}h`, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '人均訓練時數', value: `${avgHoursPerPerson.toFixed(1)}h`, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: '參訓人次', value: totalParticipantSlots, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-600 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 部門分析 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2"><Building2 size={18} className="text-blue-600" />部門分析</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-blue-500 mb-1">上課最多部門</p>
            <p className="text-lg font-bold text-blue-700">{mostCoursesDept?.dept || '—'}</p>
            <p className="text-xs text-gray-500">{mostCoursesDept ? `${mostCoursesDept.courseCount} 場課程` : ''}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="text-xs text-amber-600 mb-1">完成率最低部門</p>
            <p className="text-lg font-bold text-amber-700">{lowestCompletionDept?.dept || '—'}</p>
            <p className="text-xs text-gray-500">{lowestCompletionDept ? `完成率 ${lowestCompletionDept.completionRate}%` : ''}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-xs text-red-500 mb-1">出席率最低部門</p>
            <p className="text-lg font-bold text-red-700">{lowestAttendanceDept?.dept || '—'}</p>
            <p className="text-xs text-gray-500">{lowestAttendanceDept ? `出席率 ${lowestAttendanceDept.attendanceRate}%` : '尚無成效追蹤資料'}</p>
          </div>
        </div>
        {deptStats.length > 0 && (
          <ResponsiveContainer width="100%" height={Math.max(200, deptStats.length * 36)}>
            <BarChart data={deptStats} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="dept" width={90} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="courseCount" name="課程數" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 工安分析 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2"><ShieldAlert size={18} className="text-red-600" />工安分析</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{safetyCourses.length}</div>
            <div className="text-xs text-gray-600 mt-1">工安類課程（宣導）次數</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{safetyParticipation !== null ? `${safetyParticipation.toFixed(0)}%` : '—'}</div>
            <div className="text-xs text-gray-600 mt-1">平均參與率</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">{safetyViolationsAfter}</div>
            <div className="text-xs text-gray-600 mt-1">課後30天工安違規件數</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {safetyViolationsBefore > 0 ? `${(((safetyViolationsBefore - safetyViolationsAfter) / safetyViolationsBefore) * 100).toFixed(0)}%` : '—'}
            </div>
            <div className="text-xs text-gray-600 mt-1">違規改善幅度</div>
          </div>
        </div>
        {safetyTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={safetyTrendData} margin={{ left: 0, right: 20, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="課前違規" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="課後違規" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm flex flex-col items-center gap-2">
            <AlertTriangle size={24} className="opacity-40" />
            尚無工安類課程之成效追蹤資料
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3">資料來源：「實體教育訓練記錄」中課程類別為「工安」且已填寫成效追蹤表之例行課程，共 {records.length} 筆實體訓練記錄供稽核參考。</p>
      </div>

      {/* 成效分析 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <TrendingUp size={18} className="text-teal-600" />
          <h2 className="text-base font-semibold text-gray-800">成效分析（TTQS 成果評估）</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['課程名稱', '滿意度', '測驗成績', '主管評估(平均)', 'KPI改善率', '成效判定'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {effectivenessRows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">尚無已完成的成效追蹤資料</td></tr>
              ) : effectivenessRows.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-900 min-w-[160px]">{r.courseName}</td>
                  <td className="px-4 py-2.5 text-center text-orange-600 font-semibold">{r.satisfaction} ★</td>
                  <td className="px-4 py-2.5 text-center text-purple-600 font-semibold">{r.quizAvgScore}</td>
                  <td className="px-4 py-2.5 text-center text-blue-600 font-semibold">{r.mgrAvg !== null ? r.mgrAvg.toFixed(1) : '—'}</td>
                  <td className="px-4 py-2.5 text-center">
                    {r.kpiImprovement !== null ? (
                      <span className={`font-semibold ${r.kpiImprovement >= 0 ? 'text-green-600' : 'text-red-500'}`}>{r.kpiImprovement >= 0 ? '↓' : '↑'}{Math.abs(r.kpiImprovement).toFixed(0)}%</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      r.judgment === '成效顯著' ? 'bg-green-100 text-green-700' :
                      r.judgment === '符合預期' ? 'bg-blue-100 text-blue-700' :
                      r.judgment === '部分達成' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>{r.judgment}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Training ROI Calculator */}
      <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2"><Calculator size={18} className="text-indigo-600" />教育訓練投資報酬率（Training ROI）</h2>
        <p className="text-xs text-gray-500 mb-5">向股東、總經理、副總報告教育訓練效益最直接的呈現方式</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">教育訓練費用（萬元）</label>
              <input type="number" min={0} value={roi.trainingCost} onChange={e => setRoi(r => ({ ...r, trainingCost: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">品質損失降低（萬元）</label>
              <input type="number" min={0} value={roi.qualityLossReduction} onChange={e => setRoi(r => ({ ...r, qualityLossReduction: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">工安改善減少損失（萬元）</label>
              <input type="number" min={0} value={roi.safetyImprovementSavings} onChange={e => setRoi(r => ({ ...r, safetyImprovementSavings: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">人工效率提升效益（萬元）</label>
              <input type="number" min={0} value={roi.efficiencyGains} onChange={e => setRoi(r => ({ ...r, efficiencyGains: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-indigo-100 p-6 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-gray-500 mb-1">總效益</p>
            <p className="text-2xl font-bold text-gray-800 mb-4">{totalBenefit} 萬元</p>
            <p className="text-xs text-gray-500 mb-1">投資報酬率 ROI</p>
            <p className={`text-5xl font-extrabold ${roiPercent >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>{roiPercent.toFixed(0)}%</p>
            <p className="text-xs text-gray-400 mt-3">ROI = (總效益 − 訓練費用) ÷ 訓練費用 × 100%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
