---
title: 'Cursor 的 pstack 外掛：把工程工作流程做成可委派的 Agent 技能'
publishedAt: '2026-10-14T23:56:00+08:00'
status: 'published'
slug: 'cursor-pstack-plugin-analysis'
excerpt: 'pstack 以 /poteto-mode 為入口，把工程任務分流到 playbook、技能、模型角色與子代理，再要求用證據驗收。'
tags:
  - cursor
  - ai-agent
  - developer-tools
  - agent-workflow
metaDescription: '拆解 Cursor 官方 plugins repository 中的 pstack 外掛，說明它的 manifests、/poteto-mode、playbooks、模型設定、子代理、資料流、權限界線、優缺點與適用情境。'
---

## 先看它是什麼

截至 2026 年 10 月 14 日，Cursor 官方 `plugins` repository 的 pstack 為 0.15.24。當天最新 commit 只把兩份 manifest 的版本號更新到 0.15.24，沒有改動技能內容。[版本 manifest](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/.cursor-plugin/plugin.json#L1-L31) [最新 commit](https://github.com/cursor/plugins/commit/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8)

pstack 把工程任務的分流、步驟與驗證要求整理成 skills、playbook 和子代理設定。Cursor Agent 提供模型與工具；pstack 提供工作路由和操作指引。[README 的使用流程](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L32-L40) [Cursor 對外掛的定義](https://cursor.com/docs/plugins)

README 的作者自述，pstack 是自己在 Cursor 工作時使用的技能集合，目標是少寫但寫得更好，並藉由可信任的代理工作流程來並行處理任務。這是作者對設計目標的描述，不是公開的品質基準或比較實驗；原始碼能證明它提供了哪些流程，不能單獨證明採用後一定會提升品質或速度。[README 自述](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L3-L13)

## 組成：兩種 manifest、一個主入口、多組工作手冊

pstack 同時附有兩份 manifest。根目錄的 `plugin.json` 對應 Agent Plugins 格式；`.cursor-plugin/plugin.json` 對應 Cursor Plugin 格式，並明確登記 `skills` 與 `agents` 目錄。Cursor 官方文件說明兩種格式都能安裝，但 Cursor Plugin 還能包含 Cursor 專屬元件；因此，pstack 的主體是可分發的技能與代理設定，不是獨立執行的應用程式。[Agent Plugin manifest](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/plugin.json#L1-L21) [Cursor Plugin manifest](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/.cursor-plugin/plugin.json#L1-L31) [Cursor 外掛格式說明](https://cursor.com/docs/plugins)

主要零件有四種：

- **`/poteto-mode` 路由技能。** 它是一般工程任務的入口。README 列出 23 份 playbook，涵蓋調查、除錯、效能、功能、重構、原型、視覺比對、PR 維護、發佈、長時間執行及多階段專案等。觸發後，技能按任務選一份 playbook，把步驟放進待辦清單，再於流程需要時呼叫其他技能。[README 的 playbook 清單與路由描述](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L38-L91)
- **專門技能。** `/how`、`/why`、`/architect`、`/arena`、`/swarm`、`/interrogate`、`/tdd`、`/unslop` 等技能，各自負責調查、設計、並行嘗試、審查或驗證等工作。README 也列出 24 個原則技能，像是先找根因、按行為測試、把變更切成可驗證單位、減少讀者負擔。這些內容是 Agent 可讀取的操作提示，不是獨立的強制政策引擎。[技能清單](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L97-L143) [24 個原則](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L206-L238)
- **兩個自訂子代理。** `poteto-agent` 是 `/poteto-mode` 執行期間交付程式碼工作時使用的代理設定；它要求子代理先讀完整的 `poteto-mode` 技能。`comment-sicko` 則是針對程式註解的審查提示。[poteto-agent 定義](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/agents/poteto-agent.md#L1-L10) [comment-sicko 定義](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/agents/comment-sicko.md#L1-L32)
- **少量輔助腳本。** 套件也包含檢查多階段計畫格式的 `check-plan.mjs`，以及盤點 worktree 狀態、但不會刪除 worktree 的 `worktree-audit.sh`。它們由對應的技能流程呼叫，不構成另一套常駐執行服務。[計畫檢查腳本](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/scripts/check-plan.mjs#L1-L39) [worktree 盤點腳本](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/scripts/worktree-audit.sh#L1-L12)

## 實際使用流程

1. 在 Cursor 安裝 pstack。README 提供 `/add-plugin pstack` 作為入口。
2. 執行 `/setup-pstack`，選擇推理預算，並確認各工作角色使用的模型。
3. 在需要較嚴謹流程的工作開始時呼叫 `/poteto-mode`，再用自己的話描述目標與完成條件。
4. Agent 對照任務挑選 playbook，建立步驟清單，依照流程讀取相關技能與參考資料；遇到可以拆開處理的工作時，再委派子代理。
5. 主對話負責整體決策、檢查委派結果、驗證及回報。除非使用者要求，並行並不是所有步驟的預設。[安裝與開始使用](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L15-L36) [主入口職責](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L85-L95) [子代理分工](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L196-L204)

以修 bug 為例，playbook 要求先在對應介面重現，再用證據縮小根因，必要時安排架構設計與程式碼委派，最後在同一介面重跑原本的重現步驟。它把「測試通過」和「原本的 bug 已排除」分開處理，也規定回報要包含根因與驗證結果。這是流程模板；是否能完成介面重現、取得執行資料或使用特定工具，仍取決於目前的 Cursor 工作階段與專案環境。[Bug fix playbook](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/bug-fix.md#L1-L15)

## 模型分工與設定寫入

pstack 不要求所有步驟都由同一模型處理。README 的 0.15.24 預設把程式碼委派交給 Grok，把較難的變更、文字與判斷交給 Opus 5.5，並以兩者組成審查面板。使用者可用 `/setup-pstack` 調整角色和推理預算；實際可用模型會依工作階段偵測，確認後才寫入設定。[README 的預設模型分工](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L21-L30) [setup-pstack 技能](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/setup-pstack/SKILL.md#L8-L39)

`/setup-pstack` 會讀取或建立 `~/.cursor/rules/pstack-models.mdc`，用一條 always-applied 使用者規則記錄預算與各角色模型。這是使用者家目錄的本機設定，不會因為單純安裝就替整個專案改寫設定。再次執行時，技能會讀取現有值並重寫整份規則，因此要留意過去自訂過的角色設定是否仍符合目前需求。[設定讀取與寫入步驟](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/setup-pstack/SKILL.md#L16-L18) [規則寫入與重跑行為](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/setup-pstack/SKILL.md#L37-L70)

模型名稱是當下的預設，不是長期相容保證。技能要求先確認模型 slug 可用，若子代理工具拒絕指定模型，則回退到角色預設並說明。若組織方案或 Cursor 設定不支援某個模型，官方說明也指出實際可用模型會受方案與管理員限制。[模型確認與 fallback 指引](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/setup-pstack/SKILL.md#L12-L35) [Cursor 子代理模型限制](https://cursor.com/docs/subagents)

## 權限與資料流：工作流會讀寫什麼

pstack 的 package manifest 登記技能和子代理設定；在這個快照的 pstack 目錄中，也沒有 MCP 伺服器或事件 hooks 設定。pstack 不會自行啟動連線服務。實際讀檔、改檔、執行命令、連接 MCP 或操作 GitHub，仍由 Cursor Agent 使用當下可用的工具與帳號。技能提示不會限制或隔離這些工具。[pstack 目錄](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack) [Cursor Plugin manifest](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/.cursor-plugin/plugin.json#L1-L31) [Cursor 對 plugin 元件的說明](https://cursor.com/docs/plugins)

使用者呼叫 `/poteto-mode` 後，Cursor 會把技能說明提供給 Agent。Agent 再按技能指示讀取 playbook、參考檔案，或將任務摘要交給指定的子代理。Cursor 官方將子代理描述為獨立上下文的助手；父代理需在提示中提供子代理完成工作所需的背景。當 pstack 呼叫多個模型時，任務內容和必要程式碼會成為各次模型工作的輸入。實際經過哪些服務、保留政策和費用，取決於所選模型、Cursor 方案與帳戶設定，pstack 原始碼沒有承諾這些事項。[Cursor Skills 的載入方式](https://cursor.com/docs/skills) [Cursor 子代理的上下文與費用說明](https://cursor.com/docs/subagents) [pstack 子代理指引](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/SKILL.md#L91-L101)

有些技能會接觸較敏感的本機內容。`/automate-me` 會整理目前工作區的近期 Agent 對話，從中歸納偏好，再建立或修改個人模式技能；它的提示明確要求只讀取系統提供的工作區 transcript 路徑，不要遍歷其他專案的對話目錄。這是技能對 Agent 的範圍指示，不是作業系統層的沙箱。若工作區 transcript 含有私有內容，使用前要先確認自己接受它被納入該次模型上下文。[automate-me 的觸發設定與 transcript 範圍](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/automate-me/SKILL.md#L1-L4) [歷史資料處理指引](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/automate-me/SKILL.md#L27-L40)

因此，安裝套件與啟用某一工作流要分開看。`/poteto-mode`、`/setup-pstack` 由使用者在 Cursor 中呼叫；子代理的可寫能力依 Cursor 工具設定和代理 frontmatter 而定；任何 PR、訊息、部署或其他外部變更都來自 Agent 後續執行的工具操作，不是單靠安裝 pstack 就會發生。Cursor 的子代理預設具有寫入能力，明確設定 `readonly: true` 才會限制寫檔和會改變狀態的 shell 命令。[Cursor 子代理權限欄位](https://cursor.com/docs/subagents)

## pstack 的 Agent 與 Cursor Agent 不同

Cursor 是宿主產品，負責提供模型、工具、檔案與子代理執行環境。pstack 是可安裝在這個環境裡的 workflow plugin。`/poteto-mode` 不是一個長駐背景服務；它是在接收任務的主對話中執行的技能。`poteto-agent` 則是主對話委派工作時使用的自訂代理提示。兩者的角色在 README 中有明確區分。[README 對主對話和 poteto-agent 的分工](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L196-L204) [Cursor 子代理定義](https://cursor.com/docs/subagents)

README 稱 Comment Sicko 為 read-only reviewer；代理提示說它不寫應用程式碼，但也寫著它會處理註解，並要求只回報結果。實際的 `comment-sicko.md` frontmatter 沒有 `readonly: true`。Cursor 文件說明子代理的 `readonly` 預設值是 `false`，只有設為 `true` 才會限制檔案寫入與狀態變更 shell 命令。因此，現有設定只能證明作者希望它採取唯讀姿態，不能證明 Cursor 會用權限強制唯讀；也沒有證據顯示它實際修改過檔案。維護者應釐清這個配置缺口。[README 的 read-only 描述](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L196-L204) [Comment Sicko frontmatter 與提示](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/agents/comment-sicko.md#L1-L32) [Cursor `readonly` 預設值](https://cursor.com/docs/subagents)

## Benny 自動化不是安裝後立即啟用

pstack 另附 Benny，一套針對 Slack 問題回報的兩段式自動化素材：先分類和追蹤 issue，再重現已確認的 bug，必要時建立 draft PR。README 特別稱這是 dormant automation pack，檔案不會註冊成 slash skill。要使用時，必須把檔案複製到目標 repository 的 `.cursor/automations/benny/`，配置必要的 Slack、tracker、UI 驗證工具與專案地圖，再由使用者設定 Cursor Automation；文件也要求在首次建立時逐一檢查 automation draft。它不會因安裝 pstack 而自動監控 Slack 或建立 PR。[README 對 Benny 的說明](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L266-L270) [Benny 的安裝與前置條件](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/automations/benny/README.md#L1-L23) [Benny setup 指示](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/automations/benny/FOR_AGENTS.md#L55-L89)

## 優點、成本與限制

**適合的地方。** pstack 把常見工程活動寫成可重用的流程，讓使用者能直接從任務描述開始，不必每次重新設計整份操作清單。它對調查、除錯、跨檔案設計、驗證和長時間任務的步驟拆分特別細，並把「完成」連到執行或介面證據，而不只依賴 Agent 自述。這些是原始碼可見的流程特徵，不等於所有專案都應照單全收。[playbook 列表](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L55-L79) [驗證原則](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L231-L235)

**並行有實際成本。** 多模型審查與子代理能分開任務、保留主對話空間，但也增加啟動時間、token 用量和協調成本。Cursor 官方文件也指出，每個子代理有自己的上下文與 token 用量，簡單任務通常直接由主代理處理更快。若工作沒有獨立分工或驗證價值，開啟多個子代理可能只是增加延遲與費用。[Cursor 子代理的成本取捨](https://cursor.com/docs/subagents) pstack 的多模型面板數量也可由使用者設定，面板設定越大，越要注意成本和結果整合。[setup-pstack 面板設定](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/setup-pstack/SKILL.md#L29-L35)

**指引不是強制閘門。** playbook 可以要求先重現、測試或獨立審查，但多數條件仍由模型照提示執行。除非另有腳本檢查、Cursor 權限設定、CI 或工作區政策提供約束，技能文字本身不會阻止 Agent 跳步、選錯工具或誤判證據。Comment Sicko 的 readonly 設定缺口正好顯示了這種差異。

**流程範圍很大，可能不合輕量任務。** `/poteto-mode` 有 23 份 playbook、數十個技能檔和多個委派分支。作者也說有些功能不在 pstack 內，例如 `/deslop` 和 UI/CLI 控制技能需要另一個 `cursor-team-kit` plugin。安裝後仍需了解哪些能力依賴 Cursor 內建功能、哪些需要額外 plugin 或專案工具。對一行修正、一次性查詢或無法執行驗證的工作，完整流程可能超過任務本身的成本。[未內含的能力](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L242-L250)

**速度和模型設定會漂移。** 本文的版本與模型預設只代表指定 commit 的狀態。當上游修改預設模型或技能時，舊的 `pstack-models.mdc` 可能仍把角色固定在先前的模型，README 也提醒需要重新檢視使用者規則。這次 0.15.24 commit 只更新版本號，不能據此推斷後續模型預設或技能內容不會變。[模型規則更新說明](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md#L260-L264) [0.15.24 commit](https://github.com/cursor/plugins/commit/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8)

## 適合誰

pstack 適合經常在 Cursor 中做非瑣碎工程工作的個人或團隊，尤其是希望把調查、實作、審查和驗證拆開，並願意按角色選擇模型的人。當團隊已經有可用的測試、UI 驗證、MCP 或 GitHub 工具時，playbook 比較容易落地。

如果任務簡單、模型選擇受限、團隊不希望 Agent 讀取本機 transcript，或組織需要以技術權限強制唯讀和審批，採用前應縮小使用範圍、審查技能提示與代理設定，並以 Cursor 權限、CI、review gate 等外部機制執行必要限制。pstack 可以提供工作規範，但不能單獨充當權限系統。

## 結論

pstack 把工程判斷與重複流程寫成 Agent 能讀取的 playbook，也提供模型分工和委派方式。程式碼品質仍取決於測試與執行證據；權限邊界則取決於 Cursor 設定與工具限制。採用前要確認指定模型與工具是否可用、技能會讀寫哪些內容，以及審查和唯讀要求是否由權限或自動化閘門執行，而不是只寫在提示裡。

本文的事實依據為 [pstack 0.15.24 原始碼快照](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack)；「高品質」、「更快」等效益屬 README 的作者自述，本文沒有找到可比較的公開量化評估。

## 主要一手來源

- [pstack README](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/README.md)
- [Cursor Plugin manifest](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/.cursor-plugin/plugin.json) 與 [Agent Plugin manifest](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/plugin.json)
- [`poteto-mode` 主技能](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/SKILL.md)、[setup-pstack](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/setup-pstack/SKILL.md)、[Bug fix playbook](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/bug-fix.md)
- [`poteto-agent`](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/agents/poteto-agent.md)、[Comment Sicko](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/agents/comment-sicko.md)、[`automate-me`](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/automate-me/SKILL.md)
- [Benny README](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/automations/benny/README.md) 與 [Cursor 配置指示](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/automations/benny/FOR_AGENTS.md)
- [Cursor 官方外掛文件](https://cursor.com/docs/plugins)、[Skills 文件](https://cursor.com/docs/skills) 與 [子代理文件](https://cursor.com/docs/subagents)
