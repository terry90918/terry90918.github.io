---
title: 'ChatGPT 醫療更新：代理開始跨系統辦事，人工審查與資料邊界仍要逐步確認'
publishedAt: '2026-11-17T05:00:00+08:00'
status: published
excerpt: 'OpenAI 更新醫療代理、臨床搜尋與外掛，11 月 24 日另開放 Healthcare API 模型設定。整理工作區與 API 的資格、費率，以及人工審查與 PHI 資料條件。'
tags:
  - OpenAI
presentation:
  type: feature
  category: OpenAI
  audio:
    src: /audio/2026/openai-healthcare-2026-11-17-notebooklm.mp3
    duration: 1394.34
  video:
    src: https://terry-blog-prod-public-media.nbg1.your-objectstorage.com/videos/2026/152d7b3283f01b91838f45c0286abaa478e3c1930cb3e229ad53255eae2f87d4.mp4
    poster: https://terry-blog-prod-public-media.nbg1.your-objectstorage.com/posters/2026/a0660dcef851ca63890ca90317808449cf65155b5caeba9b32120cb4d03a46a6.jpg
    title: ChatGPT醫療更新：代理與限制
---

作者：Terry Chen。本文為官方資料整理與作者觀察，未使用真實病歷，也未實測醫療系統或臨床流程。

2026 年 11 月 25 日補充：新增下方「11 月 24 日更新：醫療模型設定開放給 API 組織」一節。上方播客與解說影片保留原版內容，涵蓋 11 月 16 日公告，未包含這次 API 補充。

醫師決定安排檢查之後，工作往往還沒結束。病歷、保險事前核准、轉診與排程可能分散在不同系統，仍需要有人查資料、填欄位、追蹤下一步。OpenAI 在 2026 年 11 月 16 日公布 ChatGPT for Healthcare 更新，將電腦操作代理、改進的臨床搜尋，以及二十多個新醫療外掛放到同一套工作流程中。[官方更新公告](https://openai.com/index/more-ways-to-move-care-forward-with-chatgpt-for-healthcare/)

這次更新值得注意的地方，是 AI 開始從整理資訊走向跨系統操作。讀懂它，需要分別確認三件事：能找到什麼資料、能執行哪些步驟，以及誰負責在送出之前審查。

## 醫療代理能操作既有介面，示範仍保留人工確認

電腦操作代理可以讀取畫面、點擊、輸入文字，在不同應用程式間移動。這讓沒有完整 API 的醫療軟體，也可能接進多步驟流程。官方以 MRI 事前核准示範：代理讀取電子病歷中的就診紀錄、物理治療與過往影像資料，準備檢查醫囑、就診紀錄及病患回覆，再到保險入口準備核准申請。[電腦操作研究與示範](https://openai.com/index/advancing-computer-use-for-healthcare-teams/)

這段展示使用合成病患資料；醫囑與回覆要由臨床人員審查，保險申請也要交給負責人員確認。它展示的是一段受控流程，不能直接推論代理已能獨立作出醫療決策，或所有院所的軟體都能照樣運作。[示範資料與人工審查安排](https://openai.com/index/advancing-computer-use-for-healthcare-teams/)

官方同時介紹不同階段的合作案例。CVS Health 已在部分正式流程使用代理處理文件與會診相關系統步驟，並以驗證、截圖、動作紀錄及人工監督確認結果；Abridge 則仍在開發相關代理。Ambience 的展示中，代理遇到模糊紀錄會停下來詢問，提交前等待核准。這些案例的開發、試行與部署狀態不同，閱讀時不宜全部當成普遍上線的產品能力。[合作案例及各自進度](https://openai.com/index/advancing-computer-use-for-healthcare-teams/)

## 99% 安全評分與 94.3% 得分，各自回答不同問題

OpenAI 針對 GPT-6 Astra 在電子病歷收件匣工作的表現進行評估。審查者會一起看代理動作、產出的紀錄、醫囑與病患訊息，判斷錯誤、遺漏或動作是否可能造成傷害。在 325 個受審任務中，99% 被評為安全；另有 646 次有用性評估，其中 93% 被醫師評為「很有幫助」或「極有幫助」。這是官方報告的特定任務結果，不能改寫成所有臨床情境的安全率或病患治療成效。[臨床安全與有用性評估](https://openai.com/index/advancing-computer-use-for-healthcare-teams/)

行政工作則使用史丹佛研究者提出的 HealthAdminBench。官方公布 GPT-6 Astra 取得可得評分點數的 94.3%，GPT-6 Luna 為 91.8%；兩者都使用最大推理強度。Luna 在該評估中每個任務成本為 8.5 美分，比 Astra 低 98%。這些數字描述該測試的評分與模型成本，不能直接套成醫院每筆案件的完整成本、成功率或省下的人力。[行政基準與成本條件](https://openai.com/index/advancing-computer-use-for-healthcare-teams/)

我的看法是，這些結果有助於找出適合先試行的流程，但實際部署仍要確認病人身分、資料完整性、欄位內容與送出結果。高分不會替代每個系統的驗證，也不會替機構決定哪些動作可以免除人工審查。

## 臨床搜尋提供可追溯來源，仍需要回到原文判讀

這次臨床搜尋更新同時涵蓋 ChatGPT for Healthcare 與 ChatGPT for Clinicians，改善醫學證據的搜尋、評估與引用。官方表示，醫師在超過 1,300 次盲評中，對更新後體驗在八個面向都給予較高評價，面向包括事實正確性、安全性、可採取行動程度及來源權威性。這是回答品質評估，並非臨床試驗證明病患結果改善。[搜尋更新與官方評估](https://openai.com/index/more-ways-to-move-care-forward-with-chatgpt-for-healthcare/)

Help Center 說明，回覆會附標題、期刊、作者與出版日期等引用資訊，讓使用者追查醫學文獻、指引及公共衛生來源。部分期刊仍需要訂閱或機構存取；取得引用不等於已取得全文，也不等於研究適用於眼前的病人。官方仍要求在應用到照護之前，檢查原文的方法、結果與限制。[臨床搜尋的使用方式](https://help.openai.com/en/articles/20001046-chatgpt-for-healthcare)

## 二十多個外掛，把病歷、排程與行政資料接進對話

官方新增的醫療外掛涵蓋臨床照護、協調與營運。例子包括用 Metriport 整理外院病歷、UpToDate Expert AI 查臨床指引、Luma Health 處理預約相關工作、Stedi 或 TriZetto 查保險資格，以及 Turquoise Health 比較議定費率。這些用途的共同點，是讓不同系統的資料能在同一段工作中銜接。[醫療外掛公告](https://openai.com/index/more-ways-to-move-care-forward-with-chatgpt-for-healthcare/)

外掛列在清單上，還需要管理員開放、相應帳號、供應商設定與使用權限。Metriport 需要供應商導入程序；Elation Health 與 TriZetto 要求 HIPAA-enabled 工作區。Photon 能草擬、審查及送出處方，但處方簽署與送出需要醫療人員驗證，每張處方都要由開方者審查授權，且不支援管制藥物。[各外掛的設定與限制](https://help.openai.com/en/articles/20001046-chatgpt-for-healthcare)

也要分清公開資料與病歷連線。Healthcare Public Data 的應用程式唯讀搜尋公開醫療來源，不讀取病患病歷；查詢這些公開來源時，也不應輸入病患姓名、病歷號碼或其他 PHI。[公開資料的 PHI 限制](https://help.openai.com/en/articles/20001202-chatgpt-for-clinicians)

Epic 外掛則供獲准機構連接經授權的病歷資料，遵守既有權限，同樣是唯讀，而且不提供給個人的 ChatGPT for Clinicians 帳號。不能把電腦操作代理在示範中的寫入能力，套到每個病歷外掛上。[公開資料與 Epic 的不同範圍](https://help.openai.com/en/articles/20001046-chatgpt-for-healthcare)

## 個人免費資格、機構採購與 BAA，分開確認

ChatGPT for Clinicians 免費提供給符合資格、完成驗證的美國臨床人員，目前列有醫師、專科護理師（nurse practitioner，NP）、醫師助理與藥師。申請需要有效 NPI 及可驗證執照。這不是一般 Plus 或 Pro 帳號自動新增的醫療方案，也不能由公告推論台灣醫療人員已符合資格。[Clinicians 資格與驗證](https://help.openai.com/en/articles/20001202-chatgpt-for-clinicians)

機構集中部署則使用 ChatGPT for Healthcare，由組織管理功能與存取；符合資格的機構也可以透過 AWS Marketplace 採購，實際資格與報價需聯絡 OpenAI 或 AWS。官方說明 Work、Codex 的電腦操作及改進的臨床搜尋已可使用，但仍受工作區設定影響；個人 Clinicians 只提供其中適用的外掛。這次公告沒有公布一個適用所有機構的固定價格。[開放範圍與採購](https://openai.com/index/more-ways-to-move-care-forward-with-chatgpt-for-healthcare/)

資料不拿來訓練模型，是官方對 Healthcare 的承諾之一，但這和完整的資料使用資格是兩件事。處理受保護健康資訊（PHI）時，還需要有效的商業夥伴協議（BAA）、適用產品與功能，以及指定的安全與保留設定。第三方連線也有自己的協議、權限與資料處理方式。[HIPAA 適用產品與功能](https://help.openai.com/en/articles/20001069-hipaa-eligible-products-and-functionality)

官方清單目前將 Work 雲端瀏覽器使用、Work 雲端網路存取、事件觸發排程及 improved memory 等功能列為不受 BAA 涵蓋；可用功能也不自動代表特定用途或第三方服務受涵蓋。因此，新聞中的「能跨系統操作」不能直接等同於「任何雲端瀏覽與網路流程都能放入 PHI」。組織需要依實際環境、功能及協議逐項確認。[BAA 排除項目與適用條件](https://help.openai.com/en/articles/20001069-hipaa-eligible-products-and-functionality)

## 11 月 24 日更新：醫療模型設定開放給 API 組織

OpenAI 在 2026 年 11 月 24 日的 Model Release Notes 宣布，Healthcare model configurations 已在 API 提供。這類設定將醫療專用指示與臨床搜尋結合，協助應用程式尋找、比較及摘要醫學證據。API 組織可以使用，不需要先購買 ChatGPT for Healthcare 或 ChatGPT Enterprise 工作區。[官方發布紀錄](https://help.openai.com/en/articles/9624314-model-release-notes)、[API 使用資格與功能](https://help.openai.com/en/articles/20001656-healthcare-model-configurations-in-the-openai-api)

開發者在 Responses API 指定支援的醫療模型 ID，例如 `gpt-6.2-astra-healthcare`；要使用專用醫療搜尋索引，必須啟用 web search。模型設定本身的存取與搜尋工具的啟用，是兩個需要確認的項目。官方列出的用途包括臨床問題、研究比較與附引用的證據摘要，仍要求使用者檢查回答及引文，不能取代專業醫療判斷。[模型設定及搜尋條件](https://help.openai.com/en/articles/20001656-healthcare-model-configurations-in-the-openai-api)

目前官方全球 Standard 費率如下，單位為每百萬 token 的美元價格。短上下文指輸入不超過 272K token，長上下文指超過 272K；這張表只列模型的輸入、快取輸入與輸出，不代表整個應用的總成本。資料駐留的區域處理端點，對 2026 年 3 月 5 日起發布的模型加收 10%；FedRAMP 端點也加收 10%。[Healthcare model configuration 費率](https://developers.openai.com/api/docs/pricing#healthcare-model-configurations)

| 模型與上下文                       | 輸入 | 快取輸入 | 輸出 |
| ---------------------------------- | ---- | -------- | ---- |
| GPT-6.2 Astra Healthcare，短上下文 | $8   | $0.40    | $40  |
| GPT-6.2 Astra Healthcare，長上下文 | $16  | $0.80    | $80  |
| GPT-6.2 Sol Healthcare，短上下文   | $2   | $0.10    | $10  |
| GPT-6.2 Sol Healthcare，長上下文   | $4   | $0.20    | $20  |

官方價格頁另列工具費用，web search 的呼叫及搜尋內容 token 需要依適用規則計費。因此，估算一次文獻搜尋的成本，還要計入工具用量；不能只拿上表的輸出價格當成每次搜尋費，也不能把 ChatGPT 訂閱視為這些 API 費用已包含在內。[模型與工具計費](https://developers.openai.com/api/docs/pricing)

處理受保護健康資訊（PHI）的資格，需要另外確認。官方明示，取得 Healthcare 模型設定的存取權，並不自動授權組織使用 PHI；組織必須先有適用的 BAA，並符合帳戶及工具設定要求。HIPAA 適用文件另要求 API 組織啟用 Modified Retention，除非 OpenAI 另有指定；`/v1/responses` 列在適用端點中，仍需符合前述條件。[PHI 條件](https://help.openai.com/en/articles/20001656-healthcare-model-configurations-in-the-openai-api)、[API 的 BAA 與保留設定](https://help.openai.com/en/articles/20001069-hipaa-eligible-products-and-functionality)

API 的 BAA 不要求企業合約，但自助申請需要已有 API 使用紀錄，並由具備權限與簽約授權的組織管理員操作。簽妥 BAA、啟用 HIPAA compliance support，也不會自動讓應用程式符合 HIPAA；組織仍要評估實際使用方式與適用義務。[BAA 申請資格與責任](https://help.openai.com/en/articles/8660679-getting-a-business-associate-agreement-for-the-openai-api)

這項補充改變的是開發者的接入方式與選項。原文的電腦操作代理、Epic 唯讀外掛、個人 Clinicians 資格及工作區 BAA 限制，仍應分別查核；API 醫療模型設定的推出，不能直接證明這些功能也一起新增或放寬。本文沒有用真實病歷測試 API，也沒有據此判定任何應用已可投入臨床使用。

## 從草稿到送出，需要各自的證據

這次更新讓醫療 AI 的範圍更具體：搜尋提供證據，外掛連接資料，電腦操作代理補上系統介面之間的步驟。它們可以合作，權限與驗收方式仍各不相同。

我會把實際導入的重點放在每個交接點：引用能否追到原文、讀到的是不是正確病歷、草稿是否經過授權人員確認、提交後系統是否真的接受，以及能否留下稽核紀錄。這是本文對官方資料的觀察，未以公告或示範代替實際部署驗收。

原文依截至 2026 年 11 月 18 日的官方資訊整理；API 補充依截至 2026 年 11 月 25 日可查核的官方資訊整理。產品資格、外掛、功能涵蓋與價格仍可能調整，實際使用前應重新查閱官方文件及機構協議。
