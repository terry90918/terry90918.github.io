---
title: 'pstack 中篇：任務如何經過 23 份 Playbook 與 24 個原則'
publishedAt: '2026-10-18T23:18:34+08:00'
status: 'published'
slug: 'cursor-pstack-workflow-design-guide'
excerpt: '用一個 bug 和一個功能示範 pstack 如何選流程；再逐項整理 23 份 playbook 的用途，以及 24 個原則如何改變工程決策。'
tags:
  - cursor
  - ai-agent
  - developer-tools
  - agent-workflow
metaDescription: 'pstack 中篇以實際任務走讀 poteto-mode，分析 23 份 playbook、24 個原則及路由分界，說明流程要求何時需要工具與真實證據。'
---

[上篇](/posts/2026/cursor-pstack-plugin-analysis)整理了 pstack repo 的零件。這篇把鏡頭放在工作時的順序：Agent 收到任務後怎麼選流程、何時載入其他技能、最後需要什麼證據。

本文使用 [pstack 0.15.26 固定版本](https://github.com/cursor/plugins/tree/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack)。/poteto-mode 提供一份路由入口，底下有 23 份任務流程。Agent 會挑其中一份，再按步驟需要讀取原則或專門技能。不是 23 份都會在一次任務裡執行。

![pstack 任務路徑圖：入口路由到 playbook，再使用技能、原則和委派提示，最後以真實證據驗證；Benny 位於獨立的自動化路徑](/images/cursor-pstack/pstack-task-flow.svg)

## 先看路由器要判斷什麼

同一句「幫我看看這裡」，可能代表解釋現況、重現缺陷、增加功能、調整結構或量測效能。這些工作需要不同證據。pstack 把差異寫進 playbook，減少 Agent 一上來就改程式的機會。

最重要的分界是：

| 使用者要做的事                        | 常見路由          | 路由後要回答的問題                         |
| ------------------------------------- | ----------------- | ------------------------------------------ |
| 只想知道程式怎麼運作                  | Investigation     | 哪些檔案與執行路徑能證明答案？             |
| 找出正在發生的 CPU、記憶體或 UI 現象  | Runtime forensics | 是否取得當下的 profile、trace 或實際觀測？ |
| 分析已存在的 profile 或 heap artifact | Trace forensics   | 固定資料能支持什麼結論？                   |
| 修正已報告的錯誤                      | Bug fix           | 原始問題能否先重現，修後是否消失？         |
| 增加或改變外部行為                    | Feature           | 新行為的資料形狀、邊界和完成條件是什麼？   |
| 只改內部結構                          | Refactoring       | 原本行為如何被固定並證明沒變？             |
| 設計選項尚未確定                      | Prototype         | 哪個便宜實驗能讓選項變得可比較？           |
| 單次修正已量到效能問題                | Perf issue        | 同一工作負載的前後差異是多少？             |
| 長時間優化一個數值                    | Hillclimb         | 每輪假設是否只改一件事，提升是否超過噪音？ |

「任務種類」會決定「完成證據」。如果把 Runtime forensics 和 Bug fix 混在一起，Agent 可能只分析 trace，卻沒修使用者看到的問題；如果把 Refactoring 和 Feature 混在一起，實作過程就可能順手改變行為。

## 用一個 bug 看流程怎麼運作

假設使用者回報：「畫面閒置時，列表每 750 毫秒就往下跳一點。」一份有用的請求還會補上頁面、資料、重現步驟和完成條件。pstack 的範例也把「先重現，再修復並驗證」放在 /poteto-mode 的任務描述裡。

### 1. 先選 Bug fix，不先猜改哪一行

poteto-mode 判斷使用者描述的是已知缺陷，而非新需求，便挑選 [Bug fix playbook](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/bug-fix.md)。流程把「先重現」放在「開始修改」前面。

如果相同頁面、相同輸入無法重現，Agent 手上只有一個推測，還沒有修 bug 的基線。它要先找環境差異、操作方式或缺少的觀測資料，不能把加一個 guard 或重寫 timer 當成已驗證修復。

### 2. 用證據縮小可能原因

假設 Agent 找到畫面更新、計時器和列表捲動三個可能入口。它先沿呼叫路徑讀程式，記錄哪些事件真的發生，再逐步排除假設。這時 [Fix root causes](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-fix-root-causes/SKILL.md) 會把選擇導向「找第一個把狀態弄錯的地方」，而不是在畫面最後加一層保護。

若仍不清楚系統怎麼組成，/how 能解釋執行路徑；若問題轉成「這個 timer 為何這樣設計」，/why 才去找歷史理由。這兩個問題需要不同來源，程式現在有某個 timer 只能證明現況，不能單靠它推斷作者當時的動機。

### 3. 只在設計確實有分岔時先設計

若修正只需要取消一個已確認的錯誤排程，主 Agent 可以直接選最小修正。若修改會跨越列表狀態、虛擬化元件和資料更新契約，才適合呼叫 /architect 釐清型別、介面和責任，再委派實作。

委派時，poteto-agent 是程式撰寫與輔助任務的子代理設定。它要求子代理先完整閱讀 poteto-mode，並指出自己只負責父 Agent 指定的檔案或任務。這能減少子代理漏掉路由規則，但實際能不能寫檔仍由宿主給的工具和權限決定。

### 4. 修完後重跑原本的重現步驟

Agent 不應只報「測試通過」。它要在原介面重新操作相同資料，確認列表不再自行跳動，再跑受影響的測試、檢查 diff 和必要的下游呼叫者。原始 bug 重現和自動測試各自提供不同證據。

如果沒有啟動 UI 或取得所需資料的能力，流程只能說明受阻在哪裡。測試全部通過，不會自動等於閒置跳動已經消失。

這條路徑的重點是讓每一步都保留一個可追問的答案：**觀察到什麼、為什麼排除其他原因、修了哪裡、用什麼動作證明修好。**

## 再用一個功能看路由改變之處

假設目標是「替報表增加 CSV 匯出，但現有畫面和 JSON 匯出不能改變」。這次不是修已知缺陷，所以路由到 [Feature playbook](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/feature.md)。

Feature 先要求理解現有報表和呼叫者，再釐清資料形狀、欄位來源、空值與 CSV escaping 等規則。架構尚未確定時用 /architect；能平行的切片要明確指定 owner、檔案和介面，避免兩個 Agent 同時改同一資料模型。最後的驗收條件至少要能回答：CSV 內容如何檢查，舊 JSON 和畫面如何證明不變。

如果資料格式或欄位需求還沒決定，原型或問題釐清先於批量實作。Playbook 的作用是依工作來安排選擇，而不是替使用者猜產品需求。

## 23 份 playbook 分別處理哪類工作

| Playbook                                                                                                                                                      | 何時使用與它安排的工作                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [investigation](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/investigation.md)         | 只讀問題。沿原始碼或歷史來源整理答案；若問題轉成實作，重新選流程。                            |
| [bug-fix](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/bug-fix.md)                     | 已回報缺陷。先在相同介面重現，確認機制，再修並重跑原情境。                                    |
| [perf-issue](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/perf-issue.md)               | 已量到的單次效能問題。抓基線、定位 trace 上的原因，再比較前後。                               |
| [hillclimb](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/hillclimb.md)                 | 持續逼近一個數值目標。固定量測工具，每輪只測一項假設，提升要超過噪音。                        |
| [runtime-forensics](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/runtime-forensics.md) | CPU、記憶體、UI 異常正在發生。從執行中 profile、trace 或 instrumentation 診斷，交付原因分析。 |
| [trace-forensics](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/trace-forensics.md)     | 已有 profile、trace、spindump 或 heap snapshot。查詢 artifact 並映射回程式符號。              |
| [feature](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/feature.md)                     | 新增或改變行為。先理解現況、資料形狀與工作分工，再實作與驗收。                                |
| [refactoring](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/refactoring.md)             | 只改結構。先固定既有行為，移動呼叫者、刪除舊路徑，最後證明結果等價。                          |
| [prototype](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/prototype.md)                 | 先用便宜、可丟棄的產物回答設計問題；結果不是可交付實作。                                      |
| [visual-parity](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/visual-parity.md)         | 比較兩套 UI 是否像素一致。鎖定 baseline，不允許靠修改基準消除差異。                           |
| [authoring-a-skill](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/authoring-a-skill.md) | 編寫或修改技能。檢查 frontmatter、觸發條件、引用和實際行為。                                  |
| [eval](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/eval.md)                           | 比較提示或技能變更是否改變行為。用盲測任務、匿名輸出和具體 rubric。                           |
| [babysit](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/babysit.md)                     | 追蹤 PR 或 stack 到可審查、CI 可過的狀態；可選持續、背景、只處理 review 或單次檢查模式。      |
| [shipping](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/shipping.md)                   | 使用者要求落地 PR stack。逐個取得獨立驗證，從底部合併連續已驗證項目，再讀回 forge 狀態。      |
| [autonomous-run](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/autonomous-run.md)       | 使用者明確授權長時間自主執行。先寫可檢查完成條件、設定停點和工作紀錄。                        |
| [orchestrate](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/orchestrate.md)             | 多日、多 PR 或大量 Agent 的專案。用 coordinator、worker、verifier 和持久帳本管理隊列。        |
| [autopilot-full](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/autopilot-full.md)       | 使用者授權完整落地多個獨立 PR。每個 PR 有 owner，另有獨立驗證和合併裁決。                     |
| [autopilot-stack](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/autopilot-stack.md)     | 自動建立與驗證線性 PR stack，但把最後落地留給操作者。                                         |
| [session-pickup](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/session-pickup.md)       | 接手先前 Agent 或 chat 的工作。先重建紀錄，再核對目前 branch、PR 和真實產物。                 |
| [pause-safely](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/pause-safely.md)           | 使用者明確要求安全暫停。停新工作、保存接手資訊，讓後續能從一致狀態恢復。                      |
| [multi-phase-plan](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/multi-phase-plan.md)   | 跨階段或多 PR 工作。產生有依賴、檔案範圍與逐項驗收條件的計畫，並檢查格式。                    |
| [opening-a-pr](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/opening-a-pr.md)           | 建立聚焦的 PR，統一 branch、commit、標題、正文與驗證說明。                                    |
| [worktree-cleanup](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks/worktree-cleanup.md)   | 盤點並回收安全可刪的 worktree 和模擬器資料；動手前確認沒人使用且沒有未提交工作。              |

這張表是用途索引，不是執行權限表。Playbook 寫了「不得合併」不代表 API token 不能合併；它描述 Agent 應採取的行為。確切的外部權限在每個工具和服務端仍要另外配置。

## 24 個原則如何改變選擇

/poteto-mode 內有原則索引，每一條指出「何時適用」。真的套用某一原則時，路由器要求 Agent 讀該原則的完整 SKILL.md。原則作用在決策點，通常不會自己建立 CI 或封鎖命令。

| 原則                                                                                                                                                                                                  | 觸發時，它應改變哪個選擇                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [attack-the-premise](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-attack-the-premise/SKILL.md)                                             | 兩次以上共用前提的修正卡在同一 gate 時，先寫下前提並直接檢查它，不再盲目試第三種修法。      |
| [boundary-discipline](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-boundary-discipline/SKILL.md)                                           | 接觸未信任資料時，在 CLI、設定、網路和 API 邊界解析；內部邏輯使用已驗證型別。               |
| [build-the-lever](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-build-the-lever/SKILL.md)                                                   | 非小型重複工作先學會一個單位，再做可重跑的 script、generator 或 skill，讓檢查不用手工重來。 |
| [encode-lessons-in-structure](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-encode-lessons-in-structure/SKILL.md)                           | 同一提醒反覆出現時，優先改架構、型別、lint 或 runtime check，減少靠人記得的文字規則。       |
| [exhaust-the-design-space](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-exhaust-the-design-space/SKILL.md)                                 | 新型互動或無先例架構決策先做 2–3 個比較方案；原則沒有提供評分器，需另定觀察方式。           |
| [experience-first](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-experience-first/SKILL.md)                                                 | 在 UX 或範圍取捨時優先把核心流程做好，必要時先用原型檢查選項。                              |
| [explain-the-number](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-explain-the-number/SKILL.md)                                             | 報告或依據效能數字行動前，確認瓶頸、錯誤、快取和工作確實發生，並保留分布資料。              |
| [fix-root-causes](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-fix-root-causes/SKILL.md)                                                   | 除錯先重現，再找系統第一次做錯的地方，避免在症狀處加 guard 把證據藏掉。                     |
| [foundational-thinking](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-foundational-thinking/SKILL.md)                                       | 寫邏輯前先定核心資料形狀、型別和共享狀態，讓下游介面由資料結構決定。                        |
| [guard-the-context-window](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-guard-the-context-window/SKILL.md)                                 | 大量輸出或重複讀檔快塞滿上下文時，把工作切片，把大批資料交給子代理並只取回摘要。            |
| [laziness-protocol](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-laziness-protocol/SKILL.md)                                               | 想加抽象或改結構時先檢查是否能刪除或縮小變更；它偏向最小可用 diff。                         |
| [make-operations-idempotent](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-make-operations-idempotent/SKILL.md)                             | 設計可重試命令時，確認重跑或從中斷狀態繼續會收斂到相同結果。                                |
| [migrate-callers-then-delete-legacy-apis](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md)   | 新 API 取代舊 API 時盤點呼叫者、一起遷移並移除舊路徑；先確認沒有外部相容承諾。              |
| [minimize-reader-load](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-minimize-reader-load/SKILL.md)                                         | 程式難懂時檢查追到答案要經過幾層、讀者要記住多少隱藏狀態，再移除不必要包裝。                |
| [model-the-domain](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-model-the-domain/SKILL.md)                                                 | 狀態和分支重複時用有領域意義的結構表示，避免多處條件各自假設資料形狀。                      |
| [never-block-on-the-human](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-never-block-on-the-human/SKILL.md)                                 | 可逆且容易檢查的工作先用合理預設完成；不可逆或只能由使用者決定的事仍停下來。                |
| [outcome-oriented-execution](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-outcome-oriented-execution/SKILL.md)                             | 多階段遷移以目標架構收斂，不為了中間狀態長期保留過渡實作。                                  |
| [prove-it-works](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-prove-it-works/SKILL.md)                                                     | 要宣稱完成前查看實際產物或執行真實功能，不用「編譯了」或 Agent 自述代替證據。               |
| [redesign-from-first-principles](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-redesign-from-first-principles/SKILL.md)                     | 新需求進入舊系統時，先想需求若自始存在，整個設計會長什麼樣。                                |
| [separate-before-serializing-shared-state](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-separate-before-serializing-shared-state/SKILL.md) | 平行工作可能寫同一狀態時，優先分開 writer 和目標；只有必要共用時才加序列化。                |
| [sequence-verifiable-units](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-sequence-verifiable-units/SKILL.md)                               | 長流程拆成每單位都可驗證的步驟，通過再做下一個。                                            |
| [subtract-before-you-add](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-subtract-before-you-add/SKILL.md)                                   | 加新功能或重構前先刪死碼、重複檢查和無用 stub，再建立較簡單的方案。                         |
| [test-behavior-not-implementation](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-test-behavior-not-implementation/SKILL.md)                 | 測試要檢查呼叫者或使用者能觀察的結果，不鎖死內部呼叫順序。                                  |
| [type-system-discipline](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/principle-type-system-discipline/SKILL.md)                                     | 讓型別表達領域有效狀態、解析外部資料並檢查所有變體，減少「相信自己」的 cast。               |

這 24 個名稱是路由提示，不是 24 個自動檢查。它們的價值在於提醒主流程「現在該用哪種判斷方式」。像 type-system-discipline 只有落到型別和編譯器錯誤時，才真的讓某些錯誤寫不出來；像 prove-it-works 要求拿實際結果驗證，但能不能做到仍看環境有沒有測試資料和操作工具。

## 讀 playbook 時要同時找三種資訊

每份流程至少要看三件事：

1. **觸發條件。** 是使用者明確要求，還是系統可以依任務判斷？
2. **所需能力。** 是否需要 Task 子代理、MCP、GitHub CLI、live UI、trace 或使用者帳號？
3. **停止條件。** 證據不足時是停住、回報受阻，還是流程允許用次佳證據？

這三點決定 playbook 在你的環境是否真的可用。文字提到功能，不會自動把功能裝進 Cursor；外部服務可用，也不代表它們的帳號授權是最小範圍。

如果把提示流程當成程式，playbook 就是工作步驟，但 Skill 觸發條件像路由表，原則像決策規則，scripts 是其中少數可重跑的檢查。**它仍然不是作業系統或 GitHub 的保護層。**

---

[下一篇：逐項解析 pstack 的一般技能、代理提示、自動化素材和程式檢查](/posts/2026/cursor-pstack-prompt-analysis)
