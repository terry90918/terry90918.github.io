---
title: '用 claude CLI 子進程執行批次 LLM 任務'
publishedAt: '2026-04-09T17:07:00+08:00'
status: 'draft'
slug: 'claude-cli-batch-automation'
tags:
  - claude-code-tools
  - claude-code
  - cli
  - batch
  - automation
---

在進行大規模工程分析時，經常會遇到需要對多個專案或目錄逐一執行 LLM 分析的情況。如果手動逐次執行，效率會非常低下；直接調用 Claude API 又需要額外的 token 管理和認證邏輯。其實有個更簡潔的方案：直接利用 `claude` CLI 作為子進程，搭配 shell loop 來自動化批次任務。

## 核心方案

基本的做法是透過 shell 迴圈呼叫 `claude` CLI，並配合幾個關鍵旗標來控制行為：

```bash
ECC_SKIP_OBSERVE=1 claude --model haiku --max-turns 20 --print \
  --allowedTools "Read,Write" \
  -p "$prompt" >> "$log_file" 2>&1 &
claude_pid=$!

# watchdog timeout
( sleep 120; kill "$claude_pid" 2>/dev/null ) &
watchdog_pid=$!
wait "$claude_pid"
kill "$watchdog_pid" 2>/dev/null || true
```

這個方案之所以有效，是因為每個重要的旗標都各司其職：

- **`--model haiku`**：選用成本較低的 Haiku 模型，適合大量簡單任務
- **`--print`**：啟用非互動模式，適合背景執行
- **`-p`**：直接傳遞 prompt，避免透過 stdin 的複雜性
- **`--allowedTools`**：限制可用工具範圍，防止誤操作或安全問題
- **`ECC_SKIP_OBSERVE=1`**：避免子進程的觀察記錄污染主 session 的資料

timeout 機制也很重要。透過啟動 watchdog 子進程，確保任何卡住的 claude CLI 實例都能被及時終止，不會無限期掛起。

## 實踐例子

以下是一個實際應用：批次分析存放在多個專案目錄中的 observations 檔案，並將發現的模式寫入各自的 instincts 資料夾：

```bash
for dir in ~/.claude/homunculus/projects/*/; do
  hash=$(basename "$dir")
  obs="$dir/observations.jsonl"
  [ -f "$obs" ] || continue
  count=$(wc -l < "$obs")
  [ "$count" -lt 20 ] && continue

  ECC_SKIP_OBSERVE=1 claude --model haiku --max-turns 20 --print \
    --allowedTools "Read,Write" \
    -p "Analyze $obs and write patterns to $dir/instincts/personal/" \
    >> "$dir/batch.log" 2>&1
done
```

這個指令碼遍歷專案目錄，檢查是否存在足夠的 observations 資料，然後呼叫 Claude 進行分析。每個專案的輸出會記錄到各自的 `batch.log`，方便事後追蹤。

## 什麼時候應該用這個方案

這種做法特別適合以下情況：

- **批次分析多個目錄**：當需要對數十或數百個專案目錄執行相同的 LLM 操作時
- **背景定期任務**：搭配 cron 或 `nohup` 進行定期執行，例如每晚自動補跑分析
- **單次非互動任務**：不需要在過程中與 LLM 進行互動的場景
- **continuous-learning 補跑**：例如系統升級後需要回溯處理歷史資料

關鍵優勢在於簡潔性和可靠性。無需額外的 token 管理或 API 認證邏輯，純粹依賴既有的 CLI 工具；同時透過子進程的方式，可以輕鬆添加超時保護、日誌記錄和並發控制。對於需要大規模執行相同分析任務的工程工作流來說，這是一個相當務實的解決方案。
