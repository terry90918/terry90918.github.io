---
title: 'Harness² 深度導讀（下）：如何試跑、讀懂結果與評估限制'
publishedAt: '2026-10-19T00:00:14+08:00'
status: 'published'
slug: 'harness2-recursive-agent-harnessing-03'
excerpt: '從免模型 demo 開始試跑 harness2，再用小型 benchmark 任務確認設定；最後拆解論文結果、額外成本、評分方式和網路隔離要求。'
tags: ['Harness', 'AI Agent', 'AI 工程', 'Benchmark']
metaDescription: '說明 Harness² 的安裝和小型實驗方式，整理三個 benchmark 的論文結果、recursion 成本、模型評估和網路資料外洩限制。'
---

> 試跑 Harness² 要分清楚三件事：能安裝、模型能呼叫、以及 benchmark 分數值得相信。

這是三篇系列的下篇。[上篇](/posts/2026/harness2-recursive-agent-harnessing-01) 說明 Harness² 的兩層遞迴；[中篇](/posts/2026/harness2-recursive-agent-harnessing-02) 沿著原始碼追蹤一次任務；本篇整理如何安全地開始小型實驗，再判讀論文結果可以支持哪些結論。

本文依據 [repo main commit 1cfe254](https://github.com/google-research/harness2/tree/1cfe254e8d25b15f37048c3730134686abe60335) 的 README、setup、benchmark 和 experiment guide，以及 [arXiv 論文 v1](https://arxiv.org/html/2610.14224v1)。下列分數是論文報告結果，不是本機重跑數字。

## 先用不呼叫模型的 demo 熟悉流程

Repo 建議使用 Linux、Python 3.12 和 uv。基本安裝完成後，harness2-demo 會用確定性的編輯器和實際 Python 執行示範平行與循序兩種模式，不需要模型憑證。

```bash
uv venv --python 3.12 .venv
source .venv/bin/activate
uv pip install -e '.[render]'
harness2-demo --output runs/demo --k 2
```

這個 demo 適合先看輸出目錄和資料流程。它不代表模型供應商連線、benchmark 依賴、真實任務效果或評分器都已驗證。[README Install](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/README.md#install)

## 模型實驗先選一個 benchmark、一個小範圍

模型實驗使用額外推論呼叫，會產生 API 成本。Repo 預設的 Vertex 組態需要 Node.js 20 以上、Google Cloud CLI、Vertex AI 專案與模型設定，以及 Application Default Credentials；使用其他供應商時要設定對應憑證。LAB 需要 Pandoc 和 Poppler；WorkBuddy-Bench 需要 Docker。以 LAB 為例，完成憑證設定和安裝後，先跑檢查，再限制到一個 domain、一項任務：

```bash
harness2-setup lab
harness2-check --bench lab
harness2 --bench lab --k 1 --mode parallel --only-domains antitrust-competition --max-tasks 1
harness2-judge --bench lab --k 1 --mode parallel
harness2-report --bench lab --k 1 --mode parallel
```

三種 benchmark 分開安裝；先讀 [setup guide](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/docs/SETUP.md) 和 [benchmark guides](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/docs/BENCHMARKS.md)，只設定要跑的那一種。

--dry-run 可以預覽選到哪些 task 和 domain，不會呼叫模型。harness2-check 會檢查安裝、憑證和設定，但不測試模型是否真的可用；模型可用性是在第一次呼叫時才確認。Codex substrate 的 check 也仍會要求 pinned OpenCode checkout 和 Bun。Codex preflight 只檢查 URL 格式、key 設定、binary 和 TCP 可連，不證明 API key 或模型推論可用。模型名稱、執行器、subset、k、mode 和 seed 必須在 refinement、judge 和 report 間一致。[experiment guide](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/docs/EXPERIMENTS.md) 和 [preflight.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/preflight.py)

完整 task list 不在 Python package 內；adapter 會從安裝好的上游資料目錄動態找出任務。論文表格列的是特定 held-out split，不代表任意新安裝或全量模式會自動選到相同題目。重現 paper 結果要保存 task split 和外部資料版本。[task discovery](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/benchmarks/tasks.py) 與 [split_tasks.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/scripts/split_tasks.py)

## k 增加的是候選與執行量

k=1 代表做一次 Propose–Probe–Compose。平行模式的 k=K 會提出 K 個 invariant 和 K 個 domain-specific 候選，再產生 K 份 composition。循序模式則沿著同一份 Harness 串接 K 次改進。

Repo 的 ledger 和 run-sweep 說明都把每個 mode 的核心預算列為 4k 次 executor rollout 和 3k 次 improver session：k 次共用 base、2k 個候選、k 個 final，以及 k 組 INV、k 組 DOM、k 次 composition。當 k 大於 1，selector 還會比較候選交付物；採用後，experience reflection 也會增加改進流程呼叫。因此這不是所有設定下的完整帳單。[ledger.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/ledger.py) 和 [run_sweep 說明](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/cli/run_sweep.py)

平行執行可以縮短等待時間，無法減少同一預算下所需的模型計算。從 k=1、小範圍開始，再記錄每次執行的模型、任務、subset、設定和費用，會比較容易判斷效果來自哪裡。

比較不同模型或 task selection 時，使用不同的 HARNESS2_RUNS_DIR。Repo 會把模型與任務設定存進 run identity，避免把不相容的結果接續到舊目錄。JobBench 資料集在下載時解析 revision，重現結果時要一併記下所用 revision。[experiment guide：cost 與 reproducibility](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/docs/EXPERIMENTS.md)

## 論文報告的提升要連同評分方式一起讀

論文比較 Gemini 3.5 Flash 和 GLM-5 兩種凍結執行模型，分別使用 OpenCode 與 Codex 初始 Harness。主表中的 Harness² 是 k=1；+ Recursion 是平行模式 k=5 相對於 k=1 的分數變化。表格是三次獨立 task-stream 的平均與標準差，每次任務順序都有打亂。[論文 §3.1–3.2](https://arxiv.org/html/2610.14224v1)

| Benchmark                    | 論文測試集與評分方式                                           | k=1 的最大增幅 |
| ---------------------------- | -------------------------------------------------------------- | -------------: |
| WorkBuddy-Bench              | Code 40、Web 35、Office 25；隱藏檢查加上 LLM/VLM 評分          |        11.5 分 |
| JobBench                     | 34 項 held-out 任務；Claude Opus 4.8 依加權 rubric 評分        |         4.5 分 |
| Harvey Legal Agent Benchmark | 100 項 held-out 法律任務；Claude Sonnet 4.6 評估每項 criterion |  11.8 個百分點 |

WorkBuddy-Bench 的平均分是三個領域的 macro-average；JobBench 分數使用它自己的加權評分；LAB 報告 Partial，也就是 criteria 通過率。LAB 的 11.8 是百分點，不是相對增幅 11.8%。最大增幅也不代表每一個模型、Harness 或 benchmark 都有同樣幅度。

論文的單步改進在四種執行模型與 Harness 配置中，對三個基準都比各自的 base harness 高分。平行模式 k=5 相對 k=1 的額外增幅最高為 WorkBuddy-Bench 3.9 分、JobBench 4.2 分、LAB 6.7 個百分點。這些是論文實驗的平均結果；論文呈現三次 task-stream 的平均和標準差，沒有因此證明普遍統計顯著性。

Repo 的 benchmark adapter 會決定每種任務實際送進 proposer 和 selector 的資料。JobBench 的 task prompt 來自 TASK_INSTRUCTIONS.txt，rubric 和 expected/reference 路徑由 leak_globs 排除。LAB adapter 會從 task.json 移除 criteria，任務指示最多取 12,000 字元。WorkBuddy 的 code、web、office 分別使用 rule、LLM judge 和 rubric 評分，並套用各 subset 的資料路徑限制。[JobBench adapter](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/benchmarks/jobbench.py)、[LAB adapter](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/benchmarks/lab.py)、[WorkBuddy adapter](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/benchmarks/workbuddy.py)

從 adapter 程式可見，selector 看到的交付物文字不一定和 judge 讀取的檔案視圖完全相同。LAB 對交付物文字設有 60,000 字元上限，但 judge 讀取完整檔案；WorkBuddy renderer 會把目前沒有 binary handler 的格式（例如 docx、pdf）顯示成檔案 stub。這是原始碼指出的評估風險推論，不是論文報告的實驗結論。[LAB deliverable reader](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/benchmarks/lab.py) 和 [WorkBuddy renderer](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/benchmarks/wb_render.py)

Judge 回傳 None 代表評分失敗，core/report 會把這些列標成 ungraded 並排除於分數分母，不會補成 0。JobBench scorer 優先使用加權 total/max；上游細節缺少 max 時，會退回未加權的 criteria 比例，report 會提示同一份報表可能混有不同單位。報表也會提示 fallback 和 k=1 兩種 mode 的雜訊底線；解讀自己的 run 時要一起看這些欄位和逐 task 記錄。[core/judge.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/judge.py)、[JobBench scorer](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/benchmarks/jobbench.py#L592) 和 [core/report.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/core/report.py)

對照方法也影響解讀。Meta-Harness 可以用 train/dev tasks 離線搜尋；Harness² 在 test stream 中逐題調整。論文也有某些配置下的 LAB 分數低於 Meta-Harness。因此適合寫成「論文在所測配置中觀察到提升」，不能延伸成「任何 Agent 換上 Harness² 都會提升」。[論文 Tables 1–2 與 Appendix C](https://arxiv.org/html/2610.14224v1)

## Repo 的安全預設需要你補上網路限制

Repo 的 experiment guide 說明，執行器網路存取預設不受限制，公開 benchmark rubric 可能從網路取得。JobBench 會公開 RUBRICS.json；WorkBuddy 和其他 benchmark 資料也可以從公開來源下載。因而，benchmark 評分隔離答案，不代表 Agent 執行時完全碰不到評分資料。

官方建議完成 setup 後，在執行器的網路層限制 Hugging Face、GitHub 和 raw.githubusercontent.com 等 benchmark 來源。Repo 的 Codex runner 明確帶上略過 approval、sandbox 和 hook trust 的參數，不能把 Codex 執行當成受 sandbox 隔離。若用 WorkBuddy 的 Docker container 連 Codex bridge，bridge 要綁定 0.0.0.0；這會擴大可連入的網路介面，需限制可連入的用戶端。[experiment guide：web access](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/docs/EXPERIMENTS.md#web-access)、[Codex substrate](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/substrate/codex.py) 和 [setup guide：Codex executor](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/docs/SETUP.md#codex-executor)

第三方 runner 也需要一併納入信任範圍。Repo 固定 LAB、JobBench、WorkBuddy 和 OpenCode 的 upstream commit，再套用自有 runtime patches；這些 runner 並不是核心方法的同一段程式。部分 JobBench baseline component 檔案是 provenance 註明的 placeholder，不是可用的 plugin 或 helper script。[dependencies/PINNED.md](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/dependencies/PINNED.md) 列出版本與 patch 用途；[JobBench provenance](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/third_party/jb_runner/PROVENANCE.md) 列出 baseline 檔案性質。[check_provenance.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/scripts/check_provenance.py) 會核對 47 個 runner、設定、license 和 patch 的雜湊；本文沒有執行該檢查。

目前 checkout 的 tests 目錄只有一個 workflow 檔，五個測試用 DemoAdapter 和 mock proposer 驗證核心流程的部分合約；它沒有執行 benchmark adapters、upstream patches 或 vendored runners。[tests/test_workflow.py](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/tests/test_workflow.py)

Repo 的 README 也說明，這不是 Google 正式支援的產品。主程式使用 [Apache 2.0](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/LICENSE)，third_party 程式、benchmark 和資料集沿用各自授權。WorkBuddy-Bench 在 pinned license 中明列「不適用於歐盟境內使用」的地域限制，也要求修改檔案標示變更。下載或散布前要先讀 [third-party notices](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/dependencies/README.md) 和 [pinned WorkBuddy-Bench license](https://github.com/Tencent/workbuddy-bench/blob/b516950be5b56eb3be406c2f76ee1c5111dcb57f/LICENSE)。[README disclaimer](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/README.md#disclaimer)

另有一個需要產物 readback 才能確認的打包疑點：third_party 文件稱 runner 會包進 wheel；但 MANIFEST.in 列的是 harness2/third_party，實際來源目錄是 repo root 的 third_party，Python package discovery 也只包含 harness2\*。這是靜態檔案路徑不一致的風險線索，本文沒有建 wheel，不能斷言發行包缺檔。[MANIFEST.in](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/MANIFEST.in)、[pyproject.toml](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/pyproject.toml) 和 [third_party README](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/third_party/README.md)

## 目前還不能從結果推論什麼

論文自己的限制指出，候選比較靠軌跡差異與模型判斷，容易受到執行變異和共同偏誤影響；採用的編輯不保證正確，也不保證能轉移到新任務。提高 k 會增加 executor 和 editor 推論量，平行處理只能在資源足夠時縮短 latency，不能免除計算成本。

另一個重要界線是 seed。Repo 的 seed 用來重排任務 stream，不會固定模型抽樣。重跑同一個 seed 有助於維持任務順序，無法單獨讓模型輸出完全可重現。[experiment guide：reproducibility](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/docs/EXPERIMENTS.md#reproducibility)

Experience library 目前是帶索引的存檔。論文把合併重複元件、更新過期經驗、改善檢索和自動調整 recursion budget 列為未來方向。這表示長期使用時，經驗庫的品質和大小仍是需要觀察的變數。[論文 Appendix F–G](https://arxiv.org/html/2610.14224v1)

## 三篇讀完後，怎麼判斷它適不適合你的問題

如果你在研究 Agent 如何從自己的執行紀錄調整工作方式，Harness² 提供一個可以讀、能配置、也能用 benchmark 檢查的研究框架。它把提案、試跑、組合、選擇和跨任務記錄拆成明確階段，適合分析「Agent 的工作系統能否隨任務改善」。

開始使用時，先完成本機 demo，再挑一個 benchmark、少量 domain 和一項任務。保留清楚的模型與資料設定、隔離可公開取得的答案來源，再決定是否值得擴大 k 或 task stream。讀結果時，把論文平均值、獨立重跑、額外推論成本和評分器可信度一起看。

本系列依固定 repo commit 1cfe254 和論文 v1 整理。Repo 或論文更新後，安裝步驟、實驗數字和風險都要按新版本重新核對。
