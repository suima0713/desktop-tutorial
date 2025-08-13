// 設定管理モジュール
const SettingsManager = {
    VERSION: '1.0',
    
    // デフォルト設定
    defaults: {
        apiKey: '',
        symbols: ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL'],
        refreshInterval: 30000,
        enableAutoRefresh: false,
        alertThresholds: {},
        lastSaved: null
    },
    
    // 設定取得
    getSettings() {
        try {
            const stored = localStorage.getItem('ispTradingSettings');
            return stored ? {...this.defaults, ...JSON.parse(stored)} : this.defaults;
        } catch (e) {
            // console.error('Settings load error:', e);
            return this.defaults;
        }
    },
    
    // 設定保存
    saveSettings(settings) {
        try {
            const toSave = {
                ...settings,
                version: this.VERSION,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('ispTradingSettings', JSON.stringify(toSave));
            if (typeof SystemVoice !== 'undefined') {
                SystemVoice.speak('設定を保存しました', 'success');
            }
            return true;
        } catch (e) {
            // console.error('Settings save error:', e);
            return false;
        }
    },
    
    // エクスポート
    exportSettings() {
        const settings = this.getSettings();
        const blob = new Blob([JSON.stringify(settings, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `isp-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        SystemVoice.speak('設定をエクスポートしました', 'success');
    },
    
    // インポート
    async importSettings(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const settings = JSON.parse(e.target.result);
                    this.saveSettings(settings);
                    location.reload();
                    resolve(settings);
                } catch (error) {
                    SystemVoice.speak('インポート失敗', 'error');
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    },
    
    // リセット
    resetSettings() {
        if (confirm('設定をリセットしますか？')) {
            localStorage.removeItem('ispTradingSettings');
            location.reload();
        }
    }
};
