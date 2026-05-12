# Run AFTER scripts/fix-git-repo-root.ps1 and after: git remote add origin <url>
# Usage: powershell -ExecutionPolicy Bypass -File scripts/git-commit-push-main.ps1
$ErrorActionPreference = "Stop"
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $ProjectRoot

$top = [System.IO.Path]::GetFullPath((git rev-parse --show-toplevel).Trim().Replace("/", [IO.Path]::DirectorySeparatorChar))
$want = [System.IO.Path]::GetFullPath($ProjectRoot)
if ($top -ne $want) {
  Write-Error "Wrong git root: $top (expected $want). Run fix-git-repo-root.ps1 first."
  exit 1
}

$remotes = git remote
if (-not $remotes) {
  Write-Host "No git remote. Add one first, e.g.:"
  Write-Host '  git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git'
  exit 1
}

git add -A
git status

git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host "No changes to commit."
} else {
  git commit -m "Fix food search API and frontend autocomplete"
}

git branch -M main
git push -u origin main
