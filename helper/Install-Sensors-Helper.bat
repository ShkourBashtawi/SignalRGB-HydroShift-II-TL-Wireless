@echo off
:: Installs the HydroShift Sensors helper (starts hidden at sign-in).
net session >nul 2>&1
if errorlevel 1 (
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Setup-HydroShiftSensors.ps1" -Install
echo.
pause
