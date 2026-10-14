<#
Installs / removes the HydroShift Fan Handoff. Run through Install-Fan-Handoff.bat /
Uninstall-Fan-Handoff.bat (they ask for admin rights).
Install: L-Connect Service starts with Windows (the Watcher stays disabled), and a
hidden task at sign-in stops it as soon as SignalRGB is running.
#>
param([switch]$Install, [switch]$Uninstall)

$ErrorActionPreference = "Stop"
$TaskName = "HydroShift Fan Handoff (SignalRGB)"
$Dest = Join-Path $env:LOCALAPPDATA "HydroShiftFanHandoff"
$Script = Join-Path $Dest "HydroShiftFanHandoff.ps1"

$svc = Get-CimInstance Win32_Service | Where-Object { $_.PathName -like "*L-Connect-Service.exe*" } | Select-Object -First 1
$watcher = Get-CimInstance Win32_Service | Where-Object { $_.PathName -like "*L-Connect-Service-Watcher.exe*" } | Select-Object -First 1

if ($Uninstall) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    if ($svc) {
        Stop-Service -Name $svc.Name -Force -ErrorAction SilentlyContinue
        Set-Service -Name $svc.Name -StartupType Disabled
    }
    Remove-Item -Recurse -Force $Dest -ErrorAction SilentlyContinue
    Write-Host "Fan Handoff removed. L-Connect Service is Disabled again." -ForegroundColor Green
    exit 0
}

if (-not $Install) { Write-Host "Use -Install or -Uninstall"; exit 1 }
if (-not $svc) { Write-Host "L-Connect Service is not installed (install L-Connect 3 first)." -ForegroundColor Red; exit 1 }

New-Item -ItemType Directory -Path $Dest -Force | Out-Null
Copy-Item -Path (Join-Path $PSScriptRoot "HydroShiftFanHandoff.ps1") -Destination $Script -Force

# L-Connect Service runs the fans from boot. The Watcher would restart the
# service after it is stopped, so it stays disabled.
Set-Service -Name $svc.Name -StartupType Automatic
if ($watcher) {
    Stop-Service -Name $watcher.Name -Force -ErrorAction SilentlyContinue
    Set-Service -Name $watcher.Name -StartupType Disabled
}

$psExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$taskArgs = "--headless `"$psExe`" -NoProfile -ExecutionPolicy Bypass -File `"$Script`""
$action = New-ScheduledTaskAction -Execute (Join-Path $env:SystemRoot "System32\conhost.exe") -Argument $taskArgs
$user = "$env:USERDOMAIN\$env:USERNAME"
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $user
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings `
    -Description "Lets L-Connect Service spin the wireless fans from boot, then hands the dongle to SignalRGB." -Force | Out-Null

Write-Host ""
Write-Host "Installed." -ForegroundColor Green
Write-Host "  L-Connect Service:          Automatic (runs the fans from boot)"
Write-Host "  L-Connect Service Watcher:  Disabled"
Write-Host "  Task: $TaskName (stops the service once SignalRGB runs)"
Write-Host ""
Write-Host "Restart Windows to test. Log: $Dest\handoff.log"
