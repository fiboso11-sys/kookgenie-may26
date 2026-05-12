# Fresh install for Windows — fixes broken or out-of-sync node_modules
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $root

Write-Host "Project: $root"

Write-Host "Removing node_modules..."
if (Test-Path node_modules) {
  Remove-Item -Recurse -Force node_modules
}

Write-Host "Removing package-lock.json..."
if (Test-Path package-lock.json) {
  Remove-Item -Force package-lock.json
}

Write-Host "Removing .next build cache..."
if (Test-Path .next) {
  Remove-Item -Recurse -Force .next
}

Write-Host "Running npm install..."
npm install
if ($LASTEXITCODE -ne 0) {
  Write-Host "npm install failed with exit code $LASTEXITCODE"
  exit $LASTEXITCODE
}

if (-not (Test-Path "node_modules\next\package.json")) {
  Write-Host "ERROR: next not found under node_modules — install did not complete."
  exit 1
}

Write-Host "Done. node_modules is ready."
Write-Host "Optional: run 'npm audit fix' (without --force) for compatible security patches, then 'npm run build'."
