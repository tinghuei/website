# 將樂聯工業網站導入新 Manus 帳號 - 完整步驟

## 前置準備

1. **新帳號登入** - 確保您已登入新的 Manus 帳號
2. **下載檔案** - 已獲得 `le-lian-industrial-web-complete.zip` 檔案
3. **本地環境** - 確保已安裝 Node.js 22+ 和 pnpm

## 第一步：上傳程式碼到新帳號

### 方法 A：使用 GitHub（推薦）

1. **在 GitHub 上創建新倉庫**
   - 訪問 https://github.com/new
   - 倉庫名稱：`le-lian-industrial-web`（或您偏好的名稱）
   - 設置為 Private（可選）
   - 創建倉庫

2. **本地準備程式碼**
   ```bash
   # 解壓檔案
   unzip le-lian-industrial-web-complete.zip
   cd le-lian-industrial-web
   
   # 初始化 Git（如果還沒有）
   git init
   git add .
   git commit -m "Initial commit: Le Lian Industrial website"
   ```

3. **推送到 GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/le-lian-industrial-web.git
   git branch -M main
   git push -u origin main
   ```

4. **在 Manus 平台中導入**
   - 登入新帳號的 Manus 平台
   - 點擊「新建專案」或「導入專案」
   - 選擇「從 GitHub 導入」
   - 授權 Manus 訪問您的 GitHub 帳號
   - 選擇 `le-lian-industrial-web` 倉庫
   - 點擊「導入」

### 方法 B：直接上傳 ZIP（快速方式）

1. **在 Manus 平台中**
   - 登入新帳號
   - 點擊「新建專案」
   - 選擇「上傳 ZIP」
   - 選擇 `le-lian-industrial-web-complete.zip`
   - 點擊「上傳」

## 第二步：配置專案

1. **等待 Manus 自動配置**
   - Manus 會自動檢測 `package.json` 中的框架類型
   - 系統會自動識別為 React + Node.js 專案
   - 自動配置必要的環境變數

2. **驗證環境變數**
   - 進入專案設置 → 環境變數
   - 確認以下變數已設置：
     - `DATABASE_URL` ✓
     - `JWT_SECRET` ✓
     - `VITE_APP_ID` ✓
     - `OAUTH_SERVER_URL` ✓
     - 其他 OAuth 相關變數 ✓

## 第三步：初始化資料庫

1. **在 Manus 開發環境中**
   ```bash
   # 連接到開發伺服器終端
   pnpm db:push
   ```
   
   這會：
   - 生成資料庫遷移文件
   - 創建所有必要的表
   - 設置表關係和約束

2. **驗證資料庫**
   - 進入 Manus 管理面板 → 資料庫
   - 確認以下表已創建：
     - `users`
     - `contactSubmissions`
     - `assessmentResults`
     - `jobPositions`
     - `competencies`
     - `positionCompetencies`
     - 其他相關表

## 第四步：啟動開發伺服器

1. **在 Manus 平台中**
   - 點擊「Preview」或「開發伺服器」
   - 系統會自動執行 `pnpm dev`
   - 等待伺服器啟動（通常 30-60 秒）

2. **驗證伺服器運行**
   - 查看開發伺服器日誌
   - 確認看到「Server running at」消息
   - 預覽 URL 應該可以訪問

## 第五步：驗證功能

### 檢查前端頁面
1. 訪問首頁 `/` - 應該看到樂聯工業首頁
2. 訪問各個頁面：
   - `/about` - 公司簡介
   - `/services` - 業務範疇
   - `/quality` - 品質管理
   - `/training` - 人才培育
   - `/contact` - 聯絡我們

### 檢查職能評估
1. 進入 `/training` 頁面
2. 點擊「開始分析」按鈕
3. 進入 `/detailed-competency-assessment`
4. 選擇職位進行評估
5. 點擊「保存評估結果」

### 檢查管理員儀表板
1. 進入 `/training` 頁面
2. 點擊「查看儀表板」按鈕
3. 進入 `/admin-dashboard`
4. 驗證統計卡片顯示數據
5. 測試篩選功能
6. 測試 Excel 導出

## 第六步：運行測試

```bash
# 在開發伺服器終端中
pnpm test
```

預期結果：
- `Test Files  2 passed (2)`
- `Tests  16 passed (16)`

## 第七步：配置自定義域名（可選）

1. **在 Manus 平台中**
   - 進入專案設置 → 域名
   - 選擇「添加自定義域名」
   - 輸入您的域名（例如：lelian.com）
   - 按照指示配置 DNS 記錄
   - 驗證域名所有權

2. **配置 SSL 證書**
   - Manus 會自動配置 Let's Encrypt SSL
   - 通常在 5-10 分鐘內完成

## 第八步：部署到生產環境

1. **創建檢查點**
   - 在 Manus 管理面板中
   - 點擊「保存檢查點」
   - 添加描述（例如：「初始部署」）

2. **發布網站**
   - 點擊「發布」按鈕
   - 確認發布設置
   - 等待部署完成（通常 2-5 分鐘）

3. **驗證生產環境**
   - 訪問生產 URL
   - 確認所有功能正常運作
   - 檢查性能和加載速度

## 常見問題

### Q: 資料庫連接失敗
**A:** 
1. 確認 `DATABASE_URL` 已正確設置
2. 檢查資料庫伺服器狀態
3. 嘗試重新啟動開發伺服器

### Q: 環境變數缺失
**A:**
1. 進入專案設置 → 環境變數
2. 確認所有必要變數已設置
3. 如缺失，手動添加相應的值
4. 重新啟動開發伺服器

### Q: 前端頁面無法加載
**A:**
1. 檢查開發伺服器日誌
2. 清除瀏覽器緩存
3. 嘗試硬刷新（Ctrl+Shift+R）
4. 檢查 TypeScript 編譯錯誤

### Q: 職能評估無法保存
**A:**
1. 確認資料庫已初始化（`pnpm db:push`）
2. 檢查瀏覽器控制台的錯誤信息
3. 確認 API 端點可訪問
4. 檢查資料庫連接

### Q: Excel 導出不工作
**A:**
1. 確認 `xlsx` 套件已安裝
2. 檢查瀏覽器控制台的錯誤
3. 確認有評估結果可導出
4. 嘗試刷新頁面後重試

## 資料遷移（如果需要）

如果您需要從舊帳號遷移現有的評估數據：

1. **導出舊帳號的資料**
   ```bash
   # 在舊帳號中
   # 使用 Manus 管理面板導出資料庫備份
   ```

2. **導入到新帳號**
   ```bash
   # 在新帳號中
   # 使用 Manus 管理面板導入資料庫備份
   ```

3. **驗證資料完整性**
   - 檢查評估結果數量
   - 驗證聯絡表單提交記錄
   - 確認職位和職能數據

## 後續支持

### 需要幫助？
1. 查看 `部署指南.md` 了解更多技術細節
2. 檢查 `todo.md` 了解已完成和待辦功能
3. 查看項目代碼中的註釋和文檔

### 建議的下一步
1. **自定義公司信息** - 更新公司名稱、聯絡方式等
2. **添加公司 Logo** - 上傳公司 Logo 圖片
3. **配置郵件通知** - 設置聯絡表單提交通知
4. **添加分析追蹤** - 集成 Google Analytics 或其他分析工具
5. **性能優化** - 優化圖片、緩存等

## 檢查清單

部署完成前，請確認以下項目：

- [ ] 程式碼已成功導入
- [ ] 環境變數已配置
- [ ] 資料庫已初始化
- [ ] 開發伺服器運行正常
- [ ] 所有頁面可訪問
- [ ] 職能評估功能正常
- [ ] 管理員儀表板正常
- [ ] 測試全部通過
- [ ] 自定義域名已配置（可選）
- [ ] 生產環境已部署

---

**完成此步驟後，您的樂聯工業網站將完全在新帳號中運行！**

如有任何問題，請參考 `部署指南.md` 或聯絡 Manus 支持團隊。
