#!/usr/bin/env node
/**
 * TradingSystem2025 - Maintenance Rate Calculator
 * Polygon.ioを使用したリアルタイム維持率計算
 */

const axios = require('axios');
require('dotenv').config();

const MCP_SERVER_URL = 'http://localhost:3001';

// 現在のポジション情報（SYSTEM_MEMORY.mdから）
const CURRENT_POSITIONS = {
    GBTG: { shares: 16000, type: '現物', cost: 0 }, // 現物は維持率に影響しない
    SEMR: { shares: 16400, type: '現物', cost: 0 },
    NVDA: { shares: 239, type: '信用', cost: 5200000 }, // 520万円
    LNTH: { shares: 1000, type: '信用', cost: 8800000 } // 880万円
};

// 総資産
const TOTAL_CAPITAL = 150000000; // 1.5億円

async function getCurrentPrices(tickers) {
    """Polygon.ioを使用して現在の株価を取得"""
    try {
        const response = await axios.post(`${MCP_SERVER_URL}/stocks/batch`, {
            tickers: tickers
        });
        
        if (response.data.success) {
            return response.data.results;
        } else {
            throw new Error('Failed to get stock prices');
        }
    } catch (error) {
        console.error('Error getting stock prices:', error.message);
        throw error;
    }
}

function calculateMaintenanceRate(positions, prices) {
    """維持率を計算"""
    let totalMarketValue = 0;
    let totalCreditValue = 0;
    
    for (const [ticker, position] of Object.entries(positions)) {
        if (prices[ticker]) {
            const marketValue = position.shares * prices[ticker].price;
            totalMarketValue += marketValue;
            
            if (position.type === '信用') {
                totalCreditValue += position.cost;
            }
        }
    }
    
    // 維持率 = (総資産 + 信用取引の評価損益) / 信用取引残高 × 100
    const maintenanceRate = ((TOTAL_CAPITAL + (totalMarketValue - totalCreditValue)) / totalCreditValue) * 100;
    
    return {
        maintenanceRate: maintenanceRate,
        totalMarketValue: totalMarketValue,
        totalCreditValue: totalCreditValue,
        netPosition: totalMarketValue - totalCreditValue
    };
}

function analyzeRiskLevel(maintenanceRate) {
    """リスクレベルを分析"""
    if (maintenanceRate >= 200) {
        return { level: 'SAFE', color: '🟢', message: '安全圏' };
    } else if (maintenanceRate >= 180) {
        return { level: 'GOOD', color: '🟡', message: '目標達成' };
    } else if (maintenanceRate >= 170) {
        return { level: 'WARNING', color: '🟠', message: '注意レベル' };
    } else if (maintenanceRate >= 160) {
        return { level: 'DANGER', color: '🔴', message: '警告レベル' };
    } else {
        return { level: 'CRITICAL', color: '💀', message: '追証発生リスク' };
    }
}

function generateRecommendations(maintenanceRate, positions, prices) {
    """維持率改善のための推奨事項を生成"""
    const recommendations = [];
    
    if (maintenanceRate < 180) {
        recommendations.push('🎯 目標: 維持率180%達成');
        
        // 最大ポジション（LNTH）の分析
        const lnthPosition = positions.LNTH;
        const lnthPrice = prices.LNTH?.price;
        
        if (lnthPrice && lnthPosition) {
            const lnthValue = lnthPosition.shares * lnthPrice;
            const lnthWeight = (lnthValue / TOTAL_CAPITAL) * 100;
            
            if (lnthWeight > 5) { // 5%以上
                recommendations.push(`⚠️  LNTHポジション過大: ${lnthWeight.toFixed(1)}%`);
                recommendations.push('   部分決済を検討してください');
            }
        }
        
        // 信用取引の分析
        const creditPositions = Object.entries(positions).filter(([_, pos]) => pos.type === '信用');
        if (creditPositions.length > 2) {
            recommendations.push('⚠️  信用取引銘柄数が多い');
            recommendations.push('   集中投資を検討してください');
        }
    }
    
    if (maintenanceRate < 160) {
        recommendations.push('🚨 緊急: 維持率改善が必要');
        recommendations.push('   信用取引の部分決済を推奨');
    }
    
    return recommendations;
}

async function calculateAndDisplayMaintenanceRate() {
    """維持率を計算して表示"""
    console.log('📊 TradingSystem2025 - Maintenance Rate Calculator');
    console.log('=' .repeat(60));
    
    try {
        // 現在の株価を取得
        const tickers = Object.keys(CURRENT_POSITIONS);
        console.log(`🔍 Getting current prices for: ${tickers.join(', ')}`);
        
        const prices = await getCurrentPrices(tickers);
        
        // 維持率を計算
        const result = calculateMaintenanceRate(CURRENT_POSITIONS, prices);
        const riskLevel = analyzeRiskLevel(result.maintenanceRate);
        
        // 結果を表示
        console.log('\n📈 Current Positions:');
        console.log('-' .repeat(40));
        
        for (const [ticker, position] of Object.entries(CURRENT_POSITIONS)) {
            if (prices[ticker]) {
                const currentValue = position.shares * prices[ticker].price;
                const profitLoss = currentValue - position.cost;
                const profitLossPercent = position.cost > 0 ? (profitLoss / position.cost) * 100 : 0;
                
                console.log(`${ticker}:`);
                console.log(`  Shares: ${position.shares.toLocaleString()}`);
                console.log(`  Type: ${position.type}`);
                console.log(`  Current Price: $${prices[ticker].price.toFixed(2)}`);
                console.log(`  Market Value: $${currentValue.toLocaleString()}`);
                
                if (position.type === '信用') {
                    console.log(`  Cost: $${position.cost.toLocaleString()}`);
                    console.log(`  P&L: $${profitLoss.toLocaleString()} (${profitLossPercent.toFixed(2)}%)`);
                }
                console.log(`  Source: ${prices[ticker].source}`);
                console.log('');
            }
        }
        
        console.log('📊 Maintenance Rate Analysis:');
        console.log('-' .repeat(40));
        console.log(`${riskLevel.color} Current Rate: ${result.maintenanceRate.toFixed(2)}%`);
        console.log(`   Status: ${riskLevel.message}`);
        console.log(`   Total Market Value: $${result.totalMarketValue.toLocaleString()}`);
        console.log(`   Total Credit Value: $${result.totalCreditValue.toLocaleString()}`);
        console.log(`   Net Position: $${result.netPosition.toLocaleString()}`);
        
        // 推奨事項を表示
        const recommendations = generateRecommendations(result.maintenanceRate, CURRENT_POSITIONS, prices);
        if (recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            console.log('-' .repeat(40));
            recommendations.forEach(rec => console.log(rec));
        }
        
        // リスクレベル別の対応
        console.log('\n🚨 Risk Management:');
        console.log('-' .repeat(40));
        if (result.maintenanceRate < 160) {
            console.log('🔴 CRITICAL: Immediate action required');
            console.log('   - Consider partial position closure');
            console.log('   - Monitor positions every 30 minutes');
        } else if (result.maintenanceRate < 170) {
            console.log('🟠 WARNING: Increased monitoring needed');
            console.log('   - Check positions every 2 hours');
            console.log('   - Prepare for potential position reduction');
        } else if (result.maintenanceRate < 180) {
            console.log('🟡 CAUTION: Target not reached');
            console.log('   - Monitor daily');
            console.log('   - Look for improvement opportunities');
        } else {
            console.log('🟢 SAFE: Target achieved');
            console.log('   - Continue normal monitoring');
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Error calculating maintenance rate:', error.message);
        throw error;
    }
}

async function main() {
    try {
        await calculateAndDisplayMaintenanceRate();
        
        console.log('\n✅ Maintenance rate calculation completed');
        console.log('\n📝 Next Steps:');
        console.log('1. Register for Polygon.io: https://polygon.io/dashboard/signup');
        console.log('2. Add POLYGON_KEY to .env file');
        console.log('3. Set up automated monitoring');
        console.log('4. Implement alert system for rate changes');
        
    } catch (error) {
        console.error('❌ Failed to calculate maintenance rate');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    calculateMaintenanceRate,
    analyzeRiskLevel,
    generateRecommendations,
    getCurrentPrices
};
