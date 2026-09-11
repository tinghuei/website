/**
 * 產線月曆看板 — Google Apps Script 後端
 *
 * 部署方式請見 calendar/README.md。這支程式把資料存在「目前綁定的 Google 試算表」
 * 的 CalendarData 工作表裡,每一列是一個「部門_年-月」的月曆,JSON 欄位存整月資料。
 */

var SHEET_NAME = 'CalendarData';

// 內部共用的編輯密碼。任何人拿到這組密碼都能修改資料,請自行更換成公司內部的密碼,
// 不要用預設值。只有「儲存」需要密碼,單純瀏覽不需要。
var EDIT_PIN = '請改成你自己的密碼';

function doGet(e) {
  var key = e.parameter.key;
  if (!key) return jsonResponse({ ok: false, error: 'missing_key' });
  var sheet = getSheet();
  var row = findRow(sheet, key);
  var data = row ? safeParse(row[1]) : { days: {} };
  return jsonResponse({ ok: true, data: data });
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, error: 'bad_request' });
  }

  if (body.pin !== EDIT_PIN) {
    return jsonResponse({ ok: false, error: 'invalid_pin' });
  }
  if (body.action !== 'saveDay' || !body.key || body.day == null) {
    return jsonResponse({ ok: false, error: 'bad_request' });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getSheet();
    var rowIndex = findRowIndex(sheet, body.key);
    var data;
    if (rowIndex === -1) {
      data = { days: {} };
      sheet.appendRow([body.key, JSON.stringify(data), new Date()]);
      rowIndex = sheet.getLastRow();
    } else {
      var raw = sheet.getRange(rowIndex, 2).getValue();
      data = safeParse(raw);
    }
    data.days[String(body.day)] = body.dayData;
    sheet.getRange(rowIndex, 2).setValue(JSON.stringify(data));
    sheet.getRange(rowIndex, 3).setValue(new Date());
    return jsonResponse({ ok: true, data: data });
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Key', 'JSON', 'UpdatedAt']);
  }
  return sheet;
}

function findRowIndex(sheet, key) {
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === key) return i + 1; // 1-based, 對應試算表列號
  }
  return -1;
}

function findRow(sheet, key) {
  var idx = findRowIndex(sheet, key);
  if (idx === -1) return null;
  return sheet.getRange(idx, 1, 1, 2).getValues()[0];
}

function safeParse(raw) {
  if (!raw) return { days: {} };
  try {
    var parsed = JSON.parse(raw);
    if (!parsed.days) parsed.days = {};
    return parsed;
  } catch (err) {
    return { days: {} };
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
