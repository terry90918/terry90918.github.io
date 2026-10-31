---
title: 'OpenAI 調高 Pro 的 Work 與 Codex 額度，Chat 和 dots 要分開看'
excerpt: 'OpenAI 10 月 29 日調整 Pro 的 Work 與 Codex 額度。本文整理三種方案的差異、Chat 每週限制，以及 dots 對話與派工的計量邊界。'
slug: openai-pro-work-codex-limits-dots-2026-10-31
status: 'published'
publishedAt: '2026-10-31T13:49:00+08:00'
tags: [OpenAI, ChatGPT, Codex, AI代理]
presentation:
  type: feature
  category: AI 產業
  audio:
    src: /audio/2026/openai-pro-work-codex-limits-dots-2026-10-31-notebooklm.mp3
    duration: 784.370068
  video:
    src: /videos/2026/openai-pro-work-codex-limits-dots-2026-10-31-notebooklm.mp4
    poster: /videos/2026/openai-pro-work-codex-limits-dots-2026-10-31-notebooklm.jpg
    title: '揭開 OpenAI Pro 額度更新神秘面紗'
---

OpenAI 調高部分 Pro 方案的工作額度，也取消先前對 Pro 200 的降額安排。不過，「額度翻倍」需要看原本的方案與額度；Chat 的訊息限制，以及 dots 啟動任務後的用量，也各有規則。

本文發布於 2026 年 10 月 31 日，整理的是官方 10 月 29 日公告及目前說明文件。先把三件事分開：方案包含多少工作額度、Chat 能傳多少訊息，以及從 dot 派出去的工作如何計量。

## 三種 Pro 方案，改動並不完全相同

[OpenAI 的 10 月 29 日更新紀錄](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)確認，Pro 100 與 Pro 500 的 Work、Codex 額度，都提高至原本的兩倍。

Pro 200 則涉及不同訂閱者原有額度的差異。OpenAI 取消了 9 月 29 日電子郵件宣布的降額安排：原本享有較高 Work、Codex 額度的人維持原額度；原本較低的人，從 10 月 29 日起翻倍，與較高額度拉齊。

所以，不能把這次更新概括成「所有 Pro 使用者都再多一倍」。對原本就在較高額度的 Pro 200 訂閱者而言，重點是保留既有額度，而非在高額度之上再翻倍。

同一則公告也提到 Business Premium，但本文聚焦個人 Pro 方案，不把 Pro 的倍數直接套用到企業方案。

## Chat 的每週訊息限制，要另外確認

Work、Codex 的工作額度增加，不代表 Chat 裡每個模型的訊息限制都一起增加。

依目前的 [Pro 方案說明](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers)，Pro 100 與 Pro 500 在 Chat 中的 GPT-6 Pro 每週訊息上限維持不變。Pro 200 原本較低的每週上限則調整至較高水準；已經享有較高上限的人維持原狀。這項限制與 Work、Codex 額度分開計算。

現有訂閱會自動套用更新，不必等下一次續約，也不用先取消再重新訂閱。Plus 的用量沒有跟著這次調整。

閱讀方案消息時，最好先對照產品名稱。「Pro」可能指訂閱方案，也可能出現在模型名稱裡；只看到一個「翻倍」，還不足以知道自己常用的功能是否改變。

## dots 延長額度安排，但派出去的任務仍有用量

dots 的消息容易與方案增額混在一起。

Tibo 在 [X 貼文](https://x.com/thsottiaux/status/2115850175868727621)表示，dots 的延長安排目前繼續，並與預設額度分開。貼文時間是 10 月 29 日 16:56 UTC，換成台灣時間已是 10 月 30 日凌晨 00:56。這是暫時延長的表述，不能改寫成永久免計量。

更直接影響使用方式的是 [dots 官方文件](https://learn.chatgpt.com/docs/dots)：與 dot 對話不計入 ChatGPT 用量限制，但 dot 在 Work 或 Codex 啟動、管理的任務，仍照常計入各產品的用量限制。

舉例來說，和 dot 討論一項工作的目標，與它接著啟動 Codex 修改程式，是需要分開理解的兩段流程。使用者看到的是同一個助手，背後的工作卻可能進入不同產品的計量範圍。不能因為入口是 dot，就把整段流程都當成不扣額度。

## 額度兩倍，無法直接換算成兩倍任務

[官方 Pricing 文件](https://learn.chatgpt.com/docs/pricing)說明，用量會受到模型、任務規模、上下文、推理、工具操作、檢索與快取等因素影響。長時間處理大型專案，與修改一個小函式，即使都只由一句指令開始，消耗也可能相差很大；速度設定同樣會影響計量。

因此，不適合把這次更新換算成固定幾次研究、幾份簡報或幾個程式任務。比較前後差異時，也要留意工作內容和設定是否相近。

比較有用的觀察是：自己常做的工作是否仍容易碰到上限、哪些步驟消耗較多，以及目前的重設時間。官方提供的用量頁面，比單看提示詞長短更適合回答這些問題。

## 現有使用者，可以先看自己卡在哪一段

對既有訂閱者，這次消息的實際意義取決於工作方式。

經常讓 Work 或 Codex 執行長任務的人，值得確認更新後的工作額度；主要在 Chat 使用 GPT-6 Pro 的人，則應看每週訊息上限那一項，不能只看 Work 增額。透過 dots 分派工作的使用者，還需要分辨對話與後續任務。

這些規則也提醒了一件事：使用體驗愈來愈像一個連續的助手，計量卻未必只有一套。先確認工作在哪裡執行、受哪個上限約束，才能知道這次調整究竟解決了自己的哪個問題。

本文依 2026 年 10 月 31 日可讀取的官方文件整理；後續額度與延長安排若有變動，仍應回到官方說明及帳戶顯示確認。
