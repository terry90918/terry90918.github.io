---
title: 'Docker + Turborepo Monorepo 建置設定'
publishedAt: '2026-03-30T12:33:00+08:00'
status: 'published'
slug: 'docker-turborepo'
tags:
  - infrastructure-deployment
  - docker
  - turborepo
  - monorepo
  - build
---

在構建 Turborepo monorepo 應用時，Docker 部署往往成為最棘手的環節。本文整理了幾個在實戰中屢屢踩坑的問題，希望能幫助你順利地將 Turborepo 應用容器化。

## 認識 turbo prune 的工作原理

當你使用 `turbo prune --docker` 準備 Docker 多階段建置時，首先要理解的是：**workspace 的名稱取決於 `package.json` 中的 `name` 欄位，而不是目錄名**。這個細節很容易被忽略，導致 prune 時無法找到正確的 workspace。

此外，`turbo prune` 有一個常被忽視的限制——它**不會包含根目錄的 `tsconfig.json`**。如果你的根 TypeScript 配置對建置至關重要，別忘了在 pruner 階段後手動複製：

```dockerfile
COPY --from=pruner /app/tsconfig.json .
```

在實際動手前，建議先執行 `turbo prune --dry` 來確認會包含哪些檔案，這樣可以及早發現遺漏的資源。

## Coolify 的 ARG 自動注入陷阱

如果你使用 Coolify 部署 Docker 應用，需要特別留意一個隱藏的機制：**Coolify 會自動注入 `ARG NODE_ENV=production`**。這意味著，如果你在 builder 階段直接執行 `bun install`，它會跳過安裝 devDependencies，導致建置過程中缺少必要的工具。

解決方案是在 builder 階段明確覆蓋環境變數：

```dockerfile
RUN NODE_ENV=development bun install
```

這樣才能確保開發依賴被正確安裝。

## Runner 階段：複製而非重新安裝

Turborepo 官方建議的做法是：**不要在 runner 階段重新執行 `bun install --production`**。原因很直白——在複雜的 monorepo 結構中，workspace 之間往往存在相互引用（如 dashboard → cli → mcp），加上 devDependencies 的參照鏈和 bun.lock 中的過時條目，重新安裝很容易失敗。

更可靠的做法是直接從 builder 階段複製編譯好的 `node_modules`：

```dockerfile
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/entire_dashboard/node_modules ./entire_dashboard/node_modules
```

這樣規避了複雜的依賴解析問題，讓部署更加穩定。

## Hono serveStatic 的路徑陷阱

如果你在 Hono 應用中使用 `serveStatic` 提供靜態檔案，要格外小心 `root` 參數的含義。許多開發者會直觀地認為它相對於程式碼位置，但實際上**它相對於 `process.cwd()`——也就是 Docker 容器的 `WORKDIR`**。這個細節很容易造成 404 錯誤。在配置時務必清楚地指定：

```javascript
serveStatic({ root: './dist' })
```

並確保檔案位置與 `WORKDIR` 的相對位置相符。

## 處理非依賴關係的 Workspace

`turbo prune` 只會包含目標 workspace 的依賴鏈。如果你需要在建置時包含某個不在依賴路徑上的 workspace（例如 MCP server），需要手動處理。

既然 pruner 階段擁有完整源碼，你可以在 builder 階段手動複製並編譯：

```dockerfile
COPY --from=pruner /app/entire_mcp ./entire_mcp
RUN cd entire_mcp && bun build src/server.ts --outdir dist --target bun --format cjs
```

然後在 production 階段複製編譯產物：

```dockerfile
COPY --from=builder /app/entire_mcp/dist ./entire_mcp/dist
```

## 根 package.json 的 workspaces 欄位問題

這是最容易被忽視的細節：**`turbo prune` 產生的 `out/json/package.json` 會保留原始的 workspaces 列表，包括那些被 prune 掉的 workspace**。當你在 builder 階段執行 `bun install` 時，它會嘗試尋找所有列在 workspaces 中的目錄，導致「Workspace not found」錯誤。

正確的做法是在 `bun install` 前過濾 package.json，只保留實際存在的 workspace：

```dockerfile
COPY --from=pruner /app/out/json/ .
RUN bun -e "const fs=require('fs'),p=JSON.parse(fs.readFileSync('package.json','utf8'));p.workspaces=p.workspaces.filter(w=>w.includes('*')||fs.existsSync(w));fs.writeFileSync('package.json',JSON.stringify(p,null,2))"
RUN NODE_ENV=development bun install
```

跳過這一步會導致類似 `Workspace not found "entire_db"` 或 `failed to resolve` 的建置失敗。

## 實戰檢查清單

在構建 Turborepo Docker 應用時，記得檢查：

- workspace `name` 是否在 `package.json` 中正確定義
- 根 `tsconfig.json` 是否被正確複製
- Builder 階段的環境變數是否明確覆蓋了 Coolify 的 ARG
- Runner 階段是否複製而非重新安裝 node_modules
- 靜態檔案路徑是否相對於 `WORKDIR`
- 非依賴 workspace 是否手動複製和編譯
- 根 package.json 的 workspaces 欄位是否被正確過濾

這些細節看似瑣碎，但往往是 Docker 建置失敗的根本原因。希望這份整理能在你的下一次部署中節省寶貴的除錯時間。
