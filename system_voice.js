/**
 * SystemVoice Module - Trading System 2025
 * システムに「声」を与える機能を提供
 * 
 * 使用方法:
 * import { SystemVoice } from './system_voice.js';
 * SystemVoice.speak('メッセージ', 'info');
 */

class SystemVoice {
    constructor() {
        this.isInitialized = false;
        this.messageQueue = [];
        this.maxHistorySize = 100;
        this.maxDisplayMessages = 50;
        this.logLevels = {
            'debug': 0,
            'info': 1,
            'warning': 2,
            'error': 3,
            'success': 1
        };
        this.currentLogLevel = 'info';
    }

    /**
     * システムメッセージを発話
     * @param {string} message - メッセージ内容
     * @param {string} level - ログレベル ('debug', 'info', 'warning', 'error', 'success')
     * @param {Object} options - 追加オプション
     */
    speak(message, level = 'info', options = {}) {
        // ログレベルのチェック
        if (this.logLevels[level] < this.logLevels[this.currentLogLevel]) {
            return;
        }

        const timestamp = new Date();
        const logEntry = {
            time: timestamp.getTime(),
            timestamp: timestamp.toISOString(),
            message: message,
            level: level,
            ...options
        };

        // 1. コンソールに記録
        this.logToConsole(logEntry);

        // 2. ローカルストレージに履歴保存
        this.saveToHistory(logEntry);

        // 3. 画面上に通知表示（ブラウザ環境の場合）
        if (typeof window !== 'undefined' && window.document) {
            this.displayNotification(logEntry);
        }

        // 4. 外部ログファイルに記録（Node.js環境の場合）
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
            this.logToFile(logEntry);
        }

        // 5. メッセージキューに追加（必要に応じて）
        this.addToQueue(logEntry);

        return logEntry;
    }

    /**
     * コンソールにログ出力
     */
    logToConsole(logEntry) {
        const levelColors = {
            'debug': '\x1b[36m',   // シアン
            'info': '\x1b[34m',    // 青
            'warning': '\x1b[33m', // 黄
            'error': '\x1b[31m',   // 赤
            'success': '\x1b[32m'  // 緑
        };

        const resetColor = '\x1b[0m';
        const color = levelColors[logEntry.level] || levelColors['info'];
        
        console.log(
            `${color}[System ${logEntry.level.toUpperCase()}]${resetColor}: ${logEntry.message} ` +
            `(${new Date(logEntry.timestamp).toLocaleTimeString()})`
        );
    }

    /**
     * ローカルストレージに履歴保存
     */
    saveToHistory(logEntry) {
        if (typeof localStorage !== 'undefined') {
            try {
                const history = JSON.parse(localStorage.getItem('systemLog') || '[]');
                history.push(logEntry);
                
                // 最新のメッセージのみ保持
                if (history.length > this.maxHistorySize) {
                    history.splice(0, history.length - this.maxHistorySize);
                }
                
                localStorage.setItem('systemLog', JSON.stringify(history));
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
            }
        }
    }

    /**
     * 画面上に通知表示
     */
    displayNotification(logEntry) {
        const messagesContainer = document.getElementById('system-messages');
        if (!messagesContainer) {
            return;
        }

        const notification = document.createElement('div');
        notification.className = `system-message ${logEntry.level}`;
        notification.textContent = `${new Date(logEntry.timestamp).toLocaleTimeString()}: ${logEntry.message}`;
        
        // 新しいメッセージを上部に追加
        messagesContainer.prepend(notification);

        // 古いメッセージを削除
        this.cleanupOldMessages();
    }

    /**
     * ファイルにログ出力（Node.js環境）
     */
    logToFile(logEntry) {
        const fs = require('fs');
        const path = require('path');
        
        const logDir = path.join(__dirname, 'logs');
        const logFile = path.join(logDir, `system_voice_${new Date().toISOString().split('T')[0]}.log`);
        
        // ログディレクトリが存在しない場合は作成
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        const logLine = `[${new Date(logEntry.timestamp).toISOString()}] [${logEntry.level.toUpperCase()}] ${logEntry.message}\n`;
        
        fs.appendFileSync(logFile, logLine, 'utf8');
    }

    /**
     * メッセージキューに追加
     */
    addToQueue(logEntry) {
        this.messageQueue.push(logEntry);
        
        // キューサイズの制限
        if (this.messageQueue.length > 100) {
            this.messageQueue.shift();
        }
    }

    /**
     * 古いメッセージを削除
     */
    cleanupOldMessages() {
        if (typeof document === 'undefined') return;
        
        const messages = document.querySelectorAll('.system-message');
        
        if (messages.length > this.maxDisplayMessages) {
            for (let i = this.maxDisplayMessages; i < messages.length; i++) {
                messages[i].remove();
            }
        }
    }

    /**
     * 履歴の読み込み
     */
    loadHistory() {
        if (typeof localStorage === 'undefined') return;
        
        try {
            const history = JSON.parse(localStorage.getItem('systemLog') || '[]');
            const messagesContainer = document.getElementById('system-messages');
            
            if (!messagesContainer) return;
            
            // 最新の10件を表示
            const recentMessages = history.slice(-10).reverse();
            
            recentMessages.forEach(item => {
                const notification = document.createElement('div');
                notification.className = `system-message ${item.level}`;
                notification.textContent = `${new Date(item.timestamp).toLocaleTimeString()}: ${item.message}`;
                messagesContainer.appendChild(notification);
            });
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }

    /**
     * システム状態の更新
     */
    updateStatus(status, message) {
        if (typeof document === 'undefined') return;
        
        const statusElement = document.querySelector('.info-card p');
        if (!statusElement) return;
        
        const indicator = statusElement.querySelector('.status-indicator');
        if (!indicator) return;
        
        indicator.className = `status-indicator status-${status}`;
        statusElement.innerHTML = indicator.outerHTML + (
            status === 'online' ? 'オンライン' : 
            status === 'offline' ? 'オフライン' : '警告'
        );
        
        this.speak(message, status === 'online' ? 'success' : 
                  status === 'offline' ? 'error' : 'warning');
    }

    /**
     * ログレベルを設定
     */
    setLogLevel(level) {
        if (this.logLevels.hasOwnProperty(level)) {
            this.currentLogLevel = level;
            this.speak(`ログレベルを ${level} に設定しました`, 'info');
        }
    }

    /**
     * 履歴をクリア
     */
    clearHistory() {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('systemLog');
        }
        
        if (typeof document !== 'undefined') {
            const messagesContainer = document.getElementById('system-messages');
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
            }
        }
        
        this.messageQueue = [];
        this.speak('メッセージ履歴をクリアしました', 'info');
    }

    /**
     * メッセージキューを取得
     */
    getMessageQueue() {
        return [...this.messageQueue];
    }

    /**
     * 統計情報を取得
     */
    getStats() {
        const history = typeof localStorage !== 'undefined' ? 
            JSON.parse(localStorage.getItem('systemLog') || '[]') : [];
        
        const stats = {
            totalMessages: history.length,
            queueSize: this.messageQueue.length,
            logLevel: this.currentLogLevel,
            lastMessage: history.length > 0 ? history[history.length - 1] : null
        };

        // レベル別の統計
        this.logLevels.keys().forEach(level => {
            stats[level] = history.filter(msg => msg.level === level).length;
        });

        return stats;
    }

    /**
     * 初期化
     */
    initialize() {
        if (this.isInitialized) return;
        
        this.speak('SystemVoice機能が初期化されました', 'success');
        this.loadHistory();
        this.isInitialized = true;
    }
}

// シングルトンインスタンスを作成
const systemVoiceInstance = new SystemVoice();

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = { SystemVoice: systemVoiceInstance };
} else if (typeof window !== 'undefined') {
    // ブラウザ環境
    window.SystemVoice = systemVoiceInstance;
    
    // ページ読み込み時に自動初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            systemVoiceInstance.initialize();
        });
    } else {
        systemVoiceInstance.initialize();
    }
}

// デフォルトエクスポート
export default systemVoiceInstance;
