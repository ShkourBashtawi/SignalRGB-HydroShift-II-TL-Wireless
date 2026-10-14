@echo off
:: Lets L-Connect Service spin the wireless fans from boot, then hands the dongle to SignalRGB.
net session >nul 2>&1
if errorlevel 1 (
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Setup-FanHandoff.ps1" -Install
echo.
pause
