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
    category: '製造課',
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
          { id: 'mc-2-1', name: '生產環境管理及安全維護', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理，並執行工安相關規範確保生產環境安全' },
          { id: 'mc-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'mc-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
        ]
      },
    ]
  },
  '班長': {
    category: '製造課',
    level: '基層主管',
    requiredLevel: 3,
    competencies: [
      {
        id: 'bl-1',
        category: '人員管理與出勤管控',
        items: [
          { id: 'bl-1-1', name: '出勤管理與人員點名', description: '開線前完成人員點名，掌握人員動向，說明當日工作重點與產量目標，確保班內人員到位' },
          { id: 'bl-1-2', name: '離崗管制', description: '嚴格要求班內成員離開工作機台必須報告，確實填寫離崗登記簿，防止無故離崗影響生産' },
        ]
      },
      {
        id: 'bl-2',
        category: '生産報工管理',
        items: [
          { id: 'bl-2-1', name: '生産報工統計', description: '每兩小時確實統計產出數量並更新白板資訊，確保生産數據真實不虛報，提供管理參考' },
          { id: 'bl-2-2', name: '首件檢查執行', description: '開線或換線時執行首件檢查，確認首件樣品正確且擺放於指定檢驗區，確保製程品質' },
        ]
      },
      {
        id: 'bl-3',
        category: 'SOP落實與設備環境管理',
        items: [
          { id: 'bl-3-1', name: 'SOP落實確認', description: '確保組員清楚相關作業標準與權益，落實按SOP執行作業，識別並糾正不合規行為' },
          { id: 'bl-3-2', name: '設備保養與環境清潔', description: '依保養計畫負責班內機台日常保養與5S清潔，維護消防栓周邊淨空，確保作業環境安全整潔' },
          { id: 'bl-3-3', name: '異常通報', description: '發現品質、設備或人員異常時，立即回報組長或副組長，協助排除異常恢復正常生産' },
        ]
      },
    ]
  },
  '技術員': {
    category: '製造課',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'te-1',
        category: '金屬製造設備機具整備',
        items: [
          { id: 'te-1-1', name: '啟動設備及檢查安全狀況', description: '依設備操作規範啟動機具設備，確認安全裝置功能正常，完成啟動前安全檢查紀錄' },
          { id: 'te-1-2', name: '機具準備與設定', description: '依生產指令完成機具夾具更換、參數設定及試作確認，確保設備備妥可投產' },
        ]
      },
      {
        id: 'te-2',
        category: '金屬製造生產',
        items: [
          { id: 'te-2-1', name: '製程監控與紀錄', description: '依作業標準執行製程操作，監控生產進度與機台運作狀況，完成生產紀錄' },
          { id: 'te-2-2', name: '製程品質管制', description: '依品質標準執行自主檢查，識別異常並通報，確保製程品質符合規格' },
        ]
      },
      {
        id: 'te-3',
        category: '環境清潔及設備維護',
        items: [
          { id: 'te-3-1', name: '環境清理與維護', description: '依5S規範清理工作區域，維持整潔有序的生產環境' },
          { id: 'te-3-2', name: '盤點零組件、半成品及成品', description: '依作業規範盤點材料、半成品及成品數量，確認庫存正確並完成紀錄' },
          { id: 'te-3-3', name: '機具設備保養', description: '依保養計畫執行機具設備日常清潔與定期保養，完成保養紀錄' },
          { id: 'te-3-4', name: '機具設備簡易故障排除', description: '識別機具設備常見故障現象，執行簡易故障排除，並回報無法自行排除之問題' },
        ]
      },
    ]
  },
  '品檢員': {
    category: '品保課',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'qi-1',
        category: '協助品質管理人員建立檢驗文件',
        items: [
          { id: 'qi-1-1', name: '製作一般待檢驗項目的相關文件', description: '依品質管理人員指示，製作進料、製程、成品等待檢驗項目之相關表單及檢驗紀錄文件' },
        ]
      },
      {
        id: 'qi-2',
        category: '協助檢查測試或測量材料及產品',
        items: [
          { id: 'qi-2-1', name: '判讀檢驗程序文件與標準化作業文件', description: '閱讀並理解檢驗程序書及標準化作業文件，依文件規定執行檢驗作業' },
          { id: 'qi-2-2', name: '製程檢驗與量測', description: '依作業標準對製程中在製品進行尺寸、外觀等項目之檢驗與量測，識別並記錄異常' },
          { id: 'qi-2-3', name: '一般項目檢驗與量測', description: '使用量具及檢驗設備對進料材料及成品進行一般項目之檢驗與量測，判定合格與否' },
        ]
      },
      {
        id: 'qi-3',
        category: '協助整理資料',
        items: [
          { id: 'qi-3-1', name: '協助整理資料', description: '協助彙整各類檢驗紀錄與品質數據，提供給品質管理人員進行分析與管理' },
        ]
      },
      {
        id: 'qi-4',
        category: '文件與資料管理',
        items: [
          { id: 'qi-4-1', name: '管理品管部門所需文件', description: '維護並管理品管部門相關文件，確保文件版本正確、存取有序且易於查閱' },
        ]
      },
    ]
  },
  '業務專員': {
    category: '業務課',
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
        category: '生産排程管理與執行',
        items: [
          { id: 'cm2-1-1', name: '確保生産進度與執行', description: '依生管課所提供生産排程，確保生産進度與執行，並如期完成交付' },
          { id: 'cm2-1-2', name: '生産品質管理', description: '依各標準作業進行各項產品生産，確保產品符合品質規格及品質水準，達到品質目標' },
          { id: 'cm2-1-3', name: '生産帳務與產品完整性', description: '確保所生産產品之帳務正確及確保產品完整性，執行不良品的維修與管控' },
        ]
      },
      {
        id: 'cm2-2',
        category: '設備維護與損耗管控',
        items: [
          { id: 'cm2-2-1', name: '生産設備維護與保養', description: '負責生産設備的維護與保養，確保設備正常運轉，預防非計畫性停機' },
          { id: 'cm2-2-2', name: '原材料損耗管控', description: '管控原材料（產品）損耗，將損耗降低至客戶接受之適當比率' },
        ]
      },
      {
        id: 'cm2-3',
        category: '部門目標督導',
        items: [
          { id: 'cm2-3-1', name: '決定部門目標與推動執行', description: '決定部門目標、方針及推動執行，以符合公司政策方針及目標，督導各課組訂定工作計劃' },
          { id: 'cm2-3-2', name: '負責生産流程與成本效益', description: '負責產品生産流程，確保產量交期、品質、成本低減，以滿足客戶需求' },
          { id: 'cm2-3-3', name: '績效管理與人員激勵', description: '督導廠務之績效管理、重點目標管理與生産準備工作，激發員工發揮團隊精神，提升士氣' },
        ]
      },
      {
        id: 'cm2-4',
        category: '安全衛生督導',
        items: [
          { id: 'cm2-4-1', name: '督導遵守安全衛生政策', description: '督導廠務遵守安全衛生政策、工作守則及其他安全衛生規定，確保作業環境合規' },
          { id: 'cm2-4-2', name: '跨部門協調', description: '協調課組級間之各項問題，促進工作之進行，並協調部門間問題推動工作順利進行' },
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
    category: '製造課',
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
          { id: 'mc2-2-1', name: '生產環境管理及安全維護', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理，並執行工安相關規範確保生產環境安全' },
          { id: 'mc2-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'mc2-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
        ]
      },
    ]
  },
  '資材課長': {
    category: '資材課',
    level: '部門主管',
    requiredLevel: 3,
    competencies: [
      {
        id: 'mc3-1',
        category: '生産計劃排程督導',
        items: [
          { id: 'mc3-1-1', name: '督導生産排程與製令', description: '檢視業務訂單，督導排定生産排程與開立製令單，確保生産作業有依據可循' },
          { id: 'mc3-1-2', name: '督導產銷平衡', description: '督導產銷平衡，主持國外進口件缺料產銷檢討會議，確保生産排程之執行' },
        ]
      },
      {
        id: 'mc3-2',
        category: '交期與進度管理',
        items: [
          { id: 'mc3-2-1', name: '督導客戶交期控制與達成', description: '督導部屬落實確認客戶交期之控制與達成，確保訂單按時出貨' },
          { id: 'mc3-2-2', name: '召開生産進度檢討會', description: '管理並召開生産進度檢討會與執行，掌握進度落差並推動改善' },
        ]
      },
      {
        id: 'mc3-3',
        category: '物料計劃督導',
        items: [
          { id: 'mc3-3-1', name: '確認物料計劃製作', description: '確認物料計劃製作，督導國內外件請購作業及庫存水準控管，防止缺料或超儲' },
        ]
      },
      {
        id: 'mc3-4',
        category: '人員管理與稽核配合',
        items: [
          { id: 'mc3-4-1', name: '人員溝通與績效管理', description: '執行人員溝通與績效管理，包含出勤管理、績效考核、訓練等，及SOP的制定與維護' },
          { id: 'mc3-4-2', name: '跨部門協調與稽核', description: '主導跨部門例行會議及專案會議，配合內外部稽核（含內控缺失改善），擬定工作目標與組織目標達成一致性' },
        ]
      },
    ]
  },
  '資材副課長': {
    category: '資材課',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'mc4-1',
        category: '採購進度督導',
        items: [
          { id: 'mc4-1-1', name: '管理外包與採購件生産進度', description: '督導管理外包與採購件之生産進度，確保公司所採購之料（産）品能適時（進貨）、適量、適質、適價' },
          { id: 'mc4-1-2', name: '採購流程SOP制定', description: '制定採購相關作業表單與SOP，督導工作進度追蹤，確保採購流程一致可稽' },
        ]
      },
      {
        id: 'mc4-2',
        category: '成本與供應商管理',
        items: [
          { id: 'mc4-2-1', name: '材料成本定期督導', description: '督導材料成本的定期維護Review，確保材料成本資訊準確並維持合理水準' },
          { id: 'mc4-2-2', name: '外包廠與供應商評比督導', description: '督導部屬對外包廠績效評比、輔導及管理，確認既有供應商評比與管理執行狀況' },
        ]
      },
      {
        id: 'mc4-3',
        category: '退貨與請款督導',
        items: [
          { id: 'mc4-3-1', name: '退貨處理改善督導', description: '督導進料檢驗或生産線退不良品（屬供應商）的退貨處理改善，確保問題有效解決' },
          { id: 'mc4-3-2', name: '採購請款檢視', description: '檢視採購請款作業，確認請款單據正確性及付款流程合規' },
        ]
      },
      {
        id: 'mc4-4',
        category: '人員管理與稽核',
        items: [
          { id: 'mc4-4-1', name: '人員溝通與績效管理', description: '執行人員溝通與績效管理，包含出勤管理、績效考核、訓練等事宜' },
          { id: 'mc4-4-2', name: '跨部門協調與稽核配合', description: '參與跨部門例行會議及專案會議，配合內外部稽核（含內控缺失改善）' },
        ]
      },
    ]
  },
  '採購助理': {
    category: '資材課',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'pa-1',
        category: '採購進度管制',
        items: [
          { id: 'pa-1-1', name: '管制外包與採購件生産進度', description: '管制外包與採購件之生産進度，確保公司所採購之料（産）品能適時（進貨）、適量、適質、適價' },
          { id: 'pa-1-2', name: '物料催交', description: '主動催交採購物料，掌握交期進度，協調供應商解決進度落後問題' },
        ]
      },
      {
        id: 'pa-2',
        category: '材料成本與供應商管理',
        items: [
          { id: 'pa-2-1', name: '材料成本定期維護', description: '執行材料成本的定期維護Review，確保成本資料正確更新' },
          { id: 'pa-2-2', name: '供應商評比與管理', description: '配合品管對外包廠績效評比、輔導及管理，執行既有供應商評比與管理' },
        ]
      },
      {
        id: 'pa-3',
        category: '退貨處理與請款',
        items: [
          { id: 'pa-3-1', name: '退貨處理改善', description: '執行進料檢驗或生産線退不良品（屬供應商）的退貨處理改善，確保問題解決並歸責供應商' },
          { id: 'pa-3-2', name: '採購請款作業', description: '辦理採購請款作業，核對發票與訂單資訊，確保付款流程正確合規' },
        ]
      },
    ]
  },
  '採購專員': {
    category: '資材課',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'pp-1',
        category: '採購進度督導',
        items: [
          { id: 'pp-1-1', name: '督導外包與採購件生産進度', description: '督導外包與採購件之生産進度，督導確保公司所採購之料（産）品能適時（進貨）、適量、適質、適價' },
          { id: 'pp-1-2', name: '物料催交督導', description: '督導物料催交作業，確保交期進度達標，協調供應商解決進度問題' },
        ]
      },
      {
        id: 'pp-2',
        category: '材料成本與供應商督導',
        items: [
          { id: 'pp-2-1', name: '材料成本督導維護', description: '督導材料成本的定期維護Review，確保成本資料準確並維持合理水準' },
          { id: 'pp-2-2', name: '供應商評比督導', description: '配合品管對外包廠績效評比、輔導及管理，督導既有供應商評比與管理執行' },
        ]
      },
      {
        id: 'pp-3',
        category: '退貨處理與請款檢視',
        items: [
          { id: 'pp-3-1', name: '退貨處理改善督導', description: '督導進料檢驗或生産線退不良品（屬供應商）的退貨處理改善，確保問題追蹤解決' },
          { id: 'pp-3-2', name: '採購請款檢視', description: '檢視採購請款作業，確認請款單據正確性及付款流程合規' },
        ]
      },
    ]
  },
  '生管': {
    category: '資材課',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'pm-1',
        category: '生産排程規劃',
        items: [
          { id: 'pm-1-1', name: '依訂單排定生産排程', description: '根據業務訂單分析生産需求，排定各產品生産排程，確保排程符合交期要求' },
          { id: 'pm-1-2', name: '開立製令單', description: '依生産排程開立製令單，確認各生産工令資訊正確，提供製造部門執行依據' },
        ]
      },
      {
        id: 'pm-2',
        category: '物料計畫管制',
        items: [
          { id: 'pm-2-1', name: '物料計畫製作', description: '製作物料需求計畫，執行國內外件請購作業，管控庫存水準，防止缺料或超儲' },
          { id: 'pm-2-2', name: '確保生産排程執行', description: '掌握產銷平衡，參與缺料產銷檢討會議，協調解決物料短缺問題，確保生産排程如期執行' },
        ]
      },
      {
        id: 'pm-3',
        category: '交期管理',
        items: [
          { id: 'pm-3-1', name: '客戶交期控制與達成', description: '追蹤並管控各訂單客戶交期，協調製造、品保等部門確保交期如期達成' },
          { id: 'pm-3-2', name: '生産進度檢討', description: '召開或參與生産進度檢討會，收集並分析生産進度資訊，提出改善行動方案' },
        ]
      },
    ]
  },
  '物管': {
    category: '資材課',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'im-1',
        category: '收料與入庫',
        items: [
          { id: 'im-1-1', name: '執行收料作業', description: '執行收料作業，包含原物料、半成品、不良品、呆滯品（廢料）之收料與呆滯品處理，提高料帳精準度避免呆料' },
          { id: 'im-1-2', name: '執行合格品入庫作業', description: '執行合格品入庫作業，進行倉儲架位控制，確保儲位正確，提高儲運效率' },
        ]
      },
      {
        id: 'im-2',
        category: '備料與發料',
        items: [
          { id: 'im-2-1', name: '依製令單備料', description: '依製令單於三天前查詢庫存與儲位（QR CODE掃描），準備齊現場所需的物料，確保生産線不缺料' },
          { id: 'im-2-2', name: '執行發料作業', description: '執行發料作業，協助生産線上下料，確保物料準時供應至各生産站點' },
        ]
      },
      {
        id: 'im-3',
        category: '料架維護與盤點',
        items: [
          { id: 'im-3-1', name: '料架維護', description: '維護料架整潔與結構安全，確保儲位標識清楚，符合5S管理要求' },
          { id: 'im-3-2', name: '執行盤點作業', description: '執行定期及年度物料盤點，核對實物與系統帳務，及時回報異常差異' },
        ]
      },
    ]
  },
  '成倉': {
    category: '資材課',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'sw-1',
        category: '收料與入庫管理',
        items: [
          { id: 'sw-1-1', name: '成品收料管理', description: '執行成品收料管理，核對成品品項、數量及狀態，確保收料正確無誤' },
          { id: 'sw-1-2', name: '入庫管理', description: '執行入庫管理，進行成品整理及5S管理，定期盤點確認帳物相符' },
        ]
      },
      {
        id: 'sw-2',
        category: '出貨管理',
        items: [
          { id: 'sw-2-1', name: '排定出貨順序與通知', description: '排定貨櫃出貨順序表格予生産部，通知貨櫃進出順序，彙整每貨櫃出貨成品及貼麥頭' },
          { id: 'sw-2-2', name: '防恐作業與拍照上傳', description: '執行貨櫃八大項目檢查（防恐作業），成品裝卸後拍照上傳群組，確保出貨合規' },
        ]
      },
      {
        id: 'sw-3',
        category: '拆櫃與設備操作',
        items: [
          { id: 'sw-3-1', name: '進口原物料拆櫃與拍照', description: '執行進口原物料拆櫃作業，拍照上傳留存紀錄，確認品項與數量正確' },
          { id: 'sw-3-2', name: '堆高機操作與環境清潔', description: '操作堆高機進行物料搬運，維持倉儲環境清潔，配合年度物料盤點作業' },
        ]
      },
    ]
  },
  '副組長': {
    category: '製造課',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'sg-1',
        category: '生産作業監督',
        items: [
          { id: 'sg-1-1', name: '協助組長指揮執行', description: '協助組長指揮班長及組員落實每日產量目標，在組長不在位時代理其職務，確保生産不中斷' },
          { id: 'sg-1-2', name: '生産數據核實', description: '每兩小時抽查各組白板填寫之數據與實際產出是否相符，確保管理數據真實性，防止虛報' },
        ]
      },
      {
        id: 'sg-2',
        category: 'SOP稽核與技術指導',
        items: [
          { id: 'sg-2-1', name: '走動式管理執行', description: '落實走動式管理，針對各站點執行標準作業書及首件檢查進行抽查，確認SOP落實' },
          { id: 'sg-2-2', name: '技術指導', description: '即時給予操作人員技術指導，協助解決製程技術問題，提升班組操作能力' },
        ]
      },
      {
        id: 'sg-3',
        category: '現場紀律與品質管理',
        items: [
          { id: 'sg-3-1', name: '現場紀律監控', description: '稽核員工及班長離崗是否確實填寫離崗登記簿，針對累犯者彙整名單交予組長報請懲處' },
          { id: 'sg-3-2', name: '品質自主檢查督導', description: '督導班員落實品質自主檢查，確保首件樣品與檢驗紀錄正確擺放於指定區域，維護品質水準' },
          { id: 'sg-3-3', name: '5S與安全環境維護', description: '監督現場整理整頓，特別針對消防栓、滅火器、配電盤前之淨空進行每日巡視，確保作業安全' },
        ]
      },
      {
        id: 'sg-4',
        category: '物料損耗管控與人員培訓',
        items: [
          { id: 'sg-4-1', name: '物料損耗管控', description: '監督領料與機台操作，防止因作業疏失導致的材料浪費或設備損壞，控制物料損耗率' },
          { id: 'sg-4-2', name: '人員教育訓練協助', description: '協助組長對新進員工進行技術培訓，記錄SOP答詢狀況，確保新進人員達到作業標準' },
        ]
      },
    ]
  },
  '組長': {
    category: '製造課',
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
          { id: 'gl-2-1', name: '生產環境管理及安全維護', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理，並執行工安相關規範確保生產環境安全' },
          { id: 'gl-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'gl-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
        ]
      },
    ]
  },
  '加工組組長': {
    category: '製造課',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'mfg-mg-1',
        category: '模具製造',
        items: [
          { id: 'mfg-mg-1-1', name: '規劃製造程序', description: '依模具圖面規劃各零件製造程序，確認加工順序、所需機具及工時' },
          { id: 'mfg-mg-1-2', name: '確認模具材料', description: '依圖面確認模具材料規格與材質，進行備料確認與管控' },
          { id: 'mfg-mg-1-3', name: '選擇及安排各類加工機具', description: '依製程需求選擇適切加工機具，安排機台使用並設定加工參數' },
          { id: 'mfg-mg-1-4', name: '進行加工', description: '操作各類機具設備執行模具零件加工，確認加工品質符合圖面規格' },
          { id: 'mfg-mg-1-5', name: '工件量測', description: '使用量具量測工件尺寸，確認加工精度符合設計要求，識別並處理超差件' },
        ]
      },
      {
        id: 'mfg-mg-2',
        category: '模具裝配組立',
        items: [
          { id: 'mfg-mg-2-1', name: '模具組裝與檢測', description: '依組立圖完成模具各零件組裝，進行功能確認及精度檢測，確認模具可正常使用' },
        ]
      },
      {
        id: 'mfg-mg-3',
        category: '銲接作業',
        items: [
          { id: 'mfg-mg-3-1', name: '準備銲接器機具及材料', description: '依作業需求準備銲接設備、銲接材料及防護具，確認設備功能正常' },
          { id: 'mfg-mg-3-2', name: '銲接前處理作業', description: '對銲接件進行清潔、去除氧化層及定位固定等前處理作業，確保銲接品質' },
          { id: 'mfg-mg-3-3', name: '執行銲接施工', description: '依施工規範執行銲接作業，控制銲接參數確保銲道品質符合規格' },
          { id: 'mfg-mg-3-4', name: '清潔銲道及檢驗', description: '完成銲接後清潔銲道，目視及量測檢查銲道外觀，確認無裂縫、氣孔等缺陷' },
        ]
      },
      {
        id: 'mfg-mg-4',
        category: '保養及簡易故障排除',
        items: [
          { id: 'mfg-mg-4-1', name: '日常基本保養', description: '依保養規範執行機具設備及模具日常清潔保養，完成保養紀錄' },
          { id: 'mfg-mg-4-2', name: '簡易故障排除', description: '識別機具設備及銲接器具常見故障，執行簡易故障排除，無法排除時回報並請求支援' },
        ]
      },
    ]
  },
  '沖床組組長': {
    category: '製造課',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'mfg-press-1',
        category: '成品及模具圖面的識別與判讀',
        items: [
          { id: 'mfg-press-1-1', name: '成品圖識別', description: '依成品圖識別成品外形、尺寸、公差及表面織構符號，確認成品加工需求' },
          { id: 'mfg-press-1-2', name: '模具組立圖判讀', description: '判讀沖壓模具組立圖，了解模具各零件組成關係與功能' },
          { id: 'mfg-press-1-3', name: '確認材料規格', description: '依圖面確認所需材料規格、材質及數量，作為備料與加工依據' },
        ]
      },
      {
        id: 'mfg-press-2',
        category: '模具加工、組裝及檢測',
        items: [
          { id: 'mfg-press-2-1', name: '加工程序規劃', description: '依模具圖面規劃各零件加工程序，確認加工順序與機具設備需求' },
          { id: 'mfg-press-2-2', name: '模板及相關零件製作', description: '操作機具設備製作模板及各類模具零件，確保尺寸精度符合圖面規格' },
          { id: 'mfg-press-2-3', name: '模具零件尺度量測', description: '使用量具量測模具零件尺度，確認加工精度符合設計要求' },
          { id: 'mfg-press-2-4', name: '模具組裝', description: '依組立圖完成模具各零件組裝，確認各機構動作正確、間隙符合規格' },
          { id: 'mfg-press-2-5', name: '功能檢測', description: '完成模具組裝後進行功能確認，檢查沖切動作、間隙及模具各機構是否正常運作' },
        ]
      },
      {
        id: 'mfg-press-3',
        category: '雷射切割作業',
        items: [
          { id: 'mfg-press-3-1', name: '雷射切割圖樣及材料表檢查', description: '核對雷射切割工作圖及材料表，確認加工尺寸、材質及數量正確' },
          { id: 'mfg-press-3-2', name: '切割機台模擬測試與定位', description: '操作雷射切割機台進行切割路徑模擬測試及機台定位，確認程式無誤後方可正式切割' },
          { id: 'mfg-press-3-3', name: '雷射切割製程操作', description: '依作業規範操作雷射切割機台執行打樣及正式切割製程，監控切割品質並完成生產紀錄' },
        ]
      },
      {
        id: 'mfg-press-4',
        category: '試模及機具與模具保養',
        items: [
          { id: 'mfg-press-4-1', name: '沖床使用及試模', description: '操作沖床設備進行模具試模，確認沖壓成品外觀及尺寸符合規格，排除試模異常' },
          { id: 'mfg-press-4-2', name: '模具維護', description: '依維護規範拆解、清潔、研磨及潤滑模具，確保模具精度與使用壽命' },
          { id: 'mfg-press-4-3', name: '機具設備及量具維護', description: '依保養規範執行機具設備及量具日常清潔保養，完成保養紀錄並回報異常' },
          { id: 'mfg-press-4-4', name: '切割機台保養與異常維修', description: '依保養計畫執行雷射切割機台定期保養，識別異常狀況並執行簡易維修或回報' },
        ]
      },
    ]
  },
  '塗裝組組長': {
    category: '製造課',
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
          { id: 'mfg-paint-2-1', name: '生產環境管理及安全維護', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理，並執行工安相關規範確保生產環境安全' },
          { id: 'mfg-paint-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'mfg-paint-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
        ]
      },
    ]
  },
  '組立組組長': {
    category: '製造課',
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
          { id: 'mfg-asm-2-1', name: '生產環境管理及安全維護', description: '依組織規範督導現場人員清理並維護工作區域，進行廢棄物分類與回收管理，並執行工安相關規範確保生產環境安全' },
          { id: 'mfg-asm-2-2', name: '管理零組件', description: '依生產計畫及組織規範設定零組件安全庫存量，督導盤點庫存數量及領料作業' },
          { id: 'mfg-asm-2-3', name: '管理機具設備及維護', description: '依設備操作手冊及保養手冊，執行或督導機具設備日常清潔保養與定期維護，確認故障原因並排除，完成相關紀錄' },
        ]
      },
    ]
  },
  '品保課課長': {
    category: '品保課',
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
          { id: 'qm-2-2', name: '製程品質控管', description: '執行製程中品質管控，確保在製品符合品質標準，識別並處理製程異常' },
          { id: 'qm-2-3', name: '確保成品品質', description: '執行成品品質檢驗與測試，確認出貨品質符合客戶規範與內部標準' },
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
          { id: 'qm-4-5', name: '執行成品品質趨勢分析及管理改善', description: '定期分析成品品質趨勢，針對反覆發生的異常制定管理改善計畫並追蹤執行' },
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
    category: '品保課',
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
          { id: 'qm3-2-2', name: '製程品質控管', description: '執行製程中品質管控，確保在製品符合品質標準，識別並處理製程異常' },
          { id: 'qm3-2-3', name: '確保成品品質', description: '執行成品品質檢驗與測試，確認出貨品質符合客戶規範與內部標準' },
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
          { id: 'qm3-4-5', name: '執行成品品質趨勢分析及管理改善', description: '定期分析成品品質趨勢，針對反覆發生的異常制定管理改善計畫並追蹤執行' },
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
    category: '總務課',
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
    category: '總務課',
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
    category: '總務課',
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
    category: '總務課',
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
    category: '總務課',
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
    category: '總務課',
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
    category: '總務課',
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
    category: '總務課',
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
    category: '總務課',
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
    category: '業務課',
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
    category: '業務課',
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
    category: '研發課',
    level: '部門主管',
    requiredLevel: 3,
    competencies: [
      {
        id: 'rd-1',
        category: '研發計畫管理',
        items: [
          { id: 'rd-1-1', name: '研擬及執行產品研發計畫', description: '研擬及執行產品研發計畫，協調開發進度與技術，確保產品開發按時完成並符合品質目標' },
          { id: 'rd-1-2', name: '推動新產品樣品試作', description: '研擬及執行推動新產品之樣品試作，督導客戶產品初期試驗，並追蹤試作結果與問題改善' },
        ]
      },
      {
        id: 'rd-2',
        category: '技術督導與設計管理',
        items: [
          { id: 'rd-2-1', name: '產品圖面與說明書督導', description: '督導產品圖面、說明書之繪製與修訂，確保圖面正確性及製作可行性' },
          { id: 'rd-2-2', name: '研發技術蒐集與掌握', description: '執行各項研發技術之蒐集及掌握，督導客戶圖面資料轉換，確保技術能力與時俱進' },
          { id: 'rd-2-3', name: 'BOM製作與材料管理督導', description: '督導材料規格之認定與承認及BOM之製作與管理，確保物料清單正確完整' },
        ]
      },
      {
        id: 'rd-3',
        category: '供應商與成本管理',
        items: [
          { id: 'rd-3-1', name: '新產品供應商議價督導', description: '督導新產品供應商報價議價及模具開模事項，執行請款作業督導，控管開發成本' },
          { id: 'rd-3-2', name: '預算管理', description: '執行模具及材料成本加工製作費用分析，管理研發部門預算，確保開發成本合理' },
        ]
      },
      {
        id: 'rd-4',
        category: '研發文件與稽核管理',
        items: [
          { id: 'rd-4-1', name: '研發圖面發行與設計變更管理', description: '督導研發圖面發行及設計變更處理，確保文件保存完整，工作SOP的制定與維護' },
          { id: 'rd-4-2', name: '配合稽核', description: '配合內外部稽核（含內控缺失改善），擬定工作目標與組織目標達成具一致性' },
        ]
      },
      {
        id: 'rd-5',
        category: '人員管理與跨部門協調',
        items: [
          { id: 'rd-5-1', name: '人員績效管理', description: '執行人員溝通與績效管理，包含出勤管理、績效考核、訓練等，培育研發人才' },
          { id: 'rd-5-2', name: '跨部門會議協調', description: '主導或參與跨部門例行會議及專案會議，協調製造、品保等部門確保研發成果順利移轉' },
        ]
      },
    ]
  },
  '研發課副課長': {
    category: '研發課',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'rd3-1',
        category: '產品開發技術執行',
        items: [
          { id: 'rd3-1-1', name: '訂定並執行產品研發計畫', description: '訂定產品研發計畫，協調開發進度與技術，執行完成產品開發，確保開發如期完成' },
          { id: 'rd3-1-2', name: '產品圖面繪製與修訂', description: '執行產品圖面與說明書之繪製與修訂，確認圖面正確性及未來產品製作可行性' },
          { id: 'rd3-1-3', name: '各項研發技術蒐集', description: '主動蒐集並掌握最新研發技術，執行客戶圖面資料轉換' },
        ]
      },
      {
        id: 'rd3-2',
        category: '圖面與文件管理',
        items: [
          { id: 'rd3-2-1', name: '材料規格認定與BOM管理', description: '執行對材料規格的認定與承認，負責BOM的製作與管理，確保物料清單正確完整' },
          { id: 'rd3-2-2', name: '研發圖面發行與設計變更處理', description: '執行研發圖面發行及設計變更處理，負責文件保存，確保版本管控正確' },
          { id: 'rd3-2-3', name: 'ISO及內控文件管理', description: '配合公司ISO及內控文件管理要求，確保研發相關文件符合管理系統規範' },
        ]
      },
      {
        id: 'rd3-3',
        category: '新產品試驗',
        items: [
          { id: 'rd3-3-1', name: '推動新產品樣品試作', description: '執行推動新產品之樣品試作，記錄試作結果，提出改善建議' },
          { id: 'rd3-3-2', name: '客戶產品初期試驗', description: '執行客戶產品初期試驗，確認產品符合客戶規格，提供試驗結果報告' },
        ]
      },
      {
        id: 'rd3-4',
        category: '電腦輔助設計',
        items: [
          { id: 'rd3-4-1', name: 'CAD繪圖', description: '熟練使用Inventor、Solid Edge、AutoCad等繪圖軟體完成工程圖繪製，確保圖面符合製造需求' },
          { id: 'rd3-4-2', name: '機構設計能力', description: '具備機構設計能力，能進行結構設計分析與可行性評估，解決設計問題' },
        ]
      },
    ]
  },
  '研發工程師': {
    category: '研發課',
    level: '專業人員',
    requiredLevel: 3,
    competencies: [
      {
        id: 're-1',
        category: '判讀及評估成品圖',
        items: [
          { id: 're-1-1', name: '判讀成品圖', description: '依成品圖進行成品開發的判讀及規劃，正確理解成品公差、配合及表面織構符號，依樣品或成品圖評估成品開發可行性' },
          { id: 're-1-2', name: '成品開發評估', description: '依據成品規格、材質及數量評估模具壽命，進行成品開發或專案的成本評估，提出設計變更建議方案並撰寫可行性評估報告' },
        ]
      },
      {
        id: 're-2',
        category: '規劃模具工序',
        items: [
          { id: 're-2-1', name: '開模檢討', description: '依成品特性分析規劃模具工程順序，依模具種類及成品大小選擇鍛造設備種類及機型，評估需求之模具及零件型式，進行開模檢討' },
          { id: 're-2-2', name: '規劃量測', description: '確認成品機械性質及金相組織的內容項目，依成品鍛造品質及機械性能要求列出量測儀器清單' },
        ]
      },
      {
        id: 're-3',
        category: '設計及繪製模具結構',
        items: [
          { id: 're-3-1', name: '設計及規劃模具配置', description: '確定成品模穴置放在模具中的位置，進行分模面、排溢系統細部分析和設計，計算成品之材積及模擬，確認填料、溢料、排氣及頂出位置的配置' },
          { id: 're-3-2', name: '選用模座及零配件', description: '依模具需求選擇適切模座及頂出機構，選擇導向零配件及固定用零配件，選用模具加熱裝置，進行夾治具的規劃與設計' },
          { id: 're-3-3', name: '設計模具及繪製工程圖', description: '進行設備行程和力學設計，確認模具加熱設計，核對模具和鍛造機座的相關尺寸，繪製3D模具工程圖，進行模具機構模擬及塑性分析' },
        ]
      },
      {
        id: 're-4',
        category: '繪製模具零件加工圖及出圖',
        items: [
          { id: 're-4-1', name: '製作模具BOM表', description: '依模具結構設計及熱處理要求標示零件材質、規格數量及編號，製作模具BOM表，統計自製零件與外購零件規格及數量' },
          { id: 're-4-2', name: '繪製模具零件加工圖及出圖', description: '完成零件加工圖繪製及出圖，繪製成品工序圖、模具組立結構圖及出圖，進行鍛造成型模擬操作' },
        ]
      },
      {
        id: 're-5',
        category: '協助試模及量產作業',
        items: [
          { id: 're-5-1', name: '試模結果及問題分析', description: '依試模成品外觀尺寸的變化判斷模具穩定成形狀況，識別試模問題並提出模具製造、設計及工程規劃之改善對策，撰寫試模報告書' },
          { id: 're-5-2', name: '取樣及量測分析', description: '與模具製造及生產單位進行鍛造缺陷溝通協調並修正改善，配合品保部門進行取樣及機械性能量測' },
          { id: 're-5-3', name: '協助量產作業', description: '建立標準作業程序書提供生產單位執行，協助生產單位進行模具故障排除，協助進行模具成型可靠度分析' },
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
  '財務出納': {
    category: '財務部',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'fo-1',
        category: '憑證與帳務處理',
        items: [
          { id: 'fo-1-1', name: '收發憑證與製作傳票', description: '收發、記錄及彙整交易產生之原始憑證，登錄至會計系統製作傳票，負責總分類帳及帳冊記錄、登載、核算及保管' },
          { id: 'fo-1-2', name: '應付應收帳務處理', description: '處理廠商貨款或費用等應付款項帳務，處理客戶應收款項帳務及其他一般會計帳務' },
        ]
      },
      {
        id: 'fo-2',
        category: '現金與銀行作業',
        items: [
          { id: 'fo-2-1', name: '銀行現金作業', description: '協助辦理銀行現金存、提款、匯款轉帳，執行一般現金收付作業，核對儲存現金與記錄是否相符' },
          { id: 'fo-2-2', name: '零用金管理', description: '管理零用金異動及撥補作業，確保零用金帳務正確' },
        ]
      },
      {
        id: 'fo-3',
        category: '開票與報表製作',
        items: [
          { id: 'fo-3-1', name: '開票與電子支付', description: '完成例行付款開票及電子支付作業，估算L/C、長短期借款、CP等應付利息，辦理簡易出納會計及銀行往來事務' },
          { id: 'fo-3-2', name: '出納報表製作', description: '製作出納科目餘額表、收款日報表、利息收入調節表、銀行存款收支日報表、銀行往來授信明細表等' },
        ]
      },
    ]
  },
  '財務組組長': {
    category: '財務部',
    level: '基層主管',
    requiredLevel: 2,
    competencies: [
      {
        id: 'fm-1',
        category: '成本會計管理',
        items: [
          { id: 'fm-1-1', name: '成本結轉流程建立', description: '規劃、建立與維護成本結轉流程，審核料品進耗存流程及相關單據，確保成本流程正確合規' },
          { id: 'fm-1-2', name: '成本差異分析', description: '應用各種方法比較各種成本，進行差異分析（實際成本、標準成本、預估成本），找出差異原因並提出改善建議' },
        ]
      },
      {
        id: 'fm-2',
        category: '成本核算與報表',
        items: [
          { id: 'fm-2-1', name: '成本表編製', description: '分攤材料、人工、製造費用等，完成相關成本表，完成例行成本結算與各項成本分析報表編製' },
          { id: 'fm-2-2', name: '單位成本核算', description: '核算及分析產品單位成本，管理公司資產保障資產安全，妥善保存帳冊以備稽核查核' },
        ]
      },
      {
        id: 'fm-3',
        category: '帳務複核',
        items: [
          { id: 'fm-3-1', name: '費用帳務複核', description: '複核有關各項費用支付之發票、單據及帳務處理，確保帳務正確性' },
          { id: 'fm-3-2', name: '應付帳款複核', description: '複核廠商貨款等應付款項帳務，協助各項作業流程改善及內控流程規劃及掌握' },
        ]
      },
      {
        id: 'fm-4',
        category: '存貨與稽核配合',
        items: [
          { id: 'fm-4-1', name: '存貨庫齡分析與盤點', description: '分析存貨庫齡與盤點，識別滯料風險，提供管理決策依據' },
          { id: 'fm-4-2', name: '配合稽核查核', description: '配合會計師、稅捐機關等查核，協助提供相關資料，確保合規無虞' },
        ]
      },
    ]
  },
  '研發助理': {
    category: '研發課',
    level: '基層執行',
    requiredLevel: 2,
    competencies: [
      {
        id: 'rda-1',
        category: 'BOM與材料規格管理',
        items: [
          { id: 'rda-1-1', name: 'BOM表編列與管理', description: '完成材料表、BOM表編列，對材料規格進行認定及承認，維護BOM的正確性與完整性' },
          { id: 'rda-1-2', name: '客戶圖面資料轉換', description: '執行客戶圖面資料轉換，協助訂定產品研發計畫並協調開發進度，協助新產品樣品試作及客戶初期試驗' },
        ]
      },
      {
        id: 'rda-2',
        category: '文件發行與歸檔',
        items: [
          { id: 'rda-2-1', name: '研發圖面發行與設計變更', description: '執行研發圖面發行及設計變更處理，管理文件保存，確保版本控管正確，執行文件分發與歸檔' },
          { id: 'rda-2-2', name: '產品說明書繪製與修訂', description: '協助產品圖面、說明書之繪製與修訂，確保圖面正確性，蒐集各項研發技術資訊' },
        ]
      },
      {
        id: 'rda-3',
        category: 'ISO內控文件管理',
        items: [
          { id: 'rda-3-1', name: '公司ISO及內控文件管理', description: '執行公司ISO及內控文件管理，確保研發相關文件符合管理系統規範，定期更新並維護文件系統' },
        ]
      },
      {
        id: 'rda-4',
        category: '請款與ERP操作',
        items: [
          { id: 'rda-4-1', name: '供應商請款作業', description: '執行新產品供應商報價議價及模具開模請款作業，確保請款流程合規正確' },
          { id: 'rda-4-2', name: 'ERP系統操作', description: '熟練操作鼎新ERP系統研發作業模組，完成各項資料登錄、查詢及相關作業' },
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
