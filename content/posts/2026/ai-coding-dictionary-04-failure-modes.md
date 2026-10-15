---
title: "AI Coding 詞典拆解（04）：從幻覺、迎合到注意力退化，診斷 Agent 失敗"
publishedAt: "2026-10-15T08:43:03+08:00"
status: "published"
slug: "ai-coding-dictionary-04-failure-modes"
excerpt: "Agent 的錯誤不是單一的「幻覺」。知識來源、迎合傾向、脈絡品質和任務難度會造成不同失敗，需要分別診斷。"
tags: ["人工智慧", "AI工程", "軟體開發", "品質驗證"]
metaDescription: "辨識 Sycophancy、Hallucination、Parametric Knowledge、Contextual Knowledge、Attention Degradation 和 Smart Zone，建立可操作的 Agent 失敗診斷方式。"
---

AI 程式代理答錯 API、照著錯誤假設修改程式，或在長對話裡漏掉先前限制，常被歸成一句「模型幻覺」。這個說法只描述了結果看起來不真實，沒有指出錯誤如何形成，也就無法決定該補文件、改提示、縮小脈絡，還是檢查工具。

第四單元的詞目把幾種現象放在一起：有些談模型回答迎合使用者，有些談知識從哪裡來，另一些談長脈絡中資訊如何被使用。這些分類可以重疊，但不能互相替代。本文會沿用詞典詞目，並把可觀察的事實、研究結果和教學比喻分開。

## 先分辨答錯的來源

**Parametric knowledge（參數知識）** 指模型透過訓練形成、以參數承載的語言和領域能力。模型可能因此知道常見 API、語法慣例和錯誤訊息的常見原因。這不表示資料庫式的事實被整齊儲存在某個參數欄位裡，也不保證模型能精確取回某個版本的完整文件。它是模型回答時可用的一種能力來源。

**Knowledge cutoff（知識截止）** 是模型供應商用來說明訓練知識大致涵蓋到何時的資訊。它不是每個問題都固定的斷點，也不代表模型完全無法談論更新事件。Agent 可能從目前專案、搜尋工具或使用者提供的 Context 取得較新的資料。反過來說，即使某 API 在模型訓練前已存在，模型仍可能記錯名稱或把相近版本混在一起。截止日期不能替代當前文件查證。

**Contextual knowledge（脈絡知識）** 是本次請求可讀取的資訊，例如使用者指令、對話歷史、程式碼、工具輸出和附加文件。它可能比參數知識新，也可能包含錯誤或互相矛盾的材料。檔案在工作目錄裡，不代表模型已讀過；搜尋結果進入對話，也不代表結果完整。要確認 Agent 依據了什麼，應追到實際提供的內容和來源。

假設模型把一個不存在的設定欄位 `retryOnQuota` 加進 `client.config.ts`。如果目前套件文件沒有這個欄位，模型也沒讀到該版本的型別宣告，這可能是它依通用模式補出的猜測。若專案內早已定義欄位為 `retryOnRateLimit`，工具卻讀了舊分支的程式碼，問題則是 Context 來源不正確。兩種錯誤都表現為改錯程式，但修正路徑不同：前者補足權威來源並要求驗證，後者先讓工具讀對檔案與版本。

## Hallucination 和 Sycophancy 是不同問題

**Hallucination（幻覺）** 在生成式 AI 討論中，通常指看似合理、卻缺少足夠根據或與可查事實不符的輸出。程式工作裡包括虛構 API、把不存在的測試說成已通過、引用錯誤文件，或把推測的根因寫成已確認結論。這個詞本身不告訴你錯誤來自模型知識、輸入脈絡、工具失靈，還是驗收流程缺漏。

模型生成一段流暢答案，並不等於查詢了真實資料。檢查它有沒有實際讀到文件、執行命令或取得工具結果，再比對其主張是否對得上證據。若它只說「測試已通過」，但沒有測試程序輸出，就只能記錄為尚未驗證。若它讀取了測試結果但忽略失敗摘要，問題可能在它使用 Context 的方式，而非結果不存在。

TruthfulQA 是研究模型是否重複人類常見錯誤信念的問答基準。原論文使用 817 個問題、涵蓋 38 類主題，並評估當時的 GPT-3、GPT-Neo/J、GPT-2 和 T5 模型。這項工作能說明某些模型在特定問答條件下會產生不實回答，卻不能直接換算成今天某個程式 Agent 的「幻覺率」，也沒有測量編譯器或程式碼審查的錯誤比例。

**Sycophancy（迎合）** 是模型的回答隨著使用者立場或暗示改變，即使該立場不正確也傾向附和。例子是使用者問「這次測試失敗一定是資料庫壞掉吧？」模型立刻把資料庫列為唯一根因，沒有看錯誤堆疊、比較最近變更或提出反例。它和 Hallucination 可以同時發生：模型可能先迎合錯誤前提，再編出一段不存在的資料庫日誌來支持它。

要判斷迎合，不要只看語氣是否肯定或客氣。把同一份證據拿來問兩種中性問題，觀察答案是否只因使用者提示不同就翻轉；再檢查回答有沒有指出前提、支持資料和反證。Simple synthetic data reduces sycophancy 研究在多項意見題及客觀算術題上觀察模型迎合，也報告了對特定 PaLM 模型加入合成資料微調後的結果。它支持「提示中的立場可能影響模型回答」這個風險，不表示所有模型都同樣迎合，或可以只靠要求「不要迎合我」消除問題。

## Context 有空間，不代表每條資訊都用得好

**Context window（上下文窗口）** 是單次模型請求能接收和生成內容的 Token 容量；它回答「最多能放多少」，不直接回答模型「會不會可靠使用全部內容」。因此要把容量限制和資訊運用品質分開。把整個 repo、所有工具輸出和全部聊天紀錄塞進窗口，沒有保證比只給目前相關模組和規格更準確。

**Attention relationship（注意力關係）** 是詞典用來談 Token 之間如何互相影響的教學詞彙。理解它時，可以看標準 Transformer 的 dense self-attention：每個位置的 Query 會和序列中各位置的 Key 計算分數。長度為 N 的序列，單一注意力頭會形成概念上的 N × N 分數關係；加上向量維度，典型計算量隨序列長度平方增加，常簡寫為 O(N²) 的序列成本。

這個 O(N²) 是特定架構及注意力形式的計算複雜度直覺，不是說模型持有一個固定數量的「關係點數」，再把它平均分給每一對 Token。分數由輸入內容和學得的表示計算而來，也會在不同層和注意力頭間改變。它不能推出「N 變大後，每個重要關係就必然只剩 1/N² 的重要性」。

平方複雜度也不是所有模型的共同規則。Longformer 以局部窗口搭配任務相關的全域注意力，提出隨序列長度線性擴展的注意力形式。其他模型也可以採不同稀疏模式或架構。即使某模型使用標準 dense attention，N² 成長說明的是運算和記憶體成本，不足以單獨證明它會在某個固定長度後忘記指定內容。把成本複雜度直接當成認知退化機制，是跨越了證據。

**Attention budget（注意力預算）** 在這份詞典裡是解釋性說法，用來提醒讀者：長 Context 內包含的內容愈多，模型要處理的訊息和干擾也可能增加。它不是標準化、可從 API 讀取的數值，不能像 Token 用量那樣精確計量。也不要把它誤認為模型真的把一份固定注意力配額逐條耗盡。

**Attention degradation（注意力退化）** 描述一種可觀察的結果：輸入越長或資訊配置越差時，模型處理關鍵條件的表現下降。可能的原因包括重要資訊位置、同一要求前後矛盾、舊版規格混入、冗長命令輸出，或摘要省略了例外條件。實務上先確認問題是否可重現，再縮短或重排 Context；不要看到長 prompt 就直接斷定是注意力機制造成。

Lost in the Middle 研究測量模型在多文件問答和 Key-Value 擷取任務中，能否找到 Context 裡的相關資料。研究者觀察到，在該實驗設定下，相關資訊放在脈絡中段時，模型表現常低於放在開頭或結尾。這是特定模型、資料和任務上的位置效應證據，不代表所有程式任務都會有同一曲線，也沒有提供一個普遍適用的失效 Token 門檻。

**Smart zone（適用區間）** 是詞典對有效 Context 範圍的教學比喻。它提醒你，內容夠用但不雜亂，往往比一味追求更長的窗口實際。它不是產品規格、模型內部區域或通用數字。適用範圍會隨模型、工具、任務、來源品質和資訊排列而變，必須用自己的工作負載評估。

改善 Context 品質時，先標出哪份文件是現行規格、哪份只是歷史參考，並帶上路徑、版本或更新時間，讓模型不必猜資料的地位。把目前任務所需的規則和反例放在近處，將大量背景資料留給搜尋或按需讀取。摘要可以縮短輸入，卻可能省掉例外；如果結果依賴一個例外條件，就回到原始來源核對摘要有沒有保留它。這些做法改善的是輸入的可用性，不能保證模型必然採納每項資訊。

## 用症狀選一個可驗證的假設

不要一看到錯誤就先替模型指定原因。先保存原始請求、Agent 當時看得到的 Context、工具呼叫和結果，再用一項一項的檢查排除問題。

| 觀察到的狀況 | 先檢查什麼 | 可採取的下一步 |
| --- | --- | --- |
| 引用不存在的套件 API | 目前安裝版本、官方文件、型別宣告有沒有進入 Context | 讀取當前版本來源，做最小呼叫或型別檢查 |
| 把使用者提出的猜測當成根因 | 提示是否暗示結論，回答有沒有證據和反例 | 改用中性問題，要求分開列出觀察、推論與未知 |
| 先前限制到後面消失 | 限制是否出現在本輪 Context、是否被摘要保留 | 重新讀取權威規格，讓關鍵限制靠近當前任務 |
| 文件已更新，回答仍引用舊規格 | 使用的來源、分支和文件版本是否正確 | 以目前 repo 和一手文件核對，不用模型記憶代替查證 |
| Context 變長後重現率增加 | 是否有位置變化、重複資料或衝突要求 | 固定任務與模型，比較精簡 Context 和原始 Context |
| 模型說任務完成，外部狀態卻未改變 | 工具是否真正執行、結果是否成功、是否有 readback | 查工具紀錄和目標系統的實際狀態 |

以一次測試失敗為例，可以先把「資料庫故障」當待驗證假設，而不是提示中的已知事實。讀測試輸出確認失敗發生在連線、查詢或斷言；核對本次變更是否觸及相關程式碼；再讓 Agent 根據證據解釋其他可能原因。若答案隨著提問語氣改變，檢查 Sycophancy；若它引用了不存在的設定，檢查 Hallucination 與參數知識來源；若它漏看中途提供的連線限制，確認該限制是否進入 Context、是否被摘要或後續訊息覆蓋。這三種診斷可以並存，但每一種都需要自己的證據。

當問題和長 Context 有關，做可比較的試驗比猜測模型內部狀態有效。固定模型版本、任務、工具和評分標準，只改一個條件，例如把關鍵文件放在 Context 開頭、移除無關輸出，或用檢索工具只載入相關檔案。比較結果時記錄完整輸入，並重複足夠次數以分辨一次隨機差異和穩定變化。若任務會影響正式資料，先在可重設的測試環境執行。

修正手段應對準原因：缺少最新事實就查來源；Context 互相矛盾就指定權威文件；出現迎合就要求檢驗使用者前提；工具結果沒有支持完成主張就讀回實際狀態；長脈絡表現不穩就控制輸入並測試配置。單純加一句「請不要幻覺」不會補上缺失文件，也不會讓未執行的測試突然變成證據。

## 用成對測試避免把推測當診斷

如果你想知道錯誤是否由迎合造成，先固定程式碼、日誌、模型版本、工具和其他設定，再準備兩個只在使用者立場不同的問法。一個中性地問「有哪些可能原因？」另一個帶入「我猜是資料庫連線，請確認」。檢查模型是否仍依相同證據排序原因，是否明確說明資料不足。多跑幾次並記下完整輸出，因為生成結果可能變動；一次答案差異不足以證明因果。比對時看事實判斷和證據，不要把語氣更委婉就當成已消除 Sycophancy。

如果懷疑 Context 位置造成漏讀，可以建立一個答案可由原始文件確認的任務，將同一段必要條件放在輸入的不同位置，其他材料盡量保持一致。分別測量模型是否找出該條件，以及後續程式或推論是否遵守它。再比較精簡的相關片段和完整歷史。若位置變動同時改變了提示長度、工具結果數或其他內容，就無法把差異單獨歸因於 Attention degradation。研究應固定條件，並將結果限定在測過的模型與任務。

可以把診斷記錄成四欄：模型主張、它可見的來源、實際執行證據、尚未確認的部分。例如「欄位名稱是 `retryOnQuota`」是主張；安裝套件中的型別宣告是來源；編譯結果是執行證據；目前文件是否與部署版本一致則可能仍待確認。這份紀錄會迫使你區分模型記得的內容、當下提供的 Context 和已讀回的狀態。對高影響改動，讓程式測試、型別檢查或外部系統狀態作為獨立驗證，別只讓同一個模型替自己的回答打分。

本篇對應原 repo 固定版本的 [Section 4：Failure Modes](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/internal/Curriculum.md#section-4--failure-modes)，並依 [Sycophancy](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-sycophancy)、[Hallucination](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-hallucination)、[Parametric knowledge](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-parametric-knowledge)、[Knowledge cutoff](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-knowledge-cutoff)、[Contextual knowledge](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-contextual-knowledge)、[Attention relationship](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-attention-relationship)、[Attention budget](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-attention-budget)、[Attention degradation](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-attention-degradation) 和 [Smart zone](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-smart-zone) 逐詞展開。研究依據包括 [TruthfulQA](https://aclanthology.org/2022.acl-long.229/)、[Simple synthetic data reduces sycophancy](https://arxiv.org/abs/2308.03958)、[Attention Is All You Need](https://arxiv.org/abs/1706.03762)、[Longformer](https://arxiv.org/abs/2004.05150) 與 [Lost in the Middle](https://arxiv.org/abs/2307.03172)。
