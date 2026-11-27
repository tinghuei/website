/**
 * 一次性工具:把 2027 年(民國 116 年)台灣的國定假日匯入月曆看板。
 *
 * 用法:
 * 1. 打開跟 Code.gs 同一個 Apps Script 專案
 * 2. 新增一個檔案(或暫時貼在 Code.gs 最下面),把這份內容整個貼進去
 * 3. 上方函式下拉選單選 importNationalHolidays2027,點「執行」
 * 4. 跑完之後打開月曆網頁確認 2027 年各月份都看得到假日,再把這段程式碼刪掉(不是日常運作需要的程式)
 *
 * 資料來源:行政院人事行政總處公告「中華民國116年政府行政機關辦公日曆表」,
 * 經多家新聞媒體(ettoday、TVBS、天下雜誌等)交叉比對、並以星期數推算驗證過。
 * 正式日期仍以人事行政總處官網公告為準,如有出入請自行調整下面 HOLIDAYS 清單。
 */
function importNationalHolidays2027() {
  // 如果你有把網頁最上方的看板名稱改掉(預設是「樂聯工業CHOICE」),這裡也要改成一模一樣的字串,
  // 不然假日會寫到一個網頁上看不到的看板去。
  var BOARD_NAME = '樂聯工業CHOICE';

  var HOLIDAYS = [
    ['2027-01-01', '開國紀念日'],
    ['2027-02-04', '小年夜'],
    ['2027-02-05', '除夕'],
    ['2027-02-06', '春節(初一)'],
    ['2027-02-07', '春節(初二)'],
    ['2027-02-08', '春節(初三)'],
    ['2027-02-09', '春節補假'],
    ['2027-02-10', '春節補假'],
    ['2027-02-28', '和平紀念日'],
    ['2027-03-01', '和平紀念日補假'],
    ['2027-04-04', '兒童節'],
    ['2027-04-05', '清明節'],
    ['2027-04-06', '兒童節補假'],
    ['2027-04-30', '勞動節補假'],
    ['2027-05-01', '勞動節'],
    ['2027-06-09', '端午節'],
    ['2027-09-15', '中秋節'],
    ['2027-09-28', '教師節'],
    ['2027-10-10', '國慶日'],
    ['2027-10-11', '國慶日補假'],
    ['2027-10-25', '台灣光復節'],
    ['2027-12-24', '行憲紀念日補假'],
    ['2027-12-25', '行憲紀念日'],
    ['2027-12-31', '開國紀念日補假'],
  ];

  // 依月份分組,組成 { "樂聯工業CHOICE_2027-01": { "1": "開國紀念日" }, ... }
  var byMonth = {};
  HOLIDAYS.forEach(function (h) {
    var parts = h[0].split('-');
    var key = BOARD_NAME + '_' + parts[0] + '-' + parts[1];
    var day = String(Number(parts[2]));
    if (!byMonth[key]) byMonth[key] = {};
    byMonth[key][day] = h[1];
  });

  var sheet = getSheet();
  var count = 0;
  Object.keys(byMonth).forEach(function (key) {
    var rowIndex = findRowIndex(sheet, key);
    var data;
    if (rowIndex === -1) {
      data = { days: {} };
      sheet.appendRow([key, JSON.stringify(data), new Date()]);
      rowIndex = sheet.getLastRow();
    } else {
      data = safeParse(sheet.getRange(rowIndex, 2).getValue());
    }
    Object.keys(byMonth[key]).forEach(function (day) {
      var dayData = data.days[day] || { leave: [], items: [] };
      var name = byMonth[key][day];
      var already = (dayData.items || []).some(function (it) { return it.dept === '其他' && it.text === name; });
      if (!already) {
        dayData.items = (dayData.items || []).concat([{ text: name, dept: '其他', time: '', owner: '', done: false }]);
        count++;
      }
      data.days[day] = dayData;
    });
    sheet.getRange(rowIndex, 2).setValue(JSON.stringify(data));
    sheet.getRange(rowIndex, 3).setValue(new Date());
  });

  Logger.log('已匯入 ' + count + ' 筆 2027 年國定假日(略過已存在的重複項目)');
}
