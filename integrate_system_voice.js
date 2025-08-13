/**
 * SystemVoice Integration Script
 * 既存のJavaScriptファイルにSystemVoice機能を統合
 */

const fs = require('fs');
const path = require('path');

// SystemVoice機能を統合する対象ファイル
const targetFiles = [
    'simple_polygon.js',
    'dynamic_monitor.js',
    'maintenance_monitor_polygon.js',
    'stock_inquiry_handler.js',
    'emergency_action.js',
    'test_all_systems.js'
];

// SystemVoice統合用のテンプレート
const systemVoiceIntegration = `
// SystemVoice機能の統合
const { SystemVoice } = require('./system_voice.js');

// 既存のログ出力をSystemVoiceに置き換え
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = function(...args) {
    originalConsoleLog.apply(console, args);
    if (SystemVoice) {
        SystemVoice.speak(args.join(' '), 'info');
    }
};

console.error = function(...args) {
    originalConsoleError.apply(console, args);
    if (SystemVoice) {
        SystemVoice.speak(args.join(' '), 'error');
    }
};

console.warn = function(...args) {
    originalConsoleWarn.apply(console, args);
    if (SystemVoice) {
        SystemVoice.speak(args.join(' '), 'warning');
    }
};

// システム開始時のメッセージ
SystemVoice.speak('システムが起動しました', 'success');
`;

// ファイルにSystemVoice統合を追加する関数
function integrateSystemVoice(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 既に統合されているかチェック
        if (content.includes('SystemVoice')) {
            console.log(`✓ ${filePath} は既にSystemVoice統合済み`);
            return;
        }
        
        // ファイルの先頭にSystemVoice統合コードを追加
        const newContent = systemVoiceIntegration + '\n' + content;
        
        // バックアップを作成
        const backupPath = filePath + '.backup';
        fs.writeFileSync(backupPath, content);
        
        // 新しい内容でファイルを更新
        fs.writeFileSync(filePath, newContent);
        
        console.log(`✓ ${filePath} にSystemVoice機能を統合しました`);
        console.log(`  バックアップ: ${backupPath}`);
        
    } catch (error) {
        console.error(`✗ ${filePath} の統合に失敗:`, error.message);
    }
}

// メイン処理
function main() {
    console.log('🚀 SystemVoice機能の統合を開始します...\n');
    
    targetFiles.forEach(fileName => {
        const filePath = path.join(__dirname, fileName);
        
        if (fs.existsSync(filePath)) {
            integrateSystemVoice(filePath);
        } else {
            console.log(`⚠ ${fileName} が見つかりません`);
        }
    });
    
    console.log('\n✅ SystemVoice統合が完了しました！');
    console.log('\n📝 次のステップ:');
    console.log('1. ブラウザで index.html を開いてテスト');
    console.log('2. Node.jsスクリプトを実行してSystemVoice機能を確認');
    console.log('3. 必要に応じてログレベルを調整');
}

// スクリプトが直接実行された場合
if (require.main === module) {
    main();
}

module.exports = { integrateSystemVoice, main };
