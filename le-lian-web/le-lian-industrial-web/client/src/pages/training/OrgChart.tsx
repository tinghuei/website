import { useState } from 'react';
import { Search } from 'lucide-react';
import { LEADERSHIP, ALL_EMPLOYEES, getChildUnits, type OrgUnit } from '../../data/orgChartData';

function UnitCard({ unit }: { unit: OrgUnit }) {
  const children = getChildUnits(unit.id);
  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="font-bold text-sm text-gray-800">{unit.name}</h3>
        {unit.memberCount && <span className="text-xs text-gray-400 shrink-0">{unit.memberCount}</span>}
      </div>
      {unit.members.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unit.members.map((m, i) => (
            <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100">
              {m.name} <span className="text-blue-400">· {m.title}</span>
            </span>
          ))}
        </div>
      )}
      {children.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-3 border-l-2 border-gray-100">
          {children.map((c) => (
            <UnitCard key={c.id} unit={c} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChart() {
  const [search, setSearch] = useState('');
  const keyword = search.trim();
  const results = keyword ? ALL_EMPLOYEES.filter((e) => e.name.includes(keyword)) : [];
  const topUnits = getChildUnits(null);

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        本組織架構圖為全公司部門、職位、主管之單一資料來源（六月份組織表）。費用訓練同意書（CFCMHR37）等電子簽核流程之「主管」「人資」欄位，皆依此資料自動帶入。
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
        {LEADERSHIP.map((l, i) => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {topUnits.map((u) => (
          <UnitCard key={u.id} unit={u} />
        ))}
      </div>
    </div>
  );
}
