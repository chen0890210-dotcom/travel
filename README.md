# 冬雪北海道｜闖關地圖

三人北海道之旅的行程 App（2026/11/24–12/03），部署在 GitHub Pages。

## 部署到 GitHub Pages

1. 在 GitHub 建立一個新的 repository（例如 `hokkaido-2026`）。
2. 上傳這個資料夾裡的 `index.html`（和這份 README）。
3. 到 repository 的 **Settings → Pages**，Source 選 **Deploy from a branch**，Branch 選 `main`、資料夾 `/ (root)`，按 Save。
4. 約 1 分鐘後，網址會是 `https://你的帳號.github.io/hokkaido-2026/`。

到這一步，行程、地圖、動畫都能用，記帳會先存在各自的手機上。

## 開啟三人同步記帳（Firebase，免費）

1. 到 https://console.firebase.google.com 建立專案（Google Analytics 可以關掉）。
2. 專案首頁點 **</>（網頁）** 新增應用程式，取一個名字，**不用**勾 Firebase Hosting。
3. 複製畫面上的 `firebaseConfig = { ... }` 內容。
4. 打開 `index.html`，搜尋 `const FIREBASE_CONFIG = null;`，把 `null` 換成剛剛複製的物件，例如：

   ```js
   const FIREBASE_CONFIG = {
     apiKey: "AIza...",
     authDomain: "xxx.firebaseapp.com",
     projectId: "xxx",
     storageBucket: "xxx.appspot.com",
     messagingSenderId: "123...",
     appId: "1:123...:web:..."
   };
   ```

5. 左側選 **Build → Firestore Database → 建立資料庫**，地區建議選 `asia-east1（台灣）`，以「正式版模式」建立。
6. 到 Firestore 的 **規則（Rules）** 分頁，整段換成下面的規則後按「發布」：

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /trips/hokkaido-2026-bda97169cfdd/expenses/{id} {
         allow read: if true;
         allow delete: if true;
         allow create, update: if request.resource.data.keys().hasOnly(['id','amount','cur','cat','item','day','who','split','shares','ts'])
                               && request.resource.data.amount is number
                               && request.resource.data.amount > 0
                               && request.resource.data.amount < 10000000
                               && request.resource.data.cur in ['JPY', 'TWD']
                               && request.resource.data.cat in ['餐飲', '交通', '滑雪', '購物', '門票', '其他']
                               && request.resource.data.item is string
                               && request.resource.data.item.size() <= 40
                               && request.resource.data.day is int
                               && request.resource.data.day >= 0
                               && request.resource.data.day <= 10
                               && request.resource.data.who in ['浣熊', '蕭', '君']
                               && request.resource.data.split is list
                               && request.resource.data.split.size() <= 3
                               && request.resource.data.ts is number
                               && (!('shares' in request.resource.data) || request.resource.data.shares is map);
       }
       // 三個人共用的結算匯率（記帳頁「自動帶入」或手動輸入後會存在這裡）
       match /trips/hokkaido-2026-bda97169cfdd/meta/rate {
         allow read: if true;
         allow create, update: if request.resource.data.keys().hasOnly(['rate','ts'])
                               && request.resource.data.rate is number
                               && request.resource.data.rate > 0
                               && request.resource.data.rate < 5
                               && request.resource.data.ts is number;
       }
     }
   }
   ```

7. 把改好的 `index.html` 重新上傳到 GitHub。打開網址進到「錢錢」頁，記帳區上方出現綠點「已連線・三人即時同步」就成功了。
   （Firebase 只在第一次進「錢錢」頁時才載入，只看行程不會下載。）

## 建議：限制 API key 只能從你的網站使用

1. 到 https://console.cloud.google.com ，選擇同一個專案，左側 **API 和服務 → 憑證**。
2. 點開名稱類似 `Browser key (auto created by Firebase)` 的 API 金鑰。
3. **應用程式限制**選「網站」，新增 `https://你的帳號.github.io/*`（本專案是 `https://chen0890210-dotcom.github.io/*`），儲存。
4. 設定後，從別的網域或本機直接開 `index.html` 會連不上 Firebase，記帳會改存手機（這是預期行為）。

## 最後結算怎麼做

每個人手機的匯率原本各自獨立，算出來的轉帳金額可能差幾塊。結算時：

1. 由**一個人**打開「錢錢」→「分帳結算」，在匯率欄輸入當天實際匯率，按 Enter 或點到別處就會儲存（畫面會顯示「已儲存並同步給三人」）。
2. 或按「**改用網路最新匯率**」，會用網路上今天的匯率取代欄位裡的數字（畫面會顯示「已改用網路最新匯率 …」）。
3. 匯率會存到 Firestore，三個人的手機都改用同一個匯率，註記顯示「三人共用」，轉帳金額也會一樣。
4. 注意：**先輸入數字、再按「改用網路最新匯率」，數字會被網路匯率蓋掉**。要用自己輸入的數字，輸入後不用再按任何按鈕。

## 注意

- 免費版 GitHub Pages 的 repository 必須是公開的，所以 `TRIP_ID` 看得到。知道 repository 的人理論上也能寫入這本帳，記帳內容請不要放敏感資料。
- `TRIP_ID`（`hokkaido-2026-bda97169cfdd`）是這本帳的「鑰匙」，規則只開放這一本帳，不要把它改掉。
- Firebase 的 `apiKey` 不是密碼，放在網頁裡是正常的；真正保護資料的是上面的規則，再加上上面的網域限制。
- 刪除目前不需要登入，建議出發前和回國後到 Firebase 主控台把 Firestore 資料匯出備份一次。
- 這個方式沒有登入機制：拿到網址的人都能記帳和刪帳，只把網址傳給三個人就好。
