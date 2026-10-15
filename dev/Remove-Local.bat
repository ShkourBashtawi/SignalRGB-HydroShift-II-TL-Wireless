@echo off
rem Delete the local plugin copies from SignalRGB's Plugins folder and restart SignalRGB.
rem Afterwards re-add the add-on in SignalRGB -> Settings -> Add-ons.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Deploy-Local.ps1" -Remove -Restart
pause
