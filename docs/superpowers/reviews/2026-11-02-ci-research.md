# CI 品質研究與本站對齊評估

研究日期：2026-11-02。範圍為 CI；約三分鐘的 Pages 建置與部署維持現況。本文件包含研究與第一階段實作紀錄。

## 好的 CI 判準

1. 快速提供可信的失敗訊號。DORA 建議提交後幾分鐘內得到測試回饋，約十分鐘是其研究提出的上限參考；不是所有專案的硬性標準。慢測試應改善效率、配置資源或分階段執行，不能靠刪除有效斷言取得綠燈。[DORA CI](https://dora.dev/capabilities/continuous-integration/)、[Test automation](https://dora.dev/capabilities/test-automation/)。
2. 測試失敗應能指向實際問題。瀏覽器測試驗證使用者可見行為；各測試需隔離，不依賴外部第三方服務。靜態資料正確性不一定需要啟動瀏覽器。[Playwright best practices](https://playwright.dev/docs/best-practices)。
3. 測試與交付產物可追溯。DORA 建議 CI 產生可重複、具權威性的建置產物供後續階段使用。GitHub artifacts 支援跨 job 傳遞產物及 digest 驗證；跨 Woodpecker／GitHub 傳遞仍需設計來源、權限和 SHA 綁定，不能把不同提交的結果混用。[DORA CI](https://dora.dev/capabilities/continuous-integration/)、[GitHub artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data)。
4. 平行數依資源和穩定性決定。Playwright 官方 CI 預設建議一個 worker；有足夠自架資源才增加或分片。因此目前 workers=1 不是單獨可判定的錯誤。[Playwright CI](https://playwright.dev/docs/ci)。
5. 減少環境準備成本但保持版本一致。官方 Docker image 已提供瀏覽器和系統依賴，映像需與專案 Playwright 版本相符。官方不建議把瀏覽器 binary 快取當預設解法，還原成本可能接近下載成本，Linux 系統依賴也無法由該快取解決。[Playwright Docker](https://playwright.dev/docs/docker)、[CI browser caching](https://playwright.dev/docs/ci#caching-browsers)。

## 本站已觀察證據

- Woodpecker #429：總耗時 987 秒；排隊 2 秒，clone 71 秒，validate 911 秒。
- 同次 validate 的 E2E：39 passed，11.4 分鐘；單元測試 24.78 秒，整合測試 9.02 秒。時間瓶頸主要是瀏覽器流程，不是這兩組測試。
- `.woodpecker/` 每次由 node slim 環境安裝 Bun、套件、Chromium 與系統依賴，再執行完整 verify。
- `scripts/verify.mjs` 串行執行格式、lint、型別、單元、整合、E2E、build。
- `playwright.config.ts` 使用 `bun dev --webpack`，workers=1，39 個測試中還包含多頁、多視寬、多語系和主題迴圈；39 不是實際導航次數。
- pre-commit 執行完整 verify；人工先跑一次再 commit 會重複。PR CI 與 main CI 也執行完整流程，但 main 可能是另一個合併提交，不能直接當作相同輸入。
- Pages run 41433884930：等 Woodpecker 約 16 分 25 秒；後續 checkout、安裝、建置、上傳與部署約三分鐘。等待和 Woodpecker 同時發生，不應加總兩次。

## 可精簡項目與保留項目

| 項目                                                       | 判斷               | 對齊方式與驗收條件                                                                                                                              |
| ---------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 人工完整 verify 後立即讓 hook 再跑相同流程                 | 可移除重複人工執行 | 正常 hook 成為提交的本機驗證證據，不繞過 hook                                                                                                   |
| 每個 commit 的 pre-commit 都跑整站 E2E/build               | 候選精簡           | 可改為快速靜態／邏輯檢查，完整發布檢查留給 CI；須同步修改 AGENTS 與驗證契約，不能只停用 hook                                                    |
| 每次安裝 Bun、瀏覽器與 OS 依賴                             | 可合併環境準備     | 評估版本固定且匹配 lockfile 的預製環境；實測冷啟動、映像拉取及暖啟動後再選擇                                                                    |
| E2E 用開發伺服器臨時編譯頁面                               | 優先改善           | 評估先 build 一次，再針對正式 `out/` 執行測試；靜態伺服器必須支援 clean URL、404、Next 資源及媒體 Range。這是本站建議，不是 Playwright 強制規則 |
| 純文字、連結集合、canonical/RSS/sitemap 資料斷言           | 可移到較快層級     | 逐項對照既有 unit/integration；若同一風險已有覆蓋，移除瀏覽器重複斷言；實際入口導航仍保留                                                       |
| 手機選單、鍵盤焦點、主題切換、跨頁錨點、圖片載入、語系切換 | 保留瀏覽器檢查     | 這些涉及真實 DOM、hydration、CSS、網路和瀏覽器行為，不能只靠字串測試取代                                                                        |
| 同類寬度／主題／頁面的完整交叉矩陣                         | 候選收斂           | 保留代表性手機與桌面和必要邊界；擴充矩陣是否移到定期／相關變更檢查，須先列出各案例獨有風險，不按測試數量盲刪                                    |
| workers=1                                                  | 先保留             | 先去除開發時編譯和冗餘導航，再用相同 suite 比較 1／2 workers 的時間、資源與失敗率                                                               |
| PR 與 main 的整合驗證                                      | 先保留             | PR 與 squash/main SHA 不同。未有合併結果驗證或可靠相同產物證據前，不因 PR 綠燈就移除 main gate                                                  |
| Pages 三分鐘流程                                           | 本輪保留           | 可接受，且跨 CI 共用產物需要額外權限與信任設計；不是本次首要效益                                                                                |
| 任意變更只跑受影響測試、不留完整檢查                       | 不採用             | Playwright 官方將 only-changed 視為 heuristic，可能漏測；不能直接取代完整必要覆蓋                                                               |
| Chromium 安裝                                              | 保留一種           | 目前已只安裝 Chromium；沒有多裝 Firefox/WebKit 可砍                                                                                             |

## 具體測試整理候選

- `frontend-blog.spec.ts` 的導覽 href、footer 連結文字、文章完整 URL 清單、canonical/RSS/sitemap 靜態內容，對照 `site-contract.test.tsx`、`post-queries`、`writing-index`、`rss-feed`、`site-content` 等測試。先建覆蓋對照，再決定移動或刪除；目前僅確認有潛在交集，尚未宣稱全部重複。
- `frontend-cv.spec.ts` 的所有 route 與 metadata HTTP 檢查，評估在 build 完成後以快速產物檢查一次掃描；CV 語系切換和 sticky navigation 仍留 E2E。
- `frontend-performance.spec.ts` 的資源不應預載、portrait 預留比例、responsive image 實際選擇等保留瀏覽器測試；不能因為名稱含 performance 就視為不必要。
- 錨點測試在 #423 曾出現 toHaveURL 15 秒逾時，其後 #424、#425、#427、#429 通過。這是待診斷的穩定性訊號，不能據單次逾時刪除該測試或一律提高 timeout。

## 建議實作順序

第一階段先改善執行方式，保留原斷言：建置正式產物後測試、固定可重現的 CI 環境、分開記錄安裝與各測試階段耗時。確認 404、草稿不可見、導覽、語系、錨點、圖片及影音仍可驗證。

第二階段才精簡：建立測試到風險的對照，把純靜態斷言移到 unit/integration 或輸出產物檢查，刪除已被等效覆蓋的重複案例；調整 pre-commit 為快速檢查，保留 CI 的發布 gate。同步更新 repo 指引與測試流程契約。

第三階段依量測決定是否增加 worker、收斂擴充矩陣。部署流程本輪不改。

驗收要比較同樣內容與資源條件下的前後結果，分開報告排隊、clone、安裝、快檢、build、E2E、CI 總時間和失敗原因。以快檢幾分鐘、必要完整 CI 約十分鐘內作設計目標，不先承諾達成；冷／暖各測，任何覆蓋縮減都需有替代證據。沒有實際遠端執行不得宣稱加速完成。

## 第一階段實作與本機結果

- E2E 使用受 Playwright 管理的 loopback 靜態伺服器測試本次 build 的 out；保留全部 39 項 E2E 和原有互動斷言，圖表先捲入畫面並等平滑捲動穩定再 hover。
- 完整 verify 改為快速檢查、一次正式 build、E2E；新增各階段秒數。pre-commit 只執行 verify:quick，CI 保留完整 verify。
- Woodpecker 使用與現有 lockfile 一致的 Playwright 1.59.1 官方映像，移除逐次安裝 Chromium／系統依賴；鎖定測試套件版本，沒有升級瀏覽器套件。
- 靜態伺服器新增四項 HTTP 整合測試：clean URL 與 RSC 同名目錄、真實 404、RSS XML MIME、媒體 Range 與 HEAD。首次紅燈確認缺少伺服器及 XML MIME，修正後通過。
- 首次完整執行：格式 5.2 秒、lint 4.7 秒、型別 4.0 秒、單元 13.1 秒、整合 5.3 秒、build 80.3 秒。首次 E2E 37/39，失敗是 XML MIME 與圖表 tooltip；修正後完整 E2E 39/39，36.5 秒。這是本機數據，不能與遠端 11.4 分鐘直接當作同條件加速比。
- 既有 Pages workflow 沒有修改。遠端 PR 與 main 的完整驗證仍保留。尚待遠端實跑量測，未宣稱遠端優化完成。

## 修正與遠端初測

Woodpecker #430 與基線 #429 使用同一 agent。#430 為新映像第一次冷啟動，總時間 498 秒，其中 clone 72 秒、validate 419 秒；E2E 約 1.4 分鐘，38/39 通過。這個失敗執行只能當診斷數據，不能當完成證據。

Tooltip 問題已在本機五次重跑中重現兩次。Trace 顯示 hover 落點先被 sticky header 遮擋，隨後落在 y=896；平滑捲動結束後圖表移至畫面中段，滑鼠已不在觸發點上。修正為先將觸發點捲入畫面、等待既有 scroll-settle 條件，再 hover，不提高 timeout、不重試斷言、不刪測試。修正後五次均通過；完整 39 項再跑通過，38.2 秒。

審查發現根目錄的衍生 HTML 候選可能讀到 export 之外的同名檔，以及缺少 404.html 時未能顯示 build-first 提示。新增兩個重現測試，確認紅燈後修正；HTTP 伺服器測試共六項通過。

後續 #431 仍在同一 tooltip 斷言失敗（總時間 416 秒），證明只等頁面垂直捲動穩定並不足夠。以相同版本 Playwright 的 Linux Docker 環境重現後，發現鍵盤 End 操作留下橫向捲動位置；切換到每週模式再自動定位第一個點時，scrollLeft 為 2，tooltip 的 state 已 delayed-open，但浮層父節點因參考點裁切而 visibility:hidden。這不是提高 timeout 可以解決的問題。

最終測試準備改為將觸發點立即置中並將圖表橫向回到最左，再等既有 scroll-settle 條件。仍測試原本 hover、focus、鍵盤移動與邊界行為，沒有修改產品 tooltip 或放寬斷言。Linux 連續五次通過，44.6 秒；完整 39 項也全部通過，48.3 秒。臨時診斷碼已移除，重現用的臨時容器與依賴 volume 已清理。
