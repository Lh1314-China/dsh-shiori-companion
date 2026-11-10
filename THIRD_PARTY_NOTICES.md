# Third-party notices

This plugin does not bundle `dsh-shiori`; it talks to it through an optional
in-process service and reads its data. `dsh-shiori` keeps its own license.

## Optional vector model

- `BAAI/bge-small-zh-v1.5` — MIT (model card metadata)
  https://huggingface.co/BAAI/bge-small-zh-v1.5
- `Xenova/bge-small-zh-v1.5` — ONNX/Transformers.js conversion of the model
  https://huggingface.co/Xenova/bge-small-zh-v1.5
- `@huggingface/transformers` — Apache-2.0
  https://github.com/huggingface/transformers.js

The optional model pack under `dist/model-pack` carries the BAAI MIT license
and a model notice. Keep both when redistributing. Do not imply BAAI or Xenova
endorses this plugin.

## Shiori

This plugin is independent and is not an official `dsh-shiori` release. The
`shioriCompanion` service used for writes lives in a patched copy of shiori and
is not bundled here.

`dsh-shiori` 0.1.0 declares **CC-BY-NC-SA-4.0** (non-commercial, share-alike).
This plugin does not bundle it; it talks to an installed copy. Before selling or
publishing a combined distribution, review that license separately. Nothing
here grants rights to shiori's code or branding.
