# 部署指南

## 🚀 最简单的方法（推荐）

### 方式 1：Vercel 拖拽上传（最快）

1. 打开：https://vercel.com/new
2. 用邮箱或 GitHub 登录
3. 把整个 `doudou` 文件夹拖进去
4. 点击 "Deploy"
5. 完成！你的网站上线了！

### 方式 2：GitHub + Vercel（方便后续更新）

#### 第一步：准备 GitHub

1. 访问 https://github.com/new 创建一个新仓库
2. 仓库名称：`perler-bead-manager`（或其他你喜欢的名字）
3. 点击 "Create repository"

#### 第二步：上传代码

1. 在 GitHub 仓库页面，点击 "uploading an existing file"
2. 把 `doudou` 文件夹里的所有文件（除了 node_modules 和 .next）都拖进去
3. 点击 "Commit changes"

#### 第三步：部署到 Vercel

1. 打开 https://vercel.com/new
2. 导入你刚创建的 GitHub 仓库
3. 保持默认设置，点击 "Deploy"
4. 完成！

---

## 🔄 如何更新网站

### 如果用方式 2（GitHub）

1. 在本地修改代码
2. 在 GitHub 仓库页面，点击 "Add file" → "Upload files"
3. 上传修改的文件
4. Vercel 会自动重新部署！

---

## ✨ 部署后你会得到

- 🔗 一个免费的网址（类似 `your-project.vercel.app`）
- 🌐 任何设备都能访问（包括手机蜂窝网络）
- 🔒 自动 HTTPS 加密
- ⚡ 全球加速访问
