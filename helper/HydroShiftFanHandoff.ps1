<#
HydroShift Fan Handoff
Wireless UNI FAN TL fans only spin when something talks to the L-Wireless dongle.
SignalRGB starts after you sign in, so the fans stand still until then.

This lets L-Connect Service run the fans from boot (its own curves), then stops it
as soon as SignalRGB is running so SignalRGB can take the dongle. If SignalRGB
does not start, L-Connect Service keeps running and the fans keep their curves.
Started at sign-in by a scheduled task (see Setup-FanHandoff.ps1).
#>
param([int]$TimeoutMinutes = 15)

$ErrorActionPreference = "SilentlyContinue"
$Dir = Join-Path $env:LOCALAPPDATA "HydroShiftFanHandoff"
$LogFile = Join-Path $Dir "handoff.log"
New-Item -ItemType Directory -Path $Dir -Force | Out-Null

function Write-Log($msg) {
    $line = "{0}  {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

function Get-LConnectService {
    Get-CimInstance Win32_Service | Where-Object { $_.PathName -like "*L-Connect-Service.exe*" } | Select-Object -First 1
}

function Get-PluginStarts {
    $logs = Join-Path $env:LOCALAPPDATA "WhirlwindFX\SignalRgb\logs"
    $f = Get-ChildItem $logs -Filter "SignalRGB_*.log" | Where-Object { $_.Name -notlike "*.old.*" } |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $f) { return 0 }
    return @(Select-String -Path $f.FullName -Pattern "[LianLi] Plugin started" -SimpleMatch).Count
}

# Keep the log small.
if ((Test-Path $LogFile) -and (Get-Item $LogFile).Length -gt 200KB) {
    Get-Content $LogFile -Tail 200 | Set-Content $LogFile -Encoding UTF8
}

$svc = Get-LConnectService
if (-not $svc) { Write-Log "L-Connect Service is not installed. Nothing to do."; exit 0 }
Write-Log "Sign-in. L-Connect Service ($($svc.Name)) is $($svc.State). Waiting for SignalRGB..."

$deadline = (Get-Date).AddMinutes($TimeoutMinutes)
while ((Get-Date) -lt $deadline -and -not (Get-Process -Name "signalrgb")) {
    Start-Sleep -Seconds 1
}
if (-not (Get-Process -Name "signalrgb")) {
    Write-Log "SignalRGB did not start within $TimeoutMinutes min. Leaving L-Connect Service running (fans keep its curves)."
    exit 0
}

# Give SignalRGB a moment to finish starting, then hand the dongle over.
Start-Sleep -Seconds 3
$before = Get-PluginStarts
Stop-Service -Name $svc.Name -Force
Get-Process -Name "L-Connect-Service", "L-Connect 3" | Stop-Process -Force
Write-Log "SignalRGB is running. Stopped L-Connect Service."

# SignalRGB normally picks the devices up by itself once the service is gone.
$picked = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    if ((Get-PluginStarts) -gt $before) { $picked = $true; break }
}
if ($picked) {
    Write-Log "SignalRGB took over the wireless devices."
    exit 0
}

# It did not: restart SignalRGB as the normal (non-admin) user.
Write-Log "SignalRGB did not pick the devices up; restarting it."
$launcher = Join-Path $env:LOCALAPPDATA "VortxEngine\SignalRgbLauncher.exe"
Get-Process -Name "signalrgb" | Stop-Process -Force
Start-Sleep -Seconds 3
if (Test-Path $launcher) {
    Start-Process -FilePath "explorer.exe" -ArgumentList "`"$launcher`""
    Write-Log "SignalRGB restarted."
} else {
    Write-Log "SignalRGB launcher not found at $launcher. Start SignalRGB yourself."
}
