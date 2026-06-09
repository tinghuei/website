import { useState, useRef } from 'react';
import { Users, UserCheck, Download, Upload, Plus, Edit, Trash2, X, Search } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import * as XLSX from 'xlsx';

interface Instructor {
  id: string;
  name: string;
  type: '內部' | '外部';
  title: string;
  department: string;
  specialty: string;
  phone: string;
  email: string;
  certifications: string;
  totalCourses: number;
}

interface Student {
  id: string;
  name: string;
  birthday: string;
  department: string;
  title: string;
  employeeId: string;
  joinDate: string;
  email: string;
}

const INITIAL_INSTRUCTORS: Instructor[] = [
  { id: 'ins1', name: '林志明', type: '內部', title: '安全衛生管理師', department: '管理部', specialty: '職業安全衛生、緊急應變', phone: '分機 201', email: 'lin.zhiming@company.com', certifications: '甲種職業安全衛生業務主管', totalCourses: 12 },
  { id: 'ins2', name: '李大偉', type: '內部', title: '品保工程師', department: '品保課', specialty: 'ISO 9001、品質管制', phone: '分機 305', email: 'li.dawei@company.com', certifications: 'ISO 9001 內部稽核員', totalCourses: 8 },
  { id: 'ins3', name: '陳美惠', type: '外部', title: '顧問講師', department: '外聘', specialty: '精實生產、IE工業工程', phone: '0912-345-678', email: 'chen.mh@consulting.com', certifications: 'Lean Six Sigma Black Belt', totalCourses: 5 },
  { id: 'ins4', name: '王建志', type: '外部', title: '職業訓練師', department: '外聘', specialty: 'ERP系統、資訊管理', phone: '0923-456-789', email: 'wang.jz@erp-training.com', certifications: '職業訓練師證照', totalCourses: 3 },
];

const INITIAL_STUDENTS: Student[] = [
  { id: 'stu1', name: '王小明', birthday: '1990-05-15', department: '組裝一線', title: '作業員', employeeId: 'E001', joinDate: '2020-03-01', email: 'wang.xm@company.com' },
  { id: 'stu2', name: '陳美玲', birthday: '1988-11-20', department: '品保課', title: '品管員', employeeId: 'E002', joinDate: '2019-07-15', email: 'chen.ml@company.com' },
  { id: 'stu3', name: '李大明', birthday: '1985-03-08', department: '品保課', title: '高級工程師', employeeId: 'M001', joinDate: '2018-01-10', email: 'li.dm@company.com' },
  { id: 'stu4', name: '林志偉', birthday: '1992-07-22', department: '品保課', title: '工程師', employeeId: 'E003', joinDate: '2021-08-01', email: 'lin.zw@company.com' },
  { id: 'stu5', name: '黃雅婷', birthday: '1991-12-30', department: '工程課', title: '技術員', employeeId: 'E004', joinDate: '2022-02-14', email: 'huang.yt@company.com' },
  { id: 'stu6', name: '劉俊達', birthday: '1993-04-18', department: '生管課', title: '作業員', employeeId: 'E005', joinDate: '2022-09-01', email: 'liu.jd@company.com' },
];

type ActiveRoster = 'instructors' | 'students';

interface InstructorForm {
  name: string; type: '內部' | '外部'; title: string; department: string;
  specialty: string; phone: string; email: string; certifications: string;
}
interface StudentForm {
  name: string; birthday: string; department: string; title: string;
  employeeId: string; joinDate: string; email: string;
}

const DEFAULT_INS_FORM: InstructorForm = { name: '', type: '內部', title: '', department: '', specialty: '', phone: '', email: '', certifications: '' };
const DEFAULT_STU_FORM: StudentForm = { name: '', birthday: '', department: '', title: '', employeeId: '', joinDate: '', email: '' };

const DEPARTMENTS = ['總經理室', '品保課', '管理部', '總務課', '營業部', '業務課', '研發課', '廠務部', '廠務室', '製造課', '組一組', '組二組', '組三組', '生管課', '工程課'];

export default function InstructorRoster() {
  const { currentUser } = useTrainingAuth();
  const [activeRoster, setActiveRoster] = useState<ActiveRoster>('instructors');
  const [instructors, setInstructors] = useState<Instructor[]>(INITIAL_INSTRUCTORS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddIns, setShowAddIns] = useState(false);
  const [showAddStu, setShowAddStu] = useState(false);
  const [insForm, setInsForm] = useState<InstructorForm>(DEFAULT_INS_FORM);
  const [stuForm, setStuForm] = useState<StudentForm>(DEFAULT_STU_FORM);
  const [editingIns, setEditingIns] = useState<string | null>(null);
  const [editingStu, setEditingStu] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const insFileRef = useRef<HTMLInputElement>(null);
  const stuFileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filteredInstructors = instructors.filter(i =>
    i.name.includes(searchQuery) || i.specialty.includes(searchQuery) || i.department.includes(searchQuery) || i.type.includes(searchQuery)
  );
  const filteredStudents = students.filter(s =>
    s.name.includes(searchQuery) || s.department.includes(searchQuery) || s.title.includes(searchQuery) || s.employeeId.includes(searchQuery)
  );

  // Export instructors to Excel
  const exportInstructors = () => {
    const ws = XLSX.utils.json_to_sheet(instructors.map(i => ({
      '講師類型': i.type, '姓名': i.name, '職稱': i.title, '部門': i.department,
      '專長領域': i.specialty, '聯絡電話': i.phone, '電子郵件': i.email,
      '相關證照': i.certifications, '授課場次': i.totalCourses,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '講師名冊');
    XLSX.writeFile(wb, '講師名冊.xlsx');
    showToast('講師名冊已匯出');
  };

  // Export students to Excel
  const exportStudents = () => {
    const ws = XLSX.utils.json_to_sheet(students.map(s => ({
      '員工編號': s.employeeId, '姓名': s.name, '出生日期': s.birthday,
      '部門': s.department, '職稱': s.title, '到職日期': s.joinDate, '電子郵件': s.email,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '學員名冊');
    XLSX.writeFile(wb, '學員名冊.xlsx');
    showToast('學員名冊已匯出');
  };

  // Download template
  const downloadTemplate = (type: 'instructor' | 'student') => {
    if (type === 'instructor') {
      const ws = XLSX.utils.aoa_to_sheet([
        ['講師類型', '姓名', '職稱', '部門', '專長領域', '聯絡電話', '電子郵件', '相關證照'],
        ['內部', '範例講師', '工程師', '工程課', '品質管理', '分機201', 'example@company.com', 'ISO 9001'],
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '講師名冊範本');
      XLSX.writeFile(wb, '講師名冊匯入範本.xlsx');
    } else {
      const ws = XLSX.utils.aoa_to_sheet([
        ['員工編號', '姓名', '出生日期', '部門', '職稱', '到職日期', '電子郵件'],
        ['E001', '範例員工', '1990-01-01', '品保課', '工程師', '2020-01-01', 'example@company.com'],
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '學員名冊範本');
      XLSX.writeFile(wb, '學員名冊匯入範本.xlsx');
    }
    showToast('範本已下載');
  };

  // Import from Excel
  const handleImportInstructors = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
        const imported: Instructor[] = data.map((row, i) => ({
          id: `ins-imp-${Date.now()}-${i}`,
          name: row['姓名'] || '',
          type: (row['講師類型'] === '外部' ? '外部' : '內部') as '內部' | '外部',
          title: row['職稱'] || '',
          department: row['部門'] || '',
          specialty: row['專長領域'] || '',
          phone: row['聯絡電話'] || '',
          email: row['電子郵件'] || '',
          certifications: row['相關證照'] || '',
          totalCourses: 0,
        }));
        setInstructors(prev => [...prev, ...imported.filter(i => i.name)]);
        showToast(`成功匯入 ${imported.length} 筆講師資料`);
      } catch {
        showToast('匯入失敗：請確認格式正確');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleImportStudents = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
        const imported: Student[] = data.map((row, i) => ({
          id: `stu-imp-${Date.now()}-${i}`,
          employeeId: row['員工編號'] || '',
          name: row['姓名'] || '',
          birthday: row['出生日期'] || '',
          department: row['部門'] || '',
          title: row['職稱'] || '',
          joinDate: row['到職日期'] || '',
          email: row['電子郵件'] || '',
        }));
        setStudents(prev => [...prev, ...imported.filter(s => s.name)]);
        showToast(`成功匯入 ${imported.length} 筆學員資料`);
      } catch {
        showToast('匯入失敗：請確認格式正確');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const addInstructor = () => {
    if (!insForm.name) return;
    if (editingIns) {
      setInstructors(prev => prev.map(i => i.id === editingIns ? { ...i, ...insForm } : i));
      setEditingIns(null);
      showToast('講師資料已更新');
    } else {
      setInstructors(prev => [...prev, { id: `ins${Date.now()}`, ...insForm, totalCourses: 0 }]);
      showToast('講師已新增');
    }
    setInsForm(DEFAULT_INS_FORM);
    setShowAddIns(false);
  };

  const addStudent = () => {
    if (!stuForm.name) return;
    if (editingStu) {
      setStudents(prev => prev.map(s => s.id === editingStu ? { ...s, ...stuForm } : s));
      setEditingStu(null);
      showToast('學員資料已更新');
    } else {
      setStudents(prev => [...prev, { id: `stu${Date.now()}`, ...stuForm }]);
      showToast('學員已新增');
    }
    setStuForm(DEFAULT_STU_FORM);
    setShowAddStu(false);
  };

  const editIns = (ins: Instructor) => {
    setInsForm({ name: ins.name, type: ins.type, title: ins.title, department: ins.department, specialty: ins.specialty, phone: ins.phone, email: ins.email, certifications: ins.certifications });
    setEditingIns(ins.id);
    setShowAddIns(true);
  };

  const editStu = (stu: Student) => {
    setStuForm({ name: stu.name, birthday: stu.birthday, department: stu.department, title: stu.title, employeeId: stu.employeeId, joinDate: stu.joinDate, email: stu.email });
    setEditingStu(stu.id);
    setShowAddStu(true);
  };

  const isAdmin = currentUser && ['admin', 'hr', 'manager'].includes(currentUser.role);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <span className="text-green-400">✓</span>{toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <Users size={22} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">講師 / 學員名冊</h1>
          <p className="text-sm text-gray-500">管理內外部講師資料及學員名冊，支援 Excel 匯入匯出</p>
        </div>
      </div>

      {/* Roster switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {([['instructors', '講師名冊', UserCheck], ['students', '學員名冊', Users]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => { setActiveRoster(id); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeRoster === id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={activeRoster === 'instructors' ? '搜尋講師...' : '搜尋學員...'}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {activeRoster === 'instructors' ? (
            <>
              <button onClick={() => downloadTemplate('instructor')} className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Download size={14} /> 下載範本
              </button>
              <button onClick={() => insFileRef.current?.click()} className="flex items-center gap-1.5 text-sm text-indigo-600 border border-indigo-200 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
                <Upload size={14} /> 匯入 Excel
              </button>
              <input ref={insFileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportInstructors} />
              <button onClick={exportInstructors} className="flex items-center gap-1.5 text-sm text-green-600 border border-green-200 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors">
                <Download size={14} /> 匯出 Excel
              </button>
              {isAdmin && (
                <button onClick={() => { setInsForm(DEFAULT_INS_FORM); setEditingIns(null); setShowAddIns(true); }} className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus size={14} /> 新增講師
                </button>
              )}
            </>
          ) : (
            <>
              <button onClick={() => downloadTemplate('student')} className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Download size={14} /> 下載範本
              </button>
              <button onClick={() => stuFileRef.current?.click()} className="flex items-center gap-1.5 text-sm text-indigo-600 border border-indigo-200 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
                <Upload size={14} /> 匯入 Excel
              </button>
              <input ref={stuFileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportStudents} />
              <button onClick={exportStudents} className="flex items-center gap-1.5 text-sm text-green-600 border border-green-200 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors">
                <Download size={14} /> 匯出 Excel
              </button>
              {isAdmin && (
                <button onClick={() => { setStuForm(DEFAULT_STU_FORM); setEditingStu(null); setShowAddStu(true); }} className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus size={14} /> 新增學員
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Instructor table */}
      {activeRoster === 'instructors' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">講師名冊（{filteredInstructors.length} 人）</h2>
            <div className="flex gap-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">{instructors.filter(i => i.type === '內部').length} 位內部</span>
              <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">{instructors.filter(i => i.type === '外部').length} 位外部</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['類型', '姓名', '職稱', '部門', '專長領域', '聯絡方式', '相關證照', '授課場次', ...(isAdmin ? ['操作'] : [])].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInstructors.map(ins => (
                  <tr key={ins.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ins.type === '內部' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{ins.type}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{ins.name}</td>
                    <td className="px-4 py-3 text-gray-600">{ins.title}</td>
                    <td className="px-4 py-3 text-gray-600">{ins.department}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{ins.specialty}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{ins.phone}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">{ins.certifications || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{ins.totalCourses}</span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => editIns(ins)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><Edit size={14} /></button>
                          <button onClick={() => { if (window.confirm(`確定刪除「${ins.name}」？`)) { setInstructors(prev => prev.filter(i => i.id !== ins.id)); showToast('已刪除'); } }} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredInstructors.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 text-sm">查無符合條件的講師</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student table */}
      {activeRoster === 'students' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">學員名冊（{filteredStudents.length} 人）</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['員工編號', '姓名', '出生日期', '部門', '職稱', '到職日期', '電子郵件', ...(isAdmin ? ['操作'] : [])].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map(stu => (
                  <tr key={stu.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{stu.employeeId}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{stu.name}</td>
                    <td className="px-4 py-3 text-gray-600">{stu.birthday}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{stu.department}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{stu.title}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{stu.joinDate}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{stu.email}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => editStu(stu)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><Edit size={14} /></button>
                          <button onClick={() => { if (window.confirm(`確定刪除「${stu.name}」？`)) { setStudents(prev => prev.filter(s => s.id !== stu.id)); showToast('已刪除'); } }} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">查無符合條件的學員</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Instructor Modal */}
      {showAddIns && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{editingIns ? '編輯講師' : '新增講師'}</h3>
              <button onClick={() => { setShowAddIns(false); setEditingIns(null); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">姓名 *</label>
                  <input type="text" value={insForm.name} onChange={e => setInsForm(f => ({ ...f, name: e.target.value }))} placeholder="講師姓名" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">類型</label>
                  <select value={insForm.type} onChange={e => setInsForm(f => ({ ...f, type: e.target.value as '內部' | '外部' }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                    <option value="內部">內部</option>
                    <option value="外部">外部</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">職稱</label>
                  <input type="text" value={insForm.title} onChange={e => setInsForm(f => ({ ...f, title: e.target.value }))} placeholder="工程師" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">部門</label>
                  {insForm.type === '內部' ? (
                    <select value={insForm.department} onChange={e => setInsForm(f => ({ ...f, department: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                      <option value="">請選擇</option>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={insForm.department} onChange={e => setInsForm(f => ({ ...f, department: e.target.value }))} placeholder="外聘 / 機構名稱" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">專長領域</label>
                  <input type="text" value={insForm.specialty} onChange={e => setInsForm(f => ({ ...f, specialty: e.target.value }))} placeholder="ISO 9001、品質管制" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">聯絡電話</label>
                  <input type="text" value={insForm.phone} onChange={e => setInsForm(f => ({ ...f, phone: e.target.value }))} placeholder="分機 201" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">電子郵件</label>
                  <input type="email" value={insForm.email} onChange={e => setInsForm(f => ({ ...f, email: e.target.value }))} placeholder="email@company.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">相關證照</label>
                  <input type="text" value={insForm.certifications} onChange={e => setInsForm(f => ({ ...f, certifications: e.target.value }))} placeholder="ISO 9001 內部稽核員、甲種職安衛業務主管" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => { setShowAddIns(false); setEditingIns(null); }} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">取消</button>
              <button onClick={addInstructor} disabled={!insForm.name} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                {editingIns ? '儲存變更' : '新增講師'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Student Modal */}
      {showAddStu && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{editingStu ? '編輯學員' : '新增學員'}</h3>
              <button onClick={() => { setShowAddStu(false); setEditingStu(null); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">員工編號 *</label>
                  <input type="text" value={stuForm.employeeId} onChange={e => setStuForm(f => ({ ...f, employeeId: e.target.value }))} placeholder="E001" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">姓名 *</label>
                  <input type="text" value={stuForm.name} onChange={e => setStuForm(f => ({ ...f, name: e.target.value }))} placeholder="員工姓名" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">出生日期</label>
                  <input type="date" value={stuForm.birthday} onChange={e => setStuForm(f => ({ ...f, birthday: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">部門</label>
                  <select value={stuForm.department} onChange={e => setStuForm(f => ({ ...f, department: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                    <option value="">請選擇</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">職稱</label>
                  <input type="text" value={stuForm.title} onChange={e => setStuForm(f => ({ ...f, title: e.target.value }))} placeholder="工程師 / 作業員" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">到職日期</label>
                  <input type="date" value={stuForm.joinDate} onChange={e => setStuForm(f => ({ ...f, joinDate: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">電子郵件</label>
                  <input type="email" value={stuForm.email} onChange={e => setStuForm(f => ({ ...f, email: e.target.value }))} placeholder="email@company.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => { setShowAddStu(false); setEditingStu(null); }} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">取消</button>
              <button onClick={addStudent} disabled={!stuForm.name} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                {editingStu ? '儲存變更' : '新增學員'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
