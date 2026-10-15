---
title: "AI Coding 詞典拆解（06）：用 Memory、AGENTS.md 和 Skills 引導 Agent"
publishedAt: "2026-10-15T08:25:00+08:00"
status: "published"
slug: "ai-coding-dictionary-06-memory-steering"
excerpt: "把所有規則塞進一個檔案，未必能讓 Agent 更聽話。記憶、專案指令、Skills 和 Context Pointer 有不同載入時機，應放在對的層級。"
tags: ["人工智慧", "AI工程", "軟體開發", "Agent"]
metaDescription: "拆解 Memory System、AGENTS.md、Progressive Disclosure、Context Pointer、Skill 與 Subagent 的作用，設計可維護的 Agent 脈絡分層。"
---

每次開始新 Session，都要重講一次「這個專案用 PostgreSQL」或「修改後請先跑哪個檢查」，很快就會讓人想寫一份更長的指令檔。可是，如果一份檔案載入了每個專案規則、發版流程、設計細節和歷史決策，Agent 每次修一個小錯也要面對整包資訊。重要規則變多，不代表它們更容易被找到。

要讓工作跨 Session 延續，先把不同資訊分開看：哪些內容應該記住、哪些規則每次都要載入、哪些資料只在特定任務需要、哪些工作適合交給另一個 Agent。本文依《Dictionary of AI Coding》第六單元，說明 Memory System、AGENTS.md、Progressive Disclosure、Context Pointer、Skill 和 Subagent 之間的關係，再用一個新成員加入專案的情境安排資訊。

## Memory System 是外部保存和重新載入

**Memory System** 試著讓 Agent 在不同 Session 之間延續部分資訊。它有兩條路徑。寫入路徑把 Session 中值得重用的資訊保存到環境，例如檔案或外部儲存；讀取路徑則在之後的 Session 開始時載入這些資料，或先載入一份索引，再依需要讀取細節。

這種 Memory 不會更新模型參數，也不表示模型本身變成有持續記憶。它把外部資料重新放進新 Session 的 Context，讓模型看得到。若 Harness 沒讀到那份檔案，或索引沒有指向它，記下的內容就不會參與這次工作。

值得保存的內容通常穩定而且可能重複使用，例如使用者明確說過的語言偏好、專案採用的資料庫、常見驗收原則。相反地，某一分支目前改到哪裡、某次測試剛才是否通過，都是快速變動的工作狀態，不適合只靠長期 Memory 保存。這些狀態應放在 Ticket、Spec、工作分支或實際測試結果裡，讓後續 Session 能讀取最新版本。

Memory 也是 **Secondary Source**。它把過去的觀察濃縮成筆記，可能遺漏條件，也可能因專案改變而過期。要把它當成線索而非現況證明。若記憶寫「登入使用舊版 OAuth 流程」，開始修改前要回到目前程式碼、設定和官方文件確認。Memory System 也需要定期刪除過時項目，否則它會以舊資訊干擾新任務。

## AGENTS.md 放每次工作都適用的短規則

**AGENTS.md** 是一種供相容工具讀取的專案指令檔慣例。它適合寫多數工作都必須知道的簡短內容，例如 repo 的檢查命令、主要資料夾用途、修改產生檔時要遵守的方式，或特定資料不可直接改動的規則。

把規則放在 repo 裡，能讓 Agent 和人一起查閱，也能跟著程式碼版本管理。但檔案位置、向上或向下尋找方式、不同層級指令的優先順序，以及工具是否支援這個名稱，都依 Harness 而定。AGENTS.md 是開放的檔案格式和協作約定，不代表每個 coding agent 都會以相同方式載入。放進檔案前，要先查目前工具的支援情形，或在新 Session 實際確認它讀到了什麼。

另一個限制是載入成本。假如所有 Session 都會先讀 AGENTS.md，裡面的每段長文都會進入許多不相關工作的 Context。例如開發者只是在修 CSS，卻每次都要讀完整的部署程序、資料庫復原手冊和客戶支援政策。資訊雖然存在，注意力反而更難分配給眼前任務。

判斷一條規則是否適合放在這裡，可以問：「如果 Agent 正在做本 repo 裡任何一件工作，知道這條規則都會改變它的行為嗎？」若答案是否定的，應將完整內容移到專用文件或 Skill，再從 AGENTS.md 指向它。

## Progressive Disclosure 把內容分層載入

**Progressive Disclosure** 是只在目前工作需要時載入詳細脈絡。它不是少給資訊，而是先提供簡短入口，再讓 Agent 在情境符合時讀取更完整的內容。每個 Session 共用的固定規則保持精簡，任務專屬流程則等到相關工作開始時才載入。

**Context Pointer** 是引導 Agent 讀取額外資料的指標，常見形式是檔案路徑、連結或 Skill 的觸發說明。它要同時寫出穩定位置和讀取時機。只寫「見 `docs/deploy.md`」，Agent 未必知道什麼情況需要它；寫成「進行發版、部署或回滾前，先讀 `docs/deploy.md`」，就更容易在任務吻合時啟用。

例如，AGENTS.md 可以保留一句共通原則：「執行部署或回滾前，讀取部署手冊。」完整的環境變數、指令、復原步驟放在 `docs/deploy.md`，平常修測試時不必載入。指標若連到已刪除或過時的檔案，也等於沒有提供脈絡，所以目錄和連結要定期檢查。

**Skill** 是一份任務專用的能力說明，通常包含執行某種工作的指令，也可以附上腳本、範本和參考文件。相較於每次 Session 都讀完整指令，支援 Skill 的 Harness 可先看到 Skill 的名稱和描述，等工作符合時再載入完整內容。這讓「如何部署」或「如何審查資料庫 migration」能獨立維護，也避免所有工作都付出相同的 Context 成本。

Agent Skills 已有公開規格，定義 `SKILL.md` 及可選的支援資源格式；但各工具如何發現、載入和執行 Skill，仍要以該工具的實作文件為準。Skill 是 Agent 讀取的工作方法，不等於它會呼叫的 Tool，也不保證指令會自動執行。若流程要求先跑檢查或需要權限，仍要明確說明並確認 Agent 實際做了什麼。

一份 Skill 的描述負責讓工具和 Agent 判斷「什麼時候可能用到」，正文才說明實際步驟。若描述太寬，無關任務也可能讀進長篇指示；若寫得太窄，正確任務又可能找不到它。建立後可用幾個真實任務驗證觸發條件，並把能自動檢查的要求寫成指令或工具步驟，而不是只期待 Agent 記得。

## Subagent 能分開探索，但回報不是原始證據

**Subagent** 是由一個 Agent 透過工具呼叫啟動的另一個 Agent。它通常在自己的 Session 和 Context 裡查資料或處理明確子任務，完成後把報告傳回委派者。適合委派的工作包括搜尋某個模組的呼叫點、整理官方文件差異，或獨立檢查某段變更可能影響哪些使用情境。

這種分工能把大量搜尋輸出留在子任務自己的 Context，主 Session 只接收有用結論。代價是主 Session 拿到的是報告，不是子 Agent 讀過的全部檔案與工具結果。因此 Subagent 的回報也是 Secondary Source。報告應附上檔案路徑、行號、來源連結或查詢結果，讓主 Agent 能針對重要結論回讀一手資料。

委派範圍也要能獨立完成。若兩個 Agent 同時改同一份檔案，或子任務必須依賴主 Agent 尚未做出的決定，並行只會增加衝突。清楚交代要回答的問題、允許查看或修改的範圍、回報格式和停止條件。主 Session 收到結果後，要自己判斷是否足以支撐接下來的變更。

## 把資訊放進會在對的時間載入的位置

假設一位新工程師要修訂登入錯誤訊息。他需要知道 repo 怎麼啟動、相關模組在哪裡、修改後要跑哪些檢查，以及登入狀態是由哪段程式管理。他不需要一開始就載入整份雲端部署手冊、所有歷史決策和資料匯入流程。

可以把全 repo 通用的檢查命令放在 AGENTS.md，把登入模組的架構說明寫在專門文件，再於 AGENTS.md 加上一個觸發條件明確的 Context Pointer。若要進行特定安全審查，就載入對應 Skill。穩定的使用者偏好可以進入 Memory；這次修復的驗收條件、目前狀態和下一步則記在 Ticket。Agent 要調查搜尋路徑時，可委派 Subagent，並要求它回報相關程式位置和證據。

| 資訊 | 常見位置 | 使用時要確認什麼 |
| --- | --- | --- |
| 每個任務都適用的短規則 | AGENTS.md 或工具的專案指令 | 目前 Harness 是否真的載入，以及其他層級是否覆蓋它 |
| 特定工作才需要的操作流程 | Skill 或專門文件 | 觸發描述是否清楚，流程和支援資源是否仍有效 |
| 跨 Session 仍穩定的偏好或事實 | Memory System | 是否仍正確，是否有讀取入口 |
| 跨多個 Session 的目標與進度 | Spec、Ticket 或 Handoff Artifact | 對照目前程式碼、檢查結果和決策來源 |
| 子任務的探索結果 | Subagent 報告 | 重要主張是否能回到原始程式碼或文件驗證 |

這些位置不是互斥的。有時 AGENTS.md 會指向 Skill，Ticket 會連到 Spec，Memory 也會保存專案慣例。關鍵是不要把摘要誤認為現況，也不要把所有細節放進永遠載入的層級。每新增一條指令，都要確認它由誰讀取、在什麼工作載入，以及資訊改變時由誰更新。

## 用資訊的生命週期選擇位置

安排一項資訊時，先想它會維持多久、哪些工作會用到，以及誰負責更新。穩定且跨任務適用的偏好可以保存到 Memory；每個 Session 都會改變執行方式的簡短規則，放進 AGENTS.md；只有部署、遷移或審查等特定工作才需要的完整流程，放進 Skill 或專門文件；跨 Session 的目前目標和決策放進 Spec 或 Ticket；只在某個子問題上需要的搜尋，則可交給 Subagent。這不是格式規定，而是減少資訊載入和更新衝突的實用分法。

當資訊從一個位置複製到多份文件時，更新責任就容易分散。例如某套 lint 規則同時寫在 AGENTS.md、Skill 和部署手冊，修改其中一份後，其他版本會悄悄失效。應保留一個權威內容，再讓其他文件用 Context Pointer 指向它。引用本身也需要維護：重新命名檔案後，檢查指標是否仍有效；工具升級後，確認流程指令是否仍被支援。

記憶也要避免保存祕密、暫時性工作狀態或無法確認的推測。記錄前先問：未來重用這件事會省下什麼？它可能何時失效？接手者能從哪裡核對？若找不到可靠答案，就先不要當成穩定記憶保存。定期刪除過期內容，比持續在末尾追加新句子更能保持指引可信。

## 檢查引導系統是否真的生效

先從一項重複出現的問題開始，不必先重寫所有指令。確認 Agent 曾經缺少什麼資訊，找出最適合保存它的層級，再在新 Session 測試整條路徑。例如加入部署 Context Pointer 後，確認 Agent 是否知道部署工作要讀手冊，連結是否有效，手冊是否包含現行環境的步驟。

若規則仍常被忽略，先查它有沒有被載入、是否被其他規則覆蓋，以及它是否被不相關內容淹沒。不要先把同一條規則重複寫進多份文件。重複規則會在更新時分歧，Agent 也可能無法判斷哪份才是現行做法。找出一個權威位置，再由其他層級提供指向。

Memory、AGENTS.md、Skill、Spec 和 Subagent 報告的用途不同。Memory 延續少量可重用資訊；AGENTS.md 放普遍且簡短的約束；Progressive Disclosure 和 Context Pointer 安排何時讀取詳細內容；Skill 教特定任務如何做；Spec 和 Ticket 保存可跨 Session 查閱的工作意圖；Subagent 把獨立探索整理成可回讀的報告。把它們按載入時機和更新責任分開，才有辦法讓 Agent 在需要時找到資訊，也知道何時要回到原始證據。

本文對應《Dictionary of AI Coding》固定快照的 [Section 6 — Memory and Steering](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/internal/Curriculum.md#section-6--memory-and-steering)，並參考其 [Memory system](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/Memory%20system.md)、[AGENTS.md](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/AGENTS.md.md)、[Progressive disclosure](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/Progressive%20disclosure.md)、[Context pointer](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/Context%20pointer.md)、[Skill](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/Skill.md) 和 [Subagent](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/Subagent.md) 詞條。開放格式可參考 [AGENTS.md](https://agents.md) 和 [Agent Skills specification](https://agentskills.io/specification)；Codex 特定行為請查當前的 [Agent Skills 文件](https://developers.openai.com/codex/skills) 與 [Subagents 文件](https://developers.openai.com/codex/subagents)。產品載入規則會隨工具與版本改變。本文依詞條重組為教學，不是逐句翻譯。
