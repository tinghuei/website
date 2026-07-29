import { getDb } from "./db";
import { jobPositions, competencies, positionCompetencies } from "../drizzle/schema";

// 定義所有職位
const POSITIONS = [
  { name: "廠務經理", department: "廠務部" },
  { name: "廠務副理", department: "廠務部" },
  { name: "設備工程師", department: "廠務部" },
  { name: "廠務助理", department: "廠務部" },
  { name: "製造課長", department: "製造部" },
  { name: "製造副課長", department: "製造部" },
  { name: "資材課長", department: "資材部" },
  { name: "資材副課長", department: "資材部" },
  { name: "採購助理", department: "資材部" },
  { name: "採購專員", department: "資材部" },
  { name: "生管", department: "製造部" },
  { name: "物管", department: "製造部" },
  { name: "成倉", department: "製造部" },
  { name: "技術員", department: "製造部" },
  { name: "班長", department: "製造部" },
  { name: "副組長", department: "製造部" },
  { name: "組長", department: "製造部" },
  { name: "品保課課長", department: "品質部" },
  { name: "品保課副課長", department: "品質部" },
  { name: "品檢員", department: "品質部" },
  { name: "總務課課長", department: "總務部" },
  { name: "總務課副課長", department: "總務部" },
  { name: "總務專員", department: "總務部" },
  { name: "總務助理", department: "總務部" },
  { name: "人資助理", department: "總務部" },
  { name: "人資專員", department: "總務部" },
  { name: "庶務組長", department: "總務部" },
  { name: "庶務員", department: "總務部" },
  { name: "清潔員", department: "總務部" },
  { name: "業務課組長", department: "業務部" },
  { name: "業務助理", department: "業務部" },
  { name: "業務專員", department: "業務部" },
  { name: "研發課課長", department: "研發部" },
  { name: "研發課副課長", department: "研發部" },
  { name: "研發工程師", department: "研發部" },
  { name: "文官中心", department: "營運中心" },
  { name: "營業部經理", department: "營業部" },
  { name: "總經理室秘書", department: "營運中心" },
];

// 定義 iCAP 職能（基於金屬製造業標準）
const COMPETENCIES = [
  { name: "機械設備操作", category: "技術能力", description: "能夠安全操作和維護機械設備" },
  { name: "品質管理", category: "技術能力", description: "能夠進行品質檢驗和控制" },
  { name: "生產計畫", category: "技術能力", description: "能夠制定和執行生產計畫" },
  { name: "成本控制", category: "技術能力", description: "能夠控制生產成本" },
  { name: "安全管理", category: "技術能力", description: "能夠確保工作場所安全" },
  { name: "溝通協調", category: "軟技能", description: "能夠有效溝通和協調團隊" },
  { name: "領導能力", category: "軟技能", description: "能夠領導和激勵團隊" },
  { name: "問題解決", category: "軟技能", description: "能夠分析和解決問題" },
  { name: "時間管理", category: "軟技能", description: "能夠有效管理時間和資源" },
  { name: "客戶服務", category: "軟技能", description: "能夠提供優質的客戶服務" },
  { name: "技術文檔", category: "技術能力", description: "能夠編寫和理解技術文檔" },
  { name: "數據分析", category: "技術能力", description: "能夠分析生產和品質數據" },
  { name: "採購管理", category: "技術能力", description: "能夠進行採購和供應鏈管理" },
  { name: "人力資源管理", category: "軟技能", description: "能夠進行人力資源管理和培訓" },
  { name: "財務管理", category: "技術能力", description: "能夠進行財務管理和預算控制" },
];

// 定義職位職能要求（職位 ID -> 職能 ID 列表）
const POSITION_COMPETENCIES: Record<string, { competencyName: string; requiredLevel: number; importance: string }[]> = {
  "廠務經理": [
    { competencyName: "領導能力", requiredLevel: 4, importance: "high" },
    { competencyName: "安全管理", requiredLevel: 4, importance: "high" },
    { competencyName: "成本控制", requiredLevel: 4, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 4, importance: "high" },
    { competencyName: "問題解決", requiredLevel: 3, importance: "medium" },
  ],
  "廠務副理": [
    { competencyName: "領導能力", requiredLevel: 3, importance: "high" },
    { competencyName: "安全管理", requiredLevel: 4, importance: "high" },
    { competencyName: "成本控制", requiredLevel: 3, importance: "medium" },
    { competencyName: "溝通協調", requiredLevel: 3, importance: "medium" },
  ],
  "設備工程師": [
    { competencyName: "機械設備操作", requiredLevel: 4, importance: "high" },
    { competencyName: "技術文檔", requiredLevel: 3, importance: "high" },
    { competencyName: "問題解決", requiredLevel: 4, importance: "high" },
    { competencyName: "安全管理", requiredLevel: 3, importance: "medium" },
  ],
  "廠務助理": [
    { competencyName: "安全管理", requiredLevel: 3, importance: "high" },
    { competencyName: "機械設備操作", requiredLevel: 2, importance: "medium" },
    { competencyName: "溝通協調", requiredLevel: 2, importance: "low" },
  ],
  "製造課長": [
    { competencyName: "領導能力", requiredLevel: 4, importance: "high" },
    { competencyName: "生產計畫", requiredLevel: 4, importance: "high" },
    { competencyName: "品質管理", requiredLevel: 3, importance: "high" },
    { competencyName: "成本控制", requiredLevel: 3, importance: "medium" },
    { competencyName: "安全管理", requiredLevel: 4, importance: "high" },
  ],
  "製造副課長": [
    { competencyName: "領導能力", requiredLevel: 3, importance: "high" },
    { competencyName: "生產計畫", requiredLevel: 3, importance: "high" },
    { competencyName: "品質管理", requiredLevel: 3, importance: "medium" },
    { competencyName: "安全管理", requiredLevel: 3, importance: "high" },
  ],
  "資材課長": [
    { competencyName: "採購管理", requiredLevel: 4, importance: "high" },
    { competencyName: "領導能力", requiredLevel: 3, importance: "high" },
    { competencyName: "成本控制", requiredLevel: 4, importance: "high" },
    { competencyName: "數據分析", requiredLevel: 3, importance: "medium" },
  ],
  "資材副課長": [
    { competencyName: "採購管理", requiredLevel: 3, importance: "high" },
    { competencyName: "成本控制", requiredLevel: 3, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 3, importance: "medium" },
  ],
  "採購助理": [
    { competencyName: "採購管理", requiredLevel: 2, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 2, importance: "medium" },
    { competencyName: "時間管理", requiredLevel: 2, importance: "medium" },
  ],
  "採購專員": [
    { competencyName: "採購管理", requiredLevel: 3, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 3, importance: "high" },
    { competencyName: "成本控制", requiredLevel: 3, importance: "medium" },
  ],
  "生管": [
    { competencyName: "生產計畫", requiredLevel: 3, importance: "high" },
    { competencyName: "數據分析", requiredLevel: 3, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 2, importance: "medium" },
  ],
  "物管": [
    { competencyName: "採購管理", requiredLevel: 2, importance: "high" },
    { competencyName: "時間管理", requiredLevel: 3, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 2, importance: "medium" },
  ],
  "成倉": [
    { competencyName: "時間管理", requiredLevel: 3, importance: "high" },
    { competencyName: "安全管理", requiredLevel: 2, importance: "medium" },
    { competencyName: "溝通協調", requiredLevel: 2, importance: "low" },
  ],
  "技術員": [
    { competencyName: "機械設備操作", requiredLevel: 3, importance: "high" },
    { competencyName: "品質管理", requiredLevel: 2, importance: "medium" },
    { competencyName: "安全管理", requiredLevel: 3, importance: "high" },
  ],
  "班長": [
    { competencyName: "領導能力", requiredLevel: 3, importance: "high" },
    { competencyName: "機械設備操作", requiredLevel: 3, importance: "high" },
    { competencyName: "安全管理", requiredLevel: 3, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 3, importance: "medium" },
  ],
  "副組長": [
    { competencyName: "領導能力", requiredLevel: 2, importance: "medium" },
    { competencyName: "機械設備操作", requiredLevel: 3, importance: "high" },
    { competencyName: "安全管理", requiredLevel: 3, importance: "high" },
  ],
  "組長": [
    { competencyName: "領導能力", requiredLevel: 3, importance: "high" },
    { competencyName: "機械設備操作", requiredLevel: 4, importance: "high" },
    { competencyName: "安全管理", requiredLevel: 4, importance: "high" },
    { competencyName: "品質管理", requiredLevel: 3, importance: "medium" },
  ],
  "品保課課長": [
    { competencyName: "品質管理", requiredLevel: 4, importance: "high" },
    { competencyName: "領導能力", requiredLevel: 3, importance: "high" },
    { competencyName: "數據分析", requiredLevel: 3, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 3, importance: "medium" },
  ],
  "品保課副課長": [
    { competencyName: "品質管理", requiredLevel: 3, importance: "high" },
    { competencyName: "數據分析", requiredLevel: 3, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 2, importance: "medium" },
  ],
  "品檢員": [
    { competencyName: "品質管理", requiredLevel: 3, importance: "high" },
    { competencyName: "技術文檔", requiredLevel: 2, importance: "medium" },
    { competencyName: "安全管理", requiredLevel: 2, importance: "medium" },
  ],
  "總務課課長": [
    { competencyName: "人力資源管理", requiredLevel: 4, importance: "high" },
    { competencyName: "領導能力", requiredLevel: 3, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 4, importance: "high" },
    { competencyName: "財務管理", requiredLevel: 3, importance: "medium" },
  ],
  "總務課副課長": [
    { competencyName: "人力資源管理", requiredLevel: 3, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 3, importance: "high" },
    { competencyName: "財務管理", requiredLevel: 2, importance: "medium" },
  ],
  "總務專員": [
    { competencyName: "人力資源管理", requiredLevel: 2, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 3, importance: "high" },
    { competencyName: "時間管理", requiredLevel: 2, importance: "medium" },
  ],
  "總務助理": [
    { competencyName: "溝通協調", requiredLevel: 2, importance: "high" },
    { competencyName: "時間管理", requiredLevel: 2, importance: "medium" },
  ],
  "人資助理": [
    { competencyName: "人力資源管理", requiredLevel: 2, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 2, importance: "high" },
  ],
  "人資專員": [
    { competencyName: "人力資源管理", requiredLevel: 3, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 3, importance: "high" },
    { competencyName: "時間管理", requiredLevel: 2, importance: "medium" },
  ],
  "庶務組長": [
    { competencyName: "領導能力", requiredLevel: 2, importance: "medium" },
    { competencyName: "溝通協調", requiredLevel: 2, importance: "medium" },
    { competencyName: "時間管理", requiredLevel: 3, importance: "high" },
  ],
  "庶務員": [
    { competencyName: "時間管理", requiredLevel: 2, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 2, importance: "medium" },
  ],
  "清潔員": [
    { competencyName: "安全管理", requiredLevel: 2, importance: "high" },
    { competencyName: "時間管理", requiredLevel: 2, importance: "medium" },
  ],
  "業務課組長": [
    { competencyName: "領導能力", requiredLevel: 3, importance: "high" },
    { competencyName: "客戶服務", requiredLevel: 4, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 4, importance: "high" },
    { competencyName: "成本控制", requiredLevel: 2, importance: "medium" },
  ],
  "業務助理": [
    { competencyName: "客戶服務", requiredLevel: 3, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 3, importance: "high" },
    { competencyName: "時間管理", requiredLevel: 2, importance: "medium" },
  ],
  "業務專員": [
    { competencyName: "客戶服務", requiredLevel: 4, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 4, importance: "high" },
    { competencyName: "問題解決", requiredLevel: 3, importance: "medium" },
  ],
  "研發課課長": [
    { competencyName: "領導能力", requiredLevel: 4, importance: "high" },
    { competencyName: "技術文檔", requiredLevel: 4, importance: "high" },
    { competencyName: "問題解決", requiredLevel: 4, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 3, importance: "medium" },
  ],
  "研發課副課長": [
    { competencyName: "技術文檔", requiredLevel: 3, importance: "high" },
    { competencyName: "問題解決", requiredLevel: 3, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 3, importance: "medium" },
  ],
  "研發工程師": [
    { competencyName: "技術文檔", requiredLevel: 4, importance: "high" },
    { competencyName: "問題解決", requiredLevel: 4, importance: "high" },
    { competencyName: "數據分析", requiredLevel: 3, importance: "high" },
  ],
  "文官中心": [
    { competencyName: "溝通協調", requiredLevel: 3, importance: "high" },
    { competencyName: "時間管理", requiredLevel: 3, importance: "high" },
    { competencyName: "客戶服務", requiredLevel: 3, importance: "medium" },
  ],
  "營業部經理": [
    { competencyName: "領導能力", requiredLevel: 4, importance: "high" },
    { competencyName: "客戶服務", requiredLevel: 4, importance: "high" },
    { competencyName: "成本控制", requiredLevel: 4, importance: "high" },
    { competencyName: "溝通協調", requiredLevel: 4, importance: "high" },
  ],
  "總經理室秘書": [
    { competencyName: "溝通協調", requiredLevel: 3, importance: "high" },
    { competencyName: "時間管理", requiredLevel: 4, importance: "high" },
    { competencyName: "客戶服務", requiredLevel: 3, importance: "high" },
    { competencyName: "財務管理", requiredLevel: 2, importance: "medium" },
  ],
};

export async function initializeData() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return false;
  }

  try {
    console.log("開始初始化職位和職能數據...");

    // 1. 插入職能
    console.log("插入職能...");
    const competencyMap: Record<string, number> = {};
    for (const comp of COMPETENCIES) {
      const result = await db.insert(competencies).values(comp);
      // 獲取插入的 ID（假設返回 insertId）
      console.log(`已插入職能: ${comp.name}`);
    }

    // 重新查詢所有職能以獲取 ID
    const allCompetencies = await db.select().from(competencies);
    for (const comp of allCompetencies) {
      competencyMap[comp.name] = comp.id;
    }

    // 2. 插入職位
    console.log("插入職位...");
    const positionMap: Record<string, number> = {};
    for (const pos of POSITIONS) {
      const result = await db.insert(jobPositions).values(pos);
      console.log(`已插入職位: ${pos.name}`);
    }

    // 重新查詢所有職位以獲取 ID
    const allPositions = await db.select().from(jobPositions);
    for (const pos of allPositions) {
      positionMap[pos.name] = pos.id;
    }

    // 3. 插入職位職能要求
    console.log("插入職位職能要求...");
    for (const [positionName, competencyRequirements] of Object.entries(POSITION_COMPETENCIES)) {
      const positionId = positionMap[positionName];
      if (!positionId) {
        console.warn(`找不到職位: ${positionName}`);
        continue;
      }

      for (const req of competencyRequirements) {
        const competencyId = competencyMap[req.competencyName];
        if (!competencyId) {
          console.warn(`找不到職能: ${req.competencyName}`);
          continue;
        }

        await db.insert(positionCompetencies).values({
          positionId,
          competencyId,
          requiredLevel: req.requiredLevel,
          importance: req.importance,
        });
      }
      console.log(`已為職位 ${positionName} 添加職能要求`);
    }

    console.log("✓ 初始化完成！");
    return true;
  } catch (error) {
    console.error("初始化失敗:", error);
    return false;
  }
}
