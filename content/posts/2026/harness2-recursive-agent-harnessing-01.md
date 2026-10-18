---
title: 'Harness² 深度導讀（上）：Agent 如何改造自己的工作系統'
publishedAt: '2026-10-19T00:00:12+08:00'
status: 'published'
slug: 'harness2-recursive-agent-harnessing-01'
excerpt: '先從研究問題讀懂 Harness²：模型權重固定，系統透過執行證據改進任務用的 Harness，也改進未來改進 Harness 的方式。'
tags: ['Harness', 'AI Agent', 'AI 工程', 'GitHub']
metaDescription: '用白話拆解 Google Research harness2 的研究問題、Propose–Probe–Compose、平行與循序遞迴，以及跨任務經驗庫。'
---

> Harness² 讓 Agent 從任務執行紀錄中修改工作系統，並把有證據支持的改法留給後續任務。

這是三篇系列的上篇，先談 Harness² 想解決什麼問題，以及它的兩層遞迴如何運作。中篇會沿著原始碼走一遍，說明每個模組如何串起來；下篇會談安裝、實驗、成本和限制。

本文依據 [google-research/harness2](https://github.com/google-research/harness2/tree/1cfe254e8d25b15f37048c3730134686abe60335) 在 2026 年 10 月 18 日可讀到的 main commit，以及 2026 年 10 月 9 日提交的 [Harness² 論文 v1](https://arxiv.org/html/2610.14224v1)。文中的實驗數字是論文報告值，這裡沒有重跑 benchmark。

## Harness 包住模型的工作環境

可以把模型想成一位能讀指示、操作工具、交付成果的工作者。模型本身不會自動知道任務資料放在哪裡、能用哪些工具、何時該讀技能，或完成後怎麼檢查結果。這些工作條件要由模型周圍的系統提供。

這套系統就是 Harness。它可以包含常駐指示、限制規則、記憶、工具使用方式、技能、腳本、子代理和外掛。Harness² 把這些拆成可編輯的檔案面向，讓改進流程能針對觀察到的問題動手，而不是把所有修改塞進一段提示詞。

| 可編輯面向                        | 對 Agent 工作的影響                    |
| --------------------------------- | -------------------------------------- |
| system prompt、guardrails、memory | 說明工作方式、限制和需要持續記住的資訊 |
| tool guidance、scripts            | 指引工具用法，或把可重複操作交給腳本   |
| skills                            | 在指定情境載入較完整的工作規則         |
| subagents                         | 把可委派的工作交給另一個 Agent         |
| middleware plugin                 | 在工具呼叫或回覆流程中加入行為         |

可用面向會依底層 Agent 框架改變。Repo 同時有 OpenCode 和 Codex substrate；例如 OpenCode 有 plugin 面向，而 Codex surface 沒有。Harness² 固定模型權重，改的是模型執行任務時使用的外層系統。[論文 §2.1 與 Appendix D.3](https://arxiv.org/html/2610.14224v1) 說明八種面向；[OpenCode surface](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/substrate/opencode.py) 和 [Codex surface](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/harness2/substrate/codex.py) 則列出各自能編輯的檔案。

## 開放世界讓 Harness 難以一次設計好

如果每種任務都已知，而且每題都有可靠答案或測試，系統可以用正確率挑出最好的 Harness。真實工作通常不是這樣：新任務會持續出現，需求和資料也會變動；編輯 Harness 的當下，未必有標準答案能告訴系統哪個改動正確。

另一個困難是，為單一任務量身設計的規則可能只對那題有效。把上一題的整套 Harness 直接套到下一題，容易把前一題的特殊假設一起帶過去。

Harness² 把改進分成兩個相連的層次：

1. 任務層遞迴改善目前任務使用的 execution harness。
2. Harnessing 層遞迴整理改進過程中的證據，更新下一個任務可使用的 improvement harness。

這裡的「遞迴」不是模型反覆改寫自己的權重。任務層改的是當前執行環境；Harnessing 層改的是後續改進時能查閱的 Harness 和經驗。

## Propose–Probe–Compose 用執行差異引導修改

一次基本改進包含三步。

### Propose：先提出兩種不同方向

系統先讓原本的 Harness 執行任務，留下工具軌跡和交付物。接著產生兩類候選編輯。

- Invariant 候選處理跨領域可能重複的流程缺陷，例如規劃、工具使用、上下文管理和委派。
- Domain-specific 候選處理目前領域的專業知識、操作程序或環境限制。

兩種角色看的是同一任務，但負責不同範圍。這個分工讓「Agent 工作方式需要改進」和「領域知識需要補上」不會混成同一份泛用規則。

### Probe：在相同任務中測試候選 Harness

系統把候選 Harness 放回同一個任務執行，並將它們的軌跡與原始執行相比。比如，修改後是否讀了所有輸入、是否用了工具驗證產出的檔案、是否產生新的錯誤。

這種比較能顯示編輯帶來的行為變化，卻不能證明交付物正確。模型可能隨機走出不同軌跡，也可能在基準任務和編輯過程中共享相同盲點。論文明確把執行對照視為改動證據，而非真值驗證。[論文 §2.2.1](https://arxiv.org/html/2610.14224v1)

### Compose：只把有根據的修改組合起來

Composer 讀取原始執行、候選執行、Harness 差異和候選編輯者的說明，再產生一份後繼 Harness。它可以合併兩種候選的修改、修正衝突、採用其中一個，也可以保留原樣。最後，系統再用組合出的 Harness 執行任務。

這一步讓候選不只是比賽選出一個贏家。若兩種修改分別處理流程和領域知識，Composer 可以把證據支持的部分組合起來；如果證據不支持改動，也能保留原本設計。

## 平行探索寬度，循序探索深度

參數 k 控制任務層探索量。兩種模式有不同的計算結構。

平行模式先取得 k 次原 Harness 執行，再提出 k 個 invariant 與 k 個 domain-specific 候選。候選跑完後，k 個 Composer 各自讀取完整候選池和執行證據，產生 k 份後繼 Harness。論文指出，這是一輪 population update，所以 k 增加的是同一輪探索寬度。

循序模式則連做 k 次 Propose–Probe–Compose。每一輪把前一輪產生的 Harness 和累積的任務軌跡交給下一輪。它沿著一條修改路徑持續修整，後面的步驟有機會保留或撤回前面的編輯。

平行比較多條候選路線，循序沿著已修改的 Harness 往下修。兩者都需要更多執行與模型呼叫；下篇會拆解成本。

## Harnessing 層記錄改進方法

一題結束後，系統會整理原始執行、候選提案、Probe 結果、Composer 決定和最後採用的輸出。Experience Reflector 只在軌跡差異支持時，才把可重用的做法寫進 improvement library。

每筆經驗包含一份 Harness 和 EXPERIENCE.md，記錄適用情境、觀察到的效果與支持證據。下一題仍從共同的初始 Harness 開始；改進流程可以檢索舊 Harness 的元件或經驗，再依新任務調整。前一題專屬的完整執行環境不會自動覆蓋下一題的起點。[論文 §2.3](https://arxiv.org/html/2610.14224v1)

## 一個 JobBench 案例看見兩層修改的分工

論文舉出一個職場文件任務：原始 Agent 能產出成果，但沒有把數字在不同來源檔案間核對，也沒有在寫完後重新打開成品檢查。基準評分是 43.1。

Invariant 編輯加入通用的作業規則：盤點所有輸入、追蹤數字來源，並用驗證腳本重新檢查產出檔案。Domain-specific 編輯增加排程、場地、人力和預算資料的核對方式，也處理特定數字格式。Composer 保留兩邊合計四項修改，重跑後得分升至 77.8。

這個例子顯示，錯誤可能來自工作流程，也可能來自領域操作；兩者可以各自提出、分別測試，再組合成一套 Harness。43.1 到 77.8 是論文中的單題案例，不是整個 JobBench 的平均增幅。[論文 Appendix E.7](https://arxiv.org/html/2610.14224v1)

## 看懂 Harness² 必須保留證據界線

Harness² 的改進依據是軌跡和交付物的對照。它不會在編輯階段取得 benchmark 的正確答案，再直接照分數修改 Harness。論文的 benchmark judge 會在候選選定後用來做評估；這個評估數字不等於前面的 Probe 證據。

因此，Harness² 提供的是受證據約束的修改流程，不是正確性保證。被採用的 Harness 可能仍產生錯誤；有證據支持的經驗也未必能移轉到不同任務。論文把執行變異、模型共同偏誤和額外推論成本列為明確限制。[論文 Appendix F](https://arxiv.org/html/2610.14224v1)

上篇先建立這個心智模型：Harness² 要讓 Agent 的工作系統和改進方法逐步累積，但每次改動仍需檢查證據和結果。接下來讀[中篇：拆開 Harness² 原始碼](/posts/2026/harness2-recursive-agent-harnessing-02)，看這套流程實際落在哪些模組。
