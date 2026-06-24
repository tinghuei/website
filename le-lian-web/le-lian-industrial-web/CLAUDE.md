# 樂聯工業網站 — 開發注意事項

React 19 + TypeScript + Tailwind CSS v4 + Vite 7 的 SPA（部署於 GitHub Pages）。
教育訓練模組位於 `client/src/pages/training/`，資料層已遷移至 Supabase（Postgres + Auth + Storage，
見 `supabase/schema.sql`），狀態管理在 `client/src/context/TrainingAuthContext.tsx` 經由 Supabase
讀寫並同步至所有裝置；影片/教材檔案儲存於 Supabase Storage，見 `client/src/lib/videoStorage.ts`、
`client/src/lib/presentationStorage.ts`。

## 重要規則：不要覆寫使用者已手動更新的資料

新增或調整功能時，**不可覆寫、重置或還原使用者已經手動新增/編輯/刪除過的資料**，包含但不限於：

- `client/src/data/trainingMockData.ts` 中已被手動修改過的課程內容（標題、說明、測驗題目等）
- 透過介面新增或編輯的課程（含上傳的影片、教材檔案、自訂測驗題目）
- 其他資料檔案中手動調整過的內容，例如 `client/src/data/orgChartData.ts`（組織圖）、
  使用者名單、公告等 mock data

實作時請：

- 優先使用針對性的小範圍編輯（Edit），避免整份重寫資料檔案或陣列
- 修改資料結構（新增欄位）時，採用「新增可選欄位」的方式擴充現有項目，而非重新產生整個資料集
- 若功能需要重新產生/批次調整資料，先確認該檔案/區塊是否含有先前手動調整的內容，避免覆蓋
