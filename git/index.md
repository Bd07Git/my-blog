# Git 基础教程

Git 是目前世界上最先进的分布式版本控制系统。

---

## 1. 常用基础命令

### 初始化与配置
- `git init`: 初始化本地仓库。
- `git config --global user.name "你的名字"`: 配置用户名。
- `git config --global user.email "你的邮箱"`: 配置邮箱。

### 基础操作
- `git status`: 查看当前工作区状态。
- `git add <file>`: 将文件添加到暂存区（`git add .` 添加所有）。
- `git commit -m "提交信息"`: 将暂存区内容提交到本地仓库。
- `git log`: 查看提交历史。

### 分支管理
- `git branch`: 查看分支。
- `git checkout -b <name>`: 创建并切换到新分支。
- `git merge <name>`: 合并指定分支到当前分支。

---

## 2. .gitignore 的作用

`.gitignore` 文件用于指定 Git **忽略**哪些文件或目录，不将其纳入版本管理。

### 为什么要使用它？
- **安全性**：避免将敏感信息（如 API 密钥、数据库密码）上传到远程仓库。
- **性能**：避免上传巨大的依赖包，一般不会将node_modules上传到远程仓库。
- **整洁**：忽略自动生成的构建产物（如 `dist/`, `build/`）和本地编辑器配置（如 `.vscode/`）。

### 常见配置示例
```text
node_modules/
dist/
.DS_Store //系统文件
*.log
.env
```

---

## 3. 如何将本地项目托管到 GitHub

### 第一步：在 GitHub 创建仓库
1. 登录 GitHub，点击右上角 `+` -> `New repository`。
2. 输入仓库名称，点击 `Create repository`。

### 第二步：关联远程仓库
在本地项目根目录下运行：
```bash
# 1. 添加远程仓库地址
git remote add origin https://github.com/你的用户名/仓库名.git

# 2. 确保本地有提交记录
git add .
git commit -m "initial commit"

# 3. 推送到远程仓库 (首次推送需加 -u)
git push -u origin main
```

### 第三步：后续更新
以后只需执行：
```bash
git add .
git commit -m "update content"
git push
```

---

## 4. 常见问题
- **冲突解决**：当多人修改同一行时会产生冲突，需手动打开文件修改后重新 `add` 和 `commit`。
- **撤销修改**：`git restore <file>` 撤销工作区修改；`git reset --hard HEAD^` 回退到上一个版本。