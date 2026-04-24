---
title: '不要啟用 ECC Observer：效能與副作用'
publishedAt: '2026-04-10T22:33:00+08:00'
status: 'draft'
slug: 'ecc-observer-do-not-enable'
tags:
  - claude-code-tools
  - claude-code
  - ecc
  - observer
---

在使用 ECC 插件時，你可能會在 `config.json` 中看到一個名叫 `observer.enabled` 的設定，預設值是 `false`。這不是偶然——背後有一些實際的效能和成本考量。

## 開啟後會遇到什麼

如果你冒著被勸阻的風險還是開啟了 ECC 的 continuous-learning-v2 observer，可能會遇到以下問題。

首先是分析失敗。Observer agent 會處理大量的 observations，在有限的 turns 內要將這些資訊整理、分類、產生 instincts。當資料量超過預期時，分析會卡在 `Error: Reached max turns (20)`，然後就停止了。

其次是產出品質問題。Observer 使用的是 Haiku agent，在高頻率、短時間內完成多個任務，有時候會不遵守 prompt 的格式要求。比如說，prompt 明確要求每個 instinct 必須包含 `id` 欄位，但 Haiku 輸出的結果往往缺少這個欄位。這些不符合規格的產出會被品質過濾器拋棄，你投入的 credits 就這樣白費了。

## 為什麼會這樣

這個問題讓人一度懷疑是 ECC 的設計有缺陷。但實際上，ECC 的管線設計本身沒有問題：

- Observer prompt 的確明確要求了 `id` 欄位，標示為 `MANDATORY`
- `parse_instinct_file` 過濾無 `id` 的 instincts 是刻意的品質保障機制
- 過去出現過的穩定性問題（比如 issue #521 的 memory explosion 和 #1141 的 orphan instincts）已經有 watchdog、throttle、guard 等機制來修復

**真正的根本原因是 Haiku 在有限的 turns 內沒有正確遵守 prompt 格式**，這不是 ECC 的設計缺陷，而是 Haiku 在這類高頻率任務上的限制。

## 實踐建議

最安全的做法是**維持 `observer.enabled: false` 的預設值**，除非你願意為了試驗而持續消耗 Haiku credits。

如果你確實需要自動產生 instincts，更可控的方式是手動觸發 `/ecc:evolve` 命令，這樣你可以根據實際情況決定何時執行，而不是讓 observer 在背景持續運行。

如果你不小心開啟了 observer 並且發現它在執行，可以用這些指令關閉它：

```bash
ps aux | grep observer-loop | grep -v grep | awk '{print $2}' | xargs kill
rm -f ~/.claude/homunculus/projects/*/.observer.pid ~/.claude/homunculus/.observer.pid
```

然後編輯 `config.json`，把 `observer.enabled` 改回 `false`。

## 什麼時候值得考慮

考慮開啟 observer 之前，問自己幾個問題：

- 你的 Haiku credits 預算足夠嗎？Observer 會持續運行，不斷消耗 credits，而產出的品質可能不如預期。
- 自動產生的 instincts 對你的工作流程實際上有多大幫助？手動執行 `/ecc:evolve` 是否已經足夠？

在大多數情況下，答案是「預設關閉就很好」。Observer 的設計思路是好的，但在實踐中，有限的模型能力和無限的運行成本之間的折衝，讓手動控制變成了更聰明的選擇。
