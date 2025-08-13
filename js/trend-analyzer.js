// トレンド分析モジュール
const TrendAnalyzer = {
    // 価格履歴を保存（メモリ内）
    priceHistory: {},
    maxHistoryLength: 100,
    
    // 価格を記録
    recordPrice(symbol, price, timestamp = Date.now()) {
        if (!this.priceHistory[symbol]) {
            this.priceHistory[symbol] = [];
        }
        
        this.priceHistory[symbol].push({ price, timestamp });
        
        // 最大100件まで保持
        if (this.priceHistory[symbol].length > this.maxHistoryLength) {
            this.priceHistory[symbol].shift();
        }
        
        // 分析実行
        this.analyze(symbol);
    },
    
    // 簡易移動平均（SMA）計算
    calculateSMA(symbol, period = 20) {
        const history = this.priceHistory[symbol];
        if (!history || history.length < period) return null;
        
        const recentPrices = history.slice(-period).map(h => h.price);
        const sum = recentPrices.reduce((a, b) => a + b, 0);
        return sum / period;
    },
    
    // トレンド判定
    analyzeTrend(symbol) {
        const history = this.priceHistory[symbol];
        if (!history || history.length < 3) return 'neutral';
        
        const recent = history.slice(-3);
        const trend = recent[2].price - recent[0].price;
        
        if (trend > 0.5) return 'bullish';  // 上昇トレンド
        if (trend < -0.5) return 'bearish'; // 下降トレンド
        return 'neutral';  // 横ばい
    },
    
    // 異常検知（簡易版）
    detectAnomaly(symbol, currentPrice) {
        const sma = this.calculateSMA(symbol);
        if (!sma) return false;
        
        const deviation = Math.abs(currentPrice - sma) / sma;
        return deviation > 0.05; // 5%以上の乖離で異常とみなす
    },
    
    // 分析実行
    analyze(symbol) {
        const history = this.priceHistory[symbol];
        if (!history || history.length < 2) return;
        
        const currentPrice = history[history.length - 1].price;
        const trend = this.analyzeTrend(symbol);
        const sma = this.calculateSMA(symbol);
        const isAnomaly = this.detectAnomaly(symbol, currentPrice);
        
        // UIに表示
        this.updateUI(symbol, {
            trend,
            sma,
            isAnomaly,
            currentPrice
        });
        
        // 異常検知時にアラート
        if (isAnomaly && typeof SystemVoice !== 'undefined') {
            SystemVoice.speak(
                `${symbol}: 異常な価格変動を検知しました`,
                'warning'
            );
        }
    },
    
    // UI更新
    updateUI(symbol, analysis) {
        const card = document.getElementById(`stock-${symbol}`);
        if (!card) return;
        
        // トレンドインジケーター追加
        let indicator = card.querySelector('.trend-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'trend-indicator';
            indicator.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            `;
            card.appendChild(indicator);
        }
        
        // トレンドによって色を変更
        const trendColors = {
            bullish: '#10b981',
            bearish: '#ef4444',
            neutral: '#6b7280'
        };
        
        indicator.style.backgroundColor = trendColors[analysis.trend];
        indicator.style.color = 'white';
        indicator.textContent = analysis.trend.toUpperCase();
        
        // SMA表示
        if (analysis.sma) {
            let smaElement = card.querySelector('.sma-value');
            if (!smaElement) {
                smaElement = document.createElement('div');
                smaElement.className = 'sma-value';
                smaElement.style.cssText = 'font-size: 12px; color: #666; margin-top: 5px;';
                const detailsElement = card.querySelector('.stock-details');
                if (detailsElement) {
                    detailsElement.prepend(smaElement);
                }
            }
            smaElement.textContent = `SMA(20): $${analysis.sma.toFixed(2)}`;
        }
    }
};
