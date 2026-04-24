---
title: 'ECC Homunculus Repo 改名與分割策略'
publishedAt: '2026-04-09T17:07:00+08:00'
status: 'draft'
slug: 'homunculus-repo-rename-split'
tags:
  - claude-code-tools
  - claude-code
  - ecc
  - homunculus
---

當你在 GitHub 上重新命名一個 repo 時，可能會遇到一個有趣但令人困擾的問題——如果你使用 ECC（Everything Claude Code）的 Homunculus 專案追蹤系統，舊的 observations 會突然「消失」，因為系統產生了一個全新的 project hash。

## 問題：Rename 導致的 Project Hash 分裂

ECC Homunculus 系統使用 `git remote get-url origin` 的 hash 值作為 project ID。這個設計在大多數情況下都運作良好，但當你在 GitHub 上重新命名一個 repo 時，remote URL 就會改變。

以 continuous-learning-v2 為例：當 repo 從 `blog.git` 重新命名為 `terry90918.me.git` 時，系統就會計算出一個不同的 hash 值，並為這個「新」project 創建一個全新的目錄。這意味著你在舊 hash 目錄中累積的所有 observations（系統觀察記錄）都無法被新的 observer 讀取，因為它們現在位於兩個不同的 project 目錄中。

## 解決方案：手動合併 Observations

幸運的是，這個問題有一個相對直接的解決辦法：手動將舊 hash 目錄中的 observations 合併到新 hash 目錄。

首先，你需要找出舊 hash 和新 hash 分別是什麼。執行以下命令查詢你的 Homunculus projects 設定：

```bash
cat ~/.claude/homunculus/projects.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
for k, v in d.items():
    if 'blog' in v.get('root', '') or 'terry90918.me' in v.get('remote', ''):
        print(k, v.get('name'), v.get('remote'))
"
```

這會列出與你的部落格相關的所有 project，包括它們的 hash 和 remote URL。

確認了舊 hash（例如 `d36ad01cb078`）和新 hash（例如 `bef97bc13b5f`）之後，執行以下命令合併 observations：

```bash
OLD_HASH="d36ad01cb078"
NEW_HASH="bef97bc13b5f"
BASE="$HOME/.claude/homunculus/projects"

# 將舊 observations 附加到新檔案
cat "$BASE/$OLD_HASH/observations.jsonl" >> "$BASE/$NEW_HASH/observations.jsonl"

# 封存舊檔案以供記錄
mv "$BASE/$OLD_HASH/observations.jsonl" \
   "$BASE/$OLD_HASH/observations.archive/merged-to-$NEW_HASH.jsonl"
```

這個過程分為三個步驟：首先，我們將舊 hash 目錄中的所有 observations 附加到新 hash 目錄；其次，我們將原始舊檔案移到一個 archive 子目錄，並用新 hash 作為檔案名後綴，以便記錄這次合併。

## 何時使用這個方法

這個解決方案適用於幾種情況：

**GitHub repo 重新命名**是最明顯的案例——當你改變 repo 在 GitHub 上的名稱時，remote URL 會自動更新，觸發 project hash 的變化。

**本機 repo 搬移路徑**也會導致類似的問題，特別是當根路徑改變時（雖然 remote 本身沒有變化），系統有時仍可能計算出不同的 hash。

**跨機器同步 observations** 是另一個實用的場景——如果你在不同的機器上 clone 同一個 repo，並希望將兩台機器的 observations 合併到一個統一的索引中，這個方法也同樣適用。

## 最佳實踐建議

完成合併後，定期檢查你的 `~/.claude/homunculus/projects.json` 確保沒有遺留重複的 project 項目。如果舊 project 已經不再被使用，你可以考慮從設定中完全移除它，以保持系統的整潔。

這個問題雖然乍看複雜，但本質上反映了 Homunculus 系統設計的權衡——使用 remote URL hash 作為 project ID 提供了簡潔性，代價則是在 repo metadata 改變時需要手動干預。隨著你對系統的熟悉，這類維護工作會變成日常工作流的一部分。
