@echo off
:: Shows live readings in this window (Ctrl+C to stop). Does not install anything.
:: A copy of the output is written to helper.log next to this file.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0HydroShiftSensors.ps1" -Console -LogDir "%~dp0."
pause
