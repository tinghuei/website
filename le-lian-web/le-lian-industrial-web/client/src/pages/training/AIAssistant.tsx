import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, ChevronRight } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';

type Message = { role: 'user' | 'bot'; text: string; time: string };

const KNOWLEDGE: Record<string, string> = {
  '職能標準': '職能標準依iCAP金屬製造業職能基準設定，包含技術職能、溝通職能、領導職能、問題解決、團隊合作、職業安全6大面向，各面向滿分5分。管理員可在職能分析頁面上傳工作職能書進行設定。',
  '工程師職能': '工程師職能標準依iCAP基準，技術職能需達4分以上、問題解決需達3.5分、溝通協作需達3分。可在「職能分析」頁面查看您目前的職能分數與落差分析。',
  '訓練進度': '您可以在「我的課程」頁面查看所有已報名課程的訓練進度。每個課程有進度條顯示完成百分比，以及各步驟（心得報告、測驗、審核）的狀態。',
  '課程': '您可以在課程庫中查看所有可用課程。必修課程以橘色標記，請優先完成。完成後需提交心得報告、滿意度調查和測驗。',
  '心得報告': '心得報告需在課程完成後15天內提交，內容包含：課程重點整理、實際應用計畫、學習心得反思，格式要求至少500字。在課程頁面點選「提交報告」即可填寫。',
  '報告': '心得報告需在課程完成後15天內提交，內容包含：課程重點整理、實際應用計畫、學習心得反思，格式要求至少500字。',
  '申請課程': '在課程庫頁面找到您想要的課程，點選「立即報名」即可完成報名。必修課程已自動為您報名，無需手動操作。',
  '申請': '在課程庫頁面找到您想要的課程，點選「立即報名」即可完成報名。必修課程已自動為您報名，無需手動操作。',
  '證書': '完成課程 → 提交心得報告 → 完成滿意度調查 → 通過測驗 → 主管審核通過後，系統自動頒發電子完訓證書。可在「成就獎勵」頁面下載證書PDF。',
  '年度計劃': '年度訓練計畫每年9月開始規劃，10月底前各單位提交至人資部門，11月於主管會議提報，符合TTQS規範。可在「年度計劃」頁面查看和新增計畫。',
  '職能': '職能落差分析依iCAP金屬製造業職能基準，根據您的職位評估6大職能面向，並建議補足課程。在「職能分析」頁面查看詳細分析結果。',
  '測驗': '課程完成後15天內須完成測驗，及格分數70分。外訓課程無測驗者以心得報告成績代替。測驗可多次嘗試，取最高分計算。',
  'ttqs': 'TTQS人才發展品質管理系統：本系統可產出訓練計畫、執行紀錄、簽到表、滿意度調查、心得報告等所有TTQS評核所需文件，可在「管理報表」頁面匯出。',
  '外訓': '參加外部訓練費用超過3,000元需簽訓練同意書。完訓後5個工作日內提交心得報告，並依費用高低規範服務年資。可在「費用同意書」頁面填寫申請。',
  '請假': '如需缺席訓練課程，請提前通知人資單位並填寫【教育訓練課程申請/異動表】，緊急情況以電話或通訊軟體通知。',
  '免費課程': '系統每日自動抓取勞動部、iCAP、金屬工業研究發展中心等機構的免費製造業課程，可在「免費課程」頁面查看並加入課程庫使用。',
  '語言': '本系統支援繁體中文、English、ภาษาไทย、Bahasa Indonesia、Tiếng Việt五種語言，可由右上角語言選擇器切換。',
  '積分': '完成課程可獲得積分，積分可在「成就獎勵」頁面兌換福利，包含特休假、書籍禮品卡、外訓補助等。',
  '密碼': '本系統採用公司Google帳號（SSO）登入，無需另行設定密碼。如帳號異常請聯繫IT部門。',
  '職涯': '「職涯規劃」頁面提供職能里程碑圖，展示您的職涯發展路徑和下一個晉升目標所需技能。',
};

const quickQuestions = [
  '如何設定工程師職能標準？',
  '如何查看訓練進度？',
  '如何提交心得報告？',
  '如何申請訓練課程？',
  '如何取得完訓證書？',
  '什麼是TTQS規範？',
  '如何查看積分兌換？',
  '外訓申請流程是什麼？',
];

const suggestedCards = [
  { q: '如何設定工程師職能標準？', icon: '🎯', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { q: '如何查看訓練進度？', icon: '📊', color: 'bg-green-50 border-green-200 text-green-700' },
  { q: '如何提交心得報告？', icon: '📝', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { q: '如何申請訓練課程？', icon: '📚', color: 'bg-orange-50 border-orange-200 text-orange-700' },
];

function getReply(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(KNOWLEDGE)) {
    if (lower.includes(key.toLowerCase())) return val;
  }
  return '您好！我是樂聯AI訓練助理 🤖\n\n很抱歉，我無法完全理解您的問題。請嘗試以下問題：\n• 如何查看訓練進度？\n• 如何提交心得報告？\n• 如何申請課程？\n• 證書如何取得？\n\n或直接聯繫人資部門協助。';
}

export default function AIAssistant() {
  const { currentUser } = useTrainingAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [started, setStarted] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChat = (q: string) => {
    setStarted(true);
    const time = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    const greeting: Message = {
      role: 'bot',
      text: `您好，${currentUser?.name || ''}！我是您的 AI 學習助理 🤖\n我可以幫助您解答課程報名、訓練進度、職能分析、證書申請等相關問題。`,
      time,
    };
    setMessages([greeting]);
    setTimeout(() => {
      send(q, [greeting]);
    }, 100);
  };

  const send = (text?: string, existingMessages?: Message[]) => {
    const msg = text || input.trim();
    if (!msg) return;
    const time = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    const base = existingMessages || messages;
    if (!started) {
      setStarted(true);
      const greeting: Message = {
        role: 'bot',
        text: `您好，${currentUser?.name || ''}！我是您的 AI 學習助理 🤖\n我可以幫助您解答課程報名、訓練進度、職能分析、證書申請等相關問題。`,
        time,
      };
      setMessages([greeting, { role: 'user', text: msg, time }]);
    } else {
      setMessages((prev) => [...(existingMessages ? base : prev), { role: 'user', text: msg, time }]);
    }
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'bot', text: getReply(msg), time }]);
      setTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 900);
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 text-lg">AI 學習助理</h1>
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
            線上 · 由樂聯工業 AI 提供支援
          </p>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {!started ? (
          /* Welcome screen */
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <Bot size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">您好！我是您的 AI 學習助理</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-md">
              我可以解答課程報名、訓練進度、職能分析、證書申請等各種訓練相關問題，請隨時提問！
            </p>

            {/* Suggestion cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-6">
              {suggestedCards.map((card) => (
                <button
                  key={card.q}
                  onClick={() => startChat(card.q)}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all hover:shadow-md ${card.color}`}
                >
                  <span className="text-2xl">{card.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{card.q}</p>
                  </div>
                  <ChevronRight size={16} className="opacity-50 shrink-0" />
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Sparkles size={12} className="text-yellow-500" />
              或直接在下方輸入您的問題
            </p>
          </div>
        ) : (
          /* Chat messages */
          <div className="p-6 space-y-4 min-h-full">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && (
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-1 shadow-sm">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-2xl`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm shadow-sm'
                      : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100'
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 px-1">{m.time}</span>
                </div>
                {m.role === 'user' && (
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center ml-3 flex-shrink-0 mt-1 text-white font-semibold text-sm shadow-sm">
                    {currentUser?.name?.[0] || 'U'}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-5 py-3.5 shadow-sm border border-gray-100">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Quick questions (shown after starting) */}
      {started && (
        <div className="bg-white border-t border-gray-100 px-6 py-3 shrink-0">
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <Sparkles size={11} className="text-yellow-500" /> 常見問題快速選擇
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => send(q)}
                disabled={typing}
                className="flex-shrink-0 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex gap-3 shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="輸入問題，例如：如何查看我的訓練進度？"
          className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || typing}
          className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
