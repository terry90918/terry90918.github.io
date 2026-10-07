---
title: '多個 Bot 共用一台電腦，權限邊界在哪裡？'
publishedAt: '2026-10-07T23:42:00+08:00'
status: 'published'
slug: 'grok-bot-shared-computer-permission-boundaries'
excerpt: '把 Bot 分成不同角色，不代表檔案、登入狀態和憑證也彼此隔離。理解帳號、雲端電腦、連接器與核准規則，才能看清 Agent 的實際權限。'
tags:
  - ai
  - agents
  - security
  - architecture
metaDescription: '分析 Grok Bot 的共用雲端電腦、連接器、Auto Review、網路政策與 Bot 模板，釐清多個 Agent 的實際權限邊界。'
---

把工作拆成工程 Bot、行銷 Bot 和法務 Bot，看起來像是替每種工作安排了獨立的 AI 同事。但 Bot 的角色分開，不代表它們存取的資料和登入狀態也分開。

Grok Bot 的指南常用「Bot 有自己的電腦」來描述它如何持續工作。官方文件補上了一個關鍵細節：同一個帳號底下的 Bot 共用一台雲端電腦。檔案、瀏覽器登入狀態和命令列憑證可能都在同一個工作環境裡。[Grok Bot 概覽](https://docs.x.ai/grok-bot/overview) · [電腦與應用程式](https://docs.x.ai/grok-bot/computer-and-apps)

我在[前一篇 Harness Engineering 文章](https://terry90918.github.io/posts/2026/harness-engineering-agent-reliability)談了 Agent 的工具、脈絡和驗證；這篇改從權限來看一個更具體的問題：多個 Bot 同時工作時，哪些邊界是真正有效的？

## Bot 角色分開，電腦沒有

Bot 可以有自己的名稱、工作描述、對話和學習脈絡。這讓工程 Bot 專注程式碼，客戶支援 Bot 專注工單，總管 Bot 負責分派工作。但官方文件指出，同一使用者的 Bot 共用雲端電腦上的檔案、瀏覽器工作階段與應用程式登入狀態；每個 Bot 的獨立畫面是不同工作介面，不是安全隔離邊界。[Grok Bot 概覽](https://docs.x.ai/grok-bot/overview)

官方安全 FAQ 也說明，Bot 沒有獨立身分；它能用哪些帳號和外掛，取決於使用者或團隊授予的存取權。需要獨立電腦與憑證的工作負載，文件建議使用另一個 Cursor 使用者帳號。[Grok Bot 安全 FAQ](https://docs.x.ai/grok-bot/security-faq)

連接器也不是按 Bot 隔離。官方文件說，已安裝連接器的可用性是帳號層級，不會只綁定某個 Bot；連接器能做什麼，仍受已授權來源帳號的權限限制。[電腦與應用程式](https://docs.x.ai/grok-bot/computer-and-apps)

因此，新增一個 Bot 可以隔開職責與部分上下文，卻不能單靠 Bot 名稱隔離瀏覽器裡的客戶系統、共用檔案或命令列憑證。即使每個 Bot 只收到自己的任務描述，它們仍可能在同一個帳號層級接觸共用資源。

隱藏或刪除 Bot 也不等於清掉共用電腦上的資料。官方文件提醒，檔案和登入工作階段可能仍留在雲端電腦上，必須另外檢查與清理。[建立與管理 Bots](https://docs.x.ai/grok-bot/bots)

## 封鎖連接器，不等於封鎖網站

連接器提供服務的結構化介面；瀏覽器則提供另一種操作路徑。Grok Bot 官方安全 FAQ 明確指出，封鎖某個外掛不會自動阻止 Bot 透過瀏覽器存取同一個網站。連接器政策和網路政策是不同的控制層。

依目前官方文件，目的地網路管制是 Enterprise 功能。Self-serve Teams 沒有網域 allowlist；未設定網路政策的團隊預設為允許連線。若團隊要求 Bot 只能連到指定服務，不能只檢查 Marketplace 裝了哪些外掛，還得確認實際的網路政策是否能限制瀏覽器路徑。[Grok Bot 安全 FAQ](https://docs.x.ai/grok-bot/security-faq)

這也是「工具權限」和「網路邊界」不能混為一談的原因。某個連接器被關掉，只能說那條連接器路徑不可用；不能單憑這點推論 Bot 完全碰不到該服務。

## 操作本機，和操作雲端電腦是兩回事

Grok Bot 的雲端電腦與使用者面前的 Mac 或 Windows 電腦是不同能力。官方文件說，本機執行預設為每次詢問；使用者也可以改成永不允許，或持續允許。設定成 Always allow 或 Never 時，會影響該使用者的所有 Bot，團隊管理員也能設定更嚴格的上限。[核准、安全與隱私](https://docs.x.ai/grok-bot/approvals-security-and-privacy)

這個區分很重要：關閉本機執行，不會讓雲端電腦裡的檔案、瀏覽器工作階段或已授權服務消失。檢查權限時，應分別列出「雲端電腦能做什麼」和「Bot 能否操作我的本機」，而不是只看一個開關。

## Auto Review 是一道檢查，不是完整隔離

Auto Review 可以在工具呼叫與電腦操作執行前檢查規則。Ask first 會要求先核准；自動允許規則只有在自動審查沒有要求停止時才會放行，兩者衝突時 Ask first 優先。

但官方文件也明確提醒，Auto Review 是模型式審查，應該補充最小權限和明確核准，不該取代它們。它也不會檢查所有副作用，例如記憶寫入和多數設定變更。對外寄信、發布內容、購買、刪除和正式環境修改，應該設定窄而明確的核准邊界。[核准、安全與隱私](https://docs.x.ai/grok-bot/approvals-security-and-privacy) · [Grok Bot 安全 FAQ](https://docs.x.ai/grok-bot/security-faq)

## 分享 Bot 設定，也可能分享工作方法

Bot 模板不會把原使用者的雲端電腦、登入狀態或對話紀錄交給接收者。但官方文件說，公開連結會展示 Bot 的設定，包括身份、描述、技能和 routines。模板不等於資料副本，卻可能公開內部工作流程、操作規則或尚未對外說明的產品資訊。[建立與管理 Bots](https://docs.x.ai/grok-bot/bots)

公開模板前，除了 API key，也要檢查內部網址、客戶資料、技能內容、routines 和角色描述。即使模板不含登入憑證，分享出去的設定仍可能揭露團隊如何工作。

## 部署前先畫出權限地圖

建立 Bot 團隊時，可以先逐項回答：

1. **帳號：** 每個 Bot 依賴哪個使用者或服務帳號？帳號本身有什麼權限？
2. **共用電腦：** 哪些檔案、瀏覽器工作階段和憑證會被同帳號的其他 Bot 使用？
3. **連接器與網路：** 封鎖連接器後，是否仍能經由網站存取？網域管制和記錄功能是否適用於目前方案？
4. **本機執行：** Bot 能否操作本機檔案？這項設定會影響哪些 Bot？
5. **核准：** 傳送、發布、購買、刪除和正式環境變更，會在哪一步停下來等人確認？
6. **分享：** Bot 模板公開後，哪些身份、技能、流程或 routines 會被看見？

Grok Bot 官方文件指出，產品沿用 Cursor 帳號的驗證與資料設定，必須使用雲端資料儲存，且不支援 Legacy Privacy Mode。企業稽核、Action Recording 和網路管制等能力也受方案限制。若要用於客戶資料或受監管工作，還需逐項核對現行合約、管理設定與資料政策；不能只從 Bot 角色描述推論出隔離或合規保證。[核准、安全與隱私](https://docs.x.ai/grok-bot/approvals-security-and-privacy) · [Grok Bot 安全 FAQ](https://docs.x.ai/grok-bot/security-faq)

多 Bot 團隊能降低交接成本，也能把不同工作交給專家角色。但 Bot 角色是協作方法，不是安全邊界。真正的存取範圍由帳號、共用電腦、連接器、網路政策和核准機制共同決定。部署前先把這些層次畫清楚，才知道該把什麼工作交出去。

## 延伸閱讀

- [Grok Bot 概覽](https://docs.x.ai/grok-bot/overview)
- [Grok Bot 安全 FAQ](https://docs.x.ai/grok-bot/security-faq)
- [核准、安全與隱私](https://docs.x.ai/grok-bot/approvals-security-and-privacy)
- [電腦與應用程式](https://docs.x.ai/grok-bot/computer-and-apps)
- [建立與管理 Bots](https://docs.x.ai/grok-bot/bots)
