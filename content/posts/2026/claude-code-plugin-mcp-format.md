---
title: 'Claude Code Plugin MCP 格式規範'
publishedAt: '2026-03-25T14:43:00+08:00'
status: 'draft'
slug: 'claude-code-plugin-mcp-format'
tags:
  - claude-code-tools
  - claude-code
  - mcp
  - plugins
---

在建立 Claude Code plugin 時，如果你的 plugin 包含了 MCP Server，有一個容易被忽視的格式陷阱。讓我分享一個實際遇到的問題和解決方案。

## 為什麼 MCP 沒被偵測到？

你可能遇過這種情況：plugin 安裝成功了（✅ enabled），但 MCP Server 完全沒有出現在 Claude Code 的 MCP 列表中。這不是 "MCP Failed" 的錯誤提示，而是根本看不到 MCP 子項目。問題往往出在 `.mcp.json` 的格式上。

## 關鍵差異：Plugin 格式 vs 標準格式

如果你參考了標準的 `.mcp.json` 文檔，你可能會寫成這樣：

```json
{
  "mcpServers": {
    "my-server": {
      "type": "http",
      "url": "https://example.com/mcp"
    }
  }
}
```

但這對 Claude Code plugin 來說是**錯誤的**。正確的做法是**移除 `mcpServers` 外層包裝**：

```json
{
  "my-server": {
    "type": "http",
    "url": "https://example.com/mcp"
  }
}
```

看起來只是少了一層括號，但這就是 Claude Code plugin 能否正確偵測 MCP 的關鍵。如果觀察已經運作良好的 plugin（例如 coolify、context7、notion），你會發現它們都採用無外層包裝的格式。

## Plugin Marketplace 的目錄結構

Claude Code plugin 支援同時發佈到 Marketplace 和 Cowork，因此目錄結構需要這樣組織：

```
my-plugin/
├── .claude-plugin/
│   └── marketplace.json          # Claude Code Marketplace 定義
├── README.md
└── plugins/
    └── name/                     # 實際的 plugin 本體
        ├── .claude-plugin/
        │   └── plugin.json       # Plugin 詳細資訊
        ├── .mcp.json             # ← 無 mcpServers 包裝！
        ├── skills/
        └── commands/
```

這個結構允許你在 Marketplace 上發佈同時，也能在 Cowork 上使用。

## 本地測試

在 Claude Code 中測試你的 plugin 很簡單。進入 `/plugin` 指令，選擇 Marketplaces，然後 Add，輸入本地路徑 `./my-plugin` 即可。

有時候你可能會看到 `Marketplace 'inline' not found` 的警告，但這不會影響 plugin 的功能，可以忽略。

## 重點總結

建立 Claude Code plugin 時，記住：

- `.mcp.json` **不需要** `mcpServers` 外層包裝
- 目錄結構要支援 Marketplace + plugin 本體的二元結構
- 本地測試用 `/plugin` 指令簡單快速

這個看似微小的格式差異，經常是新建 plugin 時 MCP 無法被偵測的隱形兇手。希望這個分享能幫你少走一些彎路！
