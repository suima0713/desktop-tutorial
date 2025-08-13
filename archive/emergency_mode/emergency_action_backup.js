const PolygonClient = require('./simple_polygon');

class EmergencyResponse {
    constructor() {
        this.client = new PolygonClient();
        this.criticalRate = 93.04;
        this.targetRate = 180;
        this.marginUsed = 14000000; // 1400万円の信用取引
    }
    
    async analyzeAndSuggest() {
        console.log('\n🚨 緊急分析開始 - 維持率 93.04%\n');
        
        // 危険度の計算
        const deficit = this.targetRate - this.criticalRate;
        const riskLevel = this.criticalRate < 100 ? 'EXTREME' : 
                         this.criticalRate < 130 ? 'HIGH' : 'MEDIUM';
        
        console.log(`危険度: ${riskLevel}`);
        console.log(`不足率: ${deficit.toFixed(2)}%`);
        console.log(`余裕: ${(100 - this.criticalRate).toFixed(2)}%`);
        
        // 具体的な対策
        const requiredAction = {
            'EXTREME': {
                message: '即座の行動が必要',
                actions: [
                    '1. 最もボラティリティの高い銘柄を30%以上売却',
                    '2. 信用取引ポジションを50%削減',
                    '3. 現金2000万円以上の即座入金',
                    '4. 全ての新規取引を停止',
                    '5. 高リスク銘柄（TSLA、NVDA等）を優先的に整理'
                ],
                timeframe: '今すぐ（1時間以内）',
                priority: '最優先'
            },
            'HIGH': {
                message: '緊急対応が必要',
                actions: [
                    '1. ポジションを20%削減',
                    '2. 現金1000万円以上の入金',
                    '3. 高ボラティリティ銘柄の整理',
                    '4. 新規取引の一時停止'
                ],
                timeframe: '今日中',
                priority: '高'
            },
            'MEDIUM': {
                message: '注意が必要',
                actions: [
                    '1. ポジションの見直し',
                    '2. 現金500万円以上の入金',
                    '3. リスク管理の強化'
                ],
                timeframe: '今週中',
                priority: '中'
            }
        };
        
        const action = requiredAction[riskLevel];
        console.log(`\n⚡ ${action.message}`);
        console.log('─'.repeat(50));
        action.actions.forEach(a => console.log(a));
        console.log(`\n⏰ 実行期限: ${action.timeframe}`);
        console.log(`🎯 優先度: ${action.priority}`);
        
        // 削減すべきポジション額
        const reductionNeeded = (deficit / 100) * this.marginUsed;
        console.log(`\n💰 必要な削減額: ¥${reductionNeeded.toLocaleString()}`);
        
        // 入金推奨額
        const recommendedDeposit = Math.max(20000000, reductionNeeded * 1.5);
        console.log(`💰 推奨入金額: ¥${recommendedDeposit.toLocaleString()}`);
        
        // 時間的余裕
        const timeBuffer = 100 - this.criticalRate;
        console.log(`\n⏱️  時間的余裕: ${timeBuffer.toFixed(2)}%`);
        if (timeBuffer < 10) {
            console.log('⚠️  極めて危険: マージンコール発動までわずか');
        } else if (timeBuffer < 20) {
            console.log('⚠️  危険: 即座の対応が必要');
        } else {
            console.log('⚠️  注意: 早めの対応を推奨');
        }
        
        return {
            riskLevel,
            deficit,
            actions: action.actions,
            reductionNeeded,
            recommendedDeposit,
            timeBuffer
        };
    }
    
    async getCurrentPositions() {
        try {
            console.log('\n📊 現在のポジション分析中...');
            
            // サンプルポジション（実際のAPIから取得）
            const positions = [
                { ticker: 'AAPL', shares: 100, currentPrice: 150.00 },
                { ticker: 'GOOGL', shares: 50, currentPrice: 2800.00 },
                { ticker: 'MSFT', shares: 75, currentPrice: 300.00 },
                { ticker: 'TSLA', shares: 25, currentPrice: 800.00 },
                { ticker: 'NVDA', shares: 30, currentPrice: 400.00 }
            ];
            
            console.log('\n📋 現在のポジション:');
            positions.forEach(pos => {
                const value = pos.shares * pos.currentPrice;
                console.log(`  ${pos.ticker}: ${pos.shares}株 × $${pos.currentPrice} = $${value.toLocaleString()}`);
            });
            
            // 高リスク銘柄の特定
            const highRiskTickers = ['TSLA', 'NVDA', 'AMD', 'PLTR'];
            const highRiskPositions = positions.filter(pos => highRiskTickers.includes(pos.ticker));
            
            if (highRiskPositions.length > 0) {
                console.log('\n⚠️  高リスク銘柄（優先的に整理推奨）:');
                highRiskPositions.forEach(pos => {
                    console.log(`  ${pos.ticker}: ${pos.shares}株`);
                });
            }
            
            return positions;
            
        } catch (error) {
            console.error('❌ ポジション取得エラー:', error.message);
            return [];
        }
    }
    
    generateEmergencyReport() {
        const report = `
=== 緊急対応レポート ===
日時: ${new Date().toLocaleString('ja-JP')}
維持率: ${this.criticalRate}%
目標維持率: ${this.targetRate}%
危険度: ${this.criticalRate < 100 ? 'EXTREME' : 'HIGH'}

緊急アクション:
${this.criticalRate < 100 ? `
1. 即座にポジションを30%削減
2. 現金2000万円以上の入金
3. 全ての新規取引停止
4. 高リスク銘柄の優先整理
` : `
1. ポジションを20%削減
2. 現金1000万円以上の入金
3. 高ボラティリティ銘柄の整理
`}

必要な削減額: ¥${((this.targetRate - this.criticalRate) / 100 * this.marginUsed).toLocaleString()}
推奨入金額: ¥${Math.max(20000000, (this.targetRate - this.criticalRate) / 100 * this.marginUsed * 1.5).toLocaleString()}

実行期限: ${this.criticalRate < 100 ? '今すぐ（1時間以内）' : '今日中'}
        `;
        
        console.log(report);
        return report;
    }
}

// 即座に実行
const emergency = new EmergencyResponse();
emergency.analyzeAndSuggest()
    .then(() => emergency.getCurrentPositions())
    .then(() => emergency.generateEmergencyReport())
    .catch(error => {
        console.error('❌ 緊急分析エラー:', error.message);
    });

module.exports = EmergencyResponse;
