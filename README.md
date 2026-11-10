# dsh-shiori-companion

An independent, community companion plugin for **dsh-shiori**.  
Created by **凌寒和小鱼**.

It adds a left-sidebar memory panel, scoped edits for L0–L3, and optional depth
modules on top of an installed `dsh-shiori`. It is not an official shiori
release and does not bundle shiori.

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

```powershell
dsh plugin --profile <profile> add dsh-shiori-companion-0.1.0.tgz
```

Then point the plugin at the same shiori roots:

```yaml
- id: shiori-companion
  name: dsh-shiori-companion
  config:
    dataRoot: '<shiori dataRoot>'
    stateRoot: '<shiori stateRoot>'
    scope: global
```

See `INSTALL.md` for details and rollback.

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
