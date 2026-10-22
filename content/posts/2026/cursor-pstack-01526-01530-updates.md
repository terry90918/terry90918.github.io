---
title: 'pstack 0.15.26 到 0.15.30：從 Prompt 校準、形式驗證維護到可讀狀態圖'
publishedAt: '2026-10-22T10:55:20Z'
status: 'published'
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

這幾版有兩條值得一起讀的線：一條在調整「把任務問清楚」和「開始執行」之間的界線；另一條把形式驗證從一次建立，延伸到持續維護，再把模型的反例轉成產品角色看得懂的狀態圖。前者影響開工節奏，後者影響我們能拿什麼證據說工作完成。

這是我對原始碼變化的整理與分析，不是官方 roadmap，也不是工具的實測成效報告。

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

**官方變更。** [create-formal-verification-skill](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/create-formal-verification-skill/SKILL.md) 要從真實程式找出一項出錯代價高、一般測試難碰到的承諾，再依問題選擇 model checker、SMT／程式驗證器或 proof tool。產物是專案內可以再次執行的驗證技能，不只是解釋形式驗證的文件。

它要求寫出假設、界限和反例，還要故意破壞性質，確認檢查真的會失敗。不能為了通過而弱化 property，也不能把模型通過擴大成整個系統正確。這項能力的[功能提交](https://github.com/cursor/plugins/commit/4382e687a50b8d2c5ce4d141d001186589cff8d5)可以和該版快照對照。

另一組變化在 `/ketchup`。它要列出**所有仍等使用者決定的項目**，附上足以判斷的背景、選項和風險。官方先補上[完整決策資訊](https://github.com/cursor/plugins/commit/16541c6bc1ed6c8d808b2f78a33364003e82b967)，再移除會讓清單被截斷的[字數限制](https://github.com/cursor/plugins/commit/bc1443790cc980d0ea857663260a831299884508)。可以縮短工作敘事，但不能因此漏掉待決事項；Agent 自己能處理的工作，也不該包裝成人類的 action item。

跨工具方面，這版包含 [Claude Code generated plugin tree](https://github.com/cursor/plugins/commit/182f2ce414e83224915c190d2f63239c1608d0a5) 與 [adapter 補強](https://github.com/cursor/plugins/commit/1b800800583ee8ff7f2676caf7a5cb7f0804be85)：模型設定寫入對應規則目錄、Cursor 專屬步驟說明略過、附帶 README 和 guide，再由產生器與 CI 檢查副本一致。這不能寫成「新增官方 Codex harness」；該提交的最終狀態只保留 Claude Code 發行副本。

還有兩類較小但值得注意的修正：[四項原則](https://github.com/cursor/plugins/commit/e5136d82418d2db3165ea1050d17577cd618cc05)從過度指定 matcher、guard、PID lock 等做法，退回讓 Agent 依情境推導原理；[TypeScript brand 範例](https://github.com/cursor/plugins/commit/0317eb8b858c991c57721358daaee19dbe8c814d)則改用 type guard，避免靠型別斷言宣稱資料已驗證。

**我的解讀。** 這版同時處理機器和人的驗收。驗證技能要能重跑、能被故障注入推翻；交接清單則要讓人能直接做決定。兩者都在要求交付一個可以檢查的結果，而不只是一段「已完成」的敘述。

## 0.15.27：一行刪除，還不是完整的工作邊界調整

**官方變更。** sharpen 的[實際修改](https://github.com/cursor/plugins/commit/75fabace38ce507ee044546eaca64167c8c1e21b)只刪掉末尾一句：「Don't hand back a rewritten prompt.」[該版技能](https://github.com/cursor/plugins/blob/0148b78c56c72a1b8412055913c79f767095b217/pstack/skills/sharpen/SKILL.md)其餘文字仍要求先思考專家方法、原始材料和外部檢查，然後執行工作。

所以，0.15.27 不能被描述成「sharpen 已改為只回傳 prompt」。它移除了一句限制，但還沒明確改掉執行任務的要求。

**我的解讀。** 這是一個很適合讀 diff 的例子：一個限制被刪除，不代表相反行為已成為新契約。對同一個指令的理解，還要看剩下的文字如何組合。真正清楚的邊界要到 0.15.29 才出現。

## 0.15.28：模型要跟上程式，工具不足也要說清楚

**官方變更。** 這版把形式驗證接進 [setup 與 guide](https://github.com/cursor/plugins/commit/f9be7aa00c2b2bf4b13562143a6918445e06b99d)。setup 會提出一次可選的形式驗證技能建立建議；已有技能就不重建，也不是自動強制安裝驗證工具。

[工具選擇規則](https://github.com/cursor/plugins/commit/6b78e9f4e46c75d1697d837e51f07c2692e60b24)也更具體：當問題是「幾個步驟可能以壞順序交錯」時，TLA+ 是跨語言的預設設計建模工具。但若問題是實際程式對每個輸入的行為，就應選能直接驗證程式的工具。缺少該語言的 verifier 時，要說明限制，並以產生的輸入測試真實程式，不能偷偷用手寫模型取代程式驗證。

新加入的 [maintain-formal-verification-skill](https://github.com/cursor/plugins/blob/d457567332aa6989e753ea289f30ea2bfbc80bc0/pstack/skills/maintain-formal-verification-skill/SKILL.md)則處理另一個問題：程式持續變動，模型可能早已過期。

它記錄每項 check 對應的檔案、函式、bounds、assumptions 與最後同步 commit。重構或合併之後，要比對涵蓋的程式、更新模型或 harness、重跑檢查並做故障注入，再區分 `in sync`、`updated`、`bug`、`blocked`。更新模型的同時也可能發現 bug，這些結果不能硬塞成互斥的單一綠燈。

維護範圍限於驗證檔案，不能自行修產品程式；不能弱化性質換取通過，工具或資料受阻時也不能前推同步 commit。[新增維護技能的提交](https://github.com/cursor/plugins/commit/7b353f78f6ec193bdbe48ed8059444eb09b6878e)保留了這些界線。

**我的解讀。** 假設一個重試流程原先只有「送出、成功、失敗」，後來加入取消和重新連線。舊模型即使繼續通過，也可能完全沒涵蓋新交錯。這版最實用的要求，是先回答「這個綠燈還對應現在的哪段程式」，再談驗證結果。

## 0.15.29：sharpen 先交付更好的問題，暫不執行

**官方變更。** [這次提交](https://github.com/cursor/plugins/commit/88d47514b82e7c44f00f2b2a72ff6dd12158038c)明確重寫了 sharpen 的工作：先回答專家會補做什麼、最原始的材料在哪裡、會用哪些方法與工具、哪些外部證據能判斷結果正確，再改寫原 prompt，**不執行任務**。

它也要求保留使用者真正擁有的選擇。README、help 和 guide 同步把方向說成讓 prompt 更深入，而不是更大。[該版 SKILL.md](https://github.com/cursor/plugins/blob/88d47514b82e7c44f00f2b2a72ff6dd12158038c/pstack/skills/sharpen/SKILL.md)是這個行為邊界的直接來源。

**我的解讀。** 假設原請求是「讓同步更可靠」。有用的改寫會補上原始錯誤紀錄、要追蹤的狀態、斷線與重試情境，以及如何確認不重複寫入。它不應順手決定產品要容忍多久的延遲，也不應在這一步開始改碼。

這會改變使用節奏：先用 sharpen 校準材料、方法和驗收，再將改寫後的任務交給執行流程。它不是 `/poteto-mode` 的替代品。同樣叫 sharpen，0.15.27 的過渡文字和 0.15.29 的明確契約，不能當成同一件事。

## 0.15.30：把模型反例翻成可討論的狀態圖

**官方變更。** [statechart](https://github.com/cursor/plugins/blob/eb4db2b55b2b7dec3d9282754cddf0a56bf4ff10/pstack/skills/statechart/SKILL.md)不只有技能文字，還附帶實際的 [Node 命令](https://github.com/cursor/plugins/blob/eb4db2b55b2b7dec3d9282754cddf0a56bf4ff10/pstack/skills/statechart/scripts/statechart.mjs)與[上游測試](https://github.com/cursor/plugins/blob/eb4db2b55b2b7dec3d9282754cddf0a56bf4ff10/pstack/skills/statechart/scripts/test/statechart.test.mjs)。它提供兩個方向。

| 方向         | 輸入與產物                                                                         | 仍要由人與 Agent 核對的事                        |
| ------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------ |
| `from-spec`  | 從 TLA+ 模型產生 Mermaid statechart，用 mapping 把變數與 action 換成畫面和操作用語 | 保留既有 invariants；把反例逐步對回真實程式      |
| `from-chart` | 從 PM 同意的圖產生 TLA+ skeleton                                                   | 補上真實 guards、variables，再比較圖與程式的差異 |

`from-spec` 會將 TLC 發現的 bug 整理成編號路徑：一般狀態灰色、仍有問題的紅色、已修正的綠色。可以用 `--fixed` 比較修正模型，audit 時可用 `--against` 對照原 spec。

`from-chart` 則把會獨立變動的事情分成 region，並用 `%% never` 表達不可發生的行為。產出的 skeleton 是建模起點，仍需補進真實程式的條件；圖和程式不一致時，要把差異交給 PM 判斷，不能讓工具偷偷替產品做決定。

輸出包含 PNG、Mermaid、stories、summary 與可再生指令，數字以 `summary.json` 為準。技能要求看過每張 PNG，再把反例逐步回放到真實程式。**如果真實程式無法重現，先懷疑模型；不能因圖看起來可信，就宣稱找到產品 bug。**

**我的解讀。** 以上傳為例，畫面可能只顯示「處理中」，底下卻同時存在上傳、取消和重新連線。狀態圖能讓 PM 和工程師討論「使用者取消之後，哪個背景動作還能完成」，模型則檢查指定界限內有沒有違反規則的路徑。兩者接起來，才比較容易看出畫面規格和程式交錯是否在談同一件事。

這是使用情境分析，本文沒有實跑 TLC、PNG render 或上游 script suite，也不宣稱上述案例已被驗證。TLA+／TLC 和圖片產生工具仍須依技能確認；隨包附帶 Node scripts，不代表執行環境已備齊。

## 對開發節奏、並行與驗收的實際意義

以下是我把幾版放在一起後的應用判斷。

**開工前，先決定要交付問題還是解法。** 0.15.29 的 sharpen 把 prompt 校準獨立出來。重要任務可以先檢查原始材料與外部驗收標準，再開始實作；簡單工作則不必為了使用新技能而多加一輪程序。

**並行時，除了分檔案，也要說清楚哪些步驟會交錯。** 這幾版沒有承諾「增加 Agent 就會更快」。形式模型更適合檢查的是取消、重試、回應到達等事件如何互相影響。即使不同 Agent 各改不同檔案，仍可能共同改變同一個狀態契約；分工前要先釐清這個契約，合併後再核對模型與程式是否同步。

**驗收要分清楚模型通過、程式重現和產品決策。** 模型通過只支持已寫出的性質、假設與界限；反例需要回到真實程式確認；圖與產品預期的差異則需要產品決策。這三種證據互相補足，任何一種都不能單獨替其他兩種作保。

0.15.26 的 ketchup 在這裡也有位置：當某個差異真的需要使用者選擇，就把背景與選項交代完整；能由 Agent 自己查證或完成的事，則繼續處理。

## 更新後，還要確認宿主能做什麼

[0.15.30 官方 README](https://github.com/cursor/plugins/blob/eb4db2b55b2b7dec3d9282754cddf0a56bf4ff10/pstack/README.md)列出的 Cursor 安裝入口是 `/add-plugin pstack`；Claude Code 則使用 `/plugin marketplace add cursor/plugins`，再執行 `/plugin install pstack@cursor-plugins`。

這些是官方列出的安裝入口，不代表本文已確認 Marketplace 當時提供 0.15.30。更新後仍應核對實際載入的 manifest 和技能內容，尤其 sharpen 的工作邊界已改變。套件檔案更新，也不能直接推定既有對話已重新載入全部技能。

其他宿主能讀 Agent Skills 格式，也不等於能使用 Cursor 的所有子代理、模型、Custom Mode 或 loop 能力。本文所稱 0.15.30，是固定在 [eb4db2b 的官方原始碼快照](https://github.com/cursor/plugins/tree/eb4db2b55b2b7dec3d9282754cddf0a56bf4ff10/pstack)；能不能完成某條工作流程，仍要看宿主工具、驗證環境和實際執行結果。
