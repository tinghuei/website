import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { Search, Clock, CheckCircle, BookOpen, ChevronRight, Sparkles } from 'lucide-react';

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

export default function TrainingCourseLibrary() {
  const { courses, currentUser, getUserEnrollments, enrollInCourse } = useTrainingAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">課程庫</h1>
        <p className="text-gray-500 mt-1 text-sm">瀏覽所有可用的訓練課程</p>
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!enr) {
                        handleEnroll(e, course.id);
                      } else {
                        navigate(`/training/courses/${course.id}`);
                      }
                    }}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
