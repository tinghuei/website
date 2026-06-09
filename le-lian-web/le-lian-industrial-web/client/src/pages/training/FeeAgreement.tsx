import { useState, useMemo } from 'react';
import { FileText, Printer, Download, Save, Eye, EyeOff, Send, Archive, CheckCircle } from 'lucide-react';
import { useTrainingAuth } from '../../context/TrainingAuthContext';

const DEPARTMENTS = [
  '總經理室', '品保課', '管理部', '總務課', '營業部', '業務課',
  '研發課', '廠務部', '廠務室', '製造課', '組一組', '組二組',
  '組三組', '沖床組', '塗裝組', '加工組', '財務部', '庶務組', '人資安全組',
];

interface FeeForm {
  employeeName: string;
  employeeId: string;
  department: string;
  title: string;
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
}

interface SentAgreement {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  title: string;
  courseName: string;
  trainingType: '外部訓練' | '內部訓練';
  institution: string;
  startDate: string;
  endDate: string;
  location: string;
  totalFee: number;
  servicePeriod: string;
  sentAt: string;
  sentBy: string;
  status: 'pending_sign' | 'signed' | 'archived';
  signedAt?: string;
  employeeSignature?: string;
}

const STORAGE_KEY = 'fee_agreements_v1';

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
  employeeName: '',
  employeeId: '',
  department: '',
  title: '',
  courseName: '',
  trainingType: '外部訓練',
  institution: '',
  startDate: '',
  endDate: '',
  location: '',
  courseFee: 0,
  certFee: 0,
  travelFee: 0,
  otherFee: 0,
};

function getServicePeriod(totalFee: number): string {
  if (totalFee < 3000) return '無服務年資限制';
  if (totalFee < 10000) return '訓練完畢後需服務至少 6 個月';
  if (totalFee < 20000) return '訓練完畢後需服務至少 1 年';
  if (totalFee < 40000) return '訓練完畢後需服務至少 2 年';
  return '訓練完畢後需服務年數由雙方專案訂定';
}

function fmt(n: number) {
  return n.toLocaleString('zh-TW');
}

interface DocumentPreviewProps {
  form: FeeForm;
  totalFee: number;
  servicePeriod: string;
  signedInfo?: { signature: string; signedAt: string };
}

function DocumentPreview({ form, totalFee, servicePeriod, signedInfo }: DocumentPreviewProps) {
  return (
    <div
      id="fee-agreement-print"
      className="bg-white border border-gray-300 rounded-lg p-8 font-serif text-sm leading-relaxed shadow-inner"
      style={{ fontFamily: '"Noto Serif TC", "Noto Serif CJK TC", serif' }}
    >
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">樂聯工業股份有限公司</h2>
        <h3 className="text-base font-semibold text-gray-700">員工課程訓練同意書（F-CM-10）</h3>
      </div>

      {/* Parties */}
      <div className="mb-5 space-y-1">
        <p>立同意書人：<strong>{form.employeeName || '________________'}</strong>（以下簡稱甲方）</p>
        <p>部門：<strong>{form.department || '________________'}</strong>　職稱：<strong>{form.title || '________________'}</strong>　員工編號：<strong>{form.employeeId || '________________'}</strong></p>
      </div>

      <p className="mb-5 text-gray-700">茲同意參加下列教育訓練課程，並遵守以下規定：</p>

      {/* Section 1 */}
      <div className="mb-5">
        <p className="font-bold text-gray-900 mb-2">一、訓練課程資訊</p>
        <div className="pl-4 space-y-1 text-gray-700">
          <p>　課程名稱：{form.courseName || '________________'}</p>
          <p>　訓練機構：{form.institution || (form.trainingType === '內部訓練' ? '樂聯工業股份有限公司（內部）' : '________________')}</p>
          <p>　訓練日期：{form.startDate || '________'} 至 {form.endDate || '________'}</p>
          <p>　訓練地點：{form.location || '________________'}</p>
          <p>　訓練類型：{form.trainingType}</p>
        </div>
      </div>

      {/* Section 2 */}
      <div className="mb-5">
        <p className="font-bold text-gray-900 mb-2">二、訓練費用</p>
        <div className="pl-4 space-y-1 text-gray-700">
          <p>　課程費用：NT$ {fmt(form.courseFee)}</p>
          <p>　認證費用：NT$ {fmt(form.certFee)}</p>
          <p>　差旅費用：NT$ {fmt(form.travelFee)}</p>
          <p>　其他費用：NT$ {fmt(form.otherFee)}</p>
          <p className="font-semibold text-gray-900 border-t border-gray-300 pt-1 mt-2">　合計費用：NT$ {fmt(totalFee)}</p>
        </div>
      </div>

      {/* Section 3 */}
      <div className="mb-5">
        <p className="font-bold text-gray-900 mb-2">三、服務年資規範</p>
        <div className="pl-4 text-gray-700 space-y-2">
          <p>　{servicePeriod}</p>
          <p className="text-sm">　若甲方於規範服務年資期間內離職，應依未完成服務年資比例返還公司所給付之訓練費用。</p>
        </div>
      </div>

      {/* Section 4 */}
      <div className="mb-8">
        <p className="font-bold text-gray-900 mb-2">四、甲方確認已詳閱本同意書並同意遵守上述規定。</p>
      </div>

      {/* Signatures */}
      <div className="border-t border-gray-300 pt-5 space-y-4">
        <div className="grid grid-cols-3 gap-6 text-sm text-gray-700">
          <div>
            <p className="mb-6">甲方簽名：</p>
            {signedInfo ? (
              <div>
                <p className="font-bold text-green-700 text-base">{signedInfo.signature}</p>
                <p className="mt-1 text-xs text-green-600">電子簽署於：{signedInfo.signedAt}</p>
              </div>
            ) : (
              <>
                <div className="border-b border-gray-500 w-40" />
                <p className="mt-1 text-xs text-gray-400">日期：___________</p>
              </>
            )}
          </div>
          <div>
            <p className="mb-6">主管簽名：</p>
            <div className="border-b border-gray-500 w-40" />
            <p className="mt-1 text-xs text-gray-400">日期：___________</p>
          </div>
          <div>
            <p className="mb-6">人資確認：</p>
            <div className="border-b border-gray-500 w-40" />
            <p className="mt-1 text-xs text-gray-400">日期：___________</p>
          </div>
        </div>
        <p className="text-xs text-center text-gray-400 pt-2">（本同意書一式兩份，公司及員工各執一份）</p>
      </div>
    </div>
  );
}

function statusBadge(status: SentAgreement['status']) {
  if (status === 'pending_sign') return <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700">待簽名</span>;
  if (status === 'signed') return <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700">已簽名</span>;
  return <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-500">已歸檔</span>;
}

export default function FeeAgreement() {
  const { currentUser } = useTrainingAuth();
  const [form, setForm] = useState<FeeForm>(INITIAL_FORM);
  const [showPreview, setShowPreview] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [agreements, setAgreements] = useState<SentAgreement[]>(() => loadAgreements());
  const [viewingAgreement, setViewingAgreement] = useState<SentAgreement | null>(null);
  const [signatureInput, setSignatureInput] = useState('');
  const [signSuccess, setSignSuccess] = useState(false);

  const totalFee = useMemo(
    () => form.courseFee + form.certFee + form.travelFee + form.otherFee,
    [form.courseFee, form.certFee, form.travelFee, form.otherFee]
  );

  const servicePeriod = useMemo(() => getServicePeriod(totalFee), [totalFee]);

  function set<K extends keyof FeeForm>(key: K, value: FeeForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setNum(key: keyof FeeForm, raw: string) {
    const n = parseInt(raw.replace(/[^\d]/g, ''), 10) || 0;
    setForm((prev) => ({ ...prev, [key]: n }));
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleSave = () => {
    setSavedMessage('記錄已儲存！');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleSendToEmployee = () => {
    if (!form.employeeName || !form.courseName) {
      setSavedMessage('請填寫員工姓名與課程名稱');
      setTimeout(() => setSavedMessage(''), 3000);
      return;
    }
    const newAgreement: SentAgreement = {
      id: `fa-${Date.now()}`,
      employeeName: form.employeeName,
      employeeId: form.employeeId,
      department: form.department,
      title: form.title,
      courseName: form.courseName,
      trainingType: form.trainingType,
      institution: form.institution,
      startDate: form.startDate,
      endDate: form.endDate,
      location: form.location,
      totalFee,
      servicePeriod,
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

  const handleSign = (agreementId: string) => {
    if (!signatureInput.trim()) return;
    const now = new Date().toLocaleString('zh-TW');
    const updated = agreements.map(a =>
      a.id === agreementId
        ? { ...a, status: 'signed' as const, signedAt: now, employeeSignature: signatureInput.trim() }
        : a
    );
    setAgreements(updated);
    saveAgreements(updated);
    const signed = updated.find(a => a.id === agreementId) || null;
    setViewingAgreement(signed);
    setSignSuccess(true);
    setSignatureInput('');
    setTimeout(() => setSignSuccess(false), 4000);
  };

  const isEmployee = currentUser?.role === 'employee';
  const isAdminOrHR = currentUser && ['manager', 'admin', 'hr'].includes(currentUser.role);

  // For employee: filter agreements sent to them
  const myAgreements = useMemo(() => {
    if (!currentUser) return [];
    return agreements.filter(
      a => a.employeeName === currentUser.name || a.employeeId === (currentUser as { employeeId?: string }).employeeId
    );
  }, [agreements, currentUser]);

  // Employee view
  if (isEmployee) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <style>{`
          @media print {
            body > * { display: none !important; }
            #fee-agreement-print { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
          }
        `}</style>

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
                    <p className="text-sm text-gray-500 mt-0.5">NT$ {fmt(agreement.totalFee)} · 發送日期：{agreement.sentAt}</p>
                    <p className="text-xs text-gray-400 mt-0.5">發送人：{agreement.sentBy}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(agreement.status)}
                    <button
                      onClick={() => { setViewingAgreement(agreement); setSignSuccess(false); setSignatureInput(''); }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                    >
                      查看
                    </button>
                  </div>
                </div>

                {viewingAgreement?.id === agreement.id && (
                  <div className="mt-4 space-y-4">
                    <DocumentPreview
                      form={{
                        employeeName: agreement.employeeName,
                        employeeId: agreement.employeeId,
                        department: agreement.department,
                        title: agreement.title,
                        courseName: agreement.courseName,
                        trainingType: agreement.trainingType,
                        institution: agreement.institution,
                        startDate: agreement.startDate,
                        endDate: agreement.endDate,
                        location: agreement.location,
                        courseFee: 0,
                        certFee: 0,
                        travelFee: 0,
                        otherFee: agreement.totalFee,
                      }}
                      totalFee={agreement.totalFee}
                      servicePeriod={agreement.servicePeriod}
                      signedInfo={agreement.status === 'signed' && agreement.employeeSignature ? { signature: agreement.employeeSignature, signedAt: agreement.signedAt! } : undefined}
                    />

                    {agreement.status === 'pending_sign' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
                        <h4 className="font-semibold text-blue-900">電子簽署</h4>
                        <div>
                          <label className="block text-sm font-medium text-blue-800 mb-1.5">
                            簽名（請輸入您的中文全名作為電子簽名）
                          </label>
                          <input
                            type="text"
                            value={signatureInput}
                            onChange={e => setSignatureInput(e.target.value)}
                            placeholder="請輸入您的中文全名"
                            className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </div>
                        {signSuccess && (
                          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-700 text-sm">
                            <CheckCircle size={16} />
                            簽署成功！已記錄您的電子簽名。
                          </div>
                        )}
                        <button
                          onClick={() => handleSign(agreement.id)}
                          disabled={!signatureInput.trim()}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                        >
                          <CheckCircle size={16} />
                          確認並電子簽署
                        </button>
                      </div>
                    )}

                    {agreement.status === 'signed' && (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-green-700">
                        <CheckCircle size={20} />
                        <div>
                          <p className="font-semibold">已完成電子簽署</p>
                          <p className="text-sm">簽署人：{agreement.employeeSignature} · 時間：{agreement.signedAt}</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setViewingAgreement(null)}
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      收起
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Admin / manager / hr view
  if (!isAdminOrHR) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-lg">您沒有權限查看此頁面</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #fee-agreement-print { display: block !important; position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <FileText size={22} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">費用訓練同意書</h1>
          <p className="text-sm text-gray-500">員工課程訓練同意書 F-CM-10・依教育訓練管理辦法</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-3">填寫資料</h2>

          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">員工姓名 *</label>
              <input
                type="text"
                value={form.employeeName}
                onChange={(e) => set('employeeName', e.target.value)}
                placeholder="請輸入姓名"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">員工編號 *</label>
              <input
                type="text"
                value={form.employeeId}
                onChange={(e) => set('employeeId', e.target.value)}
                placeholder="E001"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">部門 *</label>
              <select
                value={form.department}
                onChange={(e) => set('department', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">請選擇部門</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">職稱</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="工程師"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Course Info */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">課程資訊</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">課程名稱 *</label>
                <input
                  type="text"
                  value={form.courseName}
                  onChange={(e) => set('courseName', e.target.value)}
                  placeholder="請輸入課程名稱"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">訓練類型 *</label>
                <div className="flex gap-3">
                  {(['外部訓練', '內部訓練'] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="trainingType"
                        value={type}
                        checked={form.trainingType === type}
                        onChange={() => set('trainingType', type)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {form.trainingType === '外部訓練' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">訓練機構</label>
                  <input
                    type="text"
                    value={form.institution}
                    onChange={(e) => set('institution', e.target.value)}
                    placeholder="訓練機構名稱"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">開始日期</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => set('startDate', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">結束日期</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => set('endDate', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">課程地點</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="台北市・線上・公司內部"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                    <input
                      type="number"
                      min={0}
                      value={form[key] === 0 ? '' : form[key]}
                      onChange={(e) => setNum(key, e.target.value)}
                      placeholder="0"
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex items-center gap-3 bg-blue-50 rounded-lg px-4 py-3 mt-1">
                <span className="text-sm font-semibold text-blue-800 w-24 shrink-0">合計費用</span>
                <span className="text-lg font-bold text-blue-700">NT$ {fmt(totalFee)}</span>
              </div>
            </div>
          </div>

          {/* Service period info */}
          <div className={`rounded-lg p-4 border ${totalFee === 0 ? 'bg-gray-50 border-gray-200' : totalFee < 3000 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <p className="text-xs font-semibold text-gray-500 mb-1">服務年資規範（自動計算）</p>
            <p className={`text-sm font-medium ${totalFee === 0 ? 'text-gray-500' : totalFee < 3000 ? 'text-green-700' : 'text-amber-700'}`}>
              {totalFee === 0 ? '請輸入費用後自動計算' : servicePeriod}
            </p>
          </div>
        </div>

        {/* Preview panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-base">同意書預覽</h2>
            <button
              onClick={() => setShowPreview((v) => !v)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? '隱藏預覽' : '顯示預覽'}
            </button>
          </div>

          {showPreview && (
            <DocumentPreview form={form} totalFee={totalFee} servicePeriod={servicePeriod} />
          )}

          {!showPreview && (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl h-48 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <FileText size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">點擊「顯示預覽」查看同意書</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">操作</h3>

            {savedMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-700 text-sm text-center">
                {savedMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowPreview((v) => !v)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <Eye size={16} />
                預覽同意書
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Printer size={16} />
                列印同意書
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <Download size={16} />
                匯出 PDF
              </button>
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Save size={16} />
                儲存記錄
              </button>
            </div>

            {/* Send to employee button */}
            <button
              onClick={handleSendToEmployee}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-semibold"
            >
              <Send size={16} />
              發送給員工
            </button>

            <p className="text-xs text-gray-400 text-center">
              PDF 匯出使用系統列印功能以確保中文正確顯示
            </p>
          </div>

          {/* Regulation reference */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">費用規範對照表</h3>
            <div className="space-y-2 text-xs">
              {[
                { range: '< NT$3,000', period: '無服務年資限制', color: 'text-green-600' },
                { range: 'NT$3,000 ~ 9,999', period: '需服務至少 6 個月', color: 'text-yellow-600' },
                { range: 'NT$10,000 ~ 19,999', period: '需服務至少 1 年', color: 'text-orange-600' },
                { range: 'NT$20,000 ~ 39,999', period: '需服務至少 2 年', color: 'text-red-600' },
                { range: '≥ NT$40,000', period: '服務年數由雙方專案訂定', color: 'text-purple-600' },
              ].map(({ range, period, color }) => (
                <div key={range} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500 font-medium">{range}</span>
                  <span className={`font-medium ${color}`}>{period}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agreements list section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">已發送同意書清單（{agreements.length} 筆）</h2>
            <p className="text-xs text-gray-400 mt-0.5">追蹤所有已發送的訓練費用同意書狀態</p>
          </div>
        </div>

        {agreements.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Send size={32} className="mx-auto mb-3 opacity-30" />
            <p>尚未發送任何同意書</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">員工姓名</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">課程名稱</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">金額</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">發送日期</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">狀態</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agreements.map(agreement => (
                  <tr key={agreement.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{agreement.employeeName}</p>
                      <p className="text-xs text-gray-400">{agreement.department}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-800 max-w-[180px] truncate">{agreement.courseName}</p>
                      <p className="text-xs text-gray-400">{agreement.trainingType}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">NT$ {fmt(agreement.totalFee)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{agreement.sentAt}</td>
                    <td className="px-4 py-3">{statusBadge(agreement.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingAgreement(viewingAgreement?.id === agreement.id ? null : agreement)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          查看
                        </button>
                        {agreement.status !== 'archived' && (
                          <button
                            onClick={() => handleArchive(agreement.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Archive size={13} />
                            歸檔
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Inline document view */}
            {viewingAgreement && (
              <div className="border-t border-gray-100 p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">同意書詳情 — {viewingAgreement.employeeName} · {viewingAgreement.courseName}</h3>
                  <button onClick={() => setViewingAgreement(null)} className="text-xs text-gray-500 hover:text-gray-700 underline">關閉</button>
                </div>
                <DocumentPreview
                  form={{
                    employeeName: viewingAgreement.employeeName,
                    employeeId: viewingAgreement.employeeId,
                    department: viewingAgreement.department,
                    title: viewingAgreement.title,
                    courseName: viewingAgreement.courseName,
                    trainingType: viewingAgreement.trainingType,
                    institution: viewingAgreement.institution,
                    startDate: viewingAgreement.startDate,
                    endDate: viewingAgreement.endDate,
                    location: viewingAgreement.location,
                    courseFee: 0,
                    certFee: 0,
                    travelFee: 0,
                    otherFee: viewingAgreement.totalFee,
                  }}
                  totalFee={viewingAgreement.totalFee}
                  servicePeriod={viewingAgreement.servicePeriod}
                  signedInfo={viewingAgreement.status === 'signed' && viewingAgreement.employeeSignature ? { signature: viewingAgreement.employeeSignature, signedAt: viewingAgreement.signedAt! } : undefined}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
