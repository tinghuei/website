// 職能落差盤點分析表 Word 報表產生器
// 依使用者修正版格式：三關簽核欄位由左至右為「核准 / 覆核 / 承辦人」

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

// ── 頁面寬度（A4 12240 DXA − 左右各 1440 邊距）──────────────────────────────
const PW = 9360;

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

// ── 通用格（儲存格）工廠 ──────────────────────────────────────────────────────
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
  // 欄寬: 1200+1360+1200+1360+1200+3040 = 9360
  const IC = [1200, 1360, 1200, 1360, 1200, 3040];
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
        infoLbl('姓　　名'), infoVal(employeeName),
        infoLbl('工　　號'), infoVal(employeeId || '—'),
        infoLbl('評量依據'), infoVal('iCAP 職能基準'),
      ]}),
    ],
  });

  // ── 2. 職能向度落差分析表 ──────────────────────────────────────────────────
  // 欄位依是否有主管評估而增減一欄
  // 有主管評估: 序號+向度+自評+主管+標準+落差+達標+建議課程+優先 (9欄)
  // 無主管評估: 序號+向度+自評+標準+落差+達標+建議課程+優先 (8欄)
  const gapRows: TableRow[] = [];

  if (hasManager) {
    // 9 欄: 520+1600+640+640+640+640+640+2400+1040 = 8760 → 調整到 9360
    const GC = [480, 1640, 680, 680, 680, 640, 680, 2400, 1480];
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
        columnSpan: spanCount,
        shading: SH.gray,
        borders: bdr(2, 'BBBBBB'),
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
    // 8 欄: 520+2000+760+760+680+800+2600+1240 = 9360
    const GC = [520, 2000, 760, 760, 680, 800, 2600, 1240];
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
        columnSpan: spanCount,
        shading: SH.gray,
        borders: bdr(2, 'BBBBBB'),
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
  // 欄寬: 520+2400+1040+4160+1240 = 9360
  const TC = [520, 2400, 1040, 4160, 1240];
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
            alignment: AlignmentType.CENTER,
            spacing: { before: 160, after: 160 },
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

  // ── 4. 綜合說明表 ─────────────────────────────────────────────────────────
  const remarkTable = new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: [1200, PW - 1200],
    rows: [
      new TableRow({ height: { value: 1000, rule: 'atLeast' }, children: [
        mkCell('綜合說明', { w: 1200, bg: SH.lblBlue, bold: true }),
        new TableCell({
          width: { size: PW - 1200, type: WidthType.DXA },
          shading: SH.white, borders: bdr(4),
          children: [new Paragraph({
            spacing: { before: 60, after: 60 }, alignment: AlignmentType.LEFT,
            children: [new TextRun({ text: '　', size: 20, font: 'DFKai-SB' })],
          })],
        }),
      ]}),
    ],
  });

  // ── 5. 三關簽核表（核准 / 覆核 / 承辦人，由左至右） ───────────────────────
  const SC = [3120, 3120, 3120];

  function sigCell(): TableCell {
    return new TableCell({
      width: { size: SC[0], type: WidthType.DXA },
      shading: SH.signBg, borders: bdr(4), verticalAlign: VerticalAlign.BOTTOM,
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300, after: 200 },
          children: [new TextRun({ text: '（  簽  名  ）', size: 18, color: 'BBBBBB', font: 'DFKai-SB' })],
        }),
        new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: '  職稱：＿＿＿＿＿＿＿', size: 20, font: 'DFKai-SB' })],
        }),
        new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: '  姓名：＿＿＿＿＿＿＿', size: 20, font: 'DFKai-SB' })],
        }),
        new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 40, after: 80 },
          children: [new TextRun({ text: '  日期：＿＿年＿＿月＿＿日', size: 20, font: 'DFKai-SB' })],
        }),
      ],
    });
  }

  const sigTable = new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: SC,
    rows: [
      sectionRow('三、核決權限', 3),
      new TableRow({ children: [
        mkCell('核　　　准', { w: SC[0], bg: SH.lblBlue, bold: true, sz: 22 }),
        mkCell('覆　　　核', { w: SC[1], bg: SH.lblBlue, bold: true, sz: 22 }),
        mkCell('承　辦　人', { w: SC[2], bg: SH.lblBlue, bold: true, sz: 22 }),
      ]}),
      new TableRow({ height: { value: 2000, rule: 'atLeast' }, children: [sigCell(), sigCell(), sigCell()] }),
    ],
  });

  // ── 組裝 ─────────────────────────────────────────────────────────────────
  return new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } },
      },
      children: [
        infoTable,
        new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),
        gapTable,
        new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),
        trainingTable,
        new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),
        remarkTable,
        new Paragraph({ spacing: { before: 240, after: 0 }, children: [] }),
        sigTable,
        new Paragraph({
          spacing: { before: 160, after: 0 }, alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: '表單版本：v1.0　本表由人資部存檔', size: 16, color: '888888', font: 'DFKai-SB' })],
        }),
      ],
    }],
  });
}
