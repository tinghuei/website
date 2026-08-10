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
        category: '金屬製程規劃及管理',
        items: [
          { id: 'cm-1-1', name: '產能的設計與控制', description: '依生產計畫與職安規範，指導協調現場生產作業，監管生產過程並排除異常，追蹤排程進度並完成產能報告' },
          { id: 'cm-1-2', name: '安排生產計畫', description: '依訂單需求盤點組織內外部人員及機器設備，分析人力效能與成本，規劃排定生產計畫' },
          { id: 'cm-1-3', name: '生產檢驗及品質控管', description: '依品管標準執行原材料及成品取樣檢驗，配合品保部門進行品質管控，提出品質及生產成本改善計畫' },
        ]
      },
      {
        id: 'cm-2',
        category: '環境及設備零組件管理',
        items: [
          { id: 'cm-2-1', name: '生產環境管理', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理' },
          { id: 'cm-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'cm-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
        ]
      },
      {
        id: 'cm-3',
        category: '廠務系統維運管理',
        items: [
          { id: 'cm-3-1', name: '執行廠務系統巡檢維護與保養', description: '依規範督導廠務系統定期巡檢、保養及維護，確保系統正常運作' },
          { id: 'cm-3-2', name: '完善廠務系統評估改善與執行', description: '評估廠務系統效能，規劃並推動改善方案，提升系統可靠度與效率' },
          { id: 'cm-3-3', name: '落實廠務系統規劃發包監造', description: '規劃廠務工程計畫，辦理發包作業，執行施工監造管理' },
          { id: 'cm-3-4', name: '順暢系統運轉狀況維持', description: '確保廠務供應系統（水電空調等）穩定運轉，維持生產環境所需條件' },
          { id: 'cm-3-5', name: '系統異常分析及改善評估', description: '發生廠務系統異常時，執行原因分析、緊急應變及改善評估，制定預防措施' },
          { id: 'cm-3-6', name: '廠務工安及人員派訓管理', description: '規劃廠務相關工安事項及人員教育訓練派訓，確保合規與人員能力提升' },
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
        category: '金屬製程規劃及管理',
        items: [
          { id: 'mc-1-1', name: '產能的設計與控制', description: '依生產計畫與職安規範，指導協調現場生產作業，監管生產過程並排除異常，追蹤排程進度並完成產能報告' },
          { id: 'mc-1-2', name: '安排生產計畫', description: '依訂單需求盤點組織內外部人員及機器設備，分析人力效能與成本，規劃排定生產計畫' },
          { id: 'mc-1-3', name: '生產檢驗及品質控管', description: '依品管標準執行原材料及成品取樣檢驗，配合品保部門進行品質管控，提出品質及生產成本改善計畫' },
        ]
      },
      {
        id: 'mc-2',
        category: '環境及設備零組件管理',
        items: [
          { id: 'mc-2-1', name: '生產環境管理', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理' },
          { id: 'mc-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'mc-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
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
        category: '金屬製程規劃及管理',
        items: [
          { id: 'bl-1-1', name: '產能的設計與控制', description: '依生產計畫與職安規範，指導協調現場生產作業，監管生產過程並排除異常，追蹤排程進度並完成產能報告' },
          { id: 'bl-1-2', name: '安排生產計畫', description: '依訂單需求盤點組織內外部人員及機器設備，分析人力效能與成本，規劃排定生產計畫' },
          { id: 'bl-1-3', name: '生產檢驗及品質控管', description: '依品管標準執行原材料及成品取樣檢驗，配合品保部門進行品質管控，提出品質及生產成本改善計畫' },
        ]
      },
      {
        id: 'bl-2',
        category: '環境及設備零組件管理',
        items: [
          { id: 'bl-2-1', name: '生產環境管理', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理' },
          { id: 'bl-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'bl-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
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
        category: '金屬製程規劃及管理',
        items: [
          { id: 'te-1-1', name: '產能的設計與控制', description: '依生產計畫與職安規範，指導協調現場生產作業，監管生產過程並排除異常，追蹤排程進度並完成產能報告' },
          { id: 'te-1-2', name: '安排生產計畫', description: '依訂單需求盤點組織內外部人員及機器設備，分析人力效能與成本，規劃排定生產計畫' },
          { id: 'te-1-3', name: '生產檢驗及品質控管', description: '依品管標準執行原材料及成品取樣檢驗，配合品保部門進行品質管控，提出品質及生產成本改善計畫' },
        ]
      },
      {
        id: 'te-2',
        category: '環境及設備零組件管理',
        items: [
          { id: 'te-2-1', name: '生產環境管理', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理' },
          { id: 'te-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'te-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
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
        category: '實施品質管理計畫',
        items: [
          { id: 'qi-1-1', name: '品質監控與執行', description: '依品質計畫及作業SOP執行品質監控，確保製程與產品符合規格' },
          { id: 'qi-1-2', name: '製程品質巡檢', description: '執行製程中品質巡檢，識別並記錄異常，即時通報相關人員' },
          { id: 'qi-1-3', name: '品質檢驗與判定', description: '執行進料、製程、成品及包裝完整性等各階段品質檢驗與合格判定' },
          { id: 'qi-1-4', name: '品質異常處理', description: '於現場確認異常、隔離不良品、追查原因，跨部門協調並撰寫異常處理報告' },
          { id: 'qi-1-5', name: '協助供應商品質管理', description: '協助追蹤供應商品質問題，提供改善建議' },
        ]
      },
      {
        id: 'qi-2',
        category: '彙整品質文件',
        items: [
          { id: 'qi-2-1', name: '紀錄與分析品質資料', description: '正確記錄並分析各項品質檢驗數據，提出品質趨勢報告' },
          { id: 'qi-2-2', name: '品質文件建立與更新', description: '協助建立並維護品質相關SOP、作業標準等文件' },
          { id: 'qi-2-3', name: '協助維護品質資料庫及文件', description: '協助維護品質資料庫，確保資料完整性與可查性' },
          { id: 'qi-2-4', name: '品質資料查詢與提供', description: '提供各部門品質資料查詢服務' },
        ]
      },
      {
        id: 'qi-3',
        category: '協助推廣品質觀念與教育訓練',
        items: [
          { id: 'qi-3-1', name: '協助推廣品質觀念', description: '協助推廣品質第一的工作理念，促進品質意識提升' },
          { id: 'qi-3-2', name: '協助教育訓練', description: '協助辦理品質相關教育訓練課程' },
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
        category: '金屬製程規劃及管理',
        items: [
          { id: 'cm2-1-1', name: '產能的設計與控制', description: '依生產計畫與職安規範，指導協調現場生產作業，監管生產過程並排除異常，追蹤排程進度並完成產能報告' },
          { id: 'cm2-1-2', name: '安排生產計畫', description: '依訂單需求盤點組織內外部人員及機器設備，分析人力效能與成本，規劃排定生產計畫' },
          { id: 'cm2-1-3', name: '生產檢驗及品質控管', description: '依品管標準執行原材料及成品取樣檢驗，配合品保部門進行品質管控，提出品質及生產成本改善計畫' },
        ]
      },
      {
        id: 'cm2-2',
        category: '環境及設備零組件管理',
        items: [
          { id: 'cm2-2-1', name: '生產環境管理', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理' },
          { id: 'cm2-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'cm2-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
        ]
      },
      {
        id: 'cm2-3',
        category: '廠務系統維運管理',
        items: [
          { id: 'cm2-3-1', name: '執行廠務系統巡檢維護與保養', description: '依規範督導廠務系統定期巡檢、保養及維護，確保系統正常運作' },
          { id: 'cm2-3-2', name: '完善廠務系統評估改善與執行', description: '評估廠務系統效能，規劃並推動改善方案，提升系統可靠度與效率' },
          { id: 'cm2-3-3', name: '落實廠務系統規劃發包監造', description: '規劃廠務工程計畫，辦理發包作業，執行施工監造管理' },
          { id: 'cm2-3-4', name: '順暢系統運轉狀況維持', description: '確保廠務供應系統（水電空調等）穩定運轉，維持生產環境所需條件' },
          { id: 'cm2-3-5', name: '系統異常分析及改善評估', description: '發生廠務系統異常時，執行原因分析、緊急應變及改善評估，制定預防措施' },
          { id: 'cm2-3-6', name: '廠務工安及人員派訓管理', description: '規劃廠務相關工安事項及人員教育訓練派訓，確保合規與人員能力提升' },
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
        category: '廠務系統維運管理',
        items: [
          { id: 'ee-1-1', name: '執行廠務系統巡檢維護與保養', description: '依規範執行廠務系統定期巡檢、保養及維護，確保系統正常運作' },
          { id: 'ee-1-2', name: '完善廠務系統評估改善與執行', description: '評估廠務系統效能，提出並執行改善方案，提升系統可靠度' },
          { id: 'ee-1-3', name: '落實廠務系統規劃發包監造', description: '規劃廠務工程計畫，辦理發包作業，執行施工監造管理' },
          { id: 'ee-1-4', name: '順暢系統運轉狀況維持', description: '確保廠務供應系統（水電空調等）穩定運轉，維持生產環境所需條件' },
          { id: 'ee-1-5', name: '系統異常分析及改善評估', description: '發生廠務系統異常時，執行原因分析、緊急應變及改善評估' },
          { id: 'ee-1-6', name: '主管交辦事項完成', description: '確實完成主管交辦之廠務工安相關事項及派訓事宜' },
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
        category: '廠務系統維運管理',
        items: [
          { id: 'ca-1-1', name: '執行廠務系統巡檢維護與保養', description: '依規範執行廠務系統定期巡檢、保養及維護，確保系統正常運作' },
          { id: 'ca-1-2', name: '完善廠務系統評估改善與執行', description: '評估廠務系統效能，提出並執行改善方案，提升系統可靠度' },
          { id: 'ca-1-3', name: '落實廠務系統規劃發包監造', description: '規劃廠務工程計畫，辦理發包作業，執行施工監造管理' },
          { id: 'ca-1-4', name: '順暢系統運轉狀況維持', description: '確保廠務供應系統（水電空調等）穩定運轉，維持生產環境所需條件' },
          { id: 'ca-1-5', name: '系統異常分析及改善評估', description: '發生廠務系統異常時，執行原因分析、緊急應變及改善評估' },
          { id: 'ca-1-6', name: '主管交辦事項完成', description: '確實完成主管交辦之廠務工安相關事項及派訓事宜' },
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
        category: '金屬製程規劃及管理',
        items: [
          { id: 'mc2-1-1', name: '產能的設計與控制', description: '依生產計畫與職安規範，指導協調現場生產作業，監管生產過程並排除異常，追蹤排程進度並完成產能報告' },
          { id: 'mc2-1-2', name: '安排生產計畫', description: '依訂單需求盤點組織內外部人員及機器設備，分析人力效能與成本，規劃排定生產計畫' },
          { id: 'mc2-1-3', name: '生產檢驗及品質控管', description: '依品管標準執行原材料及成品取樣檢驗，配合品保部門進行品質管控，提出品質及生產成本改善計畫' },
        ]
      },
      {
        id: 'mc2-2',
        category: '環境及設備零組件管理',
        items: [
          { id: 'mc2-2-1', name: '生產環境管理', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理' },
          { id: 'mc2-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'mc2-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
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
        category: '採購政策及程序擬定',
        items: [
          { id: 'mc3-1-1', name: '判別組織採購需求', description: '分析組織採購需求，識別採購風險及機會，作為政策擬定依據' },
          { id: 'mc3-1-2', name: '制定並推動採購政策及程序', description: '制定採購相關政策、制度及作業程序，並推動落實執行' },
        ]
      },
      {
        id: 'mc3-2',
        category: '採購策略規劃',
        items: [
          { id: 'mc3-2-1', name: '發展採購策略', description: '依組織目標及市場環境發展短中長期採購策略' },
          { id: 'mc3-2-2', name: '推動與評估採購策略', description: '推動採購策略執行，定期評估策略效果並滾動修正' },
        ]
      },
      {
        id: 'mc3-3',
        category: '供應商管理及評估',
        items: [
          { id: 'mc3-3-1', name: '建立供應商管理制度', description: '建立供應商評鑑、分級及管理制度，確保供應穩定' },
          { id: 'mc3-3-2', name: '評鑑及開發供應商', description: '定期評鑑現有供應商績效，開發備援供應商降低風險' },
          { id: 'mc3-3-3', name: '審核採購協議及合約', description: '審核重要採購合約條款，確保合規及維護公司利益' },
        ]
      },
      {
        id: 'mc3-4',
        category: '採購業務督導',
        items: [
          { id: 'mc3-4-1', name: '監督採購業務風險', description: '監控採購過程中的供應、價格及合規風險，制定風險因應措施' },
          { id: 'mc3-4-2', name: '管理採購績效', description: '建立採購績效指標，定期評估採購效益並提出改善方案' },
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
        category: '採購規劃與執行',
        items: [
          { id: 'mc4-1-1', name: '規劃採購計畫', description: '確認採購需求、蒐集市場資訊、進行詢價，建立採購計畫並取得核定' },
          { id: 'mc4-1-2', name: '執行採購案', description: '執行詢價比價議價評選，下單並協助簽訂採購合約，建立採購紀錄' },
          { id: 'mc4-1-3', name: '招標邀標及評選', description: '辦理招標或邀標作業，依評選標準進行供應商評選' },
        ]
      },
      {
        id: 'mc4-2',
        category: '履約及請款',
        items: [
          { id: 'mc4-2-1', name: '驗收採購項目及請款', description: '驗收採購貨品或服務，核對規格數量，辦理付款請款作業' },
          { id: 'mc4-2-2', name: '協商及解約', description: '處理採購爭議，必要時辦理合約協商變更或解約' },
        ]
      },
      {
        id: 'mc4-3',
        category: '採購關係維護',
        items: [
          { id: 'mc4-3-1', name: '內部溝通協調', description: '與需求單位及相關部門溝通協調採購需求與進度' },
          { id: 'mc4-3-2', name: '外部溝通協調', description: '與供應商維護良好合作關係，追蹤交期與品質問題' },
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
        category: '協助採購作業',
        items: [
          { id: 'pa-1-1', name: '執行採購', description: '選擇適當招標方式、評鑑標案，通知供應商並協助簽訂採購合約' },
          { id: 'pa-1-2', name: '管理承包商', description: '建立溝通策略維護供應商關係，監督履約績效，保存往來紀錄' },
          { id: 'pa-1-3', name: '確認合約履行', description: '確認所購貨物或服務符合規格，辦理付款作業，處理合約確認與取消' },
        ]
      },
      {
        id: 'pa-2',
        category: '整理採購相關資料',
        items: [
          { id: 'pa-2-1', name: '彙集採購資料', description: '蒐集並彙整採購相關資料，協助分析詢比價結果' },
          { id: 'pa-2-2', name: '維護採購資料庫', description: '建立並維護採購資料庫，更新供應商及物料價格紀錄' },
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
        category: '採購規劃與執行',
        items: [
          { id: 'pp-1-1', name: '規劃採購計畫', description: '確認採購需求、蒐集市場資訊、進行詢價，建立採購計畫並取得核定' },
          { id: 'pp-1-2', name: '執行採購案', description: '執行詢價比價議價評選，下單並協助簽訂採購合約，建立採購紀錄' },
          { id: 'pp-1-3', name: '招標邀標及評選', description: '辦理招標或邀標作業，依評選標準進行供應商評選' },
        ]
      },
      {
        id: 'pp-2',
        category: '履約及請款',
        items: [
          { id: 'pp-2-1', name: '驗收採購項目及請款', description: '驗收採購貨品或服務，核對規格數量，辦理付款請款作業' },
          { id: 'pp-2-2', name: '協商及解約', description: '處理採購爭議，必要時辦理合約協商變更或解約' },
        ]
      },
      {
        id: 'pp-3',
        category: '採購關係維護',
        items: [
          { id: 'pp-3-1', name: '內部溝通協調', description: '與需求單位及相關部門溝通協調採購需求與進度' },
          { id: 'pp-3-2', name: '外部溝通協調', description: '與供應商維護良好合作關係，追蹤交期與品質問題' },
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
        category: '依規範確認產品及庫存',
        items: [
          { id: 'pm-1-1', name: '確認與分類產品', description: '依規範核對並分類進出庫產品，確認產品品項、數量及狀態' },
          { id: 'pm-1-2', name: '依指示放置產品位置', description: '依倉儲規範及指示，正確放置及儲存產品' },
          { id: 'pm-1-3', name: '協助相關人員解決存貨識別與位置問題', description: '協助相關人員識別存貨位置，解決庫存識別與調撥問題' },
          { id: 'pm-1-4', name: '確認存貨轉移的適當性', description: '審核並確認存貨轉移作業符合規範' },
        ]
      },
      {
        id: 'pm-2',
        category: '管理資產與設施設備的安全',
        items: [
          { id: 'pm-2-1', name: '規劃與評估安全需求', description: '評估倉儲設施安全需求，規劃安全管理措施' },
          { id: 'pm-2-2', name: '監控並評估安全計畫', description: '監控倉儲安全計畫執行狀況，定期評估安全績效' },
        ]
      },
      {
        id: 'pm-3',
        category: '維護倉儲紀錄的文件',
        items: [
          { id: 'pm-3-1', name: '確認使用者要求的資訊', description: '確認倉儲相關人員對資訊的需求，提供正確資料' },
          { id: 'pm-3-2', name: '完成倉儲紀錄', description: '正確完成並維護倉儲進出庫、盤點等相關紀錄' },
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
        category: '依規範確認產品及庫存',
        items: [
          { id: 'im-1-1', name: '確認與分類產品', description: '依規範核對並分類進出庫產品，確認產品品項、數量及狀態' },
          { id: 'im-1-2', name: '依指示放置產品位置', description: '依倉儲規範及指示，正確放置及儲存產品' },
          { id: 'im-1-3', name: '協助相關人員解決存貨識別與位置問題', description: '協助相關人員識別存貨位置，解決庫存識別與調撥問題' },
          { id: 'im-1-4', name: '確認存貨轉移的適當性', description: '審核並確認存貨轉移作業符合規範' },
        ]
      },
      {
        id: 'im-2',
        category: '管理資產與設施設備的安全',
        items: [
          { id: 'im-2-1', name: '規劃與評估安全需求', description: '評估倉儲設施安全需求，規劃安全管理措施' },
          { id: 'im-2-2', name: '監控並評估安全計畫', description: '監控倉儲安全計畫執行狀況，定期評估安全績效' },
        ]
      },
      {
        id: 'im-3',
        category: '維護倉儲紀錄的文件',
        items: [
          { id: 'im-3-1', name: '確認使用者要求的資訊', description: '確認倉儲相關人員對資訊的需求，提供正確資料' },
          { id: 'im-3-2', name: '完成倉儲紀錄', description: '正確完成並維護倉儲進出庫、盤點等相關紀錄' },
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
        category: '依規範確認產品及庫存',
        items: [
          { id: 'sw-1-1', name: '確認與分類產品', description: '依規範核對並分類進出庫產品，確認產品品項、數量及狀態' },
          { id: 'sw-1-2', name: '依指示放置產品位置', description: '依倉儲規範及指示，正確放置及儲存產品' },
          { id: 'sw-1-3', name: '協助相關人員解決存貨識別與位置問題', description: '協助相關人員識別存貨位置，解決庫存識別與調撥問題' },
          { id: 'sw-1-4', name: '確認存貨轉移的適當性', description: '審核並確認存貨轉移作業符合規範' },
        ]
      },
      {
        id: 'sw-2',
        category: '管理資產與設施設備的安全',
        items: [
          { id: 'sw-2-1', name: '規劃與評估安全需求', description: '評估倉儲設施安全需求，規劃安全管理措施' },
          { id: 'sw-2-2', name: '監控並評估安全計畫', description: '監控倉儲安全計畫執行狀況，定期評估安全績效' },
        ]
      },
      {
        id: 'sw-3',
        category: '維護倉儲紀錄的文件',
        items: [
          { id: 'sw-3-1', name: '確認使用者要求的資訊', description: '確認倉儲相關人員對資訊的需求，提供正確資料' },
          { id: 'sw-3-2', name: '完成倉儲紀錄', description: '正確完成並維護倉儲進出庫、盤點等相關紀錄' },
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
        category: '金屬製程規劃及管理',
        items: [
          { id: 'sg-1-1', name: '產能的設計與控制', description: '依生產計畫與職安規範，指導協調現場生產作業，監管生產過程並排除異常，追蹤排程進度並完成產能報告' },
          { id: 'sg-1-2', name: '安排生產計畫', description: '依訂單需求盤點組織內外部人員及機器設備，分析人力效能與成本，規劃排定生產計畫' },
          { id: 'sg-1-3', name: '生產檢驗及品質控管', description: '依品管標準執行原材料及成品取樣檢驗，配合品保部門進行品質管控，提出品質及生產成本改善計畫' },
        ]
      },
      {
        id: 'sg-2',
        category: '環境及設備零組件管理',
        items: [
          { id: 'sg-2-1', name: '生產環境管理', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理' },
          { id: 'sg-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'sg-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
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
        category: '金屬製程規劃及管理',
        items: [
          { id: 'gl-1-1', name: '產能的設計與控制', description: '依生產計畫與職安規範，指導協調現場生產作業，監管生產過程並排除異常，追蹤排程進度並完成產能報告' },
          { id: 'gl-1-2', name: '安排生產計畫', description: '依訂單需求盤點組織內外部人員及機器設備，分析人力效能與成本，規劃排定生產計畫' },
          { id: 'gl-1-3', name: '生產檢驗及品質控管', description: '依品管標準執行原材料及成品取樣檢驗，配合品保部門進行品質管控，提出品質及生產成本改善計畫' },
        ]
      },
      {
        id: 'gl-2',
        category: '環境及設備零組件管理',
        items: [
          { id: 'gl-2-1', name: '生產環境管理', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理' },
          { id: 'gl-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'gl-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
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
        category: '金屬製程規劃及管理',
        items: [
          { id: 'mfg-mg-1-1', name: '產能的設計與控制', description: '依生產計畫與職安規範，指導協調現場生產作業，監管生產過程並排除異常，追蹤排程進度並完成產能報告' },
          { id: 'mfg-mg-1-2', name: '安排生產計畫', description: '依訂單需求盤點組織內外部人員及機器設備，分析人力效能與成本，規劃排定生產計畫' },
          { id: 'mfg-mg-1-3', name: '生產檢驗及品質控管', description: '依品管標準執行原材料及成品取樣檢驗，配合品保部門進行品質管控，提出品質及生產成本改善計畫' },
        ]
      },
      {
        id: 'mfg-mg-2',
        category: '環境及設備零組件管理',
        items: [
          { id: 'mfg-mg-2-1', name: '生產環境管理', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理' },
          { id: 'mfg-mg-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'mfg-mg-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
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
        category: '金屬製程規劃及管理',
        items: [
          { id: 'mfg-press-1-1', name: '產能的設計與控制', description: '依生產計畫與職安規範，指導協調現場生產作業，監管生產過程並排除異常，追蹤排程進度並完成產能報告' },
          { id: 'mfg-press-1-2', name: '安排生產計畫', description: '依訂單需求盤點組織內外部人員及機器設備，分析人力效能與成本，規劃排定生產計畫' },
          { id: 'mfg-press-1-3', name: '生產檢驗及品質控管', description: '依品管標準執行原材料及成品取樣檢驗，配合品保部門進行品質管控，提出品質及生產成本改善計畫' },
        ]
      },
      {
        id: 'mfg-press-2',
        category: '環境及設備零組件管理',
        items: [
          { id: 'mfg-press-2-1', name: '生產環境管理', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理' },
          { id: 'mfg-press-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'mfg-press-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
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
        category: '金屬製程規劃及管理',
        items: [
          { id: 'mfg-paint-1-1', name: '產能的設計與控制', description: '依生產計畫與職安規範，指導協調現場生產作業，監管生產過程並排除異常，追蹤排程進度並完成產能報告' },
          { id: 'mfg-paint-1-2', name: '安排生產計畫', description: '依訂單需求盤點組織內外部人員及機器設備，分析人力效能與成本，規劃排定生產計畫' },
          { id: 'mfg-paint-1-3', name: '生產檢驗及品質控管', description: '依品管標準執行原材料及成品取樣檢驗，配合品保部門進行品質管控，提出品質及生產成本改善計畫' },
        ]
      },
      {
        id: 'mfg-paint-2',
        category: '環境及設備零組件管理',
        items: [
          { id: 'mfg-paint-2-1', name: '生產環境管理', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理' },
          { id: 'mfg-paint-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'mfg-paint-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
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
        category: '金屬製程規劃及管理',
        items: [
          { id: 'mfg-asm-1-1', name: '產能的設計與控制', description: '依生產計畫與職安規範，指導協調現場生產作業，監管生產過程並排除異常，追蹤排程進度並完成產能報告' },
          { id: 'mfg-asm-1-2', name: '安排生產計畫', description: '依訂單需求盤點組織內外部人員及機器設備，分析人力效能與成本，規劃排定生產計畫' },
          { id: 'mfg-asm-1-3', name: '生產檢驗及品質控管', description: '依品管標準執行原材料及成品取樣檢驗，配合品保部門進行品質管控，提出品質及生產成本改善計畫' },
        ]
      },
      {
        id: 'mfg-asm-2',
        category: '環境及設備零組件管理',
        items: [
          { id: 'mfg-asm-2-1', name: '生產環境管理', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理' },
          { id: 'mfg-asm-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'mfg-asm-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
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
        category: '理解客戶要求',
        items: [
          { id: 'qm-1-1', name: '制訂客戶品質規範', description: '蒐集並分析客戶品質要求及國際品質規範，制訂符合客戶需求的品質技術制度標準' },
        ]
      },
      {
        id: 'qm-2',
        category: '檢驗程序規劃及執行',
        items: [
          { id: 'qm-2-1', name: '檢驗程序規劃與程序文件製作', description: '規劃品質技術流程，制定各項SOP文件，確保檢驗程序完整且可執行' },
          { id: 'qm-2-2', name: '製程品質控管（IPQC）', description: '執行製程中品質管控，確保在製品符合品質標準，識別並處理製程異常' },
          { id: 'qm-2-3', name: '確保成品品質（QC）', description: '執行成品品質檢驗與測試，確認出貨品質符合客戶規範與內部標準' },
        ]
      },
      {
        id: 'qm-3',
        category: '管理檢驗器具與設備',
        items: [
          { id: 'qm-3-1', name: '檢治具及檢驗設備之校正', description: '依校正計畫執行或監督量測設備校正，確保量測結果準確可靠' },
          { id: 'qm-3-2', name: '檢治具與檢驗設備保養', description: '依保養週期執行或監督檢驗設備保養，維持設備精度與可靠性' },
        ]
      },
      {
        id: 'qm-4',
        category: 'NG品異常分析及改善',
        items: [
          { id: 'qm-4-1', name: '受理客訴及回覆', description: '受理客戶品質投訴，建立品質履歷資料庫，即時追蹤並回覆客訴處理進度' },
          { id: 'qm-4-2', name: 'NG品異常狀況檢討', description: '進行NG品異常現況調查，執行外觀、尺寸及功能的檢驗測試' },
          { id: 'qm-4-3', name: 'NG品異常狀況判定及原因分析', description: '運用8D、5Why等工具執行根因分析，確認品質異常真因' },
          { id: 'qm-4-4', name: 'NG品異常狀況對策擬定', description: '擬定暫定及永久改善對策，追蹤對策落實效果並驗證改善成效' },
        ]
      },
      {
        id: 'qm-5',
        category: '供應商品質管理',
        items: [
          { id: 'qm-5-1', name: '協助供應商完成品質管理', description: '對異常供應商開立品質異常報告，協助擬定及追蹤改善對策' },
          { id: 'qm-5-2', name: '稽核評鑑及監控供應商品質管理系統', description: '定期評鑑供應商製程能力與成品品質，監控其品質管理系統執行狀況' },
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
        category: '理解客戶要求',
        items: [
          { id: 'qm3-1-1', name: '制訂客戶品質規範', description: '蒐集並分析客戶品質要求及國際品質規範，制訂符合客戶需求的品質技術制度標準' },
        ]
      },
      {
        id: 'qm3-2',
        category: '檢驗程序規劃及執行',
        items: [
          { id: 'qm3-2-1', name: '檢驗程序規劃與程序文件製作', description: '規劃品質技術流程，制定各項SOP文件，確保檢驗程序完整且可執行' },
          { id: 'qm3-2-2', name: '製程品質控管（IPQC）', description: '執行製程中品質管控，確保在製品符合品質標準，識別並處理製程異常' },
          { id: 'qm3-2-3', name: '確保成品品質（QC）', description: '執行成品品質檢驗與測試，確認出貨品質符合客戶規範與內部標準' },
        ]
      },
      {
        id: 'qm3-3',
        category: '管理檢驗器具與設備',
        items: [
          { id: 'qm3-3-1', name: '檢治具及檢驗設備之校正', description: '依校正計畫執行或監督量測設備校正，確保量測結果準確可靠' },
          { id: 'qm3-3-2', name: '檢治具與檢驗設備保養', description: '依保養週期執行或監督檢驗設備保養，維持設備精度與可靠性' },
        ]
      },
      {
        id: 'qm3-4',
        category: 'NG品異常分析及改善',
        items: [
          { id: 'qm3-4-1', name: '受理客訴及回覆', description: '受理客戶品質投訴，建立品質履歷資料庫，即時追蹤並回覆客訴處理進度' },
          { id: 'qm3-4-2', name: 'NG品異常狀況檢討', description: '進行NG品異常現況調查，執行外觀、尺寸及功能的檢驗測試' },
          { id: 'qm3-4-3', name: 'NG品異常狀況判定及原因分析', description: '運用8D、5Why等工具執行根因分析，確認品質異常真因' },
          { id: 'qm3-4-4', name: 'NG品異常狀況對策擬定', description: '擬定暫定及永久改善對策，追蹤對策落實效果並驗證改善成效' },
        ]
      },
      {
        id: 'qm3-5',
        category: '供應商品質管理',
        items: [
          { id: 'qm3-5-1', name: '協助供應商完成品質管理', description: '對異常供應商開立品質異常報告，協助擬定及追蹤改善對策' },
          { id: 'qm3-5-2', name: '稽核評鑑及監控供應商品質管理系統', description: '定期評鑑供應商製程能力與成品品質，監控其品質管理系統執行狀況' },
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
        category: '管理行政庶務',
        items: [
          { id: 'gm-1-1', name: '日常庶務管理', description: '規劃指導總務人員工作SOP，管理公文行政文書，安排賓客接待，管理水電環境清潔，執行員工服務' },
          { id: 'gm-1-2', name: '特殊庶務管理', description: '管理公務車輛，辦理特殊節慶活動，安排員工出差行程' },
        ]
      },
      {
        id: 'gm-2',
        category: '管理總務採購及其他事宜',
        items: [
          { id: 'gm-2-1', name: '管理與督導總務事宜', description: '依ESG策略執行管理督導，洽談合作廠商，與廠商議價執行採購，盤點管理財產目錄，管理各項保險合約' },
          { id: 'gm-2-2', name: '管理組織相關事務', description: '統籌管理服務事項，管理宿舍，維護建築物公共安全，制定規範，執行績效考核' },
        ]
      },
      {
        id: 'gm-3',
        category: '設施與環境管理',
        items: [
          { id: 'gm-3-1', name: '廠區設施維護管理', description: '規劃並督導廠區建築、水電、空調等基礎設施的定期維護與修繕作業' },
          { id: 'gm-3-2', name: '環境清潔與綠化管理', description: '維護辦公及廠區環境整潔，規劃綠化美化及廢棄物清除作業' },
          { id: 'gm-3-3', name: '節能與ESG管理', description: '推動節能減碳措施，配合公司ESG政策執行環境管理改善方案' },
        ]
      },
      {
        id: 'gm-4',
        category: '法規合規與安全管理',
        items: [
          { id: 'gm-4-1', name: '職安衛法規遵循', description: '確認廠區相關設施符合職業安全衛生法規要求，執行安全檢查與改善' },
          { id: 'gm-4-2', name: '消防與緊急應變', description: '規劃執行消防設備維護及緊急應變演練，確保廠區安全' },
          { id: 'gm-4-3', name: '保險與法律事務協助', description: '管理各項財產與意外保險合約，協助處理與總務相關之法律事務' },
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
        category: '管理行政庶務',
        items: [
          { id: 'gam-1-1', name: '日常庶務管理', description: '規劃指導總務人員工作SOP，管理公文行政文書，安排賓客接待，管理水電環境清潔，執行員工服務' },
          { id: 'gam-1-2', name: '特殊庶務管理', description: '管理公務車輛，辦理特殊節慶活動，安排員工出差行程' },
        ]
      },
      {
        id: 'gam-2',
        category: '管理總務採購及其他事宜',
        items: [
          { id: 'gam-2-1', name: '管理與督導總務事宜', description: '依ESG策略執行管理督導，洽談合作廠商，與廠商議價執行採購，盤點管理財產目錄，管理各項保險合約' },
          { id: 'gam-2-2', name: '管理組織相關事務', description: '統籌管理服務事項，管理宿舍，維護建築物公共安全，制定規範，執行績效考核' },
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
        category: '管理行政庶務',
        items: [
          { id: 'gs-1-1', name: '日常庶務管理', description: '規劃指導總務人員工作SOP，管理公文行政文書，安排賓客接待，管理水電環境清潔，執行員工服務' },
          { id: 'gs-1-2', name: '特殊庶務管理', description: '管理公務車輛，辦理特殊節慶活動，安排員工出差行程' },
        ]
      },
      {
        id: 'gs-2',
        category: '管理總務採購及其他事宜',
        items: [
          { id: 'gs-2-1', name: '管理與督導總務事宜', description: '依ESG策略執行管理督導，洽談合作廠商，與廠商議價執行採購，盤點管理財產目錄，管理各項保險合約' },
          { id: 'gs-2-2', name: '管理組織相關事務', description: '統籌管理服務事項，管理宿舍，維護建築物公共安全，制定規範，執行績效考核' },
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
        category: '管理行政庶務',
        items: [
          { id: 'gsa-1-1', name: '日常庶務管理', description: '規劃指導總務人員工作SOP，管理公文行政文書，安排賓客接待，管理水電環境清潔，執行員工服務' },
          { id: 'gsa-1-2', name: '特殊庶務管理', description: '管理公務車輛，辦理特殊節慶活動，安排員工出差行程' },
        ]
      },
      {
        id: 'gsa-2',
        category: '管理總務採購及其他事宜',
        items: [
          { id: 'gsa-2-1', name: '管理與督導總務事宜', description: '依ESG策略執行管理督導，洽談合作廠商，與廠商議價執行採購，盤點管理財產目錄，管理各項保險合約' },
          { id: 'gsa-2-2', name: '管理組織相關事務', description: '統籌管理服務事項，管理宿舍，維護建築物公共安全，制定規範，執行績效考核' },
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
        category: '管理行政庶務',
        items: [
          { id: 'clm-1-1', name: '日常庶務管理', description: '規劃指導總務人員工作SOP，管理公文行政文書，安排賓客接待，管理水電環境清潔，執行員工服務' },
          { id: 'clm-1-2', name: '特殊庶務管理', description: '管理公務車輛，辦理特殊節慶活動，安排員工出差行程' },
        ]
      },
      {
        id: 'clm-2',
        category: '管理總務採購及其他事宜',
        items: [
          { id: 'clm-2-1', name: '管理與督導總務事宜', description: '依ESG策略執行管理督導，洽談合作廠商，與廠商議價執行採購，盤點管理財產目錄，管理各項保險合約' },
          { id: 'clm-2-2', name: '管理組織相關事務', description: '統籌管理服務事項，管理宿舍，維護建築物公共安全，制定規範，執行績效考核' },
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
        category: '管理行政庶務',
        items: [
          { id: 'ce-1-1', name: '日常庶務管理', description: '依工作SOP執行日常清潔、公文行政文書傳遞，協助賓客接待，維護水電環境，提供員工服務' },
          { id: 'ce-1-2', name: '特殊庶務管理', description: '協助辦理特殊節慶活動，協助安排員工出差相關事務' },
        ]
      },
      {
        id: 'ce-2',
        category: '管理總務採購及其他事宜',
        items: [
          { id: 'ce-2-1', name: '管理與督導總務事宜', description: '執行日常物資採購申請，管理辦公消耗品庫存，依規定盤點財產' },
          { id: 'ce-2-2', name: '管理組織相關事務', description: '配合統籌管理服務事項，協助維護建築物公共環境安全，遵守組織規範' },
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
        category: '管理行政庶務',
        items: [
          { id: 'cw-1-1', name: '日常庶務管理', description: '依清潔SOP執行各區域日常清潔，維護廁所、茶水間等公共環境衛生，依規定分類清運廢棄物，確認清潔品質符合標準' },
          { id: 'cw-1-2', name: '特殊庶務管理', description: '依需求執行特殊場合清潔作業，回應各部門臨時清潔服務需求' },
        ]
      },
      {
        id: 'cw-2',
        category: '管理總務採購及其他事宜',
        items: [
          { id: 'cw-2-1', name: '管理與督導總務事宜', description: '確實遵守清潔劑等化學品安全存放與使用規範，依規定配戴PPE，及時反饋環境異常問題' },
          { id: 'cw-2-2', name: '管理組織相關事務', description: '配合組織規範執行清潔作業，協助維護建築物公共環境整潔與安全' },
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
