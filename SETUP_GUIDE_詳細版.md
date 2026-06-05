# LINE Bot 完整部署說明書
## 適合完全沒有程式基礎的使用者

---

## 你需要準備什麼？

| 需要的東西 | 在哪裡申請 | 費用 |
|-----------|-----------|------|
| LINE 帳號 | 你已經有了 | 免費 |
| LINE Developers 帳號 | developers.line.biz | 免費 |
| Groq API 帳號 | console.groq.com | 免費 |
| Render 帳號 | render.com | 免費 |
| GitHub 帳號 | github.com | 免費 |

---

## 第一步：建立 LINE Bot

### 1-1 進入 LINE Developers
1. 用電腦打開瀏覽器，前往：https://developers.line.biz
2. 右上角點「Log in」→ 選「Log in with LINE」
3. 輸入你的 LINE 手機號碼和密碼登入

### 1-2 建立 Provider
1. 登入後點「Create a new provider」
2. Provider name 輸入你的名字或公司名（例如：Nancy Bot）
3. 點「Create」

### 1-3 建立 Messaging API Channel
1. 點「Create a new channel」
2. 選「Messaging API」
3. 填寫以下資料：
   - **Channel type**：Messaging API（已選好）
   - **Provider**：選剛才建立的
   - **Channel icon**：可以上傳 Bot 的頭像照片（選填）
   - **Channel name**：Bot 的名稱（例如：小助理 Bot）
   - **Channel description**：隨便寫幾個字
   - **Category**：選「Entertainment」或任何一個
   - **Subcategory**：隨便選
4. 勾選同意條款
5. 點「Create」

### 1-4 取得金鑰（重要！要記下來）

**取得 Channel Secret：**
1. 進入剛建立的 Channel
2. 點上方「Basic settings」頁籤
3. 往下滾找到「Channel secret」
4. 點「Copy」複製，**貼到記事本保存**

**取得 Channel Access Token：**
1. 點上方「Messaging API」頁籤
2. 往下滾找到「Channel access token (long-lived)」
3. 點「Issue」→ 跳出視窗點「Issue」
4. 複製出現的長字串，**貼到記事本保存**

### 1-5 關閉自動回覆（重要！）
1. 在「Messaging API」頁籤
2. 找到「Auto-reply messages」→ 點旁邊的「Edit」
3. 關閉「Auto-reply messages」（切換成 Disabled）
4. 關閉「Greeting messages」（切換成 Disabled）
5. 點右上角「Save」

---

## 第二步：申請 Groq API Key

1. 打開：https://console.groq.com
2. 點「Sign Up」→ 用 Google 帳號註冊（最簡單）
3. 登入後，左側選單點「API Keys」
4. 點右上角「Create API Key」
5. Name 隨便輸入（例如：my-bot）→ 點「Submit」
6. 複製出現的 Key（**`gsk_` 開頭的長字串**）→ **貼到記事本保存**

⚠️ 這個 Key 只會顯示一次！一定要馬上複製！

---

## 第三步：設定程式

### 3-1 下載程式檔案
從你拿到的檔案中找到 `bot_template.py`，用記事本或 Notepad++ 打開

### 3-2 自訂角色（在程式最上面）
找到以下區塊，修改角色設定：

```python
# ════════════ 在這裡自訂你的角色 ════════════

CHARACTER_NAME = "Jin"        # ← 改成角色名字

CHARACTER_PERSONA = """..."""  # ← 改成角色個性描述

CHARACTER_STATUS = """..."""   # ← 角色目前狀態（可空白）
```

**角色個性範例（複製後修改）：**
```python
CHARACTER_PERSONA = """你是一個親切的助理。
說話專業但不失溫暖，用繁體中文，偶爾用 emoji。
鼓勵對方，幫助他們完成工作。"""
```

### 3-3 填入金鑰
往下找到金鑰設定區：
```python
GROQ_API_KEY        = os.environ.get("GROQ_API_KEY",        "在這裡貼上Groq金鑰")
LINE_CHANNEL_SECRET = os.environ.get("LINE_CHANNEL_SECRET", "在這裡貼上Channel_Secret")
LINE_ACCESS_TOKEN   = os.environ.get("LINE_ACCESS_TOKEN",   "在這裡貼上Access_Token")
```

把引號裡的說明文字換成你從記事本複製的對應金鑰。

---

## 第四步：上傳到 GitHub

### 4-1 建立 GitHub 帳號
1. 前往：https://github.com
2. 點「Sign up」→ 輸入 Email、密碼、帳號名
3. 驗證 Email 完成

### 4-2 建立新的 Repository（倉庫）
1. 登入 GitHub 後，點右上角「+」→「New repository」
2. Repository name：輸入 `my-linebot`（或任何名字）
3. 選「Public」
4. 勾選「Add a README file」
5. 點「Create repository」

### 4-3 上傳程式檔案
1. 進入剛建立的 Repository 頁面
2. 點「Add file」→「Upload files」
3. 把 `bot_template.py` 拖曳到上傳區域
4. 點下方「Commit changes」
5. 重複上傳 `requirements.txt`（內容：`schedule` 和 `requests` 兩行）

---

## 第五步：部署到 Render（24小時運行）

### 5-1 建立 Render 帳號
1. 前往：https://render.com
2. 點「Get Started for Free」→ 用 Google 帳號登入（最簡單）

### 5-2 建立 Web Service
1. 登入後點右上角「New +」→「Web Service」
2. 選「Build and deploy from a Git repository」→ 點「Next」
3. 點「Connect」連接 GitHub → 授權 Render 存取你的 GitHub
4. 找到 `my-linebot` → 點「Connect」

### 5-3 設定服務
填寫以下資料：

| 欄位 | 填入內容 |
|------|---------|
| Name | 任意（例如：my-linebot） |
| Region | Singapore（選最近的） |
| Branch | main |
| Runtime | Python 3 |
| Build Command | `pip install schedule requests` |
| Start Command | `python bot_template.py` |
| Instance Type | **Free** |

點「Create Web Service」

### 5-4 新增環境變數（金鑰）
部署開始後：
1. 左側點「Environment」
2. 點「Add Environment Variable」，依序新增：

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | 你的 Groq Key（gsk_ 開頭） |
| `LINE_CHANNEL_SECRET` | 你的 Channel Secret |
| `LINE_ACCESS_TOKEN` | 你的 Access Token |

3. 點「Save Changes」→ 等待自動重新部署

### 5-5 等待部署完成
- 部署需要約 3-5 分鐘
- 看到左上角狀態變成綠色 **「Live」** 表示成功
- 記下你的服務網址（例如：`https://my-linebot.onrender.com`）

---

## 第六步：設定 LINE Webhook

1. 回到 LINE Developers → 進入你的 Channel
2. 點「Messaging API」頁籤
3. 找到「Webhook URL」→ 點「Edit」
4. 輸入：`https://你的服務名稱.onrender.com/callback`
   （把「你的服務名稱」換成 Render 給你的網址，後面加 /callback）
5. 點「Update」
6. 點「Verify」→ 出現 **「Success」** 表示成功！
7. 確認「Use webhook」已開啟（綠色）

---

## 第七步：加 Bot 為好友並測試

1. 在 LINE Developers「Messaging API」頁面找到 **QR Code**
2. 用 LINE 掃描加好友
3. 傳訊息「幫助」給 Bot，如果有回覆就成功了！

---

## 第八步：防止 Render 休眠（強烈建議）

Render 免費版超過 15 分鐘沒人使用就會「睡著」，提醒訊息會不準時。

**解決方法：UptimeRobot（免費）**

1. 前往：https://uptimerobot.com
2. 免費註冊帳號
3. 點「Add New Monitor」
4. 設定：
   - Monitor Type：`HTTP(s)`
   - Friendly Name：`我的LineBot`
   - URL：`https://你的服務名稱.onrender.com`
   - Monitoring Interval：`14 minutes`
5. 點「Create Monitor」

設定好後，Bot 會 24 小時都醒著！

---

## 常見問題排解

### Bot 沒有回應？
1. 到 Render 後台查看「Logs」
2. 確認服務狀態是「Live」（綠色）
3. 確認 Webhook URL 最後有 `/callback`
4. 確認 Verify 是「Success」

### 收不到提醒？
- 可能是 Render 在睡眠狀態 → 設定 UptimeRobot
- 或是 LINE 免費推播 200 則已用完 → 到 LINE Official Account Manager 查看

### 任務重啟後消失？
- Render 免費版重啟會清除暫存
- 解決方法：申請 JSONBin.io（免費），詳見進階設定

### 金鑰填錯？
- 到 Render「Environment」頁面修改
- 改完後點「Save Changes」，Render 會自動重新部署

---

## 如何修改 Bot 名稱和個性

1. 打開 `bot_template.py`
2. 找到最頂部的角色設定區
3. 修改 `CHARACTER_NAME`、`CHARACTER_PERSONA`
4. 存檔後重新上傳到 GitHub
5. Render 會自動重新部署（約 2-3 分鐘）

---

## 聯絡技術支援

如果遇到問題，把以下資訊截圖：
1. Render Logs 的錯誤訊息
2. LINE Developers Webhook 設定頁面
3. Bot 回覆的錯誤訊息

---

*說明書版本：2026年6月*
