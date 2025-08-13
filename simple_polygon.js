const axios = require('axios');
require('dotenv').config();

class PolygonClient {
    constructor() {
        this.apiKey = 'GW2Dm91_PtRLfU_NpHQ3LKG8gASIT5b6';
        this.baseURL = 'https://api.polygon.io';
        this.fallbackToYahoo = true;
    }

    async getStockPrice(ticker) {
        try {
            // Polygon.io APIを試行
            const url = `${this.baseURL}/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${this.apiKey}`;
            const response = await axios.get(url);
            
            if (response.data.results && response.data.results[0]) {
                console.log(`✅ Polygon.io: ${ticker} = $${response.data.results[0].c}`);
                return {
                    ticker: ticker,
                    price: response.data.results[0].c,
                    volume: response.data.results[0].v,
                    source: 'polygon',
                    timestamp: new Date(response.data.results[0].t)
                };
            }
        } catch (error) {
            console.log(`⚠️ Polygon API error: ${error.message}`);
            
            // Yahoo Financeにフォールバック
            if (this.fallbackToYahoo) {
                return await this.getYahooPrice(ticker);
            }
        }
    }

    async getYahooPrice(ticker) {
        try {
            // yfinanceを使用したフォールバック実装
            console.log(`📊 Fallback to Yahoo Finance for ${ticker}`);
            const yfResponse = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`);
            const result = yfResponse.data.chart.result[0];
            const price = result.meta.regularMarketPrice;
            const volume = result.meta.regularMarketVolume;
            
            return {
                ticker: ticker,
                price: price,
                volume: volume,
                timestamp: new Date().toISOString(),
                source: 'yahoo_fallback'
            };
        } catch (error) {
            console.error('Both APIs failed:', error);
            return null;
        }
    }

    // 複数銘柄の価格を一括取得
    async getMultipleStockPrices(tickers) {
        const promises = tickers.map(ticker => this.getStockPrice(ticker));
        return await Promise.all(promises);
    }

    // 維持率計算用のデータ取得
    async getMaintenanceData(positions) {
        const prices = await this.getMultipleStockPrices(
            positions.map(p => p.ticker)
        );
        
        return positions.map((position, index) => ({
            ...position,
            currentPrice: prices[index]?.price || 0,
            marketValue: (prices[index]?.price || 0) * position.shares
        }));
    }

    // リアルタイム取引データ取得（より詳細な情報）
    async getLastTrade(ticker) {
        const url = `${this.baseURL}/v2/last/trade/${ticker}?apiKey=${this.apiKey}`;
        try {
            const response = await axios.get(url);
            if (response.data.results) {
                return {
                    ticker: ticker,
                    price: response.data.results.p,
                    size: response.data.results.s,
                    timestamp: response.data.results.t,
                    source: 'polygon_realtime'
                };
            }
        } catch (error) {
            console.error(`Error fetching last trade for ${ticker}:`, error.message);
            return null;
        }
    }

    // 日次集計データ取得
    async getDailyAggregates(ticker, date) {
        const url = `${this.baseURL}/v2/aggs/ticker/${ticker}/range/1/day/${date}/${date}?apiKey=${this.apiKey}`;
        try {
            const response = await axios.get(url);
            if (response.data.results && response.data.results[0]) {
                return {
                    ticker: ticker,
                    open: response.data.results[0].o,
                    high: response.data.results[0].h,
                    low: response.data.results[0].l,
                    close: response.data.results[0].c,
                    volume: response.data.results[0].v,
                    date: date,
                    source: 'polygon_daily'
                };
            }
        } catch (error) {
            console.error(`Error fetching daily data for ${ticker}:`, error.message);
            return null;
        }
    }

    async testConnection() {
        console.log('🔍 Testing Polygon.io connection...');
        
        // アカウントステータス確認
        try {
            const url = `${this.baseURL}/v1/marketstatus/now?apiKey=${this.apiKey}`;
            const response = await axios.get(url);
            console.log('✅ Market status:', response.data);
            return true;
        } catch (error) {
            console.log('❌ Connection test failed:', error.response?.data || error.message);
            return false;
        }
    }
}

module.exports = PolygonClient;

// 直接実行時のテスト
if (require.main === module) {
    const client = new PolygonClient();
    
    // 接続テスト
    client.testConnection().then(success => {
        if (success) {
            // 価格取得テスト
            client.getStockPrice('AAPL').then(data => {
                console.log('Final result:', data);
            });
        } else {
            // フォールバックテスト
            client.getStockPrice('AAPL').then(data => {
                console.log('Fallback result:', data);
            });
        }
    });
}
