---
title: 'Matt Pocock 的 Agent Skills 外掛：38 份提示詞逐項解析'
publishedAt: '2026-10-15T11:25:36+08:00'
status: 'published'
slug: 'mattpocock-skills-prompt-analysis'
excerpt: '以固定原始碼快照拆解 Matt Pocock 的 Agent Skills：安裝範圍、呼叫方式、38 份技能提示，以及它們的流程、依賴和限制。'
tags:
  - ai-agent
  - developer-tools
  - software-engineering
  - prompt-engineering
metaDescription: '逐檔分析 mattpocock/skills 的 38 份 SKILL.md，說明哪些隨外掛發布、提示詞如何分工、會產生什麼副作用，以及它們無法保證什麼。'
---

## 本文分析的範圍

Matt Pocock 的 [skills repository](https://github.com/mattpocock/skills) 把工程與一般工作流程寫成 agent 可載入的技能。它不是一個獨立執行的 coding agent：主要內容是 Markdown 提示詞、每個 harness 的呼叫 metadata、供技能引用的模板與少量腳本。

本文固定在 2026 年 10 月 15 日看到的 main commit [49dd158](https://github.com/mattpocock/skills/tree/49dd158d1076134a641b33efb035946536778336)。該快照的 Claude Code plugin manifest 版本為 1.3.1。下文把 38 份 SKILL.md 全部列出，逐一說明觸發情境、核心流程和設計限制。技能旁的輔助文件會在最後按用途分析；它們不是額外的 slash skill。

README 把這套技能描述為小型、可改寫、可組合的工程方法，目標是改善需求誤解、冗長回覆、缺乏回饋和程式結構惡化等問題。這些是作者提出的設計理由，並非公開的效能評估。原始碼可以證明提示詞要求 agent 做什麼，不能單靠提示詞證明它真的執行、結果正確或比其他做法更快。[README 的設計主張](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/README.md#L11-L19) [plugin manifest](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/.claude-plugin/plugin.json)

## 38 份技能，不等於 38 份都隨外掛安裝

| 目錄         |   數量 | 發布狀態                         |
| ------------ | -----: | -------------------------------- |
| engineering  |     20 | 正式技能，隨外掛發布             |
| productivity |      7 | 正式技能，隨外掛發布             |
| in-progress  |      7 | 公開測試，沒有包含在預設外掛     |
| misc         |      4 | 不推廣且已凍結，不包含在預設外掛 |
| **合計**     | **38** | 其中 27 份屬於正式外掛           |

Repo 提供多種安裝路徑，包括 Claude Code、Codex、GitHub Copilot、Gemini CLI 和 skills.sh。依安裝方式不同，更新可能自動發生，也可能需要重新執行安裝命令。README 特別提醒，同一個 agent 不要同時用 plugin 和 skills.sh 複製版，否則同一套技能會出現兩份。[各 agent 安裝說明](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/README.md#L23-L79)

「整個 GitHub repository」與「正式發布的外掛」必須分開看。外掛 manifest 只列 engineering 和 productivity 的 27 份。in-progress 是作者公開徵求回饋的 beta；misc 保留給少數使用者，但維護政策已凍結。README 也沒有列出所有 repository 內容：in-progress 索引列 6 個技能，實際目錄有 7 個，少了 chief-of-staff。[manifest 技能清單](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/.claude-plugin/plugin.json) [in-progress 索引](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/in-progress/README.md#L1-L16) [範圍與維護政策](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/SCOPE.md#L3-L18)

## 提示詞如何互相呼叫

這套技能沿著「誰能啟動」分成兩類。User-invoked 技能只能由使用者明確呼叫，負責路由、編排或等待決策；model-invoked 技能可以由使用者呼叫，也可以由 agent 在工作符合條件時選用。這個快照中 38 份技能有 23 份 user-invoked、15 份 model-invoked；正式外掛的 27 份中，兩類分別是 16 和 11。

每份技能旁都有 Codex UI metadata。User-invoked 技能同時以 Claude Code 的 disable-model-invocation 和 Codex 的 allow_implicit_invocation 關閉自動呼叫。模型可用的技能則保留較豐富的觸發描述。repo 規則也禁止技能透過另一個 user-invoked 技能繼續路由；需要組合時，提示詞會明確呼叫可由模型選用的 skill。[呼叫規則](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/.agents/invocation.md#L1-L22)

所以它不是一個總控流程把每個任務都送進同一條管線，而是多個人手入口與可重用方法組成的技能圖。ask-matt 專門回答「該用哪一份」；setup 記錄每個 repository 的 tracker、標籤和文件路徑；其餘技能按各自的工作目的被選用。這種分層減少每份提示詞重複寫整套規則，代價是路由表、呼叫關係和 metadata 都要維護同步。

## Engineering：20 份

### 1. ask-matt

它是人手呼叫的技能路由器，先看任務類型，再帶使用者找到對應入口、流程或共用詞彙。它也處理一個工作階段到了階段邊界時該繼續、清空上下文、交接、派子代理或壓縮摘要。ask-matt 自己不完成所選工作，價值取決於路由表是否跟其他技能同步；新增或改名技能而漏更新它，會造成錯誤指引。[流程與 phase 邊界](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/ask-matt/SKILL.md#L15-L40) [phase 規則](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/ask-matt/PHASE-BOUNDARIES.md#L17-L55)

### 2. code-review

它從指定基準點檢查 diff，並把審查拆成兩條平行工作：一條看是否符合 repo 標準，另一條看是否符合原始 spec。分開後，審查者比較不會只看功能完成與否就忽略程式品質，或只挑風格問題而漏掉需求缺口。沒有原始 spec 時，第二條路徑無法成立；更值得注意的是，子代理提示沒有明確禁止再啟動 code-review。repo 文件記錄過遞迴派生大量代理的回報，提示本身沒有解決這項風險。[雙軸流程](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/code-review/SKILL.md#L34-L89) [repo 記錄的遞迴風險](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/docs/engineering/code-review.md#L59-L65)

### 3. codebase-design

這份技能提供 module、interface、depth、seam 和 adapter 等共同詞彙，讓其他技能用同一套標準討論模組邊界、測試入口和依賴關係。它強調以小介面包住大量行為，並透過刪除某個模組的思考實驗檢查它是否真的有價值。共用詞彙能減少討論漂移，但「何時才算 seam」包含作者的強烈設計偏好，不應當成適用所有架構的定理。[設計詞彙與原則](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/codebase-design/SKILL.md#L10-L65) [deepening 參考](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/codebase-design/DEEPENING.md#L5-L37)

### 4. diagnosing-bugs

它適用於難以定位的 bug、回歸或效能問題，不是遇到錯誤就先猜根因。流程要求先讓症狀進入一個可重跑的紅燈回饋迴圈，再重現、縮小案例、列可反駁假說、加入觀測、修正並補回歸測試，最後移除診斷用殘留。這條流程能抑制「先改一個看起來合理的地方」；如果環境無法建立可重跑的回饋，嚴格 gate 也會讓工作停滯。提示詞另要求對觀測資料遮蔽 secrets。[診斷階段](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/diagnosing-bugs/SKILL.md#L18-L66) [觀測與清理](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/diagnosing-bugs/SKILL.md#L68-L138)

### 5. domain-modeling

它處理領域用語、glossary 和架構決策記錄。Agent 要先查看現有定義，再用具體例子和邊界情境釐清模糊詞，對照程式實際行為，定義穩定後才更新文件。ADR 只保留未來會困惑、重要且有真實取捨的決策。這能讓知識跨 session 延續，但 glossary 和 ADR 會被直接修改，模型提出的邊界案例仍是待使用者確認的假設。[工作方式](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/domain-modeling/SKILL.md#L42-L74) [文件格式](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/domain-modeling/GLOSSARY-FORMAT.md#L25-L60)

### 6. grill-with-docs

這是一份很短的編排提示，會呼叫 grilling 和 domain-modeling 兩個技能，讓使用者在 repo 內釐清計畫時同步建立領域語彙和 ADR。它把共用訪談和寫文件的原則留在被呼叫的技能，避免複製兩套規則。實際互動與檔案修改都由兩個依賴技能決定，因此沒有 Skill tool 或缺少其中一份技能時，這個入口本身做不了多少事。[呼叫組合](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/grill-with-docs/SKILL.md#L1-L7)

### 7. implement

它把已決定的 spec 或 ticket 交給實作流程：取回 ticket 並先說明標題，在預先約定的 seam 使用 TDD，定期跑型別檢查和單一測試，最後跑完整測試、code-review，再 commit 到目前 branch。這是務實的短流程，但「commit 到目前分支」是具體的 Git 副作用，也沒有要求先確認目前 branch 是否符合專案慣例。呼叫者不能只因為有這份 skill，就忽略倉庫和操作者對 commit 的規範。[實作步驟](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/implement/SKILL.md#L2-L17)

### 8. implement-spec

這份技能把整份 spec 和 tickets 視為依賴圖，在一個 integration branch 上推進。可執行的 ticket 會各自交給實作者，依賴解除後再擴張工作 frontier；完成後收回變更、整合、跑完整驗證與 code-review。若 tracker 以 PR 關閉工作，或使用者要求 PR，它會在第一次合併後建立 draft PR；流程也會建立 worktree 和 branch，整合時要處理衝突與 ticket 狀態。平行數量不是免費的速度提升。[任務圖與整合流程](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/implement-spec/SKILL.md#L13-L40)

### 9. improve-codebase-architecture

它掃描 codebase 中可能加深模組邊界的地方，產生帶圖表的 HTML 報告，再由使用者選一個候選進入討論。流程先調查再選題，限制 agent 直接大範圍改架構；但輸出依賴瀏覽器、CDN 和 Mermaid 報告模板，調查結果也不代表那些重構真的值得做。作者把它定位為架構盤點，不是替老舊程式自動清淤。[掃描流程](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/improve-codebase-architecture/SKILL.md#L18-L71) [報告模板](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/improve-codebase-architecture/HTML-REPORT.md#L1-L17)

### 10. pr

它規定 PR 內文先用最小摘要說明變更，再放前後差異證據，最後交代變更的可逆性和 blast radius。依主題選圖、樹、diff 或偽碼，而不是硬塞固定格式。這能讓審查者快速建立變更模型；但 prompt 只幫忙組織內文，不能替代 CI、真實 readback 或合併判斷。[PR 內容框架](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/pr/SKILL.md#L12-L70)

### 11. prototype

它先判斷要回答的是邏輯／狀態問題，還是畫面／互動問題，再選不同原型方式。原型以快速可觀察為主，明確允許不寫測試、不補正式錯誤處理，並要求成果保持可丟棄，選定方向後重新實作。這有效區分「先確認方向」和「正式功能」，但如果 prototype route、switcher 或臨時程式沒有清乾淨，就可能混進產品程式。[分流規則](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/prototype/SKILL.md#L2-L26) [UI 變體與清理](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/prototype/UI.md#L14-L30)

### 12. research

它要求把研究交給 background agent，追查官方文件、原始碼、規格或第一方 API，並把帶來源的發現寫成 repo 內一份 Markdown。這讓研究結果可交接、可核對，適合較長的讀取工作；提示本身沒有定義引用格式、矛盾來源怎麼處理或時間敏感資料何時重查，品質仍取決於執行者如何取證。[研究任務契約](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/research/SKILL.md#L2-L12)

### 13. retro

Retro 不檢討產品功能，而是從一次 coding session 找出 agent 環境可改善之處，例如導航、檢查、規範、工具效率和資料可見性。它要求回看 session 的原始紀錄，依嚴重程度提出建議，不會自動改設定。這能把重複失誤轉成 lint、程式結構或資料來源改善；如果沒有完整 transcript，結論容易流於猜測，也可能為一次性失誤過度調整工作環境。[分析流程](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/retro/SKILL.md#L9-L44)

### 14. setup-matt-pocock-skills

這是工程技能的 per-repository 初始化。它先讀 remote、指令檔、glossary、ADR、既有設定和 monorepo 訊號，再讓使用者選 issue tracker、標籤和 domain 文件位置；展示 draft 並得到確認後才寫檔。這種「把會變的設定留在 repo 文件，不改共用技能本身」是整套設計的關鍵。它會改 CLAUDE.md／AGENTS.md、docs/agents，某些情況也會透過 CLI 建立 tracker labels；兩者並存時固定優先選 CLAUDE.md 的邏輯可能不符合實際使用的 harness。[探索與確認步驟](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/setup-matt-pocock-skills/SKILL.md#L19-L36) [設定寫入](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/setup-matt-pocock-skills/SKILL.md#L63-L118)

### 15. tdd

它把測試當成模組介面的一部分：先約定可觀察的 seam，再一次寫一個會因正確原因失敗的測試，以 red-green-refactor 推進。tests 和 mocking 參考檔進一步排除只驗證實作細節的測試、過度 mocking 和橫向切片。這比只要求「測試先行」具體得多；但每個測試 seam 都要先和使用者確認，簡單變更也可能多一輪互動。[TDD 流程](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/tdd/SKILL.md#L12-L38) [測試判準](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/tdd/tests.md#L3-L23) [mock 邊界](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/tdd/mocking.md#L1-L18)

### 16. to-spec

它把已經討論過的內容整理成 spec，發布到設定好的 issue tracker，不重新訪談整個需求。它會讀 repo glossary 和 ADR、提出測試 seam、讓使用者確認，再套入固定的問題、方案、故事、決策和範圍模板。能省下重複對話，但如果輸入本來模糊，整齊的 spec 可能讓未驗證的假設看起來像定案；而建立 issue 和加標籤是外部寫入。[流程與輸出模板](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/to-spec/SKILL.md#L7-L74)

### 17. to-tickets

它把計畫或 spec 拆成可獨立驗收的 tracer-bullet tickets，明列依賴，依 tracker 設定建立 issue 或本機 Markdown。提示要求切垂直 end-to-end slices、讓使用者調整後才寫入，也要求不要順手修改 parent issue。它將工作變成依賴圖，有利於分工；切得太細或沒有依 codebase 風險排序時，票本身會增加維護成本。[切票與寫入](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/to-tickets/SKILL.md#L15-L68)

### 18. triage

Triage 把 issue 或符合設定條件的外部 PR 放進小型狀態機，每筆要有一個類別和一個狀態。Agent 查完整討論、程式是否已有相同行為、過去拒絕紀錄，再提出建議等維護者決定；需要時才重現、grill 並寫 agent brief。它會發留言、改標籤、關閉 issue、更新 out-of-scope 知識庫，因此 prompt 內的「先建議再等方向」是重要控制點，不是客套流程。[狀態和處理步驟](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/triage/SKILL.md#L24-L45) [外部狀態與寫入](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/triage/SKILL.md#L56-L90)

### 19. wayfinder

Wayfinder 用於目標清楚但決策路徑仍有霧的大型工作。它建立一張 map issue 作索引，子 ticket 各自承載一項決策，以 tracker 的 blocking edge 建 frontier，並把還不能精確描述的部分留在 fog。預設先規劃、不直接做完目標；一個 session 最多解決一張 ticket，研究票例外可平行。這避免假裝一次列出完整計畫，但會大量建立、指派、更新和關閉 issue，適合長期專案，不適合小改動。[Map 與 ticket 設計](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/wayfinder/SKILL.md#L19-L71) [每次 session 的邊界](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/wayfinder/SKILL.md#L103-L128)

### 20. wizard

Wizard 把「必須由人完成」的 dashboard 操作、憑證設定或一次性切換，整理成互動式 bash wizard。Agent 先列完整步驟和資料去向，使用者確認後才產生腳本，再交給人執行。隨附 template 有隱藏輸入、環境檔和 GitHub secrets 寫入 helper。這個分工讓 agent 不必代替使用者輸入敏感資料；腳本仍可能寫錯 repo 或 secret 名稱，因此靜態檢查要對照實際部署流程。[Wizard 流程](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/wizard/SKILL.md#L16-L44) [shell template](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/wizard/template.sh#L106-L179)

## Productivity：7 份

### 21. grill-me

它是沒有 repo 寫入需求時的訪談入口，只呼叫共用 grilling 技能。把提問規則集中在一個 primitive，避免 grill-me 和 grill-with-docs 產生兩套版本；這份 wrapper 本身不保存文件，也不定義訪談細節。[呼叫內容](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/productivity/grill-me/SKILL.md#L1-L7)

### 22. grilling

Grilling 把計畫拆成有先後依賴的決策樹，每輪一次提出目前所有可回答的問題，每題附推薦答案，等使用者回答後再展開下一輪。環境事實由 agent 查，決策留給使用者；所有分支都確認後才算共識完成。它避免把待決事項混在一起，但「一次列出整個 frontier」可能形成很長的問題清單，推薦答案也可能對使用者產生錨定。[提問迴圈](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/productivity/grilling/SKILL.md#L6-L30)

### 23. handoff

Handoff 將對話整理成新 agent 可接手的短文件，存到作業系統暫存目錄，並引用既有 spec、diff、issue 等產物而不重複複製。它要求遮蔽敏感資料，也會列建議技能。它不會自行啟動接手者；暫存檔跨設備或稍後是否仍可取用，也要看執行環境。[文件範圍與儲存位置](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/productivity/handoff/SKILL.md#L2-L16)

### 24. teach

Teach 把目前資料夾當成跨 session 的學習工作區，先確認學習目標和可信資料來源，再依已知程度安排課程、練習和回顧。Mission、resources、glossary、lesson、learning record 各有輸出格式，並要求用已證明的理解調整後續難度。它把學習背景留存下來，但會新增多種長期檔案；單次問答若不需要持續課程，整套結構可能過重。[學習工作區](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/productivity/teach/SKILL.md#L10-L21) [教學節奏與紀錄](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/productivity/teach/SKILL.md#L47-L95)

### 25. to-questionnaire

當某個決策需要另一個人提供答案時，它會先釐清問卷寄給誰、需要對方回覆什麼，再把問題整理成 Markdown，可在會議中使用或非同步填寫。它不讓 agent 假扮收件人回答，也不會代替使用者寄出問卷。這明確切開「我能整理問題」和「我知道答案」；若收件人與情境資料不足，問卷仍可能不適合直接傳送。[問卷流程與格式](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/productivity/to-questionnaire/SKILL.md#L12-L54)

### 26. wait-what

當使用者表示前一則回答沒有講清楚時，這份技能要求補上必要背景，用簡化英文和 glossary 詞彙重講。它只改寫上一則內容，不會自動補查缺失事實或確認讀者是否理解；固定要求 ASD-STE100 也未必適用中文或每種專業語境。[提示內容](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/productivity/wait-what/SKILL.md#L1-L7)

### 27. writing-for-agents

它用在撰寫 skill、AGENTS.md、CLAUDE.md 和 agent 會依指標讀取的文件，要求按讀者上下文安排資訊、控制 cognitive load、設置完成條件，並在重複內容出現時拆分或刪減。它也把 pointer 文件視為 prompt 的一部分，因為前置指令會影響 agent 是否載入目標文件。這是通用寫作準則，不是自動驗證器；另外，內容中要求減少否定句，repo 自身提示卻大量使用 never/don't，呈現出規則和寫法的張力。[寫作原則](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/productivity/writing-for-agents/SKILL.md#L10-L80) [skill-specific mechanics](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/productivity/writing-for-agents/SKILL-MECHANICS.md#L1-L22)

## Misc：4 份，不隨正式外掛發布且已凍結

### 28. git-guardrails-claude-code

它建立 Claude Code hooks，在危險 git 操作執行前攔截。跟單純文字規則不同，hook 是實際執行的 guardrail；但它用字串與 regex 偵測命令形式，不能因此視為完整的 shell 安全政策，未涵蓋的寫法仍可能通過。安裝會改 project 或 global Claude 設定，而 misc 維護已凍結。[hook 設定流程](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/misc/git-guardrails-claude-code/SKILL.md#L20-L95) [命令比對](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/misc/git-guardrails-claude-code/scripts/block-dangerous-git.sh#L3-L25)

### 29. migrate-to-shoehorn

這份技能把測試裡的 TypeScript as assertion 改成 shoehorn 提供的測試資料 helper，依情境選擇 partial 或刻意不完整的資料型態。會安裝套件、改測試並跑 typecheck，因此是程式碼遷移，不只是編碼風格建議。它的命令範例偏向 npm，凍結狀態也代表套件管理器和慣例可能已經過時。[遷移步驟](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/misc/migrate-to-shoehorn/SKILL.md#L97-L118)

### 30. scaffold-exercises

它替特定教學課程 repository 建立 exercise/section 目錄、README、問題和解答骨架，再用課程內 lint 規則檢查和重編號。流程高度具體，但也綁定 AI Hero 的目錄命名、pnpm CLI 和提交習慣；除非使用相近課程專案，不能把它當成通用 scaffold。[課程目錄和 lint 流程](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/misc/scaffold-exercises/SKILL.md#L27-L71)

### 31. setup-pre-commit

它安裝 Husky 和 lint-staged，將 Prettier、型別檢查和測試接到 commit 前。這會改 package scripts、hook 和 formatter 設定；若 repo 已有 prepare script 或 hook，不能照提示直接覆蓋，需先確認現有責任是否保留。每次 commit 都跑完整測試也會增加日常等待成本。此技能在 misc，所以作者不再承諾維護。[設定步驟](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/misc/setup-pre-commit/SKILL.md#L15-L85) [misc 維護界線](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/SCOPE.md#L14-L18)

## In-progress：7 份 beta，不隨正式外掛發布

### 32. chief-of-staff

它把 agent 定位成長期目標的負責人，同時協調眼前工作和下一輪環境改善，並建議安排週期任務。提示要求所有工作交給子代理，溝通盡量使用可持續的 context pointer。策略和戰術雙軌能保留長期視角，但「每個工作都派子代理」會增加成本，也可能把使用者一則普通需求轉成環境改造。[長期協調要求](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/in-progress/chief-of-staff/SKILL.md#L2-L45)

### 33. claude-handoff

它把對話摘要寫到暫存檔，再透過 claude --bg 啟動新的 Claude Code agent。提示特別用檔案傳 prompt，避免 shell 解讀摘要裡的反引號或變數，也要求遮蔽敏感資料。這比泛用 handoff 更自動，但完全依賴 Claude CLI、當前目錄和背景 agent 行為，無法直接搬到其他 harness。[handoff 命令和資料處理](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/in-progress/claude-handoff/SKILL.md#L2-L18)

### 34. loop-me

Loop-me 用訪談找出人生和工作裡反覆出現、適合整理成 workflow 的活動，再把規格存到 workflows/。它特別提醒不要先假設每個 workflow 都需要 AI、排程或人工 checkpoint。這比直接把流程自動化更能先釐清實際循環；代價是 NOTES.md 會逐步累積個人世界、工具和用語，屬長期脈絡資料。[工作流程與 workspace 規則](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/in-progress/loop-me/SKILL.md#L2-L32)

### 35. setup-ts-deep-modules

它安裝 dependency-cruiser，讓 TypeScript package 根目錄成為公開入口，阻止其他 package 直接 import 內部子目錄。提示會改相依、設定和 CI，新增示範 package，故意跑一次應失敗的 deep import，再確認 guardrail 能攔住它。它把架構原則接成可執行檢查；規則假設 package 不巢狀，現有 monorepo 若有不同邊界，需要先檢查是否適合。[設定和驗證流程](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/in-progress/setup-ts-deep-modules/SKILL.md#L37-L102)

### 36. writing-beats

它把已有素材寫成一段段 beat。先定義讀者一開始已掌握的概念，提供不同的開場，讓使用者選一個後只寫該 beat；每次讀回檔案，再提出下一段可走的方向。這把閱讀順序和概念引入也變成設計問題，但一段一段等確認，會大幅增加互動輪數；原始素材要先固定，才符合它的「exploit」模式。[逐 beat 流程](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/in-progress/writing-beats/SKILL.md#L2-L38)

### 37. writing-fragments

這是純探索寫作提示，收集可能保留在文章裡的片段，但不安排大綱或標題層級。它從第一句對話開始記錄，將不同想法以分隔線追加到同一個 Markdown 檔，寫入前要重讀以保留使用者編輯。它能避免過早收斂靈感；「默默追加」也可能讓作者沒注意到哪些對話被保存。[fragment 定義與寫入方式](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/in-progress/writing-fragments/SKILL.md#L7-L40) [追加規則](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/in-progress/writing-fragments/SKILL.md#L69-L77)

### 38. writing-shape

它把已整理好的 raw material 組成另一份文章，先確定讀者前置知識和不同開場，再逐段討論論旨、順序與表達形式，並立即寫入每個已決定的段落。它會重讀文章以保留人工修改，也把原始素材視為唯讀。這比一般潤稿更重視論證結構，但若文章方向已清楚，逐段辯論格式會拖慢完成速度。[文章 shaping 迴圈](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/in-progress/writing-shape/SKILL.md#L19-L79)

## 會影響技能行為的輔助提示

SKILL.md 不是唯一的提示內容。技能會引用共享的原則、模板和分支流程，這些文件會改變輸出格式、決策順序和副作用。

- **路由與呼叫規則。** ask-matt 的 phase boundaries 規定什麼時候清空、交接或派子代理；.agents/invocation.md 定義 user/model invocation 與跨 harness 的 Skill tool 呼叫方式。[phase 選擇](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/ask-matt/PHASE-BOUNDARIES.md#L17-L55) [invocation 規則](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/.agents/invocation.md#L1-L22)
- **架構和原型。** codebase-design 有 deepening 和多方案設計 playbook；prototype 分開 logic 與 UI 原型，UI 模式預設在既有 route 切換多個版本，結束後清掉失敗變體。[設計多方案](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/codebase-design/DESIGN-IT-TWICE.md#L7-L44) [logic prototype](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/prototype/LOGIC.md#L18-L67) [UI prototype](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/prototype/UI.md#L14-L54)
- **Tracker 和輸出格式。** Triage 用 agent brief 寫行為需求、驗收條件和 out-of-scope；setup 產生 per-repo tracker / label / domain 說明；domain-modeling 和 teach 的附檔分別規定 glossary、ADR、mission、資源和學習紀錄格式。[agent brief](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/triage/AGENT-BRIEF.md#L1-L37) [拒絕需求記錄](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/triage/OUT-OF-SCOPE.md#L1-L17) [ADR 格式](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/domain-modeling/ADR-FORMAT.md#L3-L37) [teaching mission](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/productivity/teach/MISSION-FORMAT.md#L1-L31)
- **TDD 和寫作。** TDD 的 test/mock 文件定義哪些行為算有效驗證；writing-for-agents 的 mechanics 檔補上 router 何時可呼叫其他技能、何時必須由使用者手動啟動的規則。[TDD 測試準則](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/engineering/tdd/tests.md#L3-L23) [寫作與呼叫 mechanics](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/skills/productivity/writing-for-agents/SKILL-MECHANICS.md#L1-L22)

這些輔助文件不是新的 slash command，但不能視為無關附件。Agent 只讀主 SKILL.md 而漏掉分支參考時，執行方式可能改變。相反地，openai.yaml 是 UI 和呼叫設定；腳本是可執行工具；人類閱讀用的 docs 頁面是說明資料。它們影響整體系統，卻不應和 SKILL.md 技能數量混為一談。

## 整套設計的強項與風險

### 強項：提示詞寫的是工作契約

許多技能不是籠統要求「做好一點」，而是指定使用情境、先後順序、輸入、完成條件與交付格式。Diagnosing-bugs 要求先做出紅燈回饋；TDD 要求一個行為測試一輪；triage 區分已實作、拒絕與資訊不足；wayfinder 把可決策和仍在霧裡的問題分開。這些規則讓工作更可追蹤，也比較容易指出 agent 是在哪個環節猜測。

### 強項：可以把會變的 repo 資訊移出共用技能

Setup 把 issue tracker、標籤和文件位置記在每個 repo 自己的設定文件裡，而不是為每種 tracker 複製一份 skill。Domain-modeling、to-spec、triage 和 wayfinder 再讀取這些設定。共用流程因此可以保持相同，但實際 tracker、標籤和術語由 repo 控制。代價是下游技能仰賴設定文件正確、最新，CLI 和 tracker 操作描述也可能隨產品演進而過時。

### 風險：自然語言不是權限系統

大部分要求仍由模型照文字執行。例如 triage 可以留言、改標籤或關閉 issue；implement 會 commit；implement-spec 會建立 branch、draft PR 和 worktree；setup wizard 會產生寫環境變數或 secrets 的腳本。提示詞可要求等待確認、遮蔽資料或限制範圍，但真正的存取控制要由 harness 權限、CLI 權限、branch policy、CI 和腳本實作提供。這套 repository 也包含真正的 hook，例如 Claude Code 的 git-guardrails，以及 pre-commit 或 dependency-cruiser 等檢查，但它們不等於所有 skills 都獲得相同強制力。

### 風險：嚴謹流程有固定成本

Grilling、TDD seam 確認、每次只完成一張 wayfinder ticket、完整診斷階段和多 agent review，都會增加互動或執行時間。這些成本適合高不確定性、高風險或會反覆發生的工作；一行修改或已決定的機械工作若硬套完整流程，速度可能變慢。Repo 的存在理由包含改善工程工作，不代表每份技能對每個任務都值得啟動。

### 風險：技能圖需要維護

每份正式技能還有 Codex metadata、README 索引、人類 docs 頁面與可能的 ask-matt 路由。新增技能時要同時更新多處，否則就會有安裝清單、呼叫設定或說明頁漏更新的可能。這個快照的 in-progress README 漏列 chief-of-staff，就是可見例子。Code-review 的遞迴代理也是另一個例子：流程設計寫得細，不保證所有執行環境都能安全限制子代理。

## 如何採用

1. 先決定要用自動更新的 plugin，還是可直接編輯的 skills.sh 複製版；同一個 agent 不要安裝兩種來源。
2. 只從正式的 27 份技能中挑符合日常工作的入口。可先看 ask-matt 和 setup，再依需要加入 TDD、diagnosing-bugs 或 code-review。
3. 執行會寫檔、建立 ticket、操作 secrets、提交或啟動子代理的技能前，先確認實際工具和權限，再看 prompt 的寫入與停止條件。
4. 將 prompt 規則視為操作方式，不要當成通過測試、CI、review、部署或產品 readback 的證據。
5. 對 in-progress，確認自己接受 beta 狀態；misc 已凍結，使用前要先檢查它依賴的套件、CLI、hooks 和 repo 慣例。

## 結論

mattpocock/skills 的核心不是把所有決策交給一份萬用 prompt，而是把需求釐清、設計、執行、驗證、文件和交接拆成可組合的技能。它的優勢是流程細節和交付物可見；主要代價是提示詞圖、工具依賴、repo-local 設定和多個狀態寫入點都需要維護。

適合把它當成一組可挑選和修改的工作手冊。採用前先從固定版本核對技能清單和呼叫 metadata，再確認工具權限與專案約定。提示詞能安排流程，但完成與否仍要看實際執行證據。

## 主要一手來源

- [Repository README](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/README.md)
- [固定原始碼快照](https://github.com/mattpocock/skills/tree/49dd158d1076134a641b33efb035946536778336)
- [外掛 manifest](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/.claude-plugin/plugin.json)
- [呼叫規則](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/.agents/invocation.md)
- [範圍與維護政策](https://github.com/mattpocock/skills/blob/49dd158d1076134a641b33efb035946536778336/SCOPE.md)
