---
title: 'ChatGPT 醫療更新：代理開始跨系統辦事，人工審查與資料邊界仍要逐步確認'
publishedAt: '2026-11-17T05:00:00+08:00'
status: draft
excerpt: 'OpenAI 更新醫療電腦操作代理、臨床搜尋與二十多個外掛。整理使用資格、評測範圍，以及從病歷草稿到實際送出之間的審查與資料限制。'
tags:
  - OpenAI
presentation:
  type: feature
  category: OpenAI
---

作者：Terry Chen。本文為官方資料整理與作者觀察，未使用真實病歷，也未實測醫療系統或臨床流程。

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

也要分清公開資料與病歷連線。Healthcare Public Data 的應用程式唯讀搜尋公開醫療來源，不讀取病患病歷；Epic 外掛則供獲准機構連接經授權的病歷資料，遵守既有權限，同樣是唯讀，而且不提供給個人的 ChatGPT for Clinicians 帳號。不能把電腦操作代理在示範中的寫入能力，套到每個病歷外掛上。[公開資料與 Epic 的不同範圍](https://help.openai.com/en/articles/20001046-chatgpt-for-healthcare)

## 個人免費資格、機構採購與 BAA，分開確認

ChatGPT for Clinicians 免費提供給符合資格、完成驗證的美國臨床人員，目前列有醫師、進階執業護理師、醫師助理與藥師。申請需要有效 NPI 及可驗證執照。這不是一般 Plus 或 Pro 帳號自動新增的醫療方案，也不能由公告推論台灣醫療人員已符合資格。[Clinicians 資格與驗證](https://help.openai.com/en/articles/20001202-chatgpt-for-clinicians)

機構集中部署則使用 ChatGPT for Healthcare，由組織管理功能與存取；符合資格的機構也可以透過 AWS Marketplace 採購，實際資格與報價需聯絡 OpenAI 或 AWS。官方說明 Work、Codex 的電腦操作及改進的臨床搜尋已可使用，但仍受工作區設定影響；個人 Clinicians 只提供其中適用的外掛。這次公告沒有公布一個適用所有機構的固定價格。[開放範圍與採購](https://openai.com/index/more-ways-to-move-care-forward-with-chatgpt-for-healthcare/)

資料不拿來訓練模型，是官方對 Healthcare 的承諾之一，但這和完整的資料使用資格是兩件事。處理受保護健康資訊（PHI）時，還需要有效的商業夥伴協議（BAA）、適用產品與功能，以及指定的安全與保留設定。第三方連線也有自己的協議、權限與資料處理方式。[HIPAA 適用產品與功能](https://help.openai.com/en/articles/20001069-hipaa-eligible-products-and-functionality)

官方清單目前將 Work 雲端瀏覽器使用、Work 雲端網路存取、事件觸發排程及 improved memory 等功能列為不受 BAA 涵蓋；可用功能也不自動代表特定用途或第三方服務受涵蓋。因此，新聞中的「能跨系統操作」不能直接等同於「任何雲端瀏覽與網路流程都能放入 PHI」。組織需要依實際環境、功能及協議逐項確認。[BAA 排除項目與適用條件](https://help.openai.com/en/articles/20001069-hipaa-eligible-products-and-functionality)

## 從草稿到送出，需要各自的證據

這次更新讓醫療 AI 的範圍更具體：搜尋提供證據，外掛連接資料，電腦操作代理補上系統介面之間的步驟。它們可以合作，權限與驗收方式仍各不相同。

我會把實際導入的重點放在每個交接點：引用能否追到原文、讀到的是不是正確病歷、草稿是否經過授權人員確認、提交後系統是否真的接受，以及能否留下稽核紀錄。這是本文對官方資料的觀察，未以公告或示範代替實際部署驗收。

以上依截至 2026 年 11 月 17 日可查核的官方資訊整理。產品資格、外掛、功能涵蓋與價格仍可能調整，實際使用前應重新查閱官方文件及機構協議。
