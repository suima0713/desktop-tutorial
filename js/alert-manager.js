// アラート管理モジュール
const AlertManager = {
    alerts: {},
    
    // アラート設定
    setAlert(symbol, type, threshold) {
        if (!this.alerts[symbol]) {
            this.alerts[symbol] = [];
        }
        
        const alert = {
            id: Date.now(),
            type, // 'above' or 'below'
            threshold,
            active: true,
            created: new Date().toISOString()
        };
        
        this.alerts[symbol].push(alert);
        this.saveAlerts();
        
        if (typeof SystemVoice !== 'undefined') {
            SystemVoice.speak(
                `${symbol}: ${type === 'above' ? '上値' : '下値'}アラート設定 ($${threshold})`,
                'success'
            );
        }
        
        return alert.id;
    },
    
    // アラートチェック
    checkAlerts(symbol, currentPrice) {
        const symbolAlerts = this.alerts[symbol];
        if (!symbolAlerts) return;
        
        symbolAlerts.forEach(alert => {
            if (!alert.active) return;
            
            const triggered = (alert.type === 'above' && currentPrice >= alert.threshold) ||
                            (alert.type === 'below' && currentPrice <= alert.threshold);
            
            if (triggered) {
                this.triggerAlert(symbol, alert, currentPrice);
                alert.active = false; // 一度だけ発火
            }
        });
        
        this.saveAlerts();
    },
    
    // アラート発火
    triggerAlert(symbol, alert, currentPrice) {
        const message = `🔔 ${symbol}: 価格が$${alert.threshold}を${alert.type === 'above' ? '超えました' : '下回りました'} (現在: $${currentPrice.toFixed(2)})`;
        
        // システムボイスで通知
        if (typeof SystemVoice !== 'undefined') {
            SystemVoice.speak(message, 'warning');
        }
        
        // ブラウザ通知
        if (Notification.permission === 'granted') {
            new Notification('価格アラート', {
                body: message,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        }
        
        // Google Analytics イベント
        if (typeof gtag !== 'undefined') {
            gtag('event', 'alert_triggered', {
                event_category: 'Alert',
                event_label: symbol,
                value: currentPrice
            });
        }
        
        // システムメッセージに表示
        this.addSystemMessage(message);
    },
    
    // システムメッセージに追加
    addSystemMessage(message) {
        const messagesPanel = document.getElementById('systemMessages');
        if (messagesPanel) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'system-message alert-message';
            messageDiv.style.backgroundColor = '#fef3c7';
            messageDiv.style.borderLeft = '4px solid #f59e0b';
            messageDiv.innerHTML = `
                <strong>🔔 アラート</strong><br>
                ${message}<br>
                <small>${new Date().toLocaleTimeString('ja-JP')}</small>
            `;
            messagesPanel.insertBefore(messageDiv, messagesPanel.firstChild);
            
            // 最大10件まで保持
            const messages = messagesPanel.querySelectorAll('.system-message');
            if (messages.length > 10) {
                messages[messages.length - 1].remove();
            }
        }
    },
    
    // アラート保存
    saveAlerts() {
        localStorage.setItem('priceAlerts', JSON.stringify(this.alerts));
    },
    
    // アラート読み込み
    loadAlerts() {
        const saved = localStorage.getItem('priceAlerts');
        if (saved) {
            this.alerts = JSON.parse(saved);
        }
    },
    
    // アラート削除
    removeAlert(symbol, alertId) {
        if (!this.alerts[symbol]) return;
        
        this.alerts[symbol] = this.alerts[symbol].filter(a => a.id !== alertId);
        this.saveAlerts();
    },
    
    // アラート一覧取得
    getAlerts(symbol = null) {
        if (symbol) {
            return this.alerts[symbol] || [];
        }
        return this.alerts;
    }
};


