# 从 0 发到 GitHub（含官方 ONNX）

这份流程用桌面的公开包：

```text
C:\Users\<你>\Desktop\dsh-shiori-companion-public-0.1.0
```

不要把这个目录和私人版混在一起。

## 0. 准备

需要：

- GitHub 账号
- Git for Windows
- 一个空仓库名，例如 `dsh-shiori-companion`

先打开 PowerShell：

```powershell
cd "$HOME\Desktop\dsh-shiori-companion-public-0.1.0"
git --version
```

## 1. 先检查没有私人信息

```powershell
Get-ChildItem -Recurse -File -Include *.md,*.js,*.json,*.yml |
  Select-String -Pattern "C:\\Users|D:\\shiori-data|D:\\shiori-state|password|secret"
```

没有输出才继续。  
公开包的 LICENSE / AUTHORS / package.json 已经写明作者「凌寒和小鱼」。

## 2. 初始化本地仓库

```powershell
git init
git branch -M main
git config user.name "凌寒和小鱼"
git config user.email "<你的 GitHub 邮箱>"
git add .
git status
```

确认 `git status` 里没有：

- `*.tgz`
- `backups/`
- 截图
- 私人记忆文件

`.gitignore` 已经挡了这些。

```powershell
git commit -m "feat: initial public dsh-shiori-companion 0.1.0"
```

## 3. 在 GitHub 建空仓库

浏览器打开 <https://github.com/new>：

- Repository name：`dsh-shiori-companion`
- 选 **Public**
- 不要勾 README、.gitignore、License（本地已有）
- Create repository

GitHub 会显示远程地址，类似：

```text
https://github.com/<你的用户名>/dsh-shiori-companion.git
```

## 4. 推上去

```powershell
git remote add origin https://github.com/<你的用户名>/dsh-shiori-companion.git
git push -u origin main
```

打开仓库，确认能看到：

- `README.md`
- `INSTALL.md`
- `MODEL_BUILD.md`
- `.github/workflows/build-official-model.yml`
- `AUTHORS.md`

## 5. 触发官方 ONNX 构建

工作流有两种触发方式。

### 方式 A：打 tag（推荐，自动发 Release）

```powershell
git tag v0.1.0
git push origin v0.1.0
```

工作流会：

1. 下载 BAAI 官方权重
2. 用 Optimum 转 ONNX
3. 打包官方模型
4. `npm pack` 主插件
5. 生成 `SHA256SUMS-release.txt`
6. 自动创建 GitHub Release，挂上：
   - `dsh-shiori-companion-0.1.0.tgz`
   - `dsh-shiori-companion-bge-small-official-0.1.0.tgz`
   - `SHA256SUMS-release.txt`

### 方式 B：手动跑（只出 artifact，不自动发 Release）

GitHub 仓库 → **Actions** → **Build official BGE ONNX model** → **Run workflow** → 选 `main` → Run。

跑完在 run 页面底部下载 artifact `bge-small-official-onnx`。

## 6. 看构建结果

Actions 页面：

- 绿色勾：成功
- 红色叉：点进去看失败步骤

常见检查点：

- `Install conversion tools`：pip 网络
- `Export official BAAI weights to ONNX`：模型下载
- `Arrange Transformers.js layout`：是否找到 `model.onnx`
- `Pack model`：模型包大小
- `Publish GitHub Release`：tag 触发才有

成功后 Release 页面应有两个 tgz + 校验文件。

## 7. 校验下载物

```powershell
Get-FileHash .\dsh-shiori-companion-0.1.0.tgz -Algorithm SHA256
Get-FileHash .\dsh-shiori-companion-bge-small-official-0.1.0.tgz -Algorithm SHA256
Get-Content .\SHA256SUMS-release.txt
```

哈希对得上再用。

## 8. 安装给别人

主插件：

```powershell
dsh plugin --profile <profile> add .\dsh-shiori-companion-0.1.0.tgz
```

模型：

```powershell
tar -xzf .\dsh-shiori-companion-bge-small-official-0.1.0.tgz -C <stateRoot>\plus
```

解压后必须是：

```text
<stateRoot>\plus\models\Xenova\bge-small-zh-v1.5\onnx\model.onnx
```

然后在面板「开关」打开 `features.vector`。

## 9. 不要做的事

- 不要把私人版 `dsh-shiori-companion-0.1.0-release` 推上去
- 不要把 `D:\shiori-data`、`D:\shiori-state` 推上去
- 不要把 `.tgz` 提交进 Git 历史
- 不要在没有复核 `dsh-shiori` CC-BY-NC-SA 的情况下做商业合并分发
- 不要在公开 README 里写自己的本机路径

## 10. 如果 Actions 失败

把失败步骤的日志贴出来。先看三件事：

1. `model.onnx` 到底导出到了哪个目录
2. `BAAI/bge-small-zh-v1.5` 是否下载成功
3. `softprops/action-gh-release` 是否有 `contents: write` 权限

工作流已经处理了前两项的常见路径，第三项已在 `permissions` 里写了 `contents: write`。
