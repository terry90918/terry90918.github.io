# 個人網站改版驗收

## 交付範圍

- Home → About／Story／Work／Writing → CV／Email。Story 初版為三段經歷紀錄，未冒充個人觀點長文。
- Work 依產品、平台、AI 分組；GJ、Nidin、JurisLM 三個正式案例，VClass 與 Channel-T 為簡短補充。
- Writing 保留年份／月份完整清單，標明翻譯與 AI 日報；AI 日報有獨立系列入口。
- 既有獨立 CV 保持 `https://terry90918.github.io/cv/`。
- 本次止於本地預覽與 Ready PR，不合併、不部署。

## 基準與保全

- 基準 main：`4a8a91f539f4f3a28dd21c5125a292cbde84ad32`。
- 70 篇公開文章（69 篇 AI 日報、1 篇 Andrew Ng 翻譯），前後 year／slug／publishedAt／URL 清單完全一致。
- `content/posts`、`public/audio`、`lib/posts`、`lib/rss.ts` 相對基準無差異。
- 只補單篇 canonical／社群 metadata；原標題、摘要、本文與詳情渲染保留。

## 文案依據與待補內容

文案採已核准規格及履歷母版中確認的公開事實。Nidin 為主實績，10 位直屬工程師已確認；平台規模與檢索召回率僅放案例詳情，並標明任職／樣本情境。未使用未確認的 5–30 人範圍、市佔率或 IoT 專長。

未新增生活、離職動機、內心轉折或原創人物長文；這些內容等 Terry 提供親身反思後再補。Pawlean 僅作結構觀察，不推論其收入／流量成功原因，不複製視覺。

完整設計規格、計畫與私人來源索引保留在本地；公開 PR 不包含私人文件或 Notion 來源網址。

## 驗收狀態

- 本地正式靜態預覽：http://127.0.0.1:43117/（僅本機）。
- `bun run build`：成功，85 個靜態輸出。
- 全專案 lint／typecheck：通過。
- 初版 Vitest：82/82；修正後保留原日期測試並新增3項，完整85/85（9c609f0提交hook）。OpenSpec：8/8。
- 初版正式匯出 frontend Playwright：29/29，45.6秒；後續穩定錨點／日期修正後最終30/30，46.2秒，`--retries=0`。
- 已驗證 320／375／1046 px、light／dark、鍵盤焦點、Story／既有文章錨點、原文摘要與 RSS。
- 70 個舊文 HTML、h1、原 canonical 逐一查核通過；未知路由 404。
- GitHub 現有公開 `/about` 讀取為 200，這次沒有修改主機設定。

預覽 adapter 曾誤讀 RSC 目錄，後來亦觀察到連線佇列造成 JS connection reset；兩者均限本機工具。修正 adapter 並將佇列由 5 增為 128 後，正式驗收 29/29 通過。未用 SPA fallback。

## 執行決定

以下列出相對計畫的全部實際調整（依發生顺序，後續決定可明確取代先前選擇）。

- Native worktree tool is unavailable for this delegated execution context (returned Managed worktrees require a local, SSH, or WSL task); use an isolated task-owned bare repository plus linked git worktree — source checkout untouched — cost if wrong: host artifact management will not list this worktree; paths are recorded here.
- latest GitHub main now has 70 published articles (69 AI daily + 1 translation), rather than the spec's earlier 69 — protect all 70 — cost if wrong: route audit catches missing/new articles.
- full spec/plan and private Notion source links remain local rather than added to the public website PR; use their absolute paths in review — preserves content privacy — cost if wrong: remote reviewers use the public PR summary instead of full private source inventory.
- add getPostHref(Post year/slug) to share the existing route contract across new lists — avoids current-year fallback drift — cost if wrong: original-year URL test and route manifest catch it.
- keep registry prose untested at unit level; test authored-type/draft/date aggregation and consumer navigation instead — prose is not code behavior — cost if wrong: factual copy must be checked in review.
- introduce shared WritingPostCard/SiteContact/pageMetadata when their first consumers are built — avoids duplicated rendering and metadata before Task 3 — cost if wrong: shared output is covered by browser assertions and Task 3 metadata checks.
- preserve baseline CHANGELOG formatting after the repository's full pre-commit formatter touches it — no unrelated content change — cost if wrong: no changelog update for this unshipped feature, PR explains delivery.
- record the just-completed 22/22 browser run rather than repeat it solely through task-done after a whitespace-only hook/commit — developer rule avoids redundant tests — cost if wrong: final production-export suite verifies current final head again.
- audit found existing article metadata had only title/description; add canonical and social fields at the original year/slug, retaining the original title/description and article renderer — prevents inheriting a homepage social URL — cost if wrong: article HTML metadata assertion and unchanged-body audit catch it.
- Next renders root canonical without a trailing slash; accept the observed equivalent homepage URL, while retaining exact year/slug checks for articles — no route change — cost if wrong: non-root canonical tests remain exact.
- freshly passed full pre-commit lint/typecheck/unit suite on the same source satisfies these verification commands; run production build/export and browser tests next without a redundant ritual replay — cost if wrong: production browser and final head lint detect remaining differences.
- Next 16 export includes RSC directories alongside route .html files; the preview adapter's exists() check served directory listings instead of pages. Prefer a corresponding actual .html when the requested path is not a regular file, including RSC-only directories — no SPA fallback or product route changes — cost if wrong: production page and unknown-route tests verify behavior.
- static-preview console showed a required JS chunk failing with ERR_CONNECTION_RESET; Python's listen queue was 5. Raising only the temporary server queue to 128 made the same diagnostic load expose the theme button; product code unchanged — cost if wrong: fresh complete production E2E still must pass.
- PR #77 automatically started a Codex review on 6b79af1. Count that single independent remote review as the Native final whole-branch Codex review and do not dispatch a duplicate reviewer — JT Harness explicitly counts automatic reviews — cost if wrong: remote review lacks local private source inventory, so factual provenance remains the approved spec plus local source audit.
- follow-up settled-scroll audit disproved the earlier anchor GREEN (stable heading y≈80 < header bottom113). Replace the transient poll with font-ready + 15 stable animation frames and assert after settling; raise the shared prose h2/h3 margin to14rem, matching Story margin — cost if wrong: desktop/mobile direct-hash and list-to-article-to-heading browser tests fail.
- accept CodeRabbit minor date-locale finding; add optional locale to existing formatter with unchanged en-US default and Asia/Taipei zone, use zh-TW only on new writing cards — cost if wrong: legacy English/Taiwan-boundary unit tests and public-card browser check fail.
- main advanced via another CI-only PR #76; original70 articles/product tree unchanged. Retain isolated feature history and do not take over its workflow or merge/deploy authorization — cost if wrong: PR base comparison/mergeability and final GitHub checks must expose integration issues.
- rebuilding out/ replaced the temporary server's cwd; Python raised FileNotFoundError before serving any request. Pass the explicit out directory to SimpleHTTPRequestHandler instead of chdir, restart only own server — product unchanged — cost if wrong: final complete static browser run must fail rather than accepted.
- an additional automatic Copilot review flagged loss of inherited twitter.creator on both pageMetadata and existing article metadata. Real HTML tests reproduced absence (2 RED); restore the existing public handle in both page-level objects, leaving titles/body/date untouched — cost if wrong: metadata checks across9 newpages+originalarticle fail. No review was requested or retriggered by this task.
- semantic audit found three archived OpenSpec files still required the old English H1, older recent-list presentation and mandatory About chart. Synchronize only these existing specs to approved JUR-508 v2; do not create unrelated requirements or count format validation as semantic alignment — cost if wrong: Linear/v2-to-diff table exposes an unauthorized change. Product tree and already-green30 tests remain unchanged.
- latest main d7e4e3f (another CI-only #78 after#76) switched validation to Woodpecker; feature head lacked its pipeline and had no current validation status. Supersede the earlier retain-without-sync decision: locally integrate already-merged main CI into the isolated feature, preserve upstream files unchanged and no product diff, then push only feature to obtain current PR validation — cost if wrong: provider readback/current-head checks expose failure. No GitHub PR was merged by this task, and no deployment was dispatched.

## 程式審查

- Ready PR：https://github.com/terry90918/terry90918.github.io/pull/77。
- 審查 head：`6b79af185b262834f1271943a5b97a1bb6428565`。
- [Codex review](https://github.com/terry90918/terry90918.github.io/pull/77#issuecomment-6011637850) 初次自動執行，Completed（07:38:32 UTC）且 bot 對 PR 👍；初次無行內問題。後續自動報告於07:55:10 UTC針對9c609f0提出開發草稿可見性P2，最終討論核對時補處理。沒有手動要求第二次review。
- CodeRabbit 自動審查依 repository 設定跳過（不計為通過），手動請求一次完整 review 已完成：1 minor（[Writing 日期語系](https://github.com/terry90918/terry90918.github.io/pull/77#discussion_r4192767002)）。採納後只驗證修正，不要求第二次 review。
- 預览在本機保留；11 張 desktop／mobile 與各頁截圖留在本地，未上傳私人來源素材。

## Linear → diff → 驗收 → 開發規範對照

本表對照最新讀回的 [JUR-508](https://linear.app/jurislm/issue/JUR-508)（updatedAt 2026-10-06 06:56:29 UTC）與已批准 v2 書面規格／四步計畫。使用者後續要求逐項稽核，未擴大合併／部署授權。JUR-508 的 69 篇加「後續新增文章」在執行基準實際為 70 篇。

| 規格／驗收                                           | 實際 diff                                                                | 證據與判定                                                                                                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 人物入口→三段經歷→少量近況→作品／聯絡                | Home、EXPERIENCE_NOTES、getRecentUpdates                                 | DOM順序／三真實連結／日報最多一則；分類10單元測試。符合                                                                                              |
| About／Story／Work／Writing 分工，GJ／Nidin／JurisLM | 新Story、Work及三案例；About改為本人與站內入口                           | 三案例200、未知案例404，公開聯絡連結；未重建完整職涯。符合                                                                                           |
| 文章URL／正文／RSS保全                               | 只改索引與單篇額外metadata；沒有Markdown、audio、parser、RSS builder變更 | 70項manifest完全一致，70 HTML/h1/canonical讀回；RSS驗收。符合                                                                                        |
| 獨立CV保留                                           | 共用CV_URL、Header／Footer／SiteContact                                  | 原 https://terry90918.github.io/cv/ href比對。符合                                                                                                   |
| AI日報系列、翻譯／原創區分                           | classifyPost、WritingPostCard、/posts/ai-daily                           | 69日報原URL、Andrew Ng翻譯署名、未知slug不推定原創，無假原創精選。符合                                                                               |
| 只用真實資料，首頁不堆成果                           | content.ts；指標只出現在Work詳情                                         | 已批准v2素材池→文案逐项本地mapping；10直屬、20次樣本召回情境；未用未確認團隊規模／市佔／生活心境。符合                                               |
| 中文介面／SEO                                        | zh-TW layout、各頁metadata、sitemap；卡片可選zh-TW日期                   | 正式HTML metadata／sitemap驗收；日期需採納CodeRabbit minor並在變更後驗證。見下方修正                                                                 |
| 桌面／手機／鍵盤／深色／錨點                         | wrapping header、focus、scroll-margin；穩定捲動測試                      | 原29/29中的錨點檢查不足，穩定量測重現遮擋，最小CSS修正後重新驗收；不把舊GREEN當作完成                                                                |
| 隔離worktree，不碰Entire服務                         | task-owned bare+linked worktree；127.0.0.1:43117                         | 原checkout乾淨；獨立無頭瀏覽器，沒有使用3000/3001或使用者Chrome。符合                                                                                |
| Superpowers設計／計畫先行                            | 本地完整v2 spec+plan；四task ledger                                      | 已批准書面設計及Native四步計畫；設計文件保留階段性描述，後續實作批准及本次結果由Linear／驗收文件記錄。原始私人文件未上傳公開PR                       |
| Superpowers TDD／驗證                                | 行為測試先RED，再實作；修正亦先重現                                      | Task1 8 RED→10 GREEN；Task2首頁RED→22 GREEN；Task3索引等5 RED+canonical RED→正式29 GREEN；錨點2 RED，日期2 RED→3 GREEN；最終current-head結果列下方   |
| JT Linear先讀後改、開始／完成紀錄                    | JUR-508於產品編輯前建立In Progress並有開始紀錄                           | 最後完成留言附PR／review／測試／不部署狀態；不新增逐步Linear留言                                                                                     |
| JT 一次Codex＋一次CodeRabbit                         | PR自動Codex；CodeRabbit明確skip後一次manual                              | Codex初次Completed且bot 👍；後到自動報告的草稿P2另經RED/GREEN修正；CodeRabbit完整報告1 minor。Skip本身不計為pass，沒有第二次全量或incremental review |
| Ready PR，不合併／部署                               | #77標籤feat、Ready、attached                                             | 本任務未執行任何PR merge或deploy；保留預覽／工作樹。符合                                                                                             |

### 明列證據限制

- 原始Notion母版和完整私人來源索引僅在本地／已交付Library，公開審查者沒有完整私人文件；完整事實mapping交使用者／parent稽核，公開PR只放已批准事實。
- 70篇已發布原文均沒有h3標題。本次真實長文重現使用h2；最小CSS同時覆蓋h2/h3，未為測試公開任何草稿或假文章。
- 本機預覽驗收不代表GitHub Pages已發布本次改版；發布明確不在本次授權範圍。

## 額外唯讀稽核：#76

使用者另外要求核對 #76，本任務沒有接管或修改該PR。

- [#76](https://github.com/terry90918/terry90918.github.io/pull/76) 只變更 `.github/workflows/deploy-pages.yml`（20 additions／3 deletions），分支 `ci/ai-publishing-preflight`。
- 可見作者與合併帳號均為 `terry90918`；合併時間07:39:57 UTC、merge `08cb0b9639e6d5f17ff9130cedc6d46a0e1a6b47`。GitHub帳號紀錄不能判定實際是本人或哪個代理。本任務沒有執行該合併；其授權依據在已讀PR記錄中未出現，不能猜測。
- [Pages自動部署](https://github.com/terry90918/terry90918.github.io/actions/runs/37431083997) 為push觸發且success；actor／triggering_actor均為terry90918。只讀查核，未回滾。
- CodeRabbit PR審查明確rate-limited；已讀PR body／comments／reviews沒有CLI fallback的證據，不能認定合規或把限流當pass。本次未重跑該PR任何review來追補。
- 首次核對main只有#76的CI變更，之後d7e4e3f再加入其他任務已合併#78的Woodpecker驗收設定。兩者均沒有新增文章／產品程式。最終在隔離feature工作樹同步這些既有上游CI檔案，PR diff不修改該workflow／pipeline，保全範圍仍是70文章。本次不在其他PR稽核缺口上補規格、合併或部署。

## 後續修正

- 穩定捲動後真實重現h2被113px導覽列遮擋（桌面80.203125px、320手機79.859375px）。將既有h2/h3共用scroll-margin由5rem改14rem；測試等待字體ready及15個穩定animation frames後斷言，不再在動畫途中poll一次即過關。涵蓋直接hash與Writing索引→文章→標題連結。
- Writing卡片改用zh-TW日期；formatPublishedDate新增可選locale，預設en-US與Asia/Taipei時區不變，舊文詳情呼叫不變。保留原date-format回歸測試，加中文／時區邊界驗收；publishedAt完全不變。

最終修正後建置成功；正式靜態預覽30/30零重試通過。完整lint／typecheck／unit／OpenSpec依原repo pre-commit hook驗證；任何hook失敗會阻止提交。未要求第二次Codex或CodeRabbit審查。

- 額外自動Copilot審查兩則意見是同一項twitter.creator回歸。實際HTML兩測試先RED（欄位缺失），在兩個頁級twitter物件補回既有公開@zxtw17985321；標題／摘要／本文不變。依同一修正與驗證流程處理，不觸發新review。

9c609f0 的 [GitHub PR build](https://github.com/terry90918/terry90918.github.io/actions/runs/37432401948) 已success；是pull_request驗收，沒有執行Pages deploy。Twitter修正後正式匯出再次完整30/30（1.1分鐘，零重試）；最終head仍需讀回其PR檢查。

### 舊OpenSpec與最新批准規格的差異處理

語意稽核發現homepage-visual-rhythm、about-editorial-profile、site-identity三份舊文件仍要求舊英文H1、舊近況樣式和必備GitHub活動圖。只同步這三份既有規格至JUR-508已批准v2，保留版面／身分／社群／互動合約；沒有新增無關規格或產品功能。OpenSpec8/8僅是格式驗證，語意合規另以本文件逐項對照及行為測試證明。此次文件同步後產品程式未變，沿用已完成的最新30/30正式匯出證據。

### 最終CI基準同步

最新main `d7e4e3febc1d529fe97adb23349b48c2977e7a44` 已切換Woodpecker驗收，原feature head沒有該pipeline、只見CodeRabbit skipped。本任務在自己的feature分支合入已合併main的兩份CI設定，不修改設定内容；只推送feature，讓現行PR驗收發生。這是同步上游Git歷史，不是GitHub PR合併，沒有推送main或發動部署。產品／文章／資源／測試樹與已驗證c1935a2完全一致；最後provider結果記於PR與完成留言，不把未出現或skipped狀態當pass。

### 後到Codex意見：開發草稿索引

最終討論串核對發現07:55:10 UTC的自動Codex報告（review5425402489、head9c609f0）有一項P2：新Writing索引的無條件published篩選破壞開發草稿入口。既有markdown-loader規格明確要求development可讀草稿、production排除。先以實際頁面server rendering重現草稿URL缺失（1 RED／production相容性1 pass），再只在development允許loader返回的草稿，卡片明列草稿、計數分開；正式索引仍published。沒有改loader／文章／RSS。新增Vitest的既有@alias解析以直接測試頁面，而非只測複製的篩選函式。修正後2/2，完整驗證與最後head結果記於PR及完成證據。此自動報告不是本任務要求的第二次完整審查，不再觸發新的review。
