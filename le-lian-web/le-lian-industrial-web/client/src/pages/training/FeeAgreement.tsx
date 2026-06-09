import { useState, useMemo, useRef, useEffect } from 'react';
import { FileText, Printer, Download, Save, Eye, EyeOff, Send, Archive, CheckCircle, PenLine, Upload, Trash2, X } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';

const DEPARTMENTS = [
  '總經理室', '品保課', '管理部', '總務課', '營業部', '業務課',
  '研發課', '廠務部', '廠務室', '製造課', '組一組', '組二組',
  '組三組', '沖床組', '塗裝組', '加工組', '財務部', '庶務組', '人資安全組',
];

interface FeeForm {
  employeeName: string;
  employeeId: string;
  joinDate: string;
  department: string;
  title: string;
  grade: string;
  serviceYears: string;
  courseName: string;
  trainingType: '外部訓練' | '內部訓練';
  institution: string;
  startDate: string;
  endDate: string;
  location: string;
  courseFee: number;
  certFee: number;
  travelFee: number;
  otherFee: number;
  beforeServiceYrs: number;
  beforeServiceMons: number;
  addedServiceYrs: number;
  addedServiceMons: number;
}

interface SentAgreement {
  id: string;
  employeeName: string;
  employeeId: string;
  joinDate: string;
  department: string;
  title: string;
  grade: string;
  serviceYears: string;
  courseName: string;
  trainingType: '外部訓練' | '內部訓練';
  institution: string;
  startDate: string;
  endDate: string;
  location: string;
  totalFee: number;
  beforeServiceYrs: number;
  beforeServiceMons: number;
  addedServiceYrs: number;
  addedServiceMons: number;
  afterServiceYrs: number;
  afterServiceMons: number;
  sentAt: string;
  sentBy: string;
  status: 'pending_sign' | 'signed' | 'archived';
  signedAt?: string;
  signatureImage?: string;
  idNumber?: string;
  address?: string;
  phone?: string;
}

const STORAGE_KEY = 'fee_agreements_v2';

function loadAgreements(): SentAgreement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAgreements(list: SentAgreement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const INITIAL_FORM: FeeForm = {
  employeeName: '', employeeId: '', joinDate: '',
  department: '', title: '', grade: '', serviceYears: '',
  courseName: '', trainingType: '外部訓練', institution: '',
  startDate: '', endDate: '', location: '',
  courseFee: 0, certFee: 0, travelFee: 0, otherFee: 0,
  beforeServiceYrs: 0, beforeServiceMons: 0,
  addedServiceYrs: 0, addedServiceMons: 0,
};

function feeToChineseWords(n: number): { wan: number; qian: number; bai: number; shi: number; yuan: number } {
  const wan = Math.floor(n / 10000);
  const qian = Math.floor((n % 10000) / 1000);
  const bai = Math.floor((n % 1000) / 100);
  const shi = Math.floor((n % 100) / 10);
  const yuan = n % 10;
  return { wan, qian, bai, shi, yuan };
}

function fmt(n: number) { return n.toLocaleString('zh-TW'); }

function calcAfterService(beforeYrs: number, beforeMons: number, addYrs: number, addMons: number) {
  let totalMons = beforeYrs * 12 + beforeMons + addYrs * 12 + addMons;
  return { yrs: Math.floor(totalMons / 12), mons: totalMons % 12 };
}

function getAddedService(totalFee: number): { yrs: number; mons: number; label: string } {
  if (totalFee < 3000) return { yrs: 0, mons: 0, label: '無服務年資限制' };
  if (totalFee < 10000) return { yrs: 0, mons: 6, label: '增加 6 個月' };
  if (totalFee < 20000) return { yrs: 1, mons: 0, label: '增加 1 年' };
  if (totalFee < 40000) return { yrs: 2, mons: 0, label: '增加 2 年' };
  return { yrs: 3, mons: 0, label: '增加 3 年（或依雙方協議）' };
}

// ── Canvas Signature ──────────────────────────────────────────────────────────
function SignatureCanvas({ onSave, onClear }: { onSave: (dataUrl: string) => void; onClear: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  function getPos(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    isDrawingRef.current = true;
    lastPointRef.current = getPos(e);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current || !canvasRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx || !lastPointRef.current) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPointRef.current = pos;
    setHasSignature(true);
  }

  function stopDraw() {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    if (canvasRef.current && hasSignature) {
      onSave(canvasRef.current.toDataURL('image/png'));
    }
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onClear();
  }

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/30 overflow-hidden" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={500}
          height={130}
          className="w-full block"
          style={{ cursor: 'crosshair', maxHeight: 130 }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">請在上方用滑鼠或手指繪製您的簽名</span>
        {hasSignature && (
          <button onClick={clearCanvas} className="text-red-500 hover:text-red-700 flex items-center gap-1">
            <Trash2 size={12} /> 清除重簽
          </button>
        )}
      </div>
    </div>
  );
}

// ── Document Preview (CFCMHR37 format) ───────────────────────────────────────
interface DocumentPreviewProps {
  form: FeeForm;
  totalFee: number;
  afterYrs: number;
  afterMons: number;
  signedInfo?: { signatureImage?: string; idNumber?: string; address?: string; phone?: string; signedAt: string };
}

function DocumentPreview({ form, totalFee, afterYrs, afterMons, signedInfo }: DocumentPreviewProps) {
  const { wan, qian, bai, shi, yuan } = feeToChineseWords(totalFee);

  return (
    <div
      id="fee-agreement-print"
      className="bg-white border border-gray-300 rounded-lg p-6 font-serif text-xs leading-relaxed shadow-inner"
      style={{ fontFamily: '"Noto Serif TC", "Noto Serif CJK TC", serif' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div />
        <div className="text-center flex-1">
          <p className="text-base font-bold">樂聯工業股份有限公司</p>
          <p className="text-sm font-semibold mt-0.5">課程訓練費用同意書</p>
        </div>
        <div className="text-right text-[10px] text-gray-500 min-w-[120px]">
          <p>表單編號：CFCMHR37</p>
          <p>制訂日期：114.01.01</p>
        </div>
      </div>
      <div className="border-b-2 border-gray-800 mb-4" />

      {/* Employee info table */}
      <table className="w-full border-collapse mb-4 text-[11px]">
        <tbody>
          <tr>
            <td className="border border-gray-500 px-2 py-1 font-semibold bg-gray-100 text-center w-14">工號</td>
            <td className="border border-gray-500 px-2 py-1 w-24">{form.employeeId || '　　　　'}</td>
            <td className="border border-gray-500 px-2 py-1 font-semibold bg-gray-100 text-center w-12">姓名</td>
            <td className="border border-gray-500 px-2 py-1 w-24">{form.employeeName || '　　　　'}</td>
            <td className="border border-gray-500 px-2 py-1 font-semibold bg-gray-100 text-center w-16">到職日</td>
            <td className="border border-gray-500 px-2 py-1">{form.joinDate || '　　　　'}</td>
          </tr>
          <tr>
            <td className="border border-gray-500 px-2 py-1 font-semibold bg-gray-100 text-center">部門</td>
            <td className="border border-gray-500 px-2 py-1">{form.department || '　　　　'}</td>
            <td className="border border-gray-500 px-2 py-1 font-semibold bg-gray-100 text-center">職稱</td>
            <td className="border border-gray-500 px-2 py-1">{form.title || '　　　　'}</td>
            <td className="border border-gray-500 px-2 py-1 font-semibold bg-gray-100 text-center">職等/年資</td>
            <td className="border border-gray-500 px-2 py-1">{form.grade || '　'} 級 / {form.serviceYears || '　'} 年</td>
          </tr>
        </tbody>
      </table>

      {/* Fee section */}
      <div className="mb-3 leading-6">
        <span>本次訓練費用：新台幣</span>
        <span className="mx-1 px-1.5 border-b border-gray-600 font-bold">{wan}</span><span>萬</span>
        <span className="mx-1 px-1.5 border-b border-gray-600 font-bold">{qian}</span><span>千</span>
        <span className="mx-1 px-1.5 border-b border-gray-600 font-bold">{bai}</span><span>百</span>
        <span className="mx-1 px-1.5 border-b border-gray-600 font-bold">{shi}</span><span>十</span>
        <span className="mx-1 px-1.5 border-b border-gray-600 font-bold">{yuan}</span><span>元整</span>
        <span className="text-gray-600 ml-2">（NT$ {fmt(totalFee)}）</span>
      </div>

      {/* Service years */}
      <table className="w-full border-collapse mb-4 text-[11px]">
        <tbody>
          <tr>
            <td className="border border-gray-400 px-2 py-1 bg-gray-50 font-semibold text-center w-40">參加本訓前受規範年限</td>
            <td className="border border-gray-400 px-2 py-1">{form.beforeServiceYrs} 年 {form.beforeServiceMons} 個月</td>
            <td className="border border-gray-400 px-2 py-1 bg-gray-50 font-semibold text-center w-44">參加本訓後受規範增加年限</td>
            <td className="border border-gray-400 px-2 py-1">{form.addedServiceYrs} 年 {form.addedServiceMons} 個月</td>
            <td className="border border-gray-400 px-2 py-1 bg-gray-50 font-semibold text-center w-36">參加本訓後受規範年限</td>
            <td className="border border-gray-400 px-2 py-1 font-bold">{afterYrs} 年 {afterMons} 個月</td>
          </tr>
        </tbody>
      </table>

      {/* Terms */}
      <div className="space-y-2 text-[11px] leading-5">
        <div>
          <p className="font-bold">一、課程參與義務</p>
          <p className="pl-3">1. 受訓員工參加本次訓練，訓練期間應全程參與，不得無故缺席。</p>
          <p className="pl-3">2. 受訓員工訓練期間應遵守訓練機構規定及相關規範，服從講師指導，維護公司形象。</p>
          <p className="pl-3">3. 完訓後受訓員工應依本同意書約定服滿受規範年限。</p>
        </div>
        <div>
          <p className="font-bold">二、課程測驗、考核與心得</p>
          <p className="pl-3">1. 訓練課程完成後，受訓員工須接受公司安排之相關測驗（法令規範課程採線上測驗、職能課程及管理發展課程採紙本測驗或其他測驗、其他課程則視情況進行口頭或書面測驗）。</p>
          <p className="pl-3">2. 測驗成績須達訓練計畫訂定之及格標準（預設為70分），未達及格者須接受補考安排。</p>
          <p className="pl-3">3. 訓練完成後，受訓員工應完成並提交公司規定之訓練心得報告，報告中應包含訓練內容摘要、學習心得及在工作中的應用計畫。</p>
          <p className="pl-3">4. 受訓員工應完成並提交訓練滿意度調查，以協助公司持續改善訓練品質。</p>
          <p className="pl-3">5. 訓練心得報告及滿意度調查結果將作為個人職能發展記錄，並納入TTQS評核資料。</p>
        </div>
        <div>
          <p className="font-bold">三、個資與教材使用</p>
          <p className="pl-3">1. 公司提供之訓練教材（含電子版）僅供個人學習使用，未經授權不得複製、轉載、出版或提供給他人使用。</p>
          <p className="pl-3">2. 受訓員工同意公司依個人資料保護法及相關法規，蒐集、處理及利用其個人資料於本訓練相關事宜（含訓練記錄、TTQS評核及人才發展）。</p>
        </div>
        <div>
          <p className="font-bold">四、系統建檔與紀錄保存</p>
          <p className="pl-3">1. 本次訓練資料（含受訓員工資料、測驗成績、心得報告等）將登錄於公司教育訓練管理系統，作為員工訓練紀錄。</p>
          <p className="pl-3">2. 訓練記錄應依公司規定保存年限妥善保管，以利TTQS等相關稽核。</p>
        </div>
        <div>
          <p className="font-bold">五、服務年限規範</p>
          <p className="pl-3">1. 受訓員工自訓練結束後，應服務於樂聯工業股份有限公司至受規範年限屆滿為止，如於受規範年限屆滿前離職（含資遣外之各種離職原因），應依「年資月數/受規範年限月數」比例返還本次訓練費用。</p>
          <p className="pl-3">2. 前條所稱之返還費用，公司得自受訓員工薪資或其他應收款項中扣除，受訓員工不得異議。</p>
        </div>
        <div>
          <p className="font-bold">六、其他</p>
          <p className="pl-3">1. 本同意書壹式兩份，公司及受訓員工各執一份，雙方均有義務妥善保管。</p>
          <p className="pl-3">2. 本同意書未盡事宜，依公司教育訓練管理辦法及相關法規辦理。</p>
          <p className="pl-3">3. 受訓員工已詳閱並充分理解本同意書各條款，同意遵守並履行本同意書所載義務。</p>
          <p className="pl-3">4. 本同意書自受訓員工簽名後生效。</p>
        </div>
      </div>

      {/* Signature block */}
      <div className="mt-6 border-t-2 border-gray-800 pt-4">
        <div className="grid grid-cols-2 gap-6 text-[11px]">
          <div className="space-y-3">
            <div>
              <p className="font-semibold mb-1.5">受訓員工簽名：</p>
              {signedInfo?.signatureImage ? (
                <img src={signedInfo.signatureImage} alt="員工簽名" className="h-14 w-auto border border-gray-200 rounded bg-white" />
              ) : (
                <div className="border-b border-gray-500 w-44 h-10" />
              )}
            </div>
            <p>身分證號碼/居留證號碼：<span className="border-b border-gray-500 inline-block w-36 pl-1">{signedInfo?.idNumber || ''}</span></p>
            <p>受訓員工住址：<span className="border-b border-gray-500 inline-block w-48 pl-1">{signedInfo?.address || ''}</span></p>
            <p>受訓員工電話：<span className="border-b border-gray-500 inline-block w-36 pl-1">{signedInfo?.phone || ''}</span></p>
          </div>
          <div className="space-y-8">
            <div>
              <p className="font-semibold mb-1.5">申請單位課級主管簽名：</p>
              <div className="border-b border-gray-500 w-44 h-10" />
            </div>
            <div>
              <p className="font-semibold mb-1.5">執行單位人資單位簽名：</p>
              <div className="border-b border-gray-500 w-44 h-10" />
            </div>
          </div>
        </div>
        <div className="mt-4 text-right text-[11px]">
          {signedInfo?.signedAt ? (
            <p>中華民國 <span className="font-bold">{signedInfo.signedAt}</span> 簽署</p>
          ) : (
            <p>中華民國　　　年　　　月　　　日</p>
          )}
        </div>
      </div>
    </div>
  );
}

function statusBadge(status: SentAgreement['status']) {
  if (status === 'pending_sign') return <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700">待簽名</span>;
  if (status === 'signed') return <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700">已簽名</span>;
  return <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-500">已歸檔</span>;
}

// ── Employee Signing Modal ────────────────────────────────────────────────────
function SigningModal({ agreement, onSign, onClose }: {
  agreement: SentAgreement;
  onSign: (sig: { signatureImage: string; idNumber: string; address: string; phone: string }) => void;
  onClose: () => void;
}) {
  const [signatureImage, setSignatureImage] = useState('');
  const [useUpload, setUseUpload] = useState(false);
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSignatureImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  const canSubmit = signatureImage && idNumber.trim();

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">電子簽署同意書</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold">{agreement.courseName}</p>
            <p className="text-xs mt-0.5 text-blue-600">訓練費用：NT$ {fmt(agreement.totalFee)}</p>
          </div>

          {/* Signature input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">手寫簽名 *</label>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => { setUseUpload(false); setSignatureImage(''); }}
                  className={`px-3 py-1 rounded-lg border transition-colors ${!useUpload ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600'}`}
                >
                  <PenLine size={12} className="inline mr-1" />手寫繪製
                </button>
                <button
                  onClick={() => { setUseUpload(true); setSignatureImage(''); }}
                  className={`px-3 py-1 rounded-lg border transition-colors ${useUpload ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600'}`}
                >
                  <Upload size={12} className="inline mr-1" />上傳照片
                </button>
              </div>
            </div>

            {!useUpload ? (
              <SignatureCanvas
                onSave={setSignatureImage}
                onClear={() => setSignatureImage('')}
              />
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  {signatureImage ? '已上傳，點擊重新選擇' : '點擊上傳手寫簽名照片'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                {signatureImage && (
                  <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-2">
                    <img src={signatureImage} alt="preview" className="h-16 w-auto mx-auto" />
                    <button
                      onClick={() => setSignatureImage('')}
                      className="absolute top-1 right-1 p-1 bg-red-50 hover:bg-red-100 rounded-full"
                    >
                      <X size={12} className="text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Personal info */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">身分證號碼/居留證號碼 *</label>
              <input
                type="text"
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
                placeholder="A123456789"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">住址</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="台北市..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">聯絡電話</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0912-345-678"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">本人已詳閱並充分理解同意書各條款，同意遵守並履行各項義務。</p>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">取消</button>
            <button
              onClick={() => onSign({ signatureImage, idNumber, address, phone })}
              disabled={!canSubmit}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />確認簽署
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeeAgreement() {
  const { currentUser } = useTrainingAuth();
  const [form, setForm] = useState<FeeForm>(INITIAL_FORM);
  const [showPreview, setShowPreview] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [agreements, setAgreements] = useState<SentAgreement[]>(() => loadAgreements());
  const [viewingAgreement, setViewingAgreement] = useState<SentAgreement | null>(null);
  const [signingAgreement, setSigningAgreement] = useState<SentAgreement | null>(null);
  const [signSuccess, setSignSuccess] = useState(false);

  const totalFee = useMemo(
    () => form.courseFee + form.certFee + form.travelFee + form.otherFee,
    [form.courseFee, form.certFee, form.travelFee, form.otherFee]
  );

  const autoAdded = useMemo(() => getAddedService(totalFee), [totalFee]);

  const afterService = useMemo(() =>
    calcAfterService(form.beforeServiceYrs, form.beforeServiceMons, form.addedServiceYrs, form.addedServiceMons),
    [form.beforeServiceYrs, form.beforeServiceMons, form.addedServiceYrs, form.addedServiceMons]
  );

  function set<K extends keyof FeeForm>(key: K, value: FeeForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }
  function setNum(key: keyof FeeForm, raw: string) {
    setForm(prev => ({ ...prev, [key]: parseInt(raw.replace(/[^\d]/g, ''), 10) || 0 }));
  }

  const handleSendToEmployee = () => {
    if (!form.employeeName || !form.courseName) {
      setSavedMessage('請填寫員工姓名與課程名稱');
      setTimeout(() => setSavedMessage(''), 3000);
      return;
    }
    const afterSvc = calcAfterService(form.beforeServiceYrs, form.beforeServiceMons, form.addedServiceYrs, form.addedServiceMons);
    const newAgreement: SentAgreement = {
      id: `fa-${Date.now()}`,
      ...form,
      totalFee,
      afterServiceYrs: afterSvc.yrs,
      afterServiceMons: afterSvc.mons,
      sentAt: new Date().toLocaleString('zh-TW'),
      sentBy: currentUser?.name || '系統管理員',
      status: 'pending_sign',
    };
    const updated = [newAgreement, ...agreements];
    setAgreements(updated);
    saveAgreements(updated);
    setSavedMessage(`同意書已發送給 ${form.employeeName}！`);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleArchive = (id: string) => {
    const updated = agreements.map(a => a.id === id ? { ...a, status: 'archived' as const } : a);
    setAgreements(updated);
    saveAgreements(updated);
    if (viewingAgreement?.id === id) setViewingAgreement({ ...viewingAgreement, status: 'archived' });
  };

  const handleSign = (agreementId: string, sigData: { signatureImage: string; idNumber: string; address: string; phone: string }) => {
    const now = new Date().toLocaleString('zh-TW');
    const updated = agreements.map(a =>
      a.id === agreementId
        ? { ...a, status: 'signed' as const, signedAt: now, ...sigData }
        : a
    );
    setAgreements(updated);
    saveAgreements(updated);
    setSigningAgreement(null);
    setViewingAgreement(updated.find(a => a.id === agreementId) || null);
    setSignSuccess(true);
    setTimeout(() => setSignSuccess(false), 5000);
  };

  const isEmployee = currentUser?.role === 'employee';
  const isAdminOrHR = currentUser && ['manager', 'admin', 'hr'].includes(currentUser.role);

  const myAgreements = useMemo(() => {
    if (!currentUser) return [];
    return agreements.filter(a => a.employeeName === currentUser.name);
  }, [agreements, currentUser]);

  // ── Employee view ────────────────────────────────────────────────────────────
  if (isEmployee) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <style>{`@media print { body > * { display: none !important; } #fee-agreement-print { display: block !important; position: fixed; top: 0; left: 0; width: 100%; } }`}</style>

        {signingAgreement && (
          <SigningModal
            agreement={signingAgreement}
            onSign={(sig) => handleSign(signingAgreement.id, sig)}
            onClose={() => setSigningAgreement(null)}
          />
        )}

        {signSuccess && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-green-700">
            <CheckCircle size={20} />
            <div>
              <p className="font-semibold">簽署成功！</p>
              <p className="text-sm">您的手寫簽名已完成電子歸檔。</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText size={22} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">費用訓練同意書</h1>
            <p className="text-sm text-gray-500">查看並簽署您的訓練費用同意書</p>
          </div>
        </div>

        {myAgreements.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium">目前沒有待簽署的同意書</p>
            <p className="text-sm mt-1">當人資發送同意書給您後，將在此顯示</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myAgreements.map(agreement => (
              <div key={agreement.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">{agreement.courseName}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">NT$ {fmt(agreement.totalFee)} · {agreement.sentAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(agreement.status)}
                    <button
                      onClick={() => setViewingAgreement(viewingAgreement?.id === agreement.id ? null : agreement)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                    >
                      {viewingAgreement?.id === agreement.id ? '收起' : '查看'}
                    </button>
                    {agreement.status === 'pending_sign' && (
                      <button
                        onClick={() => setSigningAgreement(agreement)}
                        className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium"
                      >
                        <PenLine size={13} />電子簽署
                      </button>
                    )}
                  </div>
                </div>
                {viewingAgreement?.id === agreement.id && (
                  <DocumentPreview
                    form={agreement as unknown as FeeForm}
                    totalFee={agreement.totalFee}
                    afterYrs={agreement.afterServiceYrs}
                    afterMons={agreement.afterServiceMons}
                    signedInfo={agreement.status === 'signed' ? {
                      signatureImage: agreement.signatureImage,
                      idNumber: agreement.idNumber,
                      address: agreement.address,
                      phone: agreement.phone,
                      signedAt: agreement.signedAt!,
                    } : undefined}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!isAdminOrHR) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">您沒有權限查看此頁面</p>
      </div>
    );
  }

  // ── Admin / manager / HR view ─────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <style>{`@media print { body > * { display: none !important; } #fee-agreement-print { display: block !important; position: fixed; top: 0; left: 0; width: 100%; } }`}</style>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <FileText size={22} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">費用訓練同意書</h1>
          <p className="text-sm text-gray-500">課程訓練費用同意書 CFCMHR37 · 依教育訓練管理辦法</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── Form ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-3">填寫資料</h2>

          {/* Employee basic info */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">員工基本資訊</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">員工姓名 *</label>
                <input type="text" value={form.employeeName} onChange={e => set('employeeName', e.target.value)} placeholder="請輸入姓名" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">工號</label>
                <input type="text" value={form.employeeId} onChange={e => set('employeeId', e.target.value)} placeholder="E001" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">到職日</label>
                <input type="date" value={form.joinDate} onChange={e => set('joinDate', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">部門</label>
                <select value={form.department} onChange={e => set('department', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">請選擇部門</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">職稱</label>
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="工程師" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">職等</label>
                <input type="text" value={form.grade} onChange={e => set('grade', e.target.value)} placeholder="3" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">年資（年）</label>
                <input type="text" value={form.serviceYears} onChange={e => set('serviceYears', e.target.value)} placeholder="3" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Course info */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">課程資訊</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">課程名稱 *</label>
                <input type="text" value={form.courseName} onChange={e => set('courseName', e.target.value)} placeholder="請輸入課程名稱" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3">
                {(['外部訓練', '內部訓練'] as const).map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="trainingType" value={type} checked={form.trainingType === type} onChange={() => set('trainingType', type)} className="accent-blue-600" />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
              {form.trainingType === '外部訓練' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">訓練機構</label>
                  <input type="text" value={form.institution} onChange={e => set('institution', e.target.value)} placeholder="訓練機構名稱" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">開始日期</label>
                  <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">結束日期</label>
                  <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">課程地點</label>
                <input type="text" value={form.location} onChange={e => set('location', e.target.value)} placeholder="台北市・線上・公司內部" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Fees */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">費用明細</p>
            <div className="space-y-3">
              {[
                { key: 'courseFee' as const, label: '課程費用' },
                { key: 'certFee' as const, label: '認證費用' },
                { key: 'travelFee' as const, label: '差旅費用' },
                { key: 'otherFee' as const, label: '其他費用' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 w-24 shrink-0">{label}</label>
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-sm text-gray-500">NT$</span>
                    <input type="number" min={0} value={form[key] === 0 ? '' : form[key]} onChange={e => setNum(key, e.target.value)} placeholder="0" className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 bg-blue-50 rounded-lg px-4 py-3">
                <span className="text-sm font-semibold text-blue-800 w-24 shrink-0">合計費用</span>
                <span className="text-lg font-bold text-blue-700">NT$ {fmt(totalFee)}</span>
              </div>
            </div>
          </div>

          {/* Service years */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">服務年限設定</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-xs text-amber-700">
              <strong>建議新增年限：</strong>{autoAdded.label}（依費用自動計算）
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">參加本訓前受規範年限（年）</label>
                <input type="number" min={0} value={form.beforeServiceYrs} onChange={e => setNum('beforeServiceYrs', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">個月</label>
                <input type="number" min={0} max={11} value={form.beforeServiceMons} onChange={e => setNum('beforeServiceMons', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">本次增加年限（年）</label>
                <input type="number" min={0} value={form.addedServiceYrs} onChange={e => setNum('addedServiceYrs', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">個月</label>
                <input type="number" min={0} max={11} value={form.addedServiceMons} onChange={e => setNum('addedServiceMons', e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 mt-3 text-sm">
              <span className="text-gray-600">參加本訓後受規範年限：</span>
              <span className="font-bold text-green-700 ml-1">{afterService.yrs} 年 {afterService.mons} 個月</span>
            </div>
          </div>
        </div>

        {/* ── Preview panel ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-base">同意書預覽（CFCMHR37）</h2>
            <button onClick={() => setShowPreview(v => !v)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? '隱藏' : '顯示'}
            </button>
          </div>

          {showPreview ? (
            <DocumentPreview form={form} totalFee={totalFee} afterYrs={afterService.yrs} afterMons={afterService.mons} />
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl h-48 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <FileText size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">點擊「顯示」查看 CFCMHR37 格式同意書</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">操作</h3>
            {savedMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-700 text-sm text-center">{savedMessage}</div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowPreview(v => !v)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                <Eye size={16} />預覽同意書
              </button>
              <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                <Printer size={16} />列印同意書
              </button>
              <button onClick={() => window.print()} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                <Download size={16} />匯出 PDF
              </button>
              <button onClick={() => { setSavedMessage('記錄已儲存！'); setTimeout(() => setSavedMessage(''), 3000); }} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                <Save size={16} />儲存記錄
              </button>
            </div>
            <button onClick={handleSendToEmployee} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-semibold">
              <Send size={16} />發送給員工
            </button>
          </div>
        </div>
      </div>

      {/* Agreements list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">已發送同意書清單（{agreements.length} 筆）</h2>
        </div>
        {agreements.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Send size={32} className="mx-auto mb-3 opacity-30" />
            <p>尚未發送任何同意書</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left">
                    {['員工姓名', '部門', '課程名稱', '金額', '發送日期', '狀態', '操作'].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {agreements.map(agreement => (
                    <tr key={agreement.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{agreement.employeeName}</p>
                        <p className="text-xs text-gray-400">{agreement.employeeId}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{agreement.department}</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-800 max-w-[160px] truncate">{agreement.courseName}</p>
                        <p className="text-xs text-gray-400">{agreement.trainingType}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">NT$ {fmt(agreement.totalFee)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{agreement.sentAt}</td>
                      <td className="px-4 py-3">{statusBadge(agreement.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setViewingAgreement(viewingAgreement?.id === agreement.id ? null : agreement)} className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded-lg">查看</button>
                          {agreement.status !== 'archived' && (
                            <button onClick={() => handleArchive(agreement.id)} className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1 hover:bg-gray-100 rounded-lg flex items-center gap-1">
                              <Archive size={13} />歸檔
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {viewingAgreement && (
              <div className="border-t border-gray-100 p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">同意書詳情 — {viewingAgreement.employeeName} · {viewingAgreement.courseName}</h3>
                  <button onClick={() => setViewingAgreement(null)} className="text-xs text-gray-500 hover:text-gray-700 underline">關閉</button>
                </div>
                <DocumentPreview
                  form={viewingAgreement as unknown as FeeForm}
                  totalFee={viewingAgreement.totalFee}
                  afterYrs={viewingAgreement.afterServiceYrs}
                  afterMons={viewingAgreement.afterServiceMons}
                  signedInfo={viewingAgreement.status === 'signed' ? {
                    signatureImage: viewingAgreement.signatureImage,
                    idNumber: viewingAgreement.idNumber,
                    address: viewingAgreement.address,
                    phone: viewingAgreement.phone,
                    signedAt: viewingAgreement.signedAt!,
                  } : undefined}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
