---
title: 'AI Coding 詞典拆解（07）：從 Vibe Coding 到 Software Factory'
publishedAt: '2026-10-15T08:43:06+08:00'
status: 'published'
slug: 'ai-coding-dictionary-07-patterns-of-work'
excerpt: 'AI 工程工作模式的差別，在於人何時介入、用什麼證據檢查，以及任務如何被分派和放大。從原型到工廠，自治程度增加不等於責任消失。'
tags: ['人工智慧', 'AI工程', '軟體開發', '工程管理']
metaDescription: '比較 Human-in-the-loop、AFK、Automated Check、Review、Vibe Coding、Prototyping、DX、AX、Software Factory 和 Dark Factory 的工作情境與風險邊界。'
---

談 AI 寫程式時，常有人把工作模式排成「先協作，再全自動」的單一路線。實際上，工作模式至少有幾個不同問題：人要在什麼時候參與，成果由誰檢查，Agent 是否會自行啟動，以及人是否會讀取產生的程式碼。這些選擇可以組合，也會因工作風險而改變。

本文依《Dictionary of AI Coding》第七單元的用語整理這些模式。詞典中的 Vibe Coding、Design Concept、Software Factory 和 Dark Factory 是作者用來討論工作方式的詞彙，不是有統一規格或成熟度分級的技術標準。我們會先分清楚介入和驗證，再看需求釐清、原型、開發體驗與工廠化流程如何接起來。

## Human-in-the-loop 和 AFK 是人的參與安排

**Human-in-the-loop**（HITL）指人在 Agent 執行期間保持參與，可以即時檢查、補充資訊或改變方向。它不只是最後按一次核准，而是讓人能在錯誤方向還很便宜時看見並修正。需求有歧義、決定難以回復，或最後結果不容易檢查時，人在流程中工作通常比事後挖掘一大批改動可靠。

**AFK** 是 away from keyboard 的縮寫，指使用者啟動一段 Session 後暫時離開，Agent 在一段時間內自行處理工作。AFK 描述的是人沒有即時監看，不等於任務從此無人負責，也不保證 Agent 有權做任何事。清楚的任務範圍、限制過的工具權限、隔離環境、停止條件和可讀的交付物，都會影響它是否適合離線執行。

人在場時，Agent 遇到模糊處可能停下來提問；人離開後，它可能自行採用一個假設，並在這個假設上繼續完成後續工作。最後拿到的結果可以很完整，卻從一開始就解錯問題。因此，AFK 前要先處理會改變方向的歧義，執行中靠適用的自動化檢查快速發現部分錯誤，結束時把結果交成可檢視的變更。AFK 把人的介入移到工作前後，並沒有替人做最後判斷。

選擇介入時機，可以問三件事：錯誤會造成多大影響、發現時還能不能回復，以及完成後是否容易驗證。低影響、可丟棄又能用自動檢查驗證的任務，可嘗試較長的 AFK 執行。資料庫遷移、權限變更、外部副作用或需求仍未定的工作，則應縮短無人監看的範圍，或保留 HITL 控制點。

## Check、Review 和人類判斷各自回答不同問題

**Automated Check** 是在環境中重複執行的明確驗證，例如測試、型別檢查、lint、建置和提交前檢查。它根據預先寫好的條件給結果，適合讓 Agent 從錯誤輸出中修正程式。通過只代表檢查實際涵蓋的條件成立，不代表需求正確、架構合適或產品已能在真實環境運作。檢查若常常在相同輸入下給出不同結果，團隊也很難知道一次通過代表什麼。

**Automated Review** 是由 Agent 或其他自動審查系統對變更形成判斷。它可以尋找漏掉的邊界情況、命名問題、可疑的安全風險或契約不符。和自動檢查不同，它的結論帶有模型判斷，不保證每次一致，也可能漏報或誤報。讓不同 Agent、不同模型或不同審查指令檢查變更，能提供另一種觀點，但不會讓它變成完備證明。

**Human Review** 是人直接看實際變更並作判斷。讀取 diff 或修改過的程式碼算審查；只讀 Agent 對自己工作的摘要，不算。摘要是作者對成果的描述，diff 才是成果本身。人類審查能判斷改動是否符合真正需求、是否適合目前程式結構，以及風險是否能接受。它很花注意力，應留給自動條件無法充分表達的部分。

這三種驗證可以排成一層一層的工作：自動檢查先抓機械性錯誤，自動審查提供額外的風險提示，人再針對重要 diff 和仍需判斷的問題檢視。這不是固定的三道閘門；重點是知道每項證據實際回答什麼。例如，AI 審查跑在 CI 裡，依舊是 Automated Review，不會因為它出現在 CI 就變成確定性的 Check。綠燈、審查意見和人的接受也不能互相代替。

## Vibe Coding 描述一種審查立場

在這份詞典的定義裡，**Vibe Coding** 是使用者接受 Agent 產生的程式碼而不做 Human Review，程式碼 diff 對使用者保持不透明，主要根據執行行為判斷成果。這個詞有不同用法；本文依固定快照中的定義討論，不把它當成「低品質 AI 程式碼」的同義詞。

Vibe Coding 本身沒有說 Automated Check 或 Automated Review 是否執行。使用者可以不讀 diff，仍然先跑測試，也可以讓另一個 Agent 檢視程式。只是這些檢查若沒涵蓋問題，沒有人讀過的程式就可能帶著錯誤進入後續工作。執行時看起來正常，無法揭露所有問題，例如敏感資訊寫進日誌、未處理的資料邊界、錯誤的權限判斷或會在特定併發情境出現的缺陷。

對一次性、短生命週期、容易丟棄的原型，省略人工讀碼有時是合理取捨。若成果會長期維護、接觸真實資料或承擔安全責任，沒有人讀過的改動會把理解成本推到未來。下次除錯的人要先重建整段程式歷史，才知道哪些行為是刻意設計、哪些只是 Agent 當時做的選擇。

## Design Concept 是共同理解，不是模型內部狀態

**Design Concept** 在詞典中沿用 Fred Brooks《The Design of Design》的概念，指人與 Agent 對「要打造什麼」逐漸形成的共享理解。提示詞、討論、Spec、原型和程式碼都是表達或實現這份理解的材料；它們本身都不等於 Design Concept。

這個區分能解釋一種常見挫折：Agent 按照明文要求完成，成果仍然不對。原因未必是模型違反指示，也可能是需求還沒有完整形成。人沒有決定取消訂單後如何退款，Agent 就只好自行補上預設。文字看似完整，只表示沒有留下空白，不代表雙方對未決情況有共同答案。

Design Concept 是作者用來分析溝通和設計的框架，不是可直接讀取或量測的模型內部狀態。不能因 Agent 使用某個詞、完成一份 Spec，或對話讀起來順暢，就宣稱模型裡已建立一個可驗證的概念。比較務實的檢查方式，是用不同案例詢問雙方對行為是否一致，例如正常取消、部分退款、重複提交和逾期請求。如果回答仍衝突，就還需要釐清需求。

**Grilling** 是發展這種共同理解的一種對談方法。Agent 一次問一個會影響方向的問題，也可以提出建議答案，讓使用者選擇或修正。它刻意減慢直接產出計畫的速度，避免 Agent 靜默替需求填入假設。問題若可以用對話回答，就先把決策說清楚；若使用者必須看見實際介面或操作流程才能判斷，對談就到了它的邊界。

**Prototyping** 用有限的實際產物回答文字難以判斷的問題。例如，使用者看不出一份文字規格裡的導覽列是否好找，就先做可操作的介面；開發者不知道某個 API 呼叫是否容易理解，就先做小型客戶端試用。原型應該回答一個具體問題，讓人對真實產物反應，再把學到的決定更新到 Spec。原型可以迭代，也可以只保留其中經過確認的元件。若一次做出很多功能，卻沒有記錄它回答了什麼問題，就只是提前開始實作。

Grilling 和 Prototyping 都需要人在流程中，因為使用者的回答和反應就是輸入。可先用 Grilling 找出規則，再用原型驗證操作感受；也可以在一次對談遇到「我看了才知道」時，轉去做原型。兩者不是規定好的先後儀式，而是處理不同類型的不確定性。

## DX 和 AX 會重疊，也會分開

**DX**（Developer Experience）描述人類開發者使用程式碼庫和工具時的工作體驗，例如環境容易啟動、文件回答實際問題、測試回饋快、錯誤訊息清楚。**AX**（Agent Experience）描述執行環境是否讓 Agent 有條件做好工作，包括它能否找到相關脈絡、導覽程式結構、執行有效檢查，以及讓 Context 保留給當前任務。

兩者有交集。明確型別、快速測試和可預期的目錄結構，同時讓人和 Agent 更容易理解程式。兩者也有差異：新人可以在討論區詢問資深同事，逐漸記住一個模組的隱性知識；新的 Agent Session 不會自然帶著昨天的學習回來。若文件只有在口頭交接時才會提到，Agent 不一定能找到。Agent 也更需要把失敗原因放在可讀的工具輸出裡，不能依靠人從畫面顏色猜測結果。

要改善 AX，不應只調整提示詞或更換模型。先問 Agent 能否找到正確檔案、是否有足夠且精簡的專案規則、失敗後能否從測試輸出修正，以及是否有工具執行必要檢查。若它在同一模型和同一 Harness 下，只在一個 repo 表現差，問題可能在該 repo 的指令、架構或檢查條件，而不是模型本身。

## Software Factory 由事件啟動工作

**Software Factory** 是一套讓觸發事件啟動 Agent Session 的工作系統。觸發點可能是有人建立並標記 Ticket、排程到點、CI 失敗、監控警報，或另一個 Session 完成。工廠化的關鍵不是用了多少代理，而是工作是否能從明確事件進入可執行流程，並以可以檢查的成果結束。

工廠不一定把人移出所有環節。人可以決定哪些 Ticket 能啟動、先審計畫、讀取 PR，或在特定動作前核准。即使一個每晚修正一項 lint 問題、並開出 PR 等待早上審查的排程，也已經具有工廠的特徵。從狹窄、重複且容易驗收的工作開始，能讓團隊觀察哪些環節可靠，再決定是否擴大範圍。

這個詞描述工作流程，不保證工作品質或效率。OpenAI 的 Harness Engineering 文章是單一團隊的第一人稱案例，適合看作一種工程實踐，不是所有團隊都能取得同樣成效的對照研究。METR 對 16 位熟悉大型開源專案的開發者、共 246 項任務做隨機對照研究；在 2025 年初測試的工具和任務條件下，受試者使用 AI 的任務平均花費時間多 19%。這項結果提醒我們，工具採用和任務分派不會自動轉化成更快交付。它不能直接代表其他年份的工具、其他開發者或所有工程任務。

## Dark Factory 是一個不讀程式碼的責任選擇

**Dark Factory** 在詞典裡指 Software Factory 所產生的某一片程式碼庫，沒有人會讀取或審查 Agent 寫出的程式碼。人仍可能撰寫啟動工作的 Issue；自動檢查和自動審查也仍可能執行。但這些自動關卡是唯一檢查手段，團隊刻意不做 Human Review。

因此，AFK 的程式不必然來自 Dark Factory。若 Agent 在人離開時開了一個 PR，隔天由人讀取 diff，這仍是 AFK 工作和 Software Factory。反過來說，如果團隊設定一個目錄或服務，所有改動只要通過自動關卡就直接合併，且沒有人會讀它們，那部分才符合詞典對 Dark Factory 的定義。差別在於是否有人審查成果，不在於執行時有沒有人坐在電腦前。

Dark Factory 的風險會在系統故障時集中浮現。若多個變更都沒有人讀取，出了問題就得查找是哪個 Session 改了什麼、當時依據哪些決定、有哪些自動檢查漏掉了缺陷。通過檢查不代表程式正確；沒有人讀過的改動，也會讓團隊更難知道檢查之外發生了什麼。是否採取這種工作方式，必須清楚界定適用範圍、可回復方式、負責人和事件後的調查路徑。

## 用一個登入改版決定工作方式

假設要調整登入頁。團隊還不確定使用者是否看得懂雙重驗證提示，就先以 Grilling 問清楚角色、錯誤情境和成功條件。對話無法回答新提示是否易讀，就做一個 Prototyping 版本，讓人直接操作，再把實際共識整理進 Spec。此時 Design Concept 逐步成形，仍然由需求、討論和原型表達，不是模型裡可讀取的一個狀態。

當需求清楚後，把互不相依的介面調整拆成 Ticket。低風險、改動小、測試範圍明確的項目可以 AFK 執行；登入權限或使用者資料的改動則安排 HITL 檢查。測試、型別和 lint 作為 Automated Checks；另一個 Agent 可對 diff 做 Automated Review；工程師再讀取實際變更和執行結果，完成 Human Review。若這個流程由 Ticket 標記觸發並自動建立 PR，它具備 Software Factory 的特徵，但仍保留人的審查責任。

若團隊決定登入模組的所有改動都由觸發事件自動啟動，並且沒有人讀取程式碼，該模組就進入 Dark Factory 模式。這不是「更成熟」的自然下一步，而是承擔不同風險的選擇。團隊必須有足夠的檢查能力、隔離和復原方式，也要接受自動檢查無法捕捉所有錯誤。

不同模式適用於不同任務。不要先問「能不能讓 Agent 全自動」，先問需求是否清楚、失敗是否容易復原、產物是否容易檢查、誰需要為結果負責。人可以把反覆、可驗證的工作交給自動流程，也可以把注意力留給需求判斷、原型回饋和高風險審查。模式的價值由這些邊界決定，不由自動化程度單獨決定。

本文對應《Dictionary of AI Coding》固定快照的 [Section 7 — Patterns of Work](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/internal/Curriculum.md#section-7--patterns-of-work)，並參考其 [Human-in-the-loop](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/Human-in-the-loop.md)、[AFK](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/AFK.md)、[Automated check](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/Automated%20check.md)、[Automated review](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/Automated%20review.md)、[Human review](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/Human%20review.md)、[Design concept](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/Design%20concept.md)、[Grilling](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/Grilling.md)、[Prototyping](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/Prototyping.md)、[DX](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/DX.md)、[AX](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/AX.md)、[Software factory](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/Software%20factory.md) 和 [Dark factory](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/dictionary/Dark%20factory.md) 詞條。研究背景可讀 [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/) 和 [METR 的隨機對照研究](https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf)。本文依原詞條重組為教學，並補入研究限制，不是逐句翻譯。
