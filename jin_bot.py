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

# ── 金鑰（優先讀環境變數，方便雲端部署）─────────────────────
GROQ_API_KEY        = os.environ.get("GROQ_API_KEY",        "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")
LINE_CHANNEL_SECRET = os.environ.get("LINE_CHANNEL_SECRET", "e08dce05c43f9dae51e217b097511747")
LINE_ACCESS_TOKEN   = os.environ.get("LINE_ACCESS_TOKEN",   "VSOE4HPcgWLQ9DH3A6eJcOCO6f0KkW4OSautgJVF7iNj3m+sUS9ksCySKKvTjS0rdz8+YVTvaCy6i1SDFv2GLKhh99yOgY514eNBMOkj04DpWY9UaogKXw/rI82nj7yPJmTjeewVn2VR6ZUfSK6kgQdB04t89/1O/w1cDnyilFU=")
PORT                = int(os.environ.get("PORT", 5000))
IS_CLOUD            = os.environ.get("RENDER") == "true"  # Render 會自動設定此環境變數
# ─────────────────────────────────────────────────────────────

# 雲端用 /tmp，本地用程式目錄
_DATA_DIR = Path("/tmp/jinbot") if IS_CLOUD else Path(__file__).parent
if IS_CLOUD: _DATA_DIR.mkdir(exist_ok=True)
TASKS_FILE     = _DATA_DIR / "tasks.json"
RECURRING_FILE = _DATA_DIR / "recurring.json"
USER_FILE      = _DATA_DIR / "user_id.txt"
MEMBER_FILE    = _DATA_DIR / "member.txt"

# ════════════════════════════════════════════════════════════════
# ██  BTS 成員個性設定  ███████████████████████████████████████████
# ════════════════════════════════════════════════════════════════
BTS_MEMBERS = {
    "jin": {
        "name": "Jin",
        "full_name": "金碩珍 Jin",
        "emoji": "🌸",
        "color": "#C8547A",
        "status": "2024年6月退伍，目前積極個人活動、直播、綜藝節目，常常在直播搞笑，心情超好。",
        "persona": """You are BTS Jin (Kim Seokjin / 金碩珍).
Personality: Warm, funny, loves dad jokes, calls yourself Worldwide Handsome（世界第一帥）.
Speak like a caring older brother. Tease lovingly, very playful.
Korean mix: 야야야, 오빠, 하하하, 진짜, 대박, 아이고.
Catchphrases: "世界第一帥", "오빠命令你！", "Worldwide Handsome 相信你！"
Use 繁體中文.
STRICT: Reply ONLY in 繁體中文. Korean interjections allowed as listed above. NO Japanese, NO Vietnamese, NO other languages.""",
        "remind_templates": [
            ("Jin 提醒你！😤",   "야야야！{t} 還沒做喔！世界第一帥親自來催你了！"),
            ("오빠來了！🌸",     "哈哈哈～{t} 忘了嗎？Worldwide Handsome 相信你可以的！Fighting！"),
            ("아이고～😅",       "{t} 快去搞定！拖拖拉拉的！오빠等你好消息！加油 ARMY！"),
            ("진짜로！🔥",       "대박！{t} 還在等什麼！世界第一帥我都幫你盯著了！"),
            ("來自오빠的愛💕",   "{t} 這件事很重要喔！不做完我會一直提醒你的哈哈哈！"),
        ],
    },
    "rm": {
        "name": "RM",
        "full_name": "金南俊 RM",
        "emoji": "🎨",
        "color": "#4A90D9",
        "status": "2024年底退伍，發行個人專輯，熱愛藝術、讀書、逛博物館，常分享深刻感悟。",
        "persona": """You are BTS RM (Kim Namjoon / 金南俊), the leader of BTS.
Personality: Intellectual, philosophical, thoughtful, loves art and nature.
Speak with depth but also warmth. Sometimes poetic. Occasionally self-deprecating about being clumsy.
Korean mix: 진짜, 맞아, 그렇죠, 어.
Catchphrases: 常說深刻的話, 提到最近看的書或藝術展, "作為隊長..."
Use 繁體中文. Be inspiring and genuine.
STRICT: Reply ONLY in 繁體中文. Korean interjections allowed as listed above. NO Japanese, NO Vietnamese, NO other languages.""",
        "remind_templates": [
            ("RM 提醒你",        "{t}...這件事值得認真對待。Fighting。"),
            ("RM 在這裡",        "有時候我們需要被提醒。{t}，去完成它吧。"),
            ("來自RM的話",       "{t} 還沒做。每一步都是成長的一部分。加油。"),
        ],
    },
    "suga": {
        "name": "Suga",
        "full_name": "閔玧其 Suga／AGUST D",
        "emoji": "🎵",
        "color": "#555555",
        "status": "2024年退伍，以 AGUST D 發行個人音樂，享受創作，喜歡貓咪，話不多但很真誠。",
        "persona": """You are BTS Suga (Min Yoongi / 閔玧其), also known as AGUST D.
Personality: Blunt, dry humor, tsundere（表面冷漠內心溫暖）. A man of few words but every word counts.
Loves cats, music production, basketball. Pretends not to care but actually cares a lot.
Korean mix: 뭐, 그래, 진짜, 어.
Style: Short sentences. Sarcastic but supportive. Occasionally roasts you then immediately encourages you.
Catchphrases: "그래 잘했어（做得好）", references his cats or music, "少廢話去做就對了"
Use 繁體中文.
STRICT: Reply ONLY in 繁體中文. Korean interjections allowed as listed above. NO Japanese, NO Vietnamese, NO other languages.""",
        "remind_templates": [
            ("提醒",             "{t}。去做。"),
            ("Suga 說",          "{t} 沒做完別想休息。"),
            ("。",               "{t}。少廢話去做就對了。"),
        ],
    },
    "jhope": {
        "name": "J-Hope",
        "full_name": "鄭號錫 J-Hope",
        "emoji": "☀️",
        "color": "#FF8C00",
        "status": "2024年退伍，發行個人專輯，積極舞台表演，是團體的陽光擔當，能量超高。",
        "persona": """You are BTS J-Hope (Jung Hoseok / 鄭號錫), the sunshine of BTS.
Personality: Extremely positive, energetic, enthusiastic. Literal sunshine energy.
Every message should feel like a burst of good vibes. Uses lots of exclamation marks.
Korean mix: 호비！, 아 진짜！, 와！, 좋아！, 파이팅！
Catchphrases: "I'm your HOPE！", "J-HOPE！", 很常說 "파이팅" 和 "좋아！"
Use 繁體中文. Be the most positive, uplifting presence ever.
STRICT: Reply ONLY in 繁體中文. Korean interjections allowed as listed above. NO Japanese, NO Vietnamese, NO other languages.""",
        "remind_templates": [
            ("☀️ J-Hope 來了！",  "야！{t}！加油！你一定可以的！파이팅！"),
            ("호비提醒你！☀️",    "{t} 還沒做！沒關係！現在做還來得及！좋아！"),
            ("J-HOPE！☀️",       "와！{t}！快去做！I'm your HOPE！파이팅！"),
        ],
    },
    "jimin": {
        "name": "Jimin",
        "full_name": "朴智旻 Jimin",
        "emoji": "💜",
        "color": "#9B59B6",
        "status": "2024年退伍，發行個人專輯 MUSE，舞蹈和歌唱大受好評，與粉絲感情很深厚。",
        "persona": """You are BTS Jimin (Park Jimin / 朴智旻).
Personality: Sweet, sincere, caring, charming. Very considerate of others' feelings.
Playful with close friends but gentle overall. Very appreciative and affectionate.
Korean mix: 오～, 진짜？, 어머, 아～.
Catchphrases: 喜歡說溫柔的話, 關心對方感受, "우리 ARMY~"
Style: Warm and intimate. Like talking to a very close friend who genuinely cares.
Use 繁體中文.
STRICT: Reply ONLY in 繁體中文. Korean interjections allowed as listed above. NO Japanese, NO Vietnamese, NO other languages.""",
        "remind_templates": [
            ("💜 智旻提醒你",     "{t} 還沒做喔～記得喔，我在等你的好消息 💜"),
            ("Jimin 在這裡 💜",   "{t}～不要忘記喔！你可以的，我相信你 💜"),
            ("오～記得嗎？💜",    "{t} 這件事～做完告訴我好嗎？我會為你加油的 💜"),
        ],
    },
    "v": {
        "name": "V",
        "full_name": "金泰亨 V",
        "emoji": "🐯",
        "color": "#2ECC71",
        "status": "2024年退伍，發行個人專輯 Layover，熱愛藝術攝影，個性獨特，常說出人意料的話。",
        "persona": """You are BTS V (Kim Taehyung / 金泰亨).
Personality: Unique, artistic, unpredictable, deep thinker but also very playful.
Speaks in unexpected ways, makes random observations. Loves art, dogs (Yeontan), vintage things.
Korean mix: 뷔！, 어～, 맞다！, 그렇구나.
Catchphrases: 說一些意想不到但有深度的話, 提到藝術或攝影, 偶爾說出奇怪但有趣的比喻
Style: A mix of profound and random. Like a very artistic friend who sees the world differently.
Use 繁體中文.
STRICT: Reply ONLY in 繁體中文. Korean interjections allowed as listed above. NO Japanese, NO Vietnamese, NO other languages.""",
        "remind_templates": [
            ("...",               "{t}。就像一幅未完成的畫。去完成它。"),
            ("🐯 泰亨說",         "{t}...有時候未完成的事，比已完成的更美。但還是去做吧。"),
            ("맞다！",            "{t}。我突然想到你還沒做這個。去做吧。"),
        ],
    },
    "jungkook": {
        "name": "Jungkook",
        "full_name": "田柾國 Jungkook",
        "emoji": "🐰",
        "color": "#E74C3C",
        "status": "2024年退伍，發行個人專輯 GOLDEN，展現多才多藝，是黃金忙內，對所有事都全力以赴。",
        "persona": """You are BTS Jungkook (Jeon Jungkook / 田柾國), the Golden Maknae.
Personality: Competitive, perfectionist, confident yet sometimes shy. Tries to be good at everything.
The youngest but super talented. Slightly competitive. Brave but occasionally bashful about feelings.
Korean mix: 야！, 진짜？, 맞아요, 저는~.
Catchphrases: 提到練習或努力, "黃金忙內就是不一樣", 偶爾撒嬌, 對哥哥們的反應
Style: Energetic and earnest. Sometimes shows off a little then gets embarrassed.
Use 繁體中文.
STRICT: Reply ONLY in 繁體中文. Korean interjections allowed as listed above. NO Japanese, NO Vietnamese, NO other languages.""",
        "remind_templates": [
            ("🐰 柾國來了",       "{t} 還沒做？連這個都做不完嗎！Fighting！"),
            ("야！🐰",            "{t}！黃金忙內都在努力了，你還在等什麼！"),
            ("🐰 提醒你",         "{t}。去做！做完我會稱讚你的！"),
        ],
    },
}

# 預設成員
DEFAULT_MEMBER = "jin"

# ── JSONBin.io 持久化（雲端部署時防止資料消失）────────────────
# 設定方式：到 jsonbin.io 免費註冊，取得 API Key
# 在 Render 環境變數加入 JSONBIN_API_KEY
JSONBIN_API_KEY  = os.environ.get("JSONBIN_API_KEY", "")
JSONBIN_BIN_TASKS     = os.environ.get("JSONBIN_BIN_TASKS",     "6a229193f5f4af5e29bcd0d7")
JSONBIN_BIN_RECURRING = os.environ.get("JSONBIN_BIN_RECURRING", "6a229182da38895dfe8b48b2")
JSONBIN_BIN_USER      = os.environ.get("JSONBIN_BIN_USER",      "6a22916af5f4af5e29bcd01c")
USE_JSONBIN = bool(JSONBIN_API_KEY) and IS_CLOUD

def _jb_get(bin_id):
    ctx = ssl.create_default_context()
    conn = http.client.HTTPSConnection("api.jsonbin.io", context=ctx)
    conn.request("GET", f"/v3/b/{bin_id}/latest", headers={
        "X-Master-Key": JSONBIN_API_KEY,
        "X-Bin-Meta": "false",
    })
    r = conn.getresponse()
    body = json.loads(r.read().decode("utf-8"))
    conn.close()
    return body  # already the stored data (no wrapper when meta=false)

def _jb_put(bin_id, data):
    payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
    ctx = ssl.create_default_context()
    conn = http.client.HTTPSConnection("api.jsonbin.io", context=ctx)
    conn.request("PUT", f"/v3/b/{bin_id}", body=payload, headers={
        "X-Master-Key": JSONBIN_API_KEY,
        "Content-Type": "application/json",
    })
    conn.getresponse()
    conn.close()

def _jb_create(name, init_data):
    """首次建立 bin，回傳 bin_id"""
    payload = json.dumps(init_data, ensure_ascii=False).encode("utf-8")
    ctx = ssl.create_default_context()
    conn = http.client.HTTPSConnection("api.jsonbin.io", context=ctx)
    conn.request("POST", "/v3/b", body=payload, headers={
        "X-Master-Key": JSONBIN_API_KEY,
        "Content-Type": "application/json",
        "X-Bin-Name": name,
        "X-Bin-Private": "true",
    })
    r = conn.getresponse()
    body = json.loads(r.read().decode("utf-8"))
    conn.close()
    return body.get("metadata", {}).get("id", "")

# ── BTS 目前動態（可手動更新）────────────────────────────────
BTS_STATUS = """
BTS Jin（金碩珍）2024年6月已退伍，目前以個人身份活躍中。
2025年持續有個人活動、綜藝節目、直播與粉絲互動。
BTS 其他成員陸續退伍中，2025年底預計全員回歸。
Jin 目前心情：開心、活潑、很想跟ARMY互動，常常在直播搞笑。
"""

# ── 動態 prompt（根據當前成員生成）─────────────────────────────
def _task_prompt():
    m = get_member()
    return f"""{m['persona']}

Current datetime: {{now}}
Current status: {m['status']}

== TIME REFERENCE TABLE (pre-calculated, use these exact values) ==
{{time_refs}}
== END OF TIME REFERENCE TABLE ==

IMPORTANT: Use ONLY the numbers from the TIME REFERENCE TABLE above.
DO NOT calculate time yourself. Just look up the matching entry and copy its minutes value.

IMPORTANT: First determine if TASK/REMINDER or just CHAT.
- Task/reminder (has time/deadline/to-do) → JSON with tasks list
- Casual chat → JSON with tasks=[]

Reply ONLY with JSON:
{{"jin_message":"{m['name']}風格的話，繁體中文","tasks":[{{"id":"t1","title":"任務名稱","detail":"細節說明","remind_in_minutes":30,"status":"pending"}}]}}"""

def _chat_prompt():
    m = get_member()
    return f"""{m['persona']}

Current datetime: {{now}}
Current status: {m['status']}

You are having a real conversation with a fan (ARMY).
Keep replies 2-5 sentences, conversational and natural.
Sometimes ask back questions to keep the conversation going.
Reply ONLY with the message text (no JSON)."""

def _checkin_prompt():
    m = get_member()
    return f"""{m['persona']}

Current datetime: {{now}}
Current status: {m['status']}

The user has no pending tasks. Send a warm, spontaneous check-in message.
2-4 sentences. Match {m['name']}'s personality.
Reply ONLY with the message text."""

def _daily_checkin_prompt(slot_name):
    m = get_member()
    slot_ctx = {
        "morning": "This is a morning greeting. Be energetic and motivating.",
        "afternoon": "This is an afternoon check-in. Be casual and friendly.",
        "evening": "This is an evening wind-down. Be warm and encouraging to rest.",
    }.get(slot_name, "")
    return f"""{m['persona']}

Current datetime: {{now}}
Current status: {m['status']}

{slot_ctx}
Be creative and natural. 2-4 sentences. Use 繁體中文.
Reply ONLY with the message text."""

# 時間解析 prompt（給 改時間 指令用）
TIME_PARSE_PROMPT = """Given the current datetime: {now}
Parse this time expression and return ONLY the number of minutes from now until that time.
Time expression: "{expr}"
Reply ONLY with a single integer (minutes). Must be > 0. No other text."""

# 圖片分析 prompt（動態，根據成員生成）
def _image_prompt():
    m = get_member()
    return f"""{m['persona']}

Look at this handwritten to-do list image carefully.
1. Read ALL items visible, even if handwriting is messy.
2. Classify each as URGENT (must do soon, has deadline, important) or LATER (can wait, flexible).
3. For urgent items: remind_in_minutes = 30
4. For later items: remind_in_minutes = 120

Current status: {m['status']}

Reply ONLY with JSON:
{{"jin_message":"{m['name']}風格的話，繁體中文","urgent":[{{"title":"任務名稱","detail":"為什麼緊急或截止時間","remind_in_minutes":30}}],"later":[{{"title":"任務名稱","detail":"建議什麼時候做","remind_in_minutes":120}}]}}"""

# 固定行程解析 prompt（動態，根據成員生成）
def _recurring_prompt(now=""):
    m = get_member()
    return f"""{m['persona']}

The user is telling you about a recurring/fixed schedule item they want you to remember.

Current datetime: {now}

Parse the user's message and extract the recurring schedule. Return ONLY JSON:
{{
  "jin_message": "{m['name']}風格的回應，繁體中文，表示已記住",
  "title": "任務簡短標題",
  "detail": "詳細說明，包含用戶提到的所有注意事項",
  "notes": "用戶特別交代要記住的重要細節（例如：記得核對加班費、特休、勞保等）",
  "type": "monthly|weekly|daily|yearly",
  "month_day": 25,
  "weekday": null,
  "remind_time": "09:00",
  "remind_days_before": 2
}}

Rules:
- type=monthly: month_day = day of month (1-31), weekday = null
- type=weekly: weekday = 0(Mon)~6(Sun), month_day = null
- type=yearly: month_day = day, add "month" field for month number
- remind_days_before = how many days before the deadline to remind (default 1-2)
- remind_time = what time to send reminder (default "09:00")
- Extract ALL specific things user wants to check/remember into notes
- If the user describes MULTIPLE recurring tasks with different dates, return ALL of them as separate items

IMPORTANT: If there are multiple recurring tasks, return them ALL in the "items" array.

Reply ONLY with JSON:
{{
  "jin_message": "{m['name']}風格的回應，繁體中文，表示已記住所有行程",
  "items": [
    {{
      "title": "任務簡短標題",
      "detail": "詳細說明",
      "notes": "特別注意事項",
      "type": "monthly",
      "month_day": 1,
      "weekday": null,
      "remind_time": "09:00",
      "remind_days_before": 1
    }}
  ]
}}

Examples:
- "每個月25號前算薪水，核對加班費" → items有1筆, type=monthly, month_day=25, remind_days_before=2, notes=核對加班費
- "每月1號和15號..." → items有2筆, 分別 month_day=1 和 month_day=15
- 用戶說的複雜多日期描述 → 拆成多筆分別記錄"""

def get_remind_templates():
    """返回當前成員的提醒模板，使用 jin 的模板作為後備"""
    return BTS_MEMBERS[load_member()].get('remind_templates',
        BTS_MEMBERS['jin']['remind_templates'])

# ── 工具函數 ──────────────────────────────────────────────────
def load_tasks():
    if USE_JSONBIN and JSONBIN_BIN_TASKS:
        try:
            d = _jb_get(JSONBIN_BIN_TASKS)
            return d.get("data", []) if isinstance(d, dict) else d or []
        except Exception: pass
    return json.loads(TASKS_FILE.read_text(encoding="utf-8")) if TASKS_FILE.exists() else []

def save_tasks(t):
    if USE_JSONBIN and JSONBIN_BIN_TASKS:
        try: _jb_put(JSONBIN_BIN_TASKS, {"data": t}); return
        except Exception: pass
    TASKS_FILE.write_text(json.dumps(t, ensure_ascii=False, indent=2), encoding="utf-8")

def load_user_id():
    if USE_JSONBIN and JSONBIN_BIN_USER:
        try:
            d = _jb_get(JSONBIN_BIN_USER)
            return d.get("uid", "") if isinstance(d, dict) else ""
        except Exception: pass
    return USER_FILE.read_text(encoding="utf-8").strip() if USER_FILE.exists() else ""

def save_user_id(uid):
    if USE_JSONBIN and JSONBIN_BIN_USER:
        try: _jb_put(JSONBIN_BIN_USER, {"uid": uid}); return
        except Exception: pass
    USER_FILE.write_text(uid, encoding="utf-8")

def load_recurring():
    if USE_JSONBIN and JSONBIN_BIN_RECURRING:
        try:
            d = _jb_get(JSONBIN_BIN_RECURRING)
            return d.get("data", []) if isinstance(d, dict) else d or []
        except Exception: pass
    return json.loads(RECURRING_FILE.read_text(encoding="utf-8")) if RECURRING_FILE.exists() else []

def save_recurring(r):
    if USE_JSONBIN and JSONBIN_BIN_RECURRING:
        try: _jb_put(JSONBIN_BIN_RECURRING, {"data": r}); return
        except Exception: pass
    RECURRING_FILE.write_text(json.dumps(r, ensure_ascii=False, indent=2), encoding="utf-8")

# ── 當前成員 load/save ────────────────────────────────────────
_current_member_cache = DEFAULT_MEMBER

def load_member() -> str:
    global _current_member_cache
    try:
        if MEMBER_FILE.exists():
            key = MEMBER_FILE.read_text(encoding="utf-8").strip()
            if key in BTS_MEMBERS:
                _current_member_cache = key
                return key
    except Exception:
        pass
    return _current_member_cache

def save_member(key: str):
    global _current_member_cache
    _current_member_cache = key
    try:
        MEMBER_FILE.write_text(key, encoding="utf-8")
    except Exception:
        pass

def get_member() -> dict:
    return BTS_MEMBERS.get(load_member(), BTS_MEMBERS[DEFAULT_MEMBER])

def do_notify(title, msg):
    m = get_member()
    if WIN11TOAST:
        try:
            toast(title, msg, app_id=f"{m['name']} Bot")
        except Exception:
            pass
    elif plyer_notification:
        try:
            plyer_notification.notify(title=title, message=msg, app_name=m['name'], timeout=12)
        except Exception:
            pass

def do_notify_task(task_title, body):
    """提醒通知，帶有「完成」和「延後30分鐘」互動按鈕"""
    m = get_member()
    if not WIN11TOAST:
        do_notify(f"{m['name']} 提醒你！", body)
        return

    def on_complete(action):
        tasks = load_tasks()
        for t in tasks:
            if t.get("title") == task_title and t["status"] == "pending":
                t["status"] = "done"
                save_tasks(tasks)
                uid = load_user_id()
                if uid:
                    line_push(uid, f"✅ 已標記完成：{task_title}\n{get_member()['name']} 為你驕傲！{get_member()['emoji']}")
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
            f"{m['name']} 提醒你！",
            body,
            app_id=f"{m['name']} Bot",
            buttons=[
                {"activationType": "background", "arguments": "complete", "content": "✅ 完成"},
                {"activationType": "background", "arguments": "snooze",   "content": "⏰ 延後30分鐘"},
            ],
            on_activated=lambda action: (
                on_complete(action) if action == "complete" else on_snooze(action)
            ),
        )
    except Exception:
        do_notify(f"{m['name']} 提醒你！", body)

# ── 下載 LINE 圖片 ─────────────────────────────────────────────
def download_line_image(message_id):
    ctx = ssl.create_default_context()
    conn = http.client.HTTPSConnection("api-data.line.me", context=ctx)
    conn.request("GET", f"/v2/bot/message/{message_id}/content", headers={
        "Authorization": f"Bearer {LINE_ACCESS_TOKEN}",
    })
    r = conn.getresponse()
    data = r.read()
    conn.close()
    return data  # bytes

# ── Groq API 共用函數 ─────────────────────────────────────────
def _call_groq(messages, model="llama-3.3-70b-versatile", max_tokens=2000):
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

    raw = body["choices"][0]["message"]["content"]
    return _safe_json(raw)

def _build_time_refs():
    """預先計算所有常用時間點的分鐘數，讓 AI 直接查表，不需自己算"""
    now = datetime.now()
    WD = ["週一","週二","週三","週四","週五","週六","週日"]
    lines = [f"現在：{now.strftime('%Y-%m-%d %H:%M')}（{WD[now.weekday()]}）\n"]

    def mins(dt):
        return max(1, int((dt - now).total_seconds() / 60))

    # 今天各時段
    for label, h, m in [("今天中午前/11:30",11,30),("今天中午/12:00",12,0),
                         ("今天下午15:00",15,0),("今天下午18:00",18,0),
                         ("今天晚上20:00",20,0),("今天22:00",22,0)]:
        t = now.replace(hour=h, minute=m, second=0, microsecond=0)
        if t <= now: t += timedelta(days=1)
        lines.append(f"{label} → {t.strftime('%Y-%m-%d %H:%M')} = {mins(t)}分鐘後")

    # 明天/後天常用時段
    for day_label, day_delta in [("明天",1),("後天",2)]:
        for h_label, h in [("早上08:00",8),("早上09:00",9),("中午12:00",12),("下午15:00",15)]:
            t = (now + timedelta(days=day_delta)).replace(hour=h, minute=0, second=0, microsecond=0)
            lines.append(f"{day_label}{h_label} → {t.strftime('%Y-%m-%d %H:%M')} = {mins(t)}分鐘後")

    # 下週各天（一定是下週，不是本週）
    lines.append("")
    for wd in range(7):
        days_ahead = (wd - now.weekday()) % 7
        if days_ahead == 0: days_ahead = 7  # 同天也算下週
        t = (now + timedelta(days=days_ahead)).replace(hour=9, minute=0, second=0, microsecond=0)
        lines.append(f"下{WD[wd][-1]}（下週{WD[wd][-1]}）09:00 → {t.strftime('%Y-%m-%d')} = {mins(t)}分鐘後")

    return "\n".join(lines)

# ── Groq API（文字）──────────────────────────────────────────
def call_claude(text):
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M (%A)")
    prompt  = _task_prompt().replace("{now}", now_str).replace("{time_refs}", _build_time_refs())
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user",   "content": text},
    ]
    return _call_groq(messages)

# ── Groq API（純聊天）────────────────────────────────────────
def call_chat(text):
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M (%A)")
    prompt  = _chat_prompt().replace("{now}", now_str)
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user",   "content": text},
    ]
    return _call_groq(messages, max_tokens=300).strip()

# ── Groq API（圖片辨識）──────────────────────────────────────
def call_claude_image(image_bytes):
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    prompt = _image_prompt()
    messages = [{
        "role": "user",
        "content": [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
        ]
    }]
    return _call_groq(messages, model="meta-llama/llama-4-scout-17b-16e-instruct")

# ── 解析時間表達式 → 分鐘數 ──────────────────────────────────
def parse_time_expr(expr):
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    prompt = TIME_PARSE_PROMPT.format(now=now_str, expr=expr)
    messages = [{"role": "user", "content": prompt}]
    data = json.dumps({"model": "llama-3.3-70b-versatile", "messages": messages, "max_tokens": 20},
                      ensure_ascii=False).encode("utf-8")
    ctx = ssl.create_default_context()
    conn = http.client.HTTPSConnection("api.groq.com", context=ctx)
    conn.request("POST", "/openai/v1/chat/completions", body=data, headers={
        "Authorization": f"Bearer {GROQ_API_KEY}", "content-type": "application/json"})
    r = conn.getresponse()
    body = json.loads(r.read().decode("utf-8"))
    conn.close()
    raw = body["choices"][0]["message"]["content"].strip()
    return int("".join(c for c in raw if c.isdigit() or c == "-"))

# ── JSON 安全解析 ─────────────────────────────────────────────
def _repair_json(raw):
    """修復 AI 常見的 JSON 格式問題"""
    import re
    # 移除 markdown code block
    if "```" in raw:
        parts = raw.split("```")
        for p in parts:
            if p.startswith("json"):
                raw = p[4:].strip()
                break
            elif "{" in p:
                raw = p.strip()
                break
    raw = raw.strip()

    # 找到 JSON 物件範圍（bracket matching，忽略字串內容）
    start = raw.find("{")
    if start == -1:
        return raw
    depth = 0
    in_str = False
    escape = False
    end = start
    for i, c in enumerate(raw[start:], start):
        if escape:
            escape = False
            continue
        if c == "\\" and in_str:
            escape = True
            continue
        if c == '"' and not escape:
            in_str = not in_str
            continue
        if not in_str:
            if c == "{": depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    end = i
                    break
    raw = raw[start:end+1]

    # 修復字串值內的裸換行（\n → \\n）
    def fix_newlines(m):
        return m.group(0).replace("\n", "\\n").replace("\r", "")
    raw = re.sub(r'"(?:[^"\\]|\\.)*"', fix_newlines, raw, flags=re.DOTALL)

    # 修複中文引號
    raw = raw.replace("\u201c", '"').replace("\u201d", '"')
    raw = raw.replace("\u2018", "'").replace("\u2019", "'")
    # 修複日文/全形反斜線
    raw = raw.replace("\uff65", "\\").replace("\xa5", "\\")

    # 移除 JSON 值後的多餘逗號（trailing comma）
    raw = re.sub(r',\s*([}\]])', r'\1', raw)

    return raw

def _safe_json(raw):
    raw = raw.strip()
    # 先嘗試直接解析
    try:
        return json.loads(raw)
    except Exception:
        pass
    # 修復後再試
    try:
        fixed = _repair_json(raw)
        return json.loads(fixed)
    except Exception:
        # 最後嘗試：用 ast.literal_eval（容錯單引號）
        try:
            import ast
            return ast.literal_eval(_repair_json(raw))
        except Exception:
            raise ValueError(f"JSON 解析失敗，原始回應前200字：{raw[:200]}")

# ── 解析固定行程 ──────────────────────────────────────────────
def call_parse_recurring(text):
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    prompt = _recurring_prompt(now_str)
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": text},
    ]
    data = json.dumps({"model": "llama-3.3-70b-versatile", "messages": messages, "max_tokens": 2000},
                      ensure_ascii=False).encode("utf-8")
    ctx = ssl.create_default_context()
    conn = http.client.HTTPSConnection("api.groq.com", context=ctx)
    conn.request("POST", "/openai/v1/chat/completions", body=data, headers={
        "Authorization": f"Bearer {GROQ_API_KEY}", "content-type": "application/json"})
    r = conn.getresponse()
    body = json.loads(r.read().decode("utf-8"))
    conn.close()
    raw = body["choices"][0]["message"]["content"]
    return _safe_json(raw)

# ── 空閒關心 / 每日關心（動態成員）─────────────────────────────
def call_checkin():
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M (%A)")
    prompt  = _checkin_prompt().replace("{now}", now_str)
    messages = [{"role": "user", "content": prompt}]
    return _call_groq(messages, max_tokens=200).strip()

def add_tasks(new_tasks):
    tasks = load_tasks()
    now = datetime.now()
    for t in new_tasks:
        t["remind_at"] = (now + timedelta(minutes=t["remind_in_minutes"])).strftime("%Y-%m-%d %H:%M:%S")
        t["created_at"] = now.strftime("%Y-%m-%d %H:%M:%S")
        tasks.append(t)
    save_tasks(tasks)

# ── LINE 快速按鈕 ─────────────────────────────────────────────
def _quick_replies(items):
    """items = [("label", "text"), ...]"""
    return {
        "type": "quick_reply",
        "items": [
            {
                "type": "action",
                "action": {"type": "message", "label": label, "text": text}
            }
            for label, text in items
        ]
    }

MAIN_MENU = {
    "type": "quick_reply",
    "items": [
        {"type": "action", "action": {"type": "message", "label": "📋 查看任務", "text": "查看任務"}},
        {"type": "action", "action": {"type": "message", "label": "📅 固定行程", "text": "查看固定行程"}},
        {"type": "action", "action": {"type": "camera",  "label": "📸 拍照辨識"}},
        {"type": "action", "action": {"type": "message", "label": "🎤 切換成員", "text": "切換成員"}},
        {"type": "action", "action": {"type": "message", "label": "❓ 使用說明", "text": "幫助"}},
    ]
}

def _task_actions(task_title):
    return _quick_replies([
        ("✅ 完成", f"完成 {task_title}"),
        ("⏰ 延後30分", f"延後30 {task_title}"),
        ("✏️ 編輯", f"編輯 {task_title}"),
        ("📋 所有任務", "查看任務"),
    ])

def _edit_actions(task_title):
    return _quick_replies([
        ("🕐 改時間", f"改時間 {task_title} "),
        ("📝 改內容", f"改內容 {task_title} "),
        ("🏷️ 改標題", f"改標題 {task_title} "),
        ("↩️ 返回", "查看任務"),
    ])

# ── LINE API ──────────────────────────────────────────────────
def _line_post(path, payload):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    ctx = ssl.create_default_context()
    conn = http.client.HTTPSConnection("api.line.me", context=ctx)
    conn.request("POST", path, body=data, headers={
        "Authorization": f"Bearer {LINE_ACCESS_TOKEN}",
        "Content-Type": "application/json",
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

def line_push_messages(user_id, messages):
    """推送多則訊息（最多5則）"""
    _line_post("/v2/bot/message/push", {"to": user_id, "messages": messages[:5]})

def line_reply_messages(reply_token, messages):
    """回覆多則訊息（最多5則）"""
    _line_post("/v2/bot/message/reply", {"replyToken": reply_token, "messages": messages[:5]})

# ── Flex Message 輔助函數 ──────────────────────────────────────
# 粉色主題色
_PINK   = "#C8547A"
_PINK_L = "#FFD6E7"
_GREEN  = "#4CAF50"
_GRAY   = "#888888"
_DARK   = "#333333"

def _btn(label, text, style="secondary", color=None):
    b = {"type": "button", "style": style, "height": "sm", "flex": 1,
         "action": {"type": "message", "label": label, "text": text}}
    if color:
        b["color"] = color
    return b

def _task_card(title, detail, remind_at, idx=1, total=1):
    """單一任務卡片 Flex Bubble"""
    header_label = f"任務 {idx} / {total}" if total > 1 else "✅ 已建立提醒"
    remind_short = remind_at[:16] if remind_at else ""
    title_short  = title[:30] + "…" if len(title) > 30 else title
    detail_short = detail[:60] + "…" if len(detail) > 60 else detail
    return {
        "type": "bubble",
        "size": "kilo",
        "header": {
            "type": "box", "layout": "vertical",
            "backgroundColor": _PINK, "paddingAll": "14px",
            "contents": [
                {"type": "text", "text": header_label, "color": _PINK_L, "size": "xxs"},
                {"type": "text", "text": title_short,  "color": "#FFFFFF",
                 "size": "md", "weight": "bold", "wrap": True},
            ]
        },
        "body": {
            "type": "box", "layout": "vertical",
            "paddingAll": "14px", "spacing": "sm",
            "contents": [
                {"type": "text", "text": f"📝  {detail_short}",
                 "size": "sm", "color": "#555555", "wrap": True},
                {"type": "separator", "margin": "md"},
                {"type": "text", "text": f"⏰  {remind_short}",
                 "size": "sm", "color": _GRAY, "margin": "sm"},
            ]
        },
        "footer": {
            "type": "box", "layout": "horizontal",
            "spacing": "xs", "paddingAll": "10px",
            "contents": [
                _btn("✅ 完成", f"完成 {title}", style="primary", color=_GREEN),
                _btn("⏰ 延後", f"延後30 {title}"),
                _btn("✏️ 編輯", f"編輯 {title}"),
            ]
        }
    }

def _nav_card():
    """導航功能卡片"""
    m = get_member()
    def _nav_btn(label, text):
        return {"type": "button", "style": "secondary", "height": "sm", "margin": "xs",
                "action": {"type": "message", "label": label, "text": text}}
    return {
        "type": "flex", "altText": "其他功能",
        "contents": {
            "type": "bubble", "size": "kilo",
            "body": {
                "type": "box", "layout": "vertical", "spacing": "xs",
                "paddingAll": "12px",
                "contents": [
                    {"type": "text", "text": "其他功能", "size": "xs",
                     "color": "#888888", "margin": "none"},
                    {"type": "box", "layout": "horizontal", "spacing": "xs", "margin": "sm",
                     "contents": [
                         _nav_btn("📋 所有任務", "查看任務"),
                         _nav_btn("📅 固定行程", "查看固定行程"),
                     ]},
                    {"type": "box", "layout": "horizontal", "spacing": "xs",
                     "contents": [
                         _nav_btn(f"🎤 切換成員", "切換成員"),
                         _nav_btn("❓ 說明", "幫助"),
                     ]},
                ]
            }
        }
    }

def _tasks_flex(jin_message, tasks_data):
    """jin_message 文字 + 任務卡片（單張或輪播）+ 導航卡片"""
    m = get_member()
    text_msg = {"type": "text", "text": f"{m['emoji']} {m['name']}：{jin_message}"}
    if not tasks_data:
        return [text_msg]

    if len(tasks_data) == 1:
        t = tasks_data[0]
        flex_content = _task_card(t["title"], t.get("detail",""), t.get("remind_at",""))
    else:
        bubbles = [
            _task_card(t["title"], t.get("detail",""), t.get("remind_at",""), i+1, len(tasks_data))
            for i, t in enumerate(tasks_data)
        ]
        flex_content = {"type": "carousel", "contents": bubbles[:10]}

    flex_msg = {"type": "flex", "altText": f"已建立 {len(tasks_data)} 個提醒", "contents": flex_content}
    return [text_msg, flex_msg, _nav_card()]

def _task_list_flex(pending_tasks):
    """任務列表輪播卡片"""
    if not pending_tasks:
        return None
    bubbles = []
    for t in pending_tasks[:10]:
        bubbles.append(_task_card(t["title"], t.get("detail",""), t.get("remind_at","")))
    content = bubbles[0] if len(bubbles) == 1 else {"type": "carousel", "contents": bubbles}
    return {"type": "flex", "altText": f"待辦任務（{len(pending_tasks)} 件）", "contents": content}

def _image_result_flex(jin_message, urgent, later):
    """圖片辨識結果卡片"""
    def _item_row(emoji, text):
        return {"type": "box", "layout": "baseline", "spacing": "sm", "contents": [
            {"type": "text", "text": emoji, "size": "sm", "flex": 0},
            {"type": "text", "text": text,  "size": "sm", "color": "#555555", "flex": 1, "wrap": True},
        ]}

    body_items = []
    if urgent:
        body_items.append({"type": "text", "text": "🔥 馬上去做", "weight": "bold", "color": _PINK, "size": "sm"})
        for t in urgent:
            body_items.append(_item_row("❗", f"{t['title']}  {t['detail']}"))
        body_items.append({"type": "separator", "margin": "md"})
    if later:
        body_items.append({"type": "text", "text": "🕐 可以緩一緩", "weight": "bold",
                           "color": "#FF8C00", "size": "sm", "margin": "md"})
        for t in later:
            body_items.append(_item_row("📌", f"{t['title']}  {t['detail']}"))

    bubble = {
        "type": "bubble",
        "header": {
            "type": "box", "layout": "vertical",
            "backgroundColor": _PINK, "paddingAll": "14px",
            "contents": [
                {"type": "text", "text": "📸 手寫清單辨識結果", "color": _PINK_L, "size": "xs"},
                {"type": "text", "text": jin_message, "color": "#FFFFFF", "size": "sm", "wrap": True},
            ]
        },
        "body": {
            "type": "box", "layout": "vertical",
            "paddingAll": "14px", "spacing": "sm",
            "contents": body_items or [{"type": "text", "text": "沒有識別到任務", "color": _GRAY}]
        },
        "footer": {
            "type": "box", "layout": "horizontal", "spacing": "sm", "paddingAll": "10px",
            "contents": [
                _btn("📋 查看任務", "查看任務"),
                _btn("📸 再拍一次", "拍照辨識"),
            ]
        }
    }
    return {"type": "flex", "altText": f"清單辨識：緊急{len(urgent)}件，緩{len(later)}件", "contents": bubble}

# ── 圖片處理 ──────────────────────────────────────────────────
def process_image(user_id, reply_token, message_id):
    try:
        _im = get_member()
        line_reply(reply_token, f"收到照片了！{_im['name']} 正在幫你看清單，稍等一下～ 📸")

        image_bytes = download_line_image(message_id)
        result = call_claude_image(image_bytes)

        urgent = result.get("urgent", [])
        later  = result.get("later", [])
        msg    = result.get("jin_message", f"加油 ARMY！{_im['emoji']}")

        all_tasks = [{**t, "status": "pending"} for t in urgent + later]
        add_tasks(all_tasks)

        flex_msg = _image_result_flex(msg, urgent, later)
        line_push_messages(user_id, [flex_msg])
        do_notify(f"{_im['name']} 幫你整理好了！", f"緊急 {len(urgent)} 件，緩一緩 {len(later)} 件")

    except Exception as e:
        line_push(user_id, f"看圖時出錯了：{e}\n請重新傳一次照片")
        print(f"[Image Error] {e}")

# ── 訊息處理 ──────────────────────────────────────────────────
def handle_message(user_id, reply_token, text):
    try:
        if not load_user_id():
            save_user_id(user_id)
    except Exception as e:
        print(f"[User ID Error] {e}")

    # 清理文字：去除空白、全型引號
    text = text.strip()
    text = text.strip("「」『』\"'")
    text = text.strip()

    try:
        _dispatch(user_id, reply_token, text)
    except Exception as e:
        print(f"[handle_message Error] {e}")
        try:
            _m = get_member()
            line_reply(reply_token, f"{_m['name']} 出了點小問題：{e}\n請再試一次！", quick_reply=MAIN_MENU)
        except Exception:
            try:
                _m = get_member()
                line_push(user_id, f"{_m['name']} 出了點小問題：{e}\n請再試一次！", quick_reply=MAIN_MENU)
            except Exception:
                pass

def _dispatch(user_id, reply_token, text):
    """實際處理各種指令"""
    m = get_member()

    # ── 查看任務 ──
    if text in ["查看", "查看任務", "任務", "待辦"]:
        try:
            tasks = load_tasks()
        except Exception:
            tasks = []
        pending = [t for t in tasks if t.get("status") == "pending"]
        if not pending:
            line_reply(reply_token,
                f"目前沒有待辦任務！\n清單空了！\n{m['name']} 為你驕傲 {m['emoji']}\n\n有新任務就告訴我！",
                quick_reply=MAIN_MENU)
            return
        try:
            flex_msg  = _task_list_flex(pending)
            count_msg = {"type": "text",
                         "text": f"📋 共 {len(pending)} 個待辦，左右滑動查看\n刪除：刪除任務 名稱　刪除全部：刪除全部任務"}
            line_reply_messages(reply_token, [count_msg, flex_msg])
        except Exception:
            # Flex 失敗就退回純文字
            lines = ["📋 待辦清單：\n"]
            for i, t in enumerate(pending, 1):
                lines.append(f"{i}. {t['title']}\n   ⏰ {t.get('remind_at','')}")
            line_reply(reply_token, "\n".join(lines), quick_reply=MAIN_MENU)

    # ── 刪除指定任務 ──
    elif text.startswith("刪除任務 "):
        keyword = text[5:].strip()
        tasks = load_tasks()
        before = len([t for t in tasks if t.get("status") == "pending"])
        tasks = [t for t in tasks if not (keyword in t.get("title","") and t.get("status") == "pending")]
        deleted = before - len([t for t in tasks if t.get("status") == "pending"])
        if deleted > 0:
            save_tasks(tasks)
            line_reply(reply_token, f"好的！已刪除含「{keyword}」的任務（共 {deleted} 筆）🌸", quick_reply=MAIN_MENU)
        else:
            line_reply(reply_token, f"找不到「{keyword}」這個任務欸～\n\n傳「查看任務」確認任務名稱", quick_reply=MAIN_MENU)

    # ── 刪除全部任務 ──
    elif text in ["刪除全部任務", "清空任務", "清空所有任務"]:
        tasks = load_tasks()
        count = len([t for t in tasks if t.get("status") == "pending"])
        if count == 0:
            line_reply(reply_token, "本來就沒有任務了哈哈哈！", quick_reply=MAIN_MENU)
        else:
            for t in tasks:
                if t.get("status") == "pending":
                    t["status"] = "deleted"
            save_tasks(tasks)
            line_reply(reply_token, f"全部 {count} 個任務都清掉了！{m['emoji']} 清爽～但不要偷懶喔！😤", quick_reply=MAIN_MENU)

    # ── 完成任務 ──
    elif text.startswith("完成 "):
        keyword = text[3:].strip()
        tasks = load_tasks()
        for t in tasks:
            if keyword in t.get("title","") and t.get("status") == "pending":
                t["status"] = "done"
                save_tasks(tasks)
                line_reply(reply_token,
                    f"{m['emoji']} {t['title']} 完成了！\n{m['name']} 超級驕傲！",
                    quick_reply=MAIN_MENU)
                do_notify("完成！🎉", t["title"] + " 搞定了！")
                return
        line_reply(reply_token,
            f"找不到「{keyword}」這個任務欸～\n傳「查看任務」確認名稱",
            quick_reply=MAIN_MENU)

    # ── 延後提醒 ──
    elif text.startswith("延後"):
        parts = text.split(" ", 1)
        mins_str = parts[0].replace("延後", "").strip()
        keyword  = parts[1].strip() if len(parts) > 1 else ""
        try:
            mins  = int(mins_str) if mins_str else 30
            tasks = load_tasks()
            for t in tasks:
                if keyword in t.get("title","") and t.get("status") == "pending":
                    t["remind_at"] = (datetime.now() + timedelta(minutes=mins)).strftime("%Y-%m-%d %H:%M:%S")
                    save_tasks(tasks)
                    line_reply(reply_token,
                        f"好，{t['title']} 延後 {mins} 分鐘！\n但不要一直逃避喔！😤",
                        quick_reply=_task_actions(t["title"]))
                    return
            line_reply(reply_token,
                f"找不到「{keyword}」欸～\n格式：延後30 任務名稱",
                quick_reply=MAIN_MENU)
        except Exception:
            line_reply(reply_token, "格式：延後30 任務名稱", quick_reply=MAIN_MENU)

    # ── 編輯任務 ──
    elif text.startswith("編輯 "):
        keyword = text[3:].strip()
        tasks   = load_tasks()
        found   = next((t for t in tasks if keyword in t.get("title","") and t.get("status")=="pending"), None)
        if found:
            line_reply(reply_token,
                f"✏️ 編輯任務：{found['title']}\n"
                f"📝 內容：{found.get('detail','')}\n"
                f"⏰ 提醒：{found.get('remind_at','')}\n\n"
                "要改什麼？點下方按鈕～",
                quick_reply=_edit_actions(found["title"]))
        else:
            line_reply(reply_token,
                f"找不到「{keyword}」這個任務欸～\n傳「查看任務」確認名稱",
                quick_reply=MAIN_MENU)

    # ── 改時間 ──
    elif text.startswith("改時間 "):
        parts    = text[4:].strip().split(" ", 1)
        keyword  = parts[0].strip()
        time_expr = parts[1].strip() if len(parts) > 1 else ""
        tasks    = load_tasks()
        found    = next((t for t in tasks if keyword in t.get("title","") and t.get("status")=="pending"), None)
        if not found:
            line_reply(reply_token, f"找不到「{keyword}」", quick_reply=MAIN_MENU)
        elif not time_expr:
            line_reply(reply_token,
                f"請輸入新時間，例如：\n改時間 {keyword} 下午3點\n改時間 {keyword} 明天早上9點",
                quick_reply=_edit_actions(keyword))
        else:
            try:
                mins = parse_time_expr(time_expr)
                if mins <= 0: raise ValueError()
                found["remind_at"] = (datetime.now() + timedelta(minutes=mins)).strftime("%Y-%m-%d %H:%M:%S")
                save_tasks(tasks)
                line_reply(reply_token,
                    f"✅ 已更新！\n{found['title']}\n⏰ 新提醒：{found['remind_at']}",
                    quick_reply=_task_actions(found["title"]))
            except Exception:
                line_reply(reply_token,
                    f"時間解析失敗，試試：下午3點、明天早上9點、60（分鐘後）",
                    quick_reply=_edit_actions(keyword))

    # ── 改內容 ──
    elif text.startswith("改內容 "):
        parts      = text[4:].split(" ", 1)
        keyword    = parts[0].strip()
        new_detail = parts[1].strip() if len(parts) > 1 else ""
        tasks      = load_tasks()
        found      = next((t for t in tasks if keyword in t.get("title","") and t.get("status")=="pending"), None)
        if not found:
            line_reply(reply_token, f"找不到「{keyword}」", quick_reply=MAIN_MENU)
        elif not new_detail:
            line_reply(reply_token, f"格式：改內容 {keyword} 新說明", quick_reply=_edit_actions(keyword))
        else:
            found["detail"] = new_detail
            save_tasks(tasks)
            line_reply(reply_token, f"✅ 內容更新！\n{found['title']}：{new_detail}", quick_reply=_task_actions(found["title"]))

    # ── 改標題 ──
    elif text.startswith("改標題 "):
        parts     = text[4:].split(" ", 1)
        keyword   = parts[0].strip()
        new_title = parts[1].strip() if len(parts) > 1 else ""
        tasks     = load_tasks()
        found     = next((t for t in tasks if keyword in t.get("title","") and t.get("status")=="pending"), None)
        if not found:
            line_reply(reply_token, f"找不到「{keyword}」", quick_reply=MAIN_MENU)
        elif not new_title:
            line_reply(reply_token, f"格式：改標題 {keyword} 新標題", quick_reply=_edit_actions(keyword))
        else:
            old = found["title"]
            found["title"] = new_title
            save_tasks(tasks)
            line_reply(reply_token, f"✅ 標題改好！「{old}」→「{new_title}」", quick_reply=_task_actions(new_title))

    # ── 記住固定行程 ──
    elif text.startswith("記住 ") or text.startswith("固定行程 "):
        content = text.split(" ", 1)[1].strip()
        line_reply(reply_token, f"{m['name']} 幫你記！稍等⏳", quick_reply=MAIN_MENU)
        threading.Thread(target=process_recurring, args=(user_id, content), daemon=True).start()

    # ── 查看固定行程 ──
    elif text in ["查看固定", "固定行程", "查看固定行程"]:
        try:
            items = load_recurring()
        except Exception:
            items = []
        if not items:
            line_reply(reply_token,
                f"目前沒有固定行程～\n跟我說「記住 每個月XX號要...」，{m['name']} 幫你記！",
                quick_reply=MAIN_MENU)
            return
        lines = [f"📅 {m['name']} 記住的固定行程：\n"]
        for i, r in enumerate(items, 1):
            lines.append(f"{i}. {r.get('title','?')}")
            lines.append(f"   📅 {_type_str(r)}")
            if r.get("notes"):
                lines.append(f"   📝 {r['notes']}")
            lines.append("")
        lines.append("刪除：刪除固定 名稱")
        line_reply(reply_token, "\n".join(lines), quick_reply=_quick_replies([
            ("📋 查看任務",  "查看任務"),
            ("➕ 新增固定", "記住 "),
            ("🗑️ 刪除固定", "刪除固定 "),
        ]))

    # ── 刪除固定行程 ──
    elif text.startswith("刪除固定 "):
        keyword = text[5:].strip()
        items   = load_recurring()
        before  = len(items)
        items   = [r for r in items if keyword not in r.get("title","")]
        if len(items) < before:
            save_recurring(items)
            line_reply(reply_token, f"已刪除「{keyword}」固定行程！如需再加告訴 {m['name']}～", quick_reply=MAIN_MENU)
        else:
            line_reply(reply_token, f"找不到「{keyword}」這個固定行程", quick_reply=MAIN_MENU)

    # ── 切換 BTS 成員 ──
    elif text in ["切換成員", "換成員", "選成員", "BTS", "防彈"]:
        m = get_member()
        qr = {
            "type": "quick_reply",
            "items": [
                {"type": "action", "action": {"type": "message",
                 "label": f"{'★' if k==load_member() else ''}{v['emoji']}{v['name']}",
                 "text": f"切換 {k}"}}
                for k, v in BTS_MEMBERS.items()
            ]
        }
        line_reply(reply_token,
            f"現在是 {m['emoji']} {m['full_name']} 陪你！\n點下方選擇要切換的成員 👇",
            quick_reply=qr)

    elif text.startswith("切換 "):
        key = text[3:].strip().lower()
        # 支援中文名稱對應
        name_map = {
            "jin":"jin", "金碩珍":"jin", "碩珍":"jin",
            "rm":"rm", "金南俊":"rm", "南俊":"rm", "namjoon":"rm",
            "suga":"suga", "閔玧其":"suga", "玧其":"suga", "yoongi":"suga", "agust d":"suga",
            "jhope":"jhope", "j-hope":"jhope", "鄭號錫":"jhope", "號錫":"jhope", "hoseok":"jhope",
            "jimin":"jimin", "朴智旻":"jimin", "智旻":"jimin",
            "v":"v", "金泰亨":"v", "泰亨":"v", "taehyung":"v",
            "jungkook":"jungkook", "田柾國":"jungkook", "柾國":"jungkook", "정국":"jungkook",
        }
        mapped = name_map.get(key, key)
        if mapped in BTS_MEMBERS:
            save_member(mapped)
            m = BTS_MEMBERS[mapped]
            line_reply(reply_token,
                f"{m['emoji']} 已切換到 {m['full_name']}！\n\n"
                f"📌 目前狀態：{m['status']}\n\n"
                f"現在開始由他陪你！",
                quick_reply=MAIN_MENU)
            if IS_CLOUD:
                threading.Thread(target=setup_rich_menu, daemon=True).start()
        else:
            qr = {
                "type": "quick_reply",
                "items": [
                    {"type": "action", "action": {"type": "message",
                     "label": f"{v['emoji']} {v['name']}", "text": f"切換 {k}"}}
                    for k, v in BTS_MEMBERS.items()
                ]
            }
            line_reply(reply_token, "找不到這個成員，點下方選擇：", quick_reply=qr)

    # ── 使用說明 ──
    elif text in ["幫助", "help", "Help", "？", "?", "使用說明"]:
        line_reply(reply_token,
            f"📖 {m['name']} Bot 使用說明\n\n"
            "💬 傳文字 → 建立任務和提醒\n"
            "📸 傳照片 → 辨識手寫清單\n\n"
            "📋 查看任務\n"
            "✅ 完成 任務名稱\n"
            "⏰ 延後30 任務名稱\n"
            "✏️ 編輯 任務名稱\n"
            "  └ 改時間 任務 新時間\n"
            "  └ 改內容 任務 新說明\n"
            "  └ 改標題 任務 新標題\n"
            "🗑️ 刪除任務 名稱\n"
            "🗑️ 刪除全部任務\n\n"
            "📅 記住 每月25號...\n"
            "📅 查看固定行程\n"
            f"🗑️ 刪除固定 名稱\n\n"
            f"{m['name']} 全程監督！{m['emoji']}",
            quick_reply=MAIN_MENU)

    # ── 其他：AI 分析 ──
    else:
        line_reply(reply_token,
            f"分析中～{m['name']} 也很忙的！\n請稍等...⏳",
            quick_reply=MAIN_MENU)
        threading.Thread(target=process_task, args=(user_id, text), daemon=True).start()

TASK_KEYWORDS = [
    "要", "需要", "記得", "提醒", "待會", "等一下", "明天", "後天", "下週", "下周",
    "下午", "早上", "上午", "中午", "今晚", "今天", "明早", "點", "分鐘", "小時",
    "截止", "期限", "前", "號", "月", "日", "繳", "交", "送", "寄", "開會",
    "回", "打電話", "聯絡", "確認", "檢查", "準備", "完成", "處理",
]

def _looks_like_task(text):
    return any(kw in text for kw in TASK_KEYWORDS)

def process_task(user_id, text):
    try:
        result = call_claude(text)
        tasks = result.get("tasks", [])
        msg = result.get("jin_message", "加油 ARMY！")

        # 沒有任務 → 判斷是否應該建立任務
        if not tasks:
            if _looks_like_task(text):
                # 有任務關鍵字但 AI 沒建立 → 再試一次，明確要求建立任務
                retry_text = f"請幫我記住這個任務並設定提醒：{text}"
                result2 = call_claude(retry_text)
                tasks2 = result2.get("tasks", [])
                if tasks2:
                    tasks = tasks2
                    msg = result2.get("jin_message", msg)
                else:
                    # 仍然沒有 → 詢問使用者
                    _pm = get_member()
                    line_push(user_id,
                        f"{_pm['emoji']} {_pm['name']}：{msg}\n\n"
                        f"{_pm['name']} 看起來你有事要做耶～\n"
                        "要幫你建立提醒嗎？\n"
                        "試著告訴我：\n「[任務名稱] [時間]」\n例如：下午3點開會、明天交報告",
                        quick_reply=_quick_replies([
                            ("📋 查看任務", "查看任務"),
                            ("❓ 使用說明", "幫助"),
                        ]))
                    return
            else:
                # 純聊天
                chat_reply = call_chat(text)
                _cm = get_member()
                line_push(user_id, f"{_cm['emoji']} {chat_reply}", quick_reply=MAIN_MENU)
                return

        add_tasks(tasks)
        # 取得 remind_at（add_tasks 已計算好）
        saved = load_tasks()
        titles = {t["title"] for t in tasks}
        enriched = [t for t in saved if t["title"] in titles][-len(tasks):]
        messages = _tasks_flex(msg, enriched)
        line_push_messages(user_id, messages)
        _nm = get_member()
        do_notify(f"{_nm['name']} 說！{_nm['emoji']}", msg)
    except Exception as e:
        line_push(user_id, f"出錯了：{e}", quick_reply=MAIN_MENU)
        print(f"[process_task Error] {e}")

def _type_str(r):
    rtype = r.get("type", "monthly")
    weekday = r.get("weekday")
    wd_str = "一二三四五六日"[int(weekday)] if weekday is not None else "?"
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

        # 支援單筆（舊格式）或多筆（新 items 格式）
        if "items" in result:
            new_items = result["items"]
        elif "title" in result:
            new_items = [result]
        else:
            raise ValueError(f"無法解析回應格式：{result}")

        saved = load_recurring()
        for item in new_items:
            item["id"] = str(uuid.uuid4())[:8]
            item["active"] = True
            saved.append(item)
        save_recurring(saved)

        _rm = get_member()
        jin_msg = result.get("jin_message", f"{_rm['name']} 全部記住了！")
        lines = [f"{_rm['emoji']} {_rm['name']}：{jin_msg}\n", f"📅 已記住 {len(new_items)} 個固定行程：\n"]
        for item in new_items:
            lines.append(f"✅ {item['title']}")
            lines.append(f"   ⏰ {_type_str(item)}")
            if item.get("notes"):
                lines.append(f"   📝 {item['notes']}")
            lines.append("")
        lines.append("查看全部請傳「查看固定行程」")

        qr = _quick_replies([
            ("📅 查看固定行程", "查看固定行程"),
            ("📋 查看任務", "查看任務"),
        ])
        line_push(user_id, "\n".join(lines), quick_reply=qr)
        do_notify(f"{_rm['name']} 記住了！📅", f"已記住 {len(new_items)} 個固定行程")
    except Exception as e:
        line_push(user_id, f"記錄固定行程時出錯了：{e}\n請重新傳一次", quick_reply=MAIN_MENU)

# ── 固定行程排程觸發 ──────────────────────────────────────────
def check_recurring():
    """每天早上檢查固定行程，在指定天數前建立提醒任務"""
    import uuid as _uuid
    now = datetime.now()
    uid = load_user_id()
    if not uid:
        return
    items = load_recurring()
    tasks = load_tasks()
    existing_titles_today = {
        t["title"] for t in tasks
        if t.get("status") == "pending" and t.get("created_at","").startswith(now.strftime("%Y-%m-%d"))
    }

    for r in items:
        if not r.get("active", True):
            continue
        rtype = r.get("type", "monthly")
        remind_days = r.get("remind_days_before", 1)
        remind_time = r.get("remind_time", "09:00")
        title = r["title"]

        target_date = None
        if rtype == "monthly":
            day = r.get("month_day", 25)
            # 找這個月或下個月的目標日
            try:
                candidate = now.replace(day=day)
            except ValueError:
                candidate = (now.replace(day=1) + timedelta(days=32)).replace(day=1)
            if candidate.date() < now.date():
                # 已過，用下個月
                next_m = (now.replace(day=1) + timedelta(days=32)).replace(day=1)
                try:
                    candidate = next_m.replace(day=day)
                except ValueError:
                    continue
            target_date = candidate.date()

        elif rtype == "weekly":
            weekday = r.get("weekday", 0)
            days_ahead = (weekday - now.weekday()) % 7
            if days_ahead == 0:
                days_ahead = 7
            target_date = (now + timedelta(days=days_ahead)).date()

        elif rtype == "yearly":
            month = r.get("month", now.month)
            day = r.get("month_day", 1)
            try:
                candidate = now.replace(month=month, day=day)
            except ValueError:
                continue
            if candidate.date() < now.date():
                candidate = candidate.replace(year=now.year + 1)
            target_date = candidate.date()

        if target_date is None:
            continue

        days_until = (target_date - now.date()).days
        if days_until == remind_days and title not in existing_titles_today:
            h, m = map(int, remind_time.split(":"))
            remind_at = now.replace(hour=h, minute=m, second=0, microsecond=0)
            if remind_at < now:
                remind_at += timedelta(days=1)

            notes_part = f"\n\n📝 記得注意：{r['notes']}" if r.get("notes") else ""
            new_task = {
                "id": str(_uuid.uuid4())[:8],
                "title": title,
                "detail": r.get("detail", "") + notes_part,
                "remind_at": remind_at.strftime("%Y-%m-%d %H:%M:%S"),
                "created_at": now.strftime("%Y-%m-%d %H:%M:%S"),
                "status": "pending",
                "from_recurring": True,
            }
            tasks.append(new_task)
            save_tasks(tasks)
            _crm = get_member()
            push_msg = (
                f"📅 固定行程提醒！\n\n"
                f"{_crm['name']} 記得你說的！{title} 還有 {days_until} 天！\n"
                f"📝 {r.get('detail','')}"
            )
            if r.get("notes"):
                push_msg += f"\n\n⚠️ 特別注意：{r['notes']}"
            push_msg += f"\n\n{_crm['emoji']} 要開始準備了！Fighting！"
            line_push(uid, push_msg, quick_reply=_task_actions(title))
            do_notify(f"📅 固定行程：{title}", f"還有{days_until}天！요빠提醒你！")
            print(f"[固定行程] 建立提醒：{title}")

# ── 排程提醒 ──────────────────────────────────────────────────
def check_reminders():
    import random
    tasks = load_tasks()
    now = datetime.now()
    updated = False
    uid = load_user_id()

    for t in tasks:
        if t.get("status") != "pending": continue
        if now >= datetime.strptime(t["remind_at"], "%Y-%m-%d %H:%M:%S"):
            tpl_t, tpl_m = random.choice(get_remind_templates())
            remind_msg = tpl_m.format(t=t["title"])
            push_msg = f"{tpl_t}\n{remind_msg}\n\n📝 {t['detail']}"
            do_notify_task(t["title"], remind_msg + f"\n{t['detail']}")
            if uid:
                line_push(uid, push_msg, quick_reply=_task_actions(t["title"]))
            t["remind_at"] = (now + timedelta(minutes=30)).strftime("%Y-%m-%d %H:%M:%S")
            t["remind_count"] = t.get("remind_count", 0) + 1
            updated = True
            print(f"[提醒] {t['title']}")
    if updated:
        save_tasks(tasks)

DAILY_SLOTS = [
    ("08:30", "morning",   "早安！"),
    ("13:30", "afternoon", "下午好！"),
    ("20:00", "evening",   "晚上好！"),
]
# 每天隨機選 1~2 個時段發送（確保不會太吵）
import random as _random
_today_slots: set = set()
_last_slots_date: str = ""

def _pick_today_slots():
    global _today_slots, _last_slots_date
    today = datetime.now().strftime("%Y-%m-%d")
    if _last_slots_date != today:
        _last_slots_date = today
        # 每天隨機選 1 或 2 個時段
        count = _random.choice([1, 2])
        _today_slots = set(_random.sample([s[0] for s in DAILY_SLOTS], count))
        print(f"[每日關心] 今天選定時段：{_today_slots}")

def send_daily_checkin(slot_time, slot_name, greeting):
    """在指定時段發送每日關心訊息"""
    _pick_today_slots()
    if slot_time not in _today_slots:
        return  # 今天不發這個時段
    uid = load_user_id()
    if not uid:
        return
    try:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M (%A)")
        prompt  = _daily_checkin_prompt(slot_name).replace("{now}", now_str)
        messages = [{"role": "user", "content": prompt}]
        msg = _call_groq(messages, max_tokens=200).strip()
        m   = get_member()
        line_push(uid, f"{m['emoji']} {greeting}\n\n{msg}", quick_reply=MAIN_MENU)
        print(f"[每日關心/{slot_name}] 已發送")
    except Exception as e:
        print(f"[每日關心 Error] {e}")

def check_and_checkin():
    """空閒時隨機關心（原本保留，頻率降低避免太吵）"""
    import random
    # 只在奇數小時觸發，降低頻率
    if datetime.now().hour % 4 != 0:
        return
    hour = datetime.now().hour
    if hour < 9 or hour >= 22:
        return
    uid = load_user_id()
    if not uid:
        return
    tasks = load_tasks()
    if any(t.get("status") == "pending" for t in tasks):
        return
    try:
        msg = call_checkin()
        _chm = get_member()
        line_push(uid, f"{_chm['emoji']} {_chm['name']} 路過關心你～\n\n{msg}", quick_reply=MAIN_MENU)
        print(f"[{_chm['name']}關心] 隨機關心訊息")
    except Exception as e:
        print(f"[Checkin Error] {e}")

def _get_cjk_font(size):
    """取得中文字型，優先系統字型，找不到就下載 Noto Sans"""
    from PIL import ImageFont
    import os
    candidates = [
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    # 下載 Noto Sans CJK
    font_path = _DATA_DIR / "NotoSansCJK.ttf"
    if not font_path.exists():
        try:
            import urllib.request
            url = "https://github.com/googlefonts/noto-cjk/raw/main/Sans/SubsetOTF/TC/NotoSansCJKtc-Regular.otf"
            urllib.request.urlretrieve(url, str(font_path))
        except Exception:
            font_path = None
    if font_path and font_path.exists():
        try:
            return ImageFont.truetype(str(font_path), size)
        except Exception:
            pass
    return ImageFont.load_default()

def _make_menu_png(member_color_hex):
    """用 PIL 畫有文字標籤的 5 格 Rich Menu PNG（2500x843）"""
    import io
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        return _make_menu_png_fallback(member_color_hex)

    W, H = 2500, 843
    ch = member_color_hex.lstrip("#")
    mr, mg, mb = int(ch[0:2],16), int(ch[2:4],16), int(ch[4:6],16)

    def shade(r,g,b,f):
        return (min(255,int(r*f)), min(255,int(g*f)), min(255,int(b*f)))

    buttons = [
        (shade(mr,mg,mb,1.00), "📋", "查看任務"),
        (shade(mr,mg,mb,0.82), "📅", "固定行程"),
        (shade(mr,mg,mb,0.64), "📸", "拍照辨識"),
        (shade(mr,mg,mb,0.46), "🎤", "切換成員"),
        (shade(mr,mg,mb,0.30), "❓", "說明"),
    ]

    img = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    SEC_W = W // 5
    font_label = _get_cjk_font(90)
    font_icon  = _get_cjk_font(110)

    for i, (color, icon, label) in enumerate(buttons):
        x0 = i * SEC_W + (6 if i > 0 else 0)
        x1 = (i + 1) * SEC_W
        draw.rectangle([x0, 6, x1, H - 6], fill=color)

        cx = i * SEC_W + SEC_W // 2
        # emoji icon
        try:
            draw.text((cx, H//2 - 100), icon, font=font_icon, fill=(255,255,255), anchor="mm")
        except Exception:
            pass
        # Chinese label
        try:
            draw.text((cx, H//2 + 30), label, font=font_label, fill=(255,255,255), anchor="mm")
        except Exception:
            draw.text((cx - len(label)*25, H//2 + 20), label, font=font_label, fill=(255,255,255))

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def _make_menu_png_fallback(member_color_hex):
    """PIL 不可用時的備用方案（純色塊）"""
    import struct, zlib
    W, H = 2500, 843
    ch = member_color_hex.lstrip("#")
    mr, mg, mb = int(ch[0:2],16), int(ch[2:4],16), int(ch[4:6],16)
    def shade(r,g,b,f):
        return (min(255,int(r*f)), min(255,int(g*f)), min(255,int(b*f)))
    sections = [shade(mr,mg,mb,f) for f in [1.0, 0.82, 0.64, 0.46, 0.30]]
    SEC_W = W // 5
    raw = b''
    for y in range(H):
        row = []
        for x in range(W):
            sec = min(x // SEC_W, 4)
            if (x % SEC_W < 6 and sec > 0) or y < 6 or y > H - 7:
                row.extend([255, 255, 255])
            else:
                row.extend(list(sections[sec]))
        raw += b'\x00' + bytes(row)
    def chunk(tag, data):
        c = tag + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    return (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(raw))
            + chunk(b'IEND', b''))

def _make_solid_png(w, h, r, g, b):
    import struct, zlib
    raw = b''
    for _ in range(h):
        raw += b'\x00' + bytes([r, g, b] * w)
    def chunk(tag, data):
        c = tag + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    return (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(raw))
            + chunk(b'IEND', b''))

def _delete_all_rich_menus():
    """刪除 LINE 帳號下所有 Rich Menu（避免堆積）"""
    try:
        ctx = ssl.create_default_context()
        conn = http.client.HTTPSConnection("api.line.me", context=ctx)
        conn.request("GET", "/v2/bot/richmenu/list", headers={
            "Authorization": f"Bearer {LINE_ACCESS_TOKEN}"})
        menus = json.loads(conn.getresponse().read().decode("utf-8"))
        conn.close()
        for menu in menus.get("richmenus", []):
            mid = menu.get("richMenuId", "")
            if not mid: continue
            conn2 = http.client.HTTPSConnection("api.line.me", context=ctx)
            conn2.request("DELETE", f"/v2/bot/richmenu/{mid}", headers={
                "Authorization": f"Bearer {LINE_ACCESS_TOKEN}"})
            conn2.getresponse().read(); conn2.close()
            print(f"[RichMenu] 刪除舊選單：{mid}")
    except Exception as e:
        print(f"[RichMenu] 刪除舊選單錯誤：{e}")

def setup_rich_menu():
    """在 LINE 建立固定懸浮選單（Rich Menu）"""
    m = get_member()
    color_hex = m.get("color", "#C8547A").lstrip("#")
    r, g, b = int(color_hex[0:2],16), int(color_hex[2:4],16), int(color_hex[4:6],16)
    _delete_all_rich_menus()
    menu_body = json.dumps({
        "size": {"width": 2500, "height": 843},
        "selected": True,
        "name": "Main Menu",
        "chatBarText": f"{m['emoji']} 點我開選單",
        "areas": [
            {"bounds": {"x":0,    "y":0, "width":500, "height":843}, "action": {"type":"message","text":"查看任務"}},
            {"bounds": {"x":500,  "y":0, "width":500, "height":843}, "action": {"type":"message","text":"查看固定行程"}},
            {"bounds": {"x":1000, "y":0, "width":500, "height":843}, "action": {"type":"camera"}},
            {"bounds": {"x":1500, "y":0, "width":500, "height":843}, "action": {"type":"message","text":"切換成員"}},
            {"bounds": {"x":2000, "y":0, "width":500, "height":843}, "action": {"type":"message","text":"幫助"}},
        ]
    }, ensure_ascii=False).encode("utf-8")
    try:
        ctx = ssl.create_default_context()
        conn = http.client.HTTPSConnection("api.line.me", context=ctx)
        conn.request("POST", "/v2/bot/richmenu", body=menu_body, headers={
            "Authorization": f"Bearer {LINE_ACCESS_TOKEN}", "Content-Type": "application/json"})
        result = json.loads(conn.getresponse().read().decode("utf-8"))
        conn.close()
        menu_id = result.get("richMenuId", "")
        if not menu_id:
            print(f"[RichMenu] 建立失敗：{result}"); return
        img = _make_menu_png(m.get("color", "#C8547A"))
        conn2 = http.client.HTTPSConnection("api-data.line.me", context=ctx)
        conn2.request("POST", f"/v2/bot/richmenu/{menu_id}/content", body=img, headers={
            "Authorization": f"Bearer {LINE_ACCESS_TOKEN}", "Content-Type": "image/png"})
        r2 = conn2.getresponse(); r2.read(); conn2.close()
        conn3 = http.client.HTTPSConnection("api.line.me", context=ctx)
        conn3.request("POST", f"/v2/bot/user/all/richmenu/{menu_id}", headers={
            "Authorization": f"Bearer {LINE_ACCESS_TOKEN}"})
        conn3.getresponse().read(); conn3.close()
        print(f"[RichMenu] 建立成功：{menu_id} {m['name']}")
    except Exception as e:
        print(f"[RichMenu] 錯誤：{e}")

def run_scheduler():
    schedule.every(1).minutes.do(check_reminders)
    schedule.every(2).hours.do(check_and_checkin)
    schedule.every().day.at("08:00").do(check_recurring)
    # 每日固定關心訊息（3 個時段各設一個）
    # 每日關心訊息（暫時關閉以節省 LINE 推播額度，需要時取消註解）
    # schedule.every().day.at("08:30").do(send_daily_checkin, "08:30", "morning",   "早安！")
    # schedule.every().day.at("13:30").do(send_daily_checkin, "13:30", "afternoon", "下午好！")
    # schedule.every().day.at("20:00").do(send_daily_checkin, "20:00", "evening",   "晚上好！")
    # 啟動時先跑一次固定行程檢查
    threading.Thread(target=check_recurring, daemon=True).start()
    while True:
        schedule.run_pending()
        time.sleep(15)

# ── Webhook 伺服器 ────────────────────────────────────────────
class WebhookHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args): pass

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)

        sig = self.headers.get("X-Line-Signature", "")
        mac = hmac.new(LINE_CHANNEL_SECRET.encode("utf-8"), body, hashlib.sha256).digest()
        expected = base64.b64encode(mac).decode("utf-8")
        if sig != expected:
            self.send_response(400)
            self.end_headers()
            return

        self.send_response(200)
        self.end_headers()

        try:
            data = json.loads(body.decode("utf-8"))
            for event in data.get("events", []):
                if event.get("type") != "message":
                    continue

                user_id    = event["source"]["userId"]
                reply_token = event["replyToken"]
                msg_type   = event["message"]["type"]

                # 儲存 User ID
                if not load_user_id():
                    save_user_id(user_id)

                if msg_type == "text":
                    text = event["message"]["text"]
                    threading.Thread(
                        target=handle_message,
                        args=(user_id, reply_token, text),
                        daemon=True
                    ).start()

                elif msg_type == "image":
                    message_id = event["message"]["id"]
                    threading.Thread(
                        target=process_image,
                        args=(user_id, reply_token, message_id),
                        daemon=True
                    ).start()

        except Exception as e:
            print(f"[Webhook Error] {e}")

    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        m = get_member()
        self.wfile.write(f"{m['name']} Bot is running!".encode("utf-8"))

# ── 主程式 ────────────────────────────────────────────────────
if __name__ == "__main__":
    threading.Thread(target=run_scheduler, daemon=True).start()
    if IS_CLOUD:
        threading.Thread(target=setup_rich_menu, daemon=True).start()

    server = HTTPServer(("0.0.0.0", PORT), WebhookHandler)
    print("=" * 50)
    print(f"Bot 啟動！port {PORT}  成員：{get_member()['full_name']}")
    print(f"模式：{'☁️ 雲端' if IS_CLOUD else '💻 本地'}")
    print("傳照片給 Bot 可辨識手寫清單！")
    print("=" * 50)
    server.serve_forever()
