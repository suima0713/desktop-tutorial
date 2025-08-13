/**
 * Brave Search統合 - 検索クエリ管理とn8nワークフロー統合
 * 維持率変動時の市況要因自動調査機能
 */

const BRAVE_RATE_LIMIT = 2000; // queries/month
const MAX_RETRIES = 3;
const FALLBACK_DELAY = 5000; // ms

class BraveSearchIntegration {
  constructor() {
    this.apiKey = process.env.BRAVE_API_KEY;
    this.queryCount = 0;
    this.lastQueryTime = null;
  }

  /**
   * 維持率変動に基づく市況要因検索
   * @param {number} maintenanceRate - 現在の維持率
   * @param {string} trend - トレンド ('INCREASING', 'DECLINING', 'STABLE')
   */
  async searchMarketFactors(maintenanceRate, trend = 'STABLE') {
    try {
      console.log(`[Brave Search] 維持率: ${maintenanceRate}%, トレンド: ${trend}`);
      
      const queries = this.generateQueries(maintenanceRate, trend);
      const results = [];

      for (const query of queries) {
        if (this.checkRateLimit()) {
          const result = await this.executeSearch(query);
          results.push(result);
          await this.delay(1000); // API制限対策
        } else {
          console.warn('[Brave Search] レート制限に達しました');
          break;
        }
      }

      return this.analyzeResults(results, maintenanceRate, trend);
    } catch (error) {
      console.error('[Brave Search] エラー:', error);
      return this.getFallbackResponse(error);
    }
  }

  /**
   * 維持率とトレンドに基づく検索クエリ生成
   */
  generateQueries(maintenanceRate, trend) {
    const baseQueries = [
      'moomoo証券 最新ニュース',
      '米国株式市場 今日 動向'
    ];

    if (maintenanceRate < 180) {
      baseQueries.push(
        'moomoo証券 障害 メンテナンス 今日',
        '米国株 急落 原因 速報',
        'FRB 金利 発表 影響 株価',
        '証拠金規制 変更 最新'
      );
    }

    if (trend === 'DECLINING') {
      baseQueries.push(
        '株式市場 暴落 原因 今日',
        '証券会社 システム障害 今日',
        '証拠金維持率 急落 要因'
      );
    }

    if (maintenanceRate > 190) {
      baseQueries.push(
        '株式市場 上昇 要因 今日',
        '証券取引 好調 理由'
      );
    }

    return baseQueries.slice(0, 5); // 最大5クエリに制限
  }

  /**
   * Brave Search API実行
   */
  async executeSearch(query) {
    try {
      const response = await fetch('https://api.search.brave.com/res/v1/web/search', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': this.apiKey
        },
        params: {
          q: query,
          count: 10,
          search_lang: 'ja_JP'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.queryCount++;
      this.lastQueryTime = new Date();

      return {
        query,
        results: data.web?.results || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`[Brave Search] クエリ実行エラー (${query}):`, error);
      throw error;
    }
  }

  /**
   * 検索結果の分析とClaude統合用データ生成
   */
  analyzeResults(results, maintenanceRate, trend) {
    const analysis = {
      maintenanceRate,
      trend,
      timestamp: new Date().toISOString(),
      marketFactors: [],
      recommendations: [],
      riskLevel: this.calculateRiskLevel(maintenanceRate, trend),
      summary: ''
    };

    // 検索結果から市場要因を抽出
    results.forEach(result => {
      const factors = this.extractMarketFactors(result);
      analysis.marketFactors.push(...factors);
    });

    // 推奨事項を生成
    analysis.recommendations = this.generateRecommendations(analysis);
    analysis.summary = this.generateSummary(analysis);

    return analysis;
  }

  /**
   * 市場要因の抽出
   */
  extractMarketFactors(searchResult) {
    const factors = [];
    
    searchResult.results?.forEach(result => {
      const title = result.title || '';
      const description = result.description || '';
      const content = `${title} ${description}`.toLowerCase();

      // キーワードベースの要因抽出
      if (content.includes('障害') || content.includes('メンテナンス')) {
        factors.push({
          type: 'SYSTEM_ISSUE',
          source: result.url,
          title: result.title,
          description: result.description,
          severity: 'HIGH'
        });
      }

      if (content.includes('急落') || content.includes('暴落')) {
        factors.push({
          type: 'MARKET_DECLINE',
          source: result.url,
          title: result.title,
          description: result.description,
          severity: 'HIGH'
        });
      }

      if (content.includes('金利') || content.includes('frb')) {
        factors.push({
          type: 'POLICY_CHANGE',
          source: result.url,
          title: result.title,
          description: result.description,
          severity: 'MEDIUM'
        });
      }
    });

    return factors;
  }

  /**
   * リスクレベルの計算
   */
  calculateRiskLevel(maintenanceRate, trend) {
    if (maintenanceRate < 160) return 'CRITICAL';
    if (maintenanceRate < 170) return 'HIGH';
    if (maintenanceRate < 180) return 'MEDIUM';
    if (trend === 'DECLINING') return 'LOW';
    return 'SAFE';
  }

  /**
   * 推奨事項の生成
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.riskLevel === 'CRITICAL') {
      recommendations.push(
        '緊急対応が必要です。ポジションの大幅な調整を検討してください。',
        '証券会社に直接連絡して状況を確認してください。'
      );
    } else if (analysis.riskLevel === 'HIGH') {
      recommendations.push(
        'リスク軽減のため、ポジション調整を検討してください。',
        '市場動向を注視し、必要に応じて追加の対応を行ってください。'
      );
    } else if (analysis.riskLevel === 'MEDIUM') {
      recommendations.push(
        '注意レベルです。市場動向を監視してください。',
        'ポジションの見直しを検討してください。'
      );
    }

    return recommendations;
  }

  /**
   * サマリー生成
   */
  generateSummary(analysis) {
    const factorCount = analysis.marketFactors.length;
    const riskLevel = analysis.riskLevel;
    
    return `維持率${analysis.maintenanceRate}%で${riskLevel}リスクレベル。${factorCount}件の市場要因を検出。${analysis.recommendations.length}件の推奨事項があります。`;
  }

  /**
   * レート制限チェック
   */
  checkRateLimit() {
    // 月間クエリ制限チェック（簡易実装）
    if (this.queryCount >= BRAVE_RATE_LIMIT) {
      return false;
    }
    return true;
  }

  /**
   * フォールバックレスポンス
   */
  getFallbackResponse(error) {
    return {
      maintenanceRate: 192.63, // 現在の維持率
      trend: 'STABLE',
      timestamp: new Date().toISOString(),
      marketFactors: [],
      recommendations: [
        '検索サービスが利用できません。手動で市場動向を確認してください。',
        '証券会社の公式サイトで最新情報を確認してください。'
      ],
      riskLevel: 'UNKNOWN',
      summary: '検索サービスエラーのため、手動確認が必要です。',
      error: error.message
    };
  }

  /**
   * 遅延処理
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// n8nワークフロー統合用エクスポート
module.exports = {
  BraveSearchIntegration,
  BRAVE_RATE_LIMIT,
  MAX_RETRIES,
  FALLBACK_DELAY
};

// テスト用実行
if (require.main === module) {
  const integration = new BraveSearchIntegration();
  
  // テスト実行
  integration.searchMarketFactors(192.63, 'STABLE')
    .then(result => {
      console.log('検索結果:', JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('テストエラー:', error);
    });
}

