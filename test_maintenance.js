// test_maintenance.js - 維持率修正テストスクリプト
const MaintenanceRateMonitor = require('./maintenance_monitor_polygon');

async function testSystem() {
    console.log('=== 維持率修正テスト開始 ===\n');
    
    const monitor = new MaintenanceRateMonitor();
    const result = await monitor.checkMaintenanceRate([]);
    const rate = result.rate;
    
    console.log('\n=== テスト結果 ===');
    console.log(`取得された維持率: ${rate}%`);
    console.log(`期待値: 197.45%`);
    
    if (Math.abs(rate - 197.45) < 0.01) {
        console.log('✅ テスト成功！正しい維持率が表示されています');
        console.log('✅ システムは正常に動作しています');
    } else {
        console.error(`❌ テスト失敗！維持率が${rate}%と表示されています`);
        console.error('期待値: 197.45%');
        console.error('❌ 修正が必要です');
    }
    
    // 動的監視レベルも確認
    if (rate >= 190) {
        console.log('✅ 監視レベル: EXCELLENT (30分間隔)');
    } else if (rate >= 180) {
        console.log('✅ 監視レベル: GOOD (15分間隔)');
    } else if (rate >= 170) {
        console.log('⚠️ 監視レベル: WARNING (5分間隔)');
    } else if (rate >= 150) {
        console.log('⚠️ 監視レベル: DANGER (1分間隔)');
    } else {
        console.log('🚨 監視レベル: CRITICAL (30秒間隔)');
    }
}

testSystem();
