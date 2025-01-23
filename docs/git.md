---
title: git 使用手册
description: 常用git 命令，忘记用法时随手翻阅，适合新手
header: git 使用手册
date: 2025-01-11
---

# git 使用手册

## 1. git init
初始化一个Git仓库

## 2. git add
添加文件到仓库

``` git
    git add .       添加全部  说是只会处理当前目录下的文件，包括子目录 有待验证
    git add -A      --all 添加全部  根目录下的所有修改文件 有待验证
    git add -u      --update 添加修改和删除  即之前已经添加到仓库的文件（不包括新建的文件）
    
    git add -p             # --patch 交互式添加文件的部分内容
    git add -i             # --interactive 交互式选择要添加的文件
```


## 3. git commit
提交文件到仓库

``` git
    git commit -m "注释"
    git commit -a -m "注释"       // git add -a && git commit -m "注释"
    git commit -am "注释"         // git add -a && git commit -m "注释"
    git commit --amend           // 修改最后一次提交
```

## 4. git status
查看仓库当前的状态

## 5. git diff
查看修改内容

## 6. git log
查看提交日志

```git
    git log -p file      // 查看文件的修改历史
    git log --graph   //图形化显示提交历史
    git log --pretty=oneline // 单行显示提交历史
    // 统计指定时间段内的代码行数
    git log --since="2023-01-01" --until="2023-12-31" --pretty=tformat: --numstat | awk '{ add += $1; subs += $2; loc += $1 - $2 } END { printf "added lines: %s, removed lines: %s, total lines: %s\n", add, subs, loc }'
    // 统计指定作者的代码行数
    git log --author="用户名" --pretty=tformat: --numstat | awk '{ add += $1; subs += $2; loc += $1 - $2 } END { printf "added lines: %s, removed lines: %s, total lines: %s\n", add, subs, loc }'    
    git log --oneline | wc -l      // 统计提交次数
    
    git log --oneline
    单行显示提交历史
    
    git log --oneline --graph
    图形化单行显示提交历史
    
    git log --oneline --graph --all
    图形化单行显示所有提交历史
    
    git log --oneline --graph --all --decorate
    图形化单行显示所有提交历史（显示分支）
    
    git log --oneline --graph --all --decorate --simplify-by-decoration
    图形化单行显示所有提交历史（显示分支，简化）
    
    git log --oneline --graph --all --decorate --simplify-by-decoration --date-order
    图形化单行显示所有提交历史（显示分支，简化，按时间排序）
    
    git log --oneline --graph --all --decorate --simplify-by-decoration --date-order --color
    图形化单行显示所有提交历史（显示分支，简化，按时间排序，彩色）
    
    git log --oneline --graph --all --decorate --simplify-by-decoration --date-order --color --pretty=format:"%h %d %s (%cr)"
    图形化单行显示所有提交历史（显示分支，简化，按时间排序，彩色，自定义格式）
    
    git log --oneline --graph --all --decorate --simplify-by-decoration --date-order --color --pretty=format:"%h %d %s (%cr)" --abbrev-commit
    图形化单行显示所有提交历史（显示分支，简化，按时间排序，彩色，自定义格式，缩短哈希）
    
    git log --oneline --graph --all --decorate --simplify-by-decoration --date-order --color --pretty=format:"%h %d %s (%cr)" --abbrev-commit --date=iso
    图形化单行显示所有提交历史（显示分支，简化，按时间排序，彩色，自定义格式，缩短哈希，ISO时间）
     git log --oneline --graph --all --decorate --simplify-by-decoration --date-order --color --pretty=format:"%h %d %s (%cr)" --abbrev-commit --date=iso --name-status
    图形化单行显示所有提交历史（显示分支，简化，按时间排序，彩色，自定义格式，缩短哈希，ISO时间，显示文件）
```

## 7. git reset
版本回退

```gite
    git reset --hard HEAD^          // 回退到上一个版本
    git reset --hard HEAD~2         // 回退到上上一个版本  
    git reset --hard commit_id      // 回退到指定版本
    git reset --soft commit_id      // 回退到指定版本
```

## 8. git reflog
查看命令历史 恢复误删的历史记录,这是一个重要的"后悔药"，在你觉得自己搞砸了 Git 操作时，可以通过 reflog 找到之前的状态并恢复。

## 9. git fetch
```git
    git fetch origin branch_name  git checkout branch_name origin/branch_name // 拉取远程分支
```

## 9. git checkout
切换分支
```git 
    git checkout .           // 恢复所有修改
    git checkout -b 分支名    // 创建并切换分支
    git checkout 分支名       // 切换分支
    git checkout -- 文件名    // 撤销工作区的修改
```

## 10. git branch
查看分支

```git
    git branch -a       // 查看所有分支
    git branch -r       // 查看远程分支
    git branch -d 分支名    // 删除分支
    git branch -D 分支名    // 强制删除分支
    git branch -m 分支名    // 重命名分支
```

## 11. git merge
合并分支

## 12. git remote
关联远程仓库

```git
    git remote -v
    git remote set-url origin // 修改远程仓库地址
    git remote add origin // 关联远程仓库
    git remote rm origin  // 删除远程仓库
    git remote show origin // 查看远程仓库
```

## 13. git push
推送到远程仓库

## 14. git pull
从远程仓库拉取

```git
    git pull origin master  // 拉取远程仓库的master分支
    git pull --no-ff        // 只允许非快进合并 
    git pull --ff-only      // 只允许快进合并
```

## 15. git clone
克隆仓库

## 16. git tag
标签

```git
    git tag -a v1.0 -m "version 1.0"  // 创建标签
    git tag -d v1.0                   // 删除标签
    git tag -l                        // 查看标签
    git push origin v1.0              // 推送标签
    git push origin --tags            // 推送所有标签
    git push origin :refs/tags/v1.0   // 删除远程标签
```

## 17. git stash
暂存工作区
```git
    git stash                       // 暂存工作区
    git stash list                // 查看暂存列表             
    git stash apply stash@{0}   // 恢复暂存
    git stash drop stash@{0}    // 删除暂存
    git stash pop             // 恢复并删除暂存
```

## 18. git cherry-pick
选择提交

```git
    git cherry-pick commit_id   // 选择提交
    git cherry-pick -n commit_id   // 选择提交，但不提交
```

## 19. git rebase
变基

```git
    git rebase master          // 变基到master分支
    git rebase --continue       // 继续变基
    git rebase --abort          // 取消变基
    git rebase -i HEAD~2         // 修改最近两次提交 https://www.cnblogs.com/fe-linjin/p/10814935.html
```

## 20. git submodule
子模块
```git
    git submodule add url path   // 添加子模块  git submodule add https://github.com/example/lib.git libs/example
    git clone --recursive main-project  // 克隆主项目和子模块
    git submodule init           // 初始化子模块
    git submodule update         // 更新子模块
    git submodule update --remote  // 更新子模块
    git submodule foreach git pull  // 更新所有子模块
    git submodule update --remote libs/example  // 更新指定子模块
```

删除子模块比较麻烦，需要手动清理几个地方：

1. gitmodules 文件
2. git/config 文件
3. git/modules/ 目录
4. 实际的子模块目录

## git 规范

```git
    feat: 新功能（feature）
    fix：产生diff并自动修复此问题。适合于一次提交直接修复问题
    to：只产生diff不自动修复此问题。适合于多次提交。最终修复问题提交时使用fix
    docs: 文档（documentation）
    style: 格式（不影响代码运行的变动）
    refactor: 重构（即不是新增功能，也不是修改bug的代码变动）
    test: 增加测试
    chore: 构建过程或辅助工具的变动
    perf：优化相关，比如提升性能、体验。
    revert：回滚到上一个版本。
    merge：代码合并。
    sync：同步主线或分支的Bug。
    ci：自动化流程配置。
    build：影响构建系统或外部依赖项的更改。
    release：发布版本。
    workflow：工作流相关文件修改。
    dependency：依赖升级。
    security：安全相关。
    upgrade：升级依赖。
    downgrade：降级依赖。
``` 