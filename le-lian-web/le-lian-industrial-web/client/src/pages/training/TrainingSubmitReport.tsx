import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useTrainingAuth } from '../../context/TrainingAuthContext';
import { FileText, Star, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

const STAR_LABELS: Record<number, string> = {
  1: '非常不滿意',
  2: '不滿意',
  3: '普通',
  4: '滿意',
  5: '非常滿意',
};

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 w-28 shrink-0">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              size={22}
              className={`transition-colors ${
                star <= (hovered || value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      {value > 0 && <span className="text-sm text-gray-500">{STAR_LABELS[value]}</span>}
    </div>
  );
}

export default function TrainingSubmitReport() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [, navigate] = useLocation();
  const { currentUser, courses, getEnrollmentForUser, submitReport, checkAndSetPendingReview } = useTrainingAuth();

  const course = courses.find((c) => c.id === id);
  const enrollment = currentUser ? getEnrollmentForUser(currentUser.id, id || '') : null;

  const [activeTab, setActiveTab] = useState('report');
  const [reportContent, setReportContent] = useState(enrollment?.reportContent || '');
  const [ratings, setRatings] = useState<Record<string, number>>(
    enrollment?.surveyData
      ? {
          content: (enrollment.surveyData.content as number) || 0,
          instructor: (enrollment.surveyData.instructor as number) || 0,
          materials: (enrollment.surveyData.materials as number) || 0,
          practical: (enrollment.surveyData.practical as number) || 0,
        }
      : { content: 0, instructor: 0, materials: 0, practical: 0 }
  );
  const [overall, setOverall] = useState((enrollment?.surveyData?.overall as number) || 0);
  const [suggestions, setSuggestions] = useState((enrollment?.surveyData?.suggestions as string) || '');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!course || !enrollment) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">找不到課程或未報名</p>
        <button onClick={() => navigate('/training/courses')} className="mt-3 text-blue-600 text-sm hover:text-blue-700">
          返回課程庫
        </button>
      </div>
    );
  }

  const reportMinLength = 100;
  const reportValid = reportContent.trim().length >= reportMinLength;
  const surveyValid = Object.values(ratings).every((v) => v > 0) && overall > 0;

  const handleSubmit = () => {
    if (!reportValid || !surveyValid) return;
    setLoading(true);
    setTimeout(() => {
      const surveyData = { ...ratings, overall, suggestions };
      submitReport(enrollment.id, reportContent, surveyData);
      checkAndSetPendingReview(enrollment.id);
      setSubmitted(true);
      setLoading(false);
    }, 800);
  };

  if (submitted) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">提交成功！</h2>
          <p className="text-gray-500 mb-6">您的心得報告和滿意度調查已成功提交，等待主管審核。</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(`/training/courses/${id}/quiz`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              前往測驗 <ChevronRight size={16} />
            </button>
            <button
              onClick={() => navigate(`/training/courses/${id}`)}
              className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              返回課程
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(`/training/courses/${id}`)}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
      >
        ← 返回課程
      </button>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">提交學習資料</h1>
        <p className="text-gray-500 text-sm mt-1">{course.title}</p>
      </div>

      {enrollment.reportSubmitted && enrollment.surveySubmitted && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
          <CheckCircle size={18} className="text-green-500" />
          <p className="text-sm text-green-700">您已提交過學習資料，可修改後重新提交。</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'report' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={16} /> 心得報告
            {reportValid && <CheckCircle size={14} className="text-green-500" />}
          </button>
          <button
            onClick={() => setActiveTab('survey')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'survey' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Star size={16} /> 滿意度調查
            {surveyValid && <CheckCircle size={14} className="text-green-500" />}
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'report' && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">訓練心得報告</h2>
              <p className="text-sm text-gray-500 mb-4">請描述您在本課程中的學習心得、收穫及如何應用於實際工作中。（最少 {reportMinLength} 字）</p>
              <textarea
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                placeholder={`請在此輸入您的學習心得報告...\n\n建議包含：\n• 課程中最有收穫的內容\n• 與工作相關的應用方式\n• 對未來工作的影響\n• 建議改進事項`}
                className="w-full border border-gray-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-64 leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  {reportContent.length < reportMinLength ? (
                    <AlertCircle size={15} className="text-yellow-500" />
                  ) : (
                    <CheckCircle size={15} className="text-green-500" />
                  )}
                  <span className={`text-xs ${reportContent.length < reportMinLength ? 'text-yellow-600' : 'text-green-600'}`}>
                    {reportContent.length} / {reportMinLength} 字（最少）
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('survey')}
                  disabled={!reportValid}
                  className={`text-sm font-medium flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    reportValid ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  下一步：填寫調查 <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'survey' && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">課程滿意度調查</h2>
              <p className="text-sm text-gray-500 mb-5">您的意見對我們非常重要，請如實填寫以協助改善課程品質。</p>
              <div className="space-y-5">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-100">各項評分</h3>
                  {[
                    { key: 'content', label: '課程內容' },
                    { key: 'instructor', label: '講師表現' },
                    { key: 'materials', label: '教材品質' },
                    { key: 'practical', label: '實務應用' },
                  ].map(({ key, label }) => (
                    <StarRating
                      key={key}
                      label={label}
                      value={ratings[key]}
                      onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
                    />
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">整體滿意度</h3>
                  <div className="flex items-center gap-4 flex-wrap">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setOverall(score)}
                        className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${
                          overall === score ? 'bg-blue-600 text-white shadow-md scale-110' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                    <span className="text-sm text-gray-500">
                      {overall > 0 ? `${overall}分 - ${STAR_LABELS[overall]}` : '請選擇整體評分'}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">意見與建議（選填）</label>
                  <textarea
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    placeholder="請填寫您對課程的建議或改善意見..."
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <div className={`flex items-center gap-1 ${reportValid ? 'text-green-600' : 'text-gray-400'}`}>
              {reportValid ? <CheckCircle size={13} /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
              心得報告
            </div>
            <div className={`flex items-center gap-1 ${surveyValid ? 'text-green-600' : 'text-gray-400'}`}>
              {surveyValid ? <CheckCircle size={13} /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
              滿意度調查
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!reportValid || !surveyValid || loading}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
              reportValid && surveyValid && !loading ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <><CheckCircle size={15} /> 提交所有資料</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
