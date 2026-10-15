# Builds the plugins and puts them in SignalRGB's own Plugins folder, so a
# change can be tried in SignalRGB without pushing it to GitHub.
#
#   Deploy-Local.ps1            build + copy
#   Deploy-Local.ps1 -Restart   build + copy + restart SignalRGB
#   Deploy-Local.ps1 -Remove    delete the local copies again (go back to the add-on)

param(
	[switch]$Restart,
	[switch]$Remove
)

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot
$files = @("LianLi_HydroShift_II_Wireless.js", "LianLi_Wireless_RX_Finder.js")
# SignalRGB keeps its user folder in the registry (it can be on OneDrive, or
# moved at install); fall back to Documents\WhirlwindFX.
$userDir = (Get-ItemProperty "HKCU:\Software\WhirlwindFX\SignalRgb" -Name UserDirectory -ErrorAction SilentlyContinue).UserDirectory
if (-not $userDir) {
	$userDir = Join-Path ([Environment]::GetFolderPath("MyDocuments")) "WhirlwindFX"
}
$plugins = Join-Path $userDir "Plugins"

function Restart-SignalRgb {
	$proc = Get-Process SignalRgb -ErrorAction SilentlyContinue | Select-Object -First 1
	$launcher = $null
	if ($proc -and $proc.Path) {
		$launcher = Join-Path (Split-Path -Parent (Split-Path -Parent $proc.Path)) "SignalRgbLauncher.exe"
	}
	if (-not $launcher -or -not (Test-Path $launcher)) {
		$launcher = Get-ChildItem "$env:LOCALAPPDATA\VortxEngine\app-*\SignalRgbLauncher.exe" -ErrorAction SilentlyContinue |
			Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
	}
	Write-Host "Stopping SignalRGB..."
	Get-Process SignalRgb, SignalRgbLauncher -ErrorAction SilentlyContinue | Stop-Process -Force
	Start-Sleep -Seconds 2
	if ($launcher) {
		Write-Host "Starting SignalRGB..."
		Start-Process $launcher
	} else {
		Write-Warning "SignalRgbLauncher.exe not found. Start SignalRGB yourself."
	}
}

if ($Remove) {
	foreach ($f in $files) {
		$p = Join-Path $plugins $f
		if (Test-Path $p) {
			Remove-Item $p -Force
			Write-Host "Removed $p"
		}
	}
	Write-Host "Local copies removed. Re-add the add-on in SignalRGB -> Settings -> Add-ons."
	if ($Restart) { Restart-SignalRgb }
	exit 0
}

# The add-on and a local copy are the same plugin: both would claim the dongle.
$addon = Get-ChildItem "$env:LOCALAPPDATA\WhirlwindFX\SignalRgb\cache\addons" -Recurse -Filter $files[0] -ErrorAction SilentlyContinue
if ($addon) {
	Write-Warning "The GitHub add-on is still installed:"
	$addon | ForEach-Object { Write-Warning "  $($_.FullName)" }
	Write-Warning "Remove it in SignalRGB -> Settings -> Add-ons, or both copies fight over the dongle."
}

Write-Host "Building..."
Push-Location $repo
try {
	python build.py
	if ($LASTEXITCODE -ne 0) { throw "build.py failed ($LASTEXITCODE)" }
} finally {
	Pop-Location
}

New-Item -ItemType Directory -Force $plugins | Out-Null
foreach ($f in $files) {
	Copy-Item (Join-Path $repo $f) (Join-Path $plugins $f) -Force
	Write-Host "Copied $f -> $plugins"
}

if ($Restart) {
	Restart-SignalRgb
} else {
	Write-Host "Done. Restart SignalRGB (tray icon -> Exit, then open it) to load the new version, or run with -Restart."
}
