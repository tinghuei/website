# LINE Bot 部署說明書

## 這個 Bot 可以做什麼？
- 📝 **記錄任務與提醒** — 傳文字給 Bot，自動建立提醒
- 📸 **拍照辨識手寫清單** — 分類緊急/可緩的事項
- 📅 **固定行程提醒** — 每月/每週固定的事自動提醒
- ✏️ **編輯、刪除任務** — 完整任務管理
- 💬 **角色聊天** — 可自訂成你喜歡的角色（預設為 BTS Jin）

---

## 第一步：申請 LINE Bot

1. 前往 [LINE Developers](https://developers.line.biz/)，用 LINE 帳號登入
2. 點「Create a new provider」→ 輸入名稱（隨便取）
3. 點「Create a new channel」→ 選「Messaging API」
4. 填寫資料：
   - Channel name：你的 Bot 名稱（例如：Jin Bot）
   - Channel description：隨便填
   - Category / Subcategory：選任一個
5. 建立後進入 channel，記下以下兩個資料：
   - **Channel secret**（在 Basic settings 頁面）
   - **Channel access token**（在 Messaging API 頁面，點 Issue 取得）

---

## 第二步：申請 Groq API Key（免費）

1. 前往 [console.groq.com](https://console.groq.com)
2. 用 Google 帳號註冊登入
3. 點左側「API Keys」→「Create API Key」
4. 複製你的 **API Key**（gsk_ 開頭）

---

## 第三步：下載並設定程式

1. 下載 `bot_template.py`
2. 用記事本或 VS Code 打開，找到最頂部的**角色設定區**：

```python
# ── 在這裡自訂你的角色 ──
CHARACTER_NAME = "Jin"          # ← 改成你的角色名稱

CHARACTER_PERSONA = """..."""   # ← 描述角色個性

CHARACTER_STATUS = """..."""    # ← 角色目前動態（選填）
```

3. 往下找到**金鑰設定區**，填入你的金鑰：

```python
GROQ_API_KEY        = os.environ.get("GROQ_API_KEY",        "貼上你的Groq金鑰")
LINE_CHANNEL_SECRET = os.environ.get("LINE_CHANNEL_SECRET", "貼上LINE Channel Secret")
LINE_ACCESS_TOKEN   = os.environ.get("LINE_ACCESS_TOKEN",   "貼上LINE Access Token")
```

> **注意**：如果要部署到雲端，金鑰填在 Render 的環境變數就好，程式裡不用填。

---

## 第四步：部署到 Render（免費雲端，24 小時運行）

1. 前往 [render.com](https://render.com)，用 Google 帳號註冊
2. 點「New +」→「Web Service」
3. 選「Deploy from existing code」→「Public Git repository」
   - 或直接上傳你的程式碼（需要先放到 GitHub）
4. 設定：
   - **Name**：任意（例如 my-linebot）
   - **Region**：選最近的（Singapore）
   - **Build Command**：`pip install schedule requests`
   - **Start Command**：`python bot_template.py`
   - **Instance Type**：Free
5. 點「Advanced」→「Add Environment Variable」，新增三個環境變數：

| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | 你的 Groq API Key |
| `LINE_CHANNEL_SECRET` | 你的 LINE Channel Secret |
| `LINE_ACCESS_TOKEN` | 你的 LINE Access Token |

6. 點「Create Web Service」，等待部署完成（約 2-3 分鐘）
7. 記下你的服務網址，例如：`https://my-linebot.onrender.com`

---

## 第五步：設定 LINE Webhook

1. 回到 [LINE Developers](https://developers.line.biz/)，進入你的 channel
2. 點「Messaging API」頁籤
3. 找到「Webhook URL」，點「Edit」
4. 輸入：`https://你的服務名稱.onrender.com/callback`
5. 點「Update」→ 點「Verify」
6. 出現「Success」表示成功！

---

## 第六步：加 Bot 為好友開始使用

1. 在 LINE Developers「Messaging API」頁面找到 QR Code
2. 用 LINE 掃描加為好友
3. 傳訊息給 Bot 開始使用！

---

## 防止 Render 免費版休眠（建議）

Render 免費版超過 15 分鐘沒有請求就會休眠，導致提醒不準時。

解決方法：使用 [UptimeRobot](https://uptimerobot.com)（免費）

1. 前往 uptimerobot.com 註冊
2. 點「Add New Monitor」
3. 設定：
   - Monitor Type：HTTP(s)
   - Friendly Name：任意
   - URL：`https://你的服務名稱.onrender.com`
   - Monitoring Interval：每 14 分鐘
4. 點「Create Monitor」

設定完成後，Bot 會全天候運行！

---

## Bot 使用說明

傳送這些指令給 Bot：

| 指令 | 說明 |
|------|------|
| 直接傳文字 | 建立任務（例如：「明天下午3點開會」） |
| 傳照片 | 辨識手寫清單，分緊急/緩 |
| 查看任務 | 列出所有待辦事項 |
| 完成 任務名稱 | 標記完成 |
| 延後30 任務名稱 | 延後 30 分鐘提醒 |
| 編輯 任務名稱 | 編輯任務 |
| 刪除任務 名稱 | 刪除指定任務 |
| 刪除全部任務 | 清空所有任務 |
| 記住 每月25號... | 設定固定行程 |
| 查看固定行程 | 列出所有固定行程 |
| 刪除固定 名稱 | 刪除固定行程 |
| 幫助 | 顯示使用說明 |

---

## 角色自訂範例

### 範例一：換成自己偶像
```python
CHARACTER_NAME = "智秀"
CHARACTER_PERSONA = """You are BLACKPINK Jisoo. Sweet, elegant, funny.
Speak in 繁體中文, sometimes mix Korean. Be warm and encouraging."""
CHARACTER_STATUS = "BLACKPINK 目前各自有個人活動，智秀很積極努力中。"
```

### 範例二：換成原創角色
```python
CHARACTER_NAME = "小助理"
CHARACTER_PERSONA = """你是一個可愛的AI小助理。說話活潑，用emoji，
偶爾搞笑但認真負責。說繁體中文。"""
CHARACTER_STATUS = ""
```

### 範例三：嚴肅商務風
```python
CHARACTER_NAME = "效率助手"
CHARACTER_PERSONA = """You are a professional productivity assistant.
Be concise, clear, and efficient. No fluff. Use 繁體中文.
Focus on actionable tasks and deadlines."""
CHARACTER_STATUS = ""
```

---

## 常見問題

**Q：Webhook Verify 失敗？**
A：確認 Render 已成功部署（服務狀態為 Live），且 Webhook URL 正確（結尾要有 /callback）

**Q：Bot 沒有回應？**
A：在 Render 後台查看 Logs，找錯誤訊息。常見原因：API Key 填錯、LINE Token 過期

**Q：提醒沒有在時間到的時候發送？**
A：Render 免費版可能在休眠，請設定 UptimeRobot

**Q：Groq API Key 額度用完了？**
A：到 [console.groq.com](https://console.groq.com) 查看使用量。免費版每天有限制，一般個人使用不會超過

**Q：任務資料在 Render 重啟後消失？**
A：Render 免費版的 /tmp 資料夾重啟會清空，這是免費版限制。付費版或使用外部資料庫可解決

---

## 需要幫助？

把這份說明書連同 `bot_template.py` 一起傳給朋友即可！
