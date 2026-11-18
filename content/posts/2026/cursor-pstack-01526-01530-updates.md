---
title: 'pstack 0.15.26 到 0.15.30：從 Prompt 校準、形式驗證維護到可讀狀態圖'
publishedAt: '2026-10-22T18:55:20+08:00'
status: 'published'
presentation:
  type: feature
  category: 開發工具
  audio:
    src: /audio/2026/pstack-01526-01530-notebooklm.mp3
    duration: 1092
  video:
    src: /videos/2026/pstack-01526-01530-notebooklm.mp4
    poster: /videos/2026/pstack-01526-01530-notebooklm.jpg
    title: 深入解析 pstack 0.15.26–0.15.30
slug: 'cursor-pstack-01526-01530-updates'
excerpt: '逐版讀 pstack 0.15.26～0.15.30 的官方差異：sharpen 如何改變工作邊界、形式驗證如何跟上程式，以及 statechart 如何把模型反例帶回產品討論。'
tags:
  - cursor
  - ai-agent
  - developer-tools
  - agent-workflow
metaDescription: '依官方固定提交介紹 pstack 0.15.26～0.15.30，區分 sharpen、形式驗證維護與 TLA+／Mermaid 狀態圖的實際變更和應用分析。'
---

[pstack 深度導讀（上）](/posts/2026/cursor-pstack-plugin-analysis)、[中篇](/posts/2026/cursor-pstack-workflow-design-guide)與[下篇](/posts/2026/cursor-pstack-prompt-analysis)固定在 0.15.26，分別介紹外掛結構、工作流程和技能。這次接著看 0.15.26 到 0.15.30 的變化。

pstack 是一套協助 AI Agent 開發軟體的技能外掛，內容涵蓋任務規劃、實作與驗證。這幾個版本主要有兩個值得關注的變化方向。第一是開工前先釐清任務：`sharpen` 逐步改成專注於改善 Prompt，讓需求、方法與驗收標準更明確。第二是完成後留下驗證依據：形式驗證開始要求持續維護模型，`statechart` 則將模型發現的問題轉成 PM 與工程師都能理解的狀態圖。

即使沒有讀過前面的系列，也可以先用「檔案上傳」理解這些功能的關係：使用者按下取消後，上傳還能不能被標記為完成？這個問題需要先定義預期行為，再實作、驗證，最後確認畫面與程式說的是同一件事。

## 先看這些功能如何接起來

**釐清任務 → 實作 → 驗證與維護 → 用狀態圖討論行為**

| 階段       | 在檔案上傳案例中要處理什麼                               | 對應功能                                       |
| ---------- | -------------------------------------------------------- | ---------------------------------------------- |
| 釐清任務   | 補齊失敗、取消、重試的預期行為與驗收方式                 | `sharpen` 改寫 Prompt                          |
| 實作       | 依確認的需求完成上傳、取消與重試                         | 交給後續開發流程                               |
| 驗證與維護 | 檢查取消與完成通知交錯時是否出錯；新增斷線恢復後更新模型 | 建立與維護形式驗證技能                         |
| 討論行為   | 把狀態與出錯路徑畫出來，確認是否符合產品預期             | `statechart`，必要時用 `/ketchup` 交接待決事項 |

這是我整合各版功能後建議的使用流程，並非官方規定的執行順序。狀態圖也能在實作前用來討論需求，不必等到驗證之後才畫。

本文依固定的官方原始碼提交整理版本變化，再以「我的觀察」區分應用分析。上傳案例是說明用途，沒有實作或執行驗證；本文也不是工具的效能評估。

## 先說清楚版本與日期

本文查證時間為 **2026-10-22**，來源是 [Cursor 官方 plugins repository](https://github.com/cursor/plugins) 的 pstack 目錄。當時 [GitHub Releases](https://github.com/cursor/plugins/releases) 沒有正式 release；以下時間是 **manifest 進入該版號的官方提交時間，統一為 UTC**，不是 Marketplace 上架日期。

每一版都以 manifest 的版本提交作為快照邊界。尤其 0.15.26 的內容是從上一版累積進來，不能把全部功能都算成版本號提交當下才新增。

| 版本                                                                                         | Manifest 提交時間（UTC） | 本文整理的主要變化                                        |
| -------------------------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------- |
| [0.15.26](https://github.com/cursor/plugins/commit/0b8e952052d482ee6de06deebf14d590d77b1b34) | 10/18 07:31:07           | 建立形式驗證技能、完整交接決策、補強 Claude Code 發行副本 |
| [0.15.27](https://github.com/cursor/plugins/commit/0148b78c56c72a1b8412055913c79f767095b217) | 10/18 20:18:12           | sharpen 刪掉一句禁止交回改寫 prompt 的限制                |
| [0.15.28](https://github.com/cursor/plugins/commit/d457567332aa6989e753ea289f30ea2bfbc80bc0) | 10/19 05:35:26           | 形式驗證的設定、工具選擇與持續維護                        |
| [0.15.29](https://github.com/cursor/plugins/commit/88d47514b82e7c44f00f2b2a72ff6dd12158038c) | 10/20 02:24:33           | sharpen 明確改成重寫 prompt，不執行任務                   |
| [0.15.30](https://github.com/cursor/plugins/commit/eb4db2b55b2b7dec3d9282754cddf0a56bf4ff10) | 10/22 06:08:55           | 新增 statechart，連接 TLA+ 模型與 Mermaid 狀態圖          |

## 0.15.26：先建立可重跑的驗證，也把交接說完整

[create-formal-verification-skill](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/create-formal-verification-skill/SKILL.md) 要從真實程式找出一項出錯代價高、一般測試難碰到的規則，再建立專案內可以重跑的驗證技能。

這裡的**形式驗證（Formal Verification）**，是利用數學模型或邏輯方法，檢查系統是否違反特定規則。工具要依問題選擇：模型檢查器（Model Checker）會自動探索模型可能出現的狀態與執行順序；SMT 求解器、程式驗證器或證明工具則依各自能力處理邏輯條件與證明問題。

以上傳為例，可以先定義一條規則：「某次上傳一旦確認取消，就不能再被標記為完成。」如果用模型描述取消和完成通知的先後順序，檢查器便能尋找違反這條規則的路徑。這種路徑稱為**反例（Counterexample）**，用來說明規則如何被違反。

技能要求寫出假設、檢查範圍和反例，還要刻意讓受檢查的性質失效，確認檢查真的會失敗。具體改哪裡，取決於驗證對象：檢查模型時，要修改模型或驗證用程式；直接驗證程式時，則使用受檢查程式的破壞變體。只修改產品程式，不會讓獨立的手寫模型自動產生反例。不能為了通過而放寬規則，也不能把模型通過擴大解讀為整個系統正確。這項能力的[功能提交](https://github.com/cursor/plugins/commit/4382e687a50b8d2c5ce4d141d001186589cff8d5)可以和該版快照對照。

另一組變化在 `/ketchup`。它要列出**所有仍等使用者決定的項目**，附上足以判斷的背景、選項和風險。官方先補上[完整決策資訊](https://github.com/cursor/plugins/commit/16541c6bc1ed6c8d808b2f78a33364003e82b967)，再移除會讓清單被截斷的[字數限制](https://github.com/cursor/plugins/commit/bc1443790cc980d0ea857663260a831299884508)。可以縮短工作敘事，但不能因此漏掉待決事項；Agent 自己能處理的工作，也不該包裝成人類的 action item。

跨工具方面，這版包含 [Claude Code generated plugin tree](https://github.com/cursor/plugins/commit/182f2ce414e83224915c190d2f63239c1608d0a5) 與 [adapter 補強](https://github.com/cursor/plugins/commit/1b800800583ee8ff7f2676caf7a5cb7f0804be85)：模型設定寫入對應規則目錄、Cursor 專屬步驟說明略過、附帶 README 和 guide，再由產生器與 CI 檢查副本一致。這不能寫成「新增官方 Codex harness」；該提交的最終狀態只保留 Claude Code 發行副本。

還有兩類較小但值得注意的修正：[四項原則](https://github.com/cursor/plugins/commit/e5136d82418d2db3165ea1050d17577cd618cc05)從過度指定 matcher、guard、PID lock 等做法，退回讓 Agent 依情境推導原理；[TypeScript brand 範例](https://github.com/cursor/plugins/commit/0317eb8b858c991c57721358daaee19dbe8c814d)則改用 type guard，避免靠型別斷言宣稱資料已驗證。

**我的觀察：** 這個版本同時改善自動化驗證與人工決策交接。驗證技能要能重跑，也要確認刻意引入的錯誤會被檢查發現；交接清單則要讓人有足夠資訊做決定。兩者都要求提供可檢查的結果。

## 0.15.27：一行刪除，還不是完整的工作邊界調整

sharpen 的[實際修改](https://github.com/cursor/plugins/commit/75fabace38ce507ee044546eaca64167c8c1e21b)只刪掉末尾一句：「Don't hand back a rewritten prompt.」[該版技能](https://github.com/cursor/plugins/blob/0148b78c56c72a1b8412055913c79f767095b217/pstack/skills/sharpen/SKILL.md)其餘文字仍要求先思考專家方法、原始材料和外部檢查，然後執行工作。

所以，0.15.27 不能被描述成「sharpen 已改為只回傳 prompt」。它移除了一句限制，但還沒明確改掉執行任務的要求。

**我的觀察：** 這是一個很適合讀 diff 的例子：一個限制被刪除，不代表相反行為已成為新契約。對同一個指令的理解，還要看剩下的文字如何組合。真正清楚的邊界要到 0.15.29 才出現。

## 0.15.28：模型要跟上程式，工具不足也要說清楚

這版把形式驗證接進 [setup 與 guide](https://github.com/cursor/plugins/commit/f9be7aa00c2b2bf4b13562143a6918445e06b99d)。setup 會提出一次可選的形式驗證技能建立建議；已有技能就不重建，也不是自動強制安裝驗證工具。

[工具選擇規則](https://github.com/cursor/plugins/commit/6b78e9f4e46c75d1697d837e51f07c2692e60b24)也更具體：當問題是「幾個步驟是否可能因執行順序不同而出錯」時，TLA+ 是跨語言的預設設計建模工具。**TLA+** 是描述系統狀態與並行行為的形式化規格語言，適合用來分析上傳完成通知和取消操作如何交錯。

**檢查 TLA+ 模型，與直接驗證程式，提供的保證不同。** 前者檢查你寫出的系統描述，仍需確認模型對應真實程式；後者由工具在支援的範圍與假設下分析程式本身。若問題是實際程式對各種輸入的行為，就應選能直接驗證程式的工具。

缺少該語言的程式驗證器時，要說明限制，並以產生的輸入測試真實程式，不能未經說明就以手寫模型取代對程式的驗證。

新加入的 [maintain-formal-verification-skill](https://github.com/cursor/plugins/blob/d457567332aa6989e753ea289f30ea2bfbc80bc0/pstack/skills/maintain-formal-verification-skill/SKILL.md)則處理另一個問題：程式持續變動，模型可能早已過期。

它記錄每項檢查對應的檔案、函式、檢查界限、假設與最後同步的 commit。重構或合併之後，要比對涵蓋的程式，更新模型或驗證用程式，再重跑檢查並確認刻意引入的錯誤仍會被發現。結果要區分 `in sync`（仍同步）、`updated`（已更新）、`bug`（發現問題）與 `blocked`（受阻）。更新模型的同時也可能發現 bug，不能只用單一通過狀態概括不同結果。

維護範圍限於驗證檔案，不能自行修產品程式；不能弱化性質換取通過，工具或資料受阻時也不能前推同步 commit。[新增維護技能的提交](https://github.com/cursor/plugins/commit/7b353f78f6ec193bdbe48ed8059444eb09b6878e)保留了這些界線。

**我的觀察：** 延續上傳案例，假設最初已檢查取消和完成通知的順序，後來又加入斷線恢復。舊模型即使繼續通過，也可能沒描述恢復連線後再次收到完成通知的情況。這版最實用的要求，是先確認驗證涵蓋現在的哪些行為，再判斷結果是否仍有參考價值。

## 0.15.29：sharpen 先完善任務描述，不直接執行

[這次提交](https://github.com/cursor/plugins/commit/88d47514b82e7c44f00f2b2a72ff6dd12158038c)明確重寫了 sharpen 的工作：先回答專家會補做什麼、最原始的材料在哪裡、會用哪些方法與工具、哪些外部證據能判斷結果正確，再改寫原 prompt，**不執行任務**。

它也要求保留使用者真正擁有的選擇。README、help 和 guide 同步把方向說成讓 prompt 更深入，而不是更大。[該版 SKILL.md](https://github.com/cursor/plugins/blob/88d47514b82e7c44f00f2b2a72ff6dd12158038c/pstack/skills/sharpen/SKILL.md)是這個行為邊界的直接來源。

**我的觀察：** 假設原請求是「改善檔案上傳的取消和重試」。有用的改寫會要求先讀取現有上傳程式與錯誤紀錄，釐清取消、失敗和重試的狀態，再列出驗收情境，例如確認取消後收到完成通知時，畫面和資料是否仍符合需求。至於取消只停止畫面，還是也要中止背景傳輸，仍應保留給使用者決定；這一步不直接改碼。

這會改變使用節奏：先用 sharpen 校準材料、方法和驗收，再將改寫後的任務交給執行流程。它不是 `/poteto-mode` 的替代品。同樣叫 sharpen，0.15.27 的過渡文字和 0.15.29 的明確契約，不能當成同一件事。

## 0.15.30：先把行為畫出來，再討論模型與程式

**狀態圖（Statechart）** 描述系統有哪些狀態，以及事件如何觸發狀態轉換。它解決的問題是：程式與模型裡的名稱，未必能讓 PM 看出使用者會遇到什麼情況。

延續上傳案例，正常路徑可能是「等待上傳 → 上傳中 → 已完成」。如果使用者在途中取消，就多出「上傳中 → 已取消」。接著要問的是：已取消之後，背景完成通知還可能把畫面改成「已完成」嗎？先把狀態與路徑說清楚，才容易討論這是否符合需求。

這是示意情境，不是本文發現的產品 bug。0.15.30 的 [statechart 技能][statechart-skill]提供兩個方向，讓這種討論能接回形式模型。

| 方向                     | 從哪裡開始                                 | 工具產物與後續工作                                                             |
| ------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------ |
| `from-spec`：模型轉成圖  | 已有 TLA+ 模型，或程式已足夠具體，可以建模 | 產生 Mermaid 狀態圖；將模型名稱換成畫面與操作用語，再把反例對回真實程式        |
| `from-chart`：圖轉成模型 | 尚無模型，先由 PM 確認預期行為             | 產生 TLA+ 模型骨架；補上程式的變數與轉換條件，檢查模型產生的圖是否符合約定的圖 |

### 已有模型時，讓反例成為可讀的路徑

`from-spec` 使用 **TLC** 檢查模型。TLC 是檢查 TLA+ 模型是否違反指定規則的工具；這裡檢查的 **Invariant（不變條件）**，指模型所有可到達狀態都應維持的條件，例如「已確認取消的那次上傳不能再被標記為完成」。

產圖時需要補上 mapping，也就是把模型裡的變數與動作，對應成「上傳中」「按下取消」「收到完成通知」這類用語。既有模型的不變條件必須保留，不能為了讓圖通過而放寬。

工具會把違反規則的反例整理成編號路徑：一般狀態灰色、仍有問題的紅色、已修正的綠色。`--fixed` 可比較修正後的模型。使用 `from-spec SPEC.tla --against AGREED.tla` 時，`SPEC.tla` 要描述真實程式，`AGREED.tla` 則是前者必須遵循的約定規格；工具比較這兩個模型，結果取決於輸入是否符合這個方向。

### 先談需求時，從圖建立模型骨架

`from-chart` 適合先討論上傳、取消與斷線恢復應如何呈現。會獨立變動的事情，例如連線狀態與上傳狀態，要分成不同區域（region）；每條不可發生的行為，則以 `%% never` 表達。

工具產出的骨架仍需補進真實程式的變數與轉換條件（guards）。重新執行後，工具比較原先約定的圖與模型產生的圖，並不直接讀取或驗證產品程式。只有模型正確描述程式時，圖的差異才有助於討論程式行為；仍需另外回放或檢查真實程式，再交由 PM 判斷該修改程式還是調整規格。

### 圖產出之後，仍要回到真實程式確認

這個技能附有 [Node 腳本][statechart-script]與[上游測試][statechart-tests]。腳本會寫入 Mermaid 原始檔、敘述反例步驟的 `stories.md`，以及記錄結果的 `summary.json`；加上 `--png` 才會產生圖片。交付時要附上可重新產生結果的指令，引用數字則以 `summary.json` 為準。

產生 PNG 後要逐張檢視，再把反例的每一步回放到真實程式。**如果程式無法重現，先檢查模型是否描述錯誤，不能只憑模型反例宣稱找到產品 bug。**

**我的觀察：** 狀態圖讓 PM 與工程師能共同討論「取消後，背景完成通知該如何處理」；模型則檢查指定假設與界限內是否可能違反規則。兩者接起來，能幫助團隊核對畫面規格與程式行為。

本文沒有實跑 TLC、PNG 產生流程或上游測試，也不宣稱上述案例已被驗證。TLA+、TLC 與圖片產生工具仍須依技能確認；套件附有 Node 腳本，不代表執行環境已備齊。

## 對開發節奏、並行與驗收的實際意義

以下是我把幾版放在一起後的應用判斷。

**開工前，先釐清這一步是完善任務描述，還是開始實作。** 0.15.29 的 sharpen 把 prompt 校準獨立出來。重要任務可以先檢查原始材料與外部驗收標準，再開始實作；簡單工作則不必為了使用新技能而多加一輪程序。

**並行時，除了分檔案，也要說清楚哪些步驟會交錯。** 這幾版沒有承諾「增加 Agent 就會更快」。形式模型更適合檢查的是取消、重試、回應到達等事件如何互相影響。即使不同 Agent 各改不同檔案，仍可能共同改變同一個狀態契約；分工前要先釐清這個契約，合併後再核對模型與程式是否同步。

**驗收要分清楚模型通過、程式重現和產品決策。** 模型通過只支持已寫出的性質、假設與界限；反例需要回到真實程式確認；圖與產品預期的差異則需要產品決策。這三種證據互相補足，任何一種都不能單獨替其他兩種作保。

0.15.26 的 ketchup 在這裡也有位置：當某個差異真的需要使用者選擇，就把背景與選項交代完整；能由 Agent 自己查證或完成的事，則繼續處理。

## 更新後，還要確認宿主能做什麼

[0.15.30 官方 README](https://github.com/cursor/plugins/blob/eb4db2b55b2b7dec3d9282754cddf0a56bf4ff10/pstack/README.md)列出的 Cursor 安裝入口是 `/add-plugin pstack`；Claude Code 則使用 `/plugin marketplace add cursor/plugins`，再執行 `/plugin install pstack@cursor-plugins`。

這些是官方列出的安裝入口，不代表本文已確認 Marketplace 當時提供 0.15.30。更新後仍應核對實際載入的 manifest 和技能內容，尤其 sharpen 的工作邊界已改變。套件檔案更新，也不能直接推定既有對話已重新載入全部技能。

其他宿主能讀 Agent Skills 格式，也不等於能使用 Cursor 的所有子代理、模型、Custom Mode 或 loop 能力。本文所稱 0.15.30，是固定在 [eb4db2b 的官方原始碼快照](https://github.com/cursor/plugins/tree/eb4db2b55b2b7dec3d9282754cddf0a56bf4ff10/pstack)；能不能完成某條工作流程，仍要看宿主工具、驗證環境和實際執行結果。

## 我認為這幾版改變了什麼

從 0.15.26 到 0.15.30，pstack 逐步釐清了各階段的工作：`sharpen` 完善任務描述，形式驗證檢查特定規則，維護技能確認模型是否跟上程式，`statechart` 則讓狀態與反例成為 PM 和工程師可以共同討論的內容。

回到檔案上傳，這表示先確認取消與重試應如何運作，實作後檢查關鍵的事件順序，新增斷線恢復時更新模型，再用狀態圖核對產品預期。這些技能不保證軟體完全正確，每項任務也不必跑過完整流程。

我認為值得借鏡的原則是：**開始前釐清問題，完成後留下可驗證的證據；程式改變時，重新確認原本的結論是否仍成立。**

[statechart-skill]: https://github.com/cursor/plugins/blob/eb4db2b55b2b7dec3d9282754cddf0a56bf4ff10/pstack/skills/statechart/SKILL.md
[statechart-script]: https://github.com/cursor/plugins/blob/eb4db2b55b2b7dec3d9282754cddf0a56bf4ff10/pstack/skills/statechart/scripts/statechart.mjs
[statechart-tests]: https://github.com/cursor/plugins/blob/eb4db2b55b2b7dec3d9282754cddf0a56bf4ff10/pstack/skills/statechart/scripts/test/statechart.test.mjs
