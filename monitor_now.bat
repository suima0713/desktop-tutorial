@echo off
title 維持率監視 - CRITICAL 93.04%
color 0C
echo ==========================================
echo    緊急: 維持率 93.04%% (危険水準)
echo ==========================================
echo.
echo 🚨 現在の維持率: 93.04%% (極めて危険)
echo 🎯 目標維持率: 180%%
echo ⚠️  マージンコール発動: 100%%以下
echo 💰 余裕: わずか 6.96%%
echo.
echo 📌 緊急アクション:
echo   1. ポジションを即座に20-30%%削減
echo   2. または追加入金（推奨: 2000万円以上）
echo   3. 高ボラティリティ銘柄の整理
echo   4. 全ての新規取引を停止
echo.
echo ==========================================
echo 緊急監視システムを起動します...
echo ==========================================
echo.
powershell -ExecutionPolicy Bypass -File auto_monitor_polygon.ps1
pause

