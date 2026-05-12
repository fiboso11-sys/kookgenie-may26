# Fix Git repo root: must be C:\Users\dell\kookgenie only (run from any directory).
$ErrorActionPreference = "Stop"
$Log = Join-Path $PSScriptRoot "..\git-repo-fix.log"
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ProfileGit = Join-Path $env:USERPROFILE ".git"
$BackupName = ".git_wrong_profile_backup"

function Log([string]$m) { $m | Tee-Object -FilePath $Log -Append }

Set-Location $ProjectRoot
Log "=== git repo fix $(Get-Date -Format o) ==="
Log "ProjectRoot: $ProjectRoot"

if (Test-Path -LiteralPath $ProfileGit) {
  $backupPath = Join-Path $env:USERPROFILE $BackupName
  if (Test-Path -LiteralPath $backupPath) {
    Log "ERROR: $backupPath already exists. Remove or rename it manually, then re-run."
    exit 1
  }
  Log "Renaming mistaken profile .git -> $BackupName"
  Rename-Item -LiteralPath $ProfileGit -NewName $BackupName
  Log "OK: profile .git renamed."
} else {
  Log "No profile-level .git at $ProfileGit (nothing to rename)."
}

if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot ".git"))) {
  Log "Running git init in project root..."
  git -C $ProjectRoot init
} else {
  Log ".git already exists in project root."
}

$top = (git -C $ProjectRoot rev-parse --show-toplevel 2>$null).Trim()
$normTop = [System.IO.Path]::GetFullPath($top.Replace("/", [IO.Path]::DirectorySeparatorChar))
$normProj = [System.IO.Path]::GetFullPath($ProjectRoot)
Log "git rev-parse --show-toplevel: $top"

if ($normTop -ne $normProj) {
  Log "WARNING: Git toplevel does not match project root."
  Log "  Expected: $normProj"
  Log "  Got:      $normTop"
}

Log "Done. See $Log"
