---
title: 'Repo 改名後 Git Worktree 損壞的修復'
publishedAt: '2026-04-04T11:44:00+08:00'
status: 'published'
slug: 'git-worktree-broken-after-repo-rename'
tags:
  - infrastructure-deployment
  - git
  - worktree
  - debugging
---

在使用 Git worktree 進行多分支開發時，如果碰到倉庫搬移或改名的情況，很容易遇到 worktree 失效的問題。我最近在處理 `terry90918/jurislm-coolify-mcp` 改名為 `jurislm/coolify-mcp` 時就遇到了這個狀況，花了點時間才弄清楚根本原因。

## 症狀：Worktree 無法使用

改名後執行 `git worktree list`，會看到 worktree 被標記為 `prunable`（可清理）的狀態。更糟的是，進入 worktree 目錄執行任何 git 命令都會報錯：

```
fatal: not a git repository
```

这個問題很容易讓人困惑——worktree 目錄明明還在，為什麼 git 卻認不出來？

## 根本原因

當你首次建立 worktree 時，Git 會在 worktree 目錄下建立一個 `.git` 文件（不是目錄），這個文件記錄了指向主倉庫的 git metadata 位置：

```
gitdir: /Users/.../OLD-REPO-PATH/.git/worktrees/develop
```

當倉庫路徑改變後（無論是改名還是搬移目錄），这个指向就變成了絕對死路徑。Git 嘗試按照這個舊路徑去尋找 worktree 的 metadata，結果當然找不到，所以把 worktree 標記為 `prunable`。

## 修復方案

根據情況不同，有兩種解決策略。

### 方案 1：簡單修復（路徑仍存在）

如果主倉庫的 `.git/worktrees/develop/` 目錄還存在（只是路徑改變了），修復很簡單——直接更新 `.git` 文件的指向即可：

```bash
echo "gitdir: /new-path/.git/worktrees/develop" > .worktrees/develop/.git
```

把 `/new-path` 替換成你目前主倉庫的實際路徑。完成後驗證一下：

```bash
git -C .worktrees/develop status
```

如果 git 命令能正常執行，說明修復成功了。

### 方案 2：完整重建（路徑已遺失）

如果 `.git/worktrees/` 目錄已經遺失（比如做過 `git gc` 或其他清理操作），就需要完整重建。步驟如下：

**第一步：移除壞掉的 worktree 目錄**

```bash
rm -rf .worktrees/develop
```

**第二步：清除 Git 的過期紀錄**

```bash
git worktree prune
```

這個命令會掃描 Git 目錄，移除指向不存在位置的 worktree 記錄。

**第三步：重新建立 worktree**

```bash
git worktree add .worktrees/develop develop
```

注意這裡的 `develop` 分支必須已經存在。如果分支被刪了，你需要先恢復它，或改用其他現存分支。

## 驗證修復結果

無論用哪個方案，最後都應該驗證一下：

```bash
git worktree list
```

正常的輸出應該是：

```
/path/to/repo/.worktrees/develop    develop  <hash>
/path/to/repo                        main     <hash>
```

沒有任何 `prunable` 標記，所有路徑都正確指向新位置。再試一次在 worktree 內執行 git 命令：

```bash
git -C .worktrees/develop log --oneline
```

能正常輸出提交歷史就表示修復成功。

## 何時會遇到這個問題

- GitHub 上對倉庫改名，本機 clone 路徑也隨之改變
- 把整個開發目錄搬移到另一個位置
- 從共享儲存空間遷移到本機
- 任何導致倉庫絕對路徑改變的操作

建議的做法是，在改名或搬移倉庫前，先用 `git worktree list` 確認有哪些活動的 worktree，改名後立即用方案 1 快速修復。這樣既能保留現有的開發進度，又避免了重建 worktree 的麻煩。
