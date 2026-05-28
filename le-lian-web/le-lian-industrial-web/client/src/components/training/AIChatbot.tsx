import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

type Message = { role: 'user' | 'bot'; text: string; time: string };

const RESPONSES: Record<string, Record<string, string>> = {
  zh: {
    '課程': '您可以在課程庫中查看所有可用課程。必修課程以橘色標記，請優先完成。完成後需提交心得報告、滿意度調查和測驗。',
    '證書': '完成課程→提交心得報告→完成滿意度調查→通過測驗→主管審核通過後，系統自動頒發電子完訓證書。',
    '年度計劃': '年度訓練計畫每年9月開始規劃，10月底前各單位提交至人資部門，11月於主管會議提報，符合TTQS規範。',
    '職能': '職能落差分析依iCAP金屬製造業職能基準，根據您的職位評估6大職能面向，並建議補足課程。',
    '測驗': '課程完成後15天內須完成測驗，及格分數70分。外訓課程無測驗者以心得報告成績代替。',
    'ttqs': 'TTQS人才發展品質管理系統：本系統可產出訓練計畫、執行紀錄、簽到表、滿意度調查、心得報告等所有TTQS評核所需文件。',
    '外訓': '參加外部訓練費用超過3,000元需簽訓練同意書。完訓後5個工作日內提交心得報告，並依費用高低規範服務年資。',
    '請假': '如需缺席訓練課程，請提前通知人資單位並填寫【教育訓練課程申請/異動表】，緊急情況以電話或通訊軟體通知。',
    '免費課程': '系統每日自動抓取勞動部、iCAP、金屬工業研究發展中心等機構的免費製造業課程，可直接加入課程庫使用。',
    '語言': '本系統支援繁體中文、English、ภาษาไทย、Bahasa Indonesia、Tiếng Việt五種語言，可由右上角語言選擇器切換。',
    'default': '您好！我是樂聯AI訓練助理 🤖\n我可以回答關於課程報名、證書申請、年度計劃、職能評估、TTQS規範等問題。\n請問需要什麼協助？'
  },
  en: {
    'course': 'You can view all available courses in the Course Library. Mandatory courses are marked in orange. After completing, submit your report, satisfaction survey, and quiz.',
    'certificate': 'Complete course → Submit report → Complete satisfaction survey → Pass quiz → Manager approves → Certificate issued automatically.',
    'annual': 'Annual training plan starts in September each year, submitted by October, reported at management meeting in November. TTQS compliant.',
    'default': 'Hello! I am Le Lian AI Training Assistant 🤖\nI can answer questions about courses, certificates, annual plans, competency assessment, and TTQS requirements.'
  },
  th: {
    'default': 'สวัสดี! ฉันคือผู้ช่วย AI ของ Le Lian 🤖\nฉันสามารถตอบคำถามเกี่ยวกับคอร์สเรียน ใบรับรอง แผนประจำปี และการประเมินสมรรถนะ'
  },
  id: {
    'default': 'Halo! Saya adalah Asisten AI Pelatihan Le Lian 🤖\nSaya dapat menjawab pertanyaan tentang kursus, sertifikat, rencana tahunan, dan penilaian kompetensi.'
  },
  vi: {
    'default': 'Xin chào! Tôi là Trợ lý AI Đào tạo Le Lian 🤖\nTôi có thể trả lời các câu hỏi về khóa học, chứng chỉ, kế hoạch năm và đánh giá năng lực.'
  }
};

function getResponse(text: string, lang: string): string {
  const responses = RESPONSES[lang] || RESPONSES['zh'];
  const lower = text.toLowerCase();
  for (const [key, val] of Object.entries(responses)) {
    if (key !== 'default' && lower.includes(key.toLowerCase())) return val;
  }
  // Try zh responses for common keywords
  const zhResp = RESPONSES['zh'];
  const keywords: Record<string, string> = { '課程': '課程', '证书': '證書', 'cert': '證書', 'ttqs': 'ttqs', 'quiz': '測驗', 'free': '免費課程' };
  for (const [kw, zhKey] of Object.entries(keywords)) {
    if (lower.includes(kw) && zhResp[zhKey]) return zhResp[zhKey];
  }
  return responses['default'] || RESPONSES['zh']['default'];
}

export default function AIChatbot() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: RESPONSES['zh']['default'], time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    const time = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text: msg, time }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = getResponse(msg, i18n.language);
      setMessages(prev => [...prev, { role: 'bot', text: reply, time }]);
      setTyping(false);
    }, 800);
  };

  const quickQs = (t('chat.quickQ', { returnObjects: true }) as string[]);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden" style={{ height: '520px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">{t('chat.title')}</div>
              <div className="text-blue-100 text-xs">樂聯工業 AI 助理 • 線上</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && (
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div className={`max-w-[78%] ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100'
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 px-1">{m.time}</span>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          <div className="px-3 py-2 border-t border-gray-100 bg-white">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {quickQs.map((q, i) => (
                <button key={i} onClick={() => send(q)}
                  className="flex-shrink-0 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs hover:bg-blue-100 transition-colors whitespace-nowrap">
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={t('chat.placeholder')}
              className="flex-1 px-3 py-2 bg-gray-100 rounded-xl text-sm outline-none focus:bg-gray-50 focus:ring-2 focus:ring-blue-200"
            />
            <button onClick={() => send()}
              className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
