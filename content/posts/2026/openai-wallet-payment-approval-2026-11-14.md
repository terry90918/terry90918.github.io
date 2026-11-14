---
title: 'ChatGPT Wallet 讓 dot 代為結帳：付款核准之後，還要確認訂單成立'
publishedAt: '2026-11-14T05:00:00+08:00'
status: draft
excerpt: 'ChatGPT Wallet 開始支援 dot 代理結帳。整理首波使用資格、逐筆付款授權，以及付款核准與商家訂單確認的差異。'
tags:
  - OpenAI
presentation:
  type: feature
  category: OpenAI
---

# ChatGPT Wallet 讓 dot 代為結帳：付款核准之後，還要確認訂單成立

作者：Terry Chen。本文為官方資料整理與作者觀察；未進行綁卡或交易測試。

請 AI 找一件毛衣，和請 AI 把毛衣買下來，中間多了金額、付款與訂單責任。OpenAI 在 2026 年 11 月 13 日推出 ChatGPT Wallet，讓符合資格的使用者在 dot 對話中儲存信用卡，再逐筆檢查並核准購買。首波與 American Express、Mastercard、Visa 合作，採逐步開放。[官方公告](https://openai.com/index/introducing-chatgpt-wallet)

這次更新把代理購物推進到付款環節，也讓「我同意付款」和「商家已接受訂單」的差別更值得注意。本文依官方公開資料整理，未綁卡、購物或實測任何交易。

## 首波限美國成年 Pro 使用者，台灣尚未開放

Wallet 目前限居住美國、年滿 18 歲的 ChatGPT Pro 使用者，須有美國帳單地址與合資格的美國發行信用卡，並先設定 dot。功能位於 dot 對話，Chat、Work 與獨立 Codex 聊天都不能使用。即使符合條件，帳號也可能還沒收到逐步開放的功能。[官方資格與可用入口](https://help.openai.com/en/articles/20001654-making-purchases-with-chatgpt-wallet)

官方列出的支援範圍包含合資格的 American Express、Chase、Mastercard 與 Visa 卡。Chase 卡必須由主卡持有人新增，附卡持有人不適用；銀行也可能要求額外驗證。上線時不支援金融卡與使用者自行新增的虛擬卡。這不影響 Wallet 在結帳時產生替代付款卡號，兩者是不同階段。[信用卡限制與常見問題](https://help.openai.com/en/articles/20001654-making-purchases-with-chatgpt-wallet)

對台灣讀者而言，目前可以觀察這套付款流程，不能因為已訂閱 Pro 就推論自己能使用。官方尚未在這份公告提供台灣開放日期。

## 儲存卡片、核准購買、商家接單，是三個階段

新增卡片時，使用者應在安全的卡片表單輸入卡號、到期日與安全碼，完成銀行要求的驗證。這些資料不應貼進聊天。Wallet 儲存的卡片，也與支付 ChatGPT 訂閱的付款方式分開。[綁卡與銀行驗證流程](https://help.openai.com/en/articles/20001654-making-purchases-with-chatgpt-wallet)

真正購買時，dot 會提出付款要求。使用者須檢查商家、品項、總額、選定卡片，以及畫面上的配送或定期付款條件，再以 Face ID、Touch ID 等支援的生物辨識方式核准。當前裝置不能核准時，可以透過連結或 QR code，改用登入同一 ChatGPT 帳號的支援裝置。[逐筆購買核准](https://help.openai.com/en/articles/20001654-making-purchases-with-chatgpt-wallet)

核准之後，dot 才會繼續結帳。官方特別提醒，畫面顯示「Ready to check out」只代表核准完成，不能證明商家已建立訂單。如果結果不明，應先找商家的確認信、收據或訂單狀態，再決定下一步，避免立即重買。[結帳結果與重試注意事項](https://help.openai.com/en/articles/20001654-making-purchases-with-chatgpt-wallet)

以訂旅館為例，這代表檢查不能停在付款提示消失：還需要知道訂房是否成立、日期與金額是否正確，以及取消條件。這是本文用來說明流程的例子，並非實際訂房測試。

## 代理拿到付款代碼，實際扣款仍連到原信用卡

OpenAI 說明，核准後付款網路會提供 payment token，也就是替代實際卡片資料的付款憑證，包含用於結帳的卡號、安全碼與到期日。款項仍向使用者選定的信用卡收取，代理與商家不會取得使用者的實際卡片資料。原卡的回饋與符合條件的爭議保障仍保留。[付款代碼與信用卡關係](https://openai.com/index/introducing-chatgpt-wallet)

因此，收據或結帳頁出現不同於實體卡的卡號，不一定是選錯卡；應連同 Wallet 核准紀錄與商家訂單一起核對。不過，付款代碼不能保證所有網站都能結帳。商家網站或風控系統仍可能拒絕代理交易。[卡號差異與商家相容性](https://help.openai.com/en/articles/20001654-making-purchases-with-chatgpt-wallet)

也要留意定期付款。如果核准的是持續或定期扣款方案，商家可能依同意的條件保存付款憑證並再次收款。移除 Wallet 卡片不會取消既有訂單或定期扣款，相關取消仍須向商家處理。[定期付款與移除卡片的效果](https://help.openai.com/en/articles/20001654-making-purchases-with-chatgpt-wallet)

## 商家仍負責履約，網站也需要辨認合法代理交易

消費者仍直接與商家交易，價格、出貨、退貨與客服由商家掌握。官方的求助分工是：訂單、取消與退款找商家；拒付、待處理或不明扣款、銀行驗證問題找發卡機構；Wallet 功能錯誤、疑似帳號遭入侵或購買內容不同於核准內容，則找 OpenAI Support。[交易責任與求助管道](https://help.openai.com/en/articles/20001654-making-purchases-with-chatgpt-wallet)

商家端，OpenAI 同時發布 Commerce Partner Playbook，建議維護商品價格與庫存、透過 Web Bot Auth 辨認簽署請求，並與支付及風控供應商確認如何處理合法代理購買。代理透過瀏覽器存取網站，不以商家建立 plugin 或上傳商品資料為必要條件；plugin 與 WebMCP 則是提供更多操作能力的選項。[官方商家支援說明](https://openai.com/index/introducing-chatgpt-wallet)

這延續了 Business Hub 的方向：商家要能提供可靠資訊，代理也要能完成後續操作。但商家代理回答問題，與消費者的 dot 使用 Wallet 結帳，仍是不同角色，不宜把新功能直接套到所有代理入口。

## 更完整的自主購買仍是未來方向

官方公告談到未來可能讓使用者設定金額、品類或期間，提前授權代理購買。這段是產品方向，不能當成今天已普遍提供的功能；目前操作指南仍要求使用者逐筆檢查並核准購買。[現行流程與未來規劃](https://openai.com/index/introducing-chatgpt-wallet)

我的看法是，代理購物的驗收需要一路走到商家確認。找到商品、取得付款核准、完成結帳與收到訂單結果，都有各自的證據。Wallet 讓其中的付款授權更明確，實際能否完成購買，仍取決於資格、裝置、銀行與商家支援。本文不以功能發布推論交易成功率、安全性已獲獨立驗證，或所有商家都能使用。

以上為截至 2026 年 11 月 14 日的官方公開資訊與作者觀察。方案、地區及支援卡片仍可能調整，實際使用前請重新確認官方文件。
