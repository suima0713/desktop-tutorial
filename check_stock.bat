@echo off
chcp 65001 >nul
echo ================================
echo   Stock Quick Research Tool
echo ================================
echo.
set /p ticker=Enter stock ticker (e.g., NVDA): 

cd /d "%~dp0core"
python -c "from brave_search_trader import TradingIntelligence; ti = TradingIntelligence(); print(ti.investigate('%ticker%'))"

echo.
pause
