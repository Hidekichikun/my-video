@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0make_okami.ps1" > "%~dp0make_okami_log.txt" 2>&1
