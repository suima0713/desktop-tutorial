# TradingSystem2025 完全自動起動スクリプト
# PowerShell 7.x 対応

param(
    [switch]$SkipN8n,
    [switch]$SkipTest,
    [switch]$Force
)

# カラー出力用関数
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Title)
    Write-ColorOutput "`n" "Cyan"
    Write-ColorOutput "=" * 60 "Cyan"
    Write-ColorOutput "  $Title" "Cyan"
    Write-ColorOutput "=" * 60 "Cyan"
    Write-ColorOutput "`n" "Cyan"
}

function Write-Success { param([string]$Message) Write-ColorOutput "✅ $Message" "Green" }
function Write-Error { param([string]$Message) Write-ColorOutput "❌ $Message" "Red" }
function Write-Warning { param([string]$Message) Write-ColorOutput "⚠️ $Message" "Yellow" }
function Write-Info { param([string]$Message) Write-ColorOutput "ℹ️ $Message" "Blue" }

# スクリプト開始
Write-Header "🚀 TradingSystem2025 完全自動起動システム"

# 現在のディレクトリを取得
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Info "作業ディレクトリ: $scriptDir"

# 1. 環境チェック
Write-Header "🔍 環境チェック"

# .envファイル確認
if (Test-Path ".env") {
    Write-Success ".envファイルが見つかりました"
} else {
    Write-Error ".envファイルが見つかりません"
    Write-Info "BRAVE_API_KEYを設定してください"
    Write-Info "例: BRAVE_API_KEY=your_api_key_here"
    
    if (-not $Force) {
        $response = Read-Host "続行しますか? (y/n)"
        if ($response -ne 'y') {
            exit 1
        }
    }
}

# Node.js確認
try {
    $nodeVersion = node --version
    Write-Success "Node.js: $nodeVersion"
} catch {
    Write-Error "Node.jsがインストールされていません"
    Write-Info "https://nodejs.org/ からインストールしてください"
    exit 1
}

# npm確認
try {
    $npmVersion = npm --version
    Write-Success "npm: $npmVersion"
} catch {
    Write-Error "npmが利用できません"
    exit 1
}

# 2. ファイル配置確認
Write-Header "📁 ファイル配置確認"

# mcp_server.js確認
if (Test-Path "mcp_server.js") {
    Write-Success "mcp_server.js: 存在"
} else {
    Write-Error "mcp_server.js: 見つかりません"
    Write-Info "プロジェクトディレクトリ内に配置してください"
    exit 1
}

# package.json確認
if (Test-Path "package.json") {
    Write-Success "package.json: 存在"
} else {
    Write-Error "package.json: 見つかりません"
    exit 1
}

# 3. 依存関係インストール
Write-Header "📦 依存関係インストール"

Write-Info "npm install を実行中..."
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "依存関係のインストールが完了しました"
} else {
    Write-Error "依存関係のインストールに失敗しました"
    exit 1
}

# 4. HTTPサーバー起動
Write-Header "🌐 HTTPサーバー起動"

# 既存のプロセスを確認
$existingProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" }
if ($existingProcess) {
    Write-Warning "既存のNode.jsプロセスを検出しました"
    $response = Read-Host "終了しますか? (y/n)"
    if ($response -eq 'y') {
        Stop-Process -Name "node" -Force
        Start-Sleep -Seconds 2
    }
}

Write-Info "HTTPサーバーをポート3001で起動中..."
if (Test-Path "mcp_server.js") {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; node mcp_server.js" -WindowStyle Normal
    Write-Success "HTTPサーバーを起動しました"
} else {
    Write-Error "mcp_server.jsが見つかりません"
    exit 1
}

# サーバー起動待機
Write-Info "サーバー起動を待機中..."
Start-Sleep -Seconds 5

# 5. サーバー稼働確認
Write-Header "🔍 サーバー稼働確認"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get -TimeoutSec 10
    Write-Success "HTTPサーバー: 稼働中"
    Write-Info "ステータス: $($response.status)"
    Write-Info "ポート: $($response.port)"
} catch {
    Write-Error "HTTPサーバー: 起動失敗"
    Write-Info "手動で 'node mcp_server.js' を実行してください"
}

# 6. n8n起動（オプション）
if (-not $SkipN8n) {
    Write-Header "🔄 n8n起動"
    
    # n8nがインストールされているか確認
    try {
        $n8nVersion = n8n --version
        Write-Success "n8n: $n8nVersion"
        
        $response = Read-Host "n8nを起動しますか? (y/n)"
        if ($response -eq 'y') {
            Write-Info "n8nを起動中..."
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "n8n start" -WindowStyle Normal
            Write-Success "n8nを起動しました"
            Write-Info "ダッシュボード: http://localhost:5678"
        }
    } catch {
        Write-Warning "n8nがインストールされていません"
        $response = Read-Host "n8nをインストールしますか? (y/n)"
        if ($response -eq 'y') {
            Write-Info "n8nをインストール中..."
            npm install -g n8n
            if ($LASTEXITCODE -eq 0) {
                Write-Success "n8nのインストールが完了しました"
                Write-Info "手動で 'n8n start' を実行してください"
            } else {
                Write-Error "n8nのインストールに失敗しました"
            }
        }
    }
}

# 7. ワークフロー作成
Write-Header "📋 n8nワークフロー作成"

if (Test-Path "create_n8n_workflow.js") {
    Write-Info "n8nワークフローを作成中..."
    node create_n8n_workflow.js
    if ($LASTEXITCODE -eq 0) {
        Write-Success "n8nワークフローが作成されました"
    } else {
        Write-Error "n8nワークフローの作成に失敗しました"
    }
} else {
    Write-Warning "create_n8n_workflow.jsが見つかりません"
}

# 8. システムテスト
if (-not $SkipTest) {
    Write-Header "🧪 システムテスト"
    
    if (Test-Path "test_all_systems.js") {
        Write-Info "システム統合テストを実行中..."
        node test_all_systems.js
    } else {
        Write-Warning "test_all_systems.jsが見つかりません"
    }
}

# 9. 起動完了
Write-Header "🎉 システム起動完了"

Write-Success "TradingSystem2025が正常に起動しました！"
Write-ColorOutput "`n📊 システムダッシュボード:" "Cyan"
Write-ColorOutput "   🌐 HTTPサーバー: http://localhost:3001/health" "White"
Write-ColorOutput "   🔍 検索API: http://localhost:3001/search" "White"
Write-ColorOutput "   🔄 n8n (オプション): http://localhost:5678" "White"

Write-ColorOutput "`n📋 次のステップ:" "Cyan"
Write-ColorOutput "   1. ブラウザで http://localhost:3001/health にアクセス" "White"
Write-ColorOutput "   2. n8nを使用する場合: http://localhost:5678 でワークフローをインポート" "White"
Write-ColorOutput "   3. テスト実行: node test_all_systems.js" "White"

Write-ColorOutput "`n💡 ヘルプ:" "Cyan"
Write-ColorOutput "   - システム停止: Ctrl+C または タスクマネージャーでnodeプロセスを終了" "White"
Write-ColorOutput "   - ログ確認: logs/ ディレクトリ" "White"
Write-ColorOutput "   - 設定変更: .envファイルを編集" "White"

Write-ColorOutput "`n🚀 システムは完全自動化モードで稼働中です！" "Green"
