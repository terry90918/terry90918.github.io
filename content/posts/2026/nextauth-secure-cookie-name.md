---
title: 'NextAuth 安全 Cookie 名稱設定'
publishedAt: '2026-03-28T14:33:00+08:00'
status: 'published'
slug: 'nextauth-secure-cookie-name'
tags:
  - security-error-handling
  - nextauth
  - security
  - cookies
---

最近在用 curl 測試 HTTPS 環境的 NextAuth v5 API 時，發現一個看似簡單但容易踩坑的細節：session cookie 的名稱會根據協議不同而自動改變。

## 問題所在

如果你在本地開發環境測試成功，但在部署到 HTTPS 環境後卻收到 `401 Unauthorized`，有很大可能是 cookie 名稱對不上。

NextAuth v5 基於安全考量，會在 HTTPS 環境下自動為 session cookie 名稱加上 `__Secure-` 前綴。這個前綴是 HTTP Secure cookie 的標準做法，用來明確標記這個 cookie 只應在 HTTPS 連線中傳送。

具體來説：

| 環境                | Cookie 名稱                     |
| ------------------- | ------------------------------- |
| HTTP（localhost）   | `authjs.session-token`          |
| HTTPS（production） | `__Secure-authjs.session-token` |

## 實際應用

當你需要用 curl 手動測試 API 端點時，記得根據環境選擇正確的 cookie 名稱：

```bash
# 本地開發（HTTP）
curl -H "Cookie: authjs.session-token=$TOKEN" http://localhost:3000/api/protected-endpoint

# 部署環境（HTTPS）
curl -H "Cookie: __Secure-authjs.session-token=$TOKEN" https://app.example.com/api/protected-endpoint
```

## 何時會遇到這個問題

- 從 NextAuth 資料庫的 `sessions` 表直接取得 token，然後用 curl 手動測試 API
- 本地測試一切正常，但部署到 HTTPS 環境後 API 呼叫開始失敗
- 調試 API 認證問題時，需要確認 session token 是否有效

## 除錯小技巧

如果不確定當前環境的 cookie 名稱是什麼，可以透過瀏覽器開發者工具檢查：

1. 開啟 DevTools → Application 頁籤
2. 找到 Cookies 分類
3. 查看 session cookie 的實際名稱

或者直接查看 NextAuth 的配置文件，看當前環境是否啟用了 HTTPS。

這個細節看似微小，但在除錯認證問題時往往能節省不少時間。記住：當 HTTPS 環境出現 401 時，第一步先檢查 cookie 名稱是否加上了 `__Secure-` 前綴。
