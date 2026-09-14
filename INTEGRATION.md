# simples.com.tw 整體改版整合計畫

這份文件說明如何把這個賽博朋克版首頁接進 simples.com.tw 現有的 WordPress 站，以及整站其他頁面要怎麼跟上同一套視覺語言。

## 現況盤點（2026-09）

- **平台**：WordPress + 子主題 `simples-child`（v1.6.1），Yoast SEO、Contact Form 7（Material Design 外掛）、GTM、Meta Pixel。
- **既有樣式**：黑字白底極簡，Hanken Grotesk + Noto Sans TC + JetBrains Mono，表單主色珊瑚橘 `#E5745C`。
- **頁面**：首頁（`/home-2/`）、服務（`/services/` 及五個子頁）、案例（`/work/`）、素材引擎（`/engine/`）、洞察（`/insights/`，目前 0 篇）、我們怎麼想（`/philosophy/`）、聯絡（`/contact/`）。
- **既有 JS 模組**：`simples-face / field / motion / stage / ui`，已經有自己的動態層。

## 新首頁與舊站的對應

| 新首頁章節 | 內容來源 | 連到的舊站頁面 |
|---|---|---|
| Hero | 首頁 tagline、公司一句話介紹、台北座標與時間 | — |
| 01 我們怎麼想 | `/philosophy/`：Simples 字義、三個理念、六條原則、成立年份、市場與產業 | `/services/`（CTA） |
| 02 案例 | `/work/`：四個公開案例與成果數字 | `/work/` |
| 03 服務 | `/services/`：五個服務、適合誰、你會得到、三種合作方式 | 五個服務子頁 |
| 04 AI 素材引擎 | `/engine/`：5 × 3 矩陣、CPA/ROAS 數字、五個方案、六步流程 | `/contact/` |
| 05 聯絡 | `/contact/`：30 分鐘對話、三步驟 | `/contact/` |
| 頁尾 | 公司名稱、地址、Email、營業時間、統編 | 全站 |

## 部署方式（建議照順序評估）

### 方案 A：靜態首頁 + WordPress 子頁（最快，建議先上）

1. 把 `index.html` 與 `secret-pathways-assets/` 放進子主題，例如 `wp-content/themes/simples-child/hq/`。
2. 在子主題新增頁面模板 `template-hq.php`，內容只做一件事：`readfile` 這個 `index.html`（或直接 `include`），並把資源路徑改成 `get_stylesheet_directory_uri() . '/hq/…'`。
3. 新增一個頁面套用這個模板，設定為靜態首頁；舊的 `/home-2/` 保留當備援。
4. 在模板的 `<head>` 內保留 Yoast 輸出的 `<title>`、meta、schema（`wp_head()`），GTM 與 Pixel 也一併帶進來；把 `index.html` 內的 `<title>`/description 拿掉，交給 Yoast 管理。
5. 導覽列與頁尾的連結已經指向舊站各頁的絕對網址，不需要改。

### 方案 B：拆成主題元件（第二階段）

把 CSS 抽成 `assets/css/hq.css`，JS 抽成 `assets/js/hq-scene.js`，章節內容改由 ACF 或區塊管理，讓行銷同事能自己改數字、案例與價格，不用動程式碼。3D 場景本身不受影響，因為它只讀 `[data-cam]`、`[data-fg]`、`[data-view]` 這些屬性。

## 內頁怎麼跟上

不必每一頁都放 3D，內頁維持輕量，但共用同一套設計語言就會有整體感：

- **色彩 token**：`--ink #05040E`、`--bone #E6EFFF`、`--neon #22E6FF`、`--coral #E5745C`。把子主題現有的黑白配色改成深色底，珊瑚橘保留給 CTA 與強調數字，青色只用在互動狀態（hover、進度、線條）。
- **字型**：已經在用 Noto Sans TC + JetBrains Mono，只需要把英文字標換成 Orbitron（僅限 logo、章節編號、大數字），內文英文維持 Hanken Grotesk。
- **元件**：首頁裡的 `.crow`（案例列）、`.les`（服務圖版）、`.tiers`（方案）、`.proc`（流程）、`.steps`（步驟）都是純 CSS，可直接搬到內頁重用。
- **裝飾層**：掃描線 `#scan` 與雜訊 `#grain` 是兩個固定定位的 div，加進內頁就有同樣的質感，成本接近零。
- **頁首**：內頁沿用首頁的導覽列（深色、青色底線標示目前頁面），捲動時模糊背景。
- **服務子頁**：頁首可放一張 `?shot=3` 視角的靜態截圖當 hero 圖，維持沉浸感但不跑 WebGL。
- **案例頁**：每個案例用「一開始卡在哪 / 我們做了什麼 / 為什麼有效」三段，加一組珊瑚色大數字，跟首頁的案例列一致。
- **聯絡頁**：CF7 表單改深色版，欄位標籤用 JetBrains Mono，送出按鈕用首頁的 `.cta` 樣式。

## 效能與相容性

- 首頁 3D 在手機會自動降畫質（`q=low`），並依幀率動態調整解析度；不支援 WebGL 時會退成靜態頁，內容完整可讀。
- Google Fonts 改由子主題本機託管會更穩（Noto Sans TC 走 unicode-range 子集約 4 MB，實際只會下載用到的片段）。
- 建議在 WordPress 端加上 `<link rel="preload">` 給 `three.min.js`，並用 Cache-Control 長快取靜態資源。
- 減少動態偏好（`prefers-reduced-motion`）已處理：所有入場動畫、跑馬燈、掃光都會關閉。

## SEO / GEO 注意事項

- 所有文字都在 DOM 裡（不是畫在 canvas 上），Google 與 AI 搜尋都讀得到；標題用真正的 `h1/h2`。
- 保留 Yoast 的 Organization schema；可以再加 `Service` 與 `Offer`（五個方案的價格）結構化資料。
- `/insights/` 目前沒有文章，首頁刻意沒有放洞察區塊；有文章後可在案例之後加一列「最新一篇」。

## 建議的下一步

1. 先以方案 A 上線新首頁，觀察 GA 的停留時間與聯絡頁轉換。
2. 用同一套 token 與元件改內頁（服務 → 案例 → 素材引擎 → 聯絡）。
3. 內容數字（客戶營業額、案例成果、方案價格）集中到一處管理，首頁與內頁共用。
4. 之後若要做更多頁面的 3D 場景，可以複用同一座高塔的不同鏡頭（`CAM` 陣列加一個航點即可）。
