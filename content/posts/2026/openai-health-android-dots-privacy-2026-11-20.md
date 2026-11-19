---
title: 'ChatGPT Health 擴展到 Android 與 dots：連接健康資料前，先看懂使用範圍'
publishedAt: '2026-11-20T05:00:00+08:00'
status: draft
excerpt: 'Health 開始擴展到 Android、桌面、dots 與 sites。整理美國方案資格、Health Connect、主動提醒，以及同步資料、對話與記憶各自的隱私規則。'
tags:
  - OpenAI
presentation:
  type: feature
  category: OpenAI
---

作者：Terry Chen。本文依 2026 年 11 月 20 日查核的 OpenAI 官方公告與說明整理，包含作者對資料管理的觀察；未連接或測試個人醫療資料。

睡眠在手錶裡，運動紀錄在手機裡，檢驗結果又在醫療院所的入口。想看清楚最近的變化，往往得先把資料湊齊。OpenAI 在 11 月 19 日宣布，Health 開始擴展到 Android、桌面程式、dots 與 sites，Android 也加入 Health Connect 支援。[ChatGPT release notes，11 月 19 日](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

這次更新讓健康資料能出現在更多日常使用入口。使用前仍要分清楚：帳號是否符合資格、ChatGPT 能讀到哪些資料，以及連接資料後的對話如何保存。

## 美國 Free 到 Pro 開放，仍採逐步推出

官方列出的 Health 適用範圍，是美國符合資格且已登入的 Free、Go、Plus 與 Pro 使用者，支援網頁、iOS、Android 與桌面程式。這不是台灣全面開放公告，也沒有因為桌面版加入支援，就移除地區條件。更新採逐步推出，帳號尚未看見入口，不等於程式故障。[Health 資格與支援平台](https://help.openai.com/en/articles/20001036-health-in-chatgpt)

使用時先更新 ChatGPT，再從側邊欄找 Health；行動或桌面程式找不到時，可查看 Explore。網頁版則可從更多選單尋找。連結家長監護的帳號，還可能受到 Health 家長控制設定影響。[官方開始使用與疑難排解步驟](https://help.openai.com/en/articles/20001036-health-in-chatgpt)

在 dot 使用 Health，必須同時有 Health 與 dots 的資格。此次 release notes 對個人使用者列出 Pro 的 dots；不能把 Health 的 Free 到 Pro 清單，解讀成所有這些方案都新增了 dot。[此次開放說明](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)、[dots 資格](https://help.openai.com/en/articles/20001530-getting-started-with-your-dot)

## Health Connect 串接資料，來源仍有邊界

Android 使用者可選擇連接 Health Connect；Apple Health 的連接則需要 iPhone。其他來源包含受支援的美國醫療院所入口、One Medical 與 Function Health，實際可用性仍依提供者和 App 而異。[可連接的資料來源](https://help.openai.com/en/articles/20001036-health-in-chatgpt)

穿戴裝置的資料也不是全部直接進入 ChatGPT。官方說明以 WHOOP、Oura、Garmin 等為例：先讓原 App 將資料提供給 Apple Health 或 Health Connect，再由使用者選擇分享給 ChatGPT 的資料類別。App 自有的睡眠分數、排行榜或其他專屬指標，可能不會轉過去。[穿戴裝置與指標限制](https://help.openai.com/en/articles/20001036-health-in-chatgpt)

| 使用情境                       | 先確認什麼                                                  |
| ------------------------------ | ----------------------------------------------------------- |
| Android 的睡眠或運動紀錄       | 原 App 是否寫入 Health Connect，以及 ChatGPT 獲准讀取的類別 |
| iPhone 的 Apple Health         | 在 iPhone 完成連接，核對各項讀取權限                        |
| 醫療院所的檢驗與就診紀錄       | 提供者是否受支援、是否完成授權，以及同步狀態                |
| App 中有、ChatGPT 卻沒有的分數 | 該指標是否真的透過連接來源提供                              |

同步可能需要幾分鐘，資料量大時也可能更久。我的看法是，第一次使用先核對日期、單位和缺少的欄位，再請它整理趨勢。這是驗收資料的方法，並非本文實測得出的同步品質結論。

## 從提問走向提醒，仍由使用者決定連接範圍

官方列出的用途，包括比較新舊檢驗結果、整理上次就診後的變化，以及觀察睡眠、活動與運動之間的關係。當資料相關且獲得允許時，Health 也可能在其他 ChatGPT 對話中提供個人化回應；想明確使用這些資料時，可以在訊息加上 @Health。[Health 在對話中的使用方式](https://help.openai.com/en/articles/20001036-health-in-chatgpt)

這次公告還舉出 dot 的主動建議：會議與運動衝突時建議另一個運動時間，或根據已連接的病歷提醒預防照護選項。桌面程式與 sites 的示例，則是建立一個追蹤馬拉松訓練與進度的網站。這些是官方用途示例，沒有保證每個帳號已開放，也不是臨床效果的驗證。[11 月 19 日更新示例](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

Health 沿用帳號全域的 plugins 權限設定；若未調整，官方列出的預設為「Allow low-risk actions」。可以到 Settings → Plugins → Health 檢查與變更。資料連接、資料使用與對外分享，應分別確認；讓 ChatGPT 讀取自己的紀錄，不代表已要求它把內容傳給別人。[權限及敏感分享保護](https://help.openai.com/en/articles/20001036-health-in-chatgpt)

## 同步資料、衍生對話和記憶，規則不同

這部分最值得在連接前讀清楚。官方表示，透過 Health 同步的病歷、Apple Health 或 Health Connect 資料，不用來訓練基礎模型或投放廣告。但引用這些資料的對話，以及從資料衍生的內容，能否用於改善模型，仍取決於使用者的模型改善設定。若不希望這類內容用於改善模型，可到 Settings → Data Controls 關閉「Improve the model for everyone」。不能把前一句簡化成「所有 Health 內容都不會用於訓練」。[資料與模型改善規則](https://help.openai.com/en/articles/20001036-health-in-chatgpt)

記憶又是另一層。記憶開啟時，使用 Health 的對話可以建立記憶，例如改善睡眠的目標；官方同時說明，不會直接從同步資料建立記憶。需要不建立記憶的對話，可使用 Temporary Chat 或關閉記憶；希望健康對話的記憶分開，則可考慮設有 project-only memory 的獨立專案。[Health 對話與記憶](https://help.openai.com/en/articles/20001036-health-in-chatgpt)

舊版 Health 的對話和上傳檔案，仍放在 Projects 中的 Health Project，保留原本的區隔控制。這些內容不會自動搬到新的 Health 分頁；舊專案裡的記憶不能拿來個人化專案外的聊天。新的 Health 使用方式與舊專案不能混為一談。[舊 Health 內容的位置](https://help.openai.com/en/articles/20001036-health-in-chatgpt)

## 解除連接不會一併刪掉既有對話

使用者可在 Health 的 Accounts 管理來源。解除連接後，該來源同步的資料會在 30 天內從 OpenAI 系統刪除；已經寫進 ChatGPT 對話歷史的資訊，則保留到使用者刪除那些對話為止。要清理資料，必須分別檢查來源連接與對話歷史。[解除連接與刪除範圍](https://help.openai.com/en/articles/20001036-health-in-chatgpt)

資料寫回也有界線。ChatGPT 不能改動醫療提供者持有的病歷，也不能寫回 Apple Health、Health Connect 或其他連接帳號。即使請它更新目前用藥、病況或家族病史，變更的也只是 ChatGPT 裡的 Health profile。[唯讀與 profile 更新限制](https://help.openai.com/en/articles/20001036-health-in-chatgpt)

## 個人 Health 與醫療團隊產品分開看

Health 的定位是協助理解健康資訊，官方說明不作為診斷或治療，也不取代醫療照護。個人 Health 不提供 Business Associate Agreement，並非為臨床或 HIPAA covered entity 使用而設計。醫療團隊要評估的是 ChatGPT for Healthcare、ChatGPT for Clinicians 及其各自條件，不能用這次個人 Health 開放公告推導出機構使用資格。[用途與 HIPAA 邊界](https://help.openai.com/en/articles/20001036-health-in-chatgpt)

這次更新對日常使用的意義，是把散落的健康資料帶進更多入口，並讓後續提醒延續資料脈絡。我會先從少量、明確的資料類別開始，核對來源、權限和保存設定，再決定是否擴大使用；這是作者的使用取向，並非醫療建議或產品實測結論。

## 來源與查核範圍

本文查核時間為 2026 年 11 月 20 日，主要依據 [ChatGPT release notes 的 11 月 19 日公告](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)、[Health in ChatGPT](https://help.openai.com/en/articles/20001036-health-in-chatgpt) 與 [Getting started with your dot](https://help.openai.com/en/articles/20001530-getting-started-with-your-dot)。Help Center 是持續更新的文件；本文未將頁面的相對更新時間視為功能首發日期，也未以示例推定台灣可用或臨床成效。
