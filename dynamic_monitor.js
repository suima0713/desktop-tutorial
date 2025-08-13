// dynamic_monitor.js - 維持率に応じた動的監視
const fs = require('fs');
const yaml = require('js-yaml');
const PolygonClient = require('./simple_polygon');

class DynamicMonitor {
    constructor() {
        this.loadConfig();
        this.polygonClient = new PolygonClient();
        this.currentInterval = null;
    }

    loadConfig() {
        try {
            const fileContents = fs.readFileSync('./config.yaml', 'utf8');
            this.config = yaml.load(fileContents);
            console.log('✅ 設定ファイル読み込み成功');
        } catch (e) {
            console.log('⚠️ config.yaml not found, using defaults');
            this.config = this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            maintenance_levels: {
                excellent: 190,
                good: 180,
                warning: 170,
                danger: 150,
                critical: 100
            },
            monitoring_intervals: {
                excellent: 1800,
                good: 900,
                warning: 300,
                danger: 60,
                critical: 30
            },
            current_status: {
                maintenance_rate: 197.45  // 正しい値に修正済み
            }
        };
    }

    determineInterval(maintenanceRate) {
        const levels = this.config.maintenance_levels;
        const intervals = this.config.monitoring_intervals;
        
        if (maintenanceRate >= levels.excellent) {
            return { interval: intervals.excellent, level: 'excellent', color: 'green' };
        } else if (maintenanceRate >= levels.good) {
            return { interval: intervals.good, level: 'good', color: 'green' };
        } else if (maintenanceRate >= levels.warning) {
            return { interval: intervals.warning, level: 'warning', color: 'yellow' };
        } else if (maintenanceRate >= levels.danger) {
            return { interval: intervals.danger, level: 'danger', color: 'red' };
        } else {
            return { interval: intervals.critical, level: 'critical', color: 'red' };
        }
    }

    async checkMaintenanceRate() {
        try {
            // 実際の維持率を取得
            const MaintenanceRateMonitor = require('./maintenance_monitor_polygon');
            const monitor = new MaintenanceRateMonitor();
            
            // テスト用ポジション（実際のポジションに置き換えてください）
            const testPositions = [
                { ticker: 'AAPL', shares: 100 },
                { ticker: 'GOOGL', shares: 50 },
                { ticker: 'MSFT', shares: 75 },
                { ticker: 'TSLA', shares: 25 },
                { ticker: 'NVDA', shares: 30 }
            ];
            
            const result = await monitor.checkMaintenanceRate(testPositions);
            const currentRate = result.rate;
            
            console.log(`\n📊 現在の維持率: ${currentRate}%`);
            
            const monitoring = this.determineInterval(currentRate);
            
            console.log(`📍 監視レベル: ${monitoring.level.toUpperCase()}`);
            console.log(`⏱️ 次回チェック: ${monitoring.interval}秒後`);
            
            // 設定を更新
            this.updateConfig(currentRate, monitoring.interval);
            
            return monitoring;
        } catch (error) {
            console.log('⚠️ 維持率取得エラー、設定値を使用:', error.message);
            
            // エラー時は設定値を使用
            const currentRate = this.config.current_status.maintenance_rate;
            const monitoring = this.determineInterval(currentRate);
            
            console.log(`📊 設定値の維持率: ${currentRate}%`);
            console.log(`📍 監視レベル: ${monitoring.level.toUpperCase()}`);
            
            return monitoring;
        }
    }

    updateConfig(rate, interval) {
        this.config.current_status.maintenance_rate = rate;
        this.config.current_status.last_update = new Date().toISOString();
        this.config.current_status.next_check = new Date(Date.now() + interval * 1000).toISOString();
        
        // config.yamlに保存
        try {
            const yamlStr = yaml.dump(this.config);
            fs.writeFileSync('./config.yaml', yamlStr, 'utf8');
        } catch (e) {
            console.log('⚠️ 設定ファイルの更新に失敗:', e.message);
        }
    }

    async startDynamicMonitoring() {
        console.log('🚀 動的監視システム起動');
        console.log('================================');
        
        const monitor = async () => {
            const result = await this.checkMaintenanceRate();
            
            // 次回の監視をスケジュール
            setTimeout(monitor, result.interval * 1000);
            
            console.log(`\n⏰ ${result.interval}秒後に再チェック...`);
            console.log('停止: Ctrl+C');
        };
        
        // 初回実行
        monitor();
    }
}

// メイン実行
if (require.main === module) {
    const monitor = new DynamicMonitor();
    monitor.startDynamicMonitoring();
}

module.exports = DynamicMonitor;
