import { useState } from 'react';
import { Search, Plus, X, Trash2 } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { usePersistentState } from '../../lib/persistentState';
import { LEADERSHIP, ORG_UNITS, type OrgMember, type OrgUnit } from '../../data/orgChartData';

interface OrgSnapshot {
  id: string;
  monthLabel: string;
  createdAt: string;
  createdBy: string;
  leadership: OrgMember[];
  units: OrgUnit[];
}

// 以現有組織表資料作為第一份（基準）組織圖快照；之後 HR/管理員可於介面新增「當月組織圖」快照，
// 不會更動 orgChartData.ts 內既有的手動維護資料。
const BASE_SNAPSHOT: OrgSnapshot = {
  id: 'snap-base',
  monthLabel: '2026年06月',
  createdAt: '2026-04-29',
  createdBy: '系統初始資料',
  leadership: LEADERSHIP,
  units: ORG_UNITS,
};

function childUnitsOf(units: OrgUnit[], parentId: string | null): OrgUnit[] {
  return units.filter((u) => u.parentId === parentId);
}

function UnitCard({ units, unit, depth = 0 }: { units: OrgUnit[]; unit: OrgUnit; depth?: number }) {
  const children = childUnitsOf(units, unit.id);
  return (
    <div className={`border rounded-xl p-3 shadow-sm h-full ${depth === 0 ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50/70'}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className={`font-bold text-gray-800 ${depth === 0 ? 'text-sm' : 'text-xs'}`}>{unit.name}</h3>
        {unit.memberCount && <span className="text-xs text-gray-400 shrink-0">{unit.memberCount}</span>}
      </div>
      {unit.members.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unit.members.map((m, i) => (
            <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100 whitespace-nowrap">
              {m.name} <span className="text-blue-400">· {m.title}</span>
            </span>
          ))}
        </div>
      )}
      {children.length > 0 && (
        // 以 flex-wrap（而非依視窗寬度的 grid breakpoint）依「父層卡片實際可用寬度」自動排列子單位，
        // 避免巢狀層級在窄欄位中被擠壓成一條過長的直欄。
        <div className="flex flex-wrap gap-2 mt-3 pl-3 border-l-2 border-gray-100">
          {children.map((c) => (
            <div key={c.id} className="flex-1 basis-[200px] min-w-[180px]">
              <UnitCard units={units} unit={c} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function emptyMember(): OrgMember {
  return { name: '', title: '' };
}

function cloneUnits(units: OrgUnit[]): OrgUnit[] {
  return units.map((u) => ({ ...u, members: u.members.map((m) => ({ ...m })) }));
}

export default function OrgChart() {
  const { currentUser } = useTrainingAuth();
  const isHRAdmin = !!currentUser && ['admin', 'hr'].includes(currentUser.role);

  const [snapshots, setSnapshots] = usePersistentState<OrgSnapshot[]>('orgSnapshots', [BASE_SNAPSHOT]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState(BASE_SNAPSHOT.id);
  const selectedSnapshot = snapshots.find((s) => s.id === selectedSnapshotId) || snapshots[snapshots.length - 1];

  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [draftMonthLabel, setDraftMonthLabel] = useState('');
  const [draftLeadership, setDraftLeadership] = useState<OrgMember[]>([]);
  const [draftUnits, setDraftUnits] = useState<OrgUnit[]>([]);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const keyword = search.trim();
  const employees = [
    ...selectedSnapshot.leadership.map((l) => ({ ...l, unit: '董事會 / 總經理室' })),
    ...selectedSnapshot.units.flatMap((u) => u.members.map((m) => ({ ...m, unit: u.name }))),
  ];
  const results = keyword ? employees.filter((e) => e.name.includes(keyword)) : [];
  const topUnits = childUnitsOf(selectedSnapshot.units, null);

  const openAddMonth = () => {
    const now = new Date();
    setDraftMonthLabel(`${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月`);
    setDraftLeadership(selectedSnapshot.leadership.map((l) => ({ ...l })));
    setDraftUnits(cloneUnits(selectedSnapshot.units));
    setShowEditor(true);
  };

  const handleSaveSnapshot = () => {
    if (!draftMonthLabel.trim() || topUnits.length === 0 && draftUnits.length === 0) return;
    const id = `snap-${Date.now()}`;
    const snapshot: OrgSnapshot = {
      id,
      monthLabel: draftMonthLabel.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser?.name || 'HR/管理員',
      leadership: draftLeadership.filter((l) => l.name.trim()),
      units: draftUnits.filter((u) => u.name.trim()),
    };
    setSnapshots((prev) => [...prev, snapshot]);
    setSelectedSnapshotId(id);
    setShowEditor(false);
    showToast(`✓ 已新增「${snapshot.monthLabel}」組織圖`);
  };

  const updateUnit = (id: string, patch: Partial<OrgUnit>) =>
    setDraftUnits((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const removeUnit = (id: string) =>
    setDraftUnits((prev) => {
      const target = prev.find((u) => u.id === id);
      if (!target) return prev;
      return prev
        .filter((u) => u.id !== id)
        .map((u) => (u.parentId === id ? { ...u, parentId: target.parentId } : u));
    });

  const addUnit = () =>
    setDraftUnits((prev) => [...prev, { id: `unit-${Date.now()}`, name: '新單位', parentId: null, members: [] }]);

  const updateMember = (unitId: string, idx: number, patch: Partial<OrgMember>) =>
    setDraftUnits((prev) => prev.map((u) =>
      u.id === unitId ? { ...u, members: u.members.map((m, i) => (i === idx ? { ...m, ...patch } : m)) } : u
    ));

  const addMember = (unitId: string) =>
    setDraftUnits((prev) => prev.map((u) => (u.id === unitId ? { ...u, members: [...u.members, emptyMember()] } : u)));

  const removeMember = (unitId: string, idx: number) =>
    setDraftUnits((prev) => prev.map((u) => (u.id === unitId ? { ...u, members: u.members.filter((_, i) => i !== idx) } : u)));

  const updateLeader = (idx: number, patch: Partial<OrgMember>) =>
    setDraftLeadership((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const addLeader = () => setDraftLeadership((prev) => [...prev, emptyMember()]);
  const removeLeader = (idx: number) => setDraftLeadership((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <span className="text-green-400">✓</span>{toast}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        本組織架構圖為全公司部門、職位、主管之單一資料來源。費用訓練同意書（CFCMHR37）等電子簽核流程之「主管」「人資」欄位，皆依此資料自動帶入。
      </div>

      {/* Snapshot (month) selector + add-new-month action */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">組織圖版本：</span>
          <select
            value={selectedSnapshotId}
            onChange={(e) => setSelectedSnapshotId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {snapshots.map((s) => (
              <option key={s.id} value={s.id}>{s.monthLabel}（{s.createdAt} 建立）</option>
            ))}
          </select>
        </div>
        {isHRAdmin && (
          <button
            onClick={openAddMonth}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={15} /> 新增當月組織圖
          </button>
        )}
      </div>

      {/* Employee search */}
      <div>
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋員工姓名找出所屬部門與職稱..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {keyword && (
          <div className="mt-2 space-y-1.5">
            {results.length > 0 ? (
              results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <span className="font-semibold text-gray-800">{r.name}</span>
                  <span className="text-gray-500">{r.title}</span>
                  <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.unit}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 px-1">查無符合「{keyword}」的員工</p>
            )}
          </div>
        )}
      </div>

      {/* Leadership chain */}
      <div className="flex flex-col items-center">
        {selectedSnapshot.leadership.map((l, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="border-2 border-blue-300 rounded-lg px-5 py-2 bg-blue-50 text-center min-w-[140px]">
              <p className="font-bold text-sm text-gray-800">{l.name}</p>
              <p className="text-xs text-blue-600">{l.title}</p>
            </div>
            <div className="w-px h-3 bg-gray-300" />
          </div>
        ))}
        <div className="text-xs text-gray-400 mb-2">▼ 各部門 / 單位</div>
      </div>

      {/* Department / unit tree */}
      <div className="flex flex-wrap gap-3">
        {topUnits.map((u) => (
          <div key={u.id} className="flex-1 basis-[280px] min-w-[260px]">
            <UnitCard units={selectedSnapshot.units} unit={u} />
          </div>
        ))}
      </div>

      {/* Add-month editor modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">新增當月組織圖</h3>
              <button onClick={() => setShowEditor(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">組織圖月份名稱 *</label>
                <input
                  type="text"
                  value={draftMonthLabel}
                  onChange={(e) => setDraftMonthLabel(e.target.value)}
                  placeholder="例如：2026年07月"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <p className="text-xs text-gray-400 mt-1">已預先帶入目前最新組織圖內容，您可在下方直接調整後另存為當月版本。</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">高層領導鏈</h4>
                  <button onClick={addLeader} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"><Plus size={13} /> 新增</button>
                </div>
                <div className="space-y-2">
                  {draftLeadership.map((l, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={l.name} onChange={(e) => updateLeader(i, { name: e.target.value })} placeholder="姓名" className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm" />
                      <input value={l.title} onChange={(e) => updateLeader(i, { title: e.target.value })} placeholder="職稱" className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm" />
                      <button onClick={() => removeLeader(i)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">部門 / 單位</h4>
                  <button onClick={addUnit} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"><Plus size={13} /> 新增單位</button>
                </div>
                <div className="space-y-3">
                  {draftUnits.map((u) => (
                    <div key={u.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <input value={u.name} onChange={(e) => updateUnit(u.id, { name: e.target.value })} placeholder="單位名稱" className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm font-medium" />
                        <select
                          value={u.parentId ?? ''}
                          onChange={(e) => updateUnit(u.id, { parentId: e.target.value || null })}
                          className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-white"
                        >
                          <option value="">（部門層級，無上層）</option>
                          {draftUnits.filter((o) => o.id !== u.id).map((o) => (
                            <option key={o.id} value={o.id}>上層：{o.name}</option>
                          ))}
                        </select>
                        <button onClick={() => removeUnit(u.id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                      <div className="space-y-1.5 pl-1">
                        {u.members.map((m, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input value={m.name} onChange={(e) => updateMember(u.id, i, { name: e.target.value })} placeholder="姓名" className="flex-1 border border-gray-100 bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs" />
                            <input value={m.title} onChange={(e) => updateMember(u.id, i, { title: e.target.value })} placeholder="職稱" className="flex-1 border border-gray-100 bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs" />
                            <button onClick={() => removeMember(u.id, i)} className="p-1 text-red-400 hover:text-red-600"><X size={12} /></button>
                          </div>
                        ))}
                        <button onClick={() => addMember(u.id)} className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 mt-1">
                          <Plus size={12} /> 新增成員
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowEditor(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">取消</button>
              <button onClick={handleSaveSnapshot} disabled={!draftMonthLabel.trim()} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                儲存當月組織圖
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
