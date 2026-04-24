---
title: 'ECC_SKIP_OBSERVE 旗標的使用時機'
publishedAt: '2026-04-09T17:13:00+08:00'
status: 'draft'
slug: 'ecc-skip-observe-flag'
tags:
  - claude-code-tools
  - claude-code
  - ecc
  - flags
---

## ECC_SKIP_OBSERVE 旗標的使用時機

在使用 claude CLI 啟動子進程來執行批次任務時，有一個容易忽視的問題：子進程本身執行的工具呼叫也會被 PreToolUse/PostToolUse hooks 所捕捉，進而記錄到 `observations.jsonl` 中。這會造成「觀察者觀察自己」的 meta 雜訊，污染你的學習資料。特別是在使用 Haiku 模型執行子進程時，這種情況會變得更加明顯，因為每個工具呼叫都會被層層記錄，最終導致 observations.jsonl 充滿無意義的巢狀記錄。

解決這個問題的方法很簡單：在啟動子進程時加上 `ECC_SKIP_OBSERVE=1` 環境變數。例如：

```bash
ECC_SKIP_OBSERVE=1 claude --model haiku --print \
  --allowedTools "Read,Write" \
  -p "$prompt"
```

`observe.sh` hook 會在執行前檢查這個環境變數，若其值為 1，就會直接執行 `exit 0` 跳過記錄動作，從而避免污染你的觀察資料。

這個旗標特別適用於以下場景：

- **批次文件分析**：需要用 claude CLI 逐一處理多個檔案時
- **continuous-learning-v2 observer loop**：自動觀察和分析工作流程時
- **背景自動化任務**：執行定期或臨時的自動化工作時
- **一次性 claude 呼叫**：任何不希望被記錄為觀察資料的臨時指令

如果你忘記添加這個旗標，會看到 observations.jsonl 被大量的 meta 記錄填滿，這不僅會增加檔案體積，還會在 Observer agent 進行分析時導致它萃取出錯誤的「本能」（learned patterns），進而影響未來的工作品質。因此，只要涉及子進程呼叫，記得加上 `ECC_SKIP_OBSERVE=1` 這個簡單但重要的標記，就能有效保持觀察資料的純淨。
