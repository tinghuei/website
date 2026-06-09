import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { Search, Clock, CheckCircle, BookOpen, ChevronRight, Sparkles, Plus, Edit3, X, Save } from 'lucide-react';
import type { Course } from '../../data/trainingMockData';

const categoryColors: Record<string, string> = {
  '安全衛生': 'bg-red-100 text-red-700',
  '生產管理': 'bg-blue-100 text-blue-700',
  '品質管理': 'bg-purple-100 text-purple-700',
  '職場技能': 'bg-orange-100 text-orange-700',
  '技術維護': 'bg-indigo-100 text-indigo-700',
  '軟技能': 'bg-green-100 text-green-700',
};

const thumbnailGradients: Record<string, string> = {
  'bg-blue-500': 'from-blue-400 to-blue-600',
  'bg-green-500': 'from-green-400 to-green-600',
  'bg-purple-500': 'from-purple-400 to-purple-600',
  'bg-orange-500': 'from-orange-400 to-orange-600',
  'bg-red-500': 'from-red-400 to-red-600',
};

const categoryPatterns: Record<string, string> = {
  '安全衛生': '🦺',
  '生產管理': '⚙️',
  '品質管理': '✅',
  '職場技能': '💼',
  '技術維護': '🔧',
  '軟技能': '🌟',
};

const RECENTLY_ADDED_DAYS = 30;

const CATEGORIES = ['行政職能課程', '法令規範課程', '職能發展課程', '管理發展課程', '生產管理', '品質管理', '安全衛生', '職場技能'];

function EditCourseModal({ course, onSave, onClose }: {
  course: Partial<Course> & { id?: string };
  onSave: (data: Partial<Course>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: course.title || '',
    description: course.description || '',
    category: course.category || '',
    instructor: course.instructor || '',
    duration: course.duration || 60,
    mandatory: course.mandatory || false,
    passingScore: course.passingScore || 70,
    videoId: course.videoId || '',
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{course.id ? '編輯課程' : '新增課程'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">課程名稱 *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">課程描述</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">類別</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                <option value="">請選擇</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">講師</label>
              <input type="text" value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">時長（分鐘）</label>
              <input type="number" min={10} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">及格分數</label>
              <input type="number" min={0} max={100} value={form.passingScore} onChange={e => setForm(f => ({ ...f, passingScore: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">YouTube 影片 ID（選填）</label>
            <input
              type="text"
              value={form.videoId}
              onChange={e => setForm(f => ({ ...f, videoId: e.target.value }))}
              placeholder="e.g. dQw4w9WgXcQ（YouTube網址中 v= 後的部分）"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <p className="text-xs text-gray-400 mt-1">設定後員工可在課程中觀看教學影片</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="mandatory" checked={form.mandatory} onChange={e => setForm(f => ({ ...f, mandatory: e.target.checked }))} className="accent-blue-600" />
            <label htmlFor="mandatory" className="text-sm text-gray-700">設為必修課程</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700">取消</button>
            <button
              onClick={() => { if (!form.title) return; onSave(form); }}
              disabled={!form.title}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Save size={15} />儲存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrainingCourseLibrary() {
  const { courses, currentUser, getUserEnrollments, enrollInCourse, updateCourse, addCourse } = useTrainingAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [addingCourse, setAddingCourse] = useState(false);
  const [toast, setToast] = useState('');

  const canManage = currentUser && ['admin', 'hr', 'manager'].includes(currentUser.role);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleSaveEdit(data: Partial<Course>) {
    if (editingCourse) {
      updateCourse(editingCourse.id, data);
      setEditingCourse(null);
      showToast('課程已更新');
    }
  }

  function handleAddCourse(data: Partial<Course>) {
    addCourse({ ...data, status: 'active', quizQuestions: [] });
    setAddingCourse(false);
    showToast('新課程已加入課程庫');
  }

  const enrollments = currentUser ? getUserEnrollments(currentUser.id) : [];
  const activeCourses = courses.filter((c) => c.status === 'active');

  const categories = ['全部', ...Array.from(new Set(activeCourses.map((c) => c.category)))];

  const filtered = activeCourses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === '全部' || c.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const getEnrollment = (courseId: string) => enrollments.find((e) => e.courseId === courseId);

  const handleEnroll = (e: React.MouseEvent, courseId: string) => {
    e.stopPropagation();
    if (currentUser) {
      enrollInCourse(currentUser.id, courseId);
      navigate(`/training/courses/${courseId}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {editingCourse && (
        <EditCourseModal course={editingCourse} onSave={handleSaveEdit} onClose={() => setEditingCourse(null)} />
      )}
      {addingCourse && (
        <EditCourseModal course={{}} onSave={handleAddCourse} onClose={() => setAddingCourse(false)} />
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          <CheckCircle size={16} className="text-green-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">課程庫</h1>
          <p className="text-gray-500 mt-1 text-sm">瀏覽所有可用的訓練課程</p>
        </div>
        {canManage && (
          <button
            onClick={() => setAddingCourse(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm"
          >
            <Plus size={16} /> 新增課程
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋課程名稱、講師..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course count */}
      <p className="text-sm text-gray-500 mb-4">找到 {filtered.length} 門課程</p>

      {/* Course Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">找不到符合條件的課程</p>
          <button onClick={() => { setSearch(''); setSelectedCategory('全部'); }} className="mt-3 text-blue-600 text-sm hover:text-blue-700">
            清除篩選
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => {
            const enr = getEnrollment(course.id);
            const gradient = thumbnailGradients[course.thumbnail] || 'from-blue-400 to-blue-600';
            const emoji = categoryPatterns[course.category] || '📚';
            const isNew = course.createdAt && new Date(course.createdAt) > new Date(Date.now() - RECENTLY_ADDED_DAYS * 86400000);

            return (
              <div
                key={course.id}
                onClick={() => navigate(`/training/courses/${course.id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group overflow-hidden"
              >
                {/* Thumbnail with gradient */}
                <div className={`bg-gradient-to-br ${gradient} h-36 relative flex items-center justify-center overflow-hidden`}>
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                  />
                  <span className="text-7xl opacity-30 select-none">{emoji}</span>

                  {/* Badges */}
                  <div className="absolute inset-0 flex items-end p-3 gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white/90 text-gray-700">
                      {course.category}
                    </span>
                    {course.mandatory && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-red-500 text-white">
                        必修
                      </span>
                    )}
                  </div>

                  {/* New badge */}
                  {isNew && (
                    <div className="absolute top-3 left-3">
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full font-bold shadow-sm">
                        <Sparkles size={10} /> 新
                      </span>
                    </div>
                  )}

                  {enr && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                      {enr.status === 'completed' ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <div className="text-xs font-bold text-blue-600">{enr.progressPercent}%</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {course.duration} 分鐘
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>講師：{course.instructor}</span>
                  </div>

                  {/* Progress bar if enrolled */}
                  {enr && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>學習進度</span>
                        <span>{enr.progressPercent}%</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${enr.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action button */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!enr) {
                          handleEnroll(e, course.id);
                        } else {
                          navigate(`/training/courses/${course.id}`);
                        }
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                        !enr
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : enr.status === 'completed'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {!enr ? '立即報名' : enr.status === 'completed' ? '✓ 已完成' : '繼續學習'}
                      {!enr && <ChevronRight size={14} />}
                    </button>
                    {canManage && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingCourse(course); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors"
                        title="編輯課程"
                      >
                        <Edit3 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
