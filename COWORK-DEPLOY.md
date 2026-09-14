# 給 Cowork 的部署 Prompt

把下面整段貼給 Cowork。它會先跟你確認登入與檔案存取方式，再照步驟把新首頁、素材引擎頁與英文版接進 simples.com.tw 的 WordPress。

---

你是我的網站部署助理。請把 GitHub 專案 `virus11456/kage` 裡做好的新版首頁、AI 素材引擎頁與英文版，接進我公司的 WordPress 站 https://simples.com.tw/ 。整個過程請照下面的順序做，每完成一個階段就回報一次，遇到任何不確定的事先停下來問我，不要自己猜。

## 0. 開始前先跟我確認這些，拿到答案再動手

1. WordPress 後台網址與帳號（我會另外給密碼，不要把密碼寫進任何檔案或回報裡）。
2. 檔案存取方式：SFTP / FTP、主機商的檔案管理員（cPanel、Plesk、Hostinger hPanel 之類），或是後台裝「WP File Manager」外掛。至少要能上傳資料夾到 `wp-content/themes/simples-child/`，並新增、編輯這個子主題的 PHP 檔。
3. 有沒有測試站（staging）？有的話先在測試站做完整套，我看過再搬到正式站。沒有的話就在正式站做，但新頁面一律先用「私人」狀態預覽，確認沒問題才切換首頁。
4. 要用哪個分支：GitHub 的 `claude/sweet-noether-hnyur1`（PR #1）。如果我已經把 PR 合併，就改用 `main`。

## 1. 取得檔案

- 下載分支 ZIP：`https://github.com/virus11456/kage/archive/refs/heads/claude/sweet-noether-hnyur1.zip`（合併後改成 `.../heads/main.zip`），或用 git clone。
- 先在本機讀 `INTEGRATION.md`，這份文件說明整個整合計畫，這次要做的是裡面的「方案 A：靜態首頁 + WordPress 子頁」。
- 要上傳的東西只有這四項：`index.html`、`engine.html`、`en/`（裡面有 `index.html`、`engine.html`）、`secret-pathways-assets/`（約 3.6 MB，內含 `three.min.js`、`inner.css`、`fonts.css`、`i18n.js`、`cases/`、`foreground/png/`）。其他檔案（README、build-en.mjs、PROMPT.md 等）不用上傳。
- `en/` 底下的檔案是自動產生的，不要手改。

## 2. 先備份，再盤點現況

1. 用主機商工具或 UpdraftPlus 做一次完整備份（資料庫 + `wp-content`），把備份檔名回報給我。
2. 記下現在「設定 → 閱讀」的首頁設定（目前應該是靜態頁 `/home-2/`），以及 `/engine/` 這一頁的頁面 ID 與內容（舊的素材引擎頁有價格，新版首頁與新的 engine 頁刻意不放價格）。
3. 看一下子主題 `simples-child` 的 `functions.php` 與 `header.php`：GTM 與 Meta Pixel 是外掛輸出，還是寫死在 `header.php`？這決定第 4 步要不要把追蹤碼複製進模板。
4. 看一下有沒有快取或最佳化外掛（WP Rocket、LiteSpeed Cache、Autoptimize、WP Super Cache、Perfmatters 等），以及有沒有多語外掛（WPML、Polylang）。有的話回報給我，後面要排除新頁面。
5. 確認 `/en/` 這個網址目前是否已存在。如果已經被多語外掛使用，先停下來問我。

## 3. 上傳靜態檔

把第 1 步的四項放到子主題底下，結構要長這樣：

```
wp-content/themes/simples-child/hq/
├── index.html
├── engine.html
├── en/
│   ├── index.html
│   └── engine.html
└── secret-pathways-assets/
    ├── three.min.js
    ├── inner.css
    ├── fonts.css
    ├── i18n.js
    ├── cases/
    └── foreground/png/
```

上傳後用瀏覽器直接開 `https://simples.com.tw/wp-content/themes/simples-child/hq/secret-pathways-assets/three.min.js`，確認能拿到檔案（HTTP 200），再開一張 `.../cases/japan-fuji-pagoda.webp` 確認 webp 有正常的 `image/webp` 標頭。

## 4. 新增頁面模板 `template-hq.php`

在子主題根目錄新增 `template-hq.php`，內容如下（照抄，不要改路徑邏輯）。它的工作是：讀對應的靜態 HTML，把資源路徑改成絕對網址、把頁面之間的連結改成 WordPress 網址、拿掉檔案自己的 title / description / og / canonical（交給 Yoast），然後注入 `wp_head()` 與 `wp_footer()`，讓 Yoast、GTM、Pixel 照常輸出。

```php
<?php
/**
 * Template Name: Simples HQ（靜態 HTML 頁）
 * Template Post Type: page
 */
$hq_dir = get_stylesheet_directory() . '/hq/';
$hq_uri = get_stylesheet_directory_uri() . '/hq/';

/* 頁面（依網址路徑）→ 靜態檔，以及該檔內部連結要換成的 WordPress 網址 */
$map = [
  'front'     => ['file' => 'index.html',     'links' => ['en/index.html' => '/en/',        'engine.html' => '/engine/']],
  'hq'        => ['file' => 'index.html',     'links' => ['en/index.html' => '/en/',        'engine.html' => '/engine/']],
  'engine'    => ['file' => 'engine.html',    'links' => ['en/engine.html' => '/en/engine/', 'engine.html' => '/engine/',    'index.html' => '/']],
  'en'        => ['file' => 'en/index.html',  'links' => ['../index.html'  => '/',          'engine.html' => '/en/engine/', 'index.html' => '/en/']],
  'en/engine' => ['file' => 'en/engine.html', 'links' => ['../engine.html' => '/engine/',   'engine.html' => '/en/engine/', 'index.html' => '/en/']],
];
$key = is_front_page() ? 'front' : trim(get_page_uri(), '/');
if (!isset($map[$key]) || !is_readable($hq_dir . $map[$key]['file'])) {
  status_header(404); get_template_part(404); exit;
}
$page = $map[$key];
$html = file_get_contents($hq_dir . $page['file']);

/* 1. 資源改成絕對網址（英文頁用的是 ../secret-pathways-assets/） */
$html = preg_replace('~(\.\./)?secret-pathways-assets/~', $hq_uri . 'secret-pathways-assets/', $html);

/* 2. 頁面之間的連結 */
foreach ($page['links'] as $from => $to) {
  $html = str_replace('href="' . $from . '"', 'href="' . esc_url($to) . '"', $html);
}
$html = str_replace(
  ['https://simples.com.tw/en/engine.html', 'https://simples.com.tw/engine.html'],
  ['https://simples.com.tw/en/engine/',     'https://simples.com.tw/engine/'],
  $html
);

/* 3. title / description / og:* / canonical 交給 Yoast；hreflang 保留 */
$html = preg_replace('~^[ \t]*<(title>.*?</title|meta name="description"[^>]*|meta property="og:[^>]*|link rel="canonical"[^>]*)>[ \t]*\R~m', '', $html);

/* 4. 注入 WordPress 的 head / footer */
ob_start(); wp_head();   $head = ob_get_clean();
ob_start(); wp_footer(); $foot = ob_get_clean();
$html = str_replace('</head>', $head . "\n</head>", $html);
$html = str_replace('</body>', $foot . "\n</body>", $html);

header('Content-Type: text/html; charset=utf-8');
echo $html;
```

接著在子主題的 `functions.php` 最後面加上這段：套用這個模板的頁面不載入主題與區塊編輯器的樣式和腳本（否則會跟頁面自己的 CSS 打架），也不顯示管理列（管理列會把固定定位的畫面往下推 32px）。

```php
/* Simples HQ 靜態頁：拿掉主題、區塊、CF7 的樣式與腳本，只留 SEO 與追蹤碼 */
add_action('wp_enqueue_scripts', function () {
  if (!is_page_template('template-hq.php')) return;
  global $wp_styles, $wp_scripts;
  $theme_uris = array_filter([get_template_directory_uri(), get_stylesheet_directory_uri()]);
  foreach (['style' => $wp_styles, 'script' => $wp_scripts] as $kind => $deps) {
    foreach ((array) $deps->queue as $h) {
      $src = isset($deps->registered[$h]) ? (string) $deps->registered[$h]->src : '';
      $from_theme = false;
      foreach ($theme_uris as $u) if ($src && strpos($src, $u) === 0) $from_theme = true;
      if ($from_theme || preg_match('~^(simples|wp-block-library|classic-theme-styles|global-styles|contact-form-7|mdlwp|wp-embed)~', $h)) {
        $kind === 'style' ? wp_dequeue_style($h) : wp_dequeue_script($h);
      }
    }
  }
}, 999);
add_filter('show_admin_bar', function ($show) {
  return is_page_template('template-hq.php') ? false : $show;
});
```

如果第 2 步發現 GTM 或 Pixel 是寫死在 `header.php` 而不是走 `wp_head()`，就把那兩段追蹤碼原封不動複製到 `template-hq.php` 的「注入」那一步，放在 `$head` 前面。

## 5. 建頁面（先私人，不要直接公開）

在後台「頁面 → 新增」建四個頁面，內容留空，右側「頁面屬性 → 範本」都選「Simples HQ（靜態 HTML 頁）」，狀態先設為「私人」：

| 頁面標題 | 網址代稱（slug） | 上層頁面 | 對應檔案 |
|---|---|---|---|
| 首頁 HQ | `hq` | 無 | `index.html`（切成首頁後由 `front` 接手） |
| AI 素材引擎 | 用現有的 `/engine/` 那一頁，把範本改成 Simples HQ | 無 | `engine.html` |
| English | `en` | 無 | `en/index.html` |
| AI Creative Engine | `engine` | English（網址會變成 `/en/engine/`） | `en/engine.html` |

- `/engine/` 那一頁：不要刪舊內容，只改範本；舊內容留在編輯器裡當備份，前台不會顯示。如果你覺得直接改風險高，先建一個 `engine-new` 頁測試，確認後再改。
- 每一頁的 Yoast 欄位請填：
  - 首頁：SEO 標題 `簡單行銷 Simples｜讓每個好點子都可以落地`，描述 `簡單行銷 Simples：用 AI 與系統思維做行銷的顧問公司。不賣曝光，不談流量，把「為什麼客戶會買」變成可以被理解、被複製、被放大的系統。台北、東京、胡志明。`
  - `/engine/`：SEO 標題 `AI 素材引擎｜簡單行銷 Simples`，描述 `簡單行銷的 AI 素材生產線：品牌規範先行，多切角 × 多版本，全通路格式一次到位，48 小時上線，成效回流。`
  - `/en/`：SEO 標題 `Simples | Every good idea deserves to land`，描述 `Simples is a Taipei marketing consultancy that works with AI and systems thinking. Strategy, search, media, reputation, AI deployment — turning "why customers buy" into a system that can be understood, repeated and scaled.`
  - `/en/engine/`：SEO 標題 `AI Creative Engine | Simples`，描述 `Simples' AI creative production line: brand system first, angles × versions, every format at once, live in 48 hours, results fed back.`
  - 社群分享圖：把專案裡的 `assets/simples-preview.webp` 轉成 1200×630 的 JPG 上傳到媒體庫，四頁都設成 Facebook / X 分享圖。

## 6. 排除快取與最佳化

第 2 步找到的每一個快取、最佳化外掛，都要把這四個網址排除「JS 合併／延遲／最小化」與「圖片 lazy-load」：`/`、`/engine/`、`/en/`、`/en/engine/`。首頁的 3D 場景是一段很大的內嵌 JavaScript，被延遲或改寫就會壞掉。頁面快取（HTML cache）可以保留。做完清一次全站快取。

## 7. 預覽驗收（切換首頁之前）

用管理員帳號登入後開這四個私人頁面，桌機與手機各看一次，逐項回報：

1. 首頁 3D 場景有畫面（看台、高樓、台北 101、圓山飯店、門架、月亮），捲動時鏡頭會動，四個章節與頁尾都到得了；瀏覽器主控台沒有紅字錯誤，網路面板沒有 404。
2. 案例區四張照片都有出現（霓虹街、泳池、診間、富士山），服務區、聯絡區 CTA 的連結都指到舊站正確頁面（`/services/…`、`/work/`、`/contact/`）。
3. 導覽列右上角「中 / EN」：首頁 ↔ `/en/`、`/engine/` ↔ `/en/engine/` 互相切得過去；素材引擎的連結指到 `/engine/`（英文頁指到 `/en/engine/`）。
4. 檢視原始碼：只有一組 `<title>` 與 `meta description`（Yoast 的），沒有兩組；`hreflang` 三條都在；GTM 與 Pixel 的程式碼在；沒有載入主題的 `style.css` 或 `simples-*.js`。
5. 加上 `?nogl=1` 開首頁，確認沒有 WebGL 時會退成靜態頁、文字都讀得到；`?shot=3` 會直接跳到服務章節。
6. 手機版：漢堡選單開得了、四張案例卡等大、沒有橫向捲動。
7. 用 Chrome 的 Lighthouse 跑一次手機版，把效能 / SEO 分數截圖給我。

任何一項不對，先修好再往下走；修不好就把截圖與主控台訊息貼給我。

## 8. 切換上線

我回覆「可以上線」之後才做這一步：

1. 四個頁面改成「公開」。
2. 「設定 → 閱讀」的靜態首頁改選「首頁 HQ」；舊的 `/home-2/` 保留不刪。
3. 再清一次快取，用無痕視窗開 `https://simples.com.tw/`、`/engine/`、`/en/`、`/en/engine/` 各確認一次。
4. Google Search Console：確認 Yoast 的 sitemap 已含這四頁，對四個網址各按一次「要求建立索引」。
5. 回報：上線時間、四個網址、備份檔名、Lighthouse 分數、還有你認為需要我後續處理的事。

## 9. 之後更新的流程（寫進回報裡讓我記得）

改文案時，我會在 GitHub 改中文 HTML 與字典後重新產生 `en/`，你只要把新的 `index.html`、`engine.html`、`en/`、`secret-pathways-assets/` 重新上傳覆蓋到 `hq/`，再清快取即可，不用動 WordPress 頁面與模板。新增頁面時，在 `template-hq.php` 的 `$map` 多加一行，並在後台新增一個同 slug、套同一個範本的頁面。

## 絕對不要做的事

- 不要碰 `wp-content/themes/simples-child/` 以外的主題檔案，不要改父主題。
- 不要刪 `/home-2/`、舊的 `/engine/` 內容、任何舊頁面或媒體。
- 不要更新 WordPress 核心、主題或外掛版本；不要新裝這次沒提到的外掛（除了我同意的 WP File Manager 或 UpdraftPlus）。
- 不要把任何密碼、API 金鑰寫進檔案、截圖或回報。
