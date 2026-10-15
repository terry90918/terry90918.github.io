---
title: 'Codex 沙箱與權限指南：讓 AI 自主工作，也讓存取範圍清楚可控'
publishedAt: '2026-10-15T12:00:00+08:00'
status: 'published'
slug: 'codex-sandbox-permissions-guide'
excerpt: '從沙箱、核准政策到自訂 permission profiles，用網站開發情境帶新手設計 Codex 的檔案與網路權限，並實際確認限制有沒有生效。'
tags: ['Codex', '人工智慧', '軟體開發', '資訊安全']
metaDescription: '給新手的 Codex 沙箱與權限教學：理解 sandbox、approval policy、Auto-review、自訂 permission profiles、網路白名單與命令規則，附設定範例和驗證方法。'
---

> Codex 第一次被權限擋住時，最容易想到的是把權限開大。先停一下，看看它正在做什麼、需要碰哪些資料，通常更快找到合適的設定。

第一次用 Codex 修改網站，你可能遇過這種情況：改文案很順利，安裝套件卻跳出確認；跑測試沒問題，存取另一個資料夾又被擋住。確認視窗一多，Full access 看起來像是最快的解法。

有些中斷是在保護你，有些只是設定沒有涵蓋日常工作。要不要放行，先看這個動作是否真的屬於任務範圍。

我會先列出任務需要的檔案、工具和服務，再選權限。這樣比較容易看出，哪些確認應該保留，哪些可以透過合適的設定減少。本文以本機 Codex 執行的命令為主，從基本概念一路走到設定與驗證。

設定依 2026 年 10 月 15 日的官方文件整理。自訂權限設定仍在測試中，使用方式可能改變；網路代理（依目的地規則管理命令連線的機制）也還在試驗中；範例尚未完成各作業系統的實機驗證，使用前請核對版本與組織政策。

## 先分清楚三個問題

Codex 的權限可以從三個問題理解。

| 你要決定的事                   | 對應控制                                          | 例子                               |
| ------------------------------ | ------------------------------------------------- | ---------------------------------- |
| 命令能讀寫哪些檔案、連到哪裡？ | 沙箱（sandbox）或自訂權限組（permission profile） | 修改專案檔案、禁止讀取指定機密檔案 |
| 什麼情況要提出核准？           | 核准政策（`approval_policy`）                     | 越過目前邊界時提出請求             |
| 合格的請求交給誰審查？         | 審查者（`approvals_reviewer`）                    | 使用者或自動審查代理               |

沙箱會限制命令執行時能讀寫哪些檔案、連到哪些地方。自訂權限組則把多條檔案與網路規則存成一組，方便重複使用。下文提到的「工作區」，是這次工作階段使用的專案目錄，也可能包含你另外授權的資料夾。「邊界」則是目前設定允許的檔案與網路存取範圍。

把這三件事分開後，遇到阻擋就比較容易判斷原因：是命令超出沙箱範圍、需要人核准，還是請求送給了另一位審查者？

假設 Codex 要把報告寫到專案外的資料夾。沙箱可以先阻止這次寫入；如果核准政策允許提出請求，Codex 才能走核准流程。若請求獲准，這次行動可能以更高權限執行，因此核准內容和範圍仍然重要。

`on-request` 也不表示每次執行命令都問你。已經符合目前邊界的操作，通常可以直接進行。

最容易誤解的是 `never`。它表示不顯示核准提示，並不會自行增加檔案或網路權限。受限制的操作仍可能失敗，代理必須在現有權限內找方法。

官方對這幾項控制的區分，可參考 [Sandbox](https://learn.chatgpt.com/docs/sandboxing) 與 [Configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)。

## 沙箱限制的是命令的能力

Codex 執行 `git`、套件管理器或測試工具時，這些命令也受到沙箱限制。它們另外啟動的命令也會受同一限制。限制不只套用在編輯器的「儲存檔案」功能上。

本機沙箱會用作業系統的安全機制限制命令。macOS 使用系統內建的隔離機制；Linux 使用 bubblewrap（隔離命令的工具）；Windows Subsystem for Linux（WSL，在 Windows 裡執行 Linux 的環境）也使用 Linux 的方式。原生 Windows 則有自己的沙箱。Linux 或 WSL 使用者需要依官方指引確認 `bubblewrap` 與系統政策可用。

沙箱也不會保證程式寫得正確。只要某個檔案位於可寫範圍，代理就可能把它改壞，甚至刪掉。測試、版本控制與檢查差異仍然有用途。

更要留意的是執行位置。在本機跑的命令、本機瀏覽器操作、MCP（讓 Codex 連接並呼叫外部工具的方式）工具，以及雲端工作，可能各自使用不同控制。設定一個本機沙箱，不代表所有工具都被放進同一個隔離環境。官方在 [Permissions 的適用範圍](https://learn.chatgpt.com/docs/permissions#scope-and-enforcement) 有列出這些差別。

## 文字指示說明做法，權限設定限制存取

AGENTS.md 是用來告訴代理如何在專案內工作的指示檔。你可以寫下合作規則，例如只修改本次需求涉及的檔案、使用測試資料，以及發布前必須檢查結果。這些文字能讓代理理解工作方式。

但 AGENTS.md 不是作業系統權限設定。「不要讀取機密」是一項指示；檔案規則中的 `deny`（拒絕存取）才是對受控命令施加的限制。即使加了 `deny`，仍要檢查其他工具、環境變數與服務連線，避免把同一份資料從別的入口交給代理。

同樣地，Git worktree 能分開不同任務的程式碼變更，但它本身不是安全沙箱。資料隔離、命令限制和版本管理，各自處理不同問題。

把任務做法寫在 AGENTS.md，把檔案和網路的限制放進權限設定，再用練習資料確認允許與拒絕的結果。這樣就不會把「告訴代理不要做」誤當成系統已經禁止它做。

## 從一個網站任務開始設計

假設你要讓 Codex 幫忙修改個人網站，任務包含讀取原始碼、調整頁面、執行測試，以及預覽結果。

先寫出它實際需要的能力：

- 讀取並修改這個網站的工作目錄。
- 使用專案需要的執行工具與暫存目錄。
- 必要時連到套件來源或指定 API。
- 預覽時存取指定的本機服務。

再列出這項任務不需要碰的東西，例如正式環境憑證、個人 SSH 金鑰、其他客戶的專案，以及正式資料庫。

有了清單，權限就能跟著任務走。你可以逐項對照設定，知道每次放行是在滿足哪個需求。

如果任務只是請 Codex 解釋專案，先使用唯讀。要開始改檔案，再切換到工作區可寫。需要一起修改相鄰的共用函式庫時，才把那個資料夾加入範圍。這是本文的設計建議，實際範圍仍由任務決定。

## 新手先用內建模式

在 ChatGPT 桌面應用程式或 IDE extension（整合開發環境擴充功能），可以從輸入框下方的權限控制開始；CLI（命令列介面）使用 `/permissions`。可選項目會受版本、本機設定與組織要求影響。

常見選項包括 Ask for approval（需要時由你核准）、Approve for me（讓自動審查處理符合條件的請求）、Full access（本機命令不受沙箱限制），以及自訂設定。Approve for me 仍保留原本的工作區邊界。Full access 則會大幅擴大本機命令的存取範圍。

如果你剛開始用 Codex，先保留 Ask for approval，完成一個小任務。記下中斷的原因，再判斷是否值得把它變成固定權限。操作入口可參考 [Permissions 模式說明](https://learn.chatgpt.com/docs/permission-modes)。

### 看懂常見的 sandbox 設定

許多教學與現有設定仍使用這些值：

| `sandbox_mode`       | 大致用途                     |
| -------------------- | ---------------------------- |
| `read-only`          | 檢視與分析，禁止一般寫入     |
| `workspace-write`    | 在工作區內編輯並執行日常命令 |
| `danger-full-access` | 移除本機檔案與網路沙箱邊界   |

一個常見的本機開發設定是：

```toml
sandbox_mode = "workspace-write"
approval_policy = "on-request"
approvals_reviewer = "user"
```

也可以只為單次 CLI 啟動指定：

```bash
codex --sandbox workspace-write --ask-for-approval on-request
```

這組設定允許 Codex 在工作區處理日常工作，需要更多權限時再提出請求。使用舊式 `workspace-write` 時，命令的網路預設關閉，可透過 `[sandbox_workspace_write]` 設定調整。不要把它和內建搜尋工具是否可用混在一起判斷。

還有一個重要差別：工作區可寫，不代表只能讀取工作區。若你要限制工作區外的讀取，必須檢查實際讀取規則。

模式與網路行為見 [Agent approvals & security](https://learn.chatgpt.com/docs/agent-approvals-security)。舊文章若使用 `approval_policy = "untrusted"`，需要更新；這個可選值已不再受支援。

## 自訂前，先選一套設定方式

自訂權限組可以讓你用同一名稱管理多條檔案與網路規則。

這兩套方式都能設定本機命令的存取範圍，但使用的欄位不同：

| 設定方式            | 主要欄位                                      |
| ------------------- | --------------------------------------------- |
| 較早的 sandbox 設定 | `sandbox_mode`、`sandbox_workspace_write`     |
| 自訂權限組          | `default_permissions`、`[permissions.<名稱>]` |

`default_permissions` 指定預設使用哪組權限；`[permissions.<名稱>]` 則寫出那組規則。

同一個工作階段應選一套。如果你只需要工作區編輯，前面的 `sandbox_mode` 設定就能作為起點；如果需要分別指定檔案存取與連線目的地，再使用下面的自訂權限組。

接下來的教學使用自訂權限組。切換前，先移除已載入設定中的 `sandbox_mode` 與 `[sandbox_workspace_write]`，啟動時也不要再傳入 `--sandbox`。

官方說明，若載入的設定仍有 `sandbox_mode`，或啟動時傳入 `--sandbox`，一般情況下 Codex 會採用較早的 sandbox 設定。受管理的 `allowed_permission_profiles` 有另外的規則，企業電腦請先核對管理要求。

這也是為什麼「設定檔明明寫了，但結果沒變」不一定是語法錯誤。你可能改到了沒有生效的那一層。遷移說明見 [Permissions](https://learn.chatgpt.com/docs/permissions#migrate-from-older-sandbox-settings)。

## 找到設定檔，再開始修改

個人設定通常放在 `~/.codex/config.toml`。專案也能使用 `.codex/config.toml`，但 Codex 只會載入受信任專案的這一層。

實務上，先在個人設定建立自己的預設，再依需要加入專案設定。TOML 是 Codex 使用的設定檔格式。修改現有檔案時，保留其他設定並合併內容；重複宣告同一個表格可能讓檔案無法解析。

CLI 旗標（在終端機輸入的命令選項）和 `--config` 覆寫優先於一般設定檔。專案設定、`--profile` 指定的設定組、個人設定及系統設定也有先後順序。組織的強制要求則可能限制你能選哪些值，不能靠個人設定任意放寬。

另外，`--profile` 選的是一組一般設定；`default_permissions` 選的是檔案與網路權限。兩者不要混為一談。

設定位置與優先順序見 [Config basics](https://learn.chatgpt.com/docs/config-file/config-basic)。

## 建立第一個自訂權限

先做一個不開放命令網路的開發設定，把下面內容合併到 `~/.codex/config.toml`。`.env` 檔案常用來存放連接服務用的 API 金鑰等機密值，範例會拒絕命令讀取常見的三種檔名。稍後的連網範例是另一個完整方案，初次練習請先選一個，避免重複貼入頂層欄位。

```toml
default_permissions = "project-local"
approval_policy = "on-request"
approvals_reviewer = "user"

[permissions.project-local]
extends = ":workspace"

[permissions.project-local.filesystem.":workspace_roots"]
".env" = "deny"
".env.local" = "deny"
".env.production" = "deny"

[permissions.project-local.network]
enabled = false
```

`project-local` 是自己取的名稱。`extends` 表示從另一組規則開始，再加上自己的限制。這裡沿用 Codex 內建的 `:workspace` 工作區規則，它會保留 `.git`、`.agents`、`.codex`、`.aws` 等路徑的既有保護。

這裡拒絕的是每個有效工作區根目錄下列出的三個檔案，沒有涵蓋所有可能的機密檔案。子目錄中的 `.env`、不同命名的憑證，仍要另外處理。本文先用明確路徑，讓新手能看出規則到底保護了什麼。

如果工具需要環境變數（程式執行時讀取的設定值），改用測試用設定或受控的執行環境。阻擋某個檔案的讀取，也不代表已經清除程序繼承的環境變數。

在 CLI 啟動後輸入 `/permissions`，再選擇 `project-local`。桌面應用程式與 IDE extension 則使用輸入框下方的權限選單。

切換到自訂權限組時，不要再加 `--sandbox workspace-write`。檔案規則與繼承方式見 [Permissions 的檔案權限說明](https://learn.chatgpt.com/docs/permissions#filesystem-permissions)，CLI 操作見 [Developer commands](https://learn.chatgpt.com/docs/developer-commands)。

### 需要另一個資料夾時，加具體路徑

`workspace_roots` 是設定工作區資料夾清單的欄位。假設任務確實需要一起修改 `~/code/shared-ui`，可在同一設定檔增加：

```toml
[permissions.project-local.workspace_roots]
"~/code/shared-ui" = true
```

這個資料夾會加入有效工作區，套用相同的工作區規則。它是增加範圍，不會取代這次工作階段原有的工作區。因此還要確認啟動位置，避免把不相關的資料夾帶進來。

如果只需要讀取另一個資料夾，應改用對該路徑的 `read`（唯讀）規則。可寫權限包含修改、重新命名與刪除，不能把加入工作區當成只有「看一下」的意思。

## 需要連網時，分別設定開關與目的地

前面的 `project-local` 適合依賴已備齊、不需要命令連網的工作。若網站開發需要從 npm registry（npm 套件下載站）安裝套件，可以把教學設定改成下面的 `project-net`：

```toml
default_permissions = "project-net"
approval_policy = "on-request"
approvals_reviewer = "user"

[features]
network_proxy = true

[permissions.project-net]
extends = ":workspace"

[permissions.project-net.filesystem.":workspace_roots"]
".env" = "deny"
".env.local" = "deny"
".env.production" = "deny"

[permissions.project-net.network]
enabled = true

[permissions.project-net.network.domains]
"registry.npmjs.org" = "allow"
```

這個範例刻意只放行一個目的地，沒有保證所有套件安裝都能完成。有些依賴會下載額外檔案、連到其他主機，或執行安裝腳本。遇到失敗時，先辨認實際需要的來源，再決定是否加入。

兩個開關各有用途：`network.enabled` 決定命令能否連網；network proxy（網路代理）負責依目的地規則轉送或阻擋連線。若只開放網路，卻沒有啟動代理，寫在權限組裡的網域規則不會限制直接連線。管理員啟用的網路要求也可能負責啟動代理，要以有效設定為準。

網路規則中的 `allow` 允許連線，`deny` 拒絕連線。啟用代理後，沒有允許項目的外部目的地預設被擋住。精確主機名稱只匹配自己；`*.example.com` 匹配子網域，`**.example.com` 則包含主網域與子網域。網路規則發生衝突時，`deny`（拒絕存取）優先。

不要為了少填幾個主機名稱，就加入允許所有公開主機的 `"*"`。而且允許連到某個網域，只能限制目的地，無法保證傳過去的內容不含機密。

網路設定依據 [Permissions 的網路權限說明](https://learn.chatgpt.com/docs/permissions#network-permissions)。

### 本機預覽也需要納入範圍

如果使用 `project-net`，而且命令需要存取本機網站，可在既有的 `[permissions.project-net.network.domains]` 表格中加入：

```toml
"localhost" = "allow"
"127.0.0.1" = "allow"
```

這兩行是既有表格裡的項目，不是獨立的完整設定檔。使用瀏覽器預覽時，還要確認瀏覽器自己的控制；命令連得到本機服務，不代表瀏覽器權限也同步改變。

Docker socket 是命令連接 Docker 背景服務的本機通道。開放它可能讓命令啟動容器或掛載資料夾，先確認可掛載的目錄與憑證範圍。

## 用命令規則處理固定例外

檔案規則回答「能碰哪裡」，命令規則則能對特定命令前綴（命令開頭的部分）設定允許、核准或禁止。它不能取代檔案隔離，也不能保證程式只能透過某個命令完成操作。

這裡用 `gh pr view` 示範命令規則。`prefix_rule` 控制 Codex 要讓命令在沙箱外執行時，是先詢問、直接允許，還是禁止。如果命令已在目前沙箱內獲准執行，這條規則不會再增加一次核准。建立 `~/.codex/rules/default.rules`，加入：

```python
prefix_rule(
	pattern = ["gh", "pr", "view"],
	decision = "prompt",
	match = ["gh pr view 123"],
	not_match = ["gh pr merge 123"],
)
```

副檔名是 `.rules`，使用 Starlark（一種設定規則的程式語言）語法。`prompt` 表示每次命令要在沙箱外執行時先詢問；`allow` 會讓符合規則的命令在沙箱外直接執行。這條規則只匹配命令開頭的 `gh pr view`。`match` 和 `not_match` 是用來確認規則會命中或不會命中的測試案例。這裡沒有另外建立禁止合併 PR 的規則。

儲存後重新啟動 Codex。也可以先測試規則匹配結果：

```bash
codex execpolicy check --pretty --rules ~/.codex/rules/default.rules -- gh pr view 123
```

這個檢查不會執行 `gh pr view`，它會顯示命令匹配哪些規則，以及最終決策。

`allow`（允許）會讓符合規則的命令在沙箱外執行，因此前綴要足夠窄。Codex 會把格式簡單的串接命令拆開逐段檢查；只有每個命令片段都符合 `allow` 規則時，整組命令才會在沙箱外執行。含變數或重導向的複雜 shell 命令可能會被當成一整條命令處理。先用 `codex execpolicy check` 測試完整命令，再決定規則是否合適。不要用 `["python"]` 或 `["bash"]` 這種寬前綴來省事。

規則仍屬實驗功能，適用範圍與測試方式見 [Rules](https://learn.chatgpt.com/docs/agent-configuration/rules)。

## 想減少確認，可以考慮自動審查（Auto-review）

常見工作的範圍設定妥當後，如果仍有需要判斷的核准請求，可以保留 `on-request`，把審查者改為：

```toml
approval_policy = "on-request"
approvals_reviewer = "auto_review"
```

這兩個欄位要放在 TOML 設定檔最外層，不能接在某個 `[permissions.…]` 表格內。是否可用還要看產品、帳號與組織設定。

Auto-review 會替你檢查符合條件的核准請求，再決定是否允許執行。已經在原有權限內直接執行的操作，不會全部重新送審。它也可能判斷錯誤，因此原本的隔離範圍仍有必要。

如果某個 MCP 或 app 工具需要額外審查，請設定該工具自己的核准控制。命令規則只處理沙箱外的命令。不要假設「開啟 Auto-review」就代表所有行為都多了一次檢查。

請求被拒絕時，應檢查操作是否超出任務，或能否縮小範圍。改用另一種寫法執行相同動作，並沒有解決權限問題。審查流程見 [Auto-review](https://learn.chatgpt.com/docs/sandboxing/auto-review)。

## 設定寫完，還要測試邊界

設定檔能解析，只能證明格式可讀。要知道限制是否有效，必須用實際命令確認。

請先建立一個沒有機密資料的練習專案，在根目錄放入只含測試文字的 `.env.local`，對應前面範例的拒絕規則。測試時要求代理使用原本沙箱權限執行，不接受提權或切換工具，否則測到的就不是原本邊界。

| 測試                                           | 預期結果                                     |
| ---------------------------------------------- | -------------------------------------------- |
| 在預定可寫目錄建立測試檔                       | 成功                                         |
| 讀取被明確拒絕的假機密檔案                     | 被拒絕                                       |
| 寫入工作區外、未另行授權的練習目錄             | 原本權限下被拒絕，或提出核准請求             |
| 使用 `project-local`，用命令連到外部主機       | 因命令網路關閉而被阻擋                       |
| 使用 `project-net`，用命令連到白名單主機       | 不應被目的地規則擋住，服務本身仍可能回傳錯誤 |
| 使用 `project-net`，用命令連到未放行的測試主機 | 被目的地規則阻擋                             |

工作區外的寫入測試，請選自己另外建立的空目錄，避開系統暫存與其他已被授權的路徑。若測試得到非預期結果，先停止擴大權限，確認實際生效設定。

CLI 的 `/status` 可檢查工作階段資訊，`/debug-config` 可檢查設定來源與管理要求。這些資訊應搭配實際存取測試使用。命令說明見 [Developer commands](https://learn.chatgpt.com/docs/developer-commands)。

### 遇到失敗時，先找是哪一層

如果設定看起來沒生效，先檢查有沒有殘留的 `sandbox_mode` 或啟動旗標，再看專案設定是否受信任、是否有更高優先設定覆寫，以及組織是否禁止這項權限。

如果安裝套件失敗，讀錯誤訊息，辨認是目的地主機被擋、快取不可寫，還是安裝腳本需要執行額外動作。這幾種問題需要的處理不同。

如果 Git 寫入失敗，也要考慮 `.git` 的既有保護。不要為了一次 commit，就把整個家目錄設成可寫。

如果終端機命令列（shell）不能連網，但搜尋或 MCP 仍可使用，先核對工具的執行方式。官方明確說明，本機命令的 network proxy 不會統一管理搜尋、connectors、MCP、瀏覽器、模型登入流量或雲端工作。

## 從小範圍開始，再按需要放寬

我會先讓 Codex 讀取專案，再開放工作區編輯；需要連網時，只加入任務會用到的目的地。遇到重複的合理請求，就把那項需求整理成清楚、可測試的設定。若請求碰到新資料、正式環境或對外操作，就重新確認任務是否需要它。

權限要跟著任務需要的資料和動作走。先讓 Codex 在一個可控的專案裡完成工作，再逐項增加確實需要的路徑與主機。每增加一項權限，就用假資料確認它涵蓋的範圍。下一次出現核准視窗時，你就能判斷眼前的動作，而不必猜整個權限模式該不該放寬。
