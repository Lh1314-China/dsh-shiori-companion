# Install

## One-click from a release folder

Download the release, keep these files together:

```text
install.ps1
dsh-shiori-companion-0.1.0.tgz
dsh-shiori-companion-bge-small-official-0.1.0.tgz   (optional)
```

Then run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1 `
  -Profile desktop `
  -DataRoot "<shiori dataRoot>" `
  -StateRoot "<shiori stateRoot>" `
  -ModelPath ".\dsh-shiori-companion-bge-small-official-0.1.0.tgz"
```

If you do not want the optional vector model, omit `-ModelPath`; the plugin
still works with FTS5 + BM25.

## Manual install

## 1. Back up the profile

```powershell
$profile = "<profile dir>"
$backup = "backup-$(Get-Date -Format yyyyMMdd-HHmmss)"
New-Item -ItemType Directory -Force $backup | Out-Null
Copy-Item "$profile\package.json" $backup
Copy-Item "$profile\cordis.patch.yml" $backup
```

## 2. Install the bundle

```powershell
dsh plugin --profile <profile> add .\dsh-shiori-companion-0.1.0.tgz
```

Restart DSH. The left sidebar should show **Memory Panel**.

## 3. Configure shiori roots

Add this to the profile's `cordis.patch.yml`:

```yaml
- id: shiori-companion
  name: dsh-shiori-companion
  config:
    dataRoot: '<shiori dataRoot>'
    stateRoot: '<shiori stateRoot>'
    scope: global
    workFile: '<stateRoot>/plus/work-cards.json'
    featuresFile: '<stateRoot>/plus/features.json'
    archiveIndex: '<stateRoot>/plus/archive/index.json'
```

`dataRoot` and `stateRoot` must match the installed shiori configuration.
The panel's **Setup** tab checks the paths and prints the same snippet.

## 4. Optional model

Build the official ONNX model with the GitHub Actions workflow in
`.github/workflows/build-official-model.yml`, then extract it so the layout is:

```text
<stateRoot>/plus/models/Xenova/bge-small-zh-v1.5/
```

Enable `features.vector` in the panel's **Switches** tab. Without a model,
FTS5 + BM25 still work.

## 5. Verify

- `GET /api/shiori-companion/overview` returns 200
- **Setup** shows all required checks green
- Stock shiori: `shioriCompanion=false` and `/commit` 501 are expected
- Patched shiori: `shioriCompanion=true`; use a wrong revision to confirm 409

## Rollback

```powershell
dsh plugin --profile <profile> remove dsh-shiori-companion
```

Restore `package.json` and `cordis.patch.yml` from the backup. The plugin only
writes `<stateRoot>/plus`; shiori's L0–L3 are not moved or deleted.
