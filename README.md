# dsh-shiori-companion

An independent, community companion plugin for **dsh-shiori**.  
Created by **凌寒和小鱼**.

It adds a left-sidebar memory panel, scoped edits for L0–L3, and optional depth
modules on top of an installed `dsh-shiori`. It is not an official shiori
release and does not bundle shiori.

## 项目声明

- **非盈利、全开源**：插件代码 MIT，公开源码，不收费，不提供付费版本。
- **不包含 `dsh-shiori` 代码或记忆数据**；shiori 是独立第三方项目，按其自身
  许可证使用。
- **不包含模型权重**；官方 ONNX 由 GitHub Actions 或用户从 BAAI 的 MIT
  权重构建，单独分发。
- 本项目是独立社区项目，不代表 shiori / BAAI / Hugging Face / Xenova 官方。
- 如权利人认为有误用，请开 issue；核查后会移除或替换。详见 `DISCLAIMER.md`。

## What it does

- Sidebar **Memory Panel**: overview, spark cards, work cards, topics, timeline,
  depth, switches, setup, archive
- Read L0–L3 from shiori, with a file fallback
- Edit L0 persona, L1 core, topics, and spark cards with revision CAS,
  diff preview, backup, and 409 conflict handling (requires a patched shiori
  that exposes `shioriCompanion`)
- Work cards and 18 companion-side switches
- Depth modules: hippocampus, semantic context, verification, left/right brain,
  judgment feedback, emotion/affect, focus/diary/dream/sleep, health/evolution,
  queue, hybrid recall (FTS5 + BM25 + optional local vector)
- Custom memory areas with a panel form
- Setup wizard: path checks and a `cordis.patch.yml` snippet

## Requirements

- DeepSeek Harness (DSH) `>=0.2.1-rc.2 <0.4.0`
- Node.js `>=20`
- An installed `dsh-shiori` 0.1/0.3
  - stock shiori: read-only panel + depth modules
  - patched shiori with `shioriCompanion`: editing, prompt sections, plan events
- Optional vector: `@huggingface/transformers` plus an ONNX model built from
  `BAAI/bge-small-zh-v1.5`

## Install

From a release folder:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1 `
  -Profile desktop `
  -DataRoot "<shiori dataRoot>" `
  -StateRoot "<shiori stateRoot>" `
  -ModelPath ".\dsh-shiori-companion-bge-small-official-0.1.0.tgz"
```

Omit `-ModelPath` for a model-free install. See `INSTALL.md` for manual steps.

## Model

The main package does **not** include model weights. Build the official ONNX
model from BAAI weights with `.github/workflows/build-official-model.yml`, or
provide your own compatible local model at:

```text
<stateRoot>/plus/models/Xenova/bge-small-zh-v1.5/
```

The vector layer is optional; FTS5 + BM25 work without it.

## License

MIT for this plugin. Model and shiori licenses are separate; see
`THIRD_PARTY_NOTICES.md`. `dsh-shiori` 0.1.0 is CC-BY-NC-SA-4.0; this plugin
does not bundle it.

## Status

Early public release. Editing and depth modules are tested against a patched
shiori 0.3.0 copy; stock shiori remains read-only by design.
