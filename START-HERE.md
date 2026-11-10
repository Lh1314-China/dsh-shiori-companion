# START HERE — 发到 GitHub

推荐仓库名：

```text
dsh-shiori-companion
```

如果这个名字被占用，用：

```text
dsh-shiori-companion-memory-panel
```

仓库描述建议：

```text
A community memory panel and depth modules for dsh-shiori (DeepSeek Harness plugin).
```

Topics：

```text
dsh, dsh-plugin, shiori, deepseek-harness, memory, cordis
```

## 1. 在当前文件夹打开 PowerShell

在资源管理器地址栏输入 `powershell` 回车，或右键 → 在终端中打开。

## 2. 初始化并提交

```powershell
git init
git branch -M main
git config user.name "凌寒和小鱼"
git config user.email "<你的 GitHub 邮箱>"
git add .
git commit -m "feat: initial public dsh-shiori-companion 0.1.0"
```

## 3. 新建 GitHub 仓库

浏览器打开：

```text
https://github.com/new
```

- Repository name：`dsh-shiori-companion`
- Public
- 不要勾 README / .gitignore / License
- 点 **Create repository**

## 4. 推送

在 GitHub 新仓库页面复制远程地址，然后：

```powershell
git remote add origin https://github.com/<你的用户名>/dsh-shiori-companion.git
git push -u origin main
```

## 5. 触发官方 ONNX

### 自动发 Release

```powershell
git tag v0.1.0
git push origin v0.1.0
```

### 或手动只跑构建

GitHub 仓库 → **Actions** → **Build official BGE ONNX model** → **Run workflow** → **Run**。

## 6. 下载

- 自动发 Release：仓库右侧 **Releases**
- 手动构建：Actions 运行页底部 **Artifacts**

校验：

```powershell
Get-FileHash .\dsh-shiori-companion-0.1.0.tgz -Algorithm SHA256
Get-FileHash .\dsh-shiori-companion-bge-small-official-0.1.0.tgz -Algorithm SHA256
```

完整版看 `GITHUB_STEPS.md`。
