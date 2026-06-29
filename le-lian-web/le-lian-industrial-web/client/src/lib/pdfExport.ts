// 共用 PDF 匯出工具：將指定 DOM 元素轉成圖片後組成可下載的 PDF 檔案，
// 取代各匯出功能舊有的 window.print() 列印對話框做法（不會產生實際可下載檔案、且會被彈窗封鎖）。

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/** 將 DOM 元素轉換為多頁 A4 PDF 並觸發下載。 */
export async function exportElementToPdf(el: HTMLElement, filename: string) {
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
  const imgData = canvas.toDataURL('image/png');
  const imgWidth = A4_WIDTH_MM;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF('p', 'mm', 'a4');
  let remainingHeight = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  remainingHeight -= A4_HEIGHT_MM;

  while (remainingHeight > 0) {
    position -= A4_HEIGHT_MM;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    remainingHeight -= A4_HEIGHT_MM;
  }

  pdf.save(filename);
}

/** 將一段 HTML 字串暫時渲染到畫面外的容器，擷取成 PDF 後移除，用於匯出非即時顯示在畫面上的報表內容。 */
export async function exportHtmlToPdf(html: string, filename: string, widthPx = 600) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${widthPx}px`;
  container.innerHTML = html;
  document.body.appendChild(container);
  try {
    await exportElementToPdf(container, filename);
  } finally {
    document.body.removeChild(container);
  }
}
