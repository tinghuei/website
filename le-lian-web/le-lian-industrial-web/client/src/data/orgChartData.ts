// 樂聯工業股份有限公司 組織架構資料
// 來源：六月份組織表（2026/04/29 制定）
// 本資料為全公司職位、部門、主管之單一資料來源（Single Source of Truth）。
// 電子簽核（如費用訓練同意書 CFCMHR37）之「主管」「人資」欄位、
// 各頁面之部門下拉選單，皆應以此資料為準。

export interface OrgMember {
  name: string;
  title: string;
}

export interface OrgUnit {
  id: string;
  name: string;
  parentId: string | null;
  memberCount?: string; // 標示總人數（如「共27人」），來自原始組織表
  members: OrgMember[];
}

// 高層領導鏈（董事會 → 總經理 → 執行副總）
export const LEADERSHIP: OrgMember[] = [
  { name: '鄭訊仁', title: '董事長' },
  { name: '鄭景文', title: '副董事長' },
  { name: '鄭景文', title: '總經理（兼任）' },
  { name: '陳佳倫', title: '執行副總' },
];

export const ORG_UNITS: OrgUnit[] = [
  // ── 直屬執行副總 ──────────────────────────────────────────
  {
    id: 'exec-office',
    name: '總經理室',
    parentId: null,
    members: [
      { name: '龔淑屏', title: '副理' },
      { name: '黃士咸', title: '工程師' },
      { name: '尹詩婷', title: '秘書' },
      { name: '李庭慧', title: '秘書' },
    ],
  },
  {
    id: 'qa-section',
    name: '品保課',
    parentId: null,
    members: [
      { name: '朱冠瑋', title: '課長' },
      { name: '周清家', title: '專員' },
      { name: '詹郁瑛', title: '助理' },
      { name: '林依婷', title: '助理' },
    ],
  },
  {
    id: 'facility-office',
    name: '廠務室',
    parentId: null,
    members: [
      { name: '曾夷璋', title: '工程師' },
    ],
  },

  // ── 營業部 ────────────────────────────────────────────────
  {
    id: 'sales-dept',
    name: '營業部',
    parentId: null,
    members: [{ name: '劉祐誠', title: '經理' }],
  },
  {
    id: 'sales-section',
    name: '業務課',
    parentId: 'sales-dept',
    members: [
      { name: '伍珈彣', title: '組長' },
      { name: '鄭淑鐘', title: '助理專員' },
      { name: '陳玉慧', title: '助理' },
    ],
  },
  {
    id: 'rd-section',
    name: '研發課',
    parentId: 'sales-dept',
    members: [
      { name: '白惇維', title: '課長' },
      { name: '王柳琦', title: '工程師' },
      { name: '徐惠蘭', title: '助理' },
      { name: '沙洋', title: '技術員' },
    ],
  },

  // ── 管理部 ────────────────────────────────────────────────
  {
    id: 'admin-dept',
    name: '管理部',
    parentId: null,
    members: [{ name: '龔淑屏', title: '副理（兼任）' }],
  },
  {
    id: 'general-affairs-section',
    name: '總務課',
    parentId: 'admin-dept',
    members: [],
  },
  {
    id: 'general-affairs-group',
    name: '庶務組',
    parentId: 'general-affairs-section',
    members: [
      { name: '張歆發', title: '專員' },
      { name: '陳明軒', title: '專員' },
      { name: '陳福郎', title: '助理專員' },
      { name: '吳桂傳', title: '清潔員' },
    ],
  },
  {
    id: 'hr-safety-group',
    name: '人資安全組',
    parentId: 'general-affairs-section',
    members: [
      { name: '蔡欣芸', title: '助理' },
      { name: '吳彥儀', title: '助理' },
    ],
  },

  // ── 財務部 ────────────────────────────────────────────────
  {
    id: 'finance-dept',
    name: '財務部',
    parentId: null,
    members: [{ name: '蔡佳玲', title: '副理' }],
  },
  {
    id: 'accounting',
    name: '會計',
    parentId: 'finance-dept',
    members: [
      { name: '孫素琴', title: '專員' },
      { name: '王美婷', title: '專員' },
    ],
  },
  {
    id: 'cashier',
    name: '出納',
    parentId: 'finance-dept',
    members: [{ name: '陳盈如', title: '專員' }],
  },

  // ── 廠務部 ────────────────────────────────────────────────
  {
    id: 'facility-dept',
    name: '廠務部',
    parentId: null,
    members: [
      { name: '蔡政博', title: '經理' },
      { name: '陳家祥', title: '製程工程師' },
    ],
  },
  {
    id: 'materials-section',
    name: '資材課',
    parentId: 'facility-dept',
    members: [{ name: '王秀雯', title: '副課長' }],
  },
  {
    id: 'materials-mgmt-group',
    name: '物管組',
    parentId: 'materials-section',
    members: [
      { name: '石容萱', title: '組長' },
      { name: '尤念萍', title: '班長' },
      { name: '林德和', title: '堆高機員' },
      { name: '羅文彥', title: '堆高機員' },
      { name: '楊心恬', title: '助理' },
      { name: '陳巧倫', title: '助理' },
    ],
  },
  {
    id: 'production-control-group',
    name: '生管組',
    parentId: 'materials-section',
    members: [{ name: '郭惠婷', title: '助理' }],
  },
  {
    id: 'purchasing-group',
    name: '採購組',
    parentId: 'materials-section',
    members: [
      { name: '陳惠萍', title: '組長' },
      { name: '潘佩君', title: '班長（育嬰）' },
      { name: '陳孟怡', title: '助理' },
      { name: '尤宏菜', title: '助理' },
      { name: '陳孟靖', title: '助理' },
    ],
  },
  {
    id: 'warehouse-group',
    name: '成倉組',
    parentId: 'materials-section',
    members: [
      { name: '曾泓霖', title: '組長' },
      { name: '戴禮璇', title: '助理' },
      { name: '凍馬拉', title: '作業員' },
      { name: '沙達', title: '作業員' },
      { name: '張永盛', title: '司機' },
    ],
  },
  {
    id: 'manufacturing-section',
    name: '製造課',
    parentId: 'facility-dept',
    members: [
      { name: '楊玉鳳', title: '副課長' },
      { name: '鍾欣芳', title: '助理' },
    ],
  },
  {
    id: 'press-group',
    name: '沖床組',
    parentId: 'manufacturing-section',
    memberCount: '共6人',
    members: [
      { name: '覃麗婷', title: '副組長' },
      { name: '李昱鉉', title: '班長' },
    ],
  },
  {
    id: 'processing-group',
    name: '加工組',
    parentId: 'manufacturing-section',
    memberCount: '共27人',
    members: [
      { name: '白惇維', title: '代理組長' },
      { name: '沙空', title: '班長' },
      { name: '張舒涵', title: '班長' },
      { name: '阮祝玲', title: '班長' },
    ],
  },
  {
    id: 'painting-group',
    name: '塗裝組',
    parentId: 'manufacturing-section',
    memberCount: '共19人',
    members: [
      { name: '郭惠燕', title: '組長' },
      { name: '周安琪', title: '班長' },
      { name: '威耐', title: '班長' },
    ],
  },
  {
    id: 'group-1',
    name: '組一組',
    parentId: 'manufacturing-section',
    memberCount: '共13人',
    members: [{ name: '陳怡珊', title: '副組長' }],
  },
  {
    id: 'group-2',
    name: '組二組',
    parentId: 'manufacturing-section',
    memberCount: '共13人',
    members: [
      { name: '吉宗達', title: '組長' },
      { name: '紀佩欣', title: '副組長' },
    ],
  },
  {
    id: 'group-3',
    name: '組三組',
    parentId: 'manufacturing-section',
    memberCount: '共10人',
    members: [{ name: '蔡坤惠', title: '班長' }],
  },
];

// 主管職稱優先順序（由高至低），用於從單位成員中找出該單位主管
const LEAD_TITLE_ORDER = [
  '經理', '課長', '副課長', '副理', '組長', '副組長', '代理組長', '班長', '專員',
];

function leadRank(title: string): number {
  for (let i = 0; i < LEAD_TITLE_ORDER.length; i++) {
    if (title.includes(LEAD_TITLE_ORDER[i])) return i;
  }
  return LEAD_TITLE_ORDER.length;
}

/** 取得指定部門/單位的主管（職稱層級最高者）。若該單位無成員，向上層單位尋找。 */
export function getUnitManager(unitName: string): OrgMember | null {
  let unit = ORG_UNITS.find((u) => u.name === unitName);
  while (unit) {
    if (unit.members.length > 0) {
      return [...unit.members].sort((a, b) => leadRank(a.title) - leadRank(b.title))[0];
    }
    unit = unit.parentId ? ORG_UNITS.find((u) => u.id === unit!.parentId) : undefined;
  }
  return null;
}

/** 取得人資安全組成員，供費用協議書「執行單位人資單位簽名」欄位參考。 */
export function getHRStaff(): OrgMember[] {
  return ORG_UNITS.find((u) => u.id === 'hr-safety-group')?.members || [];
}

/** 取得單位的子單位 */
export function getChildUnits(parentId: string | null): OrgUnit[] {
  return ORG_UNITS.filter((u) => u.parentId === parentId);
}

/** 部門/單位下拉選單清單（依組織表順序） */
export const ALL_DEPARTMENTS = ORG_UNITS.map((u) => u.name);

/** 全公司員工清單（含部門與職稱），供姓名搜尋使用 */
export const ALL_EMPLOYEES: { name: string; title: string; unit: string }[] = [
  ...LEADERSHIP.map((l) => ({ ...l, unit: '董事會 / 總經理室' })),
  ...ORG_UNITS.flatMap((u) => u.members.map((m) => ({ ...m, unit: u.name }))),
];
