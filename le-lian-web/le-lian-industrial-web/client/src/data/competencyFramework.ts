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
      {
        id: 'mc-5',
        category: '溝通與協調',
        items: [
          { id: 'mc-5-1', name: '向上匯報', description: '定期向高階主管報告生產狀況' },
          { id: 'mc-5-2', name: '跨部門協調', description: '與品保、資材、業務等部門協調' },
          { id: 'mc-5-3', name: '向下溝通', description: '傳達政策目標、激勵班組士氣' },
          { id: 'mc-5-4', name: '問題協調解決', description: '主持跨組問題協調會議' },
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
          { id: 'qi-1-1', name: '檢查標準理解', description: '理解並掌握各類產品的品質檢查標準' },
          { id: 'qi-1-2', name: '檢查工作執行', description: '依 SOP 執行外觀、尺寸及功能檢查' },
          { id: 'qi-1-3', name: '檢查數據記錄', description: '準確記錄檢查結果，維護品質憑證' },
          { id: 'qi-1-4', name: '不良品報告', description: '識別並標示不良品，及時通報相關人員' },
        ]
      },
      {
        id: 'qi-2',
        category: '量測技術應用',
        items: [
          { id: 'qi-2-1', name: '量測儀器操作', description: '正確使用游標卡尺、千分錶等量測工具' },
          { id: 'qi-2-2', name: '量測誤差認知', description: '了解量測誤差來源與校正方法' },
          { id: 'qi-2-3', name: '品質記錄文件管理', description: '建立並維護檢查紀錄與品質文件' },
          { id: 'qi-2-4', name: '規格圖面判讀', description: '能判讀產品工程圖及品質規格' },
        ]
      },
      {
        id: 'qi-3',
        category: '安全管理',
        items: [
          { id: 'qi-3-1', name: '安全規程遵守', description: '遵守品檢作業區域安全規程' },
          { id: 'qi-3-2', name: '個人防護裝備使用', description: '正確配戴 PPE，防止職業暴露風險' },
          { id: 'qi-3-3', name: '危害辨識', description: '識別品檢環境中的安全危害' },
          { id: 'qi-3-4', name: '事故報告', description: '及時報告工作環境中的事故與異常' },
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
          { id: 'bs-1-1', name: '客戶關係管理', description: '維護並拓展客戶關係' },
          { id: 'bs-1-2', name: '客戶需求理解', description: '準確理解並回應客戶需求' },
          { id: 'bs-1-3', name: '銷售談判', description: '進行報價與銷售條件談判' },
          { id: 'bs-1-4', name: '客戶滿意度提升', description: '追蹤交貨與售後，提升客戶滿意度' },
        ]
      },
      {
        id: 'bs-2',
        category: '溝通與協調',
        items: [
          { id: 'bs-2-1', name: '向上報告', description: '定期向主管報告業務進展與客戶狀況' },
          { id: 'bs-2-2', name: '部門間協調', description: '與製造、品質、資材等部門協調交期與品質' },
          { id: 'bs-2-3', name: '客戶溝通', description: '主動與客戶溝通，解決疑問與異常' },
          { id: 'bs-2-4', name: '問題反饋', description: '彙整客戶反饋，協助內部改善' },
        ]
      },
      {
        id: 'bs-3',
        category: '業務技術知識',
        items: [
          { id: 'bs-3-1', name: '產品知識', description: '熟悉公司產品規格、特性與應用場景' },
          { id: 'bs-3-2', name: '報價與合同管理', description: '能正確製作報價單並管理客戶合約' },
          { id: 'bs-3-3', name: '訂單作業流程', description: '熟悉訂單接收、確認、追蹤等作業流程' },
          { id: 'bs-3-4', name: '市場與競爭情報', description: '蒐集並分析市場動態與競爭對手資訊' },
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
          { id: 'cm2-1-4', name: '跨部門協調', description: '協調各部門廠務需求、資源分配' },
        ]
      },
      {
        id: 'cm2-2',
        category: '安全管理',
        items: [
          { id: 'cm2-2-1', name: '安全政策制定與執行', description: '制定安全規程、確保合規' },
          { id: 'cm2-2-2', name: '安全風險評估', description: '識別危害、評估風險等級' },
          { id: 'cm2-2-3', name: '事故調查與改善', description: '分析事故原因、制定預防措施' },
          { id: 'cm2-2-4', name: '安全培訓推動', description: '規劃與推動廠區安全訓練' },
        ]
      },
      {
        id: 'cm2-3',
        category: '成本控制與預算管理',
        items: [
          { id: 'cm2-3-1', name: '廠務費用預算編制', description: '制定廠務年度預算並追蹤執行' },
          { id: 'cm2-3-2', name: '成本分析', description: '分析廠務費用構成，識別降本機會' },
          { id: 'cm2-3-3', name: '能源管理', description: '監控水電能耗，推動節能措施' },
          { id: 'cm2-3-4', name: '外包商管理', description: '評估並管理廠務外包商績效與費用' },
        ]
      },
      {
        id: 'cm2-4',
        category: '設備與廠務管理',
        items: [
          { id: 'cm2-4-1', name: '設備保養計畫督導', description: '督導設備保養計畫執行，確保機台可用率' },
          { id: 'cm2-4-2', name: '廠房環境管理', description: '管理廠房整潔、溫濕度及 5S 推行' },
          { id: 'cm2-4-3', name: '應急預案制定', description: '制定廠務應急計畫並組織演練' },
          { id: 'cm2-4-4', name: '技術更新評估', description: '評估新設備或技術引進的效益與可行性' },
        ]
      },
      {
        id: 'cm2-5',
        category: '溝通與協調',
        items: [
          { id: 'cm2-5-1', name: '向上匯報', description: '定期向廠務經理或高階主管報告廠務狀況' },
          { id: 'cm2-5-2', name: '橫向協作', description: '與製造、品保等部門協調廠務支援需求' },
          { id: 'cm2-5-3', name: '對外溝通', description: '代表公司與政府機關、供應商溝通廠務事項' },
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
      {
        id: 'ee-3',
        category: '安全管理',
        items: [
          { id: 'ee-3-1', name: '設備安全操作規範', description: '制定並執行設備安全操作 SOP' },
          { id: 'ee-3-2', name: '危害識別與風險評估', description: '識別設備危害點，評估作業風險' },
          { id: 'ee-3-3', name: '緊急停機處理', description: '熟悉緊急停機程序，確保人員安全' },
          { id: 'ee-3-4', name: '安全培訓協助', description: '協助廠務安全教育訓練' },
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
          { id: 'ca-1-1', name: '環境衛生維護', description: '維護廠房衛生，執行 5S 作業' },
          { id: 'ca-1-2', name: '設施維護協助', description: '協助執行廠房設施日常保養' },
          { id: 'ca-1-3', name: '物資管理', description: '管理廠務消耗品與物資庫存' },
          { id: 'ca-1-4', name: '工單記錄', description: '記錄廠務維修工單與作業紀錄' },
        ]
      },
      {
        id: 'ca-2',
        category: '協調與溝通',
        items: [
          { id: 'ca-2-1', name: '部門協調', description: '與各部門協調廠務支援需求' },
          { id: 'ca-2-2', name: '工作報告', description: '定期向主管報告工作進展' },
          { id: 'ca-2-3', name: '問題反饋', description: '及時反饋廠務異常問題' },
        ]
      },
      {
        id: 'ca-3',
        category: '安全管理',
        items: [
          { id: 'ca-3-1', name: '安全規程遵守', description: '遵守廠區安全規程與操作規範' },
          { id: 'ca-3-2', name: '個人防護', description: '正確配戴 PPE，防範廠區安全風險' },
          { id: 'ca-3-3', name: '隱患回報', description: '識別廠房安全隱患並及時回報' },
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
          { id: 'mc2-1-1', name: '班組管理與人員指導', description: '協助課長管理班組，指導班長與組員' },
          { id: 'mc2-1-2', name: '目標傳達與績效追蹤', description: '傳達生產目標，追蹤組別績效' },
          { id: 'mc2-1-3', name: '員工培育', description: '規劃並執行班組技能培訓' },
          { id: 'mc2-1-4', name: '問題解決與決策', description: '處理班組日常問題，支援課長決策' },
        ]
      },
      {
        id: 'mc2-2',
        category: '生產管理',
        items: [
          { id: 'mc2-2-1', name: '日生產計畫執行督導', description: '督導班組落實日生產計畫' },
          { id: 'mc2-2-2', name: '進度監控與異常回報', description: '監控各班組進度，及時回報異常' },
          { id: 'mc2-2-3', name: '資源調配', description: '協助課長調配人員、設備與物料資源' },
          { id: 'mc2-2-4', name: '效率改善', description: '識別生產瓶頸，提出效率改善建議' },
        ]
      },
      {
        id: 'mc2-3',
        category: '品質管理',
        items: [
          { id: 'mc2-3-1', name: '品質標準督導執行', description: '確保各班組嚴格執行品質標準' },
          { id: 'mc2-3-2', name: '不良品分析', description: '分析不良品原因，協調改善措施' },
          { id: 'mc2-3-3', name: '品質改善推進', description: '推進班組品質改善活動' },
          { id: 'mc2-3-4', name: '客訴協助處理', description: '協助課長處理客戶品質投訴' },
        ]
      },
      {
        id: 'mc2-4',
        category: '安全管理',
        items: [
          { id: 'mc2-4-1', name: '安全政策執行', description: '督導各班組落實安全規程' },
          { id: 'mc2-4-2', name: '安全巡查', description: '定期巡查生產區域安全狀況' },
          { id: 'mc2-4-3', name: '隱患排查', description: '識別安全隱患並協調改善' },
          { id: 'mc2-4-4', name: '安全訓練協助', description: '協助辦理班組安全教育訓練' },
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
        category: '領導與管理能力',
        items: [
          { id: 'mc3-1-1', name: '團隊建設與人員管理', description: '招聘、培訓資材人員，執行績效評估' },
          { id: 'mc3-1-2', name: '目標設定與績效管理', description: '制定部門 KPI 並追蹤達成' },
          { id: 'mc3-1-3', name: '決策與問題解決', description: '分析供應鏈問題，制定因應對策' },
        ]
      },
      {
        id: 'mc3-2',
        category: '物料管理',
        items: [
          { id: 'mc3-2-1', name: '物料需求規劃（MRP）', description: '依生產計畫規劃物料需求，確保備料充足' },
          { id: 'mc3-2-2', name: '庫存水位管理', description: '設定安全庫存，控制呆廢料風險' },
          { id: 'mc3-2-3', name: '供應商管理', description: '評核供應商績效，推動交期與品質改善' },
          { id: 'mc3-2-4', name: '採購計畫制定', description: '依需求擬定採購計畫，控制交期風險' },
        ]
      },
      {
        id: 'mc3-3',
        category: '成本控制',
        items: [
          { id: 'mc3-3-1', name: '物料成本分析', description: '分析物料成本構成，推動降本措施' },
          { id: 'mc3-3-2', name: '採購成本談判', description: '主導重要物料的採購價格談判' },
          { id: 'mc3-3-3', name: '庫存週轉優化', description: '提升庫存週轉率，降低庫存持有成本' },
        ]
      },
      {
        id: 'mc3-4',
        category: '計畫與協調',
        items: [
          { id: 'mc3-4-1', name: '生產計畫協調', description: '與製造部協調物料供應與生產計畫' },
          { id: 'mc3-4-2', name: '跨部門協調', description: '協調業務、品保與製造等部門需求' },
          { id: 'mc3-4-3', name: '向上匯報', description: '定期向高階主管報告資材供應狀況' },
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
        category: '領導與管理能力',
        items: [
          { id: 'mc4-1-1', name: '人員指導與監督', description: '指導資材人員作業規範，督導工作執行' },
          { id: 'mc4-1-2', name: '工作分配', description: '依任務性質合理分配組員工作' },
          { id: 'mc4-1-3', name: '績效追蹤', description: '追蹤組員工作績效並給予回饋' },
        ]
      },
      {
        id: 'mc4-2',
        category: '物料管理',
        items: [
          { id: 'mc4-2-1', name: '庫存管理', description: '管理物料庫存水位，確保備料正確' },
          { id: 'mc4-2-2', name: '物料領用管控', description: '管理物料領用作業，確保帳物相符' },
          { id: 'mc4-2-3', name: '盤點執行', description: '執行定期庫存盤點並追蹤差異' },
          { id: 'mc4-2-4', name: '異常回報', description: '及時回報物料短缺或品質異常' },
        ]
      },
      {
        id: 'mc4-3',
        category: '採購與供應鏈知識',
        items: [
          { id: 'mc4-3-1', name: '採購流程執行', description: '熟悉採購申請、詢價、下單等作業流程' },
          { id: 'mc4-3-2', name: '供應商聯繫', description: '日常聯繫供應商，追蹤交期與品質' },
          { id: 'mc4-3-3', name: '收料驗收', description: '執行到料驗收並核對規格與數量' },
        ]
      },
      {
        id: 'mc4-4',
        category: '協調與溝通',
        items: [
          { id: 'mc4-4-1', name: '部門協調', description: '與製造、業務等部門協調物料供應需求' },
          { id: 'mc4-4-2', name: '向上匯報', description: '定期向資材課長報告庫存與採購狀況' },
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
          { id: 'pa-1-1', name: '採購單據處理', description: '依核准流程建立並追蹤採購訂單' },
          { id: 'pa-1-2', name: '供應商聯繫', description: '聯繫供應商確認交期與到貨狀況' },
          { id: 'pa-1-3', name: '收貨驗收', description: '執行到料點收，確認品項與數量' },
          { id: 'pa-1-4', name: '採購文件管理', description: '建立並維護採購相關文件與紀錄' },
        ]
      },
      {
        id: 'pa-2',
        category: '溝通與協調',
        items: [
          { id: 'pa-2-1', name: '部門需求確認', description: '確認各部門採購需求，釐清規格' },
          { id: 'pa-2-2', name: '問題反饋', description: '及時反饋採購異常，協調解決方案' },
        ]
      },
      {
        id: 'pa-3',
        category: '數據記錄與文件管理',
        items: [
          { id: 'pa-3-1', name: '採購資料建檔', description: '維護供應商資料及物料價格紀錄' },
          { id: 'pa-3-2', name: '請款對帳', description: '核對供應商發票，協助辦理請款作業' },
          { id: 'pa-3-3', name: 'ERP 系統操作', description: '熟悉並正確操作採購相關 ERP 功能' },
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
          { id: 'pp-1-1', name: '採購需求分析', description: '分析採購需求，確認規格與數量' },
          { id: 'pp-1-2', name: '供應商評估與開發', description: '評估現有供應商績效，開發備援供應商' },
          { id: 'pp-1-3', name: '價格談判', description: '執行採購談判，確保價格競爭力' },
          { id: 'pp-1-4', name: '採購合同管理', description: '擬定並管理採購合約條件' },
        ]
      },
      {
        id: 'pp-2',
        category: '溝通與協調',
        items: [
          { id: 'pp-2-1', name: '供應商溝通', description: '主動追蹤交期，解決供應商品質與交期問題' },
          { id: 'pp-2-2', name: '跨部門協調', description: '協調資材、製造、品保等部門的採購需求' },
        ]
      },
      {
        id: 'pp-3',
        category: '採購成本分析',
        items: [
          { id: 'pp-3-1', name: '詢比價作業', description: '執行詢比價，分析各供應商報價' },
          { id: 'pp-3-2', name: '成本拆解分析', description: '分析物料成本構成，識別降本機會' },
          { id: 'pp-3-3', name: '市場行情掌握', description: '掌握原物料市場行情，提供採購策略建議' },
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
          { id: 'pm-1-1', name: '生產計畫理解與執行', description: '理解並落實月/週/日生產計畫' },
          { id: 'pm-1-2', name: '進度追蹤與回報', description: '追蹤各工序生產進度，及時回報異常' },
          { id: 'pm-1-3', name: '產能負荷分析', description: '分析各製程產能負荷，協助排程調整' },
          { id: 'pm-1-4', name: '生產數據記錄', description: '正確記錄生產數量、效率與品質數據' },
        ]
      },
      {
        id: 'pm-2',
        category: '協調與溝通',
        items: [
          { id: 'pm-2-1', name: '跨部門協調', description: '協調製造、資材、業務的生產相關需求' },
          { id: 'pm-2-2', name: '工作報告', description: '定期向主管報告生產進度與異常' },
        ]
      },
      {
        id: 'pm-3',
        category: '資訊分析與數據管理',
        items: [
          { id: 'pm-3-1', name: 'ERP/生管系統操作', description: '熟悉生管相關 ERP 系統操作與維護' },
          { id: 'pm-3-2', name: '生產績效分析', description: '彙整生產績效報表（OEE、良率、交期達成率）' },
          { id: 'pm-3-3', name: '異常分析', description: '分析生產異常原因，提供改善依據' },
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
          { id: 'im-1-1', name: '物料搬運', description: '依規範執行物料搬運，確保物料完整' },
          { id: 'im-1-2', name: '倉庫環境管理', description: '維護倉庫整潔與物料定位管理' },
          { id: 'im-1-3', name: '物料標識管理', description: '正確標識物料位置與狀態' },
          { id: 'im-1-4', name: '進出料作業', description: '執行物料進出庫作業及帳物確認' },
        ]
      },
      {
        id: 'im-2',
        category: '協調與溝通',
        items: [
          { id: 'im-2-1', name: '部門協調', description: '協調製造與採購的物料調撥需求' },
          { id: 'im-2-2', name: '問題反饋', description: '反饋物流異常及倉儲問題' },
        ]
      },
      {
        id: 'im-3',
        category: '安全管理',
        items: [
          { id: 'im-3-1', name: '搬運安全操作', description: '遵守物料搬運安全規範，防止跌落與碰撞' },
          { id: 'im-3-2', name: '堆疊安全', description: '依規定高度與方式堆疊物料' },
          { id: 'im-3-3', name: 'PPE 配戴', description: '搬運作業中正確配戴安全帽、手套等 PPE' },
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
          { id: 'sw-1-1', name: '成品入庫作業', description: '執行成品點數、核對、入庫與標識' },
          { id: 'sw-1-2', name: '庫存管理', description: '維護帳物相符，掌握庫存狀況' },
          { id: 'sw-1-3', name: '出庫管理', description: '依出貨單執行成品揀貨與出庫作業' },
          { id: 'sw-1-4', name: '盤點工作', description: '執行定期盤點並追蹤差異' },
        ]
      },
      {
        id: 'sw-2',
        category: '協調與溝通',
        items: [
          { id: 'sw-2-1', name: '出貨協調', description: '與業務、物流確認出貨需求與時程' },
          { id: 'sw-2-2', name: '問題反饋', description: '及時反饋倉庫異常與庫存問題' },
        ]
      },
      {
        id: 'sw-3',
        category: '安全管理',
        items: [
          { id: 'sw-3-1', name: '倉庫安全操作', description: '遵守倉庫安全規範，防止職安事故' },
          { id: 'sw-3-2', name: '消防安全', description: '熟悉倉庫消防設備位置與使用方法' },
          { id: 'sw-3-3', name: 'PPE 配戴', description: '依作業需求正確配戴 PPE' },
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
        category: '領導與管理能力',
        items: [
          { id: 'sg-1-1', name: '班組日常管理', description: '協助組長管理班組日常工作' },
          { id: 'sg-1-2', name: '員工指導', description: '指導組員正確操作方法與作業規範' },
          { id: 'sg-1-3', name: '班前會協助', description: '協助主持班前會，傳達工作任務' },
        ]
      },
      {
        id: 'sg-2',
        category: '生產管理',
        items: [
          { id: 'sg-2-1', name: '日計畫理解', description: '理解班組日生產計畫並督促落實' },
          { id: 'sg-2-2', name: '進度監控', description: '監控班組生產進度' },
          { id: 'sg-2-3', name: '異常回報', description: '及時回報生產異常' },
        ]
      },
      {
        id: 'sg-3',
        category: '品質管理',
        items: [
          { id: 'sg-3-1', name: '品質自主檢查督導', description: '督導組員執行自主品質檢查' },
          { id: 'sg-3-2', name: '不良品處理', description: '識別並隔離不良品，回報原因' },
          { id: 'sg-3-3', name: '改善建議', description: '提出現場品質改善建議' },
        ]
      },
      {
        id: 'sg-4',
        category: '安全管理',
        items: [
          { id: 'sg-4-1', name: '安全操作督導', description: '督導組員遵守安全操作規範' },
          { id: 'sg-4-2', name: '安全檢查', description: '執行作業區域日常安全檢查' },
          { id: 'sg-4-3', name: '事故報告', description: '及時報告事故或安全隱患' },
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
        category: '領導與管理能力',
        items: [
          { id: 'gl-1-1', name: '班組日常管理', description: '管理班組日常工作與人員調度' },
          { id: 'gl-1-2', name: '員工指導', description: '指導組員操作技能與作業規範' },
          { id: 'gl-1-3', name: '班前會組織', description: '組織班前會，傳達任務與安全要求' },
          { id: 'gl-1-4', name: '績效評估', description: '評估組員工作績效並提供回饋' },
        ]
      },
      {
        id: 'gl-2',
        category: '生產管理',
        items: [
          { id: 'gl-2-1', name: '日計畫理解與執行', description: '理解並落實班組日生產計畫' },
          { id: 'gl-2-2', name: '工作分配', description: '依人員能力合理分配工作' },
          { id: 'gl-2-3', name: '進度監控', description: '監控班組生產進度' },
          { id: 'gl-2-4', name: '異常處理', description: '處理生產異常並及時回報' },
        ]
      },
      {
        id: 'gl-3',
        category: '品質管理',
        items: [
          { id: 'gl-3-1', name: '品質自主檢查督導', description: '督導組員執行自主品質檢查' },
          { id: 'gl-3-2', name: '不良品處理', description: '識別隔離不良品並分析原因' },
          { id: 'gl-3-3', name: '改善建議', description: '識別品質問題並提出改善建議' },
          { id: 'gl-3-4', name: '品質意識培訓', description: '培訓組員品質標準與自檢方法' },
        ]
      },
      {
        id: 'gl-4',
        category: '安全管理',
        items: [
          { id: 'gl-4-1', name: '班前安全確認', description: '執行班前安全確認，傳達安全注意事項' },
          { id: 'gl-4-2', name: '安全操作督導', description: '督導組員遵守安全操作規範' },
          { id: 'gl-4-3', name: '隱患排查', description: '定期排查作業區域安全隱患' },
          { id: 'gl-4-4', name: '事故報告', description: '及時報告事故並協助調查' },
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
        category: '領導與管理能力',
        items: [
          { id: 'qm-1-1', name: '團隊建設與人員管理', description: '招聘、培訓品保人員，執行績效評估' },
          { id: 'qm-1-2', name: '目標設定與績效管理', description: '制定部門品質目標，追蹤達成' },
          { id: 'qm-1-3', name: '決策制定', description: '分析品質問題，制定對策決策' },
        ]
      },
      {
        id: 'qm-2',
        category: '品質管理',
        items: [
          { id: 'qm-2-1', name: '品質政策制定', description: '制定並推行公司品質政策' },
          { id: 'qm-2-2', name: '品質計畫制定', description: '制定年度品質計畫與目標' },
          { id: 'qm-2-3', name: '品質檢查監督', description: '監督各製程品質檢查工作' },
          { id: 'qm-2-4', name: '不良品處置', description: '主導不良品處理決策與客訴回應' },
        ]
      },
      {
        id: 'qm-3',
        category: '改善與創新',
        items: [
          { id: 'qm-3-1', name: '品質改善推進', description: '推進 8D、QC Story 等品質改善活動' },
          { id: 'qm-3-2', name: '根因分析', description: '主導重大品質問題根因分析' },
          { id: 'qm-3-3', name: '預防措施制定', description: '制定並追蹤品質預防措施落實' },
          { id: 'qm-3-4', name: '品質系統維護', description: '維護 ISO/IATF 等品質管理系統' },
        ]
      },
      {
        id: 'qm-4',
        category: '溝通與協調',
        items: [
          { id: 'qm-4-1', name: '跨部門協調', description: '協調製造、研發等部門的品質問題解決' },
          { id: 'qm-4-2', name: '客戶品質溝通', description: '與客戶溝通品質問題，處理客訴' },
          { id: 'qm-4-3', name: '向上匯報', description: '定期向高階主管報告品質狀況' },
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
        category: '領導與管理能力',
        items: [
          { id: 'qm3-1-1', name: '人員指導與督導', description: '指導品檢人員作業，督導工作執行' },
          { id: 'qm3-1-2', name: '工作分配', description: '合理分配品保組員工作任務' },
          { id: 'qm3-1-3', name: '績效追蹤', description: '追蹤品保組員績效並給予回饋' },
        ]
      },
      {
        id: 'qm3-2',
        category: '品質管理',
        items: [
          { id: 'qm3-2-1', name: '品質檢查計畫執行', description: '制定並執行品質檢查計畫' },
          { id: 'qm3-2-2', name: '檢查工作監督', description: '監督品檢人員確實執行檢查作業' },
          { id: 'qm3-2-3', name: '品質數據分析', description: '分析品質數據，找出異常趨勢' },
          { id: 'qm3-2-4', name: '不良品處理', description: '處理不良品，協助分析原因' },
        ]
      },
      {
        id: 'qm3-3',
        category: '改善推進',
        items: [
          { id: 'qm3-3-1', name: '改善活動推進', description: '推進品質改善活動並追蹤效果' },
          { id: 'qm3-3-2', name: '預防措施追蹤', description: '追蹤品質預防措施的落實情形' },
          { id: 'qm3-3-3', name: '品質訓練推動', description: '推動組員品質意識與技能培訓' },
        ]
      },
      {
        id: 'qm3-4',
        category: '協調與溝通',
        items: [
          { id: 'qm3-4-1', name: '部門協調', description: '協調製造部門的品質問題處理' },
          { id: 'qm3-4-2', name: '工作報告', description: '定期向品保課長報告品質狀況' },
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
        id: 'gm-1',
        category: '領導與管理能力',
        items: [
          { id: 'gm-1-1', name: '團隊建設與人員管理', description: '招聘、培訓總務人員，執行績效評估' },
          { id: 'gm-1-2', name: '目標設定', description: '制定總務部年度目標與工作計畫' },
          { id: 'gm-1-3', name: '決策與問題解決', description: '分析行政問題，制定解決方案' },
        ]
      },
      {
        id: 'gm-2',
        category: '行政管理',
        items: [
          { id: 'gm-2-1', name: '行政政策制定', description: '制定公司行政管理規章與流程' },
          { id: 'gm-2-2', name: '文件與檔案管理', description: '建立文件控管制度，確保文件完整' },
          { id: 'gm-2-3', name: '會議組織與管理', description: '組織並主持公司重要會議' },
          { id: 'gm-2-4', name: '設施與資產管理', description: '管理公司辦公設施與固定資產' },
        ]
      },
      {
        id: 'gm-3',
        category: '人力資源',
        items: [
          { id: 'gm-3-1', name: '員工管理', description: '處理員工進用、離職及日常事務' },
          { id: 'gm-3-2', name: '薪酬福利管理', description: '管理薪酬計算與員工福利方案' },
          { id: 'gm-3-3', name: '勞動法規掌握', description: '熟悉勞基法等相關勞動法規並確保合規' },
          { id: 'gm-3-4', name: '訓練規劃', description: '規劃並推動公司教育訓練計畫' },
        ]
      },
      {
        id: 'gm-4',
        category: '溝通與協調',
        items: [
          { id: 'gm-4-1', name: '跨部門協調', description: '協調各部門行政支援需求' },
          { id: 'gm-4-2', name: '外部聯繫', description: '代表公司與政府機關、廠商溝通行政事項' },
          { id: 'gm-4-3', name: '向上匯報', description: '定期向高階主管報告總務工作狀況' },
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
        id: 'gam-1',
        category: '領導與管理能力',
        items: [
          { id: 'gam-1-1', name: '人員指導與督導', description: '指導總務人員作業，督導工作執行' },
          { id: 'gam-1-2', name: '工作分配', description: '合理分配組員日常工作任務' },
          { id: 'gam-1-3', name: '績效追蹤', description: '追蹤組員工作績效並給予回饋' },
        ]
      },
      {
        id: 'gam-2',
        category: '行政管理',
        items: [
          { id: 'gam-2-1', name: '文件管理執行', description: '執行文件收發、管控與歸檔' },
          { id: 'gam-2-2', name: '會議協助', description: '協助籌辦公司各類會議' },
          { id: 'gam-2-3', name: '行政事務執行', description: '執行採購請款、物資管理等行政作業' },
        ]
      },
      {
        id: 'gam-3',
        category: '員工關係',
        items: [
          { id: 'gam-3-1', name: '員工事務處理', description: '處理員工出缺勤、請假等日常事務' },
          { id: 'gam-3-2', name: '勞資關係溝通', description: '協助維護良好勞資關係' },
          { id: 'gam-3-3', name: '員工關懷', description: '執行員工關懷活動與福利措施' },
        ]
      },
      {
        id: 'gam-4',
        category: '協調與溝通',
        items: [
          { id: 'gam-4-1', name: '部門協調', description: '協調各部門行政服務需求' },
          { id: 'gam-4-2', name: '工作報告', description: '定期向總務課長報告工作進展' },
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
          { id: 'gs-1-1', name: '文件處理', description: '正確處理公司文件收發與歸檔' },
          { id: 'gs-1-2', name: '會議協助', description: '協助籌辦會議，整理會議記錄' },
          { id: 'gs-1-3', name: '員工事務處理', description: '處理員工出缺勤、福利等日常行政事務' },
          { id: 'gs-1-4', name: '採購請款作業', description: '執行辦公用品採購及廠商請款作業' },
        ]
      },
      {
        id: 'gs-2',
        category: '協調與溝通',
        items: [
          { id: 'gs-2-1', name: '部門協調', description: '協調各部門行政需求' },
          { id: 'gs-2-2', name: '問題反饋', description: '及時反饋行政工作問題' },
        ]
      },
      {
        id: 'gs-3',
        category: '法規遵循基礎',
        items: [
          { id: 'gs-3-1', name: '勞動法規基礎', description: '了解勞基法、職安法等基本法規' },
          { id: 'gs-3-2', name: '個資保護', description: '依個資法規範妥善處理員工個人資料' },
          { id: 'gs-3-3', name: '行政流程合規', description: '確保行政作業符合公司內規與法令要求' },
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
        id: 'gsa-1',
        category: '行政協助',
        items: [
          { id: 'gsa-1-1', name: '文件整理與歸檔', description: '整理、分類並歸檔公司文件' },
          { id: 'gsa-1-2', name: '會議協助', description: '協助準備會議資料與場地' },
          { id: 'gsa-1-3', name: '員工事務協助', description: '協助辦理員工進退離職等基礎事務' },
          { id: 'gsa-1-4', name: '辦公物資管理', description: '管理辦公室消耗品與物資請購' },
        ]
      },
      {
        id: 'gsa-2',
        category: '協調與溝通',
        items: [
          { id: 'gsa-2-1', name: '部門協調', description: '協助聯絡各部門行政需求' },
          { id: 'gsa-2-2', name: '問題反饋', description: '及時反饋工作問題' },
        ]
      },
      {
        id: 'gsa-3',
        category: '職場基本素養',
        items: [
          { id: 'gsa-3-1', name: '辦公室禮儀', description: '展現良好職場禮儀與服務態度' },
          { id: 'gsa-3-2', name: '資料保密意識', description: '妥善保管公司機密與員工個人資料' },
          { id: 'gsa-3-3', name: '時間管理', description: '有效安排工作優先順序，準時完成任務' },
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
          { id: 'hr-1-1', name: '招聘協助', description: '協助刊登職缺、安排面試及通知' },
          { id: 'hr-1-2', name: '員工檔案管理', description: '建立並維護員工人事檔案' },
          { id: 'hr-1-3', name: '薪酬作業協助', description: '協助薪資計算、加班費及請款作業' },
          { id: 'hr-1-4', name: '培訓行政協助', description: '協助安排課程、通知與訓練記錄' },
        ]
      },
      {
        id: 'hr-2',
        category: '協調與溝通',
        items: [
          { id: 'hr-2-1', name: '員工溝通', description: '協助回應員工人事相關諮詢' },
          { id: 'hr-2-2', name: '部門協調', description: '協調各部門人員異動需求' },
        ]
      },
      {
        id: 'hr-3',
        category: '勞動法規基礎',
        items: [
          { id: 'hr-3-1', name: '勞基法基本認知', description: '了解勞基法中工時、休假、薪資等基本規定' },
          { id: 'hr-3-2', name: '勞保健保作業', description: '熟悉勞保、健保加退保及申報作業' },
          { id: 'hr-3-3', name: '個資保護', description: '依個資法妥善處理員工個人資料' },
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
          { id: 'hrp-1-1', name: '招聘管理', description: '規劃並執行完整招募甄選流程' },
          { id: 'hrp-1-2', name: '員工關係管理', description: '處理員工申訴、勞資溝通等事務' },
          { id: 'hrp-1-3', name: '薪酬福利管理', description: '執行薪資計算、福利規劃與管理' },
          { id: 'hrp-1-4', name: '培訓規劃', description: '規劃年度培訓計畫並追蹤執行' },
        ]
      },
      {
        id: 'hrp-2',
        category: '協調與溝通',
        items: [
          { id: 'hrp-2-1', name: '員工溝通', description: '主動溝通並回應員工人事問題' },
          { id: 'hrp-2-2', name: '跨部門協調', description: '協調各部門人員需求與組織規劃' },
        ]
      },
      {
        id: 'hrp-3',
        category: '勞動法規與合規',
        items: [
          { id: 'hrp-3-1', name: '勞動法規掌握', description: '熟悉勞基法、職安法、性別平等法等相關法規' },
          { id: 'hrp-3-2', name: '法規申報作業', description: '執行勞保、健保、退休金等法定申報作業' },
          { id: 'hrp-3-3', name: '合規風險管控', description: '識別人資管理的法規風險並提出改善建議' },
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
        id: 'clm-1',
        category: '領導與管理能力',
        items: [
          { id: 'clm-1-1', name: '人員指導與督導', description: '指導庶務人員作業，督導工作執行' },
          { id: 'clm-1-2', name: '工作分配', description: '合理分配庶務員工作任務' },
          { id: 'clm-1-3', name: '績效追蹤', description: '追蹤組員工作品質並給予回饋' },
        ]
      },
      {
        id: 'clm-2',
        category: '庶務管理',
        items: [
          { id: 'clm-2-1', name: '庶務工作規劃', description: '規劃日常清潔、物資補充等庶務工作' },
          { id: 'clm-2-2', name: '物資管理', description: '管理庶務消耗品庫存與採購申請' },
          { id: 'clm-2-3', name: '進度監控', description: '監控庶務工作執行狀況與品質' },
        ]
      },
      {
        id: 'clm-3',
        category: '安全管理',
        items: [
          { id: 'clm-3-1', name: '安全規程督導', description: '督導組員遵守清潔作業安全規範' },
          { id: 'clm-3-2', name: '化學品安全管理', description: '確保清潔劑等化學品安全存放與使用' },
          { id: 'clm-3-3', name: '隱患回報', description: '識別並回報工作環境安全隱患' },
        ]
      },
      {
        id: 'clm-4',
        category: '協調與溝通',
        items: [
          { id: 'clm-4-1', name: '部門協調', description: '協調各部門庶務服務需求' },
          { id: 'clm-4-2', name: '工作報告', description: '定期向主管報告庶務工作進展' },
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
          { id: 'ce-1-1', name: '環境清潔維護', description: '執行辦公室與公共區域日常清潔' },
          { id: 'ce-1-2', name: '物資管理', description: '管理辦公消耗品補充與庶務物資' },
          { id: 'ce-1-3', name: '設施維護協助', description: '協助維護辦公設施，回報損壞狀況' },
          { id: 'ce-1-4', name: '支援服務', description: '提供各部門日常庶務支援' },
        ]
      },
      {
        id: 'ce-2',
        category: '協調與溝通',
        items: [
          { id: 'ce-2-1', name: '需求確認', description: '確認各部門庶務服務需求' },
          { id: 'ce-2-2', name: '問題反饋', description: '及時反饋工作異常問題' },
        ]
      },
      {
        id: 'ce-3',
        category: '環保與安全知識',
        items: [
          { id: 'ce-3-1', name: '清潔劑安全使用', description: '了解並遵守清潔化學品安全使用規範' },
          { id: 'ce-3-2', name: '廢棄物分類', description: '依環保規定正確分類處理廢棄物' },
          { id: 'ce-3-3', name: '安全工作習慣', description: '遵守庶務作業的安全防護規定' },
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
          { id: 'cw-1-1', name: '日常清潔作業', description: '依清潔 SOP 執行各區域日常清潔' },
          { id: 'cw-1-2', name: '環境衛生維護', description: '維護廁所、茶水間等公共區域衛生' },
          { id: 'cw-1-3', name: '廢棄物處理', description: '依規定分類並定時清運廢棄物' },
          { id: 'cw-1-4', name: '清潔品質自我檢查', description: '確認清潔作業品質符合標準' },
        ]
      },
      {
        id: 'cw-2',
        category: '協調與溝通',
        items: [
          { id: 'cw-2-1', name: '服務需求回應', description: '回應各部門臨時清潔需求' },
          { id: 'cw-2-2', name: '問題反饋', description: '及時反饋環境異常問題' },
        ]
      },
      {
        id: 'cw-3',
        category: '安全管理',
        items: [
          { id: 'cw-3-1', name: '清潔劑安全使用', description: '正確識別並安全使用各類清潔化學品' },
          { id: 'cw-3-2', name: 'PPE 配戴', description: '依作業需求配戴手套、口罩等防護裝備' },
          { id: 'cw-3-3', name: '危害辨識', description: '識別清潔作業中的滑倒、化學暴露等危害' },
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
        category: '領導與管理能力',
        items: [
          { id: 'bl2-1-1', name: '業務團隊指導', description: '指導業務組員銷售技巧與客戶服務方法' },
          { id: 'bl2-1-2', name: '工作分配', description: '合理分配組員客戶拜訪與業務任務' },
          { id: 'bl2-1-3', name: '績效監控與回饋', description: '追蹤組員業績達成並提供改善建議' },
        ]
      },
      {
        id: 'bl2-2',
        category: '業務規劃',
        items: [
          { id: 'bl2-2-1', name: '業務目標設定', description: '協助制定組別業務目標與行動計畫' },
          { id: 'bl2-2-2', name: '銷售進度追蹤', description: '追蹤訂單進度，確保業績目標達成' },
          { id: 'bl2-2-3', name: '市場資訊蒐集', description: '蒐集市場動態與競爭情報，提供策略參考' },
          { id: 'bl2-2-4', name: '業績報告', description: '定期彙整並向主管報告業績狀況' },
        ]
      },
      {
        id: 'bl2-3',
        category: '客戶管理',
        items: [
          { id: 'bl2-3-1', name: '重要客戶維護', description: '維護並深化重要客戶關係' },
          { id: 'bl2-3-2', name: '客戶問題協調解決', description: '協調跨部門解決客戶問題與抱怨' },
          { id: 'bl2-3-3', name: '客戶滿意度提升', description: '推動客戶滿意度調查並追蹤改善' },
        ]
      },
      {
        id: 'bl2-4',
        category: '溝通與客戶協調',
        items: [
          { id: 'bl2-4-1', name: '對客溝通', description: '代表公司與客戶溝通重要業務事項' },
          { id: 'bl2-4-2', name: '跨部門協調', description: '協調製造、品保、資材等部門支援業務需求' },
          { id: 'bl2-4-3', name: '向上匯報', description: '向主管彙報組別業務進展與市場動態' },
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
          { id: 'ba-1-1', name: '訂單接收與處理', description: '接收客戶訂單，確認規格、數量與交期' },
          { id: 'ba-1-2', name: '客戶資料管理', description: '建立並維護客戶基本資料與往來記錄' },
          { id: 'ba-1-3', name: '報價協助', description: '依業務指示準備報價資料' },
          { id: 'ba-1-4', name: '業務文件管理', description: '管理訂單、合約及出貨相關業務文件' },
        ]
      },
      {
        id: 'ba-2',
        category: '協調與溝通',
        items: [
          { id: 'ba-2-1', name: '內部協調', description: '協調製造、資材等部門確認交期與庫存' },
          { id: 'ba-2-2', name: '客戶聯繫', description: '協助業務與客戶溝通日常事務' },
        ]
      },
      {
        id: 'ba-3',
        category: '業務知識應用',
        items: [
          { id: 'ba-3-1', name: '產品基礎知識', description: '了解公司產品規格與特性' },
          { id: 'ba-3-2', name: '出貨作業知識', description: '了解出貨流程及物流相關作業' },
          { id: 'ba-3-3', name: '系統操作', description: '熟悉業務相關 ERP 或訂單管理系統操作' },
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
        category: '領導與管理能力',
        items: [
          { id: 'rd-1-1', name: '部門目標設定', description: '設定研發部門年度目標與工作計畫' },
          { id: 'rd-1-2', name: '人員培育與指導', description: '培育研發人才，提供技術指導與績效管理' },
          { id: 'rd-1-3', name: '資源調配', description: '合理分配研發資源與項目人力' },
        ]
      },
      {
        id: 'rd-2',
        category: '研發管理',
        items: [
          { id: 'rd-2-1', name: '研發計畫制定', description: '制定研發計畫與里程碑' },
          { id: 'rd-2-2', name: '技術方案評估', description: '評估技術可行性與方案選擇' },
          { id: 'rd-2-3', name: '項目進度管理', description: '追蹤項目進度，排除執行障礙' },
        ]
      },
      {
        id: 'rd-3',
        category: '技術創新',
        items: [
          { id: 'rd-3-1', name: '新產品開發', description: '主導新產品研發與設計' },
          { id: 'rd-3-2', name: '技術改進與優化', description: '推動現有技術改進與製程優化' },
          { id: 'rd-3-3', name: '知識產權管理', description: '管理專利申請與技術保護' },
        ]
      },
      {
        id: 'rd-4',
        category: '跨部門協調溝通',
        items: [
          { id: 'rd-4-1', name: '跨部門協調', description: '與製造、品保等部門協調，確保研發成果順利移轉' },
          { id: 'rd-4-2', name: '客戶技術溝通', description: '與客戶進行技術需求確認與溝通' },
          { id: 'rd-4-3', name: '成本意識', description: '在研發過程中考量成本效益，避免資源浪費' },
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
        category: '領導與管理能力',
        items: [
          { id: 'rd3-1-1', name: '工作分配與督導', description: '協助課長分配研發人員工作，督導執行進度' },
          { id: 'rd3-1-2', name: '成員技術指導', description: '指導研發成員解決技術問題' },
          { id: 'rd3-1-3', name: '進度追蹤與回報', description: '追蹤項目進度並定期向課長回報' },
        ]
      },
      {
        id: 'rd3-2',
        category: '研發技術管理',
        items: [
          { id: 'rd3-2-1', name: '技術文檔管理', description: '審核並維護研發技術文件' },
          { id: 'rd3-2-2', name: '技術方案協助評估', description: '協助評估技術方案可行性' },
          { id: 'rd3-2-3', name: '測試驗證管理', description: '規劃並監督產品測試驗證流程' },
        ]
      },
      {
        id: 'rd3-3',
        category: '跨部門協調溝通',
        items: [
          { id: 'rd3-3-1', name: '跨部門聯繫', description: '協調研發與製造、品保等部門的技術對接' },
          { id: 'rd3-3-2', name: '資訊傳達', description: '傳達課長指示，確保研發人員理解執行方向' },
        ]
      },
      {
        id: 'rd3-4',
        category: '改善與創新',
        items: [
          { id: 'rd3-4-1', name: '研發流程優化', description: '識別研發作業流程瓶頸，提出改善方案' },
          { id: 'rd3-4-2', name: '技術應用推廣', description: '引進新技術或工具，提升研發效率' },
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
          { id: 're-1-1', name: '機械設計', description: '執行機械設計與製圖' },
          { id: 're-1-2', name: '電氣設計', description: '執行電氣設計與配線規劃' },
          { id: 're-1-3', name: '試驗驗證', description: '規劃並進行產品試驗驗證' },
          { id: 're-1-4', name: '技術文件編寫', description: '編寫設計規格書與技術報告' },
        ]
      },
      {
        id: 're-2',
        category: '專案管理與執行',
        items: [
          { id: 're-2-1', name: '項目計畫執行', description: '依研發計畫如期完成個人負責項目' },
          { id: 're-2-2', name: '問題分析與解決', description: '識別研發問題並提出技術解決方案' },
          { id: 're-2-3', name: '進度管理', description: '自主管理工作進度，準時回報執行狀況' },
        ]
      },
      {
        id: 're-3',
        category: '協調與溝通',
        items: [
          { id: 're-3-1', name: '跨部門協調', description: '與製造、品保等部門協調技術需求' },
          { id: 're-3-2', name: '技術支持', description: '提供現場生產技術支持與異常排除' },
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
        category: '領導與管理能力',
        items: [
          { id: 'sm-1-1', name: '部門目標設定', description: '制定業務部門年度銷售目標與策略' },
          { id: 'sm-1-2', name: '團隊管理與培育', description: '管理業務團隊，培育業務人才' },
          { id: 'sm-1-3', name: '績效評核', description: '執行業務人員績效評核與激勵' },
        ]
      },
      {
        id: 'sm-2',
        category: '銷售管理',
        items: [
          { id: 'sm-2-1', name: '銷售策略規劃', description: '規劃銷售策略，分配業務區域與目標' },
          { id: 'sm-2-2', name: '銷售進度管控', description: '監控銷售進度，即時調整業務方向' },
          { id: 'sm-2-3', name: '重要客戶管理', description: '維護重要客戶關係，處理重大業務談判' },
        ]
      },
      {
        id: 'sm-3',
        category: '市場管理',
        items: [
          { id: 'sm-3-1', name: '市場趨勢分析', description: '分析市場趨勢與競爭對手動態' },
          { id: 'sm-3-2', name: '定價策略', description: '制定符合市場競爭力的定價策略' },
          { id: 'sm-3-3', name: '新市場開發', description: '開拓新業務區域與潛在客群' },
        ]
      },
      {
        id: 'sm-4',
        category: '成本控制與預算管理',
        items: [
          { id: 'sm-4-1', name: '業務成本控制', description: '控制業務費用與行銷成本，確保效益最大化' },
          { id: 'sm-4-2', name: '銷售預算管理', description: '編制業務部門預算，追蹤執行狀況' },
          { id: 'sm-4-3', name: '利潤率管理', description: '管控各產品線利潤率，避免低利潤接單' },
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
          { id: 'ac-1-1', name: '文件收發', description: '管理公司文件收發作業' },
          { id: 'ac-1-2', name: '檔案整理與歸檔', description: '整理並歸檔公司重要文件與紀錄' },
          { id: 'ac-1-3', name: '文件版本控管', description: '維護文件版本，確保各部門使用最新版本' },
          { id: 'ac-1-4', name: '檔案查詢與調閱', description: '提供各部門檔案查詢與調閱服務' },
        ]
      },
      {
        id: 'ac-2',
        category: '行政管理執行',
        items: [
          { id: 'ac-2-1', name: '行政庶務處理', description: '處理日常行政庶務，確保辦公室作業順暢' },
          { id: 'ac-2-2', name: '辦公設備管理', description: '管理辦公設備使用與維護' },
          { id: 'ac-2-3', name: '辦公耗材採購與管控', description: '採購並管控辦公耗材庫存' },
        ]
      },
      {
        id: 'ac-3',
        category: '協調與溝通',
        items: [
          { id: 'ac-3-1', name: '跨部門文件協調', description: '協調各部門文件傳遞與會簽作業' },
          { id: 'ac-3-2', name: '資訊傳遞', description: '傳遞公司通知、公文等資訊至相關人員' },
        ]
      },
    ]
  },
};
