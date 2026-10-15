@echo off
rem Build the plugins, copy them into SignalRGB's Plugins folder and restart SignalRGB.
rem Pass -Remove to delete the local copies again.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Deploy-Local.ps1" -Restart %*
pause
