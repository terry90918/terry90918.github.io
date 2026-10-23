# shadcn/ui migration implementation plan

Goal: 全站共用 shadcn/ui 元件並採用 Anthropic 標準風格。
Architecture: components/ui 提供共享 primitives；保留 editorial 與 feature 閱讀幾何。globals.css 提供唯一主題色票。
Tech stack: Next.js 16、React 19、Tailwind 4、shadcn/ui Radix。
Spec: docs/superpowers/specs/2026-10-23-shadcn-migration-design.md

## Constraints

不改內容與路由，不提供媒體下載，不寫程式註解。僅更新本機預覽。

## Review focus

手機選單及目錄的收合與焦點；播放進度鍵盤操作；主題持續性；CV 語言切換保留位置；窄螢幕長字串不溢出。

## Tasks

- [x] 安裝官方 Button/Card/Badge/Collapsible/Accordion/Slider，設定 components.json 與 cn。
- [x] 遷移共用按鈕、卡片與標籤，移除 CV 重複 Card/cn。
- [x] 遷移手機選單、文章目錄、音訊 Slider 與 CV 技能 Accordion，更新互動測試。
- [x] 將 globals.css 與 DESIGN.md 改為 Anthropic 明暗色票，移除衝突的舊元件樣式。
- [x] 執行 lint、test、typecheck、build 與 Premium audit；瀏覽器檢查各頁及互動，更新 3224 本機預覽。

## Verification record

- Tests first: the shared-button/Slider and Collapsible acceptance tests failed on the old implementation, then passed after migration. Existing bilingual CV tests now assert 31 Accordion items and one default-open item, preserving all tool content.
- Full lint and 122 tests in 18 files pass. Production static build and TypeScript pass. Browser readback covered 16 routes at 1440px and 320px without horizontal overflow. Mobile menu Escape returns focus, article selection collapses and focuses h2, audio plays and keyboard seek advances, and CV permits multiple open skill groups with locale switching.
- One independent review found low-contrast legacy accent consumers and vertical contact cards. Both were fixed; browser readback confirmed readable link colors and horizontal contact rows.
- Premium strict audit reports three false positives on Button asChild navigation CTAs; live DOM confirms actual anchors with /about, mailto and /posts/ai-daily destinations. No inert buttons were introduced. Report: /tmp/shadcn-audit-final.json.
- The user changed Neutral to Anthropic during verification. The official site's observed CSS tokens were mapped to the existing theme. Link tones and dark mapping are application choices recorded in DESIGN.md. Native media and 3D visuals remain specialized components.
- The user approved release after local verification; PR, review, exact-head CI, merge, push CI, Pages and public per-page readback remain required.

## Typeset follow-up

User approved all article bodies and both CV locales, with old typography removed. Installed official stylesheet unchanged; both HTML roots load Geist/Geist Mono variables; docs preset remains 15px/1.75/1.25em. Removed typography plugin, prose classes/rules and decorated MDX components. Heading IDs, scroll offsets, syntax highlighting and image functionality remain. A real 320px browser check found wide-table overflow; a failing test preceded adding keyboard-accessible typeset-scroll regions to Markdown and localized MDX tables.
