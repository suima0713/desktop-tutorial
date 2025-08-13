// エラーハンドリング＆リトライ機構
const ErrorHandler = {
    maxRetries: 3,
    retryDelay: 1000,
    
    // リトライ可能なリクエスト
    async withRetry(func, context = {}) {
        let lastError;
        
        for (let i = 0; i < this.maxRetries; i++) {
            try {
                return await func();
            } catch (error) {
                lastError = error;
                // console.error(`Attempt ${i + 1} failed:`, error);
                
                if (typeof SystemVoice !== 'undefined') {
                    SystemVoice.speak(
                        `エラー発生。リトライ ${i + 1}/${this.maxRetries}`, 
                        'warning'
                    );
                }
                
                // 指数バックオフ
                if (i < this.maxRetries - 1) {
                    const delay = this.retryDelay * Math.pow(2, i);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        SystemVoice.speak('最大リトライ回数に達しました', 'error');
        throw lastError;
    },
    
    // エラーログ記録
    logError(error, context) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            context: context
        };
        
        // localStorage にエラーログを保存
        const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
        logs.push(errorLog);
        // 最新100件のみ保持
        localStorage.setItem('errorLogs', JSON.stringify(logs.slice(-100)));
        
        // Google Analyticsにも送信
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: error.message,
                fatal: false
            });
        }
    }
};
