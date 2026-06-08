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
  { dept: '總經理室', completion: 95, target: 80 },
  { dept: '品保課', completion: 92, target: 80 },
  { dept: '管理部', completion: 90, target: 80 },
  { dept: '財務部', completion: 88, target: 80 },
  { dept: '業務課', completion: 85, target: 80 },
  { dept: '研發課', completion: 83, target: 80 },
  { dept: '總務課', completion: 82, target: 80 },
  { dept: '人資安全組', completion: 80, target: 80 },
  { dept: '廠務部', completion: 76, target: 80 },
  { dept: '製造課', completion: 74, target: 80 },
  { dept: '沖床組', completion: 71, target: 80 },
  { dept: '塗裝組', completion: 68, target: 80 },
  { dept: '加工組', completion: 65, target: 80 },
  { dept: '組一組', completion: 63, target: 80 },
  { dept: '組二組', completion: 61, target: 80 },
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

    // Build SVG bar chart for dept completion
    const barW = 420, barH = 280, barLeft = 80;
    const deptBars = deptData.map((d, i) => {
      const y = 20 + i * 26;
      const w = Math.round((d.completion / 100) * (barW - barLeft - 10));
      const fill = d.completion >= d.target ? '#22c55e' : '#f59e0b';
      return `<g>
        <text x="0" y="${y + 14}" font-size="10" fill="#374151">${d.dept}</text>
        <rect x="${barLeft}" y="${y}" width="${w}" height="18" fill="${fill}" rx="2"/>
        <text x="${barLeft + w + 4}" y="${y + 13}" font-size="10" fill="#374151">${d.completion}%</text>
        <line x1="${barLeft + Math.round(0.8 * (barW - barLeft - 10))}" y1="${y}" x2="${barLeft + Math.round(0.8 * (barW - barLeft - 10))}" y2="${y + 18}" stroke="#ef4444" stroke-dasharray="3,2" stroke-width="1"/>
      </g>`;
    }).join('');

    // Build SVG line chart for monthly trend
    const mx = 50, my = 20, mw = 420, mh = 200;
    const maxVal = 300;
    const pts = (key: 'planned' | 'actual') => monthlyData.map((d, i) => {
      const x = mx + i * ((mw - mx) / (monthlyData.length - 1));
      const y = my + mh - (d[key] / maxVal) * mh;
      return `${x},${y}`;
    }).join(' ');
    const monthLabels = monthlyData.map((d, i) => {
      const x = mx + i * ((mw - mx) / (monthlyData.length - 1));
      return `<text x="${x}" y="${my + mh + 16}" text-anchor="middle" font-size="10" fill="#6b7280">${d.month}</text>`;
    }).join('');

    // Pie chart for course status
    const total = courseStatus.reduce((s, c) => s + c.value, 0);
    let startAngle = -Math.PI / 2;
    const cx2 = 120, cy2 = 110, r = 80;
    const slices = courseStatus.map(c => {
      const angle = (c.value / total) * 2 * Math.PI;
      const x1 = cx2 + r * Math.cos(startAngle);
      const y1 = cy2 + r * Math.sin(startAngle);
      startAngle += angle;
      const x2 = cx2 + r * Math.cos(startAngle);
      const y2 = cy2 + r * Math.sin(startAngle);
      const large = angle > Math.PI ? 1 : 0;
      return `<path d="M ${cx2} ${cy2} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${c.fill}" opacity="0.85"/>`;
    }).join('');
    const pieLegend = courseStatus.map((c, i) => `<text x="250" y="${60 + i * 22}" font-size="11" fill="#374151">■ ${c.name}：${c.value}筆 (${Math.round(c.value/total*100)}%)</text><rect x="240" y="${48 + i * 22}" width="12" height="12" fill="${c.fill}"/>`).join('');

    const html = `<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8">
<title>TTQS年度成效報告 2026</title>
<style>
  body { font-family: 'Microsoft JhengHei', Arial, sans-serif; margin: 0; padding: 20px; color: #1f2937; background: #f9fafb; }
  .cover { background: linear-gradient(135deg,#1d4ed8,#4f46e5); color:white; padding:40px; border-radius:12px; text-align:center; margin-bottom:24px; }
  .cover h1 { font-size:28px; margin:0 0 8px; }
  .cover p { font-size:14px; opacity:.85; margin:0; }
  .section { background:white; border-radius:10px; padding:20px; margin-bottom:20px; box-shadow:0 1px 4px rgba(0,0,0,.08); page-break-inside:avoid; }
  .section h2 { font-size:16px; font-weight:700; color:#1d4ed8; margin:0 0 12px; padding-bottom:8px; border-bottom:2px solid #e5e7eb; }
  .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:4px; }
  .kpi { background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:14px; text-align:center; }
  .kpi .val { font-size:22px; font-weight:800; color:#0284c7; }
  .kpi .lbl { font-size:11px; color:#64748b; margin-top:4px; }
  @media print { body { background:white; } .section { box-shadow:none; border:1px solid #e5e7eb; } }
</style></head><body>
<div class="cover">
  <h1>樂聯工業股份有限公司</h1>
  <h1>TTQS 年度訓練成效報告</h1>
  <p>報告期間：2025年12月 – 2026年5月｜列印日期：${new Date().toLocaleDateString('zh-TW')}</p>
</div>

<div class="section">
  <h2>📊 年度關鍵績效指標</h2>
  <div class="kpi-grid">
    <div class="kpi"><div class="val">1,119</div><div class="lbl">年度訓練總時數（小時）</div></div>
    <div class="kpi"><div class="val">485</div><div class="lbl">訓練總人次</div></div>
    <div class="kpi"><div class="val">7.2</div><div class="lbl">平均每人訓練時數</div></div>
    <div class="kpi"><div class="val">73%</div><div class="lbl">整體完成率</div></div>
    <div class="kpi"><div class="val">82.4</div><div class="lbl">平均測驗分數（分）</div></div>
    <div class="kpi"><div class="val">312</div><div class="lbl">結業證書發放數</div></div>
    <div class="kpi"><div class="val">38%</div><div class="lbl">外部訓練比例</div></div>
    <div class="kpi"><div class="val">62%</div><div class="lbl">內部訓練比例</div></div>
  </div>
</div>

<div class="section">
  <h2>📈 各部門訓練完成率（目標：80%）</h2>
  <svg width="100%" viewBox="0 0 520 ${20 + deptData.length * 26 + 20}" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="12" font-size="10" fill="#9ca3af">部門</text>
    <text x="${barLeft + Math.round(0.8*(barW-barLeft-10)) - 18}" y="12" font-size="10" fill="#ef4444">目標80%</text>
    ${deptBars}
    <rect x="${barLeft + 10}" y="${20 + deptData.length * 26 - 6}" width="12" height="12" fill="#22c55e"/>
    <text x="${barLeft + 26}" y="${20 + deptData.length * 26 + 6}" font-size="10" fill="#374151">達標（≥80%）</text>
    <rect x="${barLeft + 130}" y="${20 + deptData.length * 26 - 6}" width="12" height="12" fill="#f59e0b"/>
    <text x="${barLeft + 146}" y="${20 + deptData.length * 26 + 6}" font-size="10" fill="#374151">未達標（&lt;80%）</text>
  </svg>
</div>

<div class="section">
  <h2>📉 月度訓練趨勢（計畫 vs 實際時數）</h2>
  <svg width="100%" viewBox="0 0 ${mw + 20} ${my + mh + 40}" xmlns="http://www.w3.org/2000/svg">
    <line x1="${mx}" y1="${my}" x2="${mx}" y2="${my+mh}" stroke="#e5e7eb" stroke-width="1"/>
    <line x1="${mx}" y1="${my+mh}" x2="${mw}" y2="${my+mh}" stroke="#e5e7eb" stroke-width="1"/>
    ${[0,100,200,300].map(v => `<text x="${mx-4}" y="${my+mh-(v/maxVal)*mh+4}" text-anchor="end" font-size="10" fill="#9ca3af">${v}</text><line x1="${mx}" y1="${my+mh-(v/maxVal)*mh}" x2="${mw}" y2="${my+mh-(v/maxVal)*mh}" stroke="#f3f4f6" stroke-width="1"/>`).join('')}
    <polyline points="${pts('planned')}" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,3"/>
    <polyline points="${pts('actual')}" fill="none" stroke="#3b82f6" stroke-width="2.5"/>
    ${monthLabels}
    <circle cx="${mx+20}" cy="${my+mh+30}" r="5" fill="#94a3b8"/><text x="${mx+28}" y="${my+mh+34}" font-size="10" fill="#374151">計畫時數</text>
    <circle cx="${mx+110}" cy="${my+mh+30}" r="5" fill="#3b82f6"/><text x="${mx+118}" y="${my+mh+34}" font-size="10" fill="#374151">實際時數</text>
  </svg>
  <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:12px">
    <thead><tr style="background:#f1f5f9">${['月份','計畫時數','實際時數','達成率','參與人數'].map(h=>`<th style="padding:6px 10px;text-align:left;border:1px solid #e5e7eb">${h}</th>`).join('')}</tr></thead>
    <tbody>${monthlyData.map((d,i)=>`<tr style="background:${i%2?'#f9fafb':'white'}">
      <td style="padding:6px 10px;border:1px solid #e5e7eb">${d.month}</td>
      <td style="padding:6px 10px;border:1px solid #e5e7eb">${d.planned}</td>
      <td style="padding:6px 10px;border:1px solid #e5e7eb">${d.actual}</td>
      <td style="padding:6px 10px;border:1px solid #e5e7eb;color:${d.actual/d.planned>=0.9?'#16a34a':'#d97706'}">${Math.round(d.actual/d.planned*100)}%</td>
      <td style="padding:6px 10px;border:1px solid #e5e7eb">${d.participants}人</td>
    </tr>`).join('')}</tbody>
  </table>
</div>

<div class="section">
  <h2>🥧 課程完成狀態分佈</h2>
  <svg width="100%" viewBox="0 0 440 240" xmlns="http://www.w3.org/2000/svg">
    ${slices}
    <circle cx="${cx2}" cy="${cy2}" r="40" fill="white"/>
    <text x="${cx2}" y="${cy2-6}" text-anchor="middle" font-size="13" font-weight="bold" fill="#374151">${total}</text>
    <text x="${cx2}" y="${cy2+14}" text-anchor="middle" font-size="10" fill="#6b7280">總筆數</text>
    ${pieLegend}
  </svg>
</div>

<div class="section">
  <h2>🤖 AI 智能分析摘要</h2>
  <div style="background:#f0f4ff;border-left:4px solid #3b82f6;padding:16px;border-radius:0 8px 8px 0;font-size:13px;line-height:1.8">
    <b>本月訓練成效摘要（2026年5月）</b><br/>
    整體表現：本月訓練完成率73%，較上月提升5個百分點。<br/>
    ⚠️ 需要關注：塗裝線完成率僅62%，低於公司目標80%；焊接線、沖壓線完成率偏低，需加強推動。<br/>
    ✅ 優秀表現：品保課完成率92%，超越目標12個百分點；本月新增完訓證書47張，較上月增加18%。<br/>
    🎯 建議行動：對完成率低於70%的部門安排補救訓練；推動外籍員工參與多語言課程；下月重點：智慧製造與ISO品質課程。
  </div>
</div>

<script>window.onload=()=>window.print();</script>
</body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
    setTimeout(() => setExporting(null), 1000);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header - matches video: blue banner with export buttons */}
      <div className="bg-blue-600 rounded-2xl p-5 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-xl font-bold text-white">管理後台</h1>
          <p className="text-blue-200 text-sm mt-0.5">監控與管理員工訓練系統並系統管理設定</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportPersonalReport}
            disabled={!!exporting}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Download size={14} />
            {exporting === 'personal' ? '匯出中...' : '匯出訓練紀錄'}
          </button>
          <button
            onClick={exportDeptReport}
            disabled={!!exporting}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Download size={14} />
            {exporting === 'dept' ? '匯出中...' : '匯出 Excel'}
          </button>
          <button
            onClick={exportTTQSReport}
            disabled={!!exporting}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium transition-colors"
          >
            <Download size={14} />
            {exporting === 'ttqs' ? '匯出中...' : '匯出 PDF'}
          </button>
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
