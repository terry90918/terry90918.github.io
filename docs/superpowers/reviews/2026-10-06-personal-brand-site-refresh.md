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
- Vitest：82/82；OpenSpec：8/8。
- 正式靜態匯出上的 frontend Playwright：29/29，45.6 秒，無重試失敗。
- 已驗證 320／375／1046 px、light／dark、鍵盤焦點、Story／既有文章錨點、原文摘要與 RSS。
- 70 個舊文 HTML、h1、原 canonical 逐一查核通過；未知路由 404。
- GitHub 現有公開 `/about` 讀取為 200，這次沒有修改主機設定。

預覽 adapter 曾誤讀 RSC 目錄，後來亦觀察到連線佇列造成 JS connection reset；兩者均限本機工具。修正 adapter 並將佇列由 5 增為 128 後，正式驗收 29/29 通過。未用 SPA fallback。

## 執行決定

以下列出相對計畫的全部實際調整。

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

## 程式審查

完整 Codex 與 CodeRabbit 審查在建立 PR 後進行。
