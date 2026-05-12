# Push Supabase public env vars from .env.local into Vercel (Production + Preview).
# Run from repo root:
#   powershell -ExecutionPolicy Bypass -File .\scripts\push-vercel-supabase-env-from-local.ps1
#
# Requires: `npx vercel@latest` works and project is linked (`vercel link`).
# If a variable already exists, the CLI may ask — choose overwrite / replace.
#
# Vercel prints progress to stderr; with Stop, PowerShell 5.x treats stderr as fatal.
$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $Root

function Invoke-VercelEnvAddFromStdin {
  param(
    [Parameter(Mandatory)][string]$Value,
    [Parameter(Mandatory)][string]$VarName,
    [Parameter(Mandatory)][string]$TargetEnv
  )
  $oldEap = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $output = $Value | & npx vercel@latest env add $VarName $TargetEnv 2>&1
    foreach ($line in $output) {
      if ($null -eq $line) { continue }
      if ($line -is [System.Management.Automation.ErrorRecord]) {
        Write-Host $line.Exception.Message.TrimEnd()
      } else {
        Write-Host $line
      }
    }
    if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) {
      throw "vercel env add failed for $VarName ($TargetEnv): exit code $LASTEXITCODE"
    }
  } finally {
    $ErrorActionPreference = $oldEap
  }
}

$envFile = Join-Path $Root ".env.local"
if (-not (Test-Path -LiteralPath $envFile)) {
  Write-Error ".env.local not found at $envFile"
  exit 1
}

function Get-DotEnvValue([string]$path, [string]$key) {
  $lines = Get-Content -LiteralPath $path
  $last = $null
  foreach ($line in $lines) {
    $t = $line.Trim()
    if ($t.StartsWith("#") -or $t -eq "") { continue }
    if ($t -notmatch "^$([regex]::Escape($key))\s*=\s*(.*)$") { continue }
    $v = $matches[1].Trim()
    if (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'"))) {
      $v = $v.Substring(1, $v.Length - 2)
    }
    $last = $v
  }
  return $last
}

$url = Get-DotEnvValue $envFile "NEXT_PUBLIC_SUPABASE_URL"
$pub = Get-DotEnvValue $envFile "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
$anon = Get-DotEnvValue $envFile "NEXT_PUBLIC_SUPABASE_ANON_KEY"

if ([string]::IsNullOrWhiteSpace($url)) {
  Write-Error "NEXT_PUBLIC_SUPABASE_URL missing in .env.local"
  exit 1
}
if ([string]::IsNullOrWhiteSpace($pub) -and [string]::IsNullOrWhiteSpace($anon)) {
  Write-Error "Add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
  exit 1
}

$targets = @("production", "preview")

foreach ($env in $targets) {
  Write-Host "`n========== $env ==========" -ForegroundColor Cyan
  Write-Host "Adding NEXT_PUBLIC_SUPABASE_URL ..."
  Invoke-VercelEnvAddFromStdin -Value $url -VarName "NEXT_PUBLIC_SUPABASE_URL" -TargetEnv $env

  if (-not [string]::IsNullOrWhiteSpace($pub)) {
    Write-Host "Adding NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ..."
    Invoke-VercelEnvAddFromStdin -Value $pub -VarName "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" -TargetEnv $env
  }
  if (-not [string]::IsNullOrWhiteSpace($anon)) {
    Write-Host "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY ..."
    Invoke-VercelEnvAddFromStdin -Value $anon -VarName "NEXT_PUBLIC_SUPABASE_ANON_KEY" -TargetEnv $env
  }
}

Write-Host "`nNext: redeploy so the client bundle picks up NEXT_PUBLIC_*" -ForegroundColor Green
Write-Host "  npm run deploy:vercel" -ForegroundColor Green
Write-Host "Or trigger a redeploy from the Vercel dashboard." -ForegroundColor Green
