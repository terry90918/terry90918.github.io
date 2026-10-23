# 全站 shadcn/ui 遷移

使用者選擇整站採用 shadcn/ui 標準風格，涵蓋首頁、關於、故事、作品、文章及中英文 CV。保留 Satoshi 字體、內容、路由、影音無下載入口、主題切換及 3D 名片。

## Approach

保留原設計只替換底層與整站改為標準風格兩案中，使用者選擇後者。採用官方 new-york 與使用者後續指定的 Anthropic 色票、Radix 基礎元件，components/ui 為唯一共享元件來源。2026-10-23 官網實測米白 #faf9f5、深炭 #141413、陶土橘 #d97757；深色映射與可讀連結色由本地語意主題提供。globals.css 為色票的來源；DESIGN.md 記錄變更。避免改寫內容及資料載入。

## Scope

Button、Card、Badge、Collapsible、Accordion、Slider，並遷移既有互動與卡片呼叫處。保留語意導覽連結與原生影音播放器；Markdown 文章正文維持 prose。手機目錄選取後收合並聚焦標題；無訊息時不顯示狀態區。CV 技能區保留首項展開及多項展開能力。

## Acceptance

全站使用 Anthropic 明暗色票；共用元件可由 CLI 維護。lint、typecheck、單元測試、build 通過；桌面與手機逐類頁面無溢出，導覽、主題、目錄、播放與中英文切換可操作。僅本機預覽，尚不發布。
