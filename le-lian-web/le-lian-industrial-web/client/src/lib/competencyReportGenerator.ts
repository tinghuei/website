// 職能落差盤點分析表 Word 報表產生器

import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  Packer,
  ShadingType,
  VerticalAlign,
} from 'docx';

// ── 型別 ──────────────────────────────────────────────────────────────────────

export interface ReportDimension {
  id: string;
  label: string;
  course: string;
}

export interface CompetencyReportInput {
  companyName: string;
  department: string;
  positionName: string;
  employeeName: string;
  employeeId: string;
  analysisYear: number;
  analysisMonth: number;
  dimensions: ReportDimension[];
  selfScores: Record<string, number>;
  standards: Record<string, number>;
  managerScores?: Record<string, number>;
}

// ── 頁面寬度（A4 12240 DXA − 左右各 720 邊距）───────────────────────────────
const PW = 10800;

// ── 色彩底色 ──────────────────────────────────────────────────────────────────
const SH = {
  darkBlue: { type: ShadingType.CLEAR, fill: '1F4E79', color: 'auto' } as const,
  midBlue:  { type: ShadingType.CLEAR, fill: '2E75B6', color: 'auto' } as const,
  lblBlue:  { type: ShadingType.CLEAR, fill: 'D9E1F2', color: 'auto' } as const,
  white:    { type: ShadingType.CLEAR, fill: 'FFFFFF', color: 'auto' } as const,
  green:    { type: ShadingType.CLEAR, fill: 'E2EFDA', color: 'auto' } as const,
  yellow:   { type: ShadingType.CLEAR, fill: 'FFF2CC', color: 'auto' } as const,
  red:      { type: ShadingType.CLEAR, fill: 'FCE4D6', color: 'auto' } as const,
  signBg:   { type: ShadingType.CLEAR, fill: 'EBF3FB', color: 'auto' } as const,
  oddRow:   { type: ShadingType.CLEAR, fill: 'F7FBFF', color: 'auto' } as const,
  gray:     { type: ShadingType.CLEAR, fill: 'F9F9F9', color: 'auto' } as const,
};

type ShadingEntry = (typeof SH)[keyof typeof SH];

// ── 框線 ─────────────────────────────────────────────────────────────────────
function bdr(size = 4, color = '000000') {
  const s = { style: BorderStyle.SINGLE, size, color };
  return { top: s, bottom: s, left: s, right: s };
}

// ── 通用格工廠 ────────────────────────────────────────────────────────────────
interface CellOpts {
  w?: number;
  bg?: ShadingEntry;
  bold?: boolean;
  sz?: number;
  color?: string;
  align?: (typeof AlignmentType)[keyof typeof AlignmentType];
  span?: number;
  vPad?: number;
}

function mkCell(text: string | number, opts: CellOpts = {}): TableCell {
  const {
    w, bg = SH.white, bold = false, sz = 20, color = '000000',
    align = AlignmentType.CENTER, span = 1, vPad = 80,
  } = opts;
  return new TableCell({
    children: [new Paragraph({
      alignment: align,
      spacing: { before: vPad, after: vPad },
      children: [new TextRun({ text: String(text), size: sz, bold, color, font: 'DFKai-SB' })],
    })],
    width: w ? { size: w, type: WidthType.DXA } : undefined,
    shading: bg,
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: span,
    borders: bdr(4),
  });
}

// ── 段落標題列（藍底白字，跨欄） ─────────────────────────────────────────────
function sectionRow(text: string, span: number): TableRow {
  return new TableRow({
    children: [new TableCell({
      columnSpan: span,
      shading: SH.midBlue,
      borders: bdr(6),
      children: [new Paragraph({
        spacing: { before: 100, after: 100 },
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text, size: 22, bold: true, color: 'FFFFFF', font: 'DFKai-SB' })],
      })],
    })],
  });
}

// ── 輔助：落差顏色、標示文字、優先程度 ────────────────────────────────────────
function gapBg(g: number): ShadingEntry  { return g >= 0 ? SH.green : g >= -10 ? SH.yellow : SH.red; }
function gapStr(g: number): string       { return g >= 0 ? `+${g}` : `${g}`; }
function statusStr(g: number): string    { return g >= 0 ? '✓ 達標' : g >= -10 ? '△ 偏低' : '✗ 不足'; }
function prioStr(g: number): string      { return g >= 0 ? '—' : g >= -10 ? '低' : g >= -20 ? '中' : '高'; }

// ═══════════════════════════════════════════════════════════════════════════════
// 對外主函式：產生 DOCX Blob 並觸發瀏覽器下載
// ═══════════════════════════════════════════════════════════════════════════════
export async function downloadCompetencyReport(input: CompetencyReportInput): Promise<void> {
  const doc = buildDocument(input);
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `職能落差分析表_${input.positionName}_${input.employeeName}_${input.analysisYear}${String(input.analysisMonth).padStart(2, '0')}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 核心：組建 Document
// ═══════════════════════════════════════════════════════════════════════════════
function buildDocument(input: CompetencyReportInput): Document {
  const {
    companyName, department, positionName, employeeName, employeeId,
    analysisYear, analysisMonth, dimensions, selfScores, standards, managerScores,
  } = input;

  const hasManager = managerScores && Object.keys(managerScores).length > 0;

  // ── 1. 表頭資訊表 ─────────────────────────────────────────────────────────
  // 欄寬: 1400+1560+1400+1560+1400+3480 = 10800
  const IC = [1400, 1560, 1400, 1560, 1400, 3480];
  function infoLbl(t: string, span = 1) { return mkCell(t, { bg: SH.lblBlue, bold: true, sz: 20, span }); }
  function infoVal(t: string, span = 1) { return mkCell(t, { bg: SH.white, sz: 20, span }); }

  const infoTable = new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: IC,
    rows: [
      new TableRow({ height: { value: 560, rule: 'atLeast' }, children: [
        new TableCell({
          columnSpan: 6, shading: SH.darkBlue, borders: bdr(8), verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 },
            children: [new TextRun({ text: companyName, size: 28, bold: true, color: 'FFFFFF', font: 'DFKai-SB' })],
          })],
        }),
      ]}),
      new TableRow({ height: { value: 680, rule: 'atLeast' }, children: [
        new TableCell({
          columnSpan: 6, shading: SH.midBlue, borders: bdr(8), verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 },
            children: [new TextRun({ text: '職 能 落 差 盤 點 分 析 表', size: 40, bold: true, color: 'FFFFFF', font: 'DFKai-SB' })],
          })],
        }),
      ]}),
      new TableRow({ children: [
        infoLbl('部　　門'), infoVal(department),
        infoLbl('職　　稱'), infoVal(positionName),
        infoLbl('分析年月'), infoVal(`${analysisYear} 年 ${analysisMonth} 月`),
      ]}),
      new TableRow({ children: [
        infoLbl('姓　　名'), infoVal(employeeName || ''),
        infoLbl('工　　號'), infoVal(employeeId || ''),
        infoLbl('評量依據'), infoVal('iCAP 職能基準'),
      ]}),
    ],
  });

  // ── 2. 職能向度落差分析表 ──────────────────────────────────────────────────
  const gapRows: TableRow[] = [];

  if (hasManager) {
    // 9 欄: 560+1900+800+800+800+720+800+2720+1700 = 10800
    const GC = [560, 1900, 800, 800, 800, 720, 800, 2720, 1700];
    const spanCount = GC.length;

    gapRows.push(sectionRow('一、職能向度落差分析', spanCount));
    gapRows.push(new TableRow({ children: [
      mkCell('序號',         { w: GC[0], bg: SH.lblBlue, bold: true }),
      mkCell('職能向度',     { w: GC[1], bg: SH.lblBlue, bold: true }),
      mkCell('員工自評',     { w: GC[2], bg: SH.lblBlue, bold: true }),
      mkCell('主管評估',     { w: GC[3], bg: SH.lblBlue, bold: true }),
      mkCell('職能標準',     { w: GC[4], bg: SH.lblBlue, bold: true }),
      mkCell('落　差',       { w: GC[5], bg: SH.lblBlue, bold: true }),
      mkCell('達標情形',     { w: GC[6], bg: SH.lblBlue, bold: true }),
      mkCell('建議強化課程', { w: GC[7], bg: SH.lblBlue, bold: true }),
      mkCell('訓練優先程度', { w: GC[8], bg: SH.lblBlue, bold: true }),
    ]}));

    dimensions.forEach((d, i) => {
      const self = selfScores[d.id] ?? 0;
      const mgr  = managerScores![d.id] ?? 0;
      const std  = standards[d.id] ?? 0;
      const gap  = self - std;
      const rowBg = i % 2 ? SH.oddRow : SH.white;
      gapRows.push(new TableRow({ children: [
        mkCell(i + 1,             { w: GC[0], bg: rowBg }),
        mkCell(d.label,           { w: GC[1], bg: rowBg, align: AlignmentType.LEFT }),
        mkCell(self,              { w: GC[2], bg: rowBg }),
        mkCell(mgr,               { w: GC[3], bg: rowBg }),
        mkCell(std,               { w: GC[4], bg: rowBg }),
        mkCell(gapStr(gap),       { w: GC[5], bg: gapBg(gap), bold: true, color: gap < 0 ? 'C00000' : '375623' }),
        mkCell(statusStr(gap),    { w: GC[6], bg: gapBg(gap) }),
        mkCell(gap < 0 ? d.course : '已達標，持續精進', { w: GC[7], align: AlignmentType.LEFT }),
        mkCell(prioStr(gap),      { w: GC[8], bg: gapBg(gap) }),
      ]}));
    });

    gapRows.push(new TableRow({ children: [
      new TableCell({
        columnSpan: spanCount, shading: SH.gray, borders: bdr(2, 'BBBBBB'),
        children: [new Paragraph({
          spacing: { before: 60, after: 60 }, alignment: AlignmentType.LEFT,
          children: [new TextRun({
            text: '【評分說明】分數範圍 0–100 分；職能標準依 iCAP 要求等級換算（等級×20）。落差 = 員工自評 − 職能標準；正數（綠）= 達標，負數（黃）= 輕微不足，深負（紅）= 明顯不足',
            size: 16, color: '555555', font: 'DFKai-SB',
          })],
        })],
      }),
    ]}));
  } else {
    // 8 欄: 600+2280+880+880+780+920+3000+1460 = 10800
    const GC = [600, 2280, 880, 880, 780, 920, 3000, 1460];
    const spanCount = GC.length;

    gapRows.push(sectionRow('一、職能向度落差分析', spanCount));
    gapRows.push(new TableRow({ children: [
      mkCell('序號',         { w: GC[0], bg: SH.lblBlue, bold: true }),
      mkCell('職能向度',     { w: GC[1], bg: SH.lblBlue, bold: true }),
      mkCell('員工自評',     { w: GC[2], bg: SH.lblBlue, bold: true }),
      mkCell('職能標準',     { w: GC[3], bg: SH.lblBlue, bold: true }),
      mkCell('落　差',       { w: GC[4], bg: SH.lblBlue, bold: true }),
      mkCell('達標情形',     { w: GC[5], bg: SH.lblBlue, bold: true }),
      mkCell('建議強化課程', { w: GC[6], bg: SH.lblBlue, bold: true }),
      mkCell('訓練優先程度', { w: GC[7], bg: SH.lblBlue, bold: true }),
    ]}));

    dimensions.forEach((d, i) => {
      const self = selfScores[d.id] ?? 0;
      const std  = standards[d.id] ?? 0;
      const gap  = self - std;
      const rowBg = i % 2 ? SH.oddRow : SH.white;
      gapRows.push(new TableRow({ children: [
        mkCell(i + 1,             { w: GC[0], bg: rowBg }),
        mkCell(d.label,           { w: GC[1], bg: rowBg, align: AlignmentType.LEFT }),
        mkCell(self,              { w: GC[2], bg: rowBg }),
        mkCell(std,               { w: GC[3], bg: rowBg }),
        mkCell(gapStr(gap),       { w: GC[4], bg: gapBg(gap), bold: true, color: gap < 0 ? 'C00000' : '375623' }),
        mkCell(statusStr(gap),    { w: GC[5], bg: gapBg(gap) }),
        mkCell(gap < 0 ? d.course : '已達標，持續精進', { w: GC[6], align: AlignmentType.LEFT }),
        mkCell(prioStr(gap),      { w: GC[7], bg: gapBg(gap) }),
      ]}));
    });

    gapRows.push(new TableRow({ children: [
      new TableCell({
        columnSpan: spanCount, shading: SH.gray, borders: bdr(2, 'BBBBBB'),
        children: [new Paragraph({
          spacing: { before: 60, after: 60 }, alignment: AlignmentType.LEFT,
          children: [new TextRun({
            text: '【評分說明】分數範圍 0–100 分；職能標準依 iCAP 要求等級換算（等級×20）。落差 = 員工自評 − 職能標準；正數（綠）= 達標，負數（黃）= 輕微不足，深負（紅）= 明顯不足',
            size: 16, color: '555555', font: 'DFKai-SB',
          })],
        })],
      }),
    ]}));
  }

  const gapTable = new Table({ width: { size: PW, type: WidthType.DXA }, rows: gapRows });

  // ── 3. 訓練需求課程彙整表 ──────────────────────────────────────────────────
  // 欄寬: 600+2770+1200+4800+1430 = 10800
  const TC = [600, 2770, 1200, 4800, 1430];
  const needed = dimensions.filter((d) => (selfScores[d.id] ?? 0) - (standards[d.id] ?? 0) < 0);

  const trainingDataRows: TableRow[] = needed.length > 0
    ? needed.map((d, i) => {
        const gap = (selfScores[d.id] ?? 0) - (standards[d.id] ?? 0);
        return new TableRow({ height: { value: 480, rule: 'atLeast' }, children: [
          mkCell(i + 1,        { w: TC[0], bg: i % 2 ? SH.oddRow : SH.white }),
          mkCell(d.label,      { w: TC[1], bg: i % 2 ? SH.oddRow : SH.white, align: AlignmentType.LEFT }),
          mkCell(prioStr(gap), { w: TC[2], bg: gapBg(gap) }),
          mkCell(d.course,     { w: TC[3], bg: i % 2 ? SH.oddRow : SH.white, align: AlignmentType.LEFT }),
          mkCell('',           { w: TC[4] }),
        ]});
      })
    : [new TableRow({ children: [
        new TableCell({
          columnSpan: 5, borders: bdr(4),
          children: [new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { before: 160, after: 160 },
            children: [new TextRun({ text: '各職能向度均已達標，暫無訓練需求', size: 20, color: '375623', font: 'DFKai-SB' })],
          })],
        }),
      ]})];

  const trainingTable = new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: TC,
    rows: [
      sectionRow('二、訓練需求課程彙整', 5),
      new TableRow({ children: [
        mkCell('序號',         { w: TC[0], bg: SH.lblBlue, bold: true }),
        mkCell('落差職能向度', { w: TC[1], bg: SH.lblBlue, bold: true }),
        mkCell('優先程度',     { w: TC[2], bg: SH.lblBlue, bold: true }),
        mkCell('建議強化課程', { w: TC[3], bg: SH.lblBlue, bold: true }),
        mkCell('備　　　　註', { w: TC[4], bg: SH.lblBlue, bold: true }),
      ]}),
      ...trainingDataRows,
    ],
  });

  // ── 4. 綜合說明表（含核取方塊 + 單位主管說明欄）──────────────────────────
  const remarkLblW = 1400;
  const checkColW  = 4200;
  const mgrLblW    = 1400;
  const mgrAreaW   = PW - remarkLblW - checkColW - mgrLblW; // 3800

  const remarkTable = new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: [remarkLblW, checkColW, mgrLblW, mgrAreaW],
    rows: [
      new TableRow({ height: { value: 1200, rule: 'atLeast' }, children: [
        // 「綜合說明」標籤
        mkCell('綜合說明', { w: remarkLblW, bg: SH.lblBlue, bold: true }),
        // 核取方塊欄
        new TableCell({
          width: { size: checkColW, type: WidthType.DXA },
          shading: SH.white, borders: bdr(4), verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              spacing: { before: 60, after: 40 }, alignment: AlignmentType.LEFT,
              children: [new TextRun({ text: '□ 結果符合', size: 20, font: 'DFKai-SB' })],
            }),
            new Paragraph({
              spacing: { before: 40, after: 40 }, alignment: AlignmentType.LEFT,
              children: [new TextRun({ text: '□ 部分符合', size: 20, font: 'DFKai-SB' })],
            }),
            new Paragraph({
              spacing: { before: 40, after: 40 }, alignment: AlignmentType.LEFT,
              children: [new TextRun({ text: '□ 結果不符合', size: 20, font: 'DFKai-SB' })],
            }),
            new Paragraph({
              spacing: { before: 40, after: 60 }, alignment: AlignmentType.LEFT,
              children: [new TextRun({ text: '□ 需增加新職能面向', size: 20, font: 'DFKai-SB' })],
            }),
          ],
        }),
        // 「單位主管」標籤
        mkCell('單位主管', { w: mgrLblW, bg: SH.lblBlue, bold: true }),
        // 主管說明填寫區
        new TableCell({
          width: { size: mgrAreaW, type: WidthType.DXA },
          shading: SH.white, borders: bdr(4), verticalAlign: VerticalAlign.TOP,
          children: [new Paragraph({
            spacing: { before: 60, after: 60 }, alignment: AlignmentType.LEFT,
            children: [new TextRun({ text: '根據勾選結果在此欄位說明：', size: 18, color: '888888', font: 'DFKai-SB' })],
          })],
        }),
      ]}),
    ],
  });

  // ── 5. 四欄簽核表（核准 / 覆核 / 單位主管 / 單位填表人）────────────────────
  const SC = [2700, 2700, 2700, 2700];

  function sigCell(): TableCell {
    return new TableCell({
      width: { size: SC[0], type: WidthType.DXA },
      shading: SH.signBg, borders: bdr(4), verticalAlign: VerticalAlign.BOTTOM,
      children: [new Paragraph({ children: [] })],
    });
  }

  const sigTable = new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: SC,
    rows: [
      sectionRow('三、核決權限', 4),
      new TableRow({ children: [
        mkCell('核　　　准', { w: SC[0], bg: SH.lblBlue, bold: true, sz: 22 }),
        mkCell('覆　　　核', { w: SC[1], bg: SH.lblBlue, bold: true, sz: 22 }),
        mkCell('單位主管',   { w: SC[2], bg: SH.lblBlue, bold: true, sz: 22 }),
        mkCell('單位填表人', { w: SC[3], bg: SH.lblBlue, bold: true, sz: 22 }),
      ]}),
      new TableRow({ height: { value: 2000, rule: 'atLeast' }, children: [sigCell(), sigCell(), sigCell(), sigCell()] }),
    ],
  });

  // ── 組裝 ─────────────────────────────────────────────────────────────────
  return new Document({
    sections: [{
      properties: {
        page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
      },
      children: [
        infoTable,
        new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }),
        gapTable,
        new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }),
        trainingTable,
        new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }),
        remarkTable,
        new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }),
        sigTable,
        new Paragraph({
          spacing: { before: 120, after: 0 }, alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: '表單版本：v1.0　本表由人資部存檔', size: 16, color: '888888', font: 'DFKai-SB' })],
        }),
      ],
    }],
  });
}
