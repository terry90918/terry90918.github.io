---
title: '逐項拆解 Cursor pstack 的提示詞：技能、原則、工作手冊與代理設計'
publishedAt: '2026-10-15T06:57:39+08:00'
status: 'published'
slug: 'cursor-pstack-prompt-analysis'
excerpt: '逐一分析 pstack 0.15.24 的 30 個一般技能、24 個原則、23 個 playbook、代理提示、Benny 自動化與可重用子代理提示。'
tags:
  - cursor
  - ai-agent
  - developer-tools
  - agent-workflow
metaDescription: '依固定原始碼版本逐項解析 Cursor pstack 的提示詞如何觸發、分工、要求證據，以及它們依賴的工具、權限與流程條件。'
---

本文是 [pstack 架構總覽](/posts/2026/cursor-pstack-plugin-analysis) 的續篇。前文拆解套件由哪些元件組成；這篇往下看提示詞本身，逐項分析它要求 Agent 做什麼、怎麼分流、依賴哪些工具與上下文，以及何處仍只是文字要求。

分析固定在 pstack 0.15.24 的原始碼 commit [1e5c90a](https://github.com/cursor/plugins/tree/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack)。下文的「觸發」指 README、技能描述或主路由寫明的呼叫條件。提示要求 Agent 做某事，不代表它已執行；權限、CI 和實際 readback 才能證明結果。

## 先分清六種提示層

pstack 的提示詞不是一張扁平清單。入口技能把任務路由到 playbook，playbook 再依步驟讀入一般技能、原則或參考提示。子代理提示決定某一個角色如何工作。Benny 則是要複製進專案的自動化套件，不能從 pstack 的 slash 技能清單直接呼叫。

因此，以下將一般技能、原則技能、playbook、自訂代理、Benny 操作技能和可重用子代理提示分開列。Playbook 是 /poteto-mode 選用的工作流程檔案，不是 23 個額外的 slash 指令。每個項目都附上固定版本的來源檔，適合直接對照。

## Frontmatter 決定技能如何被叫用

`pstack/skills/` 的 54 份 `SKILL.md` 中，有 53 份設了 `disable-model-invocation: true`；唯一沒有這個欄位的是 [`setup-pstack`](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/setup-pstack/SKILL.md)。Cursor 文件指出，這個欄位為 `true` 時，技能只會在明確呼叫 `/skill-name` 時載入，不會只因描述看起來符合任務就自動套用。[Cursor Agent Skills 文件](https://cursor.com/docs/skills)

因此，技能描述中的「Use when」是路由說明，不等於自動執行保證。使用者先啟動 [`/poteto-mode`](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/SKILL.md)，再由它按 playbook 明確呼叫所需技能。`setup-pstack` 是例外，Cursor 可以依它的描述判斷是否該用；`typescript-best-practices` 雖有 `.ts`、`.tsx` 路徑範圍，仍設為只能明確呼叫。這個 metadata 層解釋了為什麼 pstack 主要採「先選入口，再由入口分流」，而不是期待所有技能自行搶著執行。

## /poteto-mode 把任務變成可追蹤流程

[poteto-mode/SKILL.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/SKILL.md) 的核心工作是：收到任務後，選擇一份 playbook，把步驟原文放進 todo，再按每一步需要呼叫其他技能。它要求每個決策指出讀過的原則如何改變了選擇，並讓最終回覆面向使用者與維護者。

這個設計把長流程的記憶外化到清單，也讓路由與執行方式分離。代價是入口技能本身很長，而且工作流程彼此交叉引用。若模型沒先讀完整 playbook 或丟失前置規則，單看短的任務描述並不能補回缺失的流程。它也不能強迫 Cursor 提供 playbook 期待的模型、工具或權限。

路由適合的核心分界很清楚：讀取回答走 Investigation；需要改行為走 Feature；已有缺陷走 Bug fix；只改結構走 Refactoring；新問題需要先觀察方案走 Prototype；已量測的效能問題走 Perf issue；長時間反覆量測走 Hillclimb。這些區分能避免「先改了再說」，但仍仰賴 Agent 對使用者目標和現有證據判斷正確。

## 30 個一般技能逐項解析

這一節按技能名稱列出每份 SKILL.md 的定位、啟動條件、工作方式與主要限制。技能若依賴子代理、外部工具或專案資料，該條件會一併寫明。

### 任務理解與知識取得

1. [architect](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/architect/SKILL.md)。設計工作或可能被錯誤架構綁住的非小型改動會觸發。先用 how 建立現況模型，再用 arena 產生至少兩種結構不同的方案並依 red-flags 與介面深度篩選；預設不等人批准，只有使用者指定 checkpoint 才停。它依賴模型設定、arena、how、why 與設計參考檔，流程很重；若問題其實已經是機械式改動，會造成過度設計。

2. [arena](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/arena/SKILL.md)。用於方案競賽或一次嘗試可能選錯形狀的非小型工作。先定產物和可評分 rubric，再讓多個模型在隔離位置各自產出，由另一模型交叉評審，選底稿、人工移植落選方案的優點，最後驗證。依賴 Task 子代理、模型規則和獨立輸出目錄；若題目或 rubric 不清，方案會發散，skill 要求重框題目後再跑，成本不低。

3. [figure-it-out](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/figure-it-out/SKILL.md)。沒有適合的既有 playbook，或工作是大型遷移、多階段交付、使用者會離線等情況使用。先定可否證的完成條件、工作量和嚴謹度，再設計先做高風險未知、含驗證基線的工作流；每個單位按假設、變更、實物驗證決定保留或回退，並用 show-me-your-work 留決策軌跡。它是「設計一次完整作業」的入口；若已有合適 playbook，不應再建立另一套流程。

4. [how](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/how/SKILL.md)。問程式如何運作、責任該放哪裡、模組怎麼交互時使用；動機問題則交給 why。簡單題由一位 explainer 探索並說明；跨檔子系統拆成 2–4 個角度，先由 explorers 讀取，再由 explainer 綜整。它依賴 Task 與模型規則，explorer 被設為 readonly；readonly 子代理不能用 MCP，因此不能代替需要外部證據的 why 調查。

5. [poteto-help](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-help/SKILL.md)。使用者問 pstack 怎麼設定、挑哪個 skill 或 playbook 時作為入口。它依據問題給安裝、setup-pstack 或 poteto-mode 建議，查手冊與 skill description，再給一個可直接用的範例；若缺模型規則，只在相關時詢問一次。它本身是路由指南，不做實際工作；建議內容仰賴同一版本的 README 與 docs，插件安裝狀態也需依使用者環境確認。

6. [recall](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/recall/SKILL.md)。開始或接手工作前，要還原近期脈絡時使用。限縮 workspace、時間窗與主題後，平行整理符合條件的 transcript，並透過 why 搜尋共享紀錄；最後用 git、GitHub 等即時狀態核實 branches、PR 和 ticket。它明確禁止掃描其他專案的 transcript，並提醒不要把「所有歷史」偷換成近期樣本；若使用者已提供完整狀態 capsule，就跳過 transcript mining。

7. [teach](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/teach/SKILL.md)。使用者想真正理解一段程式、變更或系統時使用，不是要改程式。先按問題和已知程度設定教學深度，將 how 和 why 的結果整合成從定義到運作與動機的說明；複雜流程以逐步增加節點的圖示教學。要求單次回答先給最小完整說明，也要求適時停下讓使用者引導；多來源 why 調查可能讓小題過度耗時。

8. [why](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/why/SKILL.md)。問設計動機、回歸背景、事後檢討或閾值依據時使用，與說明執行機制的 how 分工。先蒐集 code anchor、blame、PR 和 ticket，再探測可用 MCP，依證據種類分派調查者，最後由 synthesizer 區分已知、推論、假說和未知並附來源。它預設完整平行調查，可能很慢且依賴 MCP；缺少某類 MCP 時必須把該來源列成 coverage gap，不能默認查過。

### 設計、驗證與除錯

9. [benchmark-checklist](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/benchmark-checklist/SKILL.md)。報告速度差、回歸或選擇效能方案前使用。先把主張寫成可驗證句子，檢查計時程式與負載，再檢查瓶頸、設定公平性、資源上限、錯誤、至少五次交錯樣本、端到端影響，以及被測工作是否真的執行；缺關鍵證據時結論必須是 inconclusive。它預設一套低階效能工具，部分指令偏 Linux；快速估算也只放寬樣本量，不放寬錯誤和工作確實發生的檢查。

10. [blast-radius](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/blast-radius/SKILL.md)。在改動合併前，尤其小 diff 看似安全但可能影響外部呼叫者時使用。它不只列 callers，而是找出安全判斷依賴的關鍵事實，追到資料、套件、生命週期或下游消費者，並用真實程式碼、測試或執行中的產品證明。若沒能執行驗證，就必須標成未證明；大型變更可再用 arena，成本高於一般 diff review。

11. [create-verification-skill](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/create-verification-skill/SKILL.md)。專案沒有腳本化方式操作真實 UI、CLI 或服務時使用。從 repo 查找啟動方式、操作介面、觀測證據與隔離條件，產生帶 launch、doctor、drive、evidence、cleanup 的專案 skill 和少量 feature map，再實際跑一次確認可用。要求有能啟動的程式和使用者可見路徑；生成後沒跑過就只是草稿，不可宣稱完成。

12. [maintain-verification-skill](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/maintain-verification-skill/SKILL.md)。定期確認已有 feature map 和驗證 skill 是否仍符合產品現況。先盤點索引，對每項 feature 派唯讀來源調查，再由主 agent 用同一個健康檢查過的實例逐項跑真實驗證；只改驗證 skill 自己的目錄，並將結果判為 clean、changed 或 blocked。它假設已有可用的 verification skill 與可操作產品；功能不可達時要提出具體前置條件，不能把未覆蓋說成通過。

13. [tdd](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/tdd/SKILL.md)。使用者明確要求 TDD 或回歸測試，或 bug 有明確且便宜的測試路徑時才使用。先辨認最小可觀測行為，寫一個會因正確原因失敗的測試，修正後重跑；若測試會需要昂貴 harness、脆弱 mock 或大量無關 fixture，就採用最接近的可執行驗證。限制很清楚，避免把 TDD 變成不分情境的儀式。

14. [swarm](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/swarm/SKILL.md)。工作要分片、平行探索、競賽或覆蓋矩陣時使用。先定完成條件、fan-out 形狀、worker 數與模型，再用各自輸出區啟動雲端 worker，最後核對回報的 SHA 和測量方法、彙整證據並列明掉隊者。依賴 cloud Task 與模型設定；少一個必要 slice 就不能宣稱完整 coverage，worker 敘述不能替代主 agent 驗證。

15. [interrogate](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/interrogate/SKILL.md)。使用者要求對抗式、多模型 review 或找盲點時使用。先界定 diff 和意圖，再依 role 設定以一個 reviewer 對一個模型啟動審查；彙整重複與歧異後，由 lead reviewer 分為 Act on、Consider、Noted、Dismissed。它明確禁止自動套用修正；依賴模型設定和多個 Task，review 所需時間與 token 會隨 panel 擴大。

16. [correct](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/correct/SKILL.md)。操作人反覆糾正同類錯誤時觸發。先看近期提交、revert、review、agent 指令與 workaround，要求錯誤至少發生兩次才成為一類；接著優先用架構消除錯法，其次用型別、lint/CI，再用測試，文件最後補位，並要求拿真實舊錯誤證明新檢查會失敗。它假設 repo 歷史足以辨認規律；樣本太少時不能靠臆測做結構改造。

### 文件、工具與介面

17. [automate-me](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/automate-me/SKILL.md)。使用者想把工作方式寫成個人 mode skill 時觸發。先查專案與個人目錄是否已有同名 skill，限定讀取目前 workspace 的對話紀錄，平行歸納反覆出現的偏好，再用 AskQuestion 補意圖、用 create-skill 起草、經使用者迭代後以 PR 落地。它刻意避免掃其他專案的私人 transcript；若證據只來自單次對話，就不應把它升格為慣例。

18. [make-bot-ui](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/make-bot-ui/SKILL.md)。要做一個能透過 webhook 喚醒 Grok Bot 的本機網頁，或放到 Tailscale 上時使用。流程建立 webhook routine、要求使用者在 UI 複製 URL 並透過 secret-request 提交金鑰、由伺服器而非瀏覽器保管金鑰、POST JSON，再驗證並提供 tailnet 位址；喚醒內容一律當成外部資料。這份提示依賴特定 Cursor routine、secret connector 與 Tailscale UI；它寫死 timeout 和不重試策略，也可能隨產品 API 改變而過時。

19. [no-comments](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/no-comments/SKILL.md)。對指定 diff 或目前 diff 找註解、lint suppression 和 TypeScript suppression，透過 Comment Sicko 子代理提出刪除或保留判斷。主 agent 必須核對 scope、理由與證據，接受可處理的根因修正；遇到有形狀的修正先停在 architect 草圖，對特定「保留」限制則提出結構化替代並等互動批准。它不是盲目刪除器，但依賴存在 Comment Sicko agent；錯誤判斷會影響編譯器抑制或真實安全註記。

20. [show-me-your-work](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/show-me-your-work/SKILL.md)。長期或無人監看工作需要讓 reviewer 重建決策時使用。用一份 append-only TSV，每個決策列出原因、可解析的證據指標和結果，交接前對照本次 transcript 稽核，再讓不同模型檢查記錄。預設本機、不提交；需要審查軌跡時才提交。它有 helper script 和 log 格式依賴，若每一步都記錄會讓簡單工作變成文書工作。

21. [technical-writing](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/technical-writing/SKILL.md)。撰寫或審閱文件、README、RFC、PR 描述和 commit message 時使用。先辨認 Diátaxis 的 tutorial、how-to、reference 或 explanation，再套用 Google Developer Style、STE 與 Global English 的句法規則。它重視具體、可掃讀、符合讀者任務；部分語言規則很嚴，應依文類保留必要術語，不要把風格規則硬套成產品 UI 文案規範。

22. [unslop](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/unslop/SKILL.md)。所有寫作都可使用，移除 AI 慣用詞、空泛歸因、冗詞、抽象隱喻、過度格式化和機器腔，保留原意與語氣。規則編號穩定，缺號是刻意保留的 ID；大量規則可當檢查表，但如果只按詞彙機械替換，會誤刪必要術語或把自然句改僵硬。

23. [typescript-best-practices](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/typescript-best-practices/SKILL.md)。frontmatter 指定 .ts、.tsx 路徑，供讀寫 TypeScript 時套用。先參照 principle-type-system-discipline，再列出判別聯集、品牌型別、邊界 parsing、避免 any/不當 as、窮盡性檢查、由 schema 推導型別、真實測試與結構化 telemetry 等規則。它偏好特定編碼風格，應以 repo 現有 schema、測試框架和型別慣例為準。

24. [bro](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/bro/SKILL.md)。/bro 將上一則訊息改寫成白話、短句與少術語。沒有分析流程或外部依賴；弱點是只縮短語句，不補缺失脈絡，也不檢查改寫後是否仍準確。

25. [in-your-own-words](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/in-your-own-words/SKILL.md)。/in-your-own-words 只要求重述使用者目標和要解決的問題。沒有流程、工具或驗證要求；它適合作為意圖對齊，不應被當作已釐清範圍或已獲得批准的證據。

26. [ketchup](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/ketchup/SKILL.md)。/ketchup 回報自使用者上次發言後，對使用者有影響的進度和待決事項。它要求 read-only 地核對 PR、CI、agent 等即時狀態，以 /bro 的白話寫法呈現，並對變化用小圖示或圖表。它不能啟動工作或替使用者做決策；適合同步狀態，不是工作追蹤器或事後憑記憶寫摘要。

27. [poteto-mode](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/SKILL.md)。以 /poteto-mode 或 Custom Mode 啟用，是整套 pstack 的工作風格和路由器。依觸發條件路由 how、architect、swarm、arena、interrogate、benchmark-checklist、no-comments 及各 playbook，列出 24 個原則，規定 autonomy、子代理模型、寫作方式、驗證和交付規則。它讓流程一致，但規則密集且部分路由容易擴大成本；實際行為仍依賴其他 skill、外掛、模型規則和 Cursor 子代理能力。

28. [reflect](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/reflect/SKILL.md)。使用者說 reflect 時，從目前對話找可長期保存的教訓。依 transcript 讓三位不同角度 reviewer 平行提出候選，由 synthesizer 驗證、分成 Accepted、Rejected、Backlog；先把可由結構化檢查強制的內容移出候選，再把接受的 edits 呈給使用者批准。它明確不自動改 skill；只有重複且有證據的教訓才值得保留。

29. [setup-pstack](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/setup-pstack/SKILL.md)。使用者要配置模型、role 或 reasoning budget 時觸發。盤點本回合可用模型，讀現行規則，詢問四種預算，映射並逐角色展示候選，經確認後覆寫 ~/.cursor/rules/pstack-models.mdc；重新執行時保留使用者改過的角色並移除退役 role。它寫全域設定，依賴 Task 模型清單與互動確認；沒有確認的真實模型 slug 不可寫入。

30. [sharpen](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/sharpen/SKILL.md)。/sharpen 在開始工作前，要求先想專家會用哪些原始來源、方法和外部驗證，辨認使用者真正目標與題目規格是否過多或不足，然後直接完成工作。它要求保留使用者應決定的選擇，也要求至少做一項外部正確性檢查；但這份 skill 不規定如何把檢查操作化，容易只得到模型自我框題。

上面列出 30 個技能，不過為了按功能分組，個別排序與目錄順序不同。接下來把性質相近的技能再整理成幾個觀察。

### 一般技能的幾種工作方式

- **發現與背景。** how、why、recall、teach 把程式機制、歷史理由、既有進度和教學分開，避免把一次程式閱讀說成歷史動機，也避免從頭重做舊工作。
- **方案與品質。** architect、arena、interrogate、blast-radius、correct 將設計比較、對抗審查、影響範圍和反覆錯誤改進分開。它們都有明顯的代理協作成本。
- **驗證與持續工作。** benchmark-checklist、create/maintain-verification-skill、tdd、swarm 和 show-me-your-work 將可觀測行為、重複驗證、平行覆蓋和耐久記錄放在不同層。
- **表達與設定。** technical-writing、unslop、bro、ketchup、in-your-own-words、poteto-help 是不同的語氣或回報工具，不應互相取代。setup-pstack 會改寫使用者全域設定，make-bot-ui 會建 webhooks，automate-me 會分析工作區 transcript，這三者有更直接的資料或外部變更風險。
- **路由本身。** poteto-mode 統一觸發與工作流程，figure-it-out 只在沒有既有流程足夠時設計新路徑。一般技能中沒有 30 份彼此獨立、都應直接呼叫的同層指令。

本文接著逐項分析 24 個原則技能和 23 份 playbook。

## 24 個原則技能逐項解析

每個原則是一段短指令，告訴主流程在某類決策點偏向哪一種做法。它們不是獨立的驗證器。部分原則要求再讀取同名 leaf skill，因為主技能目錄只列適用時機，並不等於已經讀過完整規則。

1. [attack-the-premise](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-attack-the-premise/SKILL.md)。同一前提導出的兩個以上修正都在同一道 gate 失敗時使用。先寫共同前提、用可重跑腳本統計不平衡的 actors，再找造成固定角色分配的根因並移除不對稱；樣本少於兩次或 census 均衡時不能直接歸因。

2. [boundary-discipline](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-boundary-discipline/SKILL.md)。串接驗證、錯誤處理或 framework adapter 時使用。只在 CLI、config、network、API 等邊界把未解析資料轉成 domain type，內部信任型別並把業務邏輯留在純函式；前提是邊界真的完成 parsing，不能用它替外部資料逃避驗證。

3. [build-the-lever](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-build-the-lever/SKILL.md)。非小型工作、改動、分析或檢查都可套用。先手工做一個單位學會程序，再做可重跑的 script、codemod、generator 或 delegate skill，重跑並與手工作法比較；它把審查與重驗證變便宜，但判定「非 trivial」的門檻偏寬，可能替一次性工作增加工具。

4. [encode-lessons-in-structure](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-encode-lessons-in-structure/SKILL.md)。發現同一指示第二次重複或收到重複糾正時使用。把能規則化的教訓改成 lint、metadata、runtime check 或 script；只有無法結構化的判斷才加醒目說明與反例。它不是再寫更多提示詞的授權，而是要求用更強制的機制取代文字提醒。

5. [exhaust-the-design-space](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-exhaust-the-design-space/SKILL.md)。新型 UI 互動或缺乏先例的架構決策，包含體感主導的產品設計決策時使用。原文只要求做 2–3 個競爭原型並並排比較；沒有定評分方式或何時算「已窮盡」，實務上要靠 arena 或 architect 補足。

6. [experience-first](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-experience-first/SKILL.md)。產品、UX 或功能範圍取捨時使用。優先讓使用者完成核心流程，刪掉沒有明確價值的控制與選項，先用 prototype 檢查細節，並把維護者與 API 使用者也視為使用者；「delight」是方向性判斷，不能取代實際使用證據。

7. [explain-the-number](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-explain-the-number/SKILL.md)。信任、回報或依數字行動前使用，適用效能、延遲、吞吐量和 eval。找出限制因素、排除錯誤、快取、未執行、未調校或噪音等替代解釋，留下 run count、分布與 limiter；perf 需完整跑 benchmark-checklist，工作確實發生則與 prove-it-works 互補。

8. [fix-root-causes](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-fix-root-causes/SKILL.md)。Debug 時先重現、逐層問為什麼，找出所有同類型症狀，再修根因而非用 guard 壓掉錯誤；卡住時加 instrumentation。特別提醒「重啟後才壞」要先檢查持久化狀態；若根因證據不足，不能把推測當修正依據。

9. [foundational-thinking](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-foundational-thinking/SKILL.md)。寫邏輯前先選資料形狀、型別和核心結構；安排 scaffold 與功能順序時也適用。要求先定存取模式、避免不必要抽象、檢查 actor 是否共享狀態、先移除死碼再建基礎；強調結構決策，不代表所有工作都必須先建 scaffold。

10. [guard-the-context-window](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-guard-the-context-window/SKILL.md)。輸出大、檔案長、重複讀取或 fan-out 可能塞滿上下文時使用。提示內容極短，核心做法是把階段與範圍切小，限制每階段檔案量和 token/turn 預算，把 bulk 工作交給子代理，只保留摘要；沒有更具體的預算算法。

11. [laziness-protocol](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-laziness-protocol/SKILL.md)。Refactor、判斷 diff 大小或想新增 abstraction、layer 或 signal threading 時使用。把重複決策收斂到單一事實來源，做能完整解決問題的最小 diff；原文只有兩項短規則，細節仰賴 Ponytail 和 repo 慣例，不能單靠它決定正確範圍。

12. [make-operations-idempotent](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-make-operations-idempotent/SKILL.md)。設計會重試、重啟或 crash 的 command、生命週期和處理迴圈時使用。逐一問連跑兩次或上次在任一點中斷後重跑會怎樣，必要時加入 reconcile、偵測 stale artifacts 或 locks，讓操作收斂到相同狀態；有副作用的系統仍需定義副作用邊界。

13. [migrate-callers-then-delete-legacy-apis](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md)。導入新內部 API 且舊 caller 仍存在時使用。先盤點 caller，協同遷移並刪除舊 API 和只保護實作細節的測試；只適用沒有外部相容承諾且可承受協調破壞的情況，若外部 caller 受支援，需先處理明確的相容契約。

14. [minimize-reader-load](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-minimize-reader-load/SKILL.md)。程式難以追蹤或要評估 module 邊界時使用。分別衡量追到答案要經過幾層，以及讀者需在腦中記多少隱藏或可變狀態；刪除單 caller wrapper、pass-through layer，縮小 state 範圍並在邊界表達 invariant。它用「新讀者 30 秒內能回答來源與變更方式」作啟發式，不是可量測品質指標。

15. [model-the-domain](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-model-the-domain/SKILL.md)。State logic 分支多，或多檔案重複 shape assumption 時使用。依領域選 state machine、typed model、union、registry、reducer、queue 或 index 等資料形狀，取代散落條件與同步布林值；也要求不要為了「建模」硬塞 abstraction，若原碼已清楚就保留簡單結構。

16. [never-block-on-the-human](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-never-block-on-the-human/SKILL.md)。想為可逆工作問「要不要做 X」時使用。對可審查、可回復的工作採合理預設、先做再回報；力求不要把執行決策丟回使用者，但 force-push、刪資料、對外發訊息等不可逆動作仍要確認。

17. [outcome-oriented-execution](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-outcome-oriented-execution/SKILL.md)。有明確 phase 的重寫或遷移時使用。優先收斂到目標架構，允許預先規劃且可逆的中間狀態不穩定，但要宣告可容忍的 breakage、持續檢查被改範圍，並在最後做完整靜態與 runtime 驗證；不能把「中間可壞」擴大成長期不驗證。

18. [prove-it-works](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-prove-it-works/SKILL.md)。工作完成、要宣稱完成前使用。直接讀實際值、跑功能或看 diff，不接受編譯成功、檔案時間或 agent 自述作代理證據；能重跑時把驗證寫成 script 並保留輸出。主要界線是驗證必須對準真實 artifact，不能拿方便但不等價的 proxy 代替。

19. [redesign-from-first-principles](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-redesign-from-first-principles/SKILL.md)。把新要求整合進既有設計時使用。讀完影響檔案後，想像新要求一開始就在場時會怎麼設計，再讓 types、文件、範例與 rationale 一起更新，最後分段交付。它反對只補一個旁枝，但沒有要求全面重寫，應按影響範圍落實。

20. [separate-before-serializing-shared-state](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-separate-before-serializing-shared-state/SKILL.md)。平行 actors 可能寫同一檔案、branch、key 或 state object 時使用。先確認能否各自擁有獨立寫入目標，於讀取或報告時再合併；只有單一共享物件本身是真正不變條件時，才用 lock、single writer、sequential phase 或 CAS 序列化。

21. [sequence-verifiable-units](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-sequence-verifiable-units/SKILL.md)。多步驟 sweep、遷移、批次改動或堆疊 PR 時使用。每單位都採 before、單一變更、檢查的順序，確認綠燈後才前進；delivery 順序也要讓 commit stack 自己說明驗證論證。依賴每個 unit 都有可執行 check，不能只把未驗證步驟切得更小。

22. [subtract-before-you-add](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-subtract-before-you-add/SKILL.md)。排序新增、重構或改寫工作時使用。先刪死碼、重複驗證、stub 或無新增內容的 reference，再建新功能；按實際用法設計而非預設 edge case，並把簡化 prompt 也納入。風險是把必要邊界防護誤認為冗餘，所以需和規格及呼叫路徑一同檢查。

23. [test-behavior-not-implementation](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-test-behavior-not-implementation/SKILL.md)。新增、改寫或保留測試時使用。測試應從使用者實際使用的入口呼叫程式，再比對明確輸出或副作用；會在每個被測函式都回 undefined 時仍通過的測試，就應重寫或刪除。它反對弱 assertion 和只重述常數，但跨表關聯和型別測試仍是有效例外。

24. [type-system-discipline](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/principle-type-system-discipline/SKILL.md)。設計型別、簽名或任一靜態型別語言的程式時使用。透過 sum types、semantic brands、邊界 parsing、窮盡匹配和 authoritative schema 衍生型別，讓錯誤狀態難以表示；只在實際出現 partiality 時強化型別。型別應反映領域契約，不需為追求精確而引入未被使用的複雜性。

這 24 個 leaf 原則分散在資料建模、邊界和型別、驗證、協作、寫作與工作管理幾類。它們主要用「何時適用」縮短路由成本，然後由 playbook 或一般技能提供操作細節。短原則本身無法驗證模型是否真的照做；像 explain-the-number、prove-it-works 會回到實際輸出，而 separate-before-serializing-shared-state 會反映在分支和 writer ownership 上，這些才是可檢查的結果。

## 23 份 playbook 如何安排工作

/poteto-mode 依任務挑選其中一份 playbook。這些檔案的粒度從單次調查到多日協調不等。共同特徵是把「完成」寫成可檢查條件，再把證據、分工和停止點放進流程；差異在於它們對工具、權限、等待和驗證成本的假設。

### 1. Investigation：只讀取證據，交付答案

[investigation.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/investigation.md) 用於「怎麼運作」「為何如此」「這個判斷可靠嗎」等問題。它要求先走 /how，涉及動機時再走 /why，最後輸出架構說明或含取捨表的建議。它明確禁止 PR、babysit 和未經需要的架構工作；一旦調查轉成實作，交回使用者重新選 Bug fix 或 Feature。

這個界線讓研究不會悄悄變成改碼。限制是答案品質依賴可讀取的原始碼或歷史來源，且此流程只承諾「有引用的解釋」，不會自行驗證產品行為。來源規則把「是否做過實際觀察」留給 /how、/why 和專案可用工具。

### 2. Bug fix：先在真實介面重現，再修根因

[bug-fix.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/bug-fix.md) 對應已報告缺陷。主代理要先在相同介面重現，建立競爭假設，按能最大幅度縮小問題空間的方式逐步排除，確認機制後才進入設計與實作委派。原始重現必須在修復後通過；「測試通過」不能代替「使用者看到的錯誤消失」。

這份流程把原始症狀與測試分開，是它最重要的判斷設計。它假設有可操作的 control skill；如果自動化介面碰不到目標，才可帶著具體原因詢問使用者。若沒有匹配介面、測試資料或足夠可觀測性，流程可能卡住，不能把推測當成已確認根因。

### 3. Perf issue：把每個效能主張綁到量測

[perf-issue.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/perf-issue.md) 適用已知有量測症狀的單次效能修正。先以 control skill 擷取基準，再按「避免做、避免重做、少做、延後、趁空檔、並行、降低成本」的順序檢查改善空間，從 trace 推導假設，最後比較前後產物。

流程要求引用量測數字，並規定 inconclusive 或跑錯介面不算通過。它依賴可重現工作負載、控制介面和 benchmark-checklist。數字容易受環境噪音影響，所以這份 playbook 再把測量解讀交給 checklist；若要長時間反覆追一個目標，則導向 Hillclimb。

### 4. Hillclimb：受控地迭代單一指標

[hillclimb.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/hillclimb.md) 用在持續改善一個可量化指標，而非一次性的效能缺陷。它要求先建立能區分真實工作負載的凍結量測工具，確認靈敏度，再設基準、成功門檻和最少嘗試次數。每輪只測一個假設，超過噪音且回歸檢查通過才保留。

這把每次取捨記在決策表，能降低「多改幾處後不知道哪個有效」的歸因問題。它同時強迫 Agent 穿越第一個平台期，避免太早宣稱成功。代價是量測工具與工作負載設計本身很花時間；若目標不可穩定量測，這種流程會把錯誤指標優化得很精確。

### 5. Runtime forensics：從正在發生的現象診斷

[runtime-forensics.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/runtime-forensics.md) 對付正在執行的程序出現 CPU 旋轉、記憶體洩漏或 UI 異常。它先抓 profile、heap snapshot 或 CDP trace，再把大檔縮到熱路徑、retainer chain 或無輸入的循環，最後注入執行期觀測以證明機制，並映射回來源符號。

它刻意把交付物限於診斷，不含修復。這避免把「看起來像根因」直接變成改碼。它依賴能連到正在跑的程式和安全注入診斷工具；若只能讀原始碼，流程不接受那作為 live proof。對生產環境執行 instrumentation 或 live hotfix 的風險，提示文字沒有替每個專案決定授權範圍，必須由宿主環境和操作規則補足。

### 6. Trace forensics：查已經存在的診斷資料

[trace-forensics.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/trace-forensics.md) 與 Runtime forensics 的差別是輸入已經擷取。它要求先識別格式，把樣本、frame 或 heap node 轉成可查詢資料，再定位熱路徑或保留鏈，最後用 artifact 自帶的符號映回來源。

若沒有 before/after 成對產物，結論只能是資料能支持的最強假設，不能稱為確認的根因。這是良好的證據分級；另一方面，把資料轉成 SQLite 是固定偏好的分析手段，對本身已可查詢或很小的檔案未必必要。它同樣只交付診斷，已知原因後再重新路由到 Bug fix 或 Perf issue。

### 7. Feature：先決定資料形狀與分工，再寫功能

[feature.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/feature.md) 用於增加或改變行為。它先走 /how 和 /architect，再要求把阻塞步驟、獨立工作線、共享狀態和最小安全拆分寫成四個 checkpoint 項目。代理收到具體檔案範圍、資料模型和成功條件後才實作；設計存在多個有效選項時，改用 /arena。

它把資料形狀放在程式碼之前，能避免多個代理先各自選一種資料模型。即使維持單人實作，也要求保留理由，因為拆分檢查是流程的審核點。弱點是小功能也可能承擔過多流程成本；router 的工作是把輕量、瑣碎任務分流出去，而不是讓每個變更都套完整 feature pipeline。

### 8. Refactoring：用行為契約限制結構變更

[refactoring.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/refactoring.md) 把重構定義為結構改變、行為不變。它先用 characterization test 或等價 harness 固定現況，再命名缺少的結構和目標形狀，刪除冗餘後分小步遷移呼叫者，移除舊 API，最後在真實產物上證明行為等價。

這份提示反對只為「看起來乾淨」而抽象化，要求讀者負擔必須降低，否則撤回。它假設可以建立可靠的既有行為基線；若現有行為含 bug，基線測試可能把缺陷固定下來，因此 playbook 規定一旦發現真正功能缺口或 bug，就拆成另一條交付路徑。它也明確禁止相容 shim 和新舊雙軌。

### 9. Prototype：用可丟棄的產物回答設計問題

[prototype.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/prototype.md) 在設計選項未定、需要比較互動或需要量測行為時啟動。它先寫清楚 prototype 要裁決的問題，必要時找參考素材，再在 scratch 目錄做最小可觀察實驗；多個方案放進同一切換器，最後用截圖或實際觀察推薦方向。

這裡「不用測試、不要求程式品質」不是放棄驗證，而是把驗證定義為能否觀察到設計差異。它假設 scratch 環境與匹配 surface 可用。必須保持產物隔離且明確註記為 throwaway，否則臨時程式可能被誤認為可交付實作；選定方向後要重新走 Feature 或 Architect。

### 10. Visual parity：把既有像素當成不可變規格

[visual-parity.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/visual-parity.md) 對應兩套 UI 等價或樣式遷移。它要求修改前先建立跨狀態 baseline，不可改 harness 或 baseline 遷就結果，每次只遷移一個 component，並以 image diff 的零差異作為通過條件。

強硬的 baseline 規則能防止用測試變更掩蓋視覺回歸；代價是像素差異對字型、渲染環境、動畫和平台很敏感。來源本身沒有處理如何把非確定性降噪。如果 baseline 看起來錯，流程要求停下來詢問，而不是把有疑問的畫面當正確規格。

### 11. Authoring a skill：以最少的操作文字表達決策規則

[authoring-a-skill.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/authoring-a-skill.md) 在撰寫或修改 SKILL.md 時使用。流程要求套用內建 create-skill、檢查 frontmatter 和跨技能引用，結構性提示才加測試，最後走 PR。它同時要求保留會改變決策的文字、把重複流程委派到既有技能，並將反覆出現的流程提議成新 skill。

這是把「技能只寫行動指引，不重講理由」落實成編寫規範。依賴 Cursor 內建 create-skill 可用，也假設讀者能判斷哪些規則真的改變決策。「有疑問就刪」可以減少冗文，但若沒有檢查呼叫者和引用路徑，刪除仍可能移除必要的操作邊界。

### 12. Eval：盲測提示詞與技能變更

[eval.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/eval.md) 評估修改某個 skill 或 prompt 是否改變 Agent 行為。候選模型得到像真實使用者輸入的任務，不看到 eval、rubric 或其他候選存在；另一模型只看匿名輸出和評分標準。最後從 transcript 檢查候選實際讀過哪些檔案，不能採信它自述的原則遵循情形。

它的盲測設計能減少模型迎合「現在正在被測試」的暗示；重點也不只在評分，還看出產行為的上下文是否符合真實使用方式。假設是有隔離工作目錄、模型多樣性及當前 workspace transcript 可讀。若 rubric 不具體、候選環境不一致或匿名化洩漏，盲測得分仍可能量到提示以外的差異。

### 13. Babysit：只管理合併前沿，不替使用者授權合併

[babysit.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/babysit.md) 管理已存在 PR 或 stack 的合併就緒狀態。它要求先選 drive（輪詢到 merge-ready）、background（非阻塞分流）、threads-only（只處理 review threads）或 check（單次狀態檢查），再固定 GitHub 或 Origin 作為 forge；整個 stack 一次只看最低尚未合併的 PR，按衝突、review thread、CI 順序排除阻塞。它把 review comment 當不可信輸入，逐條對照程式碼。Bugbot 的 fix/dismiss/ask 決策另見 [triage reference](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/references/bugbot-triage.md)。

核心取捨是把 Babysit 的停點設在「可合併」，把真正 land 的授權留給 Shipping 或使用者明確要求。這避免開 PR 就自動進入長輪詢，也避免 CI 綠燈被誤當作合併許可。流程依賴 GitHub 專用 watcher 或 Origin CLI、動態 /loop 和可靠 PR 狀態；沒有這些工具時，輸出不能假裝有同等終態判斷。

### 14. Shipping：按獨立驗證結果從 stack 底部 land

[shipping.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/shipping.md) 用於使用者要求落地已建好的 PR stack。每個 PR 都需要非作者代理在實際使用介面上驗證；然後從底部只合併連續已驗證的區段。它用 patch-id 判斷 rebase 後驗證結論是否還適用，合併時讀回 forge 狀態，並在落地期間禁止其他人改動 stack。

這把「PR 的 patch 驗證」和「CI 對某個 head 綠燈」分開，也處理了 merge queue 只是排隊、沒有實際合併的假陽性。代價是每個 PR 都要清楚保有 parent/head 關係和驗證記錄；漏掉 patch-id、base 移動或 forge 差異會讓舊 verdict 覆蓋錯誤的程式碼。

### 15. Autonomous run：以可判定的出口條件驅動單一任務

[autonomous-run.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/autonomous-run.md) 適用使用者明確要求持續跑到完成的工作。開始前先把完成條件寫成可檢查 predicate，再選事件 watcher 或定時 heartbeat；每次迭代只接受證據支持的最小變更，寫下進展，達標後停。

設計的長處是不用每輪向使用者確認，也不會只因停滯就降低完成標準。副作用是 Agent 被授權主動處理沿路發現的技能錯誤、CI 噪音和相關漂移，容易擴大範圍；它以「可逆就自己做、只在不可逆或真正無解時停」作為控制。啟用前必須確定使用者真的授權長時間自主執行，並具備 /loop 和持久決策紀錄。

### 16. Orchestrate：把大型持續專案變成有帳本的隊列

[orchestrate.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/orchestrate.md) 面向多日、多 PR、數十至數百代理的專案，不適合單一工作。它將 coordinator、track sub-coordinator、worker 和 verifier 分層，把任務、head SHA、驗證 verdict、合併 frontier 放進 units.tsv、ledger.tsv、frontier.json 等可讀狀態檔，再以 orch 在 drain 時同步狀態。

它不是「多開幾個 subagent」，而是用持久帳本降低失憶、死亡、重啟和分支衝突的成本。它假設 Cursor Task、雲端 worker、bun、Git forge CLI、agent store 和足夠清楚的驗收條件都可用；如果其中任何一層失效，隊列狀態不完整就會傳染到整個計畫。自身的編排成本很高，因此 playbook 明確要求超出單一 agent 工作預算才用。

### 17. Autopilot-full：每個 PR 一個 owner，主代理保有裁決權

[autopilot-full.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/autopilot-full.md) 在有多個獨立 PR 且使用者授權全自動落地時使用。每個 PR owner 從 build 一路負責到 merge；root 不寫程式碼，負責依賴、審查 swarm、檢查證據與 gate countersign。它區分 verdict（某個 patch）和 CI（某個 head），並對 trunk 變化規定何時需 rebase、何時測 merge result 即可。

這種角色分離能降低作者自己驗證自己工作的偏差，也讓不同 PR 可平行施工。成本在多層回報和合併責任：agent 需要定期落盤、標記卡住時間，root 需要追到底層 agent 和真實副作用。提示也要求 owner 在使用者 stop 時零寫入，顯示「完全自主」仍有外部停機線。需要真正 merge grant、Cursor cloud agent、control skill、forge/CI 等；少一項都不能把它當成已啟用的交易系統。

### 18. Autopilot-stack：自動建置與驗證，保留人工落地

[autopilot-stack.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/autopilot-stack.md) 對應依賴相連或需要逐一審閱的 PR。它沿用 Autopilot-full 的工作 owner 和驗證方式，但把 PR base chain、rebase 和 retarget 權限集中給 root；owner 只能推自己的 branch，不得 merge、關 PR、重設 base 或啟用 auto-merge。操作者最後從 stack 底部審查並落地。

這是在平行開發與線性審核之間做取捨。集中拓樸寫入避免多個代理互相改 branch base，但 root 也成為唯一能修復 stack 形狀的瓶頸。它適用使用者想審查而非授權 merge 的情境；一旦 landing 開始，prompt 凍結其他寫入，任何問題都要回到操作者決策。

### 19. Session pickup：信任歷程紀錄，但重新驗證繼承的主張

[session-pickup.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/session-pickup.md) 用於接手舊對話、cloud agent 或已推送 branch。先看 transcript metadata 和最後訊息，再回溯決策點，重建 branch/worktree、已完成變更和待辦；隨後比對計畫與現況，只把剩餘工作交給適合的 playbook。

此設計降低重做成本，同時避免把舊代理的「已驗證」自述直接當證據。它要求舊 trail 可讀、所在工作區清楚，且目標 artifact 還存在；若歷史資料缺段，流程要以原始目標重新確認主張。先前說「不要從零開始驗證」和最後要求「對照真實產物驗證繼承主張」形成平衡，不能解讀成盲信 trail。

### 20. Pause safely：把明確暫停變成可接手檢查點

[pause-safely.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/pause-safely.md) 只在使用者明確要求暫停時啟動，像是「我去睡了，先停」；「繼續跑」不是暫停。它要求在安全邊界完成或回退目前原子步驟、停止新工作、取消子代理、把未提交修改保存在一個 wip: commit，並將恢復資訊寫到上下文外。

這個設計把暫停視為可恢復的狀態轉換，不是普通的最終回覆。它的風險在於自動建立 commit 仍是 Git 寫入；使用者若只想停模型但不想保存工作，這句指令沒有提供分支選項。實際適用前必須確定使用者說的是安全暫停，而非只要求短暫停止。

### 21. Multi-phase plan：交付的是逐項可驗證的計畫

[multi-phase-plan.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/multi-phase-plan.md) 只為跨階段或多 PR 工作產生計畫，且明確禁止代替 owner 實作。簡單的一兩檔變更不必開計畫；仍未決定的設計先走 Prototype。產物必須依固定骨架列 PR、依賴、檔案、單元證據、十個 live lanes、效能比較、review gate 和風險，接著用 [check-plan.mjs](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/scripts/check-plan.mjs) 驗證格式。

它把計畫當作可以照格執行、並由人按證據稽核的工作介面，不只是給模型看的敘述。缺點是每個 PR 預設十個 live lanes、unit/live/perf 三面驗證，可能對低風險或不改行為的工作過重；模板提供 review gate 的「無」分支，但沒有同等簡化通用 live/perf 格式。要依工作風險決定是否值得這層成本。

### 22. Opening a PR：所有 PR 文件與分支操作的共同手冊

[opening-a-pr.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/opening-a-pr.md) 定義 branch/worktree、commit 切分、PR 標題與正文、forge、內建 PR 工具、ready 狀態和何時開始 babysit。它要求使用者能在一分鐘內看懂 PR 目的、範圍、風險與驗證，並優先五個窄 PR 而非一個大 PR。

這份共用手冊在大量工作流之間建立了相同的交付規格，也明確規定若存在宿主提供的 PR 工具，不能用 CLI 代替。需注意 README 稱它「在每個其他 playbook 結尾」呼叫，但 Investigation 明確寫「No PR」，Runtime/Trace Forensics 也只交付診斷。較安全的解讀是僅在產生程式變更或使用者要求開 PR 的流程呼叫；文字目前沒有把這個例外統一寫清楚。它還依賴 Cursor 以外的 cursor-team-kit /deslop，以及 pstack 的 /no-comments、/technical-writing。

### 23. Worktree cleanup：專門回收 worktree 與模擬器

[worktree-cleanup.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/playbooks/worktree-cleanup.md) 以磁碟空間回收為目的，先由 [worktree-audit.sh](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-mode/scripts/worktree-audit.sh) 盤點 worktree 的大小、年齡、merge/PR 狀態和近期聊天，再對照 pinned/active chat，最後只清掉確認無人使用且沒有未提交工作的項目。它也列出 Simulator、Xcode 資料和 package cache 等可回收項。

這份 playbook 直接處理本機狀態刪除，因為 git worktree remove --force 和 cache 清理可能移除資料。提示因此特別說分類只是建議，不能取代 pinned/active chat 清單和 diff 檢查；有 wip 或仍被使用的 worktree 要停。限制在於人工來源「哪個 chat 被 pin 或仍活躍」不一定能由本機 git 自動得知，安全性取決於該狀態是否先被查清。

### Playbook 間最重要的路由分界

| 任務                            | 路由                                 | 核心證據                                  |
| ------------------------------- | ------------------------------------ | ----------------------------------------- |
| 解釋程式如何運作                | Investigation                        | 原始碼路徑與來源引用                      |
| 已捕捉到 profile 或 heap 檔     | Trace forensics                      | 固定 artifact 的查詢與符號映射            |
| 現在正在發生 CPU/記憶體/UI 問題 | Runtime forensics                    | 直接 instrumentation                      |
| 確認缺陷並修好                  | Bug fix                              | 相同使用介面的重現與修後重跑              |
| 單次改善有量測的效能問題        | Perf issue                           | 前後 trace                                |
| 反覆逼近效能目標                | Hillclimb                            | 凍結 harness、每輪一個假設                |
| 結構改名、抽取、遷移            | Refactoring                          | 變更前的行為契約                          |
| 決定未知 UI 或架構方向          | Prototype，再走 Feature/Architect    | 可比較的實際產物                          |
| 已準備落地 PR stack             | Babysit，再由使用者要求時走 Shipping | forge 狀態、獨立驗證與實際 merge readback |

Playbook 描述的是流程意圖。當它要求 live UI、cloud agents、外部工具或特定 forge 時，缺少能力就應回報 blocked/inconclusive，而不是降低證據標準。

## 兩個自訂代理提示

### poteto-agent：把子工作約束在父流程之下

[poteto-agent.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/agents/poteto-agent.md) 是 /poteto-mode 派出的通用 delegate，不是主流程 runner。它必須先讀完整 poteto-mode/SKILL.md 和其中的原則索引，再處理被指派的任務；若找不到絕對路徑，自己到 plugin 目錄尋找並依版本選擇。

這避免父代理只傳一小段任務卻漏掉共享規則，也讓每一輪委派都能找到對應 pstack 副本。它仰賴代理拿得到 parent 給的絕對路徑或 ~/.cursor/plugins/，也要求每次子代理完整讀取長文件，會增加 token 和啟動成本。Agent frontmatter 指定背景執行，但未設定 readonly: true；寫入能力仍由宿主工具權限決定。

### comment-sicko：把註解視為需證明的例外

[comment-sicko.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/agents/comment-sicko.md) 專看註解、lint suppressions 和長篇 workaround 說明。它只接受少數外部契約例外；對自有程式碼的驚訝行為，要求回到 /how、/why 找出結構性修正方向。它會刪除範圍內不符合例外條件的註解和 suppression，也會標出要重構的 symbol；它不得改寫應用程式邏輯。/no-comments 的主流程會檢查它的 diff，復原不接受的刪除，並處理已接受的修正。

這提示的重點不是「刪掉所有註解」，而是要求保留理由必須能由外部契約證明，且把每個問題精確標成需重構的 symbol。語氣刻意極端有助於反向挑戰替註解辯護的慣性，但可能把有效維護說明也推向刪除。README 稱它唯讀，原始代理提示卻要求刪除註解；frontmatter 也沒有 `readonly: true`。因此「不寫應用程式邏輯」才是提示中寫下的範圍，Cursor 的權限設定沒有保證它只能回報。

## Benny：兩段 Slack 回報自動化

Benny 不是一般 pstack 技能。它是未註冊為 slash skill 的操作套件，使用者要將它複製到目標 repo 的 .cursor/automations/benny/，設定外部組態與 Cursor Automation，完成 thread safety 測試後才開放正式流量。內容把回報分成「分類」與「重現/修復」兩個步驟，刻意讓 ticket 和程式碼更改延遲到證據到位後才發生。

### setup-benny：先把執行邊界建好，最後才建立 automation

[setup-benny/SKILL.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/automations/benny/skills/setup-benny/SKILL.md) 由使用者指向 FOR_AGENTS.md 後載入，處理 pack 複製、專案 scoped pstack 啟用、secret-free config、Slack/tracker/control capability 檢查和 automation editor handoff。它要求尊重 target repo 已有檔案，將使用者自有設定留在 pack 外，不覆寫不明來源內容；也禁止未經明確要求就建立或更新 automation。

此設定流程把「可運作」拆成可檢查的前置條件，並讓 setup 與 live automation prompt 使用同 repo 內已提交的操作檔。它對 repo 路徑、Cursor 專案設定、Slack/Tracker connector、實際 control skill 和使用者選擇都有依賴；任一必備能力不清楚就停止。它也不允許直接呼叫 automation backend，而把建立動作限定在內建 /automate 的審閱 editor 流程。

### triage-issue-reports：一個 thread、一個經去重的結論

[triage-issue-reports/SKILL.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/automations/benny/skills/triage-issue-reports/SKILL.md) 只由已設定的 triage automation 執行。它先固定 source channel 與 root thread coordinates，再讀完整 thread 和附件、追蹤可能的程式區域、分類、查 owner/routing map、搜尋 tracker 去重，最後只在證據足以支持新 bug 時建單，並在同一 thread 留一則帶 marker 的 verdict。

最值得注意的是順序：建立 issue 前和回覆前都 preflight 原始 thread；若 post 失敗，必須透過 adapter 取消、關閉或刪除本輪建立的 issue，並讀回確認。Worker 只讀、協調者獨自發 Slack。這以「少開單勝過猜」作為偏好。流程依賴實作符合契約的 tracker adapter、穩定 permalink、附件存取和可驗證補償操作；若 adapter 不能撤銷不完整寫入，就不能安全地建單。

### reproduce-and-fix-issues：marker、兩次真實重現、修後證據的閘門

[reproduce-and-fix-issues/SKILL.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/automations/benny/skills/reproduce-and-fix-issues/SKILL.md) 只接受可信 triage identity 在同一 thread 留下單一 [benny:bug] 或 [benny:performance] marker。它固定原始座標，檢查是否有人已接手或已有 fix artifact，要求 control adapter 和 feature map 能走真實 UI，並把完全相同的區辨性錯誤狀態重現兩次。已有 PR/commit 就只驗證，不覆寫。

只有重現、媒體檢查、沒有既有 owner/fix artifact、runtime root cause 和預算都通過時，才進入修復；修後要用相同 UI 路徑重試兩次，跑聚焦測試和 blast-radius smoke，最後只開 draft PR，不 merge/deploy。這是強 fail-closed 流程，也依賴穩定的 Slack thread、模型身份、control adapter 七項能力、tracker、repo history 和可隔離 Slack 寫入權限。它把重現可信度做得很高，但流程成本高，且修復工時預算與外部控制技能需事先配置，否則會早停。

### 兩份 automation prompt template：要求 live prompt 去讀已提交的操作檔

[triage-automation-prompt.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/automations/benny/templates/triage-automation-prompt.md) 和 [reproduce-automation-prompt.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/automations/benny/templates/reproduce-automation-prompt.md) 是 /automate 建立 live automation 時的意圖材料，不是 automation runtime 的完整規則。兩者都將 repository-relative config path、trigger JSON、不可變 thread coordinates、thread-only rule、worker Slack 禁令與操作檔路徑送進 live prompt，並要求 setup 端先確認 pack 已提交。

Triage template 的焦點是 top-level Slack report、單一分類結果與配置 marker；repro template 增加 trusted marker 等待、兩次重現、既有 fix 驗證和 bounded fix 條件。這種分工避免把全部操作文件複製進 prompt，減少文件漂移，但也要求 automation 每次確實讀取 exact committed file。Template 把必填 config path 留成 placeholder，未填或仍是 plugin cache path 都是 setup 錯誤。

### FOR_AGENTS.md：使用者進入 Benny 的 setup prompt

[FOR_AGENTS.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/automations/benny/FOR_AGENTS.md) 是指示 Cursor 從 pack 進入 setup 的自然語言起點。它定義兩條 automation 的目標、觸發、工具、輸出和限制，也將配置欄位、專案 repo 複製、共享依賴與秘密管理說清楚，最後指向專案副本內的 setup-benny/SKILL.md。

它的角色是建立使用者意圖和 setup skill 的交接，不應被當成每次 automation run 都載入的操作 prompt。若使用者只複製此檔而沒有按流程複製 pack、啟用 project-scoped pstack、填設定和驗證 capabilities，automation 不會因此變得可用；此檔明文要求使用者明確要求後才建立或更新 automation。

## 可重用的子代理提示與評估材料

這些檔案不是新的 slash skills。被上層技能載入時，它們會把背景、問題、輸出格式、禁令和評分尺度填入子代理工作。how、architect、interrogate、reflect 和 why 的 prompt template 各自處理不同階段；不能只看 prompt 文字判斷最終執行，還要確認呼叫者有提供變數並接回產物。

### 1. Architect runner：獨立提案，不要把候選磨成折衷

[runner-prompt.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/architect/references/runner-prompt.md) 要每個候選先讀完整 architect skill，再以 caller usage 和 call site 推導型別草圖、函式簽名、模組圖和 rationale，並按 rationale template 呈現。它將資料結構、介面深度、共享狀態、boundary validation、idempotency 和短 call chain 設為設計審查軸，並明確要求不同模型提出自己的最佳方案，不要向其他候選靠攏。

這是探索 prompt，不是最終架構判決。它仰賴呼叫者已建立獨立工作目錄並提供任務、Phase A groundings 和輸出路徑；未填這些變數就無法獨立比較。鼓勵候選彼此分歧可增加設計空間，但後續必須由 architect orchestrator 比較候選並決定 base/grafts，不能以「有多個輸出」代替綜合判斷。

### 2. How explorer：分片調查並為合併保留可追溯資料

[explorer-prompt.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/how/references/explorer-prompt.md) 把同一 subsystem 拆成不同 investigation angles，每個 explorer 只深挖分配切片，回報 components、stepwise flow、讀過的檔案、邊界、非顯而易見行為和 open questions。它刻意收集檔案清單供 explainer 核對，並要求明示未知，避免把空白補成猜測。

這是發散的讀取階段，不負責寫最終解釋。它假設提問者能切出互不重疊但可合併的角度；若切分錯誤，結果會留洞或重複。執行力還取決於 tools 能否讀取實際程式碼，不能只靠 transcript 摘要。

### 3. How explainer：由多份觀察建構一個心智模型

[explainer-prompt.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/how/references/explainer-prompt.md) 接收原問題和所有 explorer findings，負責合併重複描述、自己讀碼解決衝突，再依 Overview、Key Concepts、How It Works、Where Things Live 和 Gotchas 組織解釋。它寫給不熟悉該區域的資深工程師，要求說明元件怎麼呼叫、資料怎麼流動。

它把子代理輸出當原料，不把它當權威；只要有矛盾，explainer 需回原始碼檢查。這是重要的品質閘門。弱點是指引允許 explainer「通常不需重做調查」，如果 explorer findings 有系統性遺漏，綜合代理可能只查局部差異，因此要保留 open questions 並對關鍵結論抽查。

### 4. Interrogate reviewer：針對既定意圖做對抗審查

[reviewer-prompt.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/interrogate/references/reviewer-prompt.md) 對候選 reviewer 提供作者 intent、diff/files、rubric、code-quality lens，要求找出實際錯誤、設計缺陷、安全問題與維護風險。輸出要含 severity、具體位置、證據和可選方案；若沒有問題，只回 no findings。

這份提示限制 reviewer 不要挑戰目標本身，也不強迫每個 lens 都適用，能讓審查集中在實作而非想像需求。它將 nit、warning、critical 分級，但 rubric 和 code-quality 附件可能很強勢，尤其 code-quality 要積極重構；沒有充分上下文時，這容易生產偏好型 finding。因此 parent 的 lead-judgment.md 不是裝飾，它負責追呼叫鏈、剔除假設風險和 reviewer 風格偏好。

### 5. Interrogate code-quality lens：偏向結構簡化的第二套評分偏好

[code-quality-review.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/interrogate/references/code-quality-review.md) 在 reviewer prompt 的核心指令上加入深度品質稽核和結構簡化視角，尤其檢查分支、重複 helper、錯誤 layer、型別邊界和不必要 orchestration，也把從 1,000 行以下長到 1,000 行以上列為強烈警訊。它把某些模式設定為 presumptive blocker，而非單純建議。

這種嚴格度適合明確要做 code quality review 的任務，能逼 reviewer 找到行為不變卻能刪除複雜度的設計。不過它不等同於普遍的程式正確標準；若與範圍、時間或既定架構衝突，lead 仍需判斷。它是 reviewer 的輸入 lens，不應在文章中誤標為可單獨呼叫的技能。

### 6. Interrogate rubric：把審查範圍列成候選檢查軸

[rubric.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/interrogate/references/rubric.md) 提供 correctness、root cause、architecture、security/privacy、performance、test quality、maintainability、scope 等審查軸。reviewer 要按變更挑適用面向，不必把每個面向都硬套在小修正上。

它的用途是降低只看 diff 表面或漏掉跨面向風險的機率。清單越長，審查越容易變成「每個角度都找一條意見」；所以主 reviewer prompt 說不適用就不強迫，lead judgment 再要求最多五項 Act On。評分軸提供覆蓋率，不提供證據本身。

### 7. Lead judgment：聚合判斷，而非多數決

[lead-judgment.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/interrogate/references/lead-judgment.md) 是主審查者在收到多個 reviewer findings 後的裁決框架。它要求沿實際 caller 驗證假設，分開具體缺陷與個人偏好，注意 reviewer 誤讀上下文，同時不要因為 finding 令人不舒服就駁回。最終 verdict 只留下少量可行動項目，並解釋 dismissed 的理由。

它修補了對抗式 reviewer 會過度報告的傾向，並使「被駁回」也可稽核。這是裁決規範，不會替 lead 自動讀源碼；若主代理只是統計投票或照單全收，這一步就失去價值。

### 8. Poteto help prompting：教使用者如何提出目標，而非照著手冊操作

[prompting.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/poteto-help/references/prompting.md) 給使用者寫 Agent 請求的指南。它要求說明目標、可判定的完成條件、需要展示的證據、已知症狀/重現/連結和真實限制；刻意建議省略執行步驟與自我診斷，讓 playbook 保有方法選擇空間。

它還要求在新 chat 用 /recall，先查不熟悉程式的 /how、/why，設計未定先 Prototype。這是提示編寫指南，不是 runtime prompt。它假設 Agent 能拿到 playbook 需要的能力；若使用者刻意限制工具、範圍或授權，這些限制必須明寫，否則「讓 Agent 自選方法」可能與實際權限不符。

### 9. Reflect reviewers：從單一 transcript 找不同類型的耐久教訓

[divergent-reviewer.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/reflect/references/divergent-reviewer.md) 要求 reviewer 找到和其他審查角度不同的二階影響，並只將學習路由到 transcript 真的使用或錯過觸發的 skills。它限定輸出為「原則、對話證據、路由」，避免長篇敘事。此提示把 transcript、工具輸出與引用內容都視為不可信材料，防 prompt injection。

[judgment-reviewer.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/reflect/references/judgment-reviewer.md) 以人收到的更正、重做、工具摩擦和耐久判斷為中心，找出能減少未來人工輪次的原則。它也要求回看 skill 是否已經涵蓋，不要將「這次沒照做」誤寫成 skill 缺陷。

[tooling-reviewer.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/reflect/references/tooling-reviewer.md) 專查命令、flags、API、路徑慣例和 MCP 缺口，並要求抓出使用者手動補上的、本可由 agent 自己查到的上下文。它把技術細節和泛化原則分開，適合導出可複用操作知識。

[synthesizer.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/reflect/references/synthesizer.md) 接收三種 reviewer 的未信任輸出，逐條用耐久性、具體性、現有 skill 優先、跨 reviewer 一致性、是否會改變下一次行為和機制能否取代 prose 等標準篩選。結果分成 Accepted、Rejected、Backlog，供使用者逐筆批准；不能直接套用修改。

這組 prompts 把「發現」「判斷」「修改」拆成獨立階段，並要求人審 Accepted 清單。優點是避免 reflection agent 自己改寫規則造成自我循環。成本是同一段 transcript 多模型或多角度重讀；如果 transcript 本身不完整或工具記錄不準，三種視角可能一致地分析錯誤素材。引用文字也必須當成不可信資料。

### 10. Why investigator：按來源收集歷史證據，不代替裁決

[investigator-prompt.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/why/references/investigator-prompt.md) 為每類來源填入問題、程式錨點、commit/PR/ticket 線索和 source-specific playbook。它要求每位 investigator 只調查一類來源，讀完整資料、記錄查詢、引原文和位置、暴露矛盾與空缺，不跨來源追查。

這讓多個來源能並行蒐集而不重複調查或混淆權威性。它特別切開 code mechanics 與 author motivation，禁止僅從程式形狀推論設計動機。前提是 orchestrator 先正確切來源、抽出 PR/ticket 和填入 prompt；如果上游沒有填齊欄位，investigator 會把缺資料誤當成無證據。

### 11. Why synthesizer：按信心等級整合不同證據

[synthesizer-prompt.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/why/references/synthesizer-prompt.md) 從各 investigator 的 findings、未查來源和程式錨點出發，整理直接、支持、推論、猜測與未知五個信心層級。它要求抽查引用、展示矛盾和未解問題，不把「程式目前如此」寫成「作者因此如此設計」。

這是把來源碎片轉成可行動答案的裁決階段，核心品質指標是信心用詞與證據吻合。它假設原始 findings 有可核對的引用，而且 synthesizer 願意抽查而非只摘要；若未查 sources 被省略，結論的可信度會被高估。由於 [epistemics.md](https://github.com/cursor/plugins/blob/1e5c90a4b6f249917bd21fe361b3a2a7deb741b8/pstack/skills/why/references/epistemics.md) 對此 prompt 有強制規範，兩份檔案必須一起讀。

## 這套提示詞強在哪裡，限制又在哪裡

**1. 先決定完成條件，再選工具。** 從 Bug fix 的雙次重現、Hillclimb 的凍結量測到 Shipping 的實際 merge readback，提示詞把「看起來合理」和「可證明完成」拆開。它很適合需要交付可信工程結果的長工作。

**2. 把分工、寫入權和判斷權分開。** Autopilot 和 Benny 要求每條 branch 或 Slack channel 都有明確 writer；Reviewers 只回報，root 做裁決。這降低互相覆寫和作者自審的風險，代價是協調程序多。

**3. 常把不可逆寫入設成 gate。** Benny 不允許缺 thread context 時建單；Shipping 不把 queue 當 merge；cleanup 要核對使用者活躍狀態。這些文字能提醒 agent 停手，但只有 Cursor tool permissions、adapter compensation、CI 或 forge state 能形成真正的技術保護。

**4. 對外部工具和模型有大量假設。** Playbook 會引用 cursor-team-kit 的 control 和 /deslop，依賴 Origin 或 GitHub CLI、Cursor Task、/loop、本機 transcript 和外部追蹤器。裝上 pstack 不代表這些能力同時可用。缺失時應輸出 blocked 或 inconclusive。

**5. 內容很長，維護成本集中在引用關係。** 同一條驗證規則可能出現在 playbook、principle、agent prompt 和 README。多處重複能讓子流程獨立閱讀，也會帶來更新漂移。poteto-agent 強制每個子代理重讀主技能可減少規則遺失，但增加上下文 token，且不能確保所有長期規則都被完整遵守。

**6. 某些流程偏好可能超出任務需求。** 十個 live lanes、固定 SQLite 轉換、完整 bootstrap 和多層審查能提升覆蓋，卻不是所有 repo 都負擔得起。/poteto-mode 的路由與「最小安全拆分」原則需要共同運作，讓流程成本匹配任務風險，而不是只因有範本就使用最大規格。

## 資料範圍與排除項目

本文將 SKILL.md、23 份 /poteto-mode playbook、兩個 agent 定義、Benny 三個 setup/operational skills、兩個 automation prompt templates，以及實際供上層技能填入子代理的 prompt templates 列為提示詞。另把 FOR_AGENTS.md 納入，因它是使用者指向 Cursor 後的 setup prompt。

README、逐步使用指南、示範設定檔、功能地圖樣板、shell/TypeScript scripts 和一般 source playbooks 沒有逐份當成可呼叫 prompt 分析。它們提供文件、範例、可執行檢查或 source-specific 搜尋方法，不是可獨立觸發的技能或 prompt。個別項目的結論限於固定 commit 中明文寫的流程；本文沒有執行 pstack，也沒有量測各提示在不同模型上的完成率或成本。
