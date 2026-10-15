@echo off
rem Build the plugins, copy them into SignalRGB's Plugins folder and restart SignalRGB.
rem Remove-Local.bat deletes the local copies again.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Deploy-Local.ps1" -Restart %*
pause
