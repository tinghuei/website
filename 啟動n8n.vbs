' 靜默啟動 n8n（不會跳出黑色視窗）
' 若用 npm 全域安裝 n8n，保持這一行即可；若用其他方式安裝請自行調整指令
Set ws = CreateObject("WScript.Shell")
ws.Run "cmd /c n8n start", 0, False
