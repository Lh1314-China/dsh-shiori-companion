[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Profile,

  [string]$DataRoot = "",
  [string]$StateRoot = "",
  [string]$ModelPath = ""
)

$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$mainPackage = Join-Path $root "dsh-shiori-companion-0.1.0.tgz"

if (-not (Test-Path $mainPackage)) {
  throw "Main package not found: $mainPackage"
}

if (-not (Get-Command dsh -ErrorAction SilentlyContinue)) {
  throw "dsh command not found. Run this from a shell where DSH is available."
}

Write-Host "Installing plugin into profile: $Profile"
& dsh plugin --profile $Profile add $mainPackage
if ($LASTEXITCODE -ne 0) {
  throw "dsh plugin install failed with exit code $LASTEXITCODE"
}

if ($ModelPath -ne "") {
  if (-not (Test-Path $ModelPath)) {
    throw "Model package not found: $ModelPath"
  }
  if ($StateRoot -eq "") {
    throw "-StateRoot is required when -ModelPath is provided."
  }
  $plus = Join-Path $StateRoot "plus"
  New-Item -ItemType Directory -Force $plus | Out-Null
  Write-Host "Extracting official ONNX model into: $plus"
  tar -xzf $ModelPath -C $plus
  if ($LASTEXITCODE -ne 0) {
    throw "Model extraction failed with exit code $LASTEXITCODE"
  }
  $onnx = Join-Path $plus "models\Xenova\bge-small-zh-v1.5\onnx\model.onnx"
  if (-not (Test-Path $onnx)) {
    Write-Warning "model.onnx was not found at $onnx. Check the model package layout before enabling vector."
  }
} else {
  Write-Host "No model supplied. FTS5 + BM25 will work; vector stays optional."
}

Write-Host ""
Write-Host "Add this to the profile cordis.patch.yml:"
Write-Host ""
Write-Host "- id: shiori-companion"
Write-Host "  name: dsh-shiori-companion"
Write-Host "  config:"
Write-Host "    dataRoot: '<shiori dataRoot>'"
Write-Host "    stateRoot: '<shiori stateRoot>'"
Write-Host "    scope: global"
Write-Host "    workFile: '<stateRoot>/plus/work-cards.json'"
Write-Host "    featuresFile: '<stateRoot>/plus/features.json'"
Write-Host "    archiveIndex: '<stateRoot>/plus/archive/index.json'"
Write-Host ""
if ($DataRoot -ne "") { Write-Host "Suggested dataRoot: $DataRoot" }
if ($StateRoot -ne "") { Write-Host "Suggested stateRoot: $StateRoot" }
Write-Host "Restart DSH, then open the Memory Panel."
