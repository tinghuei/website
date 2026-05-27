import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, AlertCircle, ChevronRight, Award, RotateCcw } from 'lucide-react';

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, courses, getEnrollmentForUser, submitQuiz, checkAndSetPendingReview } = useAuth();

  const course = courses.find((c) => c.id === id);
  const enrollment = currentUser ? getEnrollmentForUser(currentUser.id, id) : null;

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);

  if (!course || !enrollment) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">找不到課程或未報名</p>
        <button onClick={() => navigate('/courses')} className="mt-3 text-blue-600 text-sm">返回課程庫</button>
      </div>
    );
  }

  // Already submitted
  if (enrollment.quizSubmitted && !submitted) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <button onClick={() => navigate(`/courses/${id}`)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
          ← 返回課程
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            enrollment.quizScore >= course.passingScore ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {enrollment.quizScore >= course.passingScore ? (
              <CheckCircle size={40} className="text-green-500" />
            ) : (
              <XCircle size={40} className="text-red-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {enrollment.quizScore >= course.passingScore ? '測驗通過！' : '測驗未通過'}
          </h2>
          <p className="text-5xl font-black text-gray-900 mb-1">{enrollment.quizScore}</p>
          <p className="text-gray-500 text-sm mb-6">（通過標準：{course.passingScore} 分）</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(`/courses/${id}`)}
              className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50"
            >
              返回課程
            </button>
            <button
              onClick={() => navigate('/my-courses')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm"
            >
              查看我的課程
            </button>
          </div>
        </div>
      </div>
    );
  }

  const questions = course.quizQuestions || [];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  const handleAnswer = (questionId, optionIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    setLoading(true);
    setTimeout(() => {
      let correct = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.answerIndex) correct++;
      });
      const calculatedScore = Math.round((correct / totalQuestions) * 100);
      setScore(calculatedScore);
      setSubmitted(true);
      submitQuiz(enrollment.id, calculatedScore);
      checkAndSetPendingReview(enrollment.id);
      setLoading(false);
    }, 800);
  };

  const passed = submitted && score >= course.passingScore;
  const correctCount = submitted
    ? questions.filter((q) => answers[q.id] === q.answerIndex).length
    : 0;

  if (submitted) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <button onClick={() => navigate(`/courses/${id}`)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
          ← 返回課程
        </button>

        {/* Result card */}
        <div className={`rounded-2xl p-8 text-center mb-6 ${passed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'} text-white shadow-lg`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-white/20' : 'bg-white/20'}`}>
            {passed ? <Award size={40} /> : <XCircle size={40} />}
          </div>
          <h2 className="text-3xl font-black mb-1">{passed ? '恭喜通過！' : '未通過測驗'}</h2>
          <div className="flex items-end justify-center gap-2 mb-2">
            <span className="text-6xl font-black">{score}</span>
            <span className="text-2xl mb-2">分</span>
          </div>
          <p className="text-white/80 text-sm">
            答對 {correctCount} / {totalQuestions} 題 · 通過標準：{course.passingScore} 分
          </p>
          {!passed && (
            <p className="mt-3 text-white/90 text-sm">
              建議重新觀看課程後再次參加測驗
            </p>
          )}
        </div>

        {/* Answer review toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowReview(!showReview)}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">查看答題結果</span>
            <ChevronRight size={18} className={`text-gray-400 transition-transform ${showReview ? 'rotate-90' : ''}`} />
          </button>

          {showReview && (
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {questions.map((q, idx) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.answerIndex;
                return (
                  <div key={q.id} className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      {isCorrect ? (
                        <CheckCircle size={20} className="text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
                      )}
                      <p className="text-sm font-medium text-gray-900">
                        {idx + 1}. {q.question}
                      </p>
                    </div>
                    <div className="ml-8 space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg text-sm ${
                            optIdx === q.answerIndex
                              ? 'bg-green-50 text-green-700 border border-green-200 font-medium'
                              : optIdx === userAnswer && !isCorrect
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'text-gray-600'
                          }`}
                        >
                          {opt}
                          {optIdx === q.answerIndex && ' ✓ 正確答案'}
                          {optIdx === userAnswer && !isCorrect && ' ✗ 您的答案'}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => navigate(`/courses/${id}`)}
            className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            返回課程
          </button>
          <button
            onClick={() => navigate('/my-courses')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            查看我的課程
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(`/courses/${id}`)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
        ← 返回課程
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">課程測驗</h1>
        <p className="text-gray-500 text-sm mt-1">{course.title}</p>
      </div>

      {/* Quiz info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-blue-700">共 <strong>{totalQuestions}</strong> 題</span>
          <span className="text-blue-700">通過標準：<strong>{course.passingScore}</strong> 分</span>
          <span className="text-blue-700">已作答：<strong>{answeredCount}</strong> / {totalQuestions} 題</span>
        </div>
        {!enrollment?.reportSubmitted && (
          <div className="flex items-center gap-2 mt-2 text-yellow-700">
            <AlertCircle size={15} />
            <span className="text-xs">提示：建議先提交心得報告後再參加測驗</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>作答進度</span>
          <span>{answeredCount} / {totalQuestions}</span>
        </div>
        <div className="bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((q, idx) => {
          const userAnswer = answers[q.id];
          return (
            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  userAnswer !== undefined ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {idx + 1}
                </div>
                <p className="text-sm font-medium text-gray-900 leading-relaxed pt-0.5">{q.question}</p>
              </div>
              <div className="space-y-2 ml-10">
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleAnswer(q.id, optIdx)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${
                      userAnswer === optIdx
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <span className={`font-medium mr-2 ${userAnswer === optIdx ? 'text-blue-200' : 'text-gray-400'}`}>
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    {opt.replace(/^[A-D]\.\s?/, '')}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="mt-6 flex items-center justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div>
          {!allAnswered && (
            <p className="text-sm text-yellow-600 flex items-center gap-1">
              <AlertCircle size={14} />
              還有 {totalQuestions - answeredCount} 題未作答
            </p>
          )}
          {allAnswered && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle size={14} />
              所有題目已作答，可提交測驗
            </p>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || loading}
          className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 ${
            allAnswered && !loading
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>提交測驗 <ChevronRight size={16} /></>
          )}
        </button>
      </div>
    </div>
  );
}
