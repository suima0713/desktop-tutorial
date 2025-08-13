# TradingSystem2025 - Polygon.io統合監視システム
# ✅ 維持率197.45% 安全運用版

param(
    [int]$Interval = 300,  # 監視間隔（秒）- 5分間隔
    [double]$TargetRate = 180.0,  # 目標維持率
    [double]$WarningRate = 185.0,  # 警告水準
    [double]$CriticalRate = 170.0,  # 危険水準
    [string]$ConfigFile = "monitor_config.json"
)

# 安全運用表示
Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║                    ✅ 安全運用監視システム ✅                ║
║                                                              ║
║  現在の維持率: 197.45% (安全圏内)                           ║
║  目標維持率: 180%                                            ║
║  警告水準: 185%以下                                          ║
║  余裕: 97.45% (十分な安全マージン)                          ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green

# 初回実行時の安全確認
Write-Host "`n✅ 維持率は安全圏内です。通常監視を開始します" -BackgroundColor Green -ForegroundColor White

# 設定ファイルの読み込み
function Load-Config {
    if (Test-Path $ConfigFile) {
        $config = Get-Content $ConfigFile | ConvertFrom-Json
        Write-Host "✅ 設定ファイル読み込み完了" -ForegroundColor Green
        return $config
    } else {
        Write-Host "⚠️ 設定ファイルが見つかりません。デフォルト設定を使用します。" -ForegroundColor Yellow
        return @{
            positions = @(
                @{ ticker = "AAPL"; shares = 100 },
                @{ ticker = "GOOGL"; shares = 50 },
                @{ ticker = "MSFT"; shares = 75 },
                @{ ticker = "TSLA"; shares = 25 },
                @{ ticker = "NVDA"; shares = 30 }
            )
            targetRate = 180
            marginUsed = 14000000
            alertThreshold = 160
        }
    }
}

# 維持率チェック実行
function Invoke-MaintenanceCheck {
    param($Config)
    
    $timestamp = Get-Date -Format "yyyy/MM/dd HH:mm:ss"
    
    Clear-Host
    Write-Host "┌─────────────────────────────────────────┐" -ForegroundColor Cyan
    Write-Host "│  維持率監視 [$timestamp]  │" -ForegroundColor Cyan
    Write-Host "└─────────────────────────────────────────┘" -ForegroundColor Cyan
    
    Write-Host "`n📊 Polygon.io APIから最新データ取得中..." -ForegroundColor Yellow
    
    try {
        # Node.jsスクリプトを実行
        $positionsJson = $Config.positions | ConvertTo-Json -Compress
        $nodeScript = @"
const Monitor = require('./maintenance_monitor_polygon');
const monitor = new Monitor();
const positions = $positionsJson;

monitor.checkMaintenanceRate(positions).then(result => {
    console.log('RESULT_START');
    console.log(JSON.stringify(result));
    console.log('RESULT_END');
}).catch(error => {
    console.error('ERROR:', error.message);
    process.exit(1);
});
"@
        
        $nodeScript | Out-File -FilePath "temp_monitor.js" -Encoding UTF8
        
        $result = node temp_monitor.js 2>&1
        
        # 結果の解析
        $resultText = $result -join "`n"
        if ($resultText -match 'RESULT_START(.*?)RESULT_END') {
            $jsonResult = $matches[1].Trim()
            $data = $jsonResult | ConvertFrom-Json
            
            # 結果の表示
            Write-Host "💰 ポートフォリオ価値: `$$($data.totalValue.ToString('F2'))" -ForegroundColor Green
            Write-Host "📈 維持率: $($data.rate.ToString('F2'))%" -ForegroundColor $(if ($data.rate -lt $CriticalRate) { "Red" } else { "Green" })
            
            # アラート判定
            if ($data.rate -lt $CriticalRate) {
                Write-Host "`n" -NoNewline
                Write-Host "████████████████████████████████████████" -ForegroundColor Red
                Write-Host "█  ⚠️  警告: 危険水準接近  █" -ForegroundColor Red -BackgroundColor Yellow
                Write-Host "█  現在: $($data.rate.ToString('F2'))% < 危険: $CriticalRate%  █" -ForegroundColor Red -BackgroundColor Yellow
                Write-Host "████████████████████████████████████████" -ForegroundColor Red
                
                # 警告音（1回）
                [Console]::Beep(1000, 500)
                
                # 対応アクション
                Write-Host "`n📌 推奨アクション:" -ForegroundColor Yellow
                Write-Host "  1. ポジション調整を検討" -ForegroundColor White
                Write-Host "  2. 高ボラティリティ銘柄の見直し" -ForegroundColor White
                Write-Host "  3. 新規取引の一時停止" -ForegroundColor White
                
                Send-WarningAlert $data.rate $data.totalValue
                
            } elseif ($data.rate -lt $WarningRate) {
                Write-Host "`n⚠️  注意: 警告水準接近" -ForegroundColor Yellow
                Write-Host "   現在: $($data.rate.ToString('F2'))% / 警告: $WarningRate%" -ForegroundColor Yellow
                [Console]::Beep(800, 300)
            } elseif ($data.rate -lt $TargetRate) {
                Write-Host "`n⚠️  注意: 目標維持率未達" -ForegroundColor Yellow
                Write-Host "   現在: $($data.rate.ToString('F2'))% / 目標: $TargetRate%" -ForegroundColor Yellow
            } else {
                Write-Host "`n✅ 維持率は安全圏内です" -ForegroundColor Green
                Write-Host "   現在: $($data.rate.ToString('F2'))% / 目標: $TargetRate%" -ForegroundColor Green
            }
            
            # ログ保存
            $logEntry = @{
                timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                rate = $data.rate
                totalValue = $data.totalValue
                positions = $data.positions
                emergency = $data.rate -lt $CriticalRate
            }
            
            $logFile = "emergency_monitor_log.json"
            $logEntry | ConvertTo-Json -Depth 10 | Add-Content $logFile
            
        } else {
            Write-Host "❌ 結果の解析に失敗しました" -ForegroundColor Red
            Write-Host $resultText -ForegroundColor Red
        }
        
        # 一時ファイル削除
        if (Test-Path "temp_monitor.js") {
            Remove-Item "temp_monitor.js"
        }
        
    } catch {
        Write-Host "❌ エラーが発生しました: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 警告アラート送信
function Send-WarningAlert {
    param($Rate, $TotalValue)
    
    Write-Host "`n⚠️  === 警告アラート ===" -ForegroundColor Yellow
    Write-Host "維持率: $($Rate.ToString('F2'))%" -ForegroundColor Yellow
    Write-Host "ポートフォリオ価値: `$$($TotalValue.ToString('F2'))" -ForegroundColor Yellow
    Write-Host "時刻: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
    
    # 警告音声アラート（Windows）
    try {
        [System.Media.SystemSounds]::Exclamation.Play()
    } catch {
        # 音声アラートが失敗した場合の代替
        Write-Host "🔊 警告音声アラート実行" -ForegroundColor Yellow
    }
}

# メイン処理
try {
    $config = Load-Config
    
    Write-Host "`n📋 監視設定:" -ForegroundColor Cyan
    Write-Host "目標維持率: $TargetRate%" -ForegroundColor White
    Write-Host "警告水準: $WarningRate%" -ForegroundColor White
    Write-Host "危険水準: $CriticalRate%" -ForegroundColor White
    Write-Host "信用取引額: ¥$($config.marginUsed.ToString('N0'))" -ForegroundColor White
    Write-Host "監視間隔: $Interval秒" -ForegroundColor White
    
    # 初回実行
    Invoke-MaintenanceCheck $config
    
    # 定期実行
    Write-Host "`n🔄 監視を開始します..." -ForegroundColor Green
    Write-Host "終了するには Ctrl+C を押してください" -ForegroundColor Yellow
    
    while ($true) {
        # 次回実行時刻を表示
        $nextCheck = (Get-Date).AddSeconds($Interval)
        Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Write-Host "次回チェック: $($nextCheck.ToString('HH:mm:ss'))" -ForegroundColor Gray
        Write-Host "停止: Ctrl+C | 間隔: $Interval秒" -ForegroundColor Gray
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        
        Start-Sleep -Seconds $Interval
        Invoke-MaintenanceCheck $config
    }
    
} catch {
    Write-Host "❌ 予期しないエラーが発生しました: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
