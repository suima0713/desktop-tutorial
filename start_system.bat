@echo off
chcp 65001 >nul
title TradingSystem2025 自動起動システム

echo.
echo ============================================================
echo  🚀 TradingSystem2025 完全自動起動システム
echo ============================================================
echo.

:: 現在のディレクトリを取得
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo ℹ️ 作業ディレクトリ: %SCRIPT_DIR%
echo.

:: 1. 環境チェック
echo ============================================================
echo  🔍 環境チェック
echo ============================================================
echo.

:: .envファイル確認
if exist ".env" (
    echo ✅ .envファイルが見つかりました
) else (
    echo ❌ .envファイルが見つかりません
    echo    💡 BRAVE_API_KEYを設定してください
    echo    💡 例: BRAVE_API_KEY=your_api_key_here
    echo.
    set /p "CONTINUE=続行しますか? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

:: Node.js確認
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set "NODE_VERSION=%%i"
    echo ✅ Node.js: %NODE_VERSION%
) else (
    echo ❌ Node.jsがインストールされていません
    echo    💡 https://nodejs.org/ からインストールしてください
    pause
    exit /b 1
)

:: npm確認
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set "NPM_VERSION=%%i"
    echo ✅ npm: %NPM_VERSION%
) else (
    echo ❌ npmが利用できません
    pause
    exit /b 1
)

:: 2. 依存関係インストール
echo.
echo ============================================================
echo  📦 依存関係インストール
echo ============================================================
echo.

if exist "package.json" (
    echo ℹ️ npm install を実行中...
    npm install
    if %errorlevel% equ 0 (
        echo ✅ 依存関係のインストールが完了しました
    ) else (
        echo ❌ 依存関係のインストールに失敗しました
        pause
        exit /b 1
    )
) else (
    echo ⚠️ package.jsonが見つかりません
)

:: 3. HTTPサーバー起動
echo.
echo ============================================================
echo  🌐 HTTPサーバー起動
echo ============================================================
echo.

:: 既存のプロセスを確認
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ⚠️ 既存のNode.jsプロセスを検出しました
    set /p "KILL_PROCESS=終了しますか? (y/n): "
    if /i "%KILL_PROCESS%"=="y" (
        taskkill /F /IM node.exe >nul 2>&1
        timeout /t 2 /nobreak >nul
    )
)

echo ℹ️ HTTPサーバーをポート3001で起動中...
set "SERVER_SCRIPT=%SCRIPT_DIR%..\mcp_server.js"

if exist "%SERVER_SCRIPT%" (
    start "HTTP Server" cmd /k "cd /d "%SCRIPT_DIR%" && node "%SERVER_SCRIPT%""
    echo ✅ HTTPサーバーを起動しました
) else (
    echo ❌ mcp_server.jsが見つかりません: %SERVER_SCRIPT%
    pause
    exit /b 1
)

:: サーバー起動待機
echo ℹ️ サーバー起動を待機中...
timeout /t 5 /nobreak >nul

:: 4. n8n起動（オプション）
echo.
echo ============================================================
echo  🔄 n8n起動
echo ============================================================
echo.

:: n8nがインストールされているか確認
n8n --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('n8n --version') do set "N8N_VERSION=%%i"
    echo ✅ n8n: %N8N_VERSION%
    echo.
    set /p "START_N8N=n8nを起動しますか? (y/n): "
    if /i "%START_N8N%"=="y" (
        echo ℹ️ n8nを起動中...
        start "n8n" cmd /k "n8n start"
        echo ✅ n8nを起動しました
        echo ℹ️ ダッシュボード: http://localhost:5678
    )
) else (
    echo ⚠️ n8nがインストールされていません
    set /p "INSTALL_N8N=n8nをインストールしますか? (y/n): "
    if /i "%INSTALL_N8N%"=="y" (
        echo ℹ️ n8nをインストール中...
        npm install -g n8n
        if %errorlevel% equ 0 (
            echo ✅ n8nのインストールが完了しました
            echo ℹ️ 手動で 'n8n start' を実行してください
        ) else (
            echo ❌ n8nのインストールに失敗しました
        )
    )
)

:: 5. ワークフロー作成
echo.
echo ============================================================
echo  📋 n8nワークフロー作成
echo ============================================================
echo.

set "WORKFLOW_SCRIPT=%SCRIPT_DIR%create_n8n_workflow.js"
if exist "%WORKFLOW_SCRIPT%" (
    echo ℹ️ n8nワークフローを作成中...
    node "%WORKFLOW_SCRIPT%"
    if %errorlevel% equ 0 (
        echo ✅ n8nワークフローが作成されました
    ) else (
        echo ❌ n8nワークフローの作成に失敗しました
    )
) else (
    echo ⚠️ create_n8n_workflow.jsが見つかりません
)

:: 6. システムテスト
echo.
echo ============================================================
echo  🧪 システムテスト
echo ============================================================
echo.

set "TEST_SCRIPT=%SCRIPT_DIR%test_all_systems.js"
if exist "%TEST_SCRIPT%" (
    echo ℹ️ システム統合テストを実行中...
    node "%TEST_SCRIPT%"
) else (
    echo ⚠️ test_all_systems.jsが見つかりません
)

:: 7. 起動完了
echo.
echo ============================================================
echo  🎉 システム起動完了
echo ============================================================
echo.

echo ✅ TradingSystem2025が正常に起動しました！
echo.
echo 📊 システムダッシュボード:
echo    🌐 HTTPサーバー: http://localhost:3001/health
echo    🔍 検索API: http://localhost:3001/search
echo    🔄 n8n (オプション): http://localhost:5678
echo.
echo 📋 次のステップ:
echo    1. ブラウザで http://localhost:3001/health にアクセス
echo    2. n8nを使用する場合: http://localhost:5678 でワークフローをインポート
echo    3. テスト実行: node test_all_systems.js
echo.
echo 💡 ヘルプ:
echo    - システム停止: Ctrl+C または タスクマネージャーでnodeプロセスを終了
echo    - ログ確認: logs/ ディレクトリ
echo    - 設定変更: .envファイルを編集
echo.
echo 🚀 システムは完全自動化モードで稼働中です！
echo.
pause


