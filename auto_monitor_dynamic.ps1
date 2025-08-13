# auto_monitor_dynamic.ps1 - 動的間隔での監視

# YAMLパーサー関数（簡易版）
function Read-Config {
    $config = @{}
    if (Test-Path ".\config.yaml") {
        $lines = Get-Content ".\config.yaml"
        # 簡易的なYAML読み込み（維持率のみ）
        foreach ($line in $lines) {
            if ($line -match "maintenance_rate:\s*(.+)") {
                $config.MaintenanceRate = [double]$matches[1]
            }
        }
    } else {
        $config.MaintenanceRate = 197.45
    }
    return $config
}

# 監視間隔を決定
function Get-MonitoringInterval {
    param([double]$rate)
    
    if ($rate -ge 190) { return @{Seconds=1800; Level="EXCELLENT"; Color="Green"} }
    elseif ($rate -ge 180) { return @{Seconds=900; Level="GOOD"; Color="Green"} }
    elseif ($rate -ge 170) { return @{Seconds=300; Level="WARNING"; Color="Yellow"} }
    elseif ($rate -ge 150) { return @{Seconds=60; Level="DANGER"; Color="Red"} }
    else { return @{Seconds=30; Level="CRITICAL"; Color="Red"} }
}

# メインループ
Write-Host @"
╔══════════════════════════════════════════╗
║   動的監視システム v2.0 - 効率運用モード  ║
╚══════════════════════════════════════════╝
"@ -ForegroundColor Cyan

while ($true) {
    Clear-Host
    
    # 設定読み込み
    $config = Read-Config
    $rate = $config.MaintenanceRate
    $monitoring = Get-MonitoringInterval -rate $rate
    
    # ヘッダー表示
    Write-Host "┌────────────────────────────────────┐" -ForegroundColor Cyan
    Write-Host "│  維持率: $rate% [$($monitoring.Level)]  │" -ForegroundColor $monitoring.Color
    Write-Host "└────────────────────────────────────┘" -ForegroundColor Cyan
    
    # Node.js監視実行
    Write-Host "`n📊 チェック実行中..." -ForegroundColor Yellow
    node maintenance_monitor_polygon.js
    
    # 次回チェック時刻
    $nextCheck = (Get-Date).AddSeconds($monitoring.Seconds)
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "監視レベル: $($monitoring.Level)" -ForegroundColor $monitoring.Color
    Write-Host "監視間隔: $($monitoring.Seconds)秒" -ForegroundColor White
    Write-Host "次回: $($nextCheck.ToString('HH:mm:ss'))" -ForegroundColor White
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    # 待機
    Start-Sleep -Seconds $monitoring.Seconds
}
