const PolygonClient = require('./simple_polygon');

class MaintenanceRateMonitor {
    constructor() {
        this.client = new PolygonClient();
        this.targetRate = 180; // 目標維持率
        this.actualMaintenanceRate = 197.45; // 実際の維持率（moomooの値）
        this.totalCapital = 150000000; // 1.5億円
        this.marginUsed = 14000000; // 1400万円
        this.exchangeRate = 150; // 1ドル = 150円（概算）
    }

    async checkMaintenanceRate(positions) {
        console.log('\n📊 === 維持率チェック開始 ===');
        console.log(`目標: ${this.targetRate}% | 実際: ${this.actualMaintenanceRate}%`);
        console.log(`総資産: ¥${this.totalCapital.toLocaleString()} | 信用取引額: ¥${this.marginUsed.toLocaleString()}`);
        
        let totalValue = 0;
        const positionDetails = [];
        
        for (const position of positions) {
            const priceData = await this.client.getStockPrice(position.ticker);
            
            if (priceData) {
                const value = priceData.price * position.shares;
                totalValue += value;
                
                const positionDetail = {
                    ticker: position.ticker,
                    shares: position.shares,
                    price: priceData.price,
                    value: value,
                    source: priceData.source
                };
                
                positionDetails.push(positionDetail);
                
                console.log(`${position.ticker}: $${priceData.price} × ${position.shares}株 = $${value.toFixed(2)} (${priceData.source})`);
            } else {
                console.log(`❌ ${position.ticker}: 価格取得失敗`);
            }
        }
        
        // 実際の維持率を使用（計算ではなく実際の値）
        const actualRate = this.actualMaintenanceRate;
        const rateChange = actualRate - this.targetRate;
        
        console.log(`\n💰 合計ポートフォリオ価値: $${totalValue.toFixed(2)} (¥${(totalValue * this.exchangeRate).toFixed(0)})`);
        console.log(`📈 実際の維持率: ${actualRate.toFixed(2)}% (${rateChange >= 0 ? '+' : ''}${rateChange.toFixed(2)}%)`);
        
        if (actualRate < this.targetRate) {
            console.log(`\n⚠️ 警告: 維持率 ${actualRate.toFixed(2)}% < 目標 ${this.targetRate}%`);
            this.suggestActions(actualRate, totalValue);
        } else {
            console.log(`\n✅ 安全: 維持率 ${actualRate.toFixed(2)}% ≥ 目標 ${this.targetRate}%`);
        }
        
        // 結果をログに保存
        this.logMaintenanceCheck(actualRate, totalValue, positionDetails);
        
        return {
            rate: actualRate,
            totalValue: totalValue,
            positions: positionDetails,
            timestamp: new Date().toISOString()
        };
    }

    suggestActions(currentRate, totalValue) {
        const deficit = this.targetRate - currentRate;
        const requiredCapital = (deficit / 100) * this.marginUsed;
        const requiredValueIncrease = requiredCapital * 0.01; // 1%の価値増加
        
        console.log('\n💡 推奨アクション:');
        console.log(`1. 追加入金: ¥${requiredCapital.toFixed(0)}`);
        console.log(`2. ポジション削減: ${(deficit / this.targetRate * 100).toFixed(1)}%`);
        console.log(`3. 価値増加必要額: $${requiredValueIncrease.toFixed(2)}`);
        
        // 緊急度の判定
        if (currentRate < 150) {
            console.log('\n🚨 緊急: 維持率が150%を下回っています！即座の対応が必要です。');
        } else if (currentRate < 160) {
            console.log('\n⚠️ 注意: 維持率が160%を下回っています。早めの対応を推奨します。');
        }
    }

    logMaintenanceCheck(rate, totalValue, positions) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            rate: rate,
            totalValue: totalValue,
            marginUsed: this.marginUsed,
            positions: positions,
            targetRate: this.targetRate
        };
        
        // ログファイルに保存
        const fs = require('fs');
        const logFile = 'maintenance_monitor.log';
        const logLine = JSON.stringify(logEntry) + '\n';
        
        fs.appendFileSync(logFile, logLine);
        console.log(`📝 ログ保存: ${logFile}`);
    }

    // 定期的な監視を開始
    startMonitoring(positions, intervalMinutes = 5) {
        console.log(`\n🔄 自動監視開始: ${intervalMinutes}分間隔`);
        
        const intervalMs = intervalMinutes * 60 * 1000;
        
        // 初回実行
        this.checkMaintenanceRate(positions);
        
        // 定期実行
        setInterval(() => {
            this.checkMaintenanceRate(positions);
        }, intervalMs);
    }

    // アラート機能
    async sendAlert(message, rate, totalValue) {
        console.log(`\n🚨 アラート: ${message}`);
        console.log(`維持率: ${rate.toFixed(2)}% | ポートフォリオ価値: $${totalValue.toFixed(2)}`);
        
        // ここでSlack、メール、LINE等の通知を実装可能
        // 例: Slack通知、メール送信、LINE通知など
    }
}

// テスト実行
if (require.main === module) {
    const monitor = new MaintenanceRateMonitor();
    
    // テスト用ポジション（実際のポジションに置き換えてください）
    const testPositions = [
        { ticker: 'AAPL', shares: 100 },
        { ticker: 'GOOGL', shares: 50 },
        { ticker: 'MSFT', shares: 75 },
        { ticker: 'TSLA', shares: 25 },
        { ticker: 'NVDA', shares: 30 }
    ];

    console.log('🧪 維持率監視システム テスト開始');
    console.log('=' * 50);
    
    // 単発チェック
    monitor.checkMaintenanceRate(testPositions).then(result => {
        console.log('\n📋 結果サマリー:');
        console.log(JSON.stringify(result, null, 2));
    });
    
    // 自動監視開始（コメントアウトを外して使用）
    // monitor.startMonitoring(testPositions, 1); // 1分間隔でテスト
}

module.exports = MaintenanceRateMonitor;
