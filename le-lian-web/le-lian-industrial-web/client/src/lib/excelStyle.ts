// 共用 Excel 美化樣式工具（搭配 xlsx-js-style，社群版 xlsx 套件不支援寫入儲存格樣式）。
// 提供標題列合併置中、表頭列底色粗體、資料列框線等基本美化效果，供各匯出功能套用。

import * as XLSX from 'xlsx-js-style';

export { XLSX };

const BORDER_LINE = { style: 'thin', color: { rgb: 'D1D5DB' } } as const;
const CELL_BORDER = { top: BORDER_LINE, bottom: BORDER_LINE, left: BORDER_LINE, right: BORDER_LINE };

const TITLE_STYLE = {
  font: { bold: true, sz: 14, color: { rgb: '1E3A8A' } },
  alignment: { horizontal: 'center', vertical: 'center' },
};
const SUBTITLE_STYLE = {
  font: { bold: true, sz: 10, color: { rgb: '374151' } },
  alignment: { vertical: 'center' },
};
const HEADER_STYLE = {
  font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
  fill: { fgColor: { rgb: '2563EB' } },
  border: CELL_BORDER,
  alignment: { horizontal: 'center', vertical: 'center' },
};
const DATA_STYLE = {
  border: CELL_BORDER,
  alignment: { vertical: 'center', wrapText: true },
};

export interface StyleSheetOptions {
  /** 0-based row indices to render as a merged, centered title (e.g. 公司名稱/報表標題列) */
  titleRows?: number[];
  /** 0-based row indices to render as a bold subtitle/info row (e.g. 計畫年度/製作單位列) */
  subtitleRows?: number[];
  /** 0-based row index of the column header row */
  headerRow: number;
  /** total number of columns to style (usually header.length) */
  numCols: number;
}

/** 為 aoa_to_sheet 產生的工作表套用標題/表頭/資料列美化樣式（粗體、底色、框線、置中）。 */
export function styleSheet(ws: XLSX.WorkSheet, opts: StyleSheetOptions) {
  const { titleRows = [], subtitleRows = [], headerRow, numCols } = opts;
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = 0; c < numCols; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) ws[addr] = { t: 's', v: '' };
      if (titleRows.includes(r)) {
        ws[addr].s = TITLE_STYLE;
      } else if (subtitleRows.includes(r)) {
        ws[addr].s = SUBTITLE_STYLE;
      } else if (r === headerRow) {
        ws[addr].s = HEADER_STYLE;
      } else if (r > headerRow) {
        ws[addr].s = DATA_STYLE;
      }
    }
  }

  ws['!merges'] = ws['!merges'] || [];
  titleRows.forEach((r) => {
    ws['!merges']!.push({ s: { r, c: 0 }, e: { r, c: numCols - 1 } });
  });

  if (!ws['!rows']) ws['!rows'] = [];
  ws['!rows'][headerRow] = { hpt: 22 };
  titleRows.forEach((r) => { ws['!rows']![r] = { hpt: 26 }; });
}
