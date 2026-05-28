import { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Users, CheckCircle, Star, Clock, Download, TrendingUp, BarChart2 } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';

const deptData = [
  { dept: '品保課', completion: 92, target: 80 },
  { dept: '資訊課', completion: 88, target: 80 },
  { dept: '業務課', completion: 85, target: 80 },
  { dept: '人力資源課', completion: 82, target: 80 },
  { dept: '財務課', completion: 78, target: 80 },
  { dept: '組裝一線', completion: 75, target: 80 },
  { dept: '組裝二線', completion: 71, target: 80 },
  { dept: '焊接線', completion: 68, target: 80 },
  { dept: '沖壓線', completion: 65, target: 80 },
  { dept: '塗裝線', completion: 62, target: 80 },
];

const monthlyData = [
  { month: '12月', planned: 240, actual: 198, participants: 89 },
  { month: '1月', planned: 180, actual: 165, participants: 72 },
  { month: '2月', planned: 160, actual: 142, participants: 68 },
  { month: '3月', planned: 280, actual: 251, participants: 98 },
  { month: '4月', planned: 200, actual: 188, participants: 76 },
  { month: '5月', planned: 220, actual: 175, participants: 82 },
];

const courseStatus = [
  { name: '已完成', value: 387, fill: '#22c55e' },
  { name: '進行中', value: 142, fill: '#3b82f6' },
  { name: '待開始', value: 89, fill: '#e5e7eb' },
  { name: '已退回', value: 23, fill: '#ef4444' },
];

export default function ManagementReports() {
  const { currentUser } = useTrainingAuth();
  const [exporting, setExporting] = useState<string | null>(null);

  if (!currentUser || !['manager', 'admin'].includes(currentUser.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">您沒有權限查看此頁面</p>
      </div>
    );
  }

  const exportDeptReport = () => {
    setExporting('dept');
    const ws = XLSX.utils.json_to_sheet(
      deptData.map((d) => ({
        部門: d.dept,
        完成率: `${d.completion}%`,
        目標: `${d.target}%`,
        達標: d.completion >= d.target ? '是' : '否',
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '部門完成率');
    XLSX.writeFile(wb, '部門完成率報告.xlsx');
    setTimeout(() => setExporting(null), 1000);
  };

  const exportPersonalReport = () => {
    setExporting('personal');
    const data = [
      { 員工編號: 'E001', 姓名: '陳大明', 部門: '品保課', 完成課程數: 8, 總訓練時數: 24, 平均分數: 88, 年度狀態: '達標' },
      { 員工編號: 'E002', 姓名: '李小華', 部門: '資訊課', 完成課程數: 7, 總訓練時數: 22, 平均分數: 92, 年度狀態: '達標' },
      { 員工編號: 'E003', 姓名: '王志偉', 部門: '塗裝線', 完成課程數: 3, 總訓練時數: 9, 平均分數: 71, 年度狀態: '未達標' },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '個人訓練紀錄');
    XLSX.writeFile(wb, '個人訓練紀錄.xlsx');
    setTimeout(() => setExporting(null), 1000);
  };

  const exportTTQSReport = () => {
    setExporting('ttqs');
    const summary = [
      { 指標: '年度訓練總時數', 數值: '1,119小時' },
      { 指標: '訓練總人次', 數值: '485人次' },
      { 指標: '平均每人訓練時數', 數值: '7.2小時' },
      { 指標: '整體完成率', 數值: '73%' },
      { 指標: '平均測驗分數', 數值: '82.4分' },
      { 指標: '證書發放數', 數值: '312張' },
      { 指標: '外部訓練比例', 數值: '38%' },
      { 指標: '內部訓練比例', 數值: '62%' },
    ];
    const ws = XLSX.utils.json_to_sheet(summary);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TTQS年度成效');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(deptData.map(d => ({
      部門: d.dept, 完成率: `${d.completion}%`, 目標: `${d.target}%`
    }))), '部門明細');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthlyData.map(m => ({
      月份: m.month, 計畫時數: m.planned, 實際時數: m.actual, 參與人數: m.participants
    }))), '月度趨勢');
    XLSX.writeFile(wb, 'TTQS年度成效報告.xlsx');
    setTimeout(() => setExporting(null), 1000);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart2 className="text-blue-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">管理報表</h1>
          <p className="text-sm text-gray-500">訓練成效分析儀表板・2026年5月</p>
        </div>
      </div>

      {/* Top Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Users className="text-blue-600" size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">總員工數</p>
            <p className="text-2xl font-bold text-gray-900">156<span className="text-sm font-normal text-gray-500 ml-1">人</span></p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle className="text-green-600" size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">本月訓練完成率</p>
            <p className="text-2xl font-bold text-gray-900">73<span className="text-sm font-normal text-gray-500 ml-0.5">%</span></p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
            <Star className="text-yellow-600" size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">平均測驗分數</p>
            <p className="text-2xl font-bold text-gray-900">82.4<span className="text-sm font-normal text-gray-500 ml-1">分</span></p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="text-red-600" size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">待審核件數</p>
            <p className="text-2xl font-bold text-gray-900">12<span className="text-sm font-normal text-gray-500 ml-1">件</span></p>
          </div>
        </div>
      </div>

      {/* Section 1: Dept Completion Bar Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-1">部門完成率分析</h2>
        <p className="text-sm text-gray-500 mb-4">各部門訓練完成率 vs 目標值（80%）</p>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={deptData} layout="vertical" margin={{ left: 20, right: 40, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="dept" width={70} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => [`${value}%`, '完成率']} />
            <Legend />
            <ReferenceLine x={80} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '目標 80%', position: 'top', fill: '#ef4444', fontSize: 11 }} />
            <Bar dataKey="completion" name="完成率" fill="#3b82f6" radius={[0, 4, 4, 0]}>
              {deptData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.completion >= entry.target ? '#22c55e' : '#f59e0b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block"></span>達標（≥80%）</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500 inline-block"></span>未達標（&lt;80%）</span>
        </div>
      </div>

      {/* Section 2: Monthly Trend Line Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-1">月度訓練趨勢</h2>
        <p className="text-sm text-gray-500 mb-4">近6個月計畫 vs 實際訓練時數</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlyData} margin={{ left: 0, right: 20, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="hours" />
            <YAxis yAxisId="people" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="hours" type="monotone" dataKey="planned" name="計畫時數" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="hours" type="monotone" dataKey="actual" name="實際時數" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="people" type="monotone" dataKey="participants" name="參與人數" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Section 3: Course Status Pie + Section 4: AI Analysis side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-1">課程完成狀態分佈</h2>
          <p className="text-sm text-gray-500 mb-4">全體員工課程報名狀態（共641筆）</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={courseStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {courseStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}筆`]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* AI Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center gap-2">
            <TrendingUp className="text-white" size={20} />
            <h2 className="text-lg font-bold text-white">AI 智能分析報告</h2>
          </div>
          <div className="p-6">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
{`📊 本月訓練成效摘要（2026年5月）

整體表現：本月訓練完成率73%，較上月提升5個百分點。

⚠️ 需要關注：
• 塗裝線完成率僅62%，低於公司目標80%，建議主管進行個別面談
• 焊接線、沖壓線完成率偏低，需加強課程推動

✅ 優秀表現：
• 品保課完成率92%，超越目標12個百分點，值得表揚
• 本月新增完訓證書發放47張，較上月增加18%

🎯 建議行動：
1. 對完成率低於70%的部門安排補救訓練
2. 推動外籍員工參與多語言課程（目前參與率45%）
3. 下月重點推動：智慧製造與ISO品質課程`}
            </pre>
          </div>
        </div>
      </div>

      {/* Section 5: Export Buttons */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">匯出管理報表</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportDeptReport}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            {exporting === 'dept' ? '匯出中...' : '匯出部門完成率報告'}
          </button>
          <button
            onClick={exportPersonalReport}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            {exporting === 'personal' ? '匯出中...' : '匯出個人訓練紀錄'}
          </button>
          <button
            onClick={exportTTQSReport}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            {exporting === 'ttqs' ? '匯出中...' : '匯出TTQS年度成效報告'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">報表格式：Excel (.xlsx)・資料截止日：2026年5月28日</p>
      </div>
    </div>
  );
}
