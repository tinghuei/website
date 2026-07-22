// 詳細職能框架資料 — 共 39 個職位、8 個部門
// 來源：DETAILED_COMPETENCY_FRAMEWORK.md（公司職能基準文件），原內嵌於 DetailedCompetencyAssessment.tsx，
// 抽取為共用資料檔，供 DetailedCompetencyAssessment.tsx、CompetencyAnalysis.tsx 等頁面共用。

export interface CompetencyItem {
  id: string;
  name: string;
  description: string;
}

export interface CompetencyCategory {
  id: string;
  category: string;
  items: CompetencyItem[];
}

export interface PositionData {
  category: string;
  level: string;
  requiredLevel: number;
  competencies: CompetencyCategory[];
}

export const DETAILED_COMPETENCY_FRAMEWORK: Record<string, PositionData> = {
  '廠務經理': {
    category: '廠務部',
    level: '部門主管',
    requiredLevel: 4,
    competencies: [
      {
        id: 'cm-1',
        category: '領導與管理能力',
        items: [
          { id: 'cm-1-1', name: '團隊建設與人員管理', description: '招聘、培訓、績效評估' },
          { id: 'cm-1-2', name: '目標設定與績效管理', description: '制定部門目標、監控進度' },
          { id: 'cm-1-3', name: '決策制定與問題解決', description: '分析複雜問題、制定解決方案' },
          { id: 'cm-1-4', name: '跨部門協調與溝通', description: '與其他部門協作、衝突解決' },
        ]
      },
      {
        id: 'cm-2',
        category: '安全管理',
        items: [
          { id: 'cm-2-1', name: '安全政策制定與執行', description: '制定安全規程、確保合規' },
          { id: 'cm-2-2', name: '安全風險評估', description: '識別危害、評估風險等級' },
          { id: 'cm-2-3', name: '事故調查與改善', description: '分析事故原因、制定預防措施' },
          { id: 'cm-2-4', name: '安全培訓與宣導', description: '組織安全培訓、提升員工意識' },
        ]
      },
      {
        id: 'cm-3',
        category: '成本控制與預算管理',
        items: [
          { id: 'cm-3-1', name: '預算編制與監控', description: '制定年度預算、控制支出' },
          { id: 'cm-3-2', name: '成本分析', description: '分析成本構成、識別降低機會' },
          { id: 'cm-3-3', name: '設備投資評估', description: '評估 ROI、制定採購計畫' },
          { id: 'cm-3-4', name: '能源管理', description: '監控能耗、優化使用效率' },
        ]
      },
      {
        id: 'cm-4',
        category: '設備與廠務管理',
        items: [
          { id: 'cm-4-1', name: '設備維護計畫', description: '制定保養計畫、監控執行' },
          { id: 'cm-4-2', name: '廠房管理', description: '環境衛生、安全設施維護' },
          { id: 'cm-4-3', name: '應急預案', description: '制定應急計畫、組織演練' },
          { id: 'cm-4-4', name: '技術更新與改善', description: '評估新技術、推動改善項目' },
        ]
      },
      {
        id: 'cm-5',
        category: '溝通與協調',
        items: [
          { id: 'cm-5-1', name: '向上匯報', description: '定期向上級報告、爭取資源支持' },
          { id: 'cm-5-2', name: '向下溝通', description: '傳達政策、激勵團隊' },
          { id: 'cm-5-3', name: '橫向協作', description: '與製造、品質等部門協調' },
          { id: 'cm-5-4', name: '外部溝通', description: '與供應商、客戶溝通' },
        ]
      },
    ]
  },
  '製造課長': {
    category: '製造部',
    level: '部門主管',
    requiredLevel: 4,
    competencies: [
      {
        id: 'mc-1',
        category: '領導與管理能力',
        items: [
          { id: 'mc-1-1', name: '團隊建設', description: '招聘、培訓、績效評估' },
          { id: 'mc-1-2', name: '生產計畫制定', description: '制定月度/周度生產計畫' },
          { id: 'mc-1-3', name: '目標管理', description: '設定生產目標、監控進度' },
          { id: 'mc-1-4', name: '人員激勵', description: '激勵團隊、提升士氣' },
        ]
      },
      {
        id: 'mc-2',
        category: '生產計畫與控制',
        items: [
          { id: 'mc-2-1', name: '生產需求分析', description: '分析訂單、評估產能' },
          { id: 'mc-2-2', name: '生產計畫制定', description: '制定詳細計畫、分配資源' },
          { id: 'mc-2-3', name: '進度監控', description: '監控生產進度、及時調整' },
          { id: 'mc-2-4', name: '產能優化', description: '提升產能、降低成本' },
        ]
      },
      {
        id: 'mc-3',
        category: '品質管理',
        items: [
          { id: 'mc-3-1', name: '品質標準制定', description: '制定品質標準、明確要求' },
          { id: 'mc-3-2', name: '品質檢查監督', description: '監督檢查工作、確保品質' },
          { id: 'mc-3-3', name: '不良品處理', description: '分析不良原因、制定改善' },
          { id: 'mc-3-4', name: '品質改善推進', description: '推進品質改善項目' },
        ]
      },
      {
        id: 'mc-4',
        category: '成本控制',
        items: [
          { id: 'mc-4-1', name: '成本分析', description: '分析生產成本、識別浪費' },
          { id: 'mc-4-2', name: '物料管理', description: '監控物料使用、減少浪費' },
          { id: 'mc-4-3', name: '效率改善', description: '提升作業效率、降低成本' },
          { id: 'mc-4-4', name: '預算管理', description: '控制部門預算' },
        ]
      },
    ]
  },
  '班長': {
    category: '製造部',
    level: '基層主管',
    requiredLevel: 3,
    competencies: [
      {
        id: 'bl-1',
        category: '領導與管理能力',
        items: [
          { id: 'bl-1-1', name: '班組日常管理', description: '工作分配、進度監控' },
          { id: 'bl-1-2', name: '員工指導', description: '指導員工操作、傳承技能' },
          { id: 'bl-1-3', name: '班前會組織', description: '組織班前會、傳達任務' },
          { id: 'bl-1-4', name: '績效監控', description: '監控班組績效' },
        ]
      },
      {
        id: 'bl-2',
        category: '生產管理',
        items: [
          { id: 'bl-2-1', name: '班組計畫理解', description: '理解日計畫' },
          { id: 'bl-2-2', name: '工作分配', description: '合理分配工作' },
          { id: 'bl-2-3', name: '進度監控', description: '監控班組進度' },
          { id: 'bl-2-4', name: '異常處理', description: '處理生產異常、報告' },
        ]
      },
      {
        id: 'bl-3',
        category: '品質管理',
        items: [
          { id: 'bl-3-1', name: '品質檢查監督', description: '監督檢查工作' },
          { id: 'bl-3-2', name: '不良品處理', description: '處理不良品' },
          { id: 'bl-3-3', name: '員工培訓', description: '培訓員工品質要求' },
          { id: 'bl-3-4', name: '改善建議', description: '提出改善建議' },
        ]
      },
      {
        id: 'bl-4',
        category: '安全管理',
        items: [
          { id: 'bl-4-1', name: '班前安全會', description: '組織班前安全會' },
          { id: 'bl-4-2', name: '安全檢查', description: '日常安全檢查' },
          { id: 'bl-4-3', name: '隱患排查', description: '排查安全隱患' },
          { id: 'bl-4-4', name: '事故報告', description: '及時報告事故' },
        ]
      },
    ]
  },
  '技術員': {
    category: '製造部',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'te-1',
        category: '機械設備操作',
        items: [
          { id: 'te-1-1', name: '設備操作規程掌握', description: '掌握設備操作方法' },
          { id: 'te-1-2', name: '正確操作執行', description: '按規程操作設備' },
          { id: 'te-1-3', name: '設備狀況監控', description: '監控設備運行狀況' },
          { id: 'te-1-4', name: '簡單故障排除', description: '排除簡單故障' },
        ]
      },
      {
        id: 'te-2',
        category: '品質管理',
        items: [
          { id: 'te-2-1', name: '品質標準理解', description: '理解品質要求' },
          { id: 'te-2-2', name: '自檢執行', description: '執行自檢' },
          { id: 'te-2-3', name: '不良品報告', description: '報告不良品' },
          { id: 'te-2-4', name: '改善建議', description: '提出改善建議' },
        ]
      },
      {
        id: 'te-3',
        category: '安全管理',
        items: [
          { id: 'te-3-1', name: '安全規程遵守', description: '遵守安全規程' },
          { id: 'te-3-2', name: '個人防護', description: '正確使用 PPE' },
          { id: 'te-3-3', name: '危害識別', description: '識別危害' },
          { id: 'te-3-4', name: '事故報告', description: '報告事故' },
        ]
      },
    ]
  },
  '品檢員': {
    category: '品質部',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'qi-1',
        category: '品質檢查執行',
        items: [
          { id: 'qi-1-1', name: '檢查標準理解', description: '理解檢查標準' },
          { id: 'qi-1-2', name: '檢查工作執行', description: '執行檢查工作' },
          { id: 'qi-1-3', name: '檢查數據記錄', description: '記錄檢查結果' },
          { id: 'qi-1-4', name: '不良品報告', description: '報告不良品' },
        ]
      },
      {
        id: 'qi-2',
        category: '技術文檔',
        items: [
          { id: 'qi-2-1', name: '檢查規程理解', description: '理解檢查規程' },
          { id: 'qi-2-2', name: '檢查工具使用', description: '正確使用檢查工具' },
          { id: 'qi-2-3', name: '數據記錄', description: '準確記錄數據' },
          { id: 'qi-2-4', name: '文件管理', description: '管理檢查文件' },
        ]
      },
    ]
  },
  '業務專員': {
    category: '業務部',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'bs-1',
        category: '客戶服務',
        items: [
          { id: 'bs-1-1', name: '客戶關係管理', description: '管理客戶關係' },
          { id: 'bs-1-2', name: '客戶需求理解', description: '理解客戶需求' },
          { id: 'bs-1-3', name: '銷售談判', description: '進行銷售談判' },
          { id: 'bs-1-4', name: '客戶滿意度提升', description: '提升客戶滿意度' },
        ]
      },
      {
        id: 'bs-2',
        category: '溝通與協調',
        items: [
          { id: 'bs-2-1', name: '向上報告', description: '報告銷售情況' },
          { id: 'bs-2-2', name: '部門間協調', description: '與製造、品質等部門協調' },
          { id: 'bs-2-3', name: '客戶溝通', description: '與客戶溝通' },
          { id: 'bs-2-4', name: '問題反饋', description: '反饋問題' },
        ]
      },
    ]
  },
  '廠務副理': {
    category: '廠務部',
    level: '部門主管',
    requiredLevel: 3,
    competencies: [
      {
        id: 'cm2-1',
        category: '領導與管理能力',
        items: [
          { id: 'cm2-1-1', name: '團隊建設與人員管理', description: '招聘、培訓、績效評估' },
          { id: 'cm2-1-2', name: '目標設定與績效管理', description: '制定部門目標、監控進度' },
          { id: 'cm2-1-3', name: '決策制定與問題解決', description: '分析複雜問題、制定解決方案' },
        ]
      },
      {
        id: 'cm2-2',
        category: '安全管理',
        items: [
          { id: 'cm2-2-1', name: '安全政策制定與執行', description: '制定安全規程、確保合規' },
          { id: 'cm2-2-2', name: '安全風險評估', description: '識別危害、評估風險等級' },
          { id: 'cm2-2-3', name: '事故調查與改善', description: '分析事故原因、制定預防措施' },
        ]
      },
    ]
  },
  '設備工程師': {
    category: '廠務部',
    level: '專業人員',
    requiredLevel: 3,
    competencies: [
      {
        id: 'ee-1',
        category: '設備管理與維護',
        items: [
          { id: 'ee-1-1', name: '設備維護計畫制定', description: '制定保養計畫、監控執行' },
          { id: 'ee-1-2', name: '故障診斷與排除', description: '診斷設備故障、排除問題' },
          { id: 'ee-1-3', name: '設備改造與升級', description: '評估改造需求、實施升級' },
          { id: 'ee-1-4', name: '技術文檔管理', description: '編寫維護文檔、管理技術資料' },
        ]
      },
      {
        id: 'ee-2',
        category: '技術知識',
        items: [
          { id: 'ee-2-1', name: '機械原理', description: '掌握機械設備原理' },
          { id: 'ee-2-2', name: '電氣知識', description: '理解電氣系統' },
          { id: 'ee-2-3', name: '液壓系統', description: '掌握液壓控制' },
          { id: 'ee-2-4', name: '自動化技術', description: '理解自動化系統' },
        ]
      },
    ]
  },
  '廠務助理': {
    category: '廠務部',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'ca-1',
        category: '廠房管理',
        items: [
          { id: 'ca-1-1', name: '環境衛生維護', description: '維護廠房衛生' },
          { id: 'ca-1-2', name: '設施維護', description: '維護廠房設施' },
          { id: 'ca-1-3', name: '安全檢查', description: '進行日常安全檢查' },
          { id: 'ca-1-4', name: '物資管理', description: '管理廠房物資' },
        ]
      },
      {
        id: 'ca-2',
        category: '協調與溝通',
        items: [
          { id: 'ca-2-1', name: '部門協調', description: '與各部門協調' },
          { id: 'ca-2-2', name: '工作報告', description: '報告工作進展' },
          { id: 'ca-2-3', name: '問題反饋', description: '反饋問題' },
        ]
      },
    ]
  },
  '製造副課長': {
    category: '製造部',
    level: '基層主管',
    requiredLevel: 3,
    competencies: [
      {
        id: 'mc2-1',
        category: '領導與管理能力',
        items: [
          { id: 'mc2-1-1', name: '班組管理', description: '管理班組日常工作' },
          { id: 'mc2-1-2', name: '生產計畫理解', description: '理解生產計畫' },
          { id: 'mc2-1-3', name: '進度監控', description: '監控生產進度' },
        ]
      },
      {
        id: 'mc2-2',
        category: '品質管理',
        items: [
          { id: 'mc2-2-1', name: '品質標準執行', description: '執行品質標準' },
          { id: 'mc2-2-2', name: '不良品處理', description: '處理不良品' },
          { id: 'mc2-2-3', name: '改善建議', description: '提出改善建議' },
        ]
      },
    ]
  },
  '資材課長': {
    category: '資材部',
    level: '部門主管',
    requiredLevel: 3,
    competencies: [
      {
        id: 'mc3-1',
        category: '物料管理',
        items: [
          { id: 'mc3-1-1', name: '物料需求規劃', description: '規劃物料需求' },
          { id: 'mc3-1-2', name: '庫存管理', description: '管理庫存水準' },
          { id: 'mc3-1-3', name: '物料成本控制', description: '控制物料成本' },
          { id: 'mc3-1-4', name: '供應商管理', description: '管理供應商關係' },
        ]
      },
      {
        id: 'mc3-2',
        category: '計畫與協調',
        items: [
          { id: 'mc3-2-1', name: '生產計畫協調', description: '與製造部協調計畫' },
          { id: 'mc3-2-2', name: '採購計畫制定', description: '制定採購計畫' },
          { id: 'mc3-2-3', name: '部門間協調', description: '協調各部門需求' },
        ]
      },
    ]
  },
  '資材副課長': {
    category: '資材部',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'mc4-1',
        category: '物料管理',
        items: [
          { id: 'mc4-1-1', name: '庫存管理', description: '管理庫存' },
          { id: 'mc4-1-2', name: '物料領用', description: '管理物料領用' },
          { id: 'mc4-1-3', name: '盤點工作', description: '執行庫存盤點' },
        ]
      },
      {
        id: 'mc4-2',
        category: '協調與溝通',
        items: [
          { id: 'mc4-2-1', name: '部門協調', description: '與各部門協調' },
          { id: 'mc4-2-2', name: '工作報告', description: '報告工作進展' },
        ]
      },
    ]
  },
  '採購助理': {
    category: '資材部',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'pa-1',
        category: '採購執行',
        items: [
          { id: 'pa-1-1', name: '採購單據處理', description: '處理採購單據' },
          { id: 'pa-1-2', name: '供應商聯繫', description: '聯繫供應商' },
          { id: 'pa-1-3', name: '收貨驗收', description: '驗收採購物料' },
          { id: 'pa-1-4', name: '文件管理', description: '管理採購文件' },
        ]
      },
      {
        id: 'pa-2',
        category: '溝通與協調',
        items: [
          { id: 'pa-2-1', name: '部門協調', description: '與各部門協調' },
          { id: 'pa-2-2', name: '問題反饋', description: '反饋採購問題' },
        ]
      },
    ]
  },
  '採購專員': {
    category: '資材部',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'pp-1',
        category: '採購管理',
        items: [
          { id: 'pp-1-1', name: '採購需求分析', description: '分析採購需求' },
          { id: 'pp-1-2', name: '供應商評估', description: '評估供應商' },
          { id: 'pp-1-3', name: '價格談判', description: '進行價格談判' },
          { id: 'pp-1-4', name: '採購合同管理', description: '管理採購合同' },
        ]
      },
      {
        id: 'pp-2',
        category: '溝通與協調',
        items: [
          { id: 'pp-2-1', name: '供應商溝通', description: '與供應商溝通' },
          { id: 'pp-2-2', name: '部門協調', description: '與各部門協調' },
        ]
      },
    ]
  },
  '生管': {
    category: '製造部',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'pm-1',
        category: '生產計畫',
        items: [
          { id: 'pm-1-1', name: '生產計畫理解', description: '理解生產計畫' },
          { id: 'pm-1-2', name: '進度追蹤', description: '追蹤生產進度' },
          { id: 'pm-1-3', name: '異常報告', description: '報告生產異常' },
          { id: 'pm-1-4', name: '數據記錄', description: '記錄生產數據' },
        ]
      },
      {
        id: 'pm-2',
        category: '協調與溝通',
        items: [
          { id: 'pm-2-1', name: '部門協調', description: '與各部門協調' },
          { id: 'pm-2-2', name: '工作報告', description: '報告工作進展' },
        ]
      },
    ]
  },
  '物管': {
    category: '資材部',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'im-1',
        category: '物流管理',
        items: [
          { id: 'im-1-1', name: '物料搬運', description: '執行物料搬運' },
          { id: 'im-1-2', name: '倉庫管理', description: '管理倉庫環境' },
          { id: 'im-1-3', name: '物料標識', description: '標識物料位置' },
          { id: 'im-1-4', name: '安全操作', description: '安全執行搬運' },
        ]
      },
      {
        id: 'im-2',
        category: '協調與溝通',
        items: [
          { id: 'im-2-1', name: '部門協調', description: '與各部門協調' },
          { id: 'im-2-2', name: '問題反饋', description: '反饋物流問題' },
        ]
      },
    ]
  },
  '成倉': {
    category: '資材部',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'sw-1',
        category: '倉庫管理',
        items: [
          { id: 'sw-1-1', name: '成品入庫', description: '管理成品入庫' },
          { id: 'sw-1-2', name: '庫存管理', description: '管理庫存' },
          { id: 'sw-1-3', name: '出庫管理', description: '管理成品出庫' },
          { id: 'sw-1-4', name: '盤點工作', description: '執行庫存盤點' },
        ]
      },
      {
        id: 'sw-2',
        category: '協調與溝通',
        items: [
          { id: 'sw-2-1', name: '部門協調', description: '與各部門協調' },
          { id: 'sw-2-2', name: '問題反饋', description: '反饋倉庫問題' },
        ]
      },
    ]
  },
  '副組長': {
    category: '製造部',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'sg-1',
        category: '領導與管理',
        items: [
          { id: 'sg-1-1', name: '班組日常管理', description: '管理班組日常工作' },
          { id: 'sg-1-2', name: '員工指導', description: '指導員工操作' },
          { id: 'sg-1-3', name: '進度監控', description: '監控班組進度' },
        ]
      },
      {
        id: 'sg-2',
        category: '品質與安全',
        items: [
          { id: 'sg-2-1', name: '品質檢查', description: '監督品質檢查' },
          { id: 'sg-2-2', name: '安全檢查', description: '進行安全檢查' },
          { id: 'sg-2-3', name: '異常報告', description: '報告異常情況' },
        ]
      },
    ]
  },
  '組長': {
    category: '製造部',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'gl-1',
        category: '領導與管理',
        items: [
          { id: 'gl-1-1', name: '班組日常管理', description: '管理班組日常工作' },
          { id: 'gl-1-2', name: '員工指導', description: '指導員工操作' },
          { id: 'gl-1-3', name: '進度監控', description: '監控班組進度' },
          { id: 'gl-1-4', name: '績效評估', description: '評估班組績效' },
        ]
      },
      {
        id: 'gl-2',
        category: '品質與安全',
        items: [
          { id: 'gl-2-1', name: '品質檢查', description: '監督品質檢查' },
          { id: 'gl-2-2', name: '安全檢查', description: '進行安全檢查' },
          { id: 'gl-2-3', name: '異常報告', description: '報告異常情況' },
          { id: 'gl-2-4', name: '改善建議', description: '提出改善建議' },
        ]
      },
    ]
  },
  '加工組組長': {
    category: '製造部',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'mfg-mg-1',
        category: '領導與管理能力',
        items: [
          { id: 'mfg-mg-1-1', name: '班組日常管理', description: '管理加工組日常工作與人員調度' },
          { id: 'mfg-mg-1-2', name: '員工指導與技能傳承', description: '指導組員操作規範，傳承加工技術' },
          { id: 'mfg-mg-1-3', name: '班前會組織', description: '組織班前會，傳達生產目標與注意事項' },
          { id: 'mfg-mg-1-4', name: '績效監控與回饋', description: '監控組員工作績效並提供改善回饋' },
        ]
      },
      {
        id: 'mfg-mg-2',
        category: '生產管理',
        items: [
          { id: 'mfg-mg-2-1', name: '日計畫理解與執行', description: '理解並落實加工組日生產計畫' },
          { id: 'mfg-mg-2-2', name: '工作分配', description: '依人員能力合理分配加工工作' },
          { id: 'mfg-mg-2-3', name: '進度監控', description: '監控加工產出進度，掌握達成狀況' },
          { id: 'mfg-mg-2-4', name: '異常處理與回報', description: '及時處理設備或製程異常並向上回報' },
        ]
      },
      {
        id: 'mfg-mg-3',
        category: '品質管理',
        items: [
          { id: 'mfg-mg-3-1', name: '品質自主檢查督導', description: '督導組員執行加工件尺寸與外觀自主檢查' },
          { id: 'mfg-mg-3-2', name: '不良品處理', description: '識別、隔離不良品並分析原因' },
          { id: 'mfg-mg-3-3', name: '品質意識培訓', description: '培訓組員品質標準與自檢方法' },
          { id: 'mfg-mg-3-4', name: '改善建議提出', description: '識別品質問題根因並提出改善建議' },
        ]
      },
      {
        id: 'mfg-mg-4',
        category: '安全管理',
        items: [
          { id: 'mfg-mg-4-1', name: '班前安全確認', description: '執行班前安全確認，傳達安全注意事項' },
          { id: 'mfg-mg-4-2', name: '安全操作督導', description: '督導組員遵守機台操作安全規範與 PPE 使用' },
          { id: 'mfg-mg-4-3', name: '隱患排查', description: '定期排查加工區域安全隱患' },
          { id: 'mfg-mg-4-4', name: '事故報告', description: '及時報告事故並協助調查' },
        ]
      },
      {
        id: 'mfg-mg-5',
        category: '加工技術管理',
        items: [
          { id: 'mfg-mg-5-1', name: 'CNC 程式基礎判讀', description: '能判讀並確認 CNC 加工程式的基本參數' },
          { id: 'mfg-mg-5-2', name: '刀具與夾具管理', description: '管理刀具壽命更換與夾具校準作業' },
          { id: 'mfg-mg-5-3', name: '公差與尺寸管控', description: '掌握公差標準，確保加工尺寸合格' },
          { id: 'mfg-mg-5-4', name: '加工製程優化', description: '識別加工瓶頸並提出製程改善建議' },
        ]
      },
    ]
  },
  '沖床組組長': {
    category: '製造部',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'mfg-press-1',
        category: '領導與管理能力',
        items: [
          { id: 'mfg-press-1-1', name: '班組日常管理', description: '管理沖床組日常工作與人員調度' },
          { id: 'mfg-press-1-2', name: '員工指導與技能傳承', description: '指導組員沖壓操作規範，傳承沖壓技術' },
          { id: 'mfg-press-1-3', name: '班前會組織', description: '組織班前會，傳達生產目標與安全要求' },
          { id: 'mfg-press-1-4', name: '績效監控與回饋', description: '監控組員工作績效並提供改善回饋' },
        ]
      },
      {
        id: 'mfg-press-2',
        category: '生產管理',
        items: [
          { id: 'mfg-press-2-1', name: '日計畫理解與執行', description: '理解並落實沖床組日生產計畫' },
          { id: 'mfg-press-2-2', name: '工作分配', description: '依人員能力合理分配沖壓工作' },
          { id: 'mfg-press-2-3', name: '進度監控', description: '監控沖壓產出進度，掌握達成狀況' },
          { id: 'mfg-press-2-4', name: '異常處理與回報', description: '及時處理模具或製程異常並向上回報' },
        ]
      },
      {
        id: 'mfg-press-3',
        category: '品質管理',
        items: [
          { id: 'mfg-press-3-1', name: '沖壓件品質自主檢查督導', description: '督導組員執行外觀、尺寸與毛邊自主檢查' },
          { id: 'mfg-press-3-2', name: '不良品處理', description: '識別、隔離不良品並分析沖壓原因' },
          { id: 'mfg-press-3-3', name: '品質意識培訓', description: '培訓組員沖壓品質標準與自檢方法' },
          { id: 'mfg-press-3-4', name: '改善建議提出', description: '識別沖壓品質問題根因並提出改善建議' },
        ]
      },
      {
        id: 'mfg-press-4',
        category: '安全管理',
        items: [
          { id: 'mfg-press-4-1', name: '班前安全確認', description: '執行班前安全確認，說明沖床操作風險' },
          { id: 'mfg-press-4-2', name: '安全操作督導', description: '督導組員落實沖床安全操作程序與 PPE 使用' },
          { id: 'mfg-press-4-3', name: '隱患排查', description: '定期排查沖床區域安全隱患' },
          { id: 'mfg-press-4-4', name: '事故報告', description: '及時報告事故並協助調查' },
        ]
      },
      {
        id: 'mfg-press-5',
        category: '沖壓技術管理',
        items: [
          { id: 'mfg-press-5-1', name: '模具安裝與調整', description: '掌握模具安裝、調模與保養作業程序' },
          { id: 'mfg-press-5-2', name: '送料與材料管理', description: '管理料帶送料精度與原材料用量' },
          { id: 'mfg-press-5-3', name: '沖壓缺陷預防', description: '識別並預防毛邊、裂紋、變形等沖壓缺陷' },
          { id: 'mfg-press-5-4', name: '機台參數調整', description: '依產品規格調整沖壓速度與壓力參數' },
        ]
      },
    ]
  },
  '塗裝組組長': {
    category: '製造部',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'mfg-paint-1',
        category: '領導與管理能力',
        items: [
          { id: 'mfg-paint-1-1', name: '班組日常管理', description: '管理塗裝組日常工作與人員調度' },
          { id: 'mfg-paint-1-2', name: '員工指導與技能傳承', description: '指導組員塗裝操作規範，傳承塗裝技術' },
          { id: 'mfg-paint-1-3', name: '班前會組織', description: '組織班前會，傳達生產目標與安全要求' },
          { id: 'mfg-paint-1-4', name: '績效監控與回饋', description: '監控組員工作績效並提供改善回饋' },
        ]
      },
      {
        id: 'mfg-paint-2',
        category: '生產管理',
        items: [
          { id: 'mfg-paint-2-1', name: '日計畫理解與執行', description: '理解並落實塗裝組日生產計畫' },
          { id: 'mfg-paint-2-2', name: '工作分配', description: '依人員能力合理分配塗裝工作' },
          { id: 'mfg-paint-2-3', name: '進度監控', description: '監控塗裝產出進度，掌握達成狀況' },
          { id: 'mfg-paint-2-4', name: '異常處理與回報', description: '及時處理設備或製程異常並向上回報' },
        ]
      },
      {
        id: 'mfg-paint-3',
        category: '品質管理',
        items: [
          { id: 'mfg-paint-3-1', name: '塗裝品質自主檢查督導', description: '督導組員執行漆膜厚度、色澤與附著力自主檢查' },
          { id: 'mfg-paint-3-2', name: '不良品處理', description: '識別並處理塗裝缺陷件，分析不良原因' },
          { id: 'mfg-paint-3-3', name: '品質意識培訓', description: '培訓組員塗裝品質標準與外觀判定方法' },
          { id: 'mfg-paint-3-4', name: '改善建議提出', description: '識別塗裝品質問題根因並提出改善建議' },
        ]
      },
      {
        id: 'mfg-paint-4',
        category: '安全管理',
        items: [
          { id: 'mfg-paint-4-1', name: '化學品安全管理', description: '確保塗料、溶劑等化學品安全存放與正確使用' },
          { id: 'mfg-paint-4-2', name: '安全操作督導', description: '督導組員落實防護面罩、防毒口罩等 PPE 使用' },
          { id: 'mfg-paint-4-3', name: '環保法規遵循', description: '督導廢氣、廢液排放符合環保規範' },
          { id: 'mfg-paint-4-4', name: '事故報告', description: '及時報告化學品暴露或火災事故並協助調查' },
        ]
      },
      {
        id: 'mfg-paint-5',
        category: '塗裝技術管理',
        items: [
          { id: 'mfg-paint-5-1', name: '前處理作業管理', description: '管理去油、磷化等前處理作業品質' },
          { id: 'mfg-paint-5-2', name: '噴塗參數控制', description: '調整噴槍壓力、黏度與膜厚等塗裝參數' },
          { id: 'mfg-paint-5-3', name: '塗料調配與管理', description: '依規格調配塗料配比並管理塗料庫存' },
          { id: 'mfg-paint-5-4', name: '塗裝缺陷分析與改善', description: '識別並處理流掛、針孔、縮孔等塗裝缺陷' },
        ]
      },
    ]
  },
  '組立組組長': {
    category: '製造部',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'mfg-asm-1',
        category: '領導與管理能力',
        items: [
          { id: 'mfg-asm-1-1', name: '班組日常管理', description: '管理組立組日常工作與人員調度' },
          { id: 'mfg-asm-1-2', name: '員工指導與技能傳承', description: '指導組員組立作業標準，傳承組立技術' },
          { id: 'mfg-asm-1-3', name: '班前會組織', description: '組織班前會，傳達組立目標與品質要求' },
          { id: 'mfg-asm-1-4', name: '績效監控與回饋', description: '監控組員工作績效並提供改善回饋' },
        ]
      },
      {
        id: 'mfg-asm-2',
        category: '生產管理',
        items: [
          { id: 'mfg-asm-2-1', name: '日計畫理解與執行', description: '理解並落實組立組日生產計畫' },
          { id: 'mfg-asm-2-2', name: '工作分配', description: '依人員能力合理分配組立工作' },
          { id: 'mfg-asm-2-3', name: '進度監控', description: '監控組立產出進度，掌握達成狀況' },
          { id: 'mfg-asm-2-4', name: '異常處理與回報', description: '及時處理組立異常與零件缺料問題並向上回報' },
        ]
      },
      {
        id: 'mfg-asm-3',
        category: '品質管理',
        items: [
          { id: 'mfg-asm-3-1', name: '組立品質自主檢查督導', description: '督導組員執行組立件功能、外觀與尺寸自主檢查' },
          { id: 'mfg-asm-3-2', name: '不良品處理', description: '識別、隔離不良品並分析組立原因' },
          { id: 'mfg-asm-3-3', name: '品質意識培訓', description: '培訓組員組立品質標準與判定方法' },
          { id: 'mfg-asm-3-4', name: '改善建議提出', description: '識別組立品質問題根因並提出改善建議' },
        ]
      },
      {
        id: 'mfg-asm-4',
        category: '安全管理',
        items: [
          { id: 'mfg-asm-4-1', name: '班前安全確認', description: '執行班前安全確認，說明工具使用風險' },
          { id: 'mfg-asm-4-2', name: '安全操作督導', description: '督導組員遵守工具操作安全規範與 PPE 使用' },
          { id: 'mfg-asm-4-3', name: '隱患排查', description: '定期排查組立區域安全隱患' },
          { id: 'mfg-asm-4-4', name: '事故報告', description: '及時報告事故並協助調查' },
        ]
      },
      {
        id: 'mfg-asm-5',
        category: '組立技術管理',
        items: [
          { id: 'mfg-asm-5-1', name: '作業標準書判讀', description: '能正確判讀並執行組立 SOP 與 BOM 表' },
          { id: 'mfg-asm-5-2', name: '鎖固力矩管控', description: '確保螺絲鎖固扭力符合規格要求' },
          { id: 'mfg-asm-5-3', name: '零件備料與拉動管理', description: '管理組立零件備料與生產線拉動節奏' },
          { id: 'mfg-asm-5-4', name: '成品功能測試', description: '執行組立後功能測試並判定合格與否' },
        ]
      },
    ]
  },
  '品保課課長': {
    category: '品質部',
    level: '部門主管',
    requiredLevel: 3,
    competencies: [
      {
        id: 'qm-1',
        category: '品質管理',
        items: [
          { id: 'qm-1-1', name: '品質政策制定', description: '制定品質政策' },
          { id: 'qm-1-2', name: '品質計畫制定', description: '制定品質計畫' },
          { id: 'qm-1-3', name: '品質檢查監督', description: '監督品質檢查' },
          { id: 'qm-1-4', name: '不良品處理', description: '處理不良品' },
        ]
      },
      {
        id: 'qm-2',
        category: '改善與創新',
        items: [
          { id: 'qm-2-1', name: '品質改善推進', description: '推進品質改善' },
          { id: 'qm-2-2', name: '問題分析', description: '分析品質問題' },
          { id: 'qm-2-3', name: '預防措施', description: '制定預防措施' },
        ]
      },
    ]
  },
  '品保課副課長': {
    category: '品質部',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'qm3-1',
        category: '品質管理',
        items: [
          { id: 'qm3-1-1', name: '品質檢查計畫', description: '制定檢查計畫' },
          { id: 'qm3-1-2', name: '檢查工作監督', description: '監督檢查工作' },
          { id: 'qm3-1-3', name: '數據分析', description: '分析品質數據' },
        ]
      },
      {
        id: 'qm3-2',
        category: '協調與溝通',
        items: [
          { id: 'qm3-2-1', name: '部門協調', description: '與各部門協調' },
          { id: 'qm3-2-2', name: '工作報告', description: '報告工作進展' },
        ]
      },
    ]
  },
  '總務課課長': {
    category: '總務部',
    level: '部門主管',
    requiredLevel: 3,
    competencies: [
      {
        id: 'ga-1',
        category: '行政管理',
        items: [
          { id: 'ga-1-1', name: '行政政策制定', description: '制定行政政策' },
          { id: 'ga-1-2', name: '文件管理', description: '管理公司文件' },
          { id: 'ga-1-3', name: '會議組織', description: '組織公司會議' },
          { id: 'ga-1-4', name: '部門協調', description: '協調各部門' },
        ]
      },
      {
        id: 'ga-2',
        category: '人力資源',
        items: [
          { id: 'ga-2-1', name: '員工管理', description: '管理員工事務' },
          { id: 'ga-2-2', name: '薪酬管理', description: '管理薪酬福利' },
          { id: 'ga-2-3', name: '勞動法規', description: '掌握勞動法規' },
        ]
      },
    ]
  },
  '總務課副課長': {
    category: '總務部',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'ga3-1',
        category: '行政管理',
        items: [
          { id: 'ga3-1-1', name: '文件管理', description: '管理文件' },
          { id: 'ga3-1-2', name: '會議協助', description: '協助組織會議' },
          { id: 'ga3-1-3', name: '部門協調', description: '協調部門事務' },
        ]
      },
      {
        id: 'ga3-2',
        category: '協調與溝通',
        items: [
          { id: 'ga3-2-1', name: '員工溝通', description: '與員工溝通' },
          { id: 'ga3-2-2', name: '工作報告', description: '報告工作進展' },
        ]
      },
    ]
  },
  '總務專員': {
    category: '總務部',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'gs-1',
        category: '行政執行',
        items: [
          { id: 'gs-1-1', name: '文件處理', description: '處理公司文件' },
          { id: 'gs-1-2', name: '會議協助', description: '協助組織會議' },
          { id: 'gs-1-3', name: '員工事務', description: '處理員工事務' },
          { id: 'gs-1-4', name: '檔案管理', description: '管理公司檔案' },
        ]
      },
      {
        id: 'gs-2',
        category: '協調與溝通',
        items: [
          { id: 'gs-2-1', name: '部門協調', description: '與各部門協調' },
          { id: 'gs-2-2', name: '問題反饋', description: '反饋工作問題' },
        ]
      },
    ]
  },
  '總務助理': {
    category: '總務部',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'ga-1',
        category: '行政協助',
        items: [
          { id: 'ga-1-1', name: '文件整理', description: '整理公司文件' },
          { id: 'ga-1-2', name: '會議協助', description: '協助組織會議' },
          { id: 'ga-1-3', name: '員工協助', description: '協助員工事務' },
        ]
      },
      {
        id: 'ga-2',
        category: '協調與溝通',
        items: [
          { id: 'ga-2-1', name: '部門協調', description: '與各部門協調' },
          { id: 'ga-2-2', name: '問題反饋', description: '反饋工作問題' },
        ]
      },
    ]
  },
  '人資助理': {
    category: '總務部',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'hr-1',
        category: '人力資源',
        items: [
          { id: 'hr-1-1', name: '招聘協助', description: '協助招聘工作' },
          { id: 'hr-1-2', name: '員工檔案管理', description: '管理員工檔案' },
          { id: 'hr-1-3', name: '薪酬協助', description: '協助薪酬管理' },
          { id: 'hr-1-4', name: '培訓協助', description: '協助培訓工作' },
        ]
      },
      {
        id: 'hr-2',
        category: '協調與溝通',
        items: [
          { id: 'hr-2-1', name: '員工溝通', description: '與員工溝通' },
          { id: 'hr-2-2', name: '部門協調', description: '與各部門協調' },
        ]
      },
    ]
  },
  '人資專員': {
    category: '總務部',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'hrp-1',
        category: '人力資源管理',
        items: [
          { id: 'hrp-1-1', name: '招聘管理', description: '管理招聘流程' },
          { id: 'hrp-1-2', name: '員工檔案', description: '管理員工檔案' },
          { id: 'hrp-1-3', name: '薪酬福利', description: '管理薪酬福利' },
          { id: 'hrp-1-4', name: '培訓規劃', description: '規劃培訓課程' },
        ]
      },
      {
        id: 'hrp-2',
        category: '協調與溝通',
        items: [
          { id: 'hrp-2-1', name: '員工溝通', description: '與員工溝通' },
          { id: 'hrp-2-2', name: '部門協調', description: '與各部門協調' },
        ]
      },
    ]
  },
  '庶務組長': {
    category: '總務部',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'cl-1',
        category: '庶務管理',
        items: [
          { id: 'cl-1-1', name: '庶務工作規劃', description: '規劃庶務工作' },
          { id: 'cl-1-2', name: '人員管理', description: '管理庶務人員' },
          { id: 'cl-1-3', name: '進度監控', description: '監控工作進度' },
        ]
      },
      {
        id: 'cl-2',
        category: '協調與溝通',
        items: [
          { id: 'cl-2-1', name: '部門協調', description: '與各部門協調' },
          { id: 'cl-2-2', name: '工作報告', description: '報告工作進展' },
        ]
      },
    ]
  },
  '庶務員': {
    category: '總務部',
    level: '基層執行',
    requiredLevel: 1,
    competencies: [
      {
        id: 'ce-1',
        category: '庶務執行',
        items: [
          { id: 'ce-1-1', name: '環境衛生', description: '維護環境衛生' },
          { id: 'ce-1-2', name: '物資管理', description: '管理庶務物資' },
          { id: 'ce-1-3', name: '設施維護', description: '維護辦公設施' },
          { id: 'ce-1-4', name: '安全檢查', description: '進行安全檢查' },
        ]
      },
      {
        id: 'ce-2',
        category: '協調與溝通',
        items: [
          { id: 'ce-2-1', name: '部門協調', description: '與各部門協調' },
          { id: 'ce-2-2', name: '問題反饋', description: '反饋工作問題' },
        ]
      },
    ]
  },
  '清潔員': {
    category: '總務部',
    level: '基層執行',
    requiredLevel: 1,
    competencies: [
      {
        id: 'cw-1',
        category: '清潔衛生',
        items: [
          { id: 'cw-1-1', name: '日常清潔', description: '執行日常清潔' },
          { id: 'cw-1-2', name: '衛生維護', description: '維護環境衛生' },
          { id: 'cw-1-3', name: '垃圾處理', description: '處理垃圾廢棄物' },
          { id: 'cw-1-4', name: '安全操作', description: '安全使用清潔工具' },
        ]
      },
      {
        id: 'cw-2',
        category: '協調與溝通',
        items: [
          { id: 'cw-2-1', name: '部門協調', description: '與各部門協調' },
          { id: 'cw-2-2', name: '問題反饋', description: '反饋工作問題' },
        ]
      },
    ]
  },
  '業務課組長': {
    category: '業務部',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'bl2-1',
        category: '領導與管理',
        items: [
          { id: 'bl2-1-1', name: '業務團隊管理', description: '管理業務團隊' },
          { id: 'bl2-1-2', name: '業務計畫制定', description: '制定業務計畫' },
          { id: 'bl2-1-3', name: '績效監控', description: '監控業務績效' },
        ]
      },
      {
        id: 'bl2-2',
        category: '客戶管理',
        items: [
          { id: 'bl2-2-1', name: '客戶關係管理', description: '管理客戶關係' },
          { id: 'bl2-2-2', name: '銷售支持', description: '支持業務銷售' },
          { id: 'bl2-2-3', name: '客戶滿意度', description: '提升客戶滿意度' },
        ]
      },
    ]
  },
  '業務助理': {
    category: '業務部',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'ba-1',
        category: '業務協助',
        items: [
          { id: 'ba-1-1', name: '訂單處理', description: '處理銷售訂單' },
          { id: 'ba-1-2', name: '客戶資料管理', description: '管理客戶資料' },
          { id: 'ba-1-3', name: '報價協助', description: '協助報價工作' },
          { id: 'ba-1-4', name: '文件管理', description: '管理業務文件' },
        ]
      },
      {
        id: 'ba-2',
        category: '協調與溝通',
        items: [
          { id: 'ba-2-1', name: '部門協調', description: '與各部門協調' },
          { id: 'ba-2-2', name: '客戶溝通', description: '與客戶溝通' },
        ]
      },
    ]
  },
  '研發課課長': {
    category: '研發部',
    level: '部門主管',
    requiredLevel: 3,
    competencies: [
      {
        id: 'rd-1',
        category: '研發管理',
        items: [
          { id: 'rd-1-1', name: '研發計畫制定', description: '制定研發計畫' },
          { id: 'rd-1-2', name: '技術方案評估', description: '評估技術方案' },
          { id: 'rd-1-3', name: '項目進度管理', description: '管理項目進度' },
          { id: 'rd-1-4', name: '技術文檔管理', description: '管理技術文檔' },
        ]
      },
      {
        id: 'rd-2',
        category: '技術創新',
        items: [
          { id: 'rd-2-1', name: '新產品開發', description: '開發新產品' },
          { id: 'rd-2-2', name: '技術改進', description: '改進現有技術' },
          { id: 'rd-2-3', name: '知識產權管理', description: '管理專利等知識產權' },
        ]
      },
    ]
  },
  '研發課副課長': {
    category: '研發部',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'rd3-1',
        category: '研發協助',
        items: [
          { id: 'rd3-1-1', name: '項目協助', description: '協助研發項目' },
          { id: 'rd3-1-2', name: '技術文檔', description: '編寫技術文檔' },
          { id: 'rd3-1-3', name: '進度追蹤', description: '追蹤項目進度' },
        ]
      },
      {
        id: 'rd3-2',
        category: '協調與溝通',
        items: [
          { id: 'rd3-2-1', name: '部門協調', description: '與各部門協調' },
          { id: 'rd3-2-2', name: '工作報告', description: '報告工作進展' },
        ]
      },
    ]
  },
  '研發工程師': {
    category: '研發部',
    level: '專業人員',
    requiredLevel: 3,
    competencies: [
      {
        id: 're-1',
        category: '技術知識',
        items: [
          { id: 're-1-1', name: '機械設計', description: '執行機械設計' },
          { id: 're-1-2', name: '電氣設計', description: '執行電氣設計' },
          { id: 're-1-3', name: '軟體開發', description: '開發控制軟體' },
          { id: 're-1-4', name: '試驗驗證', description: '進行試驗驗證' },
        ]
      },
      {
        id: 're-2',
        category: '協調與溝通',
        items: [
          { id: 're-2-1', name: '跨部門協調', description: '與製造等部門協調' },
          { id: 're-2-2', name: '文檔編寫', description: '編寫技術文檔' },
          { id: 're-2-3', name: '技術支持', description: '提供技術支持' },
        ]
      },
    ]
  },
  '營業部經理': {
    category: '營業部',
    level: '部門主管',
    requiredLevel: 4,
    competencies: [
      {
        id: 'sm-1',
        category: '銷售管理',
        items: [
          { id: 'sm-1-1', name: '銷售戰略制定', description: '制定銷售戰略' },
          { id: 'sm-1-2', name: '銷售目標管理', description: '管理銷售目標' },
          { id: 'sm-1-3', name: '銷售團隊管理', description: '管理銷售團隊' },
          { id: 'sm-1-4', name: '客戶開發', description: '開發新客戶' },
        ]
      },
      {
        id: 'sm-2',
        category: '市場管理',
        items: [
          { id: 'sm-2-1', name: '市場分析', description: '分析市場趨勢' },
          { id: 'sm-2-2', name: '競爭分析', description: '分析競爭對手' },
          { id: 'sm-2-3', name: '定價策略', description: '制定定價策略' },
        ]
      },
    ]
  },
  '總經理室秘書': {
    category: '總經理室',
    level: '專業人員',
    requiredLevel: 3,
    competencies: [
      {
        id: 'ceo-1',
        category: '行政協助',
        items: [
          { id: 'ceo-1-1', name: '行程管理', description: '管理總經理行程' },
          { id: 'ceo-1-2', name: '會議組織', description: '組織重要會議' },
          { id: 'ceo-1-3', name: '文件管理', description: '管理機密文件' },
          { id: 'ceo-1-4', name: '對外聯絡', description: '進行對外聯絡' },
        ]
      },
      {
        id: 'ceo-2',
        category: '溝通與協調',
        items: [
          { id: 'ceo-2-1', name: '部門協調', description: '協調各部門' },
          { id: 'ceo-2-2', name: '信息傳達', description: '傳達重要信息' },
          { id: 'ceo-2-3', name: '保密意識', description: '維護商業機密' },
        ]
      },
      {
        id: 'ceo-3',
        category: '專案與目標管理',
        items: [
          { id: 'ceo-3-1', name: '專案規劃與追蹤', description: '協助規劃專案進度並追蹤執行情形' },
          { id: 'ceo-3-2', name: '目標設定與績效管理', description: '協助設定部門目標並追蹤績效達成' },
          { id: 'ceo-3-3', name: '進度報告與檢討', description: '彙整專案進度，提供檢討與改善建議' },
        ]
      },
      {
        id: 'ceo-4',
        category: '數據分析與財務協助',
        items: [
          { id: 'ceo-4-1', name: '數據蒐集與整理', description: '蒐集並整理經營分析所需數據' },
          { id: 'ceo-4-2', name: '財務報表初步分析', description: '協助初步分析財務報表與成本數據' },
          { id: 'ceo-4-3', name: '預算執行追蹤', description: '追蹤各部門預算執行狀況' },
        ]
      },
      {
        id: 'ceo-5',
        category: '法令與合規知識',
        items: [
          { id: 'ceo-5-1', name: '公司法等相關法規認知', description: '了解公司法等相關法令規範' },
          { id: 'ceo-5-2', name: '合約文件審閱', description: '初步審閱合約文件，標示重點與風險' },
          { id: 'ceo-5-3', name: '法遵申報協助', description: '協助辦理法令遵循相關申報事項' },
        ]
      },
    ]
  },
  '總經理室副理': {
    category: '總經理室',
    level: '主管',
    requiredLevel: 4,
    competencies: [
      {
        id: 'ceo-dm-1',
        category: '策略規劃與執行',
        items: [
          { id: 'ceo-dm-1-1', name: '年度計畫制定', description: '協助制定部門年度目標與工作計畫' },
          { id: 'ceo-dm-1-2', name: '策略方案研擬', description: '研擬業務推動策略與改善方案' },
          { id: 'ceo-dm-1-3', name: '計畫執行督導', description: '督導各項計畫執行進度並適時調整' },
          { id: 'ceo-dm-1-4', name: '績效追蹤與回報', description: '追蹤關鍵績效指標，定期向高階主管回報' },
        ]
      },
      {
        id: 'ceo-dm-2',
        category: '跨部門協調管理',
        items: [
          { id: 'ceo-dm-2-1', name: '跨部門溝通協調', description: '協調各部門資源分配與業務合作' },
          { id: 'ceo-dm-2-2', name: '會議主持與決議追蹤', description: '主持跨部門會議並確保決議事項落實' },
          { id: 'ceo-dm-2-3', name: '衝突調解', description: '調解跨部門意見分歧，促進共識達成' },
        ]
      },
      {
        id: 'ceo-dm-3',
        category: '業務督導與人員管理',
        items: [
          { id: 'ceo-dm-3-1', name: '工作分配與指導', description: '合理分配部屬工作，提供業務指導' },
          { id: 'ceo-dm-3-2', name: '績效評核', description: '執行部屬績效評核，提供發展建議' },
          { id: 'ceo-dm-3-3', name: '人才培育', description: '規劃部屬培訓計畫，促進專業成長' },
        ]
      },
      {
        id: 'ceo-dm-4',
        category: '決策支援與資訊分析',
        items: [
          { id: 'ceo-dm-4-1', name: '經營數據分析', description: '分析經營數據，提供管理決策參考' },
          { id: 'ceo-dm-4-2', name: '問題診斷與解決', description: '診斷業務問題，研提可行的解決方案' },
          { id: 'ceo-dm-4-3', name: '風險評估', description: '評估業務推動的潛在風險並提出因應措施' },
          { id: 'ceo-dm-4-4', name: '報告撰寫與簡報', description: '撰寫高品質業務報告並向主管簡報' },
        ]
      },
      {
        id: 'ceo-dm-5',
        category: '對外關係與代表職能',
        items: [
          { id: 'ceo-dm-5-1', name: '外部接待與拜訪', description: '代表公司接待重要外賓或進行外部拜訪' },
          { id: 'ceo-dm-5-2', name: '合作關係維護', description: '維護與政府機關、合作夥伴等重要關係' },
          { id: 'ceo-dm-5-3', name: '公司形象維護', description: '於對外場合維護公司形象與信譽' },
        ]
      },
    ]
  },
  '文管中心': {
    category: '總經理室',
    level: '專業人員',
    requiredLevel: 2,
    competencies: [
      {
        id: 'ac-1',
        category: '文件管理',
        items: [
          { id: 'ac-1-1', name: '文件收發', description: '管理文件收發' },
          { id: 'ac-1-2', name: '檔案整理', description: '整理公司檔案' },
          { id: 'ac-1-3', name: '文件歸檔', description: '歸檔重要文件' },
          { id: 'ac-1-4', name: '檔案查詢', description: '提供檔案查詢' },
        ]
      },
      {
        id: 'ac-2',
        category: '協調與溝通',
        items: [
          { id: 'ac-2-1', name: '部門協調', description: '與各部門協調' },
          { id: 'ac-2-2', name: '信息傳遞', description: '傳遞文件信息' },
        ]
      },
    ]
  },
};
