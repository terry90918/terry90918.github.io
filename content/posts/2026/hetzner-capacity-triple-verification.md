---
title: 'Hetzner 伺服器容量的三重驗證流程'
publishedAt: '2026-04-19T14:35:00+08:00'
status: 'draft'
slug: 'hetzner-capacity-triple-verification'
tags:
  - infrastructure-deployment
  - hetzner
  - infrastructure
  - verification
---

Hetzner Cloud 的 CAX（ARM Ampere）系列伺服器從 2026 年 3 月中旬開始陷入持續的容量危機。如果你曾經在維護視窗中執行 rescale 操作，只為了發現目標規格其實缺貨而被迫回滾，你就會理解這個問題有多煩人。更糟的是，Hetzner Console UI 會用視覺上「可選」的樣子欺騙你——CAX41 的 row 看起來完全可以點擊，直到你真的點了它，才會彈出「Not available. Please choose another location or type.」的提示。如果你在 shutdown 伺服器之後才發現這一點，那就為時已晚了。

## 問題的根源：UI 和實際可用性不同步

Hetzner Console 的 Rescale 頁面上，伺服器類型的行通常看不出是否真的缺貨。沒有灰化、沒有 disabled 屬性，沒有任何明顯的視覺警告。開發人員和運維人員很容易假設如果某個類型在列表裡，那就表示可以升級到它。但事實並非如此——容量檢查發生在你真正點擊的時候，或者更準確地說，發生在 API 層。

這意味著如果你遵循「停機→驗證→升級」的傳統工作流程，而在停機後才發現規格不可用，你會陷入尷尬的境地：伺服器已經關掉了，但你無法完成升級。現在你得決定是否要在舊規格上重新啟動，或者嘗試其他的替代方案。無論哪種方式，維護視窗都被浪費了。

## 解決方案：三重驗證

解決這個問題的方法很簡單，但很重要：**在你停機之前，必須進行三個獨立的驗證檢查**，確認目標規格確實可用。只有當這三個檢查全部通過時，你才能安心地關閉伺服器。

### 第一重：API 的 available_for_migration 列表

Hetzner API 會為每個伺服器的資料中心提供一個可遷移的伺服器類型列表。這是最可靠的單一真實來源：

```bash
curl -sS "https://api.hetzner.cloud/v1/servers/$SERVER_ID" \
  -H "Authorization: Bearer $HETZNER_API_TOKEN" \
  | jq '.server.datacenter.server_types.available_for_migration'
```

這個 API 調用會返回一個伺服器類型 ID 的陣列。如果你要升級到的目標類型 ID 不在這個列表裡，那就是一個明確的信號：該資料中心現在缺貨。你可以透過 `/v1/server_types` 端點查詢伺服器類型 ID 對應表。

### 第二重：Console UI 的實際點擊測試

即使第一重檢查通過了，也要在 Console 中進行手動驗證。打開 rescale 頁面（`https://console.hetzner.cloud/projects/<id>/servers/<id>/rescale`），實際點擊你要升級到的伺服器類型。不要只看樣式或假設它是可點擊的——**真的點一下**。如果目標類型缺貨，Hetzner 會顯示 tooltip 提示「Not available」。

這一步看起來很多餘，但實際上在捕捉 API 列表和實際 UI 之間的不同步情況時很有用。有時候緩存或同步延遲會導致 API 說「可用」但 UI 說「不可用」的情況（或反過來）。

### 第三重：API dry-run 變更類型

最後，也是最關鍵的一步，執行一個不會真正改變任何東西的 API 呼叫，但會告訴你操作是否有效：

```bash
curl -sS -X POST "https://api.hetzner.cloud/v1/servers/$SERVER_ID/actions/change_type" \
  -H "Authorization: Bearer $HETZNER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"upgrade_disk":true,"server_type":"<target>"}'
```

注意：如果伺服器仍在執行中，這個呼叫會因為需要先關機而失敗，但這是個不同的錯誤。你真正關心的是「資源不可用」錯誤——也就是 `"code":"resource_unavailable"` 回應。如果你看到這個錯誤，那就意味著該規格在該時刻確實無法使用，無論 API 列表或 Console 說什麼。

## 實戰例子

以下是一個完整的 shell 函式，整合了這三重驗證的邏輯：

```bash
hetzner_can_rescale_to() {
  local server_id=$1
  local target_type=$2

  # 1. 取得目標類型的 ID
  local target_id=$(curl -sS "https://api.hetzner.cloud/v1/server_types?per_page=50" \
    -H "Authorization: Bearer $HETZNER_API_TOKEN" \
    | jq -r ".server_types[] | select(.name==\"$target_type\") | .id")

  # 2. 驗證第一重：檢查 available_for_migration 列表
  local in_list=$(curl -sS "https://api.hetzner.cloud/v1/servers/$server_id" \
    -H "Authorization: Bearer $HETZNER_API_TOKEN" \
    | jq ".server.datacenter.server_types.available_for_migration | index($target_id)")

  if [ "$in_list" = "null" ]; then
    echo "FAIL: $target_type (id=$target_id) not in available_for_migration"
    return 1
  fi

  # 3. 驗證第三重：dry-run API 呼叫
  # （伺服器可以是 running 或 stopped，但 running 時會因為需要先停機而失敗
  #  我們只關心是否會因為缺貨而被拒絕）
  local response=$(curl -sS -X POST "https://api.hetzner.cloud/v1/servers/$server_id/actions/change_type" \
    -H "Authorization: Bearer $HETZNER_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"upgrade_disk\":true,\"server_type\":\"$target_type\"}")

  if echo "$response" | grep -q "resource_unavailable"; then
    echo "FAIL: API rejected with resource_unavailable"
    return 1
  fi

  echo "PASS: $target_type rescale should work"
  return 0
}

# 使用範例
hetzner_can_rescale_to 118875147 cax41 || {
  echo "中止維護視窗 — 目標類型不可用"
  exit 1
}
```

執行這個函式後，如果它返回成功狀態，你可以放心地關閉伺服器並開始 rescale 操作。

## 何時應該使用

- **所有 Hetzner Cloud rescale 操作前**（這不是可選的，應該是必做項）
- **特別重要**：當升級 CAX 系列或 CCX dedicated 系列時。這些類型比 CPX 或 CX 系列的容量更緊，缺貨的頻率更高
- **維護視窗規劃時**：把這個驗證當作一個硬性檢查點。如果驗證失敗，整個維護視窗計畫必須調整

## 常見的陷阱

**第一個陷阱：只看 Console 樣式**。CAX41 的行在 rescale 頁面上永遠都會顯示，不管它缺不缺貨。你必須實際點擊它，或者執行 API 呼叫，才能看出真實的故事。信任 UI 樣式是最容易犯的錯誤。

**第二個陷阱：依賴過時的知識**。Hetzner 的容量狀況變化很快。如果你在上個月驗證過「CAX41 在法蘭克福可用」，這個月時可能已經不是這樣了。每次 rescale 前都要重新驗證——不要假設上次的結果仍然有效。

**第三個陷阱：跳過 dry-run API 呼叫**。如果你只做了前兩個檢查而跳過了 API dry-run，你可能會遇到 API 列表和實際 API 操作之間的不同步情況。雖然這種情況不常見，但一旦發生，你已經停機了，為時已晚。

**第四個陷阱：忘記架構限制**。Hetzner 不允許在 ARM 和 x86 架構之間進行 rescale。如果你嘗試跨架構升級，dry-run API 呼叫會回傳 `invalid_server_type` 錯誤（而不是 `resource_unavailable`）。你需要能夠區分這兩種錯誤類型。

## 替代方案

如果在驗證後發現目標規格確實不可用，但你的應用需要更多容量，還有其他選項。例如，你可以考慮使用臨時伺服器搭配磁碟區遷移來規避 rescale 的限制——這在處理重型資料庫操作時特別有用，但這是另一個故事了。
