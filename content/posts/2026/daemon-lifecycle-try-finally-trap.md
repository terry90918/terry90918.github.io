---
title: 'Daemon try/finally 清理與 setInterval 生命週期衝突'
publishedAt: '2026-04-06T11:27:00+08:00'
status: 'draft'
slug: 'daemon-lifecycle-try-finally-trap'
tags:
  - security-error-handling
  - daemon
  - lifecycle
  - error-handling
  - javascript
---

當你在構建 CLI 框架時，通常會使用 try/finally 來管理命令的生命週期——在 try 區塊初始化資源，在 finally 區塊清理。這個模式對大多數同步或簡短的非同步命令都效果良好。但當你引入 daemon 類命令（那些需要在背景持續運行的命令）時，這個看似安全的設計會暴露出一個隱藏的陷阱。

## 問題的根源

想像一個典型的 CLI 框架 wrapper：

```typescript
async function runCommand(fn) {
  try {
    await initResources() // 初始化 logger、DB pool 等共享資源
    await fn() // 執行命令
  } finally {
    await cleanupResources() // 清理共享資源
  }
}
```

對於遷移、同步或一次性任務來說，這個流程完美無缺。命令執行完畢，finally 塊優雅地清理所有東西。

但現在考慮一個 daemon 命令的實現：

```typescript
async function daemonCommand() {
  await firstTick()
  setInterval(() => tick(), 60000) // 排程每 60 秒執行一次
  // 函數在這裡返回
}
```

問題就在於這個返回點。以下是發生的情況：

1. `initResources()` 執行完畢——logger 和 DB 連線已準備好
2. `daemonCommand()` 被調用，`setInterval()` 成功建立了循環計時器，然後函數**返回**
3. try/finally 的 finally 區塊立即執行，開始清理資源
4. 60 秒後，setInterval 的回調觸發，但共享資源已經被銷毀
5. 應用程式崩潰或無聲地失敗

這是一個典型的生命週期衝突。daemon 類命令預期資源在整個進程的生命週期內保持活動，但 try/finally wrapper 假設所有資源的使用都發生在函數執行期間。

## 解決方案

修復這個問題的核心思想是：daemon 命令不應該返回。

### 方案一：使用 Promise 阻塞（推薦）

讓命令在永久阻塞的 Promise 上等待，直到收到關閉信號：

```typescript
async function daemonCommand() {
  await firstTick()

  await new Promise<void>((resolve) => {
    const handle = setInterval(() => tick(), 60000)

    const shutdown = () => {
      clearInterval(handle)
      resolve()
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  })

  // 現在函數才真正返回，finally 塊清理已經不再需要的資源
}
```

這個方案的優點是命令的控制流保持完整——初始化、運行、清理都發生在邏輯上正確的時刻。當進程收到 SIGTERM 或 SIGINT 信號（例如 Docker stop 或 Kubernetes 終止），Promise 解決，函數返回，finally 塊執行清理。

### 方案二：跳過 wrapper（適用於特殊情況）

如果 daemon 命令足夠複雜，可以讓它完全繞過 try/finally wrapper，自行管理資源生命週期：

```typescript
async function daemonCommand() {
  const resources = await initResources()

  setInterval(() => tick(resources), 60000)

  process.on('SIGTERM', () => cleanupResources(resources))
  process.on('SIGINT', () => cleanupResources(resources))
}
```

這個方案給予 daemon 命令更多的控制權，但代價是失去了 wrapper 提供的一致性保證。只有在你確實需要不同的生命週期管理策略時才應該使用。

## 診斷清單

當你看到奇怪的行為——比如 logger 突然停止輸出，或者資源顯示為未初始化——檢查以下幾點：

- **檢查命令類型**：該命令是否使用了 setInterval、事件監聽器或其他會讓代碼持續運行的機制？
- **檢查執行流程**：wrapper 的 finally 塊是否在 setInterval 之後就立即執行了？
- **檢查資源狀態**：共享資源（logger、DB 連線、文件句柄）是否在非預期的時刻變成了 null 或無效？

## 何時會遇到這個問題

這個陷阱最常出現在以下場景：

- 向現有的 CLI 框架添加 daemon 或 watchdog 類命令時
- Logger 或 DB 連線在長時間運行後突然失效時
- 命令的第一次執行正常，但後續的定期執行靜默失敗時

如果你在構建任何形式的長時間運行的後台任務，記住：**生命週期管理必須與代碼的實際執行模式相匹配**。簡短的命令可以信任 try/finally，但 daemon 需要你顯式地阻止返回，直到真正準備好清理。
