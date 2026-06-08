"""
jin_notify.py - 電腦桌面通知腳本
每分鐘從 JSONBin 抓任務，時間到就跳 Windows 通知。
開機自動執行：把 jin_notify.vbs 放到 shell:startup 資料夾。

設定：把下方 JSONBIN_API_KEY 填入你的 JSONBin API Key。
"""

import http.client, ssl, json, time, os
from datetime import datetime
from pathlib import Path

# ── 設定（填入你的 JSONBin API Key）────────────────────────────
JSONBIN_API_KEY   = ""          # 填入 JSONBin API Key，例如 "$2a$10$xxxxx"
JSONBIN_BIN_TASKS = "6a229193f5f4af5e29bcd0d7"
JSONBIN_BIN_MEMBER = None       # 可不填，填了會顯示成員名字

CHECK_INTERVAL = 60             # 每幾秒檢查一次（預設 60 秒）
# ───────────────────────────────────────────────────────────────

NOTIFIED_FILE = Path(__file__).parent / "_notified.json"

def _load_notified():
    if NOTIFIED_FILE.exists():
        try:
            return json.loads(NOTIFIED_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}

def _save_notified(data):
    NOTIFIED_FILE.write_text(json.dumps(data), encoding="utf-8")

def _fetch_tasks():
    try:
        ctx = ssl.create_default_context()
        conn = http.client.HTTPSConnection("api.jsonbin.io", context=ctx)
        conn.request("GET", f"/v3/b/{JSONBIN_BIN_TASKS}/latest", headers={
            "X-Master-Key": JSONBIN_API_KEY,
            "X-Bin-Meta": "false",
        })
        body = json.loads(conn.getresponse().read().decode("utf-8"))
        conn.close()
        raw = body.get("data", body)
        if isinstance(raw, list):
            return raw
        return []
    except Exception as e:
        print(f"[錯誤] 抓取任務失敗：{e}")
        return []

def _notify(title, message):
    try:
        from win11toast import toast
        toast(title, message)
        return
    except Exception:
        pass
    try:
        from plyer import notification
        notification.notify(title=title, message=message, timeout=10)
        return
    except Exception:
        pass
    print(f"[通知] {title}：{message}")

def check_and_notify():
    now = datetime.now()
    tasks = _fetch_tasks()
    notified = _load_notified()
    updated = False

    for t in tasks:
        if t.get("status") != "pending":
            continue
        remind_at = t.get("remind_at", "")
        task_id   = t.get("id", t.get("title", ""))
        if not remind_at or not task_id:
            continue

        try:
            remind_dt = datetime.strptime(remind_at, "%Y-%m-%d %H:%M:%S")
        except Exception:
            continue

        # 時間到，且這個 remind_at 還沒通知過
        notif_key = f"{task_id}_{remind_at}"
        if now >= remind_dt and notif_key not in notified:
            _notify(
                f"⏰ 提醒：{t['title']}",
                t.get("detail", "") or t["title"]
            )
            notified[notif_key] = now.strftime("%Y-%m-%d %H:%M")
            updated = True
            print(f"[{now.strftime('%H:%M:%S')}] 通知：{t['title']}")

    # 清掉超過 7 天的舊記錄，避免檔案越來越大
    cutoff = now.timestamp() - 7 * 86400
    notified = {k: v for k, v in notified.items()
                if datetime.strptime(v, "%Y-%m-%d %H:%M").timestamp() > cutoff}

    if updated:
        _save_notified(notified)

def main():
    if not JSONBIN_API_KEY:
        print("請先設定 JSONBIN_API_KEY！")
        print("開啟 jin_notify.py，在上方填入你的 JSONBin API Key。")
        input("按 Enter 關閉...")
        return

    print(f"Jin 通知服務啟動！每 {CHECK_INTERVAL} 秒檢查一次。")
    print("關閉此視窗即可停止。\n")

    while True:
        try:
            check_and_notify()
        except Exception as e:
            print(f"[錯誤] {e}")
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
