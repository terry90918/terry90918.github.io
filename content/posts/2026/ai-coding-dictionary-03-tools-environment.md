---
title: "AI Coding 詞典拆解（03）：工具、環境與 Agent 的權限邊界"
publishedAt: "2026-10-15T08:43:02+08:00"
status: "published"
slug: "ai-coding-dictionary-03-tools-environment"
excerpt: "模型本身不會讀檔或執行命令。Agent 的行動來自 Harness 提供的工具，而工具真正能影響什麼，則取決於環境、權限和隔離方式。"
tags: ["人工智慧", "AI工程", "軟體開發", "資安"]
metaDescription: "說明 Tool、Tool Call、Tool Result、MCP、Filesystem、Sandbox 和 Permission Mode 的分工，建立可預期的 AI Agent 執行邊界。"
---

AI 程式代理讀取程式碼、執行測試、修改檔案時，我們常把整段流程都說成「模型做了」。這種說法方便，卻不利於除錯。模型提出下一步，執行環境決定要不要採納，工具才真的讀取或改動外部狀態。三層出現的錯誤不同，補救方法也不同。

本文依照《Dictionary of AI Coding》第三單元的十個詞目，將它們整理成一套工程閱讀方法。原 repo 是精簡詞典，不是這篇文章的章節底稿；以下用它的分類作索引，再以工程情境說明責任邊界與查核方式。

## 先拆開模型、工具與環境

**Environment（環境）**是工具執行時所處的整個工作條件，不只是一個目錄。它可能包含作業系統、目前工作目錄、Git 分支、環境變數、可用命令、網路路由、登入身分、資料庫端點、容器掛載，以及已啟動的程序。這些條件決定相同命令實際碰到哪份程式碼或服務。

例如，兩個 Agent 都能呼叫 `npm test`。一個在本機 checkout 執行，另一個在容器裡執行；兩邊的 Node 版本、環境變數和測試資料庫可能不同。即使輸出都是「測試通過」，也不能因此推論兩者驗證了同一個部署環境。遇到不一致時，先讀取目錄、分支、版本和連線目標，再看模型說了什麼。

**Filesystem（檔案系統）**是環境中可列出、讀取、建立或修改檔案的部分。工具可見的路徑不一定等於使用者電腦上所有路徑，也不一定只限於目前專案。容器可能把一個資料夾掛載進去；遠端工作區可能只有伺服器上的 checkout；符號連結則可能把看似專案內的路徑指向別處。路徑顯示在介面裡，不等於權限已被作業系統限制在該處。

檢查 Filesystem 邊界時，分別確認能讀取哪些位置、能寫入哪些位置、能否透過連結或掛載離開工作區，以及憑證是否被掛入。也要檢查產物是否真的寫回預期 checkout。若工作是在隔離容器中完成，容器內的檔案變動可能還要經過同步、複製或提交才會出現在另一個位置。

**Tool（工具）**是 Harness 提供給模型使用的一項能力。它通常有名稱、用途描述和輸入欄位，例如讀檔、搜尋、執行 Shell、建立 Pull Request，或查詢資料庫。工具契約會限制「可以怎麼呼叫」，但不會自行證明工具的效果安全或正確。描述寫著「讀取測試資料庫」，若底層連線其實指向正式資料庫，真正的風險仍在環境設定。

工具的描述和參數也是模型決策時看到的資訊。含糊的名稱、寬泛的參數或未說明的副作用，會令模型難以選對工具。工具設計者應把用途、必要輸入、可能修改的外部狀態和失敗回應寫清楚；執行端則要驗證輸入、檢查權限並限制副作用。MCP 規格也要求 Server 驗證工具輸入，並要求實作考慮權限控制和輸出處理。

## 一次 Tool Call 還沒有改變任何東西

**Tool call（工具呼叫）**是模型送出的結構化請求，常包含工具名稱和參數。模型可以提出 `run_tests`，或要求搜尋某個檔案，但「提出呼叫」只代表生成了一個候選動作。它不代表 Harness 已接受、不代表操作已獲准，也不代表程式已經執行。

Harness 收到呼叫後，會依產品設計檢查工具是否存在、參數是否符合格式、目前政策是否允許，必要時請人決定，最後才把呼叫交給工具。若模型送出不存在的欄位，問題在呼叫格式或上下文；若權限規則拒絕呼叫，問題在執行政策；若命令已啟動但找不到套件，問題可能在 Environment。把每種狀況都叫「模型失敗」，會錯過真正要修的地方。

可以用部署任務看出這個差別。模型請求執行 `deploy staging`，Harness 卻在核准前攔下，這次部署並未發生。若使用者核准後，工具回報連線逾時，則部署結果未明，不能當作已成功或已回滾。只有部署工具回報狀態後，再查詢目標環境確認版本，才能說部署完成。動作要求、工具回應和外部狀態是三種證據。

**Tool result（工具結果）**是工具或伺服器回傳給 Harness 的資料，Harness 通常會把它放回對話，讓模型決定下一步。結果可能是文字、結構化資料、圖片、資源連結或錯誤資訊。它描述工具宣稱看見或完成的內容，不是自動可信的事實。工具可能讀錯資料、回傳過時快取、截斷輸出，或成功執行了命令但沒有達成使用者目標。

MCP 的工具結果可用 `isError` 表示執行錯誤；這有助於 Client 告知模型「呼叫到了，但工具工作失敗」。這和 JSON-RPC 層的協定錯誤不同，後者可能代表工具名稱不存在或請求格式錯誤。收到錯誤結果後，Agent 有時能修正參數再試，但重試不是保證成功的機制，也可能再次造成副作用。像付款、寄信、刪除或部署這類操作，重試前要先查外部狀態，避免第一次其實成功、第二次又做一次。

結果查核要對準使用者要知道的事。執行測試時讀退出碼和失敗摘要；修改程式時檢查 diff 與目標檔案；部署時查服務目前版本；寄信時查寄件紀錄。不要用模型後來說「我已經做完」取代工具輸出或外部 readback。

## MCP 標準化通訊，不替產品決定信任

**MCP（Model Context Protocol）**定義 AI 應用如何連接提供能力的 MCP Server。常見角色是 Host、Client 和 Server：Host 是使用者操作的 AI 應用，Client 管理與 Server 的連線，Server 公開工具或其他脈絡能力。工具清單可由 `tools/list` 取得，呼叫則透過 `tools/call` 傳送名稱和參數。這讓不同 Host 與 Server 能用相同協定交換能力資訊，但協定相容不等於服務可信。

2026-07-28 版 MCP 工具規格把工具描述為由模型依脈絡發現和呼叫，同時明確說明實作者可採用適合自己的介面模式，協定不要求單一的人機互動流程。規格也以 `SHOULD` 建議提供人類拒絕呼叫的能力，並建議清楚顯示暴露給模型的工具、呼叫狀態及敏感操作確認。因此，正確說法是 Host 負責選擇如何呈現同意和拒絕，而不是宣稱 MCP 規定每一次呼叫都必須跳出相同核准視窗。

這裡的界線很實際。MCP Server 的 `inputSchema` 描述 `delete_branch` 要收哪些參數，卻不代表使用者授權了刪除；Server 的名稱顯示為公司 GitHub 連接器，也不能證明它拿到的 token 只有唯讀權限。使用 MCP 前，檢查連到哪個 Server、它公開哪些工具、各工具會觸及什麼資料，以及 Host 如何處理高影響呼叫。外部 Server 回傳文字時，仍要當作外部資料檢驗；標準協定不會替內容背書。

MCP 的安全指引也提醒實作者注意工具輸入、輸出、憑證和本機 Server 啟動命令。以本機 Server 為例，它通常用啟動 Host 的帳號執行。若設定檔能啟動任意命令，連接未審查的 Server 就可能把本機檔案、網路或帳號權限交給該程序。這是具體安裝方式造成的風險，不是協定名稱本身能消除的問題。

## Permission request、Permission mode 和 Agent mode 管不同事

**Permission request（權限請求）**是某次工具呼叫需要授權時，向使用者或政策系統提出的個別詢問。一次核准的意義取決於介面和設定：有些只放行當前呼叫，有些選項會記住某個範圍的規則。核准前應看清楚實際工具、完整參數、可能改動的資料及核准是否會持續有效。看到「允許」按鈕，不足以推論它只授權一次。

**Permission mode（權限模式）**是影響多次呼叫的整體核准策略。產品可能提供逐次詢問、只讀計畫、自動核准部分動作或略過確認等模式。這個詞描述的是政策如何處理呼叫，不是模型個性，也不是作業系統隔離。模式名稱相同的不同產品，放行規則仍可能不同；要查該產品文件和目前設定，不要只依介面標籤猜測。

**Agent mode（Agent 模式）**通常指產品提供的一組工作方式，例如讓模型能反覆規劃、呼叫工具、根據結果接續處理。有些產品也把模型選擇、指令或權限預設一併包進「模式」。它不是跨產品共用的標準欄位，更不能直接等同權限模式。開啟 Agent mode 可能改變模型可用的循環或工具；使用者是否要核准每次操作，仍要查看該產品的 permission policy。反過來說，模型被要求「只讀」，也不會自動撤銷 Harness 已授予的寫入能力。

可以把三者想成不同層次：Agent mode 決定代理如何工作，Permission mode 決定呼叫如何過政策，Permission request 則處理某一次需要裁決的動作。實際產品可能把這些選項放在同一畫面，但概念仍可分開。Anthropic 的 Claude Code 文件便把工具權限規則、permission mode 與 Bash sandbox 分開說明，並指出權限規則由 Claude Code 執行，而不是由模型自行遵守。這是單一產品的例子，不可推論所有 Agent 的模式名稱和行為都相同。

### 核准時先看動作的實際範圍

確認介面應讓人看懂要執行的工具和參數。只顯示「Agent 想執行命令」不夠；最好能看見命令文字、目標檔案或服務、目前工作目錄，以及核准會生效多久。參數中若有環境變數或變數展開，也要注意它可能在執行時才指向真正路徑。`rm build/*` 看起來只清理輸出資料夾，但若 `build` 變成空字串或意外符號連結，影響範圍就會改變。

永久允許規則尤其要看範圍。一個精確的 `npm test` 規則，通常比整個 Shell 工具永久免詢問容易理解；若規則允許 `git *`，就可能涵蓋讀取紀錄、改寫提交和推送等不同效果。這些是具體產品的規則語意，應讀該產品文件並實際檢查已保存設定。對刪除、發布、推送、寄送或修改正式資料等操作，先查清楚目的地和作用對象，再決定是否核准。

核准也不替代安全的呼叫設計。當操作會建立遠端資源或寫入不可逆資料，工具可用明確的目標識別、預覽、冪等鍵或狀態查詢，降低重試造成重複副作用的機會。若第一次呼叫逾時，先查遠端是否已完成，再決定是否重送。這種作法把錯誤恢復能力放在系統設計裡，不必假定使用者能從一段不完整的日誌猜出結果。

## Sandbox 限制程序能做什麼，但不一定包住所有工具

**Sandbox（沙箱）**是透過容器、作業系統或虛擬機等機制，限制程序能讀寫的檔案、連線的網域或呼叫的系統能力。Permission policy 比較像「要不要准許這次工具呼叫」；Sandbox 則是在命令執行期間約束它碰得到的資源。兩者互補。有人核准一個 Shell 命令後，沙箱仍可限制它只寫入工作目錄；反之，命令雖然被沙箱限制在專案內，產品仍可能要求逐次核准。

沙箱的名字不等於封閉邊界。要確認哪些工具在沙箱內、哪些程序在沙箱外、讀取與寫入範圍是否相同、網路限制是否啟用，以及遇到失敗時是否能在沙箱外重試。若工具透過掛載路徑拿到家目錄或憑證，沙箱的隔離效果就和預期不同。某些 Agent 的內建檔案工具或 MCP Server 也可能不在 Shell sandbox 的範圍裡。

例如 Claude Code 的 Bash sandbox 文件描述的是它啟動的 Shell 命令邊界，並明確指出內建檔案工具、MCP Server 和 hooks 可能在該邊界之外。這足以說明產品文件要讀到具體涵蓋範圍，不能把「啟用 Sandbox」翻譯成「整個 Agent 已被隔離」。另一個產品或執行器可能使用完全不同的作業系統機制。

判斷沙箱是否有效，最好做一個無害的邊界測試：在專案外建立測試檔案、連到未允許的網域，觀察命令是否被拒絕，再確認測試沒有留下檔案。只查看設定中的 `enabled: true`，證明的是設定值存在，並沒有證明底層隔離已啟動。測試方法也要符合你的平台和 sandbox 實作，不能把某個產品的探測命令當通用標準。

## 用一個任務逐層定位錯誤

假設 Agent 要修復測試後更新 staging。先確認 Environment 指向預期 repo、分支、套件版本與測試端點，再確認 Filesystem 只讓它接觸必要的程式碼和測試資料。接著讀 Tool 的輸入契約與副作用，查清部署工具會連到哪個服務。執行時分清模型提出的 Tool call、政策核准、Harness 的結果，以及 staging 實際版本。最後再檢查部署是否影響預期服務。

遇到問題，可按以下順序查：

1. 模型是否選對工具，並送出完整且符合格式的參數？
2. Host 是否列出該工具，Client 是否連上預期的 Server？
3. Permission request 是被拒絕、只核准一次，還是改寫了持續規則？
4. Permission mode 和 Agent mode 目前各自如何影響這次呼叫？
5. 命令是在什麼 Environment 執行，Filesystem 與網路實際能到哪裡？
6. Sandbox 涵蓋這個工具和它啟動的子程序嗎？有沒有未沙箱重試？
7. Tool result 表示的是執行完成、執行失敗，還是狀態仍未明？外部狀態有沒有讀回？

這套檢查把「模型說要做」和「環境真的改變」拆成可觀察的步驟。使用者因此能問對問題：是工具契約、政策設定、執行權限、隔離範圍還是結果查證出了問題？

本篇對應原 repo 固定版本的 [Section 3：Tools & Environment](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/internal/Curriculum.md#section-3--tools--environment)，並依 [Environment](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-environment)、[Tool](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-tool)、[Tool call](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-tool-call)、[Tool result](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-tool-result)、[MCP](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-mcp)、[Permission request](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-permission-request)、[Permission mode](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-permission-mode)、[Agent mode](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-agent-mode)、[Filesystem](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-filesystem) 和 [Sandbox](https://github.com/mattpocock/dictionary-of-ai-coding/blob/ed1ebed3975cba04ed5e74c6ca73659274beb754/README.md#user-content-sandbox) 逐詞展開。規格與產品案例請直接查 [MCP 工具規格](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)、[MCP 安全指引](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices)、[Claude Code 權限設定](https://code.claude.com/docs/en/permissions) 和 [Claude Code Sandbox 範圍](https://code.claude.com/docs/en/sandboxing)。
