---
title: 'GPT-6.2 Astra 與 Sol 上線：Work、Codex 的選擇，以及速度背後的用量'
publishedAt: '2026-11-19T05:00:00+08:00'
status: published
excerpt: 'OpenAI 推出 GPT-6.2 Astra 與 Sol。整理 Work、Codex 的使用入口、Pro 200 的 Ultrafast 新資格、額度消耗與限時點數費率，以及 API 價格和評測限制。'
tags:
  - OpenAI
presentation:
  type: feature
  category: OpenAI
  audio:
    src: /audio/2026/openai-gpt62-2026-11-19-notebooklm.mp3
    duration: 1566.998639
  video:
    src: https://terry-blog-prod-public-media.nbg1.your-objectstorage.com/videos/2026/885f4c62b220573550da72f7541e2ba14cc01cb0155362a7cb88ca9f2703f8a4.mp4
    poster: https://terry-blog-prod-public-media.nbg1.your-objectstorage.com/posters/2026/19006a14514bbf3dfa85d6924221d717dfbf73e0e54af29ebe66174a774dcef1.jpg
    title: GPT-6.2 Astra 與 Sol 指南
---

作者：Terry Chen。本文依 2026 年 11 月 19 日查核的官方公告與文件整理，包含作者對工作流程的觀察；未進行模型效能或帳務實測。

把一批資料整理成能交付的報告，通常需要多次搜尋、讀檔、計算與修改。模型的單次回答更好，還要搭配整段工作的效率，才知道同一份預算能完成多少事。OpenAI 在 11 月 17 日推出 GPT-6.2 Astra 與 GPT-6.2 Sol，將這次更新放在專業成果與多步驟工作的改善上。[官方發布公告](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

對使用者來說，先確認三件事就能減少誤解：在哪個入口選模型、哪種速度會消耗多少額度，以及官方評測到底測了什麼。

## 11 月 23 日更新：GPT-6.2 也開始進入 Chat 分頁

OpenAI 在 11 月 23 日宣布，為日常對話調整的 GPT-6.2 開始向全球 Plus、Pro、Business 與 Enterprise 逐步推出。Chat 使用的是 GPT-6.2 Sol 的一個版本；Enterprise 是否能用，仍取決於工作區管理員設定。公告沒有列出 Free、Go 或 Edu，不宜自行擴大適用方案。[ChatGPT release notes，11 月 23 日](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

這是 Chat 入口的後續更新，沒有更換 Work 和 Codex 背後的模型。下文「普通 Chat 維持原有模型選項」描述的是 11 月 17 日推出 Astra／Sol 時的狀態，不能再當成 11 月 23 日以後 Chat 的完整說明。這則公告也沒有宣布訂閱額度翻倍或調整價格。[本次適用範圍](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

官方將改善重點放在圖片理解、遵循複雜指令與網路查找，並刊出內部評測結果。這些數據有特定題目與推理設定，不能直接當成個人任務的成功率，本文也沒有做模型比較實測。[官方評測摘要](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

同日 system card 的開頭只提 Plus、Pro，release notes 則明列四種方案；本文以 release notes 的 Availability 段落說明推出資格，system card 用來閱讀模型風險與防護評估，不把兩者寫成完全一致。[GPT-6.2 in ChatGPT system card](https://deploymentsafety.openai.com/gpt-6-2-chatgpt/gpt-6-2-chatgpt.pdf)

本頁播客與解說影片沿用 11 月 19 日原稿，內容範圍是當時的 Work、Codex、用量與價格，未涵蓋這段 11 月 23 日補充。

## Astra 處理複雜專案，Sol 面向日常多步驟工作

官方將 Astra 定位於較困難的專業工作，例如在既有程式庫中完成修改與測試，或依指定模板製作簡報；Sol 則面向日常寫作、程式開發與多步驟任務。這是產品定位，實際選擇仍需看資料規模、工具與交付要求。[模型定位與工作示例](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

公告強調兩個模型能以較少輸出 token 完成工作。Sol 沿用前代 API 單價，效率提升可能讓同樣預算支撐更多任務；Astra 同時降低單價。但「能完成更多工作」沒有固定倍數，也不代表所有訂閱方案的額度又翻倍。長對話、推理程度、工具呼叫與速度設定，仍會影響用量。[官方效率說明](https://openai.com/index/introducing-gpt-6-2-astra-sol/)、[Work 與 Codex 用量說明](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)

我的選擇方式是先用一份明確的交付要求比較：來源能否追溯、檔案能否開啟、數字能否重算、修改是否通過測試。若 Sol 已能穩定完成，就沒有必要只因為 Astra 的定位較高而切換；困難的資料整合與跨檔案修改，再用 Astra 比較重做次數與總用量。這是工作方法的建議，尚不是本文實測得到的效能結論。

## 到 Work 或 Codex 選模型，工作區還有權限條件

ChatGPT 的入口要分清楚。官方 release notes 說明，Plus、Pro 使用者可在 Work 的模型選單，或 Codex 的模型選擇器中選取新模型；當時普通 Chat 維持原有模型選項；11 月 23 日 Chat 的後續變動見上方補充。管理式工作區則取決於席次與管理員設定。[ChatGPT release notes，11 月 17 日](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

Enterprise、Edu 的預覽預設關閉，工作區擁有者可對整個工作區或指定角色啟用。官方列出美國與歐盟的標準推論支援，要求 UAE 推論的工作區不能使用這次預覽。Business 也有自己的模型開放說明，因此不能因發布公告的一段方案清單未列 Business，就斷定它被排除。[Enterprise 與 Edu 開放條件](https://help.openai.com/en/articles/10128477-chatgpt-enterprise-and-edu-release-notes)、[Business release notes](https://help.openai.com/en/articles/11391654-chatgpt-business-release-notes)

找不到選項時，先確認帳號、工作區及 Work／Codex 入口，再檢查模型權限與桌面程式更新。查核時的官方文件列出 Codex CLI 至少需要 0.166.0，不能把選單尚未出現直接判定成額度用完。[模型入口與更新步驟](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)

## Pro 200 新增 Sol Ultrafast，額度按六倍速率消耗

這次重要的方案變動，是 Pro 200 可以在 Codex 使用 GPT-6.2 Sol 的 Ultrafast。Pro 500 則可對 GPT-6.2 Astra 與 Sol 使用 Ultrafast。兩者都需要帳號實際具備相應存取資格。[新模型與速度開放公告](https://developers.openai.com/codex/changelog/)

| 方案或工作區               | GPT-6.2 Ultrafast 範圍 | 計量重點                                                   |
| -------------------------- | ---------------------- | ---------------------------------------------------------- |
| Pro 200                    | Codex 的 Sol           | 先消耗內含 Work／Codex 額度，速率為同模型 Standard 的 6 倍 |
| Pro 500                    | Astra 與 Sol           | 先消耗內含 Work／Codex 額度，速率同為 6 倍                 |
| 符合資格的 Enterprise、Edu | 依工作區開放           | 使用工作區點數，並受權限控制                               |
| Plus、Pro 100、Business    | 未開放 Ultrafast       | 購買點數也不會解鎖                                         |

對上述 Pro 200 的 Sol 與 Pro 500 的兩個新模型，內含額度用完後，購買點數的 Ultrafast 用量暫按 Standard 的 3 倍計價，優惠到 **2027 年 2 月 28 日**。這個期限屬於額外點數費率，不能套到內含額度，也不能寫成永久優惠。[Ultrafast 資格、速率與促銷期限](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)

六倍是額度消耗率，並非保證速度快六倍。舊 GPT-6 Astra、GPT-6.1 Sol 的 Ultrafast 計量也不同，不能把舊模型的 8 倍內含額度、6 倍點數費率直接套到 GPT-6.2。查核時 Pro 方案總覽仍有僅 Pro 500 可用 Ultrafast 的舊說明；本段依較新發布公告與明列新模型例外的 Work／Codex 文件整理，選擇時仍應核對帳號顯示的模型及費率。[新模型例外與舊模型規則](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)、[Pro 方案總覽](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers)

## API 標準單價下降，不等於每項任務固定省多少

API 與訂閱分開計費。以 ChatGPT 登入 Codex，使用的是方案的用量與帳務；改用自己的 API key，則依 API 價格計算。[登入與計費方式](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)

官方公告列出的 Standard API 單價如下，單位均為每一百萬 token 的美元價格：

| 模型          | 輸入   | 快取輸入  | 輸出    |
| ------------- | ------ | --------- | ------- |
| GPT-6.2 Astra | 8 美元 | 0.40 美元 | 40 美元 |
| GPT-6.2 Sol   | 2 美元 | 0.10 美元 | 10 美元 |

Astra 的一般輸入與輸出單價比 GPT-6 Astra 低 20%，快取輸入單價低 60%；Sol 沿用 GPT-6.1 Sol 的單價。這些是標準 token 費率，不是 Ultrafast 報價，也不是每個專案的總成本。[官方 API 價格與比較基準](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

實際成本還取決於輸入量、推理與輸出量、快取命中，以及額外工具與服務。官方建議保持提示前綴穩定、將新指示追加至對話，以利重用快取與保留推理；是否適合自己的流程，仍需用實際請求的帳務與結果驗證。[官方整合建議](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

## 評測是線索，交付仍要驗收

公告涵蓋長時間專業工作、科學終端操作、法律任務與 3D 設計等評測。其中 GDPval v2 是 OpenAI 內部評測；對手在 Agents’ Last Exam 的結果也有排除使用備援模型任務的條件。不同測試的得分、花費與推理設定，不能拼成適用所有工作的統一排名。[評測範圍與註記](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

資安數據尤其需要保留測試條件。官方表示部分展示使用停用資安防護與分類器的內部設定；公開服務則加強高風險資安請求的限制。測試中的能力不代表一般帳號有相同操作權限，公告也沒有說 GPT-6.2 已全面開放 Daybreak 的特殊存取。[資安能力與發布限制](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

另一個與日常使用直接相關的發現，是兩項測試中，新模型較容易省略工作受阻的資訊，例如檔案缺失或搜尋工具不可用。OpenAI 說已在 Codex 加入指示來大幅降低這類省略，並持續調查。這提醒我，驗收時除了看成果，也要要求列出未完成項目與缺少的證據，才能知道下一步該補什麼。[官方對障礙揭露的觀察](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

GPT-6.2 帶來更多模型與速度選擇。真正要比較的，是在自己的資料、權限與交付標準下，哪個組合能把事情完成，以及為此消耗多少時間與額度。

## 來源與查核範圍

本文查核時間為 2026 年 11 月 19 日。主要依據為 [GPT-6.2 官方公告](https://openai.com/index/introducing-gpt-6-2-astra-sol/)、[ChatGPT release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)、[Work 與 Codex 說明](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)、[Codex changelog](https://developers.openai.com/codex/changelog/)，以及文中各方案官方文件。開放範圍、價格與促銷可能更新，使用前應再核對官方文件及帳號顯示。
