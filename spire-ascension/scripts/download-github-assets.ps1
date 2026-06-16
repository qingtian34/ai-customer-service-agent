# Download game-icons (GitHub) + optional Kenney pack
# Run: powershell -ExecutionPolicy Bypass -File scripts/download-github-assets.ps1

$ErrorActionPreference = 'Continue'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$giRoot = Join-Path $root 'assets\game-icons'

$mirrors = @(
  'https://cdn.jsdelivr.net/gh/game-icons/icons@master',
  'https://raw.githubusercontent.com/game-icons/icons/master'
)

# dest path => list of source paths to try (first match wins)
$iconMap = [ordered]@{
  'lorc/broadsword.svg'           = @('lorc/broadsword.svg')
  'lorc/round-shield.svg'         = @('lorc/round-shield.svg','lorc/riot-shield.svg','lorc/shield.svg')
  'lorc/fireball.svg'             = @('lorc/fireball.svg')
  'lorc/magic-swirl.svg'          = @('lorc/magic-swirl.svg')
  'lorc/poison.svg'               = @('lorc/poison.svg','lorc/bubbling-flask.svg','delapouite/poison-bottle.svg')
  'lorc/lightning-helix.svg'      = @('lorc/lightning-helix.svg')
  'lorc/hearts.svg'               = @('lorc/hearts.svg','lorc/heart-organ.svg','lorc/heart-beats.svg')
  'lorc/crossed-swords.svg'       = @('lorc/crossed-swords.svg')
  'lorc/run.svg'                  = @('lorc/run.svg')
  'lorc/aura.svg'                 = @('lorc/aura.svg')
  'lorc/death-skull.svg'          = @('lorc/death-skull.svg','lorc/skull-mask.svg','lorc/skull-with-crossed-bones.svg')
  'delapouite/barbarian.svg'      = @('delapouite/barbarian.svg')
  'delapouite/thief.svg'          = @('delapouite/thief.svg','delapouite/robber.svg','delapouite/hooded-assassin.svg')
  'delapouite/wizard-face.svg'    = @('delapouite/wizard-face.svg')
  'delapouite/vampire-dracula.svg'= @('delapouite/vampire-dracula.svg')
  'delapouite/cultist.svg'        = @('delapouite/cultist.svg','delapouite/evil-tower.svg','delapouite/wizard-staff.svg')
  'delapouite/slime.svg'          = @('delapouite/slime.svg')
  'delapouite/goblin.svg'         = @('delapouite/goblin.svg','delapouite/goblin-head.svg')
  'delapouite/ghost.svg'          = @('delapouite/ghost.svg','lorc/ghost.svg')
  'delapouite/crown.svg'          = @('delapouite/crown.svg','lorc/crown.svg')
  'delapouite/worm.svg'           = @('delapouite/worm.svg','delapouite/snake-tongue.svg','delapouite/snake.svg')
  'delapouite/spider-face.svg'    = @('delapouite/spider-face.svg','delapouite/spider-eye.svg','delapouite/spider-alt.svg')
  'delapouite/gold-bar.svg'       = @('delapouite/gold-bar.svg','delapouite/gold-stack.svg')
  'delapouite/potion-ball.svg'    = @('delapouite/potion-ball.svg','delapouite/health-potion.svg')
  'delapouite/campfire.svg'       = @('delapouite/campfire.svg','lorc/campfire.svg','delapouite/bonfire.svg')
  'delapouite/shop.svg'           = @('delapouite/shop.svg')
}

function Download-Icon($destRel, $sources) {
  $dest = Join-Path $giRoot $destRel
  $dir = Split-Path $dest -Parent
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  foreach ($base in $mirrors) {
    foreach ($src in $sources) {
      try {
        Invoke-WebRequest -Uri "$base/$src" -OutFile $dest -UseBasicParsing -TimeoutSec 60
        if ((Get-Item $dest).Length -gt 200) {
          Write-Host "  OK $destRel <- $src" -ForegroundColor Green
          return $true
        }
      } catch { continue }
    }
  }
  Write-Host "  SKIP $destRel" -ForegroundColor Yellow
  return $false
}

Write-Host "==> game-icons.net via jsDelivr / GitHub" -ForegroundColor Cyan
$ok = 0; $fail = 0
foreach ($destRel in $iconMap.Keys) {
  if (Download-Icon $destRel $iconMap[$destRel]) { $ok++ } else { $fail++ }
}
Write-Host "  Downloaded: $ok / $($iconMap.Count)" -ForegroundColor Cyan

Write-Host "`n==> Kenney Micro Roguelike (optional)" -ForegroundColor Cyan
$microDir = Join-Path $root 'assets\micro-roguelike'
$zip = Join-Path $root 'assets\micro-roguelike.zip'
$kenneyUrls = @(
  'https://kenney.nl/media/pages/assets/micro-roguelike/kenney_microroguelike.zip',
  'https://github.com/KenneyNL/Assets/raw/main/2D/Micro%20Roguelike/kenney_microroguelike.zip'
)
$kenneyOk = $false
foreach ($url in $kenneyUrls) {
  try {
    Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing -TimeoutSec 90
    Expand-Archive -Path $zip -DestinationPath $microDir -Force
    Remove-Item $zip -Force
    Write-Host "  OK Micro Roguelike" -ForegroundColor Green
    $kenneyOk = $true
    break
  } catch {
    Write-Host "  try failed: $url" -ForegroundColor DarkYellow
  }
}
if (-not $kenneyOk) { Write-Host "  SKIP Kenney (download manually from kenney.nl/assets/micro-roguelike)" -ForegroundColor Yellow }

Write-Host ""
Write-Host "Done. Refresh game with Ctrl+F5." -ForegroundColor Green
Write-Host "Credits: assets/CREDITS.md"
