@echo off
title 動的監視システム v2.0
echo ====================================
echo   動的監視システムを起動します
echo   維持率に応じて監視間隔を自動調整
echo ====================================
echo.
echo 起動方法を選択:
echo 1. Node.js版（推奨）
echo 2. PowerShell版
echo.
set /p choice="選択 (1 or 2): "

if "%choice%"=="1" (
    node dynamic_monitor.js
) else (
    powershell -ExecutionPolicy Bypass -File auto_monitor_dynamic.ps1
)
pause
