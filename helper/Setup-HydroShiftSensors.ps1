<#
Installs / removes the HydroShift Sensors helper as a hidden task that starts
when you sign in to Windows. Run it through Install-Sensors-Helper.bat /
Uninstall-Sensors-Helper.bat (they ask for admin rights).
#>
param([switch]$Install, [switch]$Uninstall)

$ErrorActionPreference = "Stop"
$TaskName = "HydroShift Sensors (SignalRGB)"
$Dest = Join-Path $env:LOCALAPPDATA "HydroShiftSensors"
$Script = Join-Path $Dest "HydroShiftSensors.ps1"

function Stop-Helper {
    try { Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue } catch { }
    Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" |
        Where-Object { $_.CommandLine -like "*HydroShiftSensors.ps1*" -and $_.ProcessId -ne $PID } |
        ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

if ($Uninstall) {
    Stop-Helper
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force $Dest -ErrorAction SilentlyContinue
    Write-Host "HydroShift Sensors helper removed." -ForegroundColor Green
    exit 0
}

if (-not $Install) { Write-Host "Use -Install or -Uninstall"; exit 1 }

Stop-Helper
New-Item -ItemType Directory -Path $Dest -Force | Out-Null
Copy-Item -Path (Join-Path $PSScriptRoot "HydroShiftSensors.ps1") -Destination $Script -Force

$psExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$taskArgs = "--headless `"$psExe`" -NoProfile -ExecutionPolicy Bypass -File `"$Script`""
$action = New-ScheduledTaskAction -Execute (Join-Path $env:SystemRoot "System32\conhost.exe") -Argument $taskArgs
$user = "$env:USERDOMAIN\$env:USERNAME"
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $user
$principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings `
    -Description "Sends CPU/GPU temperature and load to the SignalRGB HydroShift II plugin (127.0.0.1:51870)." -Force | Out-Null
Start-ScheduledTask -TaskName $TaskName

Write-Host ""
Write-Host "Installed: $Script" -ForegroundColor Green
Write-Host "Task:      $TaskName (starts hidden at sign-in, running now)"
Write-Host ""
Write-Host "Test reading:" -ForegroundColor Cyan
& $psExe -NoProfile -ExecutionPolicy Bypass -File $Script -Once -Port 51871
Write-Host ""
Write-Host "Log: $Dest\helper.log"
Write-Host "For the real CPU temperature, run LibreHardwareMonitor with Options > Remote Web Server > Run."
