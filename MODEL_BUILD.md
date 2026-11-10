# Official ONNX model build

The main plugin does **not** ship model weights. The optional vector layer uses
an ONNX export of `BAAI/bge-small-zh-v1.5` (MIT).

## Why a build step

We build from the **official BAAI weights** instead of redistributing a
third-party ONNX conversion. This keeps provenance and the license notice clear.

## Build on GitHub Actions

Workflow: `.github/workflows/build-official-model.yml`

It:

1. installs PyTorch CPU, Transformers, Optimum and ONNX;
2. downloads `BAAI/bge-small-zh-v1.5`;
3. exports `feature-extraction` ONNX;
4. arranges the files for Transformers.js;
5. uploads `dsh-shiori-companion-bge-small-official-0.1.0.tgz`.

## Local build

```bash
python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
python -m pip install transformers "optimum[exporters]" onnx huggingface_hub
optimum-cli export onnx --model BAAI/bge-small-zh-v1.5 --task feature-extraction --opset 14 official-onnx
```

Then place:

```text
<stateRoot>/plus/models/Xenova/bge-small-zh-v1.5/
  config.json
  tokenizer.json
  tokenizer_config.json
  special_tokens_map.json
  vocab.txt
  onnx/model.onnx
  LICENSE
  MODEL-NOTICE.md
```

Enable `features.vector`.

## License

`BAAI/bge-small-zh-v1.5` is MIT according to its model card. Keep the MIT
license and model notice with redistributed copies. Do not imply BAAI or
Hugging Face endorses this plugin.
