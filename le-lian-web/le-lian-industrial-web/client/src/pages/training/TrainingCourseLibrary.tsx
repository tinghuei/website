import { useState } from 'react';
import { useLocation } from 'wouter';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { Search, Clock, CheckCircle, BookOpen, ChevronRight, Sparkles, Plus, Edit3, X, Save, Upload, Trash2, Film, FileText, RefreshCw } from 'lucide-react';
import type { Course, QuizQuestion } from '../../data/trainingMockData';
import { MAX_VIDEO_SIZE, saveCourseVideo, deleteCourseVideo } from '../../lib/videoStorage';
import { MAX_PRESENTATION_SIZE, savePresentationFile, deletePresentationFile, getPresentationFile } from '../../lib/presentationStorage';
import { generateDraftQuiz, generateContentQuiz } from '../../lib/quizGenerator';
import { extractPdfText } from '../../lib/pdfTextExtractor';

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

export interface SaveFiles {
  videoFile: File | null;
  removeLocalVideo: boolean;
  presentationFile: File | null;
  removePresentation: boolean;
}

const PRESENTATION_EXTENSIONS = ['.pdf', '.ppt', '.pptx', '.doc', '.docx'];

function emptyQuestion(): QuizQuestion {
  return { id: `q${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, question: '', options: ['', '', '', ''], answerIndex: 0 };
}

function EditCourseModal({ course, onSave, onClose }: {
  course: Partial<Course> & { id?: string };
  onSave: (data: Partial<Course>, files: SaveFiles) => void;
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
    videoTranscript: course.videoTranscript || '',
    quizQuestions: course.quizQuestions || [],
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [removeLocalVideo, setRemoveLocalVideo] = useState(false);
  const [fileError, setFileError] = useState('');
  const maxVideoMB = MAX_VIDEO_SIZE / 1024 / 1024;

  const [presentationFile, setPresentationFile] = useState<File | null>(null);
  const [removePresentation, setRemovePresentation] = useState(false);
  const [presentationError, setPresentationError] = useState('');
  const maxPresentationMB = MAX_PRESENTATION_SIZE / 1024 / 1024;

  const [quizGenerating, setQuizGenerating] = useState(false);
  const [quizNote, setQuizNote] = useState('');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setFileError('請選擇影片格式的檔案');
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      setFileError(`檔案大小超過 ${maxVideoMB}MB 上限`);
      return;
    }
    setFileError('');
    setVideoFile(file);
    setRemoveLocalVideo(false);
  }

  function handlePresentationFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    if (!PRESENTATION_EXTENSIONS.includes(ext)) {
      setPresentationError('請選擇 PDF、PPT、PPTX、DOC 或 DOCX 格式的檔案');
      return;
    }
    if (file.size > MAX_PRESENTATION_SIZE) {
      setPresentationError(`檔案大小超過 ${maxPresentationMB}MB 上限`);
      return;
    }
    setPresentationError('');
    setPresentationFile(file);
    setRemovePresentation(false);
  }

  function handleAddQuestion() {
    setQuizNote('');
    setForm(f => ({ ...f, quizQuestions: [...f.quizQuestions, emptyQuestion()] }));
  }

  function handleRemoveQuestion(qIndex: number) {
    setForm(f => ({ ...f, quizQuestions: f.quizQuestions.filter((_, i) => i !== qIndex) }));
  }

  function handleQuestionTextChange(qIndex: number, text: string) {
    setForm(f => ({
      ...f,
      quizQuestions: f.quizQuestions.map((q, i) => (i === qIndex ? { ...q, question: text } : q)),
    }));
  }

  function handleOptionChange(qIndex: number, oIndex: number, text: string) {
    setForm(f => ({
      ...f,
      quizQuestions: f.quizQuestions.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? text : o)) } : q
      ),
    }));
  }

  function handleAnswerIndexChange(qIndex: number, oIndex: number) {
    setForm(f => ({
      ...f,
      quizQuestions: f.quizQuestions.map((q, i) => (i === qIndex ? { ...q, answerIndex: oIndex } : q)),
    }));
  }

  async function handleGenerateQuiz() {
    if (quizGenerating) return;
    setQuizGenerating(true);
    setQuizNote('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 優先使用本次新選擇的 PDF 教材檔，否則嘗試讀取課程已上傳的教材檔（PDF）
      let pdfFile: File | null = null;
      const isPdf = (f: File) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
      if (presentationFile && isPdf(presentationFile)) {
        pdfFile = presentationFile;
      } else if (course.id && course.localPresentation && !removePresentation) {
        const stored = await getPresentationFile(course.id);
        if (stored && isPdf(stored)) pdfFile = stored;
      }

      const pdfText = pdfFile ? await extractPdfText(pdfFile) : '';
      const videoText = form.videoTranscript.trim();
      // 影片文字稿與 PDF 教材文字合併，作為「依實際內容出題」的素材；
      // 瀏覽器端無法自動辨識影片語音內容，故影片內容須由課程建立者貼上文字稿/大綱才能據此出題。
      const materialText = [videoText, pdfText].filter(Boolean).join('\n');
      const courseInfo = { title: form.title || '本課程', category: form.category, description: form.description };
      const targetCount = Math.min(15, Math.max(5, 20 - form.quizQuestions.length));

      const contentDrafts = materialText
        ? generateContentQuiz(courseInfo, materialText, Math.ceil(targetCount / 2), form.quizQuestions)
        : [];
      const templateDrafts = generateDraftQuiz(courseInfo, targetCount - contentDrafts.length, [...form.quizQuestions, ...contentDrafts]);
      const drafts = [...contentDrafts, ...templateDrafts];

      if (drafts.length === 0) {
        setQuizNote('目前題庫範本已全部加入，如需更多題目請點擊「新增題目」手動編寫。');
      } else {
        setForm(f => ({ ...f, quizQuestions: [...f.quizQuestions, ...drafts] }));
        const sourceLabel = videoText && pdfText ? '依影片文字稿與 PDF 教材內容產生' : videoText ? '依影片文字稿內容產生' : pdfText ? '依教材 PDF 內容產生' : '';
        setQuizNote(
          contentDrafts.length > 0
            ? `已新增 ${drafts.length} 題草稿（其中 ${contentDrafts.length} 題${sourceLabel}），請逐題確認內容與正確答案後再發布。`
            : `已新增 ${drafts.length} 題草稿，請逐題確認內容與正確答案後再發布。`
        );
      }
    } finally {
      setQuizGenerating(false);
    }
  }

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
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">影片內容文字稿/大綱（選填）</label>
            <textarea
              value={form.videoTranscript}
              onChange={e => setForm(f => ({ ...f, videoTranscript: e.target.value }))}
              rows={4}
              placeholder="貼上影片的逐字稿、字幕或內容大綱，AI 自動生成測驗時會依此文字內容出題"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              瀏覽器無法自動辨識影片中的語音內容，請貼上文字稿/字幕或大綱，AI 自動生成測驗才能依「實際影片內容」出題，而非僅依課程標題與類別產生通用題目。
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">上傳影片檔（選填）</label>
            {course.localVideo && !removeLocalVideo && !videoFile && (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-2 text-sm">
                <span className="flex items-center gap-1.5 text-green-700"><Film size={14} />已上傳本機影片檔</span>
                <button type="button" onClick={() => setRemoveLocalVideo(true)} className="text-red-500 hover:text-red-600 flex items-center gap-1 text-xs">
                  <Trash2 size={12} />移除
                </button>
              </div>
            )}
            {removeLocalVideo && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2 text-xs text-amber-700">
                <span>儲存後將移除已上傳的影片檔</span>
                <button type="button" onClick={() => setRemoveLocalVideo(false)} className="text-blue-600 hover:text-blue-700">復原</button>
              </div>
            )}
            {videoFile ? (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-2 text-sm">
                <span className="flex items-center gap-1.5 text-blue-700 truncate min-w-0">
                  <Film size={14} className="shrink-0" />
                  <span className="truncate">{videoFile.name}（{(videoFile.size / 1024 / 1024).toFixed(1)}MB）</span>
                </span>
                <button type="button" onClick={() => setVideoFile(null)} className="text-gray-400 hover:text-gray-600 shrink-0 ml-2"><X size={14} /></button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-500 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-colors">
                <Upload size={15} />
                選擇要上傳的影片檔（mp4 等格式）
                <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
            {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
            <p className="text-xs text-gray-400 mt-1">
              影片檔將儲存在目前瀏覽器中（單檔上限 {maxVideoMB}MB），僅此裝置可播放、清除瀏覽器資料會遺失。若需所有人都能觀看，建議改用上方 YouTube 連結。若兩者皆設定，將優先播放已上傳的影片檔。
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">上傳課程簡報/教材（選填）</label>
            {course.localPresentation && !removePresentation && !presentationFile && (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-2 text-sm">
                <span className="flex items-center gap-1.5 text-green-700 truncate min-w-0">
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate">已上傳：{course.presentationName || '課程教材'}</span>
                </span>
                <button type="button" onClick={() => setRemovePresentation(true)} className="text-red-500 hover:text-red-600 flex items-center gap-1 text-xs shrink-0 ml-2">
                  <Trash2 size={12} />移除
                </button>
              </div>
            )}
            {removePresentation && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2 text-xs text-amber-700">
                <span>儲存後將移除已上傳的課程教材</span>
                <button type="button" onClick={() => setRemovePresentation(false)} className="text-blue-600 hover:text-blue-700">復原</button>
              </div>
            )}
            {presentationFile ? (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-2 text-sm">
                <span className="flex items-center gap-1.5 text-blue-700 truncate min-w-0">
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate">{presentationFile.name}（{(presentationFile.size / 1024 / 1024).toFixed(1)}MB）</span>
                </span>
                <button type="button" onClick={() => setPresentationFile(null)} className="text-gray-400 hover:text-gray-600 shrink-0 ml-2"><X size={14} /></button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-500 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-colors">
                <Upload size={15} />
                選擇要上傳的簡報/文件（PDF、PPT、PPTX、DOC、DOCX）
                <input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" className="hidden" onChange={handlePresentationFileChange} />
              </label>
            )}
            {presentationError && <p className="text-xs text-red-500 mt-1">{presentationError}</p>}
            <p className="text-xs text-gray-400 mt-1">
              教材檔將儲存在目前瀏覽器中（單檔上限 {maxPresentationMB}MB）。PDF 可直接於課程內容頁瀏覽，其他格式提供下載觀看。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="mandatory" checked={form.mandatory} onChange={e => setForm(f => ({ ...f, mandatory: e.target.checked }))} className="accent-blue-600" />
            <label htmlFor="mandatory" className="text-sm text-gray-700">設為必修課程</label>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <label className="block text-xs font-medium text-gray-600">測驗題目（{form.quizQuestions.length} 題）</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateQuiz}
                  disabled={quizGenerating}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50"
                >
                  {quizGenerating ? <RefreshCw size={11} className="animate-spin" /> : <Sparkles size={11} />}
                  {quizGenerating ? 'AI 生成中...' : 'AI 自動生成測驗'}
                </button>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                >
                  <Plus size={11} />新增題目
                </button>
              </div>
            </div>
            {form.quizQuestions.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 mb-2">
                <strong>提示：</strong>AI 自動生成之題目為草稿，部分依課程類別、名稱與課程描述文字產生固定範本題；若已填寫上方「影片內容文字稿/大綱」或上傳 PDF 教材，會額外依該文字內容產生對應題目
                {!form.videoTranscript.trim() && <>（<strong>目前尚未填寫影片文字稿，無法依實際影片內容出題</strong>）</>}
                ，請務必依實際教學內容確認、修改題目與正確答案後再儲存發布。
              </div>
            )}
            {quizNote && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 mb-2">
                {quizNote}
              </div>
            )}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {form.quizQuestions.map((q, qi) => (
                <div key={q.id} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50/50">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-gray-400 mt-2 shrink-0">Q{qi + 1}</span>
                    <textarea
                      value={q.question}
                      onChange={e => handleQuestionTextChange(qi, e.target.value)}
                      rows={2}
                      placeholder="輸入題目內容"
                      className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-white"
                    />
                    <button type="button" onClick={() => handleRemoveQuestion(qi)} className="text-gray-400 hover:text-red-500 shrink-0 mt-1.5"><X size={14} /></button>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 pl-6">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`answer-${q.id}`}
                          checked={q.answerIndex === oi}
                          onChange={() => handleAnswerIndexChange(qi, oi)}
                          className="accent-green-600 shrink-0"
                          title="設為正確答案"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={e => handleOptionChange(qi, oi, e.target.value)}
                          placeholder={`選項 ${oi + 1}`}
                          className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                        />
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 pl-6">點選圓圈以設定正確答案</p>
                </div>
              ))}
              {form.quizQuestions.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">尚無測驗題目，可點擊「AI 自動生成測驗」或「新增題目」</p>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700">取消</button>
            <button
              onClick={() => { if (!form.title) return; onSave(form, { videoFile, removeLocalVideo, presentationFile, removePresentation }); }}
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
  const { courses, currentUser, getUserEnrollments, enrollInCourse, updateCourse, addCourse, deleteCourse } = useTrainingAuth();
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

  async function handleSaveEdit(data: Partial<Course>, files: SaveFiles) {
    if (!editingCourse) return;
    const updates: Partial<Course> = { ...data };
    if (files.videoFile) {
      await saveCourseVideo(editingCourse.id, files.videoFile);
      updates.localVideo = true;
    } else if (files.removeLocalVideo) {
      await deleteCourseVideo(editingCourse.id);
      updates.localVideo = false;
    }
    if (files.presentationFile) {
      await savePresentationFile(editingCourse.id, files.presentationFile);
      updates.localPresentation = true;
      updates.presentationName = files.presentationFile.name;
    } else if (files.removePresentation) {
      await deletePresentationFile(editingCourse.id);
      updates.localPresentation = false;
      updates.presentationName = undefined;
    }
    updateCourse(editingCourse.id, updates);
    setEditingCourse(null);
    showToast('課程已更新');
  }

  async function handleAddCourse(data: Partial<Course>, files: SaveFiles) {
    const newCourse = addCourse({
      ...data,
      status: 'active',
      localVideo: !!files.videoFile,
      localPresentation: !!files.presentationFile,
      presentationName: files.presentationFile?.name,
    });
    if (files.videoFile) {
      await saveCourseVideo(newCourse.id, files.videoFile);
    }
    if (files.presentationFile) {
      await savePresentationFile(newCourse.id, files.presentationFile);
    }
    setAddingCourse(false);
    showToast('新課程已加入課程庫');
  }

  function handleDeleteCourse(course: Course) {
    if (!window.confirm(`確定要刪除「${course.title}」課程嗎？此操作無法復原。`)) return;
    deleteCourse(course.id);
    showToast('課程已刪除');
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
                    {canManage && !course.videoId && !course.localVideo && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors"
                        title="刪除課程（僅限尚未上傳線上影片的課程）"
                      >
                        <Trash2 size={15} />
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
