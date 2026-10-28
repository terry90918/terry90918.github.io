# Repository instructions

## Working conventions

- 在獨立 worktree 與任務分支修改。原始 checkout 保持唯讀，避免混入其他工作。
- 使用 Bun；執行命令以 `package.json` 的 scripts 為準。
- 禁止新增程式、測試或設定註解。以程式結構、型別與文件表達必要資訊。
- 優先使用內建瀏覽器、Exa、地端 Docker Firecrawl、Context7、Notion、GitHub、Coolify 與 Hetzner 外掛；Woodpecker CI 優先透過 API 檢查。
- OpenSpec 已停用，不執行其指令，也不把它當作提交或發布條件。
- `CLAUDE.md` 只保留指向本檔的一行。專案 agent 指引集中於本檔。

## Read before changing

- UI、樣式、主題與版面：讀 `DESIGN.md`，沿用既有元件與語意色彩。主站與 CV 共用 `data-theme` 契約。
- 文章與 frontmatter：讀 `content/README.md`。保留已發布文章 URL、時間與 RSS 行為，除非使用者明確要求更動。
- CV：同時驗證 `zh-TW` 與 `en`。共用展示元件在 `components/CodexShowcase.tsx`，來源快照在 `lib/site/codex-activity.json`。
- 靜態匯出：讀 `next.config.ts` 與 `scripts/finish-cv-export.mjs`。網站沒有常駐 Next.js server；以 `out/` 的實際輸出驗收。
- 站點中繼資料：`robots.ts` 必須留在 `app/` 根目錄；route group 內的位置可能無法匹配。
- Markdown 與 MDX：檢查各自的渲染與清理流程，保留標題錨點與共用正文樣式。

## Verification and delivery

- pre-commit 與 CI 都執行 `bun run verify`；順序的唯一來源為 `scripts/verify.mjs`。格式不符時先執行 `bun format` 修正。
- 本機驗證包括全專案 lint、TypeScript、單元測試、正式 build，以及變更涉及的瀏覽器流程。
- 首頁測試會讀取全部文章；資源競爭造成逾時時，以 `bun run test --maxWorkers=1 --testTimeout=60000` 重跑並保留原斷言，記錄執行方式。
- 單元與整合測試分別在 `tests/unit/`、`tests/integration/`；頁面整合測試使用真實內容與元件，保留所有斷言。缺少測例不能算通過。
- E2E 由 Playwright 管理當前 checkout 的專用開發伺服器；CI 先安裝 Chromium 與系統依賴。`E2E_PORT` 可指定空閒埠；`verify` 不沿用外部 `BASE_URL` 或舊匯出。
- 格式檢查涵蓋維護的 repo 檔案；自動產生的 CHANGELOG、框架型別與測試報告依 `.prettierignore` 排除。
- 發布流程以 `.github/workflows/deploy-pages.yml` 為準：主線提交通過同一 SHA 的 Woodpecker push 驗證後，GitHub Pages 才建置與部署。
- 分別確認本機、審查、CI、合併、部署與公開頁面。完成部署後以實際公開 URL 讀回變更，再宣稱發布完成。
- PR 使用 repo 現有標籤。不要假設文件中的標籤名稱仍存在，建立前先確認。
