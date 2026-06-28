import { useState, useEffect } from 'react';
import { Trophy, Star, Gift, Award, TrendingUp, Settings } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import {
  loadRedeemItems,
  saveRedeemItems,
  loadRedeemHistory,
  addRedeemRecord,
  updateRedeemRecordStatus,
  loadAvailablePoints,
  saveAvailablePoints,
} from '../../lib/achievementsStorage';

// ── Data ────────────────────────────────────────────────────────────────────────

const POINT_HISTORY = [
  { date: '2026-05-20', reason: '完成職業安全衛生課程', points: 50, type: '課程完成' },
  { date: '2026-05-18', reason: '測驗滿分獎勵', points: 30, type: '測驗獎勵' },
  { date: '2026-05-15', reason: '提交心得報告', points: 20, type: '報告提交' },
  { date: '2026-05-10', reason: '連續登入7天', points: 15, type: '出勤獎勵' },
  { date: '2026-04-28', reason: '完成年度必修課程', points: 100, type: '年度達標' },
];

const TOTAL_POINTS = POINT_HISTORY.reduce((s, h) => s + h.points, 0);
const THIS_MONTH_POINTS = POINT_HISTORY.filter((h) => h.date >= '2026-05-01').reduce((s, h) => s + h.points, 0);

interface Badge {
  id: string;
  name: string;
  icon: string;
  desc: string;
  earned: boolean;
  date?: string;
  progress?: number;
  total?: number;
}

const BADGES: Badge[] = [
  { id: 'b1', name: '安全先鋒', icon: '🛡️', desc: '完成所有安全衛生課程', earned: true, date: '2026-05-20' },
  { id: 'b2', name: '學習達人', icon: '📚', desc: '單月完成5門課程', earned: true, date: '2026-05-15' },
  { id: 'b3', name: '滿分王者', icon: '🎯', desc: '測驗連續3次滿分', earned: false, progress: 2, total: 3 },
  { id: 'b4', name: '準時達標', icon: '⏰', desc: '所有必修課程提前完成', earned: false, progress: 60, total: 100 },
  { id: 'b5', name: '多語達人', icon: '🌏', desc: '使用3種不同語言完成課程', earned: false, progress: 1, total: 3 },
  { id: 'b6', name: '職能大師', icon: '⭐', desc: '職能評估達到標準以上', earned: true, date: '2026-04-10' },
  { id: 'b7', name: '年度MVP', icon: '🏆', desc: '年度訓練時數排名第一', earned: false, progress: 45, total: 100 },
  { id: 'b8', name: '知識傳承', icon: '💡', desc: '完成5次課程討論留言', earned: true, date: '2026-05-01' },
];

interface LeaderboardEntry {
  rank: number;
  name: string;
  dept: string;
  points: number;
  level: string;
  isMe?: boolean;
}

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: '李大明', dept: '品保課', points: 1250, level: '💎' },
  { rank: 2, name: '王小華', dept: '工程課', points: 980, level: '🥇' },
  { rank: 3, name: '陳美玲', dept: '組裝一線', points: 820, level: '🥇' },
  { rank: 4, name: '王小明', dept: '組裝一線', points: 215, level: '🥈', isMe: true },
  { rank: 5, name: '林志偉', dept: '品保課', points: 180, level: '🥈' },
  { rank: 6, name: '黃雅婷', dept: '工程課', points: 150, level: '🥉' },
  { rank: 7, name: '劉俊達', dept: '生管課', points: 120, level: '🥉' },
];

interface RedeemItem {
  id: string;
  name: string;
  icon: string;
  points: number;
  stock: number;
  desc: string;
}

const REDEEM_ITEMS_INITIAL: RedeemItem[] = [
  { id: 'r1', name: '半天特休假', icon: '🌴', points: 500, stock: 10, desc: '兌換半天特休假一次' },
  { id: 'r2', name: '書籍禮品卡 NT$500', icon: '📖', points: 300, stock: 20, desc: '可至合作書店使用' },
  { id: 'r3', name: '下午茶券', icon: '☕', points: 150, stock: 50, desc: '公司福委會下午茶一份' },
  { id: 'r4', name: '外訓課程補助 NT$1000', icon: '🎓', points: 800, stock: 5, desc: '補助參加外部訓練費用' },
  { id: 'r5', name: '停車優先月票', icon: '🚗', points: 200, stock: 15, desc: '公司停車場優先月票一個月' },
  { id: 'r6', name: '彈性上下班一週', icon: '⏱️', points: 600, stock: 8, desc: '一週彈性上下班(主管核准)' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────────

function getLevel(points: number): { label: string; emoji: string; next: number; current: number } {
  if (points >= 1000) return { label: '鑽石學員', emoji: '💎', next: 1000, current: 1000 };
  if (points >= 500)  return { label: '金牌學員', emoji: '🥇', next: 1000, current: 500 };
  if (points >= 200)  return { label: '銀牌學員', emoji: '🥈', next: 500, current: 200 };
  return { label: '銅牌學員', emoji: '🥉', next: 200, current: 0 };
}

const TYPE_COLORS: Record<string, string> = {
  '課程完成': 'bg-blue-100 text-blue-700',
  '測驗獎勵': 'bg-purple-100 text-purple-700',
  '報告提交': 'bg-green-100 text-green-700',
  '出勤獎勵': 'bg-yellow-100 text-yellow-700',
  '年度達標': 'bg-red-100 text-red-700',
};

// ── Sub-components ───────────────────────────────────────────────────────────────

function PointsTab({ availablePoints }: { availablePoints: number }) {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '總積分', value: TOTAL_POINTS, color: 'blue', icon: Star },
          { label: '本月新增', value: THIS_MONTH_POINTS, color: 'green', icon: TrendingUp },
          { label: '可兌換積分', value: availablePoints, color: 'purple', icon: Gift },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
            <div className={`w-10 h-10 rounded-lg bg-${color}-50 flex items-center justify-center mx-auto mb-3`}>
              <Icon size={20} className={`text-${color}-600`} />
            </div>
            <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Point history */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">積分歷史紀錄</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['日期', '事由', '積分', '類型'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {POINT_HISTORY.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-gray-600">{row.date}</td>
                <td className="px-5 py-3 text-gray-800 font-medium">{row.reason}</td>
                <td className="px-5 py-3 text-blue-600 font-bold">+{row.points}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[row.type] || 'bg-gray-100 text-gray-700'}`}>
                    {row.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Badges */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">我的徽章</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {BADGES.map((badge) => (
            <div
              key={badge.id}
              className={`bg-white rounded-xl border shadow-sm p-4 flex flex-col items-center text-center transition-all ${
                badge.earned ? 'border-yellow-200 hover:shadow-md' : 'border-gray-100 opacity-60'
              }`}
            >
              <div className={`text-4xl mb-2 ${!badge.earned ? 'grayscale' : ''}`}>{badge.icon}</div>
              <p className={`text-sm font-semibold mb-1 ${badge.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                {badge.name}
              </p>
              <p className="text-xs text-gray-400 mb-2">{badge.desc}</p>
              {badge.earned ? (
                <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full font-medium">
                  {badge.date} 獲得
                </span>
              ) : (
                <div className="w-full">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>進度</span>
                    <span>{badge.progress}/{badge.total}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-400 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, ((badge.progress ?? 0) / (badge.total ?? 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeaderboardTab() {
  const [scope, setScope] = useState<'dept' | 'company'>('company');
  const [period, setPeriod] = useState<'monthly' | 'alltime'>('alltime');

  const data = scope === 'dept'
    ? LEADERBOARD.filter((e) => e.dept === '組裝一線')
    : LEADERBOARD;

  const rankStyle = (rank: number) => {
    if (rank === 1) return 'text-yellow-500 font-bold text-lg';
    if (rank === 2) return 'text-gray-400 font-bold text-lg';
    if (rank === 3) return 'text-amber-600 font-bold text-lg';
    return 'text-gray-600 font-semibold';
  };

  const rankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
          {(['dept', 'company'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                scope === s ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s === 'dept' ? '本部門' : '全公司'}
            </button>
          ))}
        </div>
        <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
          {([['monthly', '本月'], ['alltime', '累計']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setPeriod(val)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === val ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 podium */}
      {data.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-4">
          {[1, 0, 2].map((i) => {
            const entry = data[i];
            if (!entry) return null;
            const heights = ['h-24', 'h-32', 'h-20'];
            const colors = ['bg-gray-200', 'bg-yellow-100', 'bg-amber-100'];
            return (
              <div key={entry.rank} className="flex flex-col items-center">
                <div className="text-2xl mb-1">{rankMedal(entry.rank)}</div>
                <p className="text-sm font-semibold text-gray-800">{entry.name}</p>
                <p className="text-xs text-gray-500 mb-2">{entry.points}分</p>
                <div className={`w-20 ${heights[i]} ${colors[i]} rounded-t-lg flex items-end justify-center pb-2`}>
                  <span className={`text-xl ${rankStyle(entry.rank)}`}>{rankMedal(entry.rank)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['排名', '姓名', '部門', '積分', '等級'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((entry) => (
              <tr
                key={entry.rank}
                className={`transition-colors ${entry.isMe ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
              >
                <td className="px-5 py-3">
                  <span className={rankStyle(entry.rank)}>{rankMedal(entry.rank)}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`font-medium ${entry.isMe ? 'text-blue-700' : 'text-gray-800'}`}>
                    {entry.name}{entry.isMe && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">我</span>}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{entry.dept}</td>
                <td className="px-5 py-3 font-bold text-blue-600">{entry.points}</td>
                <td className="px-5 py-3 text-xl">{entry.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface RedeemRecord { id: string; itemId: string; itemName: string; itemIcon: string; points: number; status: 'pending' | 'approved' | 'cancelled'; redeemedAt: string; }

function RedeemTab({
  userId,
  availablePoints,
  onRedeem,
  redeemItems,
  onDeductStock,
}: {
  userId: string;
  availablePoints: number;
  onRedeem: (cost: number, record: RedeemRecord) => void;
  redeemItems: RedeemItem[];
  onDeductStock: (itemId: string) => void;
}) {
  const [confirming, setConfirming] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [history, setHistory] = useState<RedeemRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadRedeemHistory(userId).then(setHistory);
  }, [userId]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleConfirm = () => {
    if (!confirming) return;
    const item = redeemItems.find(i => i.id === confirming);
    if (!item) return;
    const record: RedeemRecord = {
      id: `r${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      itemIcon: item.icon,
      points: item.points,
      status: 'pending',
      redeemedAt: new Date().toLocaleString('zh-TW'),
    };
    setHistory(prev => [record, ...prev]);
    addRedeemRecord(userId, record);
    onRedeem(item.points, record);
    onDeductStock(item.id);
    setConfirming(null);
    showToast(`「${item.name}」兌換成功！申請已送出，請等待HR確認。`);
  };

  const handleCancel = (recordId: string) => {
    setHistory(prev => prev.map(r => r.id === recordId ? { ...r, status: 'cancelled' as const } : r));
    updateRedeemRecordStatus(recordId, 'cancelled');
    const record = history.find(r => r.id === recordId);
    if (record) onRedeem(-record.points, record);
    showToast('已取消兌換申請，積分已返還。');
  };

  const redeemedIds = new Set(history.filter(r => r.status === 'pending' || r.status === 'approved').map(r => r.itemId));
  const confirmingItem = redeemItems.find((i) => i.id === confirming);

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <span className="text-green-400">✓</span>{toast}
        </div>
      )}

      {/* Available points */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-5 text-white flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80 mb-1">您目前可兌換積分</p>
          <p className="text-4xl font-bold">{availablePoints} 點</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-white transition-colors"
        >
          {showHistory ? '返回兌換' : `兌換紀錄 (${history.length})`}
        </button>
      </div>

      {showHistory ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">兌換紀錄</h3>
          </div>
          {history.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">尚無兌換紀錄</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {history.map(r => (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-2xl">{r.itemIcon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{r.itemName}</p>
                    <p className="text-xs text-gray-400">{r.redeemedAt}</p>
                  </div>
                  <span className={`text-xs font-bold ${r.status === 'cancelled' ? 'text-gray-400 line-through' : 'text-blue-600'}`}>
                    -{r.points}點
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    r.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {r.status === 'pending' ? '審核中' : r.status === 'approved' ? '已核准' : '已取消'}
                  </span>
                  {r.status === 'pending' && (
                    <button onClick={() => handleCancel(r.id)} className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-0.5 rounded-lg">取消</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Item grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {redeemItems.map((item) => {
              const canAfford = availablePoints >= item.points;
              const done = redeemedIds.has(item.id);
              const outOfStock = item.stock <= 0;
              return (
                <div key={item.id} className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col ${(!canAfford || outOfStock) && !done ? 'opacity-60' : 'hover:shadow-md transition-shadow'}`}>
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                  <p className="text-xs text-gray-500 mb-3 flex-1">{item.desc}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-600 font-bold">{item.points} 點</span>
                    <span className={`text-xs ${outOfStock ? 'text-red-400 font-semibold' : 'text-gray-400'}`}>庫存 {item.stock}</span>
                  </div>
                  {done ? (
                    <div className="text-center text-sm text-yellow-700 font-medium bg-yellow-50 border border-yellow-200 rounded-lg py-2">
                      ⏳ 審核中
                    </div>
                  ) : outOfStock ? (
                    <div className="text-center text-sm text-gray-500 font-medium bg-gray-50 border border-gray-200 rounded-lg py-2">
                      已售完
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirming(item.id)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                        canAfford ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? '兌換' : '積分不足'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Confirm dialog */}
      {confirming && confirmingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">{confirmingItem.icon}</div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">確認兌換</h3>
              <p className="text-gray-600 text-sm">確定要兌換「{confirmingItem.name}」嗎？</p>
              <p className="text-blue-600 font-bold mt-1">消耗 {confirmingItem.points} 點積分</p>
              <p className="text-gray-400 text-xs mt-1">剩餘積分：{availablePoints - confirmingItem.points} 點</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirming(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">取消</button>
              <button onClick={handleConfirm} className="flex-1 py-2.5 bg-blue-600 rounded-xl text-sm font-semibold text-white hover:bg-blue-700">確認兌換</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Manage Tab ───────────────────────────────────────────────────────────────────

interface NewItemForm {
  name: string;
  icon: string;
  points: string;
  stock: string;
  desc: string;
}

const DEFAULT_NEW_FORM: NewItemForm = { name: '', icon: '🎁', points: '', stock: '', desc: '' };

function ManageTab({
  redeemItems,
  setRedeemItems,
}: {
  redeemItems: RedeemItem[];
  setRedeemItems: React.Dispatch<React.SetStateAction<RedeemItem[]>>;
}) {
  const [newForm, setNewForm] = useState<NewItemForm>(DEFAULT_NEW_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NewItemForm>(DEFAULT_NEW_FORM);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleAdd = () => {
    const name = newForm.name.trim();
    const points = parseInt(newForm.points, 10);
    const stock = parseInt(newForm.stock, 10);
    if (!name || isNaN(points) || isNaN(stock) || points <= 0 || stock < 0) {
      showToast('請填寫完整欄位（名稱、積分、庫存為必填且需為正整數）');
      return;
    }
    const newItem: RedeemItem = {
      id: `r${Date.now()}`,
      name,
      icon: newForm.icon || '🎁',
      points,
      stock,
      desc: newForm.desc.trim(),
    };
    setRedeemItems(prev => {
      const next = [...prev, newItem];
      saveRedeemItems(next);
      return next;
    });
    setNewForm(DEFAULT_NEW_FORM);
    showToast(`已新增「${name}」兌換項目`);
  };

  const handleEdit = (item: RedeemItem) => {
    setEditingId(item.id);
    setEditForm({ name: item.name, icon: item.icon, points: String(item.points), stock: String(item.stock), desc: item.desc });
  };

  const handleSaveEdit = (id: string) => {
    const name = editForm.name.trim();
    const points = parseInt(editForm.points, 10);
    const stock = parseInt(editForm.stock, 10);
    if (!name || isNaN(points) || isNaN(stock) || points <= 0 || stock < 0) {
      showToast('請填寫完整欄位（名稱、積分、庫存為必填且需為正整數）');
      return;
    }
    setRedeemItems(prev => {
      const next = prev.map(item =>
        item.id === id
          ? { ...item, name, icon: editForm.icon || '🎁', points, stock, desc: editForm.desc.trim() }
          : item
      );
      saveRedeemItems(next);
      return next;
    });
    setEditingId(null);
    showToast('已儲存變更');
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`確定要刪除「${name}」嗎？`)) return;
    setRedeemItems(prev => {
      const next = prev.filter(item => item.id !== id);
      saveRedeemItems(next);
      return next;
    });
    showToast(`已刪除「${name}」`);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <span className="text-green-400">✓</span>{toast}
        </div>
      )}

      {/* Add new item form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-4">新增兌換項目</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">圖示（Emoji）</label>
            <input
              type="text"
              value={newForm.icon}
              onChange={e => setNewForm(f => ({ ...f, icon: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="🎁"
              maxLength={4}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">名稱 *</label>
            <input
              type="text"
              value={newForm.name}
              onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="獎項名稱"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">所需積分 *</label>
            <input
              type="number"
              value={newForm.points}
              onChange={e => setNewForm(f => ({ ...f, points: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="100"
              min={1}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">庫存 *</label>
            <input
              type="number"
              value={newForm.stock}
              onChange={e => setNewForm(f => ({ ...f, stock: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="10"
              min={0}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">說明</label>
            <input
              type="text"
              value={newForm.desc}
              onChange={e => setNewForm(f => ({ ...f, desc: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="兌換項目說明"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 新增項目
        </button>
      </div>

      {/* Items table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">兌換項目列表</h2>
          <span className="text-xs text-gray-400">{redeemItems.length} 項</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['圖示', '名稱', '所需積分', '庫存', '說明', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {redeemItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  {editingId === item.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editForm.icon}
                          onChange={e => setEditForm(f => ({ ...f, icon: e.target.value }))}
                          className="w-14 border border-gray-200 rounded px-2 py-1 text-sm text-center"
                          maxLength={4}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-sm min-w-[120px]"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={editForm.points}
                          onChange={e => setEditForm(f => ({ ...f, points: e.target.value }))}
                          className="w-20 border border-gray-200 rounded px-2 py-1 text-sm"
                          min={1}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={editForm.stock}
                          onChange={e => setEditForm(f => ({ ...f, stock: e.target.value }))}
                          className="w-16 border border-gray-200 rounded px-2 py-1 text-sm"
                          min={0}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={editForm.desc}
                          onChange={e => setEditForm(f => ({ ...f, desc: e.target.value }))}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-sm min-w-[150px]"
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="text-xs px-2.5 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                          >
                            儲存
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs px-2.5 py-1 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                          >
                            取消
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-2xl">{item.icon}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-blue-600 font-bold">{item.points} 點</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${item.stock === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{item.desc}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-xs px-2.5 py-1 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="text-xs px-2.5 py-1 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 font-medium"
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {redeemItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                    尚無兌換項目，請新增
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────────

type TabId = 'points' | 'leaderboard' | 'redeem' | 'manage';

export default function Achievements() {
  const { currentUser } = useTrainingAuth();
  const [activeTab, setActiveTab] = useState<TabId>('points');
  const [availablePoints, setAvailablePoints] = useState(TOTAL_POINTS);
  const [redeemItems, setRedeemItems] = useState<RedeemItem[]>(REDEEM_ITEMS_INITIAL);

  useEffect(() => {
    loadRedeemItems().then((items) => {
      if (items.length) setRedeemItems(items);
      else saveRedeemItems(REDEEM_ITEMS_INITIAL);
    });
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    loadAvailablePoints(currentUser.id, TOTAL_POINTS).then(setAvailablePoints);
  }, [currentUser?.id]);

  const isAdminOrManager = currentUser && ['admin', 'manager'].includes(currentUser.role);

  const tabs = [
    { id: 'points' as TabId, label: '積分 / 徽章', icon: Star },
    { id: 'leaderboard' as TabId, label: '排行榜', icon: Award },
    { id: 'redeem' as TabId, label: '積分兌換', icon: Gift },
    ...(isAdminOrManager ? [{ id: 'manage' as TabId, label: '獎項管理', icon: Settings }] : []),
  ];

  const handleRedeem = (cost: number) => {
    setAvailablePoints(prev => {
      const next = Math.max(0, prev - cost);
      if (currentUser) saveAvailablePoints(currentUser.id, next);
      return next;
    });
  };

  const handleDeductStock = (itemId: string) => {
    setRedeemItems(prev => {
      const next = prev.map(item =>
        item.id === itemId ? { ...item, stock: Math.max(0, item.stock - 1) } : item
      );
      saveRedeemItems(next);
      return next;
    });
  };

  const level = getLevel(availablePoints);
  const progressInLevel = availablePoints - level.current;
  const rangeInLevel = level.next - level.current;
  const progressPct = level.label === '鑽石學員' ? 100 : Math.min(100, (progressInLevel / rangeInLevel) * 100);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Trophy size={22} className="text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">成就獎勵中心</h1>
            <p className="text-sm text-gray-500">{currentUser?.name} · {currentUser?.department}</p>
          </div>
        </div>

        {/* Level card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">{level.emoji}</span>
                <span className="text-xl font-bold">{level.label}</span>
              </div>
              <p className="text-blue-200 text-sm">累積積分：{availablePoints} 點</p>
            </div>
            <div className="text-right">
              {level.label !== '鑽石學員' && (
                <>
                  <p className="text-blue-200 text-xs">距下一等級</p>
                  <p className="text-2xl font-bold">{level.next - availablePoints}</p>
                  <p className="text-blue-200 text-xs">積分</p>
                </>
              )}
              {level.label === '鑽石學員' && (
                <p className="text-blue-200 text-sm">最高等級</p>
              )}
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-blue-200 mb-1.5">
              <span>{level.current} 點</span>
              {level.label !== '鑽石學員' && <span>{level.next} 點</span>}
            </div>
            <div className="w-full bg-blue-500/50 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'points' && <PointsTab availablePoints={availablePoints} />}
      {activeTab === 'leaderboard' && <LeaderboardTab />}
      {activeTab === 'redeem' && currentUser && (
        <RedeemTab
          userId={currentUser.id}
          availablePoints={availablePoints}
          onRedeem={handleRedeem}
          redeemItems={redeemItems}
          onDeductStock={handleDeductStock}
        />
      )}
      {activeTab === 'manage' && isAdminOrManager && (
        <ManageTab redeemItems={redeemItems} setRedeemItems={setRedeemItems} />
      )}
    </div>
  );
}
