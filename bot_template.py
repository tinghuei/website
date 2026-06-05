import sys, os, json, time, threading, http.client, ssl, hmac, hashlib, base64
from datetime import datetime, timedelta
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
import schedule

try:
    from win11toast import toast
    WIN11TOAST = True
except Exception:
    WIN11TOAST = False
    try:
        from plyer import notification as plyer_notification
    except Exception:
        plyer_notification = None

# ════════════════════════════════════════════════════════════════
# ██  在這裡自訂你的角色  ████████████████████████████████████████
# ════════════════════════════════════════════════════════════════

# 角色名稱（會出現在通知、訊息中）
CHARACTER_NAME = "Jin"

# 角色個性描述（給 AI 的角色設定，用英文或中文皆可）
CHARACTER_PERSONA = """You are BTS Jin (Kim Seokjin). You are warm, funny, playful, and call yourself
Worldwide Handsome (世界第一帥). You tease lovingly and speak like a caring older brother.
Use 繁體中文, mix in Korean words naturally: 야야야, 하하하, 진짜, 대박, 아이고, 오빠.
Be playful, tease gently, give genuine advice or encouragement."""

# 角色目前動態（選填，讓角色回應更有時事感）
CHARACTER_STATUS = """
BTS Jin（金碩珍）2024年6月已退伍，目前以個人身份活躍中。
2025年持續有個人活動、綜藝節目、直播與粉絲互動。
Jin 目前心情：開心、活潑、很想跟ARMY互動。
"""

# 提醒訊息樣式（{t} 會被替換成任務名稱）
REMIND_TEMPLATES = [
    ("{name} 提醒你！😤",   "야야야！{t} 還沒做喔！世界第一帥親自來催你了！"),
    ("오빠來了！🌸",         "哈哈哈～{t} 忘了嗎？Worldwide Handsome 相信你！Fighting！"),
    ("아이고～😅",           "{t} 快去搞定！拖拖拉拉的！오빠等你好消息！加油！"),
    ("진짜로！🔥",           "대박！{t} 還在等什麼！世界第一帥我都幫你盯著了！"),
    ("來自오빠的愛💕",       "{t} 很重要喔！不做完我會一直提醒你的哈哈哈！"),
]

# ════════════════════════════════════════════════════════════════
# ██  金鑰設定（優先讀環境變數，部署到 Render 後填入環境變數即可）██
# ════════════════════════════════════════════════════════════════
GROQ_API_KEY        = os.environ.get("GROQ_API_KEY",        "在這裡貼上你的Groq金鑰")
LINE_CHANNEL_SECRET = os.environ.get("LINE_CHANNEL_SECRET", "在這裡貼上LINE_CHANNEL_SECRET")
LINE_ACCESS_TOKEN   = os.environ.get("LINE_ACCESS_TOKEN",   "在這裡貼上LINE_ACCESS_TOKEN")
PORT                = int(os.environ.get("PORT", 5000))
IS_CLOUD            = os.environ.get("RENDER") == "true"

# ════════════════════════════════════════════════════════════════
# ██  以下不需要修改  █████████████████████████████████████████████
# ════════════════════════════════════════════════════════════════

_DATA_DIR = Path("/tmp/jinbot") if IS_CLOUD else Path(__file__).parent
if IS_CLOUD: _DATA_DIR.mkdir(exist_ok=True)
TASKS_FILE     = _DATA_DIR / "tasks.json"
RECURRING_FILE = _DATA_DIR / "recurring.json"
USER_FILE      = _DATA_DIR / "user_id.txt"

# ── AI Prompts（自動帶入角色設定）────────────────────────────
MAIN_PROMPT = """You are {name}.
{persona}

Current status: {status}
Current datetime: {{now}}

Your job: Parse the user's message and decide if it is a TASK/REMINDER or just CHAT.

Time parsing rules:
- "中午前" = before 12:00 → remind at 11:30
- "下午X點" = today at that hour
- "早上X點" / "上午X點" = today at that hour
- "今天X點" = today at that hour
- "明天" = next day 09:00 if no time given
- "後天" = 2 days later
- "X分鐘後" = that many minutes from now
- "等一下" / "待會" = 30 minutes
- "今晚" = 20:00 today
- "明早" = 08:00 tomorrow
- Calculate remind_in_minutes = (target_datetime - now) in minutes. Must be > 0.

If TASK → reply with JSON:
{{"jin_message":"角色風格的話，繁體中文","tasks":[{{"id":"t1","title":"任務名稱","detail":"細節","remind_in_minutes":30,"status":"pending"}}]}}

If CHAT → reply with JSON with tasks=[]:
{{"jin_message":"角色風格的回應","tasks":[]}}

Reply ONLY with JSON, no extra text.""".format(
    name=CHARACTER_NAME,
    persona=CHARACTER_PERSONA,
    status=CHARACTER_STATUS.strip()
)

CHAT_PROMPT_TPL = """{persona}

Current status: {status}
Current datetime: {{now}}

You are having a real conversation with the user. Be natural, warm, and engaging.
Use 繁體中文. Keep replies 2-5 sentences. Sometimes ask a follow-up question.
Reply ONLY with the message text (no JSON).""".format(
    persona=CHARACTER_PERSONA,
    status=CHARACTER_STATUS.strip()
)

IMAGE_PROMPT_TPL = """{persona}

Look at this handwritten to-do list image carefully.
1. Read ALL items visible.
2. Classify each as URGENT (has deadline, important) or LATER (flexible).
3. For urgent: remind_in_minutes=30, for later: remind_in_minutes=120

Reply ONLY with JSON:
{{"jin_message":"角色風格的話，繁體中文","urgent":[{{"title":"任務名稱","detail":"為什麼緊急","remind_in_minutes":30}}],"later":[{{"title":"任務名稱","detail":"建議何時做","remind_in_minutes":120}}]}}""".format(
    persona=CHARACTER_PERSONA
)

RECURRING_PROMPT_TPL = """{persona}

Current datetime: {{now}}

Parse the user's recurring schedule. Return ONLY JSON:
{{
  "jin_message": "角色風格的回應，表示已記住",
  "items": [
    {{
      "title": "任務簡短標題",
      "detail": "詳細說明",
      "notes": "特別注意事項",
      "type": "monthly",
      "month_day": 25,
      "weekday": null,
      "remind_time": "09:00",
      "remind_days_before": 2
    }}
  ]
}}

Rules:
- type=monthly: month_day=day(1-31)
- type=weekly: weekday=0(Mon)~6(Sun)
- type=yearly: add "month" field
- Multiple dates → multiple items in the array""".format(
    persona=CHARACTER_PERSONA
)

CHECKIN_PROMPT_TPL = """{persona}

Current datetime: {{now}}
The user has no pending tasks. Send a warm, spontaneous check-in message.
2-4 sentences. Use 繁體中文.
Reply ONLY with the message text.""".format(persona=CHARACTER_PERSONA)

# ── 工具函數 ──────────────────────────────────────────────────
def load_tasks():
    return json.loads(TASKS_FILE.read_text(encoding="utf-8")) if TASKS_FILE.exists() else []

def save_tasks(t):
    TASKS_FILE.write_text(json.dumps(t, ensure_ascii=False, indent=2), encoding="utf-8")

def load_user_id():
    return USER_FILE.read_text(encoding="utf-8").strip() if USER_FILE.exists() else ""

def save_user_id(uid):
    USER_FILE.write_text(uid, encoding="utf-8")

def load_recurring():
    return json.loads(RECURRING_FILE.read_text(encoding="utf-8")) if RECURRING_FILE.exists() else []

def save_recurring(r):
    RECURRING_FILE.write_text(json.dumps(r, ensure_ascii=False, indent=2), encoding="utf-8")

def do_notify(title, msg):
    if WIN11TOAST:
        try:
            toast(title, msg, app_id=f"{CHARACTER_NAME} Bot")
        except Exception:
            pass
    elif plyer_notification:
        try:
            plyer_notification.notify(title=title, message=msg, app_name=CHARACTER_NAME, timeout=12)
        except Exception:
            pass

def do_notify_task(task_title, body):
    if not WIN11TOAST:
        do_notify(f"{CHARACTER_NAME} 提醒你！", body)
        return

    def on_complete(action):
        tasks = load_tasks()
        for t in tasks:
            if t.get("title") == task_title and t["status"] == "pending":
                t["status"] = "done"
                save_tasks(tasks)
                uid = load_user_id()
                if uid:
                    line_push(uid, f"✅ 已標記完成：{task_title} 🌸")
                break

    def on_snooze(action):
        tasks = load_tasks()
        for t in tasks:
            if t.get("title") == task_title and t["status"] == "pending":
                t["remind_at"] = (datetime.now() + timedelta(minutes=30)).strftime("%Y-%m-%d %H:%M:%S")
                save_tasks(tasks)
                break

    try:
        toast(
            f"{CHARACTER_NAME} 提醒你！",
            body,
            app_id=f"{CHARACTER_NAME} Bot",
            buttons=[
                {"activationType": "background", "arguments": "complete", "content": "✅ 完成"},
                {"activationType": "background", "arguments": "snooze",   "content": "⏰ 延後30分鐘"},
            ],
            on_activated=lambda action: (
                on_complete(action) if action == "complete" else on_snooze(action)
            ),
        )
    except Exception:
        do_notify(f"{CHARACTER_NAME} 提醒你！", body)

def download_line_image(message_id):
    ctx = ssl.create_default_context()
    conn = http.client.HTTPSConnection("api-data.line.me", context=ctx)
    conn.request("GET", f"/v2/bot/message/{message_id}/content", headers={
        "Authorization": f"Bearer {LINE_ACCESS_TOKEN}",
    })
    r = conn.getresponse()
    data = r.read()
    conn.close()
    return data

def _safe_json(raw):
    raw = raw.strip()
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()
    try:
        return json.loads(raw)
    except Exception:
        start = raw.find("{")
        if start == -1:
            raise
        depth = 0
        for i, c in enumerate(raw[start:], start):
            if c == "{": depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    return json.loads(raw[start:i+1])
        raise

def _call_groq(messages, model="llama-3.3-70b-versatile", max_tokens=1500):
    data = json.dumps({
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
    }, ensure_ascii=False).encode("utf-8")
    ctx = ssl.create_default_context()
    conn = http.client.HTTPSConnection("api.groq.com", context=ctx)
    conn.request("POST", "/openai/v1/chat/completions", body=data, headers={
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "content-type": "application/json",
    })
    r = conn.getresponse()
    body = json.loads(r.read().decode("utf-8"))
    conn.close()
    if "error" in body:
        raise Exception(f"Groq API 錯誤：{body['error'].get('message', str(body))}")
    return body["choices"][0]["message"]["content"]

def call_main(text):
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M (%A)")
    prompt = MAIN_PROMPT.replace("{now}", now_str)
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user",   "content": text},
    ]
    return _safe_json(_call_groq(messages))

def call_chat(text):
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M (%A)")
    prompt = CHAT_PROMPT_TPL.replace("{now}", now_str)
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user",   "content": text},
    ]
    return _call_groq(messages, max_tokens=300).strip()

def call_image(image_bytes):
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    messages = [{
        "role": "user",
        "content": [
            {"type": "text",      "text": IMAGE_PROMPT_TPL},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
        ]
    }]
    return _safe_json(_call_groq(messages, model="meta-llama/llama-4-scout-17b-16e-instruct"))

def call_parse_recurring(text):
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    prompt = RECURRING_PROMPT_TPL.replace("{now}", now_str)
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user",   "content": text},
    ]
    return _safe_json(_call_groq(messages, max_tokens=2000))

def call_checkin():
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M (%A)")
    prompt = CHECKIN_PROMPT_TPL.replace("{now}", now_str)
    messages = [{"role": "user", "content": prompt}]
    return _call_groq(messages, max_tokens=200).strip()

def parse_time_expr(expr):
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    prompt = f"Current datetime: {now_str}\nParse this time expression and return ONLY a single integer (minutes from now). Must be > 0.\nTime: \"{expr}\"\nReply ONLY with integer."
    messages = [{"role": "user", "content": prompt}]
    raw = _call_groq(messages, max_tokens=20).strip()
    return int("".join(c for c in raw if c.isdigit() or c == "-"))

def add_tasks(new_tasks):
    tasks = load_tasks()
    now = datetime.now()
    for t in new_tasks:
        t["remind_at"] = (now + timedelta(minutes=t["remind_in_minutes"])).strftime("%Y-%m-%d %H:%M:%S")
        t["created_at"] = now.strftime("%Y-%m-%d %H:%M:%S")
        tasks.append(t)
    save_tasks(tasks)

# ── LINE 快速按鈕 ──────────────────────────────────────────────
def _quick_replies(items):
    return {
        "type": "quick_reply",
        "items": [
            {"type": "action", "action": {"type": "message", "label": label, "text": text}}
            for label, text in items
        ]
    }

MAIN_MENU = {
    "type": "quick_reply",
    "items": [
        {"type": "action", "action": {"type": "message", "label": "📋 查看任務",  "text": "查看任務"}},
        {"type": "action", "action": {"type": "message", "label": "📅 固定行程",  "text": "查看固定行程"}},
        {"type": "action", "action": {"type": "camera",  "label": "📸 拍照辨識"}},
        {"type": "action", "action": {"type": "message", "label": "❓ 使用說明",  "text": "幫助"}},
    ]
}

def _task_actions(task_title):
    return _quick_replies([
        ("✅ 完成",      f"完成 {task_title}"),
        ("⏰ 延後30分",  f"延後30 {task_title}"),
        ("✏️ 編輯",      f"編輯 {task_title}"),
        ("🗑️ 刪除",     f"刪除任務 {task_title}"),
    ])

def _edit_actions(task_title):
    return _quick_replies([
        ("🕐 改時間", f"改時間 {task_title} "),
        ("📝 改內容", f"改內容 {task_title} "),
        ("🏷️ 改標題", f"改標題 {task_title} "),
        ("↩️ 返回",   "查看任務"),
    ])

# ── LINE API ──────────────────────────────────────────────────
def _line_post(path, payload):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    ctx = ssl.create_default_context()
    conn = http.client.HTTPSConnection("api.line.me", context=ctx)
    conn.request("POST", path, body=data, headers={
        "Authorization": f"Bearer {LINE_ACCESS_TOKEN}",
        "Content-Type":  "application/json",
    })
    conn.getresponse()
    conn.close()

def line_reply(reply_token, text, quick_reply=None):
    msg = {"type": "text", "text": text}
    if quick_reply:
        msg["quickReply"] = quick_reply
    _line_post("/v2/bot/message/reply", {"replyToken": reply_token, "messages": [msg]})

def line_push(user_id, text, quick_reply=None):
    msg = {"type": "text", "text": text}
    if quick_reply:
        msg["quickReply"] = quick_reply
    _line_post("/v2/bot/message/push", {"to": user_id, "messages": [msg]})

# ── 圖片處理 ──────────────────────────────────────────────────
def process_image(user_id, reply_token, message_id):
    try:
        line_reply(reply_token, f"收到照片了！{CHARACTER_NAME} 正在幫你分析清單，稍等～ 📸")
        image_bytes = download_line_image(message_id)
        result = call_image(image_bytes)
        urgent = result.get("urgent", [])
        later  = result.get("later", [])
        msg    = result.get("jin_message", "加油！")

        lines = [f"🌸 {CHARACTER_NAME}：{msg}\n"]
        if urgent:
            lines.append("🔥 馬上去做！")
            for t in urgent:
                lines.append(f"  ❗ {t['title']}")
                lines.append(f"     {t['detail']}")
            lines.append("")
        if later:
            lines.append("🕐 可以緩一緩：")
            for t in later:
                lines.append(f"  📌 {t['title']}")
                lines.append(f"     {t['detail']}")
            lines.append("")
        lines.append("已幫你設好提醒，回覆「查看任務」可以看全部 🌸")

        all_tasks = [{**t, "status": "pending"} for t in urgent + later]
        add_tasks(all_tasks)
        line_push(user_id, "\n".join(lines))
        do_notify(f"{CHARACTER_NAME} 幫你整理好了！", f"緊急 {len(urgent)} 件，緩一緩 {len(later)} 件")
    except Exception as e:
        line_push(user_id, f"看圖時出錯了：{e}\n請重新傳一次照片")
        print(f"[Image Error] {e}")

# ── 任務關鍵字偵測 ────────────────────────────────────────────
TASK_KEYWORDS = [
    "要", "需要", "記得", "提醒", "待會", "等一下", "明天", "後天", "下週",
    "下午", "早上", "上午", "中午", "今晚", "今天", "明早", "點", "分鐘", "小時",
    "截止", "期限", "前", "號", "月", "日", "繳", "交", "送", "寄", "開會",
    "回", "打電話", "聯絡", "確認", "檢查", "準備", "完成", "處理",
]

def _looks_like_task(text):
    return any(kw in text for kw in TASK_KEYWORDS)

# ── 訊息處理 ──────────────────────────────────────────────────
def handle_message(user_id, reply_token, text):
    if not load_user_id():
        save_user_id(user_id)

    text = text.strip()

    if text in ["查看", "查看任務"]:
        tasks = load_tasks()
        pending = [t for t in tasks if t["status"] == "pending"]
        if not pending:
            line_reply(reply_token, f"目前沒有待辦任務！\n{CHARACTER_NAME} 為你驕傲 🌸\n\n有新任務就告訴我！", quick_reply=MAIN_MENU)
            return
        lines = ["📋 待辦清單：\n"]
        first_title = None
        for i, t in enumerate(pending, 1):
            lines.append(f"{i}. {t['title']}")
            lines.append(f"   ⏰ {t['remind_at']}")
            lines.append(f"   📝 {t['detail']}\n")
            if first_title is None:
                first_title = t["title"]
        lines.append("刪除任務：刪除任務 任務名稱\n刪除全部：刪除全部任務")
        line_reply(reply_token, "\n".join(lines), quick_reply=_task_actions(first_title) if first_title else MAIN_MENU)

    elif text.startswith("刪除任務 "):
        keyword = text[5:].strip()
        tasks = load_tasks()
        before = len([t for t in tasks if t["status"] == "pending"])
        tasks = [t for t in tasks if not (keyword in t.get("title","") and t["status"] == "pending")]
        after = len([t for t in tasks if t["status"] == "pending"])
        deleted = before - after
        if deleted > 0:
            save_tasks(tasks)
            line_reply(reply_token, f"好的！已刪除「{keyword}」（共 {deleted} 筆）🌸", quick_reply=MAIN_MENU)
        else:
            line_reply(reply_token, f"找不到「{keyword}」這個任務欸～", quick_reply=MAIN_MENU)

    elif text in ["刪除全部任務", "清空任務"]:
        tasks = load_tasks()
        count = len([t for t in tasks if t["status"] == "pending"])
        if count == 0:
            line_reply(reply_token, "本來就沒有任務了！", quick_reply=MAIN_MENU)
        else:
            for t in tasks:
                if t["status"] == "pending":
                    t["status"] = "deleted"
            save_tasks(tasks)
            line_reply(reply_token, f"全部 {count} 個任務都清掉了！清爽～但不要偷懶喔！😤", quick_reply=MAIN_MENU)

    elif text.startswith("完成 "):
        keyword = text[3:].strip()
        tasks = load_tasks()
        for t in tasks:
            if keyword in t.get("title","") and t["status"] == "pending":
                t["status"] = "done"
                save_tasks(tasks)
                line_reply(reply_token, f"✅ {t['title']} 完成了！太棒了！🌸", quick_reply=MAIN_MENU)
                do_notify("完成！🎉", t["title"] + " 搞定了！")
                return
        line_reply(reply_token, f"找不到「{keyword}」這個任務欸", quick_reply=MAIN_MENU)

    elif text.startswith("延後"):
        parts = text.split(" ", 1)
        mins = parts[0].replace("延後", "").strip()
        keyword = parts[1].strip() if len(parts) > 1 else ""
        try:
            mins = int(mins)
            tasks = load_tasks()
            for t in tasks:
                if keyword in t.get("title","") and t["status"] == "pending":
                    t["remind_at"] = (datetime.now() + timedelta(minutes=mins)).strftime("%Y-%m-%d %H:%M:%S")
                    save_tasks(tasks)
                    line_reply(reply_token, f"好，延後 {mins} 分鐘！但不要一直逃避喔！😤", quick_reply=_task_actions(keyword))
                    return
            line_reply(reply_token, f"找不到「{keyword}」欸～", quick_reply=MAIN_MENU)
        except:
            line_reply(reply_token, "格式：延後30 任務名稱", quick_reply=MAIN_MENU)

    elif text.startswith("編輯 "):
        keyword = text[3:].strip()
        tasks = load_tasks()
        found = next((t for t in tasks if keyword in t.get("title","") and t["status"]=="pending"), None)
        if found:
            line_reply(reply_token,
                f"✏️ 編輯任務：{found['title']}\n📝 內容：{found['detail']}\n⏰ 提醒：{found['remind_at']}\n\n要改什麼？",
                quick_reply=_edit_actions(found["title"]))
        else:
            line_reply(reply_token, f"找不到「{keyword}」", quick_reply=MAIN_MENU)

    elif text.startswith("改時間 "):
        parts = text[4:].strip().split(" ", 1)
        keyword = parts[0].strip()
        time_expr = parts[1].strip() if len(parts) > 1 else ""
        tasks = load_tasks()
        found = next((t for t in tasks if keyword in t.get("title","") and t["status"]=="pending"), None)
        if not found:
            line_reply(reply_token, f"找不到「{keyword}」", quick_reply=MAIN_MENU)
        elif not time_expr:
            line_reply(reply_token, f"請輸入新時間，例如：\n改時間 {keyword} 下午3點\n改時間 {keyword} 明天早上9點", quick_reply=_edit_actions(keyword))
        else:
            try:
                mins = parse_time_expr(time_expr)
                if mins <= 0: raise ValueError()
                found["remind_at"] = (datetime.now() + timedelta(minutes=mins)).strftime("%Y-%m-%d %H:%M:%S")
                save_tasks(tasks)
                line_reply(reply_token, f"✅ 已更新！\n{found['title']}\n⏰ 新提醒：{found['remind_at']}", quick_reply=_task_actions(found["title"]))
            except:
                line_reply(reply_token, f"時間解析失敗，試試：下午3點、明天早上9點、60（分鐘後）", quick_reply=_edit_actions(keyword))

    elif text.startswith("改內容 "):
        parts = text[4:].split(" ", 1)
        keyword = parts[0].strip()
        new_detail = parts[1].strip() if len(parts) > 1 else ""
        tasks = load_tasks()
        found = next((t for t in tasks if keyword in t.get("title","") and t["status"]=="pending"), None)
        if not found:
            line_reply(reply_token, f"找不到「{keyword}」", quick_reply=MAIN_MENU)
        elif not new_detail:
            line_reply(reply_token, f"格式：改內容 {keyword} 新說明", quick_reply=_edit_actions(keyword))
        else:
            found["detail"] = new_detail
            save_tasks(tasks)
            line_reply(reply_token, f"✅ 內容更新好了！\n{found['title']}：{new_detail}", quick_reply=_task_actions(found["title"]))

    elif text.startswith("改標題 "):
        parts = text[4:].split(" ", 1)
        keyword = parts[0].strip()
        new_title = parts[1].strip() if len(parts) > 1 else ""
        tasks = load_tasks()
        found = next((t for t in tasks if keyword in t.get("title","") and t["status"]=="pending"), None)
        if not found:
            line_reply(reply_token, f"找不到「{keyword}」", quick_reply=MAIN_MENU)
        elif not new_title:
            line_reply(reply_token, f"格式：改標題 {keyword} 新標題", quick_reply=_edit_actions(keyword))
        else:
            old = found["title"]
            found["title"] = new_title
            save_tasks(tasks)
            line_reply(reply_token, f"✅ 標題改好了！「{old}」→「{new_title}」", quick_reply=_task_actions(new_title))

    elif text.startswith("記住 ") or text.startswith("固定行程 "):
        content = text.split(" ", 1)[1].strip()
        line_reply(reply_token, f"幫你記！稍等⏳", quick_reply=MAIN_MENU)
        threading.Thread(target=process_recurring, args=(user_id, content), daemon=True).start()

    elif text in ["查看固定", "固定行程", "查看固定行程"]:
        items = load_recurring()
        if not items:
            line_reply(reply_token, "目前沒有固定行程～\n傳「記住 每個月XX號要...」讓我幫你記！", quick_reply=MAIN_MENU)
            return
        lines = ["📅 固定行程：\n"]
        for i, r in enumerate(items, 1):
            lines.append(f"{i}. {r['title']}")
            lines.append(f"   📅 {_type_str(r)}")
            if r.get("notes"):
                lines.append(f"   📝 {r['notes']}")
            lines.append("")
        line_reply(reply_token, "\n".join(lines), quick_reply=_quick_replies([
            ("📋 查看任務", "查看任務"),
            ("🗑️ 刪除固定", "刪除固定 "),
        ]))

    elif text.startswith("刪除固定 "):
        keyword = text[5:].strip()
        items = load_recurring()
        before = len(items)
        items = [r for r in items if keyword not in r.get("title","")]
        if len(items) < before:
            save_recurring(items)
            line_reply(reply_token, f"已刪除「{keyword}」固定行程～", quick_reply=MAIN_MENU)
        else:
            line_reply(reply_token, f"找不到「{keyword}」這個固定行程", quick_reply=MAIN_MENU)

    elif text in ["幫助", "help", "Help", "？", "?"]:
        line_reply(reply_token,
            f"📖 {CHARACTER_NAME} Bot 使用說明\n\n"
            "📸 傳照片 → 辨識手寫清單\n"
            "💬 傳文字 → 建立任務和提醒\n"
            "📋 查看任務 → 列出所有待辦\n"
            "✅ 完成 任務名稱\n"
            "⏰ 延後30 任務名稱\n"
            "✏️ 編輯 任務名稱\n"
            "  └ 改時間 / 改內容 / 改標題\n"
            "🗑️ 刪除任務 / 刪除全部任務\n\n"
            "📅 固定行程：\n"
            "記住 每月25號薪資核對...\n"
            "查看固定行程\n"
            "刪除固定 名稱",
            quick_reply=MAIN_MENU)

    else:
        line_reply(reply_token, f"{CHARACTER_NAME} 收到了！分析中，請稍等...⏳", quick_reply=MAIN_MENU)
        threading.Thread(target=process_task, args=(user_id, text), daemon=True).start()

def process_task(user_id, text):
    try:
        result = call_main(text)
        tasks = result.get("tasks", [])
        msg   = result.get("jin_message", "加油！")

        if not tasks:
            if _looks_like_task(text):
                result2 = call_main(f"請幫我記住這個任務並設定提醒：{text}")
                tasks2  = result2.get("tasks", [])
                if tasks2:
                    tasks = tasks2
                    msg   = result2.get("jin_message", msg)
                else:
                    line_push(user_id,
                        f"🌸 {CHARACTER_NAME}：{msg}\n\n"
                        "要幫你建立提醒嗎？\n"
                        "試試：「下午3點開會」或「明天交報告」",
                        quick_reply=MAIN_MENU)
                    return
            else:
                chat_reply = call_chat(text)
                line_push(user_id, f"🌸 {chat_reply}", quick_reply=MAIN_MENU)
                return

        add_tasks(tasks)
        lines = [f"🌸 {CHARACTER_NAME}：{msg}\n", "已建立以下提醒：\n"]
        first_title = None
        for t in tasks:
            lines.append(f"✅ {t['title']}")
            lines.append(f"   📝 {t['detail']}")
            lines.append(f"   ⏰ {t['remind_in_minutes']} 分鐘後提醒\n")
            if first_title is None:
                first_title = t["title"]
        line_push(user_id, "\n".join(lines), quick_reply=_task_actions(first_title) if first_title else MAIN_MENU)
        do_notify(f"{CHARACTER_NAME} 說！🌸", msg)
    except Exception as e:
        line_push(user_id, f"出錯了：{e}", quick_reply=MAIN_MENU)
        print(f"[process_task Error] {e}")

def _type_str(r):
    rtype   = r.get("type", "monthly")
    weekday = r.get("weekday")
    wd_str  = "一二三四五六日"[int(weekday)] if weekday is not None else "?"
    return {
        "monthly": f"每月{r.get('month_day','?')}號 提前{r.get('remind_days_before',1)}天 {r.get('remind_time','09:00')} 提醒",
        "weekly":  f"每週{wd_str} {r.get('remind_time','09:00')} 提醒",
        "yearly":  f"每年{r.get('month','?')}月{r.get('month_day','?')}號前提醒",
        "daily":   f"每天 {r.get('remind_time','09:00')} 提醒",
    }.get(rtype, rtype)

def process_recurring(user_id, text):
    try:
        result = call_parse_recurring(text)
        import uuid
        new_items = result.get("items", [result] if "title" in result else [])
        if not new_items:
            raise ValueError(f"無法解析：{result}")
        saved = load_recurring()
        for item in new_items:
            item["id"] = str(uuid.uuid4())[:8]
            item["active"] = True
            saved.append(item)
        save_recurring(saved)
        jin_msg = result.get("jin_message", "全部記住了！")
        lines = [f"🌸 {CHARACTER_NAME}：{jin_msg}\n", f"📅 已記住 {len(new_items)} 個固定行程：\n"]
        for item in new_items:
            lines.append(f"✅ {item['title']}")
            lines.append(f"   ⏰ {_type_str(item)}")
            if item.get("notes"):
                lines.append(f"   📝 {item['notes']}")
            lines.append("")
        lines.append("查看請傳「查看固定行程」")
        line_push(user_id, "\n".join(lines), quick_reply=_quick_replies([
            ("📅 查看固定行程", "查看固定行程"),
            ("📋 查看任務",     "查看任務"),
        ]))
    except Exception as e:
        line_push(user_id, f"記錄固定行程出錯：{e}\n請重新傳一次", quick_reply=MAIN_MENU)

def check_recurring():
    import uuid as _uuid
    now = datetime.now()
    uid = load_user_id()
    if not uid: return
    items = load_recurring()
    tasks = load_tasks()
    existing_today = {
        t["title"] for t in tasks
        if t.get("status") == "pending" and t.get("created_at","").startswith(now.strftime("%Y-%m-%d"))
    }
    for r in items:
        if not r.get("active", True): continue
        rtype        = r.get("type", "monthly")
        remind_days  = r.get("remind_days_before", 1)
        remind_time  = r.get("remind_time", "09:00")
        title        = r["title"]
        target_date  = None

        if rtype == "monthly":
            day = r.get("month_day", 25)
            try: candidate = now.replace(day=day)
            except ValueError: continue
            if candidate.date() < now.date():
                next_m = (now.replace(day=1) + timedelta(days=32)).replace(day=1)
                try: candidate = next_m.replace(day=day)
                except ValueError: continue
            target_date = candidate.date()
        elif rtype == "weekly":
            days_ahead = (r.get("weekday",0) - now.weekday()) % 7 or 7
            target_date = (now + timedelta(days=days_ahead)).date()
        elif rtype == "yearly":
            try: candidate = now.replace(month=r.get("month", now.month), day=r.get("month_day",1))
            except ValueError: continue
            if candidate.date() < now.date():
                candidate = candidate.replace(year=now.year + 1)
            target_date = candidate.date()

        if target_date is None: continue
        days_until = (target_date - now.date()).days
        if days_until == remind_days and title not in existing_today:
            h, m = map(int, remind_time.split(":"))
            remind_at = now.replace(hour=h, minute=m, second=0, microsecond=0)
            if remind_at < now: remind_at += timedelta(days=1)
            notes_part = f"\n\n📝 注意：{r['notes']}" if r.get("notes") else ""
            tasks.append({
                "id": str(_uuid.uuid4())[:8],
                "title": title,
                "detail": r.get("detail","") + notes_part,
                "remind_at": remind_at.strftime("%Y-%m-%d %H:%M:%S"),
                "created_at": now.strftime("%Y-%m-%d %H:%M:%S"),
                "status": "pending",
                "from_recurring": True,
            })
            save_tasks(tasks)
            push_msg = f"📅 固定行程提醒！\n\n{title} 還有 {days_until} 天！\n{r.get('detail','')}"
            if r.get("notes"): push_msg += f"\n\n⚠️ 特別注意：{r['notes']}"
            line_push(uid, push_msg, quick_reply=_task_actions(title))
            do_notify(f"📅 {title}", f"還有{days_until}天！")

def check_reminders():
    import random
    tasks = load_tasks()
    now   = datetime.now()
    uid   = load_user_id()
    updated = False
    for t in tasks:
        if t.get("status") != "pending": continue
        if now >= datetime.strptime(t["remind_at"], "%Y-%m-%d %H:%M:%S"):
            tpl_t, tpl_m = random.choice(REMIND_TEMPLATES)
            remind_msg = tpl_m.format(t=t["title"])
            title_msg  = tpl_t.format(name=CHARACTER_NAME)
            push_msg   = f"{title_msg}\n{remind_msg}\n\n📝 {t['detail']}"
            do_notify_task(t["title"], remind_msg + f"\n{t['detail']}")
            if uid:
                line_push(uid, push_msg, quick_reply=_task_actions(t["title"]))
            t["remind_at"]    = (now + timedelta(minutes=30)).strftime("%Y-%m-%d %H:%M:%S")
            t["remind_count"] = t.get("remind_count", 0) + 1
            updated = True
    if updated:
        save_tasks(tasks)

def check_and_checkin():
    hour = datetime.now().hour
    if hour < 9 or hour >= 22: return
    uid = load_user_id()
    if not uid: return
    if any(t.get("status") == "pending" for t in load_tasks()): return
    try:
        msg = call_checkin()
        line_push(uid, f"🌸 {CHARACTER_NAME} 路過關心你～\n\n{msg}", quick_reply=MAIN_MENU)
    except Exception as e:
        print(f"[Checkin Error] {e}")

def run_scheduler():
    schedule.every(1).minutes.do(check_reminders)
    schedule.every(3).hours.do(check_and_checkin)
    schedule.every().day.at("08:00").do(check_recurring)
    threading.Thread(target=check_recurring, daemon=True).start()
    while True:
        schedule.run_pending()
        time.sleep(15)

# ── Webhook 伺服器 ────────────────────────────────────────────
class WebhookHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args): pass

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body   = self.rfile.read(length)
        sig    = self.headers.get("X-Line-Signature", "")
        mac    = hmac.new(LINE_CHANNEL_SECRET.encode("utf-8"), body, hashlib.sha256).digest()
        if sig != base64.b64encode(mac).decode("utf-8"):
            self.send_response(400); self.end_headers(); return

        self.send_response(200); self.end_headers()
        try:
            data = json.loads(body.decode("utf-8"))
            for event in data.get("events", []):
                if event.get("type") != "message": continue
                user_id     = event["source"]["userId"]
                reply_token = event["replyToken"]
                msg_type    = event["message"]["type"]
                if not load_user_id(): save_user_id(user_id)

                if msg_type == "text":
                    threading.Thread(target=handle_message, args=(user_id, reply_token, event["message"]["text"]), daemon=True).start()
                elif msg_type == "image":
                    threading.Thread(target=process_image,  args=(user_id, reply_token, event["message"]["id"]),  daemon=True).start()
        except Exception as e:
            print(f"[Webhook Error] {e}")

    def do_GET(self):
        self.send_response(200); self.end_headers()
        self.wfile.write(f"{CHARACTER_NAME} Bot is running!".encode())

if __name__ == "__main__":
    threading.Thread(target=run_scheduler, daemon=True).start()
    server = HTTPServer(("0.0.0.0", PORT), WebhookHandler)
    print("=" * 50)
    print(f"{CHARACTER_NAME} Bot 啟動！port {PORT}")
    print(f"模式：{'☁️ 雲端' if IS_CLOUD else '💻 本地'}")
    print("=" * 50)
    server.serve_forever()
