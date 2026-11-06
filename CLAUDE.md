# 旅遊 App（GitHub Pages）

三人（浣熊、蕭、君）旅遊行程與記帳的單頁網站，網址：https://chen0890210-dotcom.github.io/travel/

## 檔案
- `index.html`：整個網站（HTML + CSS + JS 都在這一個檔），沒有建置步驟，改完 push 就會由 GitHub Pages 發布。
- `sw.js`：Service Worker，離線快取網站與字體、Firebase SDK。改了快取清單時把 `VERSION` 加一。
- `manifest.webmanifest`、`icon-*.png`：加到主畫面用的 App 設定與圖示。

## index.html 裡的重點區塊（用搜尋找）
- `const DAYS = `：北海道 10 天行程資料（每天的 items、stay、note）。
- `/* world map */`、`renderWorld`：首頁地圖與插圖；`/* ===== team animation ===== */`：三人走路與飛機動畫。
- `/* ===== trip backgrounds ===== */`：各旅程背景插畫與選單插畫。
- `const TRIPS = [`：Hamburger Menu 的旅程清單；新增旅程要加在這裡，並在 `show()` 的路由加上對應的 hash。
- `/* ===== ledger ===== */`：記帳、分攤（平均或自訂金額）、日幣/台幣分開計與結算、匯率自動帶入。
- `FIREBASE_CONFIG`、`TRIP_ID`：記帳同步用的 Firestore 設定；資料在 `trips/{TRIP_ID}/expenses`。

## 規則
- 介面文字一律繁體中文。
- 保持單檔、不加建置工具；外部只用 Google Fonts、Firebase SDK（gstatic）、匯率 API。
- Firestore 安全規則只開放 `trips/hokkaido-2026-bda97169cfdd/expenses`；新旅程若要新帳本，記得同步更新 Firebase 主控台的規則。
- 改完先在本機用瀏覽器開 `index.html` 測試（記帳在本機會因 Firebase 網域限制而改存手機），再 commit / push。
