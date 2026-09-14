/**
 * 產線月曆看板 — Google Apps Script 後端
 *
 * 部署方式請見 calendar/README.md。這支程式把資料存在「目前綁定的 Google 試算表」
 * 的 CalendarData 工作表裡,每一列是一個「部門_年-月」的月曆,JSON 欄位存整月資料。
 */

var SHEET_NAME = 'CalendarData';
var LOG_SHEET_NAME = 'AuditLog';

// 內部共用的編輯密碼。任何人拿到這組密碼都能修改資料,請自行更換成公司內部的密碼,
// 不要用預設值。只有「儲存」需要密碼,單純瀏覽不需要。
var EDIT_PIN = '請改成你自己的密碼';

// 身分驗證(選用)。設定其中一個或兩個,要跟 index.html 裡的 LIFF_ID / GOOGLE_CLIENT_ID
// 搭配使用。設定好之後,存檔一定要通過對應的驗證,不能只靠使用者自己打的姓名冒充別人。
// 兩個都留空的話,維持舊行為:相信前端傳來的姓名文字。設定步驟見 calendar/README.md。
var GOOGLE_CLIENT_ID = ''; // 例如 'xxxxxxxxxxxx.apps.googleusercontent.com'
var LINE_CHANNEL_ID = ''; // 你的 LINE Messaging API channel 的 Channel ID(純數字字串)

function doGet(e) {
  var action = e.parameter.action || 'get';
  if (action === 'log') return handleGetLog(e);

  var key = e.parameter.key;
  if (!key) return jsonResponse({ ok: false, error: 'missing_key' });
  var sheet = getSheet();
  var row = findRow(sheet, key);
  var data = row ? safeParse(row[1]) : { days: {} };
  return jsonResponse({ ok: true, data: data });
}

function handleGetLog(e) {
  var key = e.parameter.key;
  if (!key) return jsonResponse({ ok: false, error: 'missing_key' });
  var logSheet = getLogSheet();
  var values = logSheet.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    if (values[i][1] === key) {
      rows.push({
        timestamp: values[i][0],
        day: values[i][2],
        name: values[i][3],
        summary: values[i][4]
      });
    }
  }
  rows.sort(function (a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
  return jsonResponse({ ok: true, logs: rows.slice(0, 30) });
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

  var who = resolveIdentity(body);
  if (!who) {
    return jsonResponse({ ok: false, error: 'identity_failed' });
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
    var oldDayData = data.days[String(body.day)] || { leave: [], items: [] };
    data.days[String(body.day)] = body.dayData;
    sheet.getRange(rowIndex, 2).setValue(JSON.stringify(data));
    sheet.getRange(rowIndex, 3).setValue(new Date());

    var summary = describeDayDiff(oldDayData, body.dayData);
    getLogSheet().appendRow([new Date(), body.key, body.day, who, summary]);

    return jsonResponse({ ok: true, data: data });
  } finally {
    lock.releaseLock();
  }
}

// 驗證身分,回傳真正要記錄的姓名字串;驗證失敗回傳 null。
// 優先順序:Google ID token → LINE access token → (兩者都沒設定時)前端傳來的姓名文字。
function resolveIdentity(body) {
  if (GOOGLE_CLIENT_ID && body.googleToken) {
    try {
      var gres = UrlFetchApp.fetch(
        'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(body.googleToken),
        { muteHttpExceptions: true }
      );
      if (gres.getResponseCode() !== 200) return null;
      var gdata = JSON.parse(gres.getContentText());
      if (gdata.aud !== GOOGLE_CLIENT_ID) return null; // token 不是發給這個網頁的,可能是別人的
      if (Number(gdata.exp) < Math.floor(Date.now() / 1000)) return null; // 過期
      var gname = (gdata.name || gdata.email || '').toString().trim();
      return gname || null;
    } catch (err) {
      return null;
    }
  }

  if (LINE_CHANNEL_ID && body.lineAccessToken) {
    try {
      var vres = UrlFetchApp.fetch(
        'https://api.line.me/oauth2/v2.1/verify?access_token=' + encodeURIComponent(body.lineAccessToken),
        { muteHttpExceptions: true }
      );
      if (vres.getResponseCode() !== 200) return null;
      var vdata = JSON.parse(vres.getContentText());
      if (String(vdata.client_id) !== String(LINE_CHANNEL_ID)) return null; // token 不是發給這個 LINE 頻道的
      var pres = UrlFetchApp.fetch('https://api.line.me/v2/profile', {
        headers: { Authorization: 'Bearer ' + body.lineAccessToken },
        muteHttpExceptions: true
      });
      if (pres.getResponseCode() !== 200) return null;
      var pdata = JSON.parse(pres.getContentText());
      var lname = (pdata.displayName || '').toString().trim();
      return lname || null;
    } catch (err) {
      return null;
    }
  }

  if (!GOOGLE_CLIENT_ID && !LINE_CHANNEL_ID) {
    // 尚未設定任何身分驗證,退回舊行為:相信前端傳來的姓名文字(不保證是本人)
    var name = (body.name || '').toString().trim();
    return name || null;
  }

  return null; // 有設定驗證,但這次請求沒有帶有效的 token
}

// 比較同一天新舊資料,產生「新增/刪除/更正了什麼」的白話摘要,用於異動紀錄。
// 用「內容文字」比對而非陣列位置,所以使用者在表單裡重新排序不會被誤判成新增/刪除。
function describeDayDiff(oldData, newData) {
  oldData = oldData || {};
  newData = newData || {};
  var oldLeave = oldData.leave || [];
  var newLeave = newData.leave || [];
  var oldItems = oldData.items || [];
  var newItems = newData.items || [];
  var parts = [];

  var oldLeaveNames = oldLeave.map(function (l) { return l.name; });
  var newLeaveNames = newLeave.map(function (l) { return l.name; });
  newLeave.forEach(function (l) {
    if (oldLeaveNames.indexOf(l.name) === -1) parts.push('新增請假:' + l.name + (l.type ? '(' + l.type + ')' : ''));
  });
  oldLeave.forEach(function (l) {
    if (newLeaveNames.indexOf(l.name) === -1) parts.push('刪除請假:' + l.name);
  });

  var oldItemTexts = oldItems.map(function (i) { return i.text; });
  var newItemTexts = newItems.map(function (i) { return i.text; });
  newItems.forEach(function (i) {
    if (oldItemTexts.indexOf(i.text) === -1) parts.push('新增事項:' + i.text);
  });
  oldItems.forEach(function (i) {
    if (newItemTexts.indexOf(i.text) === -1) parts.push('刪除事項:' + i.text);
  });
  newItems.forEach(function (newIt) {
    var oldIt = null;
    for (var i = 0; i < oldItems.length; i++) {
      if (oldItems[i].text === newIt.text) { oldIt = oldItems[i]; break; }
    }
    if (!oldIt) return;
    if (!!oldIt.done !== !!newIt.done) parts.push((newIt.done ? '標記完成:' : '取消完成:') + newIt.text);
    if ((oldIt.owner || '') !== (newIt.owner || '')) parts.push('更正負責人:' + newIt.text + '→' + (newIt.owner || '未指定'));
  });

  return parts.length ? parts.join('; ') : '無變更';
}

function getLogSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LOG_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(LOG_SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Key', 'Day', 'Name', 'Summary']);
  }
  return sheet;
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
