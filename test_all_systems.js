const axios = require('axios');
const fs = require('fs');
const path = require('path');

// テスト設定
const CONFIG = {
    httpServer: 'http://localhost:3001',
    n8nServer: 'http://localhost:5678',
    timeout: 5000
};

// カラー出力用
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHttpServer() {
    log('\n🔍 HTTPサーバーテスト', 'blue');
    
    try {
        const health = await axios.get(`${CONFIG.httpServer}/health`, { timeout: CONFIG.timeout });
        log('✅ HTTPサーバー: 稼働中', 'green');
        log(`   📊 ステータス: ${health.data.status}`, 'green');
        log(`   🕐 時刻: ${health.data.timestamp}`, 'green');
        log(`   🔌 ポート: ${health.data.port}`, 'green');
        return true;
    } catch (e) {
        log('❌ HTTPサーバー: 停止中', 'red');
        log(`   💡 解決方法: node mcp_server.js で起動`, 'yellow');
        return false;
    }
}

async function testBraveAPI() {
    log('\n🔍 Brave API テスト', 'blue');
    
    try {
        const search = await axios.post(`${CONFIG.httpServer}/search`, {
            query: '日経平均'
        }, { timeout: CONFIG.timeout });
        
        if (search.data.success) {
            log('✅ Brave API: 接続成功', 'green');
            log(`   📊 検索結果: ${search.data.results.length}件`, 'green');
            log(`   🕐 タイムスタンプ: ${search.data.timestamp}`, 'green');
            
            // 最初の結果を表示
            if (search.data.results.length > 0) {
                const firstResult = search.data.results[0];
                log(`   📰 最新記事: ${firstResult.title}`, 'green');
            }
            return true;
        } else {
            log('❌ Brave API: 検索失敗', 'red');
            log(`   🔍 エラー: ${search.data.error}`, 'red');
            return false;
        }
    } catch (e) {
        log('❌ Brave API: 接続失敗', 'red');
        log(`   🔍 エラー: ${e.message}`, 'red');
        return false;
    }
}

async function testN8n() {
    log('\n🔍 n8n テスト', 'blue');
    
    try {
        await axios.get(CONFIG.n8nServer, { timeout: CONFIG.timeout });
        log('✅ n8n: 稼働中', 'green');
        log(`   🌐 ダッシュボード: ${CONFIG.n8nServer}`, 'green');
        return true;
    } catch (e) {
        log('⚠️ n8n: 未起動', 'yellow');
        log(`   💡 解決方法: npm install -g n8n && n8n start`, 'yellow');
        log(`   🌐 ダッシュボード: ${CONFIG.n8nServer}`, 'yellow');
        return false;
    }
}

function checkEnvironment() {
    log('\n🔍 環境チェック', 'blue');
    
    // .envファイルチェック
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        log('✅ .envファイル: 存在', 'green');
    } else {
        log('❌ .envファイル: 未発見', 'red');
        log('   💡 BRAVE_API_KEYを設定してください', 'yellow');
    }
    
    // n8nワークフローファイルチェック
    const workflowPath = path.join(__dirname, 'n8n_workflow.json');
    if (fs.existsSync(workflowPath)) {
        log('✅ n8nワークフロー: 作成済み', 'green');
    } else {
        log('❌ n8nワークフロー: 未作成', 'red');
        log('   💡 node create_n8n_workflow.js を実行してください', 'yellow');
    }
    
    // package.json依存関係チェック
    const packagePath = path.join(__dirname, 'package.json');
    if (fs.existsSync(packagePath)) {
        const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const requiredDeps = ['express', 'axios', 'cors'];
        const missingDeps = requiredDeps.filter(dep => !packageData.dependencies?.[dep]);
        
        if (missingDeps.length === 0) {
            log('✅ 依存関係: 完備', 'green');
        } else {
            log('❌ 依存関係: 不足', 'red');
            log(`   💡 不足: ${missingDeps.join(', ')}`, 'yellow');
            log('   💡 npm install を実行してください', 'yellow');
        }
    }
}

async function runPerformanceTest() {
    log('\n🔍 パフォーマンステスト', 'blue');
    
    const startTime = Date.now();
    try {
        await axios.post(`${CONFIG.httpServer}/search`, {
            query: 'パフォーマンステスト'
        }, { timeout: CONFIG.timeout });
        
        const responseTime = Date.now() - startTime;
        log(`✅ レスポンス時間: ${responseTime}ms`, 'green');
        
        if (responseTime < 1000) {
            log('   🚀 優秀なパフォーマンス', 'green');
        } else if (responseTime < 3000) {
            log('   ⚡ 良好なパフォーマンス', 'yellow');
        } else {
            log('   🐌 改善が必要', 'red');
        }
    } catch (e) {
        log('❌ パフォーマンステスト失敗', 'red');
    }
}

async function testAll() {
    log('🚀 TradingSystem2025 システム統合テスト開始', 'bold');
    log('=' * 50, 'blue');
    
    const results = {
        environment: true,
        httpServer: false,
        braveAPI: false,
        n8n: false,
        performance: false
    };
    
    // 環境チェック
    checkEnvironment();
    
    // HTTPサーバーテスト
    results.httpServer = await testHttpServer();
    
    // Brave API テスト
    if (results.httpServer) {
        results.braveAPI = await testBraveAPI();
    }
    
    // n8n テスト
    results.n8n = await testN8n();
    
    // パフォーマンステスト
    if (results.httpServer) {
        await runPerformanceTest();
        results.performance = true;
    }
    
    // 結果サマリー
    log('\n📊 テスト結果サマリー', 'bold');
    log('=' * 30, 'blue');
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    
    log(`✅ 成功: ${passedTests}/${totalTests}`, 'green');
    log(`❌ 失敗: ${totalTests - passedTests}/${totalTests}`, 'red');
    
    if (passedTests === totalTests) {
        log('\n🎉 全てのテストが成功しました！', 'green');
        log('🚀 システムは完全に稼働しています', 'green');
    } else {
        log('\n⚠️ 一部のテストが失敗しました', 'yellow');
        log('💡 上記の解決方法を確認してください', 'yellow');
    }
    
    // 次のステップ
    log('\n📋 次のステップ', 'bold');
    if (results.httpServer && results.braveAPI) {
        log('✅ 基本システム: 稼働中', 'green');
        if (results.n8n) {
            log('✅ n8n: 稼働中 - ワークフローをインポートしてください', 'green');
        } else {
            log('⚠️ n8n: 起動してワークフローを設定してください', 'yellow');
        }
    } else {
        log('❌ 基本システム: 修正が必要', 'red');
    }
}

// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
    log(`❌ 未処理のPromise拒否: ${reason}`, 'red');
});

// テスト実行
testAll().catch(error => {
    log(`❌ テスト実行エラー: ${error.message}`, 'red');
    process.exit(1);
});


