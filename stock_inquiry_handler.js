// stock_inquiry_handler.js - ISP v1.0 Immediate Situation Protocol
const PolygonClient = require('./simple_polygon');
const fs = require('fs');
const yaml = require('js-yaml');

class StockInquiryHandler {
    constructor() {
        this.polygonClient = new PolygonClient();
        this.loadConfig();
        this.responseCache = new Map();
        this.cacheTimeout = 30000; // 30秒
    }

    loadConfig() {
        try {
            const fileContents = fs.readFileSync('./config.yaml', 'utf8');
            this.config = yaml.load(fileContents);
        } catch (e) {
            console.log('⚠️ config.yaml not found, using defaults');
            this.config = this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            system: {
                name: "TradingSystem2025",
                version: "2.0",
                mode: "safe"
            },
            polygon_api: {
                key: "GW2Dm91_PtRLfU_NpHQ3LKG8gASIT5b6",
                fallback_to_yahoo: true,
                cache_duration: 60
            }
        };
    }

    // Priority 1: オリエンテーション（5秒以内）
    async getOrientation(ticker) {
        const startTime = Date.now();
        
        try {
            // キャッシュチェック
            const cacheKey = `orientation_${ticker}`;
            if (this.responseCache.has(cacheKey)) {
                const cached = this.responseCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            // 基本情報取得
            const priceData = await this.polygonClient.getStockPrice(ticker);
            
            if (!priceData) {
                return {
                    status: 'error',
                    message: `❌ ${ticker}: 価格データ取得失敗`,
                    responseTime: Date.now() - startTime
                };
            }

            const orientation = {
                ticker: ticker.toUpperCase(),
                currentPrice: priceData.price,
                priceChange: priceData.change || 0,
                priceChangePercent: priceData.changePercent || 0,
                dataSource: priceData.source,
                timestamp: new Date().toISOString(),
                responseTime: Date.now() - startTime,
                status: 'success'
            };

            // キャッシュに保存
            this.responseCache.set(cacheKey, {
                data: orientation,
                timestamp: Date.now()
            });

            return orientation;

        } catch (error) {
            return {
                status: 'error',
                message: `❌ ${ticker}: ${error.message}`,
                responseTime: Date.now() - startTime
            };
        }
    }

    // Priority 2: データマップ（15秒以内）
    async getDataMap(ticker) {
        const startTime = Date.now();
        
        try {
            const orientation = await this.getOrientation(ticker);
            
            if (orientation.status === 'error') {
                return orientation;
            }

            // 追加データ取得
            const additionalData = await this.getAdditionalData(ticker);
            
            const dataMap = {
                ...orientation,
                additionalData: additionalData,
                riskAssessment: this.assessRisk(orientation, additionalData),
                tradingContext: this.getTradingContext(ticker),
                responseTime: Date.now() - startTime
            };

            return dataMap;

        } catch (error) {
            return {
                status: 'error',
                message: `❌ データマップ取得失敗: ${error.message}`,
                responseTime: Date.now() - startTime
            };
        }
    }

    // Priority 3: アクションメニュー
    async getActionMenu(ticker) {
        const startTime = Date.now();
        
        try {
            const dataMap = await this.getDataMap(ticker);
            
            if (dataMap.status === 'error') {
                return dataMap;
            }

            const actions = this.generateActions(dataMap);
            
            const actionMenu = {
                ...dataMap,
                actions: actions,
                recommendations: this.generateRecommendations(dataMap),
                responseTime: Date.now() - startTime
            };

            return actionMenu;

        } catch (error) {
            return {
                status: 'error',
                message: `❌ アクションメニュー生成失敗: ${error.message}`,
                responseTime: Date.now() - startTime
            };
        }
    }

    // 追加データ取得
    async getAdditionalData(ticker) {
        // 簡易版 - 実際の実装ではより詳細なデータを取得
        return {
            volume: 'N/A',
            marketCap: 'N/A',
            peRatio: 'N/A',
            sector: 'N/A',
            lastUpdated: new Date().toISOString()
        };
    }

    // リスク評価
    assessRisk(orientation, additionalData) {
        const price = orientation.currentPrice;
        const changePercent = orientation.priceChangePercent;
        
        let riskLevel = 'LOW';
        let riskScore = 0;
        
        // 価格変動によるリスク評価
        if (Math.abs(changePercent) > 10) {
            riskLevel = 'HIGH';
            riskScore = 8;
        } else if (Math.abs(changePercent) > 5) {
            riskLevel = 'MEDIUM';
            riskScore = 5;
        } else {
            riskLevel = 'LOW';
            riskScore = 2;
        }

        return {
            level: riskLevel,
            score: riskScore,
            factors: [`価格変動: ${changePercent.toFixed(2)}%`],
            timestamp: new Date().toISOString()
        };
    }

    // 取引コンテキスト取得
    getTradingContext(ticker) {
        // 現在のポジション情報を取得（簡易版）
        const currentHoldings = {
            GBTG: 16000,
            SEMR: 16400,
            NVDA: 239,
            LNTH: 1000
        };

        const position = currentHoldings[ticker] || 0;
        
        return {
            currentPosition: position,
            hasPosition: position > 0,
            positionType: position > 0 ? 'HOLDING' : 'NONE',
            maintenanceImpact: this.calculateMaintenanceImpact(ticker, position),
            timestamp: new Date().toISOString()
        };
    }

    // 維持率への影響計算
    calculateMaintenanceImpact(ticker, position) {
        if (position === 0) return { impact: 'NONE', details: 'ポジションなし' };
        
        // 簡易計算（実際の実装ではより詳細な計算が必要）
        return {
            impact: 'POSITIVE',
            details: `${position}株保有中`,
            estimatedValue: 'N/A'
        };
    }

    // アクション生成
    generateActions(dataMap) {
        const actions = [];
        const ticker = dataMap.ticker;
        const price = dataMap.currentPrice;
        const riskLevel = dataMap.riskAssessment.level;
        const hasPosition = dataMap.tradingContext.hasPosition;

        // 基本アクション
        actions.push({
            id: 'view_details',
            label: '詳細情報表示',
            type: 'INFO',
            priority: 'HIGH'
        });

        // リスクに応じたアクション
        if (riskLevel === 'HIGH') {
            actions.push({
                id: 'risk_warning',
                label: '⚠️ 高リスク警告',
                type: 'WARNING',
                priority: 'HIGH'
            });
        }

        // ポジションに応じたアクション
        if (hasPosition) {
            actions.push({
                id: 'position_management',
                label: 'ポジション管理',
                type: 'ACTION',
                priority: 'MEDIUM'
            });
        } else {
            actions.push({
                id: 'consider_buy',
                label: '購入検討',
                type: 'ACTION',
                priority: 'MEDIUM'
            });
        }

        return actions;
    }

    // 推奨事項生成
    generateRecommendations(dataMap) {
        const recommendations = [];
        const riskLevel = dataMap.riskAssessment.level;
        const hasPosition = dataMap.tradingContext.hasPosition;

        if (riskLevel === 'HIGH') {
            recommendations.push({
                type: 'WARNING',
                message: '高ボラティリティ - 慎重な取引を推奨',
                priority: 'HIGH'
            });
        }

        if (hasPosition) {
            recommendations.push({
                type: 'INFO',
                message: '既存ポジションあり - リスク管理を確認',
                priority: 'MEDIUM'
            });
        }

        return recommendations;
    }

    // メイン処理関数
    async handleInquiry(ticker, priority = 'FULL') {
        console.log(`\n🔍 ISP v1.0 - ${ticker} 照会開始`);
        console.log(`優先度: ${priority}`);
        
        const startTime = Date.now();
        
        try {
            let result;
            
            switch (priority.toUpperCase()) {
                case 'ORIENTATION':
                    result = await this.getOrientation(ticker);
                    break;
                case 'DATAMAP':
                    result = await this.getDataMap(ticker);
                    break;
                case 'FULL':
                default:
                    result = await this.getActionMenu(ticker);
                    break;
            }

            const totalTime = Date.now() - startTime;
            console.log(`✅ 処理完了: ${totalTime}ms`);
            
            return {
                ...result,
                totalResponseTime: totalTime,
                protocol: 'ISP v1.0'
            };

        } catch (error) {
            console.error(`❌ 照会処理エラー: ${error.message}`);
            return {
                status: 'error',
                message: `照会処理失敗: ${error.message}`,
                totalResponseTime: Date.now() - startTime,
                protocol: 'ISP v1.0'
            };
        }
    }
}

// テスト実行
if (require.main === module) {
    const handler = new StockInquiryHandler();
    
    // テスト実行
    async function testISP() {
        console.log('🧪 ISP v1.0 テスト開始');
        console.log('=' * 50);
        
        const testTickers = ['AAPL', 'NVDA', 'LNTH'];
        
        for (const ticker of testTickers) {
            console.log(`\n📊 ${ticker} 照会テスト`);
            const result = await handler.handleInquiry(ticker, 'FULL');
            console.log(JSON.stringify(result, null, 2));
        }
    }
    
    testISP();
}

module.exports = StockInquiryHandler;
