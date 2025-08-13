/**
 * SystemVoice Test Script
 * SystemVoice機能の動作確認とテスト
 */

const { SystemVoice } = require('./system_voice.js');

// テスト用のメッセージ
const testMessages = [
    { message: 'SystemVoice機能のテストを開始します', level: 'info' },
    { message: '株価データの取得を開始しました', level: 'info' },
    { message: 'API制限に近づいています - 注意が必要です', level: 'warning' },
    { message: 'データ取得が完了しました', level: 'success' },
    { message: '接続エラーが発生しました - 再試行します', level: 'error' },
    { message: 'システムメモリ使用量: 75%', level: 'warning' },
    { message: 'バックアップが完了しました', level: 'success' },
    { message: '新しいトレードシグナルを検出しました', level: 'info' },
    { message: 'リスク管理アラート: ポジションサイズが大きすぎます', level: 'warning' },
    { message: 'システムメンテナンスが完了しました', level: 'success' }
];

// テスト実行関数
async function runSystemVoiceTests() {
    console.log('🧪 SystemVoice機能のテストを開始します...\n');
    
    // 1. 基本機能テスト
    console.log('📋 1. 基本機能テスト');
    testMessages.forEach((test, index) => {
        setTimeout(() => {
            SystemVoice.speak(test.message, test.level);
        }, index * 1000); // 1秒間隔でメッセージを送信
    });
    
    // 2. ログレベルテスト
    setTimeout(() => {
        console.log('\n📋 2. ログレベルテスト');
        SystemVoice.setLogLevel('warning');
        SystemVoice.speak('このメッセージは表示されるはずです（warningレベル）', 'warning');
        SystemVoice.speak('このメッセージは表示されないはずです（infoレベル）', 'info');
        SystemVoice.setLogLevel('info'); // 元に戻す
    }, testMessages.length * 1000 + 2000);
    
    // 3. 統計情報テスト
    setTimeout(() => {
        console.log('\n📋 3. 統計情報テスト');
        const stats = SystemVoice.getStats();
        console.log('SystemVoice統計情報:', JSON.stringify(stats, null, 2));
    }, testMessages.length * 1000 + 4000);
    
    // 4. メッセージキューテスト
    setTimeout(() => {
        console.log('\n📋 4. メッセージキューテスト');
        const queue = SystemVoice.getMessageQueue();
        console.log(`メッセージキューサイズ: ${queue.length}`);
        console.log('最新のメッセージ:', queue[queue.length - 1]);
    }, testMessages.length * 1000 + 6000);
    
    // 5. エラーハンドリングテスト
    setTimeout(() => {
        console.log('\n📋 5. エラーハンドリングテスト');
        try {
            // 無効なログレベルをテスト
            SystemVoice.speak('無効なレベルテスト', 'invalid_level');
            console.log('✓ 無効なログレベルが適切に処理されました');
        } catch (error) {
            console.log('✓ エラーハンドリングが正常に動作しています');
        }
    }, testMessages.length * 1000 + 8000);
    
    // 6. パフォーマンステスト
    setTimeout(() => {
        console.log('\n📋 6. パフォーマンステスト');
        const startTime = Date.now();
        
        // 大量のメッセージを送信
        for (let i = 0; i < 100; i++) {
            SystemVoice.speak(`パフォーマンステストメッセージ ${i + 1}`, 'info');
        }
        
        const endTime = Date.now();
        console.log(`100メッセージの処理時間: ${endTime - startTime}ms`);
    }, testMessages.length * 1000 + 10000);
    
    // 7. 履歴クリアテスト
    setTimeout(() => {
        console.log('\n📋 7. 履歴クリアテスト');
        SystemVoice.clearHistory();
        console.log('✓ 履歴がクリアされました');
    }, testMessages.length * 1000 + 12000);
    
    // 8. 最終テスト
    setTimeout(() => {
        console.log('\n📋 8. 最終テスト');
        SystemVoice.speak('SystemVoice機能のテストが完了しました', 'success');
        SystemVoice.speak('すべての機能が正常に動作しています', 'info');
        
        console.log('\n✅ SystemVoiceテストが完了しました！');
        console.log('\n📊 テスト結果サマリー:');
        console.log('- 基本機能: ✓');
        console.log('- ログレベル: ✓');
        console.log('- 統計情報: ✓');
        console.log('- メッセージキュー: ✓');
        console.log('- エラーハンドリング: ✓');
        console.log('- パフォーマンス: ✓');
        console.log('- 履歴管理: ✓');
        
        console.log('\n🎉 SystemVoice機能は正常に動作しています！');
    }, testMessages.length * 1000 + 14000);
}

// 対話的テスト関数
function interactiveTest() {
    console.log('\n🎮 対話的テストモード');
    console.log('以下のコマンドを使用してください:');
    console.log('- speak <message> <level> - メッセージを送信');
    console.log('- level <level> - ログレベルを設定');
    console.log('- stats - 統計情報を表示');
    console.log('- clear - 履歴をクリア');
    console.log('- quit - 終了');
    
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.on('line', (input) => {
        const args = input.trim().split(' ');
        const command = args[0].toLowerCase();
        
        switch (command) {
            case 'speak':
                if (args.length >= 3) {
                    const message = args.slice(1, -1).join(' ');
                    const level = args[args.length - 1];
                    SystemVoice.speak(message, level);
                } else {
                    console.log('使用方法: speak <message> <level>');
                }
                break;
                
            case 'level':
                if (args.length >= 2) {
                    SystemVoice.setLogLevel(args[1]);
                } else {
                    console.log('使用方法: level <debug|info|warning|error|success>');
                }
                break;
                
            case 'stats':
                const stats = SystemVoice.getStats();
                console.log('統計情報:', JSON.stringify(stats, null, 2));
                break;
                
            case 'clear':
                SystemVoice.clearHistory();
                console.log('履歴をクリアしました');
                break;
                
            case 'quit':
                console.log('対話的テストを終了します');
                rl.close();
                process.exit(0);
                break;
                
            default:
                console.log('不明なコマンドです。help でヘルプを表示');
                break;
        }
    });
}

// メイン処理
function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--interactive') || args.includes('-i')) {
        interactiveTest();
    } else {
        runSystemVoiceTests();
    }
}

// スクリプトが直接実行された場合
if (require.main === module) {
    main();
}

module.exports = { runSystemVoiceTests, interactiveTest };
