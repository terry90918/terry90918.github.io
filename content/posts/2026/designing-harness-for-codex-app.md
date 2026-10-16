---
title: '工程師如何在 Codex app 裡設計 Harness：從指示、工具到權限與驗收'
publishedAt: '2026-10-16T09:30:01+08:00'
status: 'published'
slug: 'designing-harness-for-codex-app'
excerpt: 'Codex app 沒有一顆按鈕能自動做好 Harness。本文用實際工作流程，說明如何安排專案指示、工具、執行環境、權限和驗收，讓 Codex 的工作可理解、可控制，也能查證。'
tags: ['Codex', 'Harness Engineering', 'AI 工程', '軟體開發']
metaDescription: '以 Codex app 為例，逐步設計 Harness：整理 AGENTS.md、區分 Skill 與 MCP、選擇 Local、Worktree 或 Cloud，設定沙箱和 approval，並建立可驗證的工作循環。'
---

Codex 幫帳號設定頁補上錯誤訊息，相關測試也通過。你把頁面打開一看，錯誤訊息卻被按鈕擠出畫面。它改了程式，卻沒有檢查真正呈現的頁面。這時候，問題可能不在模型，而在工作流程沒有提供瀏覽器驗收的步驟和工具。

這就是設計 Harness 時要處理的事。OpenAI 的 Harness Engineering 文章描述一個團隊如何調整工作系統，讓 Codex 能更完整地參與軟體開發。本文接著把這個想法放到 Codex app，說明工程師可以如何安排專案指示、工具、執行環境、權限和驗收流程。

在 Codex app 裡，Harness 分散在專案指示、可用工具、工作目錄、權限和驗收流程裡。設計的目標，是讓 Codex 知道要做什麼、能用什麼方式工作、不能碰哪些範圍，以及如何證明工作完成。

## 先看整個工作循環

假設你要 Codex 修正帳號設定頁的表單驗證。完整工作還包括找到相關程式和規則、修改功能、執行測試、在瀏覽器確認畫面，再檢查差異並決定是否接受。

可以把這個流程想成五個問題：

1. Codex 從哪裡知道專案規則和任務背景？
2. 它有哪些工具可以讀資料或操作系統？
3. 它會在哪個工作目錄和執行環境裡工作？
4. 它可以讀寫哪些檔案、連到哪些網路資源？
5. 要看哪些檢查結果，才能確認需求真的完成？

這五題分別牽涉專案指示、工具、工作區、權限和驗證。把它們連起來，才是能實際工作的 Harness。

## 把專案指示寫成一張地圖

`AGENTS.md` 是 Codex 在專案中遵循的持續性指示檔。它適合記錄每次工作都需要知道的事，例如專案主要目錄、如何執行測試、程式碼慣例、不能違反的限制，以及什麼條件才算完成。OpenAI 建議從短而準的內容開始；如果 Codex 一再犯同一種錯誤，再把修正後的規則寫進去。[Codex 最佳實務](https://developers.openai.com/codex/learn/best-practices)也建議把個人偏好和整個團隊共用的專案規則分開管理。

新手可以把 `AGENTS.md` 想成辦公室入口的地圖：它告訴 Codex 哪裡有測試說明、架構文件和設計規範，但不需要把所有細節都複製到入口。這樣的安排有兩個好處：重要規則容易找到，文件也比較容易保持最新。

實作時，可以先在專案根目錄放一份簡短指引，再視需要在子目錄加入較局部的規則。像是前端目錄需要遵循元件規範，資料庫目錄需要說明遷移檢查，就把細節放在接近程式碼的位置。團隊共用的規則放進版本控制，個人的語氣和工作偏好則放在自己的 Codex 設定裡。

一個簡單的判斷方式是：如果每次工作都要提醒，就適合成為專案指示；如果只在某一類任務需要，就放在對應文件或工作流程裡。不要為了看起來完整而預先寫一份百科全書。

## Skill、MCP 和 Plugin 各自負責不同事情

當 Codex 需要的資訊或操作不在目前的專案資料夾裡，才需要額外接工具。三個名詞常一起出現，但工作不同：

- **Skill（技能）** 是一份可重複使用的工作流程。它會教 Codex 如何完成某一類任務，例如如何執行發版檢查。Skill 可以附上參考資料或腳本。
- **MCP**（Model Context Protocol，模型上下文協定）是連接外部工具和資料的方式。你可以用它連到設計工具、議題追蹤系統或內部文件服務，讓 Codex 直接取得最新資訊或執行操作。
- **Plugin（外掛）** 可以把 Skill、連接器和 MCP 伺服器組合成可安裝、可分享的工作套件。

可以用餐廳來理解：Skill 是食譜，MCP 是廚房裡可使用的設備和食材來源，Plugin 則是把一組食譜和設備一起包裝的工具箱。[Codex 自訂化指南](https://developers.openai.com/codex/concepts/customization)將這些能力視為互補的層次，而不是互相取代的選項。

不要一開始就把所有工具都接上。先問「Codex 缺少什麼，才無法完成這項任務？」若資料在程式庫裡，先提供正確路徑即可；若流程每週都重複，做成 Skill；若資料在外部系統而且會變動，再考慮 MCP。Codex app 可以在 Settings → MCP servers 管理 MCP 連接。團隊要共用的 Skill 可以放在專案的 `.agents/skills/` 目錄。權限也要分別檢查：允許本機命令讀取專案，並不代表外部連接器也只有相同的存取範圍。

## 選對工作位置，再談隔離

Codex app 裡的 Local、Worktree 和 Cloud 代表不同的工作位置和執行環境；模型選擇是另一項設定。

**Local** 是你目前的專案工作目錄。它適合依賴本機開發服務、未提交檔案或桌面工具的任務；同時也表示 Codex 會在你正在使用的專案環境裡工作，因此要留意它可能改動目前工作目錄中的檔案。

**Worktree**（Git 工作樹；Git 是管理程式版本的工具）會在同一個 Git 專案中建立另一份工作目錄，讓 Codex 能在背景處理另一項工作，降低和你手上的修改互相干擾的機會。Worktree 需要版本控制專案；不同工作樹有各自的檔案，但共用 Git 的提交資料。[Codex app 的 Worktree 說明](https://developers.openai.com/codex/app/worktrees)把它定位為平行工作和工作目錄管理方式。

這裡很容易誤會：Worktree 不是安全沙箱。從 OpenAI 文件對 Worktree 和本機權限的不同說明可以推得，Worktree 分開的是程式碼工作目錄，不會自動限制命令能讀取的其他檔案或網路目的地。要限制檔案和網路，還是要設定沙箱或權限；要減少不同工作覆蓋彼此程式碼的機會，才使用 Worktree。

**Cloud（雲端執行）** 讓 Codex 在自己的雲端環境裡處理工作，適合需要背景執行，或不依賴本機資料的任務。程式庫、建置步驟、工具和網路存取要依雲端環境另外準備；本機設定不能直接當成雲端設定。[Codex Cloud 文件](https://developers.openai.com/codex/cloud)將程式庫、環境準備步驟、工具與網路存取列為雲端工作環境的設定項目。

實務上可以這樣選：需要本機服務或未提交檔案時用 Local；想讓 Codex 平行處理、同時保留自己的工作目錄時用 Worktree；需要背景雲端執行，且工作可以在雲端環境重現時用 Cloud。選完之後，再確認該環境有必要的依賴和驗收工具。

## 權限有兩個旋鈕：能碰什麼，以及何時要停下來

很多人把「權限」當成一個總開關，其實至少有兩件事要分開看：

- **沙箱（sandbox）** 限制本機命令可以讀寫哪些檔案、可以連到哪些網路資源。
- **核准（approval）** 決定 Codex 何時要暫停，請你或其他審查機制確認某個動作。

如果 Codex 有寫入專案的權限，但在跨出工作範圍前會先詢問，這和允許它隨意讀寫整台電腦是不同設定。即使你把 approval 交給自動審查，沙箱範圍也不會因此擴大。[桌面 app 權限說明](https://learn.chatgpt.com/docs/permission-modes)明確區分這兩個控制。

對新手而言，先從「可修改目前工作區，超出範圍時詢問」開始，通常比較容易理解和檢查。你可以在輸入任務的區域下方打開權限選單，查看目前這個對話使用的模式。現行 app 可能提供 Ask for approval（詢問後核准）、Approve for me（交給自動審查）、Full access（完整存取）或 Custom（自訂設定）等選項；實際選項會因 app 版本、執行環境和組織管理設定不同。Approve for me 是把符合條件的核准請求交給自動審查，並不等於打開更多檔案或網路存取。Full access 則代表廣泛的本機檔案與網路權限，應只在你了解其範圍時使用。

如果要自訂規則，先列出 Codex 真正需要的路徑和網域，再給最小必要的寫入或網路存取。`workspace-write` 允許本機命令讀寫工作區；它不會自動保護 `.env`（通常存放密鑰或環境設定的檔案）。需要上網時，也要另外設定網路存取。

若使用傳統設定格式，常見的起點是：

```toml
sandbox_mode = "workspace-write"
approval_policy = "on-request"
```

這組設定只允許本機命令修改工作區，並決定哪些動作要先核准；它不會禁止讀取工作區內的 `.env`。若要封鎖符合條件的環境檔，可以改用新版權限 profile（權限設定組合）：

```toml
default_permissions = "project-edit"

[permissions.project-edit]
extends = ":workspace"

[permissions.project-edit.filesystem.":workspace_roots"]
"**/*.env" = "deny"
```

這個 profile 沿用工作區寫入權限，再拒絕讀取符合 `**/*.env` 的檔案。新版 profile 目前仍在 beta（測試版），不能和上面的舊式 `sandbox_mode` 設定混用；在 Linux、WSL 和 Windows，遞迴 glob 有時需要設定掃描深度，請依專案目錄結構參考[權限文件](https://developers.openai.com/codex/permissions)。如果用 profile 的網域清單限制網路，還要啟用網路 proxy，否則網域規則不會套用。你可以在 Codex app 的 Settings（設定）→ Configuration（組態）開啟 `config.toml`，並確認目前版本和組織政策允許所選模式。

另外，本機命令的沙箱、MCP 連接器、內建瀏覽器和 Cloud 環境各有自己的控制。不要因為某個網站已經允許瀏覽，就以為頁面上的內容可信；也不要把本機命令的網路規則當成整個 Codex app 的所有連線規則。

## 把「完成」寫成能檢查的結果

Harness 必須讓 Codex 拿到真實回饋。對程式碼變更而言，這通常是相關測試、lint（程式碼風格與常見錯誤檢查）、格式檢查或型別檢查。測試只證明它涵蓋的行為通過；如果需求關乎畫面，還要在實際頁面檢查互動和版面。

Codex app 內建瀏覽器，Browser 功能會隨桌面 app 自動安裝。你可以從工具列開啟本機網站；需要 Codex 操作頁面時，在工作要求中引用 `@Browser`。Computer Use（電腦操作功能）提供點擊、輸入和檢查頁面狀態的能力。[瀏覽器文件](https://developers.openai.com/codex/app/browser)建議把任務說清楚，例如指定路由、要看的狀態，以及要檢查的元件。完成後，再用 app 的差異檢視（diff review，逐項檢查改了哪些檔案和內容）確認修改符合範圍。

以表單驗證任務為例，可以把提示寫成：

> 在帳號設定頁新增 email 格式驗證。先查看相關元件、測試和 AGENTS.md。只修改設定頁及其測試，不要改 API 合約（應用程式介面的規格）。完成後執行相關測試和 lint，並在本機頁面確認空值、格式錯誤與成功狀態。最後列出修改檔案、驗證結果和仍未確認的地方。

這段提示包含目標、背景、限制和完成條件。OpenAI 的 Codex 最佳實務建議把這四項寫清楚，複雜任務先規劃，修改後執行合適的測試並檢查差異。驗收條件越具體，Codex 越容易知道下一步，也越容易讓你核對結果。

## 從一個可重現的小任務開始

設計 Harness 不必一次改造整個團隊。可以挑一個低風險、能重複執行的工作，例如補單元測試或修正一個表單錯誤，接著按順序完成：

1. 寫出結果要改變什麼，以及哪些範圍不能動。
2. 檢查 Codex 是否找得到必要的專案文件和指示。
3. 根據是否需要本機服務、並行工作或背景執行，選擇 Local、Worktree 或 Cloud。
4. 只接上完成任務必需的工具，並設定相應的權限範圍。
5. 要求 Codex 執行檢查，親自查看真實結果和差異。
6. 記錄重複出現的失敗，將可明確判斷的部分加入指示、測試或自動檢查。

這裡最後一步很關鍵。Codex 每次都漏掉同一個測試，代表測試可能沒有納入完成條件；每次都猜錯元件位置，代表專案地圖不清楚；每次都無法查看畫面，則可能缺少可用的瀏覽器或本機環境。把問題修在工作系統裡，比每回合都多寫一段提醒更有效。

評估效果時，比起 Codex 產生幾個 Pull Request（PR，提出供檢查和合併的程式碼變更）或多少行程式，更值得觀察任務需要人補充幾次資訊、首次驗收通過的比例、返工原因，以及人是否能更快確認成果。這些是你自己的流程指標，不是 OpenAI 文章提供的跨團隊保證。

## 讓一次成功能在下一次重現

好的 Harness 把重複的背景、規則和檢查交給系統處理。工程師仍要判斷需求取捨、風險，以及成果是否值得接受。Codex app 提供指示、工具、工作區、權限與檢視介面；工程師要依照自己的程式庫和風險，把這些部分接成一個完整循環。

先讓 Codex 找到正確的檔案，完成一個範圍清楚的修改，執行可重現的檢查，再由你確認差異。這條路徑穩定後，再加入外部工具、並行工作或自動化。只要每次完成都有證據，重複犯錯也能回頭修進指示或檢查流程裡。

## 官方文件

- [OpenAI：Harness 工程：在智慧體優先的世界中善用 Codex](https://openai.com/zh-Hant/index/harness-engineering/)
- [Codex 最佳實務](https://developers.openai.com/codex/learn/best-practices)
- [Codex 自訂化：AGENTS.md、Skills 與 MCP](https://developers.openai.com/codex/concepts/customization)
- [Codex app 的 Worktree](https://developers.openai.com/codex/app/worktrees)
- [Codex app 內建瀏覽器](https://developers.openai.com/codex/app/browser)
- [Codex app 權限模式](https://learn.chatgpt.com/docs/permission-modes)
- [Codex 權限設定與 profile](https://developers.openai.com/codex/permissions)
- [Codex Cloud 工作環境](https://developers.openai.com/codex/cloud)
