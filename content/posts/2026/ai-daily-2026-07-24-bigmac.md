---
title: '訓練更有效、訂閱暫停、入口擴大：AI 規模競賽開始算效率'
publishedAt: '2026-07-24T05:00:00+08:00'
status: 'published'
slug: 'ai-daily-2026-07-24-bigmac'
excerpt: '最後勝出的未必是房間裡最聰明的模型，也可能是掌握資金、機器與數百萬名使用者的一方。'
tags:
  - ai-news
  - ai-infrastructure
  - model-training
  - ai-policy
---

> 最後勝出的未必是房間裡最聰明的模型，也可能是掌握資金、機器與數百萬名使用者的一方。

![數學獎章、幾何證明與安全研究](/images/ai-daily/2026-07-24/01-fields-math-safety.webp)

## 數學獎得主加入 OpenAI，安全工作接上數學研究

[Quanta 報導](https://www.quantamagazine.org/jacob-tsimerman-wins-2026-fields-medal-for-andre-oort-conjecture-proof-20260723/?ref=aisecret.us)指出，Jacob Tsimerman 因 André–Oort 猜想相關研究，成為 2026 年四位費爾茲獎得主之一。[Mark Chen 的公開貼文](https://digg.com/ai/7u6u1uv5?ref=aisecret.us)歡迎 Tsimerman 加入 OpenAI，並提到他對 AI 安全工作的投入。

Quanta 摘錄提到，Tsimerman 看到一種人類可能難以勝過的新型解題者。這反映他對 AI 數學能力快速進展的疑慮，不代表他預測了確定的時間表或結果。

從公關角度看，這次聘任的影響可能不只在於多了一位安全研究者：在快速商業化之際，費爾茲獎得主加入，能讓 OpenAI 向投資人、監管者與客戶展示公司重視安全研究。OpenAI 並未獲得費爾茲獎，卻能借用其聲望；這也形成一個反差——一位對 AI 數學能力提出疑慮的數學家，成了這家加速 AI 技術發展的公司用來塑造信任形象的標誌。這是對聘任宣傳效果的評論，不是安全表現的獨立證明。

![多模態訓練資料交錯排程，減少 GPU 等待並維持穩定記憶體](/images/ai-daily/2026-07-24/02-bigmac-training-scheduling.webp)

## BigMac 把多模態訓練的等待問題轉為排程問題

由小紅書研究人員參與的 Dots Infra 團隊在[官方 GitHub 專案](https://github.com/Dots-Infra/BigMac)公開 BigMac 程式碼；[論文](https://arxiv.org/html/2605.25451?ref=aisecret.us)也列出作者所屬的研究機構。這套訓練方法會把影像等模態的編碼器與生成器工作嵌入原有的大型語言模型流水線。不同元件的執行時間與記憶體需求不一，分開運算容易留下等待空檔，提前計算又會累積供反向傳播使用的 activation。

在 Qwen3-30B-A3B 的 MLLM-Understanding 工作負載中，論文報告 BigMac 的迭代速度約為 Optimus 的 1.08 至 1.1 倍、Megatron-DistTrain 的 1.6 至 1.9 倍。兩個區間對應不同設計基準，不能合併成同一個加速幅度。論文也指出，BigMac 的記憶體用量在批次增大時保持穩定；這些是作者選定環境中的結果，不能直接套用到所有訓練叢集。

BigMac 瞄準 GPU 閒置和 activation 儲存造成的基礎設施浪費。若它能在商用訓練堆疊重現論文效果，同一個叢集可能訓練更大型的多模態模型、承接更多工作，並降低每個生成 token 背後的基建成本。這仍是有條件的推論；論文沒有測量商用 token 價格，也沒有證明成本已按倍數下降。BigMac 的價值不在於已經讓智慧變便宜，而在於提供改善硬體利用率的可檢驗排程方法。

![開放模型、受控晶片與有限算力入口](/images/ai-daily/2026-07-24/03-kimi-compute-access.webp)

## Kimi K3 讓政策、模型存取與算力容量互相牽動

[CNBC 報導](https://www.cnbc.com/2026/07/23/moonshot-kimi-nvidia-ai-chips-export-ban.html)指出，白宮科技顧問 Michael Kratsios 指控 Moonshot 使用受出口管制的 Nvidia 晶片，並稱 Kimi K3 蒸餾了 Anthropic 的 Fable 模型。這些目前仍是官員的指控，報導並未證實指控成立。另一邊，[Politico 報導](https://www.politico.com/news/2026/07/22/startup-founders-urge-trump-not-to-shut-off-chinese-open-weight-ai-01008992)指出，近 200 家矽谷公司致函特朗普政府，反對切斷美國開發者取得中國開放權重模型的管道。

Nvidia 執行長黃仁勳對 [Axios 表示](https://www.axios.com/2026/07/22/nvidia-jensen-huang-china-open-source-ai?utm_source=chatgpt.com)，優秀的中國開源模型也應該被使用。Kimi K3 上線後需求逼近 Moonshot 現有算力上限；[美聯社報導](https://apnews.com/article/kimi-k3-china-ai-model-us-4c66a2e0f557ce79d3cc2d769c9a6226)指出，公司因此暫停新增消費者訂閱，優先服務既有訂戶，並計畫分批重開名額。這表示消費者訂閱名額受限，不代表 API 全面關閉，也不能證明模型性能或價格勝過美國競品。

各方以「創新」說明立場，背後牽涉的利益卻不同：華府關注晶片與技術管制；新創希望保留中國開放權重模型這項選擇；Nvidia 表示優秀的中國開源模型也應被使用，而使用規模擴大的同時，也可能帶動晶片需求。這些公開主張不等於各方承認了未公開的商業動機。Kimi 事件顯示，矽谷對 AI 發展沒有共同答案，各方仍在爭論誰能取得模型、誰提供算力，以及誰承擔成本。

![手機、搜尋、郵件與雲端工具連結不同 AI 使用入口](/images/ai-daily/2026-07-24/04-gemini-distribution.webp)

## Gemini 的用戶規模把產品入口也算進競爭

Google 執行長在[第二季財報說明](https://blog.google/company-news/inside-google/message-ceo/alphabet-earnings-q2-2026/)中表示，Gemini App 每月活躍使用者達 9.5 億，日活躍使用者數增至前一年的三倍。[TechCrunch 報導](https://techcrunch.com/2026/07/23/google-closes-in-on-another-billion-user-product-with-gemini/?ref=aisecret.us)指出，AI Mode 使用者已超過 10 億，並帶動更多搜尋查詢。TechCrunch 也列出 Google 的十億級產品，包括 Search、Gmail、Drive、Android、YouTube 和 Chrome，並提到 Gemini App 已有 Android 使用者；Google 官方則表示 Gemini 深度整合於包括 Workspace 在內的 Cloud 產品。這些是不同的產品入口與使用指標。

Gemini App 的月活躍使用者與 AI Mode 的使用者屬於不同產品指標，不能直接視為同一群使用者或相同的使用頻率。這些里程碑反映的可能不是消費者對模型發布競賽的評價，而是 AI 已出現在手機、搜尋、收件匣與工作服務等日常入口。Gemini 不必在每項基準上都勝出，只要 Google 讓使用者不必切換服務，就能擴大觸及。前沿模型競賽攸關產業聲望，分發才是面向消費者的產品；這是對數據的解讀，不是模型品質的證明。

**OpenAI 向美國年滿 18 歲的使用者推出 Health。** 功能涵蓋 Free、Go、Plus 和 Pro 方案。使用者可選擇連接 Apple Health 與支援的醫療紀錄；OpenAI 表示，連接資料及使用這些資料的對話不會用來訓練基礎模型或投放廣告。[官方公告](https://openai.com/index/health-in-chatgpt/)。

**Claude 語音模式擴展到 Opus 與 Sonnet。** Anthropic 表示，兩個模型現在都能用語音處理較複雜的工作，例如調整 Google Calendar 中的會議或把對話整理成 Canva 一頁簡報。[The Verge 的報導](https://www.theverge.com/ai-artificial-intelligence/970065/anthropic-voice-mode-claude-opus-sonnet-haiku-ai?ref=aisecret.us)也提到 Gmail、Slack 等應用整合。

**Bezos 據報希望 Prime Video 更突出 AI。** PYMNTS 轉述 Reuters 的報導，指出 Jeff Bezos 曾要求 Prime Video 負責人改版串流服務，把 AI 放到更顯眼的位置；報導也提到內部 Lighthouse 專案。[相關報導](https://www.pymnts.com/news/retail/2026/amazon-revamping-prime-video-to-spotlight-ai/?ref=aisecret.us)沒有證實具體介面改動已定案。

**美國議員提出 AI 停機法案草案。** H.R. 9917 於 7 月 23 日提出，文本列出的措施包括停止對涵蓋技術的推論、終止使用者存取，或針對被認定有風險的帳戶、使用者或使用模式暫停存取。草案把適用技術限定為訓練算力按美國雲端市價估算後超過 1 億美元的 AI 系統。涵蓋對象須營運該技術或採用該技術的系統，並透過 API、託管服務等方式向第三方提供；連同關係企業，前一曆年須從該技術取得至少 5 億美元總收入。若國土安全部長認定發生涵蓋事件，並諮詢商務部長與國家情報總監後，才可要求採取與事件性質和急迫程度相稱的措施；定義包括失控情境。[法案原文](https://www.govinfo.gov/content/pkg/BILLS-119hr9917ih/pdf/BILLS-119hr9917ih.pdf)顯示這是法案草案，不適用於所有模型，也不是已生效的法律。

**Uber 將裁撤約 10% 的客服人員。** Uber 發言人向 Bloomberg 表示，調整目標包括簡化營運、強化面對面協作並持續採用 AI。[報導](https://www.theverge.com/ai-artificial-intelligence/970035/uber-is-laying-off-10-percent-of-customer-service-workers-as-it-continues-to-embrace-ai)呈現的是公司說法，不能據此認定 AI 是裁員的唯一原因。

**Patreon 將裁減團隊的 20%，共 93 人。** 執行長 Jack Conte 說，AI 已根本改變科技業，也改變公司的工作、產品開發和溝通方式；他也明確表示，裁員並不是因為公司認為 AI 會取代人類。[Conte 的公開說明](https://www.patreon.com/jackconte/posts/painful-update-164628951)。

**Runway 推出 Media Router，替生成媒體請求選擇模型。** 官方說明，路由器會依請求自動挑選影片、圖片或音訊模型，再依使用者設定的成本、品質與延遲偏好選擇合適方案。[Runway 的產品公告](https://runway.com/news/company-news/introducing-runway-media-router)說明了這項路由功能。

**Nvidia Jetson 預計用在後續月球任務。** Lunar Outpost 表示，Lunar Voyage 2 任務預定稍後發射，Jetson 模組將控制探測車的 LiDAR，並處理感測資料。這是未來部署的規劃，晶片尚未在月球運作。[Lunar Outpost 公告](https://www.lunaroutpost.com/post/lunar-outpost-collaborates-with-nvidia-to-deploy-edge-ai-across-upcoming-moon-missions)列出目前預計的用途。

**Meta 的 AI 樂觀廣告搭配 David Bowie 的〈Five Years〉。** TechCrunch 報導，歌曲描寫人類得知世界只剩五年的末日情境，和廣告的樂觀基調形成強烈反差。[報導](https://techcrunch.com/2026/07/23/meta-launched-a-new-ai-optimism-ad-set-to-a-song-about-human-extinction/)沒有證據顯示 Meta 是刻意用這首歌反諷自己的宣傳。
