---
title: 'Agent 不可靠時，先看工作系統：Harness Engineering 的實務拆解'
publishedAt: '2026-10-07T21:42:00+08:00'
status: 'published'
slug: 'harness-engineering-agent-reliability'
excerpt: '同一個模型能否把任務做完，取決於工具、脈絡、執行環境與驗證如何接在一起。'
tags:
  - ai
  - agents
  - architecture
metaDescription: 'Harness Engineering 不只是替模型加工具，而是設計工具、脈絡、執行環境、權限與驗證，讓 agent 能穩定完成真實任務。'
---

Agent 說「完成了」，不代表任務真的完成。它可能改錯檔案、漏掉一項需求，或只跑過測試，卻沒有確認使用者看到的結果。

遇到這些問題時，最直覺的做法是換模型或重寫提示詞。但有時模型並不缺能力；缺的是讓它取得正確資料、採取適當動作、檢查結果並在出錯時恢復的工作系統。這套圍繞模型的系統，通常稱為 **harness**；設計和改進它，就是 **Harness Engineering**。

OpenAI 在一篇工程文章中記錄了自家團隊以 Codex 開發內部產品的實驗：文章提到約一百萬行程式碼、約 1,500 個 Pull Request，並估計所需時間約為手動撰寫的十分之一。這是 OpenAI 對特定內部專案的描述與估算，不能直接推論成所有團隊都能得到相同結果。它至少讓一個問題變得具體：當模型已能產生大量程式碼，工程工作要往哪裡移動？[OpenAI 的記錄](https://openai.com/index/harness-engineering/)

答案的一部分，是把工程投入放在模型周圍的工具、執行環境和回饋機制上。要看懂這些元件，可以先問三個問題：agent 能不能做事？它有沒有在正確的脈絡與環境裡做？完成後，系統能不能證明結果符合要求？

## 模型會提出動作，系統負責執行

模型可以輸出文字，也可以依照工具介面產生結構化呼叫。但要讀取檔案、執行命令或呼叫外部服務，仍需要一個執行層接手。Harness 會提供可用工具、組合每次模型呼叫需要的資訊、執行模型提出的動作，再把結果帶回下一輪。

所以，一個 coding agent 不是模型單獨在操作電腦。模型負責推理和選擇；harness 提供工作環境、執行動作、保存狀態，並管理整段流程。不同產品對這條界線的切法不盡相同，但這個區分有助於找到問題應該在哪一層修正。

用「替儀表板增加月報下載」作例子。這句需求還沒有說清楚：下載內容要跟著目前的篩選條件嗎？日期採哪個時區？使用者只能匯出自己有權查看的資料嗎？成功和失敗要怎麼呈現？如果這些條件沒有被確認，模型很可能會自行補完空白，而結果即使能編譯，也未必符合使用者的期待。

## 第一層：讓 agent 能採取行動並延續工作

Harness 先要提供工具。例如搜尋程式碼、讀取檔案、修改檔案、執行測試，或在瀏覽器中操作應用程式。模型透過工具描述和參數格式提出要求，執行層再回傳結果。

工具介面會影響 agent 能否修正方向。只回覆「失敗」的工具，把原因留給模型猜；指出哪個參數無效、哪個檔案沒有找到，或提供可採取的下一步，會讓後續判斷更有根據。工具也應該清楚標出可能改變外部狀態的操作，避免把查詢與修改混在同一個模糊入口裡。

單次呼叫通常做不完一項任務。模型先搜尋相關模組，接著讀取程式碼，再提出修改、執行測試，最後根據結果繼續或停止。Harness 把這些步驟連成循環：呼叫模型、執行工具、回傳結果，直到任務完成或碰到停止條件。

循環之間還需要狀態。模型不會自動保留上一次呼叫的工作進度；系統必須帶回目標、已檢查的檔案、已做的修改、錯誤和待辦項目。Anthropic 在長時間開發的案例中，描述了把規格拆成小任務，並以結構化產物交接不同工作階段的做法。這些資料讓下一輪能接續工作，不必假裝模型「自己記得」。[Anthropic：長時間執行的 harness 設計](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

## 第二層：提供剛好足夠的脈絡和可控環境

工具能找到資料，不等於每次都該把整個專案送進模型。模型每次只能處理有限的輸入；大量不相關的檔案會增加雜訊，過度摘要又可能刪掉重要限制。Anthropic 將這類工作稱為 context engineering：依照當下要完成的步驟，整理哪些指示、工具、歷史和外部資料應該進入上下文。[Anthropic：AI agent 的 context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

實務上，可以先提供精簡的專案地圖，說明主要模組與規範，再讓 agent 按需搜尋檔案和文件。月報下載的任務可能先需要儀表板元件和匯出服務；只有在確認資料欄位或權限規則時，才載入對應的程式碼與文件。

脈絡回答的是「模型看得到什麼」；工作環境回答的是「它能影響什麼」。沙箱、獨立 worktree 或其他隔離環境，可以限制檔案和命令的影響範圍。這些機制降低操作錯誤的波及面，但不會自動替代權限檢查，也不保證模型讀到的內容可信。環境、網路和資料庫的存取範圍仍須明確設定。

## 第三層：限制風險，並用外部證據驗收

權限應落在系統可執行的邊界上。讀取資料可能可以自動進行；修改檔案、匯出資料或操作正式環境，則可能需要不同的核准條件。僅靠提示詞寫「請小心」不足以阻止越權操作；如果一項動作不應自動發生，工具和執行環境就要真的限制它。

接著要把模糊要求變成驗收條件。月報下載至少可以檢查：按鈕是否出現在正確畫面、匯出的列是否符合目前篩選、資料是否遵守使用者權限，以及下載失敗時是否出現可理解的訊息。這些條件可以由測試、瀏覽器操作、API 回應或檔案內容來確認。

「我已經完成」只是模型的說法，不能代替結果證據。Anthropic 在另一篇文章中採用 generator 與 evaluator 的角色分工，讓一個 agent 產生結果，另一個依據明確條件檢查；在主觀性較高的設計工作裡，評分條件也需要先寫清楚。[Anthropic：長時間應用程式開發的 harness 設計](https://www.anthropic.com/engineering/harness-design-long-running-apps)

可觀測性讓團隊追出錯誤發生在哪一步：模型拿到什麼脈絡、選了哪個工具、傳入什麼參數，以及工具回傳了什麼。若 agent 一直讀錯資料，可能要修檢索或工具描述；若測試全過但下載內容錯誤，就要補上更貼近使用者路徑的驗收。把每次失敗都歸因於「模型不夠好」，會錯過真正可修的部分。

評估則用一組固定任務比較改動前後的結果。新增更多檔案到上下文，可能改善複雜任務，也可能讓簡單任務更容易改錯地方。只挑一次成功的執行展示，無法看出這種回歸；固定案例和一致的驗收方式才能顯示改善是否可重複。

## 出錯時，先找是哪一層缺了東西

看到 agent 失敗，可以先用症狀縮小排查範圍：

| 症狀                         | 優先檢查                         |
| ---------------------------- | -------------------------------- |
| 找不到該改的模組             | 搜尋工具、專案地圖、檢索結果     |
| 重複做過的步驟或中斷後接不上 | 工作狀態、交接資料、循環停止條件 |
| 改了程式卻沒達成需求         | 任務規格、上下文、驗收條件       |
| 做了不該做的操作             | 權限、工具範圍、沙箱與網路設定   |
| 單一案例變好，整體表現變差   | 固定評估集、成功率、成本和副作用 |

這套分類不是新的 agent 架構，而是排查次序。先找重複出現的失敗，再把它對應到工具、狀態、脈絡、環境或驗證，通常比一開始就替模型加更長的指示有效。

Skills、MCP、子 agent 和長期記憶也可以放回這些問題裡理解。Skill 封裝特定任務的指示與資源；[Santi 的原文](https://x.com/santtiagom_/article/2098782814837543075)也提到按需載入 skill 的做法。MCP 則是連接 AI 應用與外部系統、資料來源及工具的開放標準，見 [MCP 官方文件](https://modelcontextprotocol.io/docs/getting-started/intro)。子 agent 可以切分工作或獨立覆核；長期記憶則保存跨任務可重用的資訊。它們擴充的是既有能力，不會取代明確的權限和驗收。

## Harness Engineering 是持續校正

OpenAI、Anthropic 和 LangChain 的文章，切入角度各有不同，但都把焦點帶回模型之外的系統設計。[LangChain 對 agent harness 的拆解](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)也可以作為延伸閱讀。這些案例不是證明「harness 一定比模型重要」；更務實的理解是，模型能力和工作系統共同決定一項任務能否可靠完成。

因此，Harness Engineering 可以從小處開始：選一類常失敗的任務，定義完成條件，留下執行軌跡，修正最常出錯的那一層，再用固定案例重跑。每次只改少數因素，才看得出改動帶來了什麼影響。

換模型有時確實能解決問題。但若缺的是一個必要工具、清楚的任務脈絡、隔離的執行空間，或能證明結果正確的檢查，單換模型不會補上這些缺口。工程上的問題是：讓模型接手一項工作時，整套系統能不能把它帶到可檢查的結果。

## 延伸閱讀

- [OpenAI：Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)
- [Anthropic：Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Anthropic：Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [LangChain：The Anatomy of an Agent Harness](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)
- [Santi：Harness Engineering: explicado desde cero](https://x.com/santtiagom_/article/2098782814837543075)（本文的起點；本文重新組織並加入實務分析，並非逐句翻譯。）
