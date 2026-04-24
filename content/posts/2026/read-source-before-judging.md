---
title: '先讀原始碼再下判斷'
publishedAt: '2026-04-10T22:32:00+08:00'
status: 'draft'
slug: 'read-source-before-judging'
tags:
  - debugging-diagnostics
  - debugging
  - discipline
  - source-code
---

對第三方工具的判斷，我學過一次寶貴的教訓。

最近在使用 ECC continuous-learning-v2 時，我犯了一系列的診斷錯誤。我看著 CLI 輸出的 `Project-scoped: 0`，就開始編故事：「管線肯定是斷的」、「observer 產出的 instinct 缺 id，這明顯是 ECC 的 bug」、「parse_instinct_file 的 id 過濾邏輯格式不一致」、「evolve 壞了」。

每一個判斷，都顯得合理。每一個，都是錯的。

真相是什麼？

- 管線其實設計得很完整，只是我沒走對路
- Haiku 產出的 instinct 確實缺 id，但那不是 ECC 的 bug——是 Haiku 沒有完全遵守 prompt 的要求
- `parse_instinct_file` 中那個看起來像 bug 的 id 過濾邏輯（`if i.get('id')`），實際上是刻意的品質保障機制，用來篩掉不合格的資料
- evolve 沒壞，只是我的 instincts 太少，而且 trigger 條件根本不相關

問題的根源只有一個：**我在沒有讀源碼的情況下，就開始從外部行為往回推測原因。**

## 正確的診斷流程

現在，只要我懷疑某個工具「壞了」，我會停下來做這四件事：

**1. 讀 prompt 或 template**

看工具要求 LLM 產出什麼格式。在 ECC 的例子裡，observer.md 明確寫著 `id: MANDATORY`——這不是可選的建議，是必填欄位。Haiku 沒有遵守，那責任不在 ECC。

**2. 讀 parser 邏輯**

那些看起來可疑的過濾條件，是刻意設計的品質保障還是真的有 bug？翻開 parser 程式碼，我發現 `if i.get('id')` 根本不是 bug——它就是在做品質檢查。沒有 id 的資料被過濾掉，是因為不應該讓它們通過。

**3. 檢查 changelog 或已知問題**

有沒有人已經報告過、或者已經修復過這個問題？ECC 的 watchdog 和 throttle 早就加進去了，但我沒看到，所以誤以為這是未知的缺陷。

**4. 區分「設計問題」和「執行問題」**

Haiku 沒有遵守 prompt ≠ prompt 沒有寫清楚。evolve 的輸出為零 ≠ evolve 這個功能壞掉。執行問題可能有很多原因——資料不足、條件不符、參數設定錯誤——讀源碼才能區分。

## 什麼時候應該這樣做

每當我看到第三方工具的輸出不符合預期，特別是：

- 準備指責「這是 X 的 bug」之前
- 從外部行為推測內部原因的時候
- 感覺邏輯不通但又說不清楚為什麼的時候

停一下，打開源碼。五分鐘的閱讀，勝過一小時的猜測。
