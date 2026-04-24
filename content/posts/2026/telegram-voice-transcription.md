---
title: '用 Whisper 轉錄 Telegram 語音訊息'
publishedAt: '2026-03-22T18:26:00+08:00'
status: 'published'
slug: 'telegram-voice-transcription'
tags:
  - tooling-workflow
  - telegram
  - whisper
  - transcription
  - automation
---

## 背景

在日常工作中，我經常透過 Telegram 收到語音訊息。雖然語音很便捷，但 Claude Code 無法直接「聽」音檔，必須先轉錄成文字才能理解內容。Telegram 語音訊息以 .oga 格式傳送，若要處理這類附件，需要一套可靠的轉錄 Pipeline。

## 解決方案

我在 podcast-to-blog 外掛中找到了一個現成的 Whisper 轉錄腳本，可以轉錄語音檔案並輸出文字。整個流程分為三步：

### 第一步：下載附件

使用 `download_attachment` 工具取得語音檔案的本機路徑。

### 第二步：運行轉錄腳本

轉到 podcast-to-blog 外掛目錄，執行 Whisper 轉錄：

```bash
cd /Users/terrychen/Documents/Github/terry90918/jurislm-claude-plugins/plugins/podcast-to-blog
python3 scripts/transcribe.py <voice_file.oga> \
  --model small \
  --language zh \
  --output /tmp/voice_transcript.txt
```

關鍵參數說明：

- `--model small`：使用 small 模型（中文轉錄的最佳平衡點）
- `--language zh`：指定轉錄語言為中文
- `--output`：指定輸出文字檔的路徑

### 第三步：讀取結果

轉錄完成後，用 `Read /tmp/voice_transcript.txt` 讀取轉錄的文字內容。

## 模型選擇

Whisper 提供多個模型大小，各有不同的速度和準確度權衡：

| 模型         | 執行速度 | 中文品質         | 建議場景                |
| ------------ | -------- | ---------------- | ----------------------- |
| tiny         | 最快     | 差（常出現亂碼） | 不建議用於中文          |
| small        | 中等     | 良好             | **預設選擇**            |
| medium/large | 較慢     | 最佳             | 當 small 品質不足時升級 |

在實務上，**small 模型是最平衡的選擇**。它的轉錄速度足夠快，對中文的識別效果也很不錯，不會因為使用 tiny 模型而產生大量錯誤。只有在轉錄結果品質明顯不足時，才需要升級到 medium 或 large 模型。

## 依賴安裝

在使用轉錄腳本前，確保以下工具已安裝：

```bash
# 安裝 FFmpeg（用於音訊格式轉換）
brew install ffmpeg

# 安裝 OpenAI Whisper
pip install openai-whisper
```

podcast-to-blog 外掛本身提供了 `scripts/transcribe.py` 檔案，無需另外安裝。

## 何時使用這套方案

這套轉錄 Pipeline 適用於以下情況：

- **收到 Telegram 語音訊息**：當 attachment_file_id 類型為 voice 時
- **需要理解口述內容**：用戶透過語音傳達指令或複雜資訊時
- **快速文字化**：比手動抄寫快得多，且支援中文語境

有了這套流程，無論是長篇語音筆記、快速口述指令，或是臨時的想法記錄，都能迅速轉換成可搜尋、可編輯的文字形式。
