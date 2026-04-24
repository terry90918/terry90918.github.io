---
title: '三套學習系統的分工：Instinct、Skill、Memory'
publishedAt: '2026-04-10T22:01:00+08:00'
status: 'published'
slug: 'three-learning-systems-separation'
tags:
  - claude-code-tools
  - claude-code
  - ecc
  - learning
---

在 Claude Code 的日常使用中，我們會接觸到三套獨立的持久化系統：auto memory、`/ecc:learn` Skill 系統，以及 continuous-learning-v2 Instinct 系統。乍看之下，它們都和「學習」有關，但實際上規則完全不同。混淆它們的運作方式，會導致不必要的困擾。讓我來澄清這三套系統的職責邊界。

## 問題場景

假設你執行了 `/ecc:learn` 命令，想把學到的某個 debugging solution 儲存起來。但接著你想起 auto memory 的規則說「不要存 debugging solutions」，開始懷疑：這樣會不會違反原則？答案是：**不會**。

這正是三套系統常被混淆的地方。它們都涉及持久化和知識累積，但運作邏輯、儲存位置、觸發方式都不同，各自有各自的規則體系。

## 三套系統的職責分離

讓我用一個清晰的對比表來說明：

| 系統                       | 來源             | 儲存位置                    | 觸發方式        | 規則來源                              |
| -------------------------- | ---------------- | --------------------------- | --------------- | ------------------------------------- |
| **auto memory**            | Claude Code 內建 | `memory/`                   | Claude 主動判斷 | system prompt 的 `# auto memory` 區段 |
| **`/ecc:learn`**           | ECC plugin       | `~/.claude/skills/learned/` | 使用者觸發指令  | skill 指令的 output format            |
| **continuous-learning-v2** | ECC plugin       | `~/.claude/homunculus/`     | hooks 自動觀察  | `observe.sh` + `instinct-cli.py`      |

### 各系統的獨立性

**auto memory**：這是 Claude Code 內建的自動記憶系統。當我主動判斷某個資訊值得留存時（如你的開發偏好、特定專案的背景、已驗證的技術決策），會自動寫入 `memory/` 目錄。它有嚴格的「什麼不該存」規則——比如除錯方案、臨時狀態、代碼模式等——目的是避免堆積無用的信息。這些規則**只適用於 `memory/` 目錄**。

**`/ecc:learn` Skill 系統**：當你執行 `/ecc:learn` 命令時，系統會按照 skill 指令定義的格式和路徑，將內容存到 `~/.claude/skills/learned/`。這個系統有明確的 output format 規範，但**不受 auto memory 的排除規則影響**。你可以在 `~/.claude/skills/learned/` 裡存放任何你想學習和複用的內容——包括 debugging solutions、pattern 範本、API 用法——因為這是你**主動、有意識地選擇保存**的知識庫。

**continuous-learning-v2 Instinct 系統**：這套系統透過 hooks 自動觀察你的工作，並用 `observe.sh` 和 `instinct-cli.py` 分析提取有價值的 instincts（直覺性規則）。它存放在 `~/.claude/homunculus/`，完全獨立運作，不依賴前兩套系統的規則。

## 核心原則

這些原則確保三套系統各司其職：

1. **auto memory 的排除規則只管 `memory/` 目錄** — 「不要存 debugging solutions」只是告訴 auto memory 系統什麼時候不該主動記錄，對 `/ecc:learn` 完全無約束力。

2. **`/ecc:learn` 有明確儲存路徑時，直接遵守** — skill 指令說「存到 `~/.claude/skills/learned/`」，就直接存，不用考慮其他系統的規則是否有衝突。

3. **continuous-learning-v2 的 instincts 自動產生** — 這套系統由 hooks 驅動，自成一套邏輯，不需要手動管理，也不會受前兩套系統影響。

4. **判斷「該不該存」時，先確認是哪套系統** — 當你拿不準時，回答這個問題：「我現在用的是哪套系統？」然後只套用該系統的規則。

## 實踐指南

**當你執行 `/ecc:learn` 時**：存到 `~/.claude/skills/learned/`，按照 skill output format 來。不用擔心 auto memory 說過什麼，因為這是你主動的選擇。

**當 auto memory 觸發時**：Claude 會主動判斷並存到 `memory/` 目錄。遵守「不要存 debugging solutions」等規則，保持 auto memory 的精良。

**當 continuous-learning-v2 運行時**：hooks 在背後自動觀察和記錄 instincts。你不需要介入，它自成體系。

三套系統各有其道理，分工明確。只要認清各系統的邊界和規則，就能有效利用 Claude Code 的多層學習能力，避免規則之間的衝突和困惑。
