# 產線月曆看板

`index.html` 是一個獨立的網頁版月曆看板,不需要員工登入任何帳號。手機可以直接開連結填寫請假/事項,
右側會自動彙整成本月事項清單,也可以匯出成一張圖片存到手機、列印貼在公佈欄。

資料存在你自己的 Google 試算表裡(不是 Claude 或任何第三方平台),透過 Google Apps Script 提供一個
「不需登入就能讀寫」的網址給這個網頁呼叫。

## 這個資料夾裡有什麼

```
calendar/
├── index.html          ← 網頁本體,設定好後端網址就能直接開啟使用
├── apps-script/
│   └── Code.gs          ← 貼到 Google Apps Script 的後端程式
└── README.md            ← 這份說明
```

## 設定步驟(第一次設定,約 10 分鐘)

### 1. 建立 Google 試算表

1. 到 [sheets.google.com](https://sheets.google.com) 新增一份空白試算表,取名例如「產線月曆看板資料庫」
2. 不用自己建欄位,程式第一次寫入時會自動建立 `CalendarData` 工作表

### 2. 貼上後端程式

1. 在試算表選單點「擴充功能」→「Apps Script」
2. 把預設的 `Code.gs` 內容全部刪除,貼上 `calendar/apps-script/Code.gs` 的完整內容
3. 找到程式最上面這一行:
   ```js
   var EDIT_PIN = '請改成你自己的密碼';
   ```
   改成公司內部要共用的編輯密碼(只有「儲存」會用到,純瀏覽不用密碼)
4. 點上方「儲存」(磁片圖示)

### 3. 部署成網頁應用程式

1. 點右上角「部署」→「新增部署作業」
2. 類型選「網頁應用程式」
3. 設定:
   - **執行身分**:我(你的 Google 帳號)
   - **誰可以存取**:**任何人**(這一步一定要選「任何人」,否則員工打不開)
4. 點「部署」,第一次會跳出 Google 的授權畫面,點「授權存取」→ 選你的帳號 → 「進階」→「前往(專案名稱)(不安全)」→「允許」
   (這個警告是 Google 對「未驗證」個人專案的標準提示,因為是你自己的試算表跟腳本,可以放心允許)
5. 部署完成後,複製那組網址,結尾會是 `/exec`,長得像:
   ```
   https://script.google.com/macros/s/AKfycb.................../exec
   ```

### 4. 把網址貼進網頁

打開 `calendar/index.html`,找到這一段(在 `<script>` 開頭附近):

```js
const APPS_SCRIPT_URL = ""; // 例如 "https://script.google.com/macros/s/AKfycb.../exec"
```

把網址貼進雙引號中間,存檔。

### 5. 部署這個網頁本身

`index.html` 是純靜態檔案,不需要伺服器,任何靜態網頁託管都能放,例如:

- **GitHub Pages**(免費,最簡單):在這個 repo 的設定裡開啟 GitHub Pages,指向 `calendar/` 資料夾,
  之後網址會是 `https://<你的帳號或網域>/calendar/`
- 或直接把 `calendar/` 整個資料夾放進公司現有的網站空間

部署好之後,把最終網址設成 LINE 官方帳號圖文選單「公司行事曆」按鈕的連結,員工點一下就能開啟。

### 6.(選用但建議)設定真正的身分驗證

預設情況下,存檔前只是請大家自己打姓名,沒辦法防止有人打別人的名字。想要真正驗證身分、避免冒名,
可以設定下面兩個之一或都設定(在 LINE 裡開啟用 LINE 身分,一般瀏覽器開啟用 Google 身分,兩邊都設定
的話會自動挑對的那個):

#### 6a. 設定 Google 登入驗證

1. 到 [Google Cloud Console](https://console.cloud.google.com/) → 選一個專案(或新建一個)
2. 左側選單「API 和服務」→「憑證」→「建立憑證」→「OAuth 用戶端 ID」
3. 如果是第一次用,系統會先請你設定「OAuth 同意畫面」,使用者類型選「內部」(如果你們是 Google
   Workspace 公司帳號)或「外部」,基本資料隨便填,儲存即可
4. 應用程式類型選「**網頁應用程式**」
5. 「已授權的 JavaScript 來源」新增你日曆網頁的網址(例如 `https://tinghuei.github.io`,**不要**加
   路徑,只要到網域那一段)
6. 點「建立」,複製產生的**用戶端 ID**(長得像 `xxxxxxxxxxxx.apps.googleusercontent.com`)
7. 把這組 ID **同時**貼到兩個地方:
   - `calendar/index.html` 裡的 `const GOOGLE_CLIENT_ID = "";`
   - `calendar/apps-script/Code.gs` 裡的 `var GOOGLE_CLIENT_ID = '';`
   兩邊要一模一樣,少貼一邊驗證會失敗

#### 6b. 設定 LINE 身分驗證(LIFF)

1. 到 [LINE Developers Console](https://developers.line.biz/console/),打開你公司官方帳號對應的
   Messaging API channel
2. 在「Basic settings」頁面記下 **Channel ID**(一串數字),等一下要貼到 `Code.gs`
3. 切到「LIFF」頁籤 →「Add」新增一個 LIFF app
4. 設定:
   - **LIFF app name**:隨便取,例如「公司行事曆」
   - **Size**:選 Full 或 Tall
   - **Endpoint URL**:貼你日曆網頁部署好的完整網址(例如
     `https://tinghuei.github.io/website/calendar/`)
   - **Scope**:至少勾選 `profile`
5. 建立後複製 **LIFF ID**(長得像 `1234567890-abcdefghij`)
6. 貼到 `calendar/index.html` 裡的 `const LIFF_ID = "";`
7. 把第 2 步記下的 **Channel ID** 貼到 `calendar/apps-script/Code.gs` 裡的 `var LINE_CHANNEL_ID = '';`

#### 設定完成後

- `Code.gs` 有改動,記得回到 Apps Script 編輯器貼上最新內容 → 存檔 →「部署」→「管理部署作業」→
  編輯 → 版本選「新版本」→ 部署,才會真的生效
- `index.html` 這邊直接部署最新版網頁即可(GitHub Pages 會自動重新建置)
- 之後存檔會改成:在 LINE 裡開啟就自動用 LINE 身分,在一般瀏覽器開啟就跳出「使用 Google 登入」按鈕,
  不會再讓人自己打姓名

## 之後每次更新程式碼怎麼辦

如果之後有調整 `Code.gs` 的內容,記得回到 Apps Script 編輯器「部署」→「管理部署作業」→
點編輯(鉛筆圖示)→ 版本選「新版本」→ 部署,網址不會變,但一定要出新版本改動才會生效。

## 已知限制

- **不是即時同步**:網頁每 8 秒自動抓一次最新資料(輪詢),不是像聊天軟體那樣毫秒級即時,兩個人同時編輯
  同一天可能會後存的蓋掉先存的(last-write-wins),對月曆這種用途通常沒有實際影響
- **編輯密碼是共用的,姓名預設是自己打的**:所有能儲存的人共用同一組密碼。如果沒有另外做「6.設定真正的
  身分驗證」那一步,存檔時只是請大家自報姓名,存在該裝置本機記住,之後每次存檔都會帶上這個名字,記錄
  在試算表的 `AuditLog` 分頁(時間、部門月份、哪一天、姓名、改了什麼)——這種情況下姓名可以被冒充,
  不能當作正式的稽核依據。設定好 Google 或 LINE 身分驗證後,記錄的姓名會改成伺服器驗證過的真實身分,
  沒辦法冒充別人。網頁上沒有顯示異動紀錄的畫面,要查誰改了什麼,直接打開 Google 試算表看 `AuditLog`
  分頁即可
- **Google Apps Script 有基本的配額限制**(每人每日執行次數等),一般公司內部規模的使用量不會超過,
  但如果之後用量變大,可以考慮換成 Firebase 等專門的資料庫服務
- 我(Claude)沒有你的 Google 帳號權限,無法在這裡實際建立試算表或部署 Apps Script 並測試,
  上面的 `Code.gs` 是照 Apps Script 的標準寫法完成,但**請務必照著步驟自己部署後實際測試一次**
  (打開頁面、新增一筆請假/事項、重新整理確認有存進 Google 試算表),確認沒問題再正式給員工使用。
