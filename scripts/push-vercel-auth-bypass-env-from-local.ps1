# Push auth bypass env vars from .env.local to Vercel (Production + Preview).
# Run from repo root (after `vercel link` and login):
#   npm run vercel:env:bypass-from-local
#
# Reads: KG_AUTH_BYPASS_ENABLED, KG_AUTH_BYPASS_TOKEN, NEXT_PUBLIC_SHOW_AUTH_BYPASS_UI, KG_AUTH_BYPASS_EMAIL (optional)
# Optional: KG_AUTH_BYPASS_TOKEN_PRODUCTION — if set, used for Vercel "production" only (preview still uses KG_AUTH_BYPASS_TOKEN).
# If CLI says variable exists, choose overwrite/replace.
#
# Vercel prints progress to stderr; with $ErrorActionPreference = Stop, PowerShell 5.x treats that as fatal.
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

$enabled = Get-DotEnvValue $envFile "KG_AUTH_BYPASS_ENABLED"
$token = Get-DotEnvValue $envFile "KG_AUTH_BYPASS_TOKEN"
$tokenProd = Get-DotEnvValue $envFile "KG_AUTH_BYPASS_TOKEN_PRODUCTION"
$showUi = Get-DotEnvValue $envFile "NEXT_PUBLIC_SHOW_AUTH_BYPASS_UI"
$email = Get-DotEnvValue $envFile "KG_AUTH_BYPASS_EMAIL"

if ([string]::IsNullOrWhiteSpace($enabled)) {
  Write-Error "KG_AUTH_BYPASS_ENABLED missing in .env.local"
  exit 1
}
if ([string]::IsNullOrWhiteSpace($token)) {
  Write-Error "KG_AUTH_BYPASS_TOKEN missing in .env.local"
  exit 1
}
if ([string]::IsNullOrWhiteSpace($showUi)) {
  Write-Error "NEXT_PUBLIC_SHOW_AUTH_BYPASS_UI missing in .env.local"
  exit 1
}

$targets = @("production", "preview")

foreach ($env in $targets) {
  Write-Host "`n========== $env ==========" -ForegroundColor Cyan
  $tokenForEnv = $token
  if ($env -eq "production" -and -not [string]::IsNullOrWhiteSpace($tokenProd)) {
    $tokenForEnv = $tokenProd
    Write-Host "(using KG_AUTH_BYPASS_TOKEN_PRODUCTION for production token)" -ForegroundColor DarkGray
  }
  Write-Host "KG_AUTH_BYPASS_ENABLED ..."
  Invoke-VercelEnvAddFromStdin -Value $enabled -VarName "KG_AUTH_BYPASS_ENABLED" -TargetEnv $env
  Write-Host "KG_AUTH_BYPASS_TOKEN ..."
  Invoke-VercelEnvAddFromStdin -Value $tokenForEnv -VarName "KG_AUTH_BYPASS_TOKEN" -TargetEnv $env
  Write-Host "NEXT_PUBLIC_SHOW_AUTH_BYPASS_UI ..."
  Invoke-VercelEnvAddFromStdin -Value $showUi -VarName "NEXT_PUBLIC_SHOW_AUTH_BYPASS_UI" -TargetEnv $env
  if (-not [string]::IsNullOrWhiteSpace($email)) {
    Write-Host "KG_AUTH_BYPASS_EMAIL ..."
    Invoke-VercelEnvAddFromStdin -Value $email -VarName "KG_AUTH_BYPASS_EMAIL" -TargetEnv $env
  }
}

Write-Host "`nDone. Redeploy for changes to apply:" -ForegroundColor Green
Write-Host "  npm run deploy:vercel" -ForegroundColor Green
