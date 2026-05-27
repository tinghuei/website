import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import * as schema from "./drizzle/schema.ts";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const positionsData = [
  // 廠務部
  { name: "廠務經理", department: "廠務部", description: "廠務部門主管，負責廠房管理、設備維護、安全管理" },
  { name: "廠務副理", department: "廠務部", description: "廠務副主管，協助廠務經理管理廠房運營" },
  { name: "廠務助理", department: "廠務部", description: "廠務助理，負責日常廠房維護與管理工作" },
  
  // 設備工程
  { name: "設備工程師", department: "廠務部", description: "設備工程師，負責設備選型、安裝、維護與改善" },
  
  // 製造部
  { name: "製造課長", department: "製造部", description: "製造課程主管，負責生產計畫、品質管理、安全生產" },
  { name: "製造副課長", department: "製造部", description: "製造課程副主管，協助課長管理生產運營" },
  { name: "技術員", department: "製造部", description: "生產技術員，負責機器操作、產品製造" },
  { name: "班長", department: "製造部", description: "班組長，負責班組日常管理與生產協調" },
  { name: "副組長", department: "製造部", description: "班組副長，協助班長管理班組工作" },
  { name: "組長", department: "製造部", description: "組長，負責小組工作協調與質量控制" },
  
  // 資材部
  { name: "資材課長", department: "資材部", description: "資材課程主管，負責物料管理、庫存控制" },
  { name: "資材副課長", department: "資材部", description: "資材課程副主管，協助課長管理物料運營" },
  { name: "生管", department: "資材部", description: "生產管理員，負責生產計畫與物料協調" },
  { name: "物管", department: "資材部", description: "物料管理員，負責物料收發與庫存管理" },
  { name: "成倉", department: "資材部", description: "倉庫管理員，負責成品倉庫管理與出貨" },
  
  // 採購部
  { name: "採購助理", department: "採購部", description: "採購助理，協助採購工作" },
  { name: "採購專員", department: "採購部", description: "採購專員，負責採購計畫與供應商管理" },
  
  // 品質部
  { name: "品保課課長", department: "品質部", description: "品保課程主管，負責品質保證與改善" },
  { name: "品保課副課長", department: "品質部", description: "品保課程副主管，協助課長管理品質工作" },
  { name: "品檢員", department: "品質部", description: "品質檢驗員，負責產品檢驗與品質控制" },
  
  // 總務部
  { name: "總務課課長", department: "總務部", description: "總務課程主管，負責行政管理、人力資源" },
  { name: "總務課副課長", department: "總務部", description: "總務課程副主管，協助課長管理行政工作" },
  { name: "總務專員", department: "總務部", description: "總務專員，負責行政事務管理" },
  { name: "總務助理", department: "總務部", description: "總務助理，協助總務工作" },
  { name: "人資助理", department: "總務部", description: "人資助理，協助人力資源工作" },
  { name: "人資專員", department: "總務部", description: "人資專員，負責招聘、培訓、薪酬管理" },
  { name: "庶務組長", department: "總務部", description: "庶務組長，負責庶務工作協調" },
  { name: "庶務員", department: "總務部", description: "庶務員，負責日常庶務工作" },
  { name: "清潔員", department: "總務部", description: "清潔員，負責環境衛生與清潔工作" },
  
  // 業務部
  { name: "業務課組長", department: "業務部", description: "業務課程組長，負責業務團隊管理" },
  { name: "業務助理", department: "業務部", description: "業務助理，協助業務工作" },
  { name: "業務專員", department: "業務部", description: "業務專員，負責客戶開發與維護" },
  
  // 研發部
  { name: "研發課課長", department: "研發部", description: "研發課程主管，負責產品開發與改善" },
  { name: "研發課副課長", department: "研發部", description: "研發課程副主管，協助課長管理研發工作" },
  { name: "研發工程師", department: "研發部", description: "研發工程師，負責產品設計與開發" },
  
  // 營運
  { name: "營業部經理", department: "營業部", description: "營業部經理，負責營業部門管理與業績目標" },
  { name: "文官中心", department: "文官中心", description: "文官中心，負責文檔管理與行政支持" },
  { name: "總經理室秘書", department: "總經理室", description: "總經理室秘書，負責總經理行政支持" },
];

const competenciesData = [
  // 通用職能
  { name: "溝通協調", category: "通用職能", description: "與他人有效溝通、協調合作的能力" },
  { name: "團隊合作", category: "通用職能", description: "與團隊成員協作、支持他人的能力" },
  { name: "問題解決", category: "通用職能", description: "分析問題、提出解決方案的能力" },
  { name: "持續學習", category: "通用職能", description: "主動學習、適應變化的能力" },
  { name: "時間管理", category: "通用職能", description: "有效規劃與管理時間的能力" },
  
  // 管理職能
  { name: "人員管理", category: "管理職能", description: "招聘、培訓、評估、激勵員工的能力" },
  { name: "計畫與組織", category: "管理職能", description: "制定計畫、組織資源的能力" },
  { name: "決策能力", category: "管理職能", description: "分析信息、做出決策的能力" },
  { name: "領導力", category: "管理職能", description: "激勵他人、帶領團隊的能力" },
  { name: "績效管理", category: "管理職能", description: "設定目標、評估績效的能力" },
  
  // 技術職能
  { name: "機械操作", category: "技術職能", description: "操作工業機械設備的能力" },
  { name: "設備維護", category: "技術職能", description: "設備保養、維修、故障排除的能力" },
  { name: "品質檢驗", category: "技術職能", description: "產品檢驗、品質控制的能力" },
  { name: "工藝改善", category: "技術職能", description: "改進生產工藝、提高效率的能力" },
  { name: "安全管理", category: "技術職能", description: "安全操作、隱患排查的能力" },
  
  // 專業職能
  { name: "採購管理", category: "專業職能", description: "供應商管理、採購計畫的能力" },
  { name: "庫存管理", category: "專業職能", description: "物料庫存、倉庫管理的能力" },
  { name: "成本控制", category: "專業職能", description: "成本分析、控制成本的能力" },
  { name: "客戶服務", category: "專業職能", description: "客戶溝通、滿足客戶需求的能力" },
  { name: "產品開發", category: "專業職能", description: "新產品設計、開發的能力" },
];

async function seed() {
  try {
    const connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle(connection, { schema });

    console.log("開始初始化職位與職能數據...");

    // 1. 插入職位
    console.log("插入職位...");
    for (const pos of positionsData) {
      await db.insert(schema.jobPositions).values(pos);
    }
    console.log(`成功插入 ${positionsData.length} 個職位`);

    // 2. 插入職能
    console.log("插入職能...");
    for (const comp of competenciesData) {
      await db.insert(schema.competencies).values(comp);
    }
    console.log(`成功插入 ${competenciesData.length} 個職能`);

    console.log("職位與職能數據初始化完成！");
    await connection.end();
  } catch (error) {
    console.error("初始化失敗:", error);
    process.exit(1);
  }
}

seed();
