---
title: 'Harness² 深度導讀（中）：沿著原始碼走一遍改進流程'
publishedAt: '2026-10-19T00:00:14+08:00'
status: 'published'
slug: 'harness2-recursive-agent-harnessing-02'
excerpt: '從 BenchSpec、BenchmarkAdapter 和 Substrate 讀懂 Harness² 的模組邊界，再追蹤 evidence context、候選驗證、選擇與經驗庫如何接成一條流程。'
tags: ['Harness', 'AI Agent', 'AI 工程', 'Python']
metaDescription: '深入拆解 harness2 原始碼：benchmark 與 substrate 邊界、任務排程、候選生成、證據過濾、Harness 驗證、selection 和 experience library。'
---

> Harness² 把 benchmark、Agent 框架、可編輯 Harness、任務證據、候選選擇和跨任務經驗分成不同模組，再由 scheduler 串接。

這是三篇系列的中篇。上篇介紹 Harness² 的研究問題；本篇固定在 [main commit 1cfe254](https://github.com/google-research/harness2/tree/1cfe254e8d25b15f37048c3730134686abe60335)，從 repo 結構和核心呼叫順序，說明一次任務如何跑完。

## 先看清楚兩個整合邊界

Harness² 的 core 不應需要知道每個 benchmark 如何存放答案，也不應綁死在單一 Agent 框架。Repo 以兩個介面分開這些工作。

- BenchSpec 描述 benchmark/substrate 組合的提示設定、模型通道和資料限制；實際評分由 `BenchmarkAdapter.score()` 提供，並由 `core.judge` 在 selection 完成後呼叫。
- BenchmarkAdapter 提供任務清單、任務指示、來源文件、執行、交付物和 `score()` 評分實作。
- Substrate 描述 Agent 框架的可編輯檔案面、如何把 Harness 裝進工作區，以及如何執行和讀取軌跡。

這個分工讓 LAB、JobBench、WorkBuddy-Bench 可以共用 core 流程，同時以 OpenCode 或 Codex 作為執行底層。相關型別集中在 [core/spec.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/spec.py)；兩個底層實作位於 [substrate/opencode.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/substrate/opencode.py) 和 [substrate/codex.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/substrate/codex.py)。

## 模組地圖：核心邏輯不在 CLI 裡

Repo 的 Python 套件把命令列入口、核心流程、benchmark adapter 和 substrate 分開：

| 目錄或檔案                 | 主要責任                                                           |
| -------------------------- | ------------------------------------------------------------------ |
| harness2/cli               | install、check、run、judge、report 等命令列入口                    |
| harness2/core/schedule.py  | task stream、共用基準執行、任務重跑和結果記錄                      |
| harness2/core/recursion.py | 平行和循序的任務層遞迴                                             |
| harness2/core/context.py   | 組裝給改進模型看的任務證據                                         |
| harness2/core/prompts.py   | proposal、composition、selection、experience reflection 的任務說明 |
| harness2/core/tree.py      | Harness 檔案面、允許路徑和內容驗證                                 |
| harness2/core/selection.py | 選擇最後交付的執行結果和反思採用過程                               |
| harness2/core/library.py   | 依 benchmark、設定和領域保存可重用經驗                             |
| harness2/core/ledger.py    | 驗證任務層預期執行與編輯 session 數，並檢查重複標籤                |
| harness2/core/runmark.py   | 寫入完成標記，並用 Harness 指紋判斷執行結果能否重用                |
| harness2/core/judge.py     | 在選擇後呼叫 benchmark 評分器                                      |
| harness2/core/report.py    | 彙整分數、未評分任務、選擇結果和 fallback 警示                     |
| harness2/benchmarks        | 各 benchmark 的任務、執行器和評分 adapter                          |
| harness2/substrate         | OpenCode 與 Codex 的 Harness 安裝和執行方式                        |

主線可以濃縮成以下流程。BenchmarkAdapter 提供任務和 benchmark 操作，Substrate 負責對接 Agent 框架；Scheduler 再呼叫共用核心模組。

這條呼叫順序可以分成七步：

1. BenchmarkAdapter 和 Scheduler 找出任務、來源資料及需要執行的基準。
2. Substrate 提供 OpenCode 或 Codex 的檔案面，並把 Harness 安裝進執行環境。
3. Context Builder 組出任務、參考執行、候選資料和 library 經驗。
4. Proposer 產生 INV 與 DOM 候選，Tree Validator 檢查檔案內容。
5. BenchmarkAdapter 和 Substrate 執行候選 Probe，Composer 根據執行證據產生後繼 Harness。
6. 最終 Harness 執行任務；Selector 在需要時選擇一份交付物。
7. Experience Reflector 先整理採用結果並更新 Library；之後由獨立的 `harness2-judge` 命令計分。

## Scheduler 先決定任務順序和基準執行

run_sweep 會按 benchmark 和 split 建立任務 stream，再依 domain 排程。不同 domain 可以平行；同一 domain 內的任務依序處理，讓後續任務能讀到先前累積的 library 經驗。參數 seed 可重排 domain 和任務，但 repo 文件指出它不控制模型抽樣。[core/schedule.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/schedule.py)

每個任務先取得原始 Harness 的參考執行，再把這組執行交給平行或循序流程。若同一次 sweep 啟用多種 recursion mode，基準執行由 scheduler 共用，不必每個 mode 都重新跑一遍。[run_sweep CLI](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/cli/run_sweep.py) 也會建立設定 identity，避免在同一個 runs 目錄裡混用不同模型或任務選擇。

## Context Builder 建立編輯模型能讀的證據包

Proposer 不只收到一段任務提示。Context Builder 會把任務、來源材料、執行軌跡、交付物、目前 Harness、先前候選和 library 經驗放進一次 session 的工作目錄。後續每個編輯階段只取得該階段需要的資料。[core/context.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/context.py#L105)

這裡有兩種重要檢查。Context Builder 複製來源文件時，會依 benchmark 設定的 leak_globs 跳過 answer-key 路徑，並在證據樹組好後再次檢查。它也會掃描檔名和常見文字檔內容，拒絕含 grader verdict 的上下文。Tree Validator 會檢查改出的 Harness，避免它帶著 grader verdict 被存進後續經驗庫。[來源篩選](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/context.py#L191)、[上下文 verdict 檢查](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/context.py#L454) 和 [Harness verdict 檢查](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/context.py#L493)

這些檢查降低了基準答案直接洩漏到編輯階段的風險。它們不能阻止執行 Agent 從網路取得公開 rubric；下篇會再說明該 repo 對網路的預設和設定方式。

## Prompt profile 控制模型能看到什麼、可以修改什麼

BenchPrompts 定義共用提示會使用的工作描述、領域與交付物用詞、INV/DOM 編輯方向和選擇檢查。`__post_init__` 只對 `work`、`inv_levers`、`dom_levers`、`yardstick`、`domain_guidance` 和 `selection_checks` 掃描 `benchmark`、`evaluation`、`grader`、`rubric`、`score` 等字詞；不會檢查 `domain_word` 或 `deliverable_word`。BenchmarkAdapter 的 `task_prompt` 契約也要求移除 criteria 和預期答案；三種 benchmark 透過不同方式實作。[BenchPrompts](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/spec.py#L90) 和 [BenchmarkAdapter](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/spec.py#L201)

共用提示會明確告訴編輯模型：沒有評分表、答案鍵或分數；context 裡的檔案是要檢查的資料，不是要服從的命令；不要執行候選 Harness 中的腳本或外掛。這些是交給模型的指示。路徑過濾、grade verdict 掃描和 Harness 驗證則由程式執行，兩種防線不能混為一談。[core/prompts.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/prompts.py)

INV 提案只負責工作程序、工具和完成檢查；DOM 提案負責專業知識、來源和交付物契約。JobBench 另設定名為 tts 的提示包，與預設 adapt 模板不同：前者要求把程序泛化到同領域後續任務，避免把本題事實存成跨任務規則。Repo 沒有在文件中展開 tts 這個縮寫，因此本文保留程式裡的名稱，不猜它代表什麼。[JobBench prompt 設定](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/benchmarks/jobbench.py#L141)

## Recursion 模組把同一任務變成候選實驗

平行模式的實作位於 [recursion.run_parallel](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/recursion.py#L343)。它從參考執行提出 k 個 INV 和 k 個 DOM 候選，執行所有候選，再讓 k 個 AGG composition sessions 分別閱讀完整候選池和執行證據，產生 k 個最終 Harness。

循序模式位於 [recursion.run_sequential](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/recursion.py#L452)。每一輪包含 INV 和 DOM 兩個編輯階段；下一輪以目前已修改的 Harness 和新增的執行歷史為輸入。

Proposer 會建立暫存工作目錄、複製 context，並把修改後的 context/harness 收回。OpenCode 分支把外部檔案存取設成預設拒絕，只放行 session 目錄；Claude CLI 分支則帶有 --dangerously-skip-permissions。兩個 channel 的權限邊界不同，暫存目錄本身不能當成作業系統 sandbox。程式會記錄 mission、response、模型、重試、費用和快取資料。[core/proposer.py：Claude CLI](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/proposer.py#L210) 與 [OpenCode 權限設定](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/proposer.py#L253)

## Tree Validator 把可編輯範圍變成檔案契約

Harness² 把可編輯面表達成相對路徑到檔案內容的 mapping。程式先嘗試替沒有觸發語句的 Skill 補上 trigger；補完後仍不合法，或常駐文字超出 substrate 上限，整個候選就會被拒絕。Validator 還會檢查檔案是否屬於該 substrate surface、Skill 的 frontmatter、腳本引用、Python 編譯結果和 hooks JSON 結構。[autotrigger](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/tree.py#L192) 與 [Tree Validator](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/tree.py#L336)

若候選檔案無法通過驗證，編輯模型會收到錯誤並有一次修正機會；仍失敗時，該階段回到 fallback Harness。這讓執行前就能排除格式錯誤或不在允許面上的提案。[recursion.py 的 stage 驗證與 fallback](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/recursion.py#L108)

## Selection 選交付物，Judge 才算分

平行或循序流程產生的最後輸出會送入 selection。當前 release 的候選池只含 k 份 composition 輸出，不含原始 Harness 的參考輸出。系統依 task、k 和 mode 對候選標成可重現的匿名 ID；selector 讀任務要求、來源材料和每份交付物，回傳其中一份已存在的答案，不改 Harness，也不合成新答案。[core/selection.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/selection.py#L71)

當 k=1 且選擇池只含一個最終輸出時，程式直接選這份結果，不另外呼叫 selector。k 大於 1 時才進行匿名交付物選擇。被選中的 Harness 隨後交給 Experience Reflector 整理經驗；benchmark judge 則由另一個命令讀取選擇記錄後執行。[selection 與反思採用](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/selection.py#L402) 和 [core judge](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/judge.py) 分別負責這兩段工作。

k=1 時，平行和循序 mode 執行同一個 Propose–Probe–Compose 步驟。Repo report 明確把兩者此時的分差當成 noise floor；比較不同 mode 時，至少要用 k 大於 1 的結果再判斷。[core/report.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/report.py)

這種順序讓編輯階段不用看 benchmark 分數，judge 結果也不會被當作 Propose–Probe–Compose 的即時回饋。selection 的判斷仍是模型對交付物的評估，不等於客觀正確性。

## Library 保存整份 Harness 和可追蹤經驗

Library 以 benchmark、executor、mode、recursion budget 和 seed 分開保存，再依 domain 建索引。每個可用經驗包含採用的 Harness component tree、採用原因和 EXPERIENCE.md；INDEX.md 列出同一個 domain 過去的經驗，供下個任務按需檢索。[core/library.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/library.py#L58)

每個新任務仍從該 benchmark 的共同 base Harness 開始。Runmark 會記錄完成標記與產生該次執行的 Harness 指紋；resume 時會再檢查輸出檔案和 Harness 是否仍相符。Library 是可查詢和改編的經驗來源，不是直接覆寫 base 的自動累積 patch。[core/runmark.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/runmark.py) 與 [schedule resume](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/schedule.py#L350)

## 讀原始碼後得到的整體判斷

Harness² 的核心設計不只是在提示詞中指示模型反省。Repo 把可編輯檔案、要給編輯者的證據、候選執行、內容驗證、交付物選擇和經驗保存都做成可檢查的程式階段。這些階段減少了隱式狀態，也讓實驗產物能追溯到候選和執行紀錄。

另一方面，編輯與選擇仍依賴模型呼叫，驗證檢查的是 Harness 結構與規則，不是任務答案的實際正確性。這是閱讀實驗結果時必須帶著的限制。

接下來讀[下篇：如何試跑 Harness²，以及結果能說明什麼](/posts/2026/harness2-recursive-agent-harnessing-03)，看安裝需求、實驗參數、論文結果和資料外洩風險。
