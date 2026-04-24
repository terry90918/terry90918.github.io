---
title: 'macOS sed 與跨平台 Shell 腳本 Fallback'
publishedAt: '2026-04-05T14:45:00+08:00'
status: 'published'
slug: 'macos-sed-python-fallback'
tags:
  - debugging-diagnostics
  - macos
  - shell
  - cross-platform
  - sed
---

有時候，一個看似簡單的文字處理任務，在 macOS 上卻會變得格外棘手。這個故事要從一場 TypeScript 檔案清理開始說起。

## 問題的症狀

當你在 macOS 上執行這些 `sed` 命令時，一切看起來都很正常——命令執行完畢，沒有任何錯誤訊息。但當你打開檔案一看，才發現什麼都沒有改變：

```bash
sed -i '' '/resume:/d' tests/unit/embed.test.ts
sed -i '' '/^\s*resume/d' embed.impl.test.ts
```

看似成功的執行，卻沒有刪除任何行。這不是偶發現象，而是在特定情況下的可靠重現：

- TypeScript 的可選屬性（`resume?: boolean`、`resume: true`）
- 使用 tab 縮排加上複合修飾符的行
- 行尾帶有 `;` 或 `,` 的情況

## 根本原因：BSD sed 的怪癖

這不是 bug，而是一個跨平台相容性問題。macOS 搭載的是 BSD 版本的 `sed`，而非 GNU 版本。兩者的正則表達式語意存在微妙但致命的差異。特別是在處理字元類別和 optional 修飾符時，BSD sed 的行為與 GNU sed 並不一致。當 pattern 涉及 TypeScript 特有的語法（如泛型、decorator、可選屬性符號）時，這個差異就會導致靜默失敗。

## 可靠的解決方案：Python re.sub()

與其與 sed 的行為糾纏不清，不如轉向更可靠的工具——Python。其 `re` 模組提供了標準化且可預測的正則表達式引擎：

```bash
python3 -c "
import re
text = open('path/to/file.ts').read()
text = re.sub(r'[^\n]*resume[^\n]*\n', '', text, flags=re.MULTILINE)
open('path/to/file.ts', 'w').write(text)
print('Done')
"
```

這個方法會移除所有包含 `resume` 的行，並且在 macOS、Linux 和其他 Unix 系統上行為完全一致。

如果任務更複雜——比如需要同時移除 TypeScript interface 欄位及其前置的廢棄注解（`@deprecated` JSDoc）——可以這樣做：

```bash
python3 -c "
import re
text = open('file.ts').read()
# 先移除 @deprecated JSDoc 註解以及下一行內容
text = re.sub(
    r'\n\s*/\*\*[^*]*@deprecated[^*]*\*/\s*\n[^\n]*resume[^\n]*',
    '', text, flags=re.DOTALL
)
# 再清掉任何剩餘的 resume 行
text = re.sub(r'[^\n]*resume[^\n]*\n', '', text, flags=re.MULTILINE)
open('file.ts', 'w').write(text)
print('Done')
"
```

## 其他替代方案

根據你的環境和偏好，還有其他選擇：

```bash
# 安裝 GNU sed 並使用
brew install gnu-sed && gsed -i '/pattern/d' file.ts

# 使用 Perl（通常更可移植）
perl -i -pe 's/^.*resume.*\n//' file.ts
```

但如果修改數量少於 10 處，更明智的做法是直接使用 IDE 或 Claude Code 的 `Edit` 工具進行精確修改。這樣既安全，也能清楚地看到 diff，便於 review。

## 何時應用這個方法

遇到以下情況時，Python 方案特別有用：

- `sed -i ''` 執行成功但檔案未變更
- 需要從 TypeScript interface 或測試 helper 批次移除已廢棄的欄位
- Pattern 包含 TypeScript 特有語法（`?`、泛型、decorator 等）
- 在 macOS 環境上，且未安裝 GNU sed

這個教訓提醒我們，在跨平台指令碼中，依賴於特定 Unix 發行版的工具行為往往會帶來隱藏的陷阱。選擇更高階的、行為標準化的工具（如 Python、Perl），能讓你的指令碼更具韌性和可維護性。
