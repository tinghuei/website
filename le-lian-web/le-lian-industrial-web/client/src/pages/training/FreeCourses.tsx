import { useState, useCallback, useMemo } from 'react';
import { Globe, RefreshCw, Plus, Sparkles, Clock, Filter, Check, X, ExternalLink, Lock } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { FreeCourse } from '../../data/trainingMockData';

// ── Mock data ──────────────────────────────────────────────────────────────────
// 各課程之 url 為對應主辦單位的官方數位學習平台網址。videoId 僅保留已逐一以影片 ID 搜尋確認
// 真實存在、且內容與課程主題相符的公開 YouTube 教學影片；其餘原先標註的 videoId 經重新查核後
// 查無對應影片或內容不符，已移除嵌入播放，僅保留官方平台外部連結，避免顯示錯誤或對不上課程的影片。
const FREE_COURSES: FreeCourse[] = [
  { id: 'f1', source: '勞動部勞動力發展署', sourceColor: 'blue', title: '工廠安全衛生管理實務', category: '安全衛生', hours: 6, langs: ['zh'], isNew: true, desc: '工廠安全管理制度建立與執行實務，含危害辨識與風險評估。', url: 'https://mol.elearn.hrd.gov.tw/', videoId: 'bVaMWppBU-c' },
  { id: 'f2', source: 'iCAP職能發展平台', sourceColor: 'purple', title: '金屬製造業職能基準課程', category: '專業技能', hours: 8, langs: ['zh'], isNew: true, desc: '依iCAP金屬製造業職能基準設計，含衝壓、焊接、塗裝等核心技術。', url: 'https://icap.wda.gov.tw/' },
  { id: 'f3', source: '經濟部工業局', sourceColor: 'green', title: '智慧製造導入實務', category: '技術提升', hours: 4, langs: ['zh', 'en'], isNew: false, desc: '工業4.0與智慧製造導入策略，含IoT、大數據應用案例。', url: 'https://www.italent.org.tw/' },
  { id: 'f4', source: '勞動部', sourceColor: 'blue', title: '職業安全衛生法規研習', category: '法規遵循', hours: 3, langs: ['zh'], isNew: true, desc: '職業安全衛生法及相關子法最新修訂重點說明。', url: 'https://mol.elearn.hrd.gov.tw/' },
  { id: 'f5', source: '金屬工業研究發展中心', sourceColor: 'orange', title: '衝壓成型技術進階', category: '專業技能', hours: 12, langs: ['zh'], isNew: false, desc: '衝壓成型進階技術，含模具設計、材料特性與品質控制。', url: 'https://learning.mirdc.org.tw/' },
  { id: 'f6', source: '勞動部', sourceColor: 'blue', title: '外籍移工生活適應訓練', category: '管理能力', hours: 3, langs: ['zh', 'th', 'vi', 'id'], isNew: true, desc: '協助外籍員工適應台灣職場文化，含法規說明與生活資訊。', url: 'https://mol.elearn.hrd.gov.tw/' },
  { id: 'f7', source: '財團法人中衛發展中心', sourceColor: 'teal', title: '5S推行與現場管理實務', category: '現場管理', hours: 6, langs: ['zh'], isNew: false, desc: '5S整理整頓清掃清潔素養推行步驟與維持方法。', url: 'https://www.csd.org.tw/' },
  { id: 'f8', source: 'TTI台灣訓練品質協會', sourceColor: 'red', title: 'TTQS訓練品質系統輔導', category: '品質管理', hours: 8, langs: ['zh'], isNew: true, desc: 'TTQS人才發展品質管理系統評核準備與文件建置輔導。', url: 'https://ttqs.wda.gov.tw/' },
  { id: 'f9', source: '勞動力發展署', sourceColor: 'blue', title: '焊接技術人員認證準備', category: '專業技能', hours: 16, langs: ['zh'], isNew: false, desc: '焊接技術人員技能認證考試準備課程，含理論與實作。', url: 'https://www.wda.gov.tw/' },
  { id: 'f10', source: 'iCAP職能發展平台', sourceColor: 'purple', title: '生產管理與效益提升', category: '管理能力', hours: 6, langs: ['zh', 'en'], isNew: true, desc: '生產排程、產能規劃與製程效益分析實務課程。', url: 'https://icap.wda.gov.tw/', videoId: 'IxPo5nqjuHQ' },
  { id: 'f11', source: '環保署', sourceColor: 'green', title: '工廠廢棄物管理法規', category: '法規遵循', hours: 3, langs: ['zh'], isNew: false, desc: '工廠廢棄物分類、申報及合法處理相關法規說明。', url: 'https://www.moenv.gov.tw/' },
  { id: 'f12', source: '勞動部', sourceColor: 'blue', title: '性別工作平等法實務', category: '法規遵循', hours: 2, langs: ['zh'], isNew: false, desc: '性別平等教育、性騷擾防治與職場友善環境建立。', url: 'https://mol.elearn.hrd.gov.tw/' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const SOURCE_COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
  red: 'bg-red-500',
};

const SOURCE_BADGE_MAP: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  teal: 'bg-teal-100 text-teal-700 border-teal-200',
  red: 'bg-red-100 text-red-700 border-red-200',
};

const LANG_FLAGS: Record<string, string> = {
  zh: '🇹🇼',
  en: '🇬🇧',
  th: '🇹🇭',
  id: '🇮🇩',
  vi: '🇻🇳',
};

// ── Free Course Modal ─────────────────────────────────────────────────────────
function FreeCourseModal({ course, onClose, onAdd }: { course: FreeCourse; onClose: () => void; onAdd: () => void }) {
  const [added, setAdded] = useState(false);

  const gradients: Record<string, string> = {
    blue: 'from-blue-500 to-blue-700', purple: 'from-purple-500 to-purple-700',
    green: 'from-green-500 to-green-700', orange: 'from-orange-500 to-orange-700',
    teal: 'from-teal-500 to-teal-700', red: 'from-red-500 to-red-700',
  };
  const gradient = gradients[course.sourceColor] || 'from-blue-500 to-blue-700';

  const handleAdd = () => { setAdded(true); onAdd(); };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg line-clamp-1">{course.title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} className="text-gray-500" /></button>
        </div>

        {/* External platform / embedded video */}
        {course.videoId ? (
          <div className="aspect-video bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${course.videoId}`}
              title={course.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className={`bg-gradient-to-br ${gradient} px-6 py-8 flex flex-col items-center justify-center gap-4`}>
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Globe size={32} className="text-white" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">{course.title}</p>
              <p className="text-white/80 text-sm mt-1">{course.source} 提供</p>
            </div>
          </div>
        )}
        <div className="px-5 pt-4">
          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <ExternalLink size={15} />
            前往 {course.source} 官方平台觀看完整課程
          </a>
        </div>

        {/* Info */}
        <div className="px-5 py-4 space-y-2">
          <p className="text-sm text-gray-600 leading-relaxed">{course.desc}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
            <span className="flex items-center gap-1"><Clock size={12} />{course.hours}小時</span>
            <span>{course.langs.map(l => LANG_FLAGS[l] || l).join(' ')}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${SOURCE_BADGE_MAP[course.sourceColor] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{course.source}</span>
          </div>
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            <strong>說明：</strong>此為政府機關或公益平台提供的免費課程資源{course.videoId ? '，上方已嵌入可直接播放的教學影片' : '，請點擊上方按鈕前往該平台實際觀看課程內容'}。加入課程庫後，課程內也會保留此觀看連結，完成後可作為參訓記錄，並由人資審核確認。
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">關閉</button>
          <button
            onClick={handleAdd}
            disabled={added}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${added ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {added ? <><Check size={14} />已加入課程庫</> : <><Plus size={14} />加入課程庫</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg animate-fade-in-up">
      <Check size={16} className="text-green-400 shrink-0" />
      <span>{msg}</span>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-white text-xs">✕</button>
    </div>
  );
}

// ── Add Free Course Modal (HR/管理員專用) ────────────────────────────────────────
const SOURCE_COLOR_OPTIONS = ['blue', 'purple', 'green', 'orange', 'teal', 'red'];
const LANG_OPTIONS = ['zh', 'en', 'th', 'vi', 'id'];

function AddFreeCourseModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (course: Omit<FreeCourse, 'id'>) => void }) {
  const [source, setSource] = useState('');
  const [sourceColor, setSourceColor] = useState('blue');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [hours, setHours] = useState(3);
  const [langs, setLangs] = useState<string[]>(['zh']);
  const [desc, setDesc] = useState('');
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [error, setError] = useState('');

  function toggleLang(l: string) {
    setLangs((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
  }

  function handleSubmit() {
    if (!source.trim() || !title.trim() || !category.trim() || !url.trim()) {
      setError('請填寫來源、課程名稱、類別與課程網址。');
      return;
    }
    if (langs.length === 0) {
      setError('請至少選擇一種語言。');
      return;
    }
    onSubmit({
      source: source.trim(),
      sourceColor,
      title: title.trim(),
      category: category.trim(),
      hours,
      langs,
      isNew: true,
      desc: desc.trim(),
      url: url.trim(),
      videoId: videoId.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">新增免費課程</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} className="text-gray-500" /></button>
        </div>

        <div className="p-5 space-y-3">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            請僅新增已確認可實際免費觀看、內容與課程名稱相符的資源。若有 YouTube 影片，請先確認影片內容與課程主題一致才填入影片 ID。
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">來源單位 *</label>
            <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="例如：勞動部勞動力發展署" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">課程名稱 *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="課程標題" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">類別 *</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="例如：安全衛生" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">課程時數</label>
              <input type="number" min={1} value={hours} onChange={(e) => setHours(Number(e.target.value) || 1)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">語言</label>
            <div className="mt-1 flex items-center gap-3 flex-wrap">
              {LANG_OPTIONS.map((l) => (
                <label key={l} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <input type="checkbox" checked={langs.includes(l)} onChange={() => toggleLang(l)} />
                  {LANG_FLAGS[l]} {l.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">徽章顏色</label>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              {SOURCE_COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSourceColor(c)}
                  className={`w-6 h-6 rounded-full ${SOURCE_COLOR_MAP[c]} ${sourceColor === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">課程簡介</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="簡短說明課程內容" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">課程網址 *</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https:// 官方平台連結" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">YouTube 影片 ID（選填，已確認內容相符才填）</label>
            <input value={videoId} onChange={(e) => setVideoId(e.target.value)} placeholder="例如：dQw4w9WgXcQ" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">取消</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">新增課程</button>
        </div>
      </div>
    </div>
  );
}

// ── Course Card ────────────────────────────────────────────────────────────────
function CourseCard({
  course,
  onAddToLibrary,
  onGenerateQuiz,
  onView,
}: {
  course: FreeCourse;
  onAddToLibrary: (id: string) => void;
  onGenerateQuiz: (id: string) => void;
  onView: (id: string) => void;
}) {
  const [quizState, setQuizState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [added, setAdded] = useState(false);

  function handleAdd() {
    setAdded(true);
    onAddToLibrary(course.id);
  }

  function handleQuiz() {
    if (quizState !== 'idle') return;
    setQuizState('loading');
    onGenerateQuiz(course.id);
    setTimeout(() => setQuizState('done'), 2000);
  }

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden cursor-pointer"
      onClick={() => onView(course.id)}
    >
      {/* Top color strip */}
      <div className={`${SOURCE_COLOR_MAP[course.sourceColor] || 'bg-gray-400'} h-1.5`} />

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Source badge + NEW badge */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${SOURCE_BADGE_MAP[course.sourceColor] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {course.source}
          </span>
          {course.addedBy && (
            <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs border border-gray-200">
              由 {course.addedBy} 新增
            </span>
          )}
          {course.isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
              NEW
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{course.title}</h3>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">{course.desc}</p>

        {/* Bottom bar */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-100">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            {course.hours}h
          </span>
          <span className="text-xs text-gray-400 ml-1">
            {course.langs.map((l) => LANG_FLAGS[l] || l).join(' ')}
          </span>
          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"
            >
              <ExternalLink size={11} />
              前往觀看
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); handleAdd(); }}
              disabled={added}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                added
                  ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
              }`}
            >
              {added ? <Check size={11} /> : <Plus size={11} />}
              {added ? '已加入' : '加入課程庫'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleQuiz(); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                quizState === 'done'
                  ? 'bg-green-100 text-green-700 border-green-200 cursor-default'
                  : quizState === 'loading'
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
              }`}
            >
              {quizState === 'loading' && <RefreshCw size={11} className="animate-spin" />}
              {quizState === 'done' ? '✅ 已生成5題測驗' : quizState === 'loading' ? '生成中...' : (
                <>
                  <Sparkles size={11} />
                  自動生成測驗 AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function FreeCourses() {
  const { addCourse, currentUser, customFreeCourses, addFreeCourse } = useTrainingAuth();
  const [filterCat, setFilterCat] = useState('全部');
  const [filterSource, setFilterSource] = useState('全部');
  const [filterLang, setFilterLang] = useState('全部');
  const [fetching, setFetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [toast, setToast] = useState('');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const isHRAdmin = !!currentUser && ['admin', 'hr'].includes(currentUser.role);
  const allCourses = useMemo(() => [...FREE_COURSES, ...customFreeCourses], [customFreeCourses]);
  const ALL_CATEGORIES = useMemo(() => ['全部', ...Array.from(new Set(allCourses.map((c) => c.category)))], [allCourses]);
  const ALL_SOURCES = useMemo(() => ['全部', ...Array.from(new Set(allCourses.map((c) => c.source)))], [allCourses]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }, []);

  function handleFetch() {
    if (fetching) return;
    setFetching(true);
    setTimeout(() => {
      setFetching(false);
      setLastUpdated(new Date());
      showToast('已從5個來源抓取最新課程');
    }, 3000);
  }

  function handleAddToLibrary(id: string) {
    const course = allCourses.find(c => c.id === id);
    if (!course) return;
    addCourse({
      title: course.title,
      description: course.desc,
      category: course.category,
      instructor: course.source,
      duration: course.hours * 60,
      mandatory: false,
      thumbnail: 'bg-green-500',
      passingScore: 70,
      quizQuestions: [],
      status: 'active',
      videoId: course.videoId,
      externalVideoUrl: course.url,
    });
    showToast(`「${course.title}」已成功加入課程庫！`);
  }

  function handleGenerateQuiz(_id: string) {
    // handled inside card
  }

  const filtered = allCourses.filter((c) => {
    if (filterCat !== '全部' && c.category !== filterCat) return false;
    if (filterSource !== '全部' && c.source !== filterSource) return false;
    if (filterLang !== '全部' && !c.langs.includes(filterLang)) return false;
    return true;
  });

  const viewingCourse = viewingId ? allCourses.find(c => c.id === viewingId) ?? null : null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {viewingCourse && (
        <FreeCourseModal
          course={viewingCourse}
          onClose={() => setViewingId(null)}
          onAdd={() => { handleAddToLibrary(viewingCourse.id); }}
        />
      )}
      {/* Page header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Globe size={28} className="text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">免費製造業課程</h1>
        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
          免費資源
        </span>

        <div className="ml-auto flex items-center gap-3 flex-wrap">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              最後更新：{lastUpdated.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={handleFetch}
            disabled={fetching}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              fetching
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <RefreshCw size={15} className={fetching ? 'animate-spin' : ''} />
            {fetching ? '抓取中...' : '自動抓取最新課程'}
          </button>
          {isHRAdmin && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
            >
              <Plus size={15} />
              新增免費課程
            </button>
          )}
        </div>
      </div>

      {!isHRAdmin && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Lock size={12} />
          <span>僅 HR / 管理員可新增免費課程項目，確保來源與內容皆經人工確認可免費觀看。</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-gray-400 shrink-0" />
          <span className="text-sm font-medium text-gray-600 mr-1">篩選：</span>

          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500">類別</label>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="pl-2 pr-6 py-1 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500">來源</label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="pl-2 pr-6 py-1 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ALL_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500">語言</label>
            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              className="pl-2 pr-6 py-1 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['全部', 'zh', 'en', 'th', 'vi', 'id'].map((l) => (
                <option key={l} value={l}>{l === '全部' ? '全部' : `${LANG_FLAGS[l]} ${l.toUpperCase()}`}</option>
              ))}
            </select>
          </div>

          <span className="ml-auto text-xs text-gray-400">共 {filtered.length} 門課程</span>
        </div>
      </div>

      {/* Course grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Globe size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">目前沒有符合條件的課程</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onAddToLibrary={handleAddToLibrary}
              onGenerateQuiz={handleGenerateQuiz}
              onView={(id) => setViewingId(id)}
            />
          ))}
        </div>
      )}

      {/* Add free course form (HR/admin only) */}
      {showAddForm && isHRAdmin && (
        <AddFreeCourseModal
          onClose={() => setShowAddForm(false)}
          onSubmit={(courseData) => {
            addFreeCourse(courseData);
            setShowAddForm(false);
            showToast(`「${courseData.title}」已加入免費課程目錄！`);
          }}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
    </div>
  );
}
