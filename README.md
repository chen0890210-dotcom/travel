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
         allow create, update: if request.resource.data.amount is number
                               && request.resource.data.amount > 0
                               && request.resource.data.amount < 10000000
                               && request.resource.data.cur in ['JPY', 'TWD'];
       }
     }
   }
   ```

7. 把改好的 `index.html` 重新上傳到 GitHub。打開網址，記帳區上方出現綠點「已連線」就成功了。

## 注意

- 免費版 GitHub Pages 的 repository 必須是公開的，所以 `TRIP_ID` 看得到。知道 repository 的人理論上也能寫入這本帳，記帳內容請不要放敏感資料。
- `TRIP_ID`（`hokkaido-2026-bda97169cfdd`）是這本帳的「鑰匙」，規則只開放這一本帳，不要把它改掉。
- Firebase 的 `apiKey` 不是密碼，放在網頁裡是正常的；真正保護資料的是上面的規則。
- 這個方式沒有登入機制：拿到網址的人都能記帳和刪帳，只把網址傳給三個人就好。
