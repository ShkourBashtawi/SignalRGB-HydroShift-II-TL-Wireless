@echo off
:: Removes the HydroShift Sensors helper and its startup task.
net session >nul 2>&1
if errorlevel 1 (
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Setup-HydroShiftSensors.ps1" -Uninstall
echo.
pause
