@echo off
chcp 65001 >nul
echo ================================
echo   DuckDB トレード分析
echo ================================
echo.

cd /d "%~dp0analysis"

echo 1. データ同期中...
python isp_connector.py

echo.
echo 2. 分析レポート生成中...
python trade_analytics.py

echo.
echo ✅ 分析完了！
echo.
pause
