const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

// Polygon.io integration - REST API直接実装
const PolygonClient = require('./simple_polygon');
const polygonClient = new PolygonClient();

const app = express();
app.use(express.json());
app.use(cors()); // CORS設定を追加

const PORT = process.env.PORT || 3001; // 3002から3001に変更

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// テストエンドポイント
app.get('/test', async (req, res) => {
    try {
        const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
            params: { q: 'test' },
            headers: { 
                'X-Subscription-Token': process.env.BRAVE_API_KEY,
                'Accept': 'application/json'
            }
        });
        res.json({ 
            success: true, 
            resultCount: response.data.web.results.length 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message,
            status: error.response?.status 
        });
    }
});

// 株価取得エンドポイント（Polygon.io使用）
app.get('/stock/:ticker', async (req, res) => {
    const { ticker } = req.params;
    console.log(`株価取得: ${ticker}`);
    
    try {
        // Polygon.ioでリアルタイム株価取得
        const data = await polygonClient.getStockPrice(ticker);
        
        if (data) {
            res.json({
                success: true,
                ticker: ticker,
                price: data.price,
                timestamp: data.timestamp,
                source: 'polygon',
                volume: data.volume
            });
        } else {
            throw new Error('No data returned from Polygon');
        }
    } catch (error) {
        console.error(`Polygon.io error for ${ticker}:`, error.message);
        
        // フォールバック: yfinance使用
        try {
            const yfResponse = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`);
            const price = yfResponse.data.chart.result[0].meta.regularMarketPrice;
            
            res.json({
                success: true,
                ticker: ticker,
                price: price,
                timestamp: new Date().toISOString(),
                source: 'yfinance_fallback',
                volume: null
            });
        } catch (yfError) {
            res.status(500).json({ 
                success: false, 
                error: `Both Polygon.io and yfinance failed for ${ticker}`,
                polygon_error: error.message,
                yfinance_error: yfError.message
            });
        }
    }
});

// 検索エンドポイント（一般検索用、株価以外）
app.post('/search', async (req, res) => {
    const { query = 'NIKKEI' } = req.body;
    console.log(`検索: "${query}"`);
    
    try {
        const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
            params: { q: query },
            headers: { 
                'X-Subscription-Token': process.env.BRAVE_API_KEY,
                'Accept': 'application/json'
            }
        });
        
        res.json({
            success: true,
            results: response.data.web.results.slice(0, 5),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 複数株価一括取得エンドポイント（維持率計算用）
app.post('/stocks/batch', async (req, res) => {
    const { tickers = [] } = req.body;
    console.log(`一括株価取得: ${tickers.join(', ')}`);
    
    if (!Array.isArray(tickers) || tickers.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'tickers array is required'
        });
    }
    
    const results = {};
    const errors = [];
    
    // 並列で株価取得
    const promises = tickers.map(async (ticker) => {
        try {
            const data = await polygonClient.getStockPrice(ticker);
            if (data) {
                results[ticker] = {
                    price: data.price,
                    timestamp: data.timestamp,
                    source: 'polygon',
                    volume: data.volume
                };
            } else {
                throw new Error('No data returned from Polygon');
            }
        } catch (error) {
            console.error(`Polygon.io error for ${ticker}:`, error.message);
            
            // フォールバック: yfinance
            try {
                const yfResponse = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`);
                const price = yfResponse.data.chart.result[0].meta.regularMarketPrice;
                
                results[ticker] = {
                    price: price,
                    timestamp: new Date().toISOString(),
                    source: 'yfinance_fallback',
                    volume: null
                };
            } catch (yfError) {
                errors.push({
                    ticker: ticker,
                    polygon_error: error.message,
                    yfinance_error: yfError.message
                });
            }
        }
    });
    
    await Promise.all(promises);
    
    res.json({
        success: true,
        results: results,
        errors: errors,
        timestamp: new Date().toISOString()
    });
});

// エラーハンドリング追加
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
    console.log(`✅ Server: http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`Test: http://localhost:${PORT}/test`);
});
