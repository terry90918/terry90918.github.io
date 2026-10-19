---
title: 'pstack 深度導讀（上）：一個工程 Agent 外掛的完整地圖'
publishedAt: '2026-10-18T23:18:33+08:00'
status: 'published'
slug: 'cursor-pstack-plugin-analysis'
excerpt: '從 pstack 0.15.26 的 171 個檔案看懂外掛如何分發技能、路由任務、委派工作，以及哪些限制仍由 Cursor 和專案工具負責。'
tags:
  - cursor
  - ai-agent
  - developer-tools
  - agent-workflow
metaDescription: 'pstack 深度導讀（上）以 pstack 0.15.26 原始碼為準，拆解 Cursor 外掛的 manifests、poteto-mode、技能、playbook、代理、腳本與 Claude Code 發行副本。'
---

pstack 看起來像一大疊 Markdown，但它實際上是一個有入口、有路由、有工作流程、有輔助程式和發行檢查的 Agent 外掛。讀它時，先不要把每個檔案都叫作「提示詞」。不同檔案負責的工作不同，有些是 Agent 會讀的規則，有些是安裝資料，有些則真的會被執行。

本文依 Cursor 官方 plugins repository 的 pstack **0.15.26** 版本撰寫，固定來源是 [2026-10-18 的版本提交](https://github.com/cursor/plugins/commit/0b8e952052d482ee6de06deebf14d590d77b1b34)。這個 pstack 子目錄共有 171 個檔案：55 個技能、23 份 playbook、78 個技能參考與支援檔、兩份代理設定、Benny 自動化素材、使用指南、manifest 和圖片。本文看的是 pstack 子目錄及直接維護其 Claude Code 發行副本的產生器，不把 Cursor plugins repository 中其他外掛算進來。

## 先抓住 pstack 和 Agent 的分工

**pstack 提供工程工作流程與操作提示；Cursor 提供模型、工具和執行環境。**

pstack 不會自己啟動一個模型服務，也不會自己取得檔案或 GitHub 權限。它把技能和 Agent 定義交給宿主產品；真正的檔案讀寫、命令執行、MCP、子代理和外部服務存取，仍取決於目前 Cursor 工作階段能使用哪些工具，以及那些工具的權限。

這個分工決定我們該如何評估它。像「先在原介面重現 bug」是流程要求；Cursor 或專案若沒有可操作的瀏覽器、App 或測試環境，這個要求就無法完成。像「不要合併」是 Agent 應遵守的規則；要真正阻止合併，仍需要外部工具權限、GitHub 規則或其他執行端控制。**SKILL.md 可以安排工作，不能單靠文字變成權限系統。**

## pstack 裡有哪些零件

| 零件               | 主要檔案                                                                                                                                                                                                                                                    | 負責的工作                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 安裝描述           | [Cursor manifest](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/.cursor-plugin/plugin.json)、[plugin manifest](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/plugin.json) | 告訴宿主這個套件叫什麼、版本是多少、要載入哪些目錄。                                |
| 主入口             | [poteto-mode](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/SKILL.md)                                                                                                                           | 看懂任務，挑一份 playbook，把步驟列出來，再按需讀取其他技能。                       |
| 工作流程           | [23 份 playbook](https://github.com/cursor/plugins/tree/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/playbooks)                                                                                                                       | 說明一類工作如何開始、何時分工、要拿什麼證據、在哪裡停止。                          |
| 專門技能與原則     | [skills 目錄](https://github.com/cursor/plugins/tree/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills)                                                                                                                                                | 一般技能處理一種工作；24 個原則在特定決策點提醒 Agent 選擇。                        |
| 代理與參考資料     | [agents](https://github.com/cursor/plugins/tree/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/agents)、技能內的 references                                                                                                                                | 規定子工作要帶哪些背景、回報什麼；補足路由器或技能的細節。                          |
| 可執行輔助工具     | [poteto-mode/scripts](https://github.com/cursor/plugins/tree/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/skills/poteto-mode/scripts)                                                                                                                    | 檢查計畫格式、管理持久工作狀態、整理 PR 證據或盤點 worktree。                       |
| 新手文件           | [十篇使用指南](https://github.com/cursor/plugins/tree/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/docs/guide)                                                                                                                                           | 從安裝、任務路由一路介紹到驗證、原則和自訂技能。                                    |
| 未啟用的自動化套件 | [Benny](https://github.com/cursor/plugins/tree/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/automations/benny)                                                                                                                                           | 提供 Slack 問題分類與重現修復的操作檔、範本和設定範例；安裝 pstack 不會自動啟用它。 |

Manifest 是安裝目錄，不是整套工作的流程。主入口和 playbook 決定 Agent 如何安排工作；技能和原則補上特定決策；腳本則負責某些能用程式檢查的條件。理解這些層次後，才不會把「repo 裡有一個檔案」誤認為「每次任務都會執行它」。

## 一個任務如何從入口走到驗收

使用者通常只要先描述目標和完成條件。pstack 把路由工作放在 /poteto-mode：

![pstack 任務路徑圖：入口路由到 playbook，再使用技能、原則和委派提示，最後以真實證據驗證；Benny 位於獨立的自動化路徑](/images/cursor-pstack/pstack-task-flow.svg)

這不是每個任務都要走一條固定長管線。只讀調查可能不委派、不改碼；簡單修正可能不需要架構競賽；大型長期工作才需要持久記錄、分層協調和多個驗證者。poteto-mode 的工作是選一個合適流程，不是把所有技能都跑一遍。

pstack 的 [新手指南](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack/docs/guide/README.md) 也把使用方式說得很直接：使用者提出目標與如何判斷完成，poteto-mode 選 playbook，其他技能在流程需要時才載入。使用者不必先背 55 個技能的名字。

## 技能不是 55 個平行入口

pstack 0.15.26 有 55 個 SKILL.md：31 個一般技能和 24 個原則技能。大多數技能設定成需要明確呼叫或由 poteto-mode 載入，並非描述相似就都會自行啟動。唯一的 frontmatter 例外是 setup-pstack；它能依描述被宿主判斷是否適用。完整的技能定位與限制會放在[pstack 深度導讀（下）](/posts/2026/cursor-pstack-prompt-analysis)。

playbook 也不是另一批 slash commands。它是 poteto-mode 針對一種任務選取的流程檔。這一點很關鍵：使用者通常從任務開始，不必先知道所有內部零件；路由器再把較大的目標拆成步驟。

## pstack 現在還有 Claude Code 發行副本

0.15.26 的一項重要變化，是 Cursor 原始套件之外增加了 Claude Code 版本。Cursor 直接使用 pstack/；repository 根目錄的 harness/pstack/claude-code/ 則是由 [generate-pstack-harness-trees.mjs](https://github.com/cursor/plugins/blob/0b8e952052d482ee6de06deebf14d590d77b1b34/scripts/generate-pstack-harness-trees.mjs) 產生的副本。

產生器把技能、代理、指南與一份 Claude Code adapter 搬到發行目錄，並調整文件裡的工具名稱、模型欄位與路徑。Claude Code 沒有的 Cursor 專屬功能會按 adapter 規則標示跳過。副本刻意不包含 Benny 和 assets 等完整的 pstack 目錄內容；遇到缺失的相對路徑時，文件會連回 GitHub。

這讓同一套工作方法能在另一個宿主使用，也帶來維護責任：pstack 是主要來源，generated copy 必須跟著更新。repository 的 CI 執行產生器檢查；如果手動改了副本卻沒有更新來源，檢查會失敗。這個 CI gate 能證明發行副本和來源一致，**不能證明 Agent 會遵守文件裡每條工作規則**。

## 如何判斷一條規則是不是真正的限制

看它由誰執行：

| 看到的內容                        | 由誰執行           | 能保證什麼                                  |
| --------------------------------- | ------------------ | ------------------------------------------- |
| SKILL.md 或 playbook 寫「先驗證」 | 模型依文字指示執行 | 流程有被描述，不代表一定被遵守。            |
| 腳本檢查計畫、狀態或輸出格式      | 腳本在被呼叫時執行 | 只有腳本涵蓋的條件會被檢查。                |
| 專案 CI / GitHub 保護規則         | CI 或服務端設定    | 可以拒絕不符合條件的提交、PR 或合併。       |
| Cursor 的 sandbox 和工具權限      | 宿主與作業系統     | 限制 Agent 實際可讀寫的資源或可呼叫的工具。 |

pstack 同時有文字流程和少量程式檢查，但它不是一個獨立的安全執行環境。尤其當 playbook 要求 live UI、Bugbot、Cloud Agent、GitHub 或其他 MCP 時，能不能操作仍取決於安裝和授權。缺少工具時，流程應回報受阻或證據不足；不應把提示本身說成已經補上能力。

## 這三篇如何一起讀

- **pstack 深度導讀（上）**：先看清 repo 裡每一層各自負責什麼，以及 pstack 與 Cursor 的邊界。
- [**pstack 深度導讀（中）：任務如何經過 23 份 Playbook 與 24 個原則**](/posts/2026/cursor-pstack-workflow-design-guide)：看 playbook 與原則怎樣分流、改變工作順序。
- [**pstack 深度導讀（下）：55 個技能、代理提示、自動化與程式檢查**](/posts/2026/cursor-pstack-prompt-analysis)：按觸發條件、工作方式、依賴和限制拆解每一類提示。

本文使用 [pstack 0.15.26 固定版本](https://github.com/cursor/plugins/tree/0b8e952052d482ee6de06deebf14d590d77b1b34/pstack)；上游更新後，技能數量、預設模型和工具支援都可能改變。
