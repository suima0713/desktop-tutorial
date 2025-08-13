@echo off
chcp 65001 >nul
title SystemVoice 機能テスト

echo.
echo ========================================
echo    SystemVoice 機能テスト
echo ========================================
echo.

echo 🚀 SystemVoice機能のテストを開始します...
echo.

REM Node.jsがインストールされているかチェック
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.jsがインストールされていません
    echo Node.jsをインストールしてから再実行してください
    pause
    exit /b 1
)

echo ✅ Node.js が利用可能です
echo.

REM 必要なファイルが存在するかチェック
if not exist "system_voice.js" (
    echo ❌ system_voice.js が見つかりません
    echo ファイルが正しいディレクトリにあるか確認してください
    pause
    exit /b 1
)

if not exist "test_system_voice.js" (
    echo ❌ test_system_voice.js が見つかりません
    echo ファイルが正しいディレクトリにあるか確認してください
    pause
    exit /b 1
)

echo ✅ 必要なファイルが確認できました
echo.

echo 📋 テストオプション:
echo 1. 自動テスト (推奨)
echo 2. 対話的テスト
echo 3. Webインターフェースを開く
echo 4. 統合テスト
echo 5. 終了
echo.

set /p choice="選択してください (1-5): "

if "%choice%"=="1" (
    echo.
    echo 🧪 自動テストを実行します...
    node test_system_voice.js
    echo.
    echo ✅ 自動テストが完了しました
    pause
    goto :eof
)

if "%choice%"=="2" (
    echo.
    echo 🎮 対話的テストを開始します...
    echo コマンド入力が可能になります
    echo.
    node test_system_voice.js --interactive
    goto :eof
)

if "%choice%"=="3" (
    echo.
    echo 🌐 Webインターフェースを開きます...
    if exist "index.html" (
        start index.html
        echo ✅ index.html をブラウザで開きました
        echo ブラウザでSystemVoice機能をテストしてください
    ) else (
        echo ❌ index.html が見つかりません
    )
    pause
    goto :eof
)

if "%choice%"=="4" (
    echo.
    echo 🔗 統合テストを実行します...
    if exist "integrate_system_voice.js" (
        node integrate_system_voice.js
        echo.
        echo ✅ 統合テストが完了しました
    ) else (
        echo ❌ integrate_system_voice.js が見つかりません
    )
    pause
    goto :eof
)

if "%choice%"=="5" (
    echo.
    echo 👋 テストを終了します
    goto :eof
)

echo.
echo ❌ 無効な選択です
pause
goto :eof
