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
    category: '營運部',
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
    ]
  },
  '文官中心': {
    category: '營運部',
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
