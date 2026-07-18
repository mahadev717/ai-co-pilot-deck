# Prepare SearXNG settings for AgentSearch (Windows)
$Root = Join-Path $PSScriptRoot "..\vendor\agent-search" | Resolve-Path
$Example = Join-Path $Root "searxng\settings.example.yml"
$Target = Join-Path $Root "searxng\settings.yml"
$TorExample = Join-Path $Root "examples\settings.tor.yml"
$TorTarget = Join-Path $Root "searxng\settings.tor.yml"

function New-Settings($example, $target) {
  if (Test-Path $target) {
    Write-Host "exists: $target"
    return
  }
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $bytes = New-Object byte[] 36
  $rng.GetBytes($bytes)
  $secret = [Convert]::ToBase64String($bytes).Replace("+","-").Replace("/","_").TrimEnd("=")
  $text = Get-Content $example -Raw
  $text = $text.Replace("AGENTSEARCH_GENERATE_LOCAL_SECRET", $secret)
  $text = $text.Replace("CHANGE_ME_GENERATE_A_RANDOM_KEY", $secret)
  $dir = Split-Path $target -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  Set-Content -Path $target -Value $text -NoNewline
  Write-Host "created: $target"
}

New-Settings $Example $Target
if (Test-Path $TorExample) { New-Settings $TorExample $TorTarget }
Write-Host "Done. Next: npm run agent-search:up  (requires Docker Desktop)"
