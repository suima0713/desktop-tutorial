#!/usr/bin/env node

/**
 * HTTP Server for Brave Search MCP Integration
 * MCPサーバーとHTTP APIを提供するサーバー
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

class BraveSearchHTTPServer {
  constructor() {
    this.app = express();
    this.port = 3002;
    this.apiKey = process.env.BRAVE_API_KEY;
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * ミドルウェア設定
   */
  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  /**
   * ルート設定
   */
  setupRoutes() {
    // ヘルスチェック
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Brave Search MCP HTTP Server',
        version: '1.0.0'
      });
    });

    // 維持率取得API
    this.app.get('/api/maintenance-rate', async (req, res) => {
      try {
        // 現在の維持率を取得（実際の実装ではデータベースやAPIから取得）
        const maintenanceRate = 167.52;
        const trend = 'WARNING';
        const status = maintenanceRate < 170 ? 'WARNING' : 'INFO';

        res.json({
          maintenanceRate,
          trend,
          status,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Brave Search統合API
    this.app.post('/api/brave-search', async (req, res) => {
      try {
        const { maintenanceRate, trend = 'STABLE' } = req.body;

        if (!this.apiKey) {
          return res.status(400).json({
            error: 'BRAVE_API_KEYが設定されていません',
            timestamp: new Date().toISOString()
          });
        }

        // 市場要因検索
        const marketFactors = await this.searchMarketFactors(maintenanceRate, trend);
        
        // リスクレベル計算
        const riskLevel = this.calculateRiskLevel(maintenanceRate, marketFactors);
        
        // 推奨事項生成
        const recommendations = this.generateRecommendations(maintenanceRate, marketFactors);

        res.json({
          maintenanceRate,
          trend,
          marketFactors,
          riskLevel,
          recommendations,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // ニュース検索API
    this.app.post('/api/search-news', async (req, res) => {
      try {
        const { query, count = 10 } = req.body;

        if (!this.apiKey) {
          return res.status(400).json({
            error: 'BRAVE_API_KEYが設定されていません',
            timestamp: new Date().toISOString()
          });
        }

        const results = await this.executeBraveSearch(query, count);

        res.json({
          query,
          results: results.web?.results || [],
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // エラーハンドリング
    this.app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * 市場要因検索
   */
  async searchMarketFactors(maintenanceRate, trend) {
    const queries = this.generateMarketQueries(maintenanceRate, trend);
    const factors = [];

    for (const query of queries) {
      try {
        const result = await this.executeBraveSearch(query, 5);
        const searchResults = result.web?.results || [];

        searchResults.forEach(item => {
          const content = `${item.title} ${item.description}`.toLowerCase();
          
          if (content.includes('障害') || content.includes('メンテナンス')) {
            factors.push({
              type: 'SYSTEM_ISSUE',
              title: item.title,
              description: item.description,
              url: item.url,
              severity: 'HIGH'
            });
          }

          if (content.includes('急落') || content.includes('暴落')) {
            factors.push({
              type: 'MARKET_DECLINE',
              title: item.title,
              description: item.description,
              url: item.url,
              severity: 'HIGH'
            });
          }

          if (content.includes('金利') || content.includes('frb')) {
            factors.push({
              type: 'POLICY_CHANGE',
              title: item.title,
              description: item.description,
              url: item.url,
              severity: 'MEDIUM'
            });
          }
        });
      } catch (error) {
        console.error(`Search error for query "${query}":`, error.message);
      }
    }

    return factors;
  }

  /**
   * 市場クエリ生成
   */
  generateMarketQueries(maintenanceRate, trend) {
    const baseQueries = [
      'moomoo証券 最新ニュース',
      '米国株式市場 今日 動向'
    ];

    if (maintenanceRate < 180) {
      baseQueries.push(
        'moomoo証券 障害 メンテナンス 今日',
        '米国株 急落 原因 速報',
        'FRB 金利 発表 影響 株価'
      );
    }

    if (trend === 'DECLINING') {
      baseQueries.push(
        '株式市場 暴落 原因 今日',
        '証券会社 システム障害 今日'
      );
    }

    return baseQueries.slice(0, 5);
  }

  /**
   * Brave Search API実行
   */
  async executeBraveSearch(query, count = 10) {
    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': this.apiKey
      },
      params: {
        q: query,
        count: count,
        search_lang: 'ja_JP'
      }
    });

    return response.data;
  }

  /**
   * リスクレベル計算
   */
  calculateRiskLevel(maintenanceRate, factors) {
    if (maintenanceRate < 160) return 'CRITICAL';
    if (maintenanceRate < 170) return 'HIGH';
    if (maintenanceRate < 180) return 'MEDIUM';
    if (factors.some(f => f.severity === 'HIGH')) return 'LOW';
    return 'SAFE';
  }

  /**
   * 推奨事項生成
   */
  generateRecommendations(maintenanceRate, factors) {
    const recommendations = [];

    if (maintenanceRate < 170) {
      recommendations.push('リスク軽減のため、ポジション調整を検討してください。');
    }

    if (factors.length > 0) {
      recommendations.push(`${factors.length}件の市場要因を検出しました。詳細を確認してください。`);
    }

    if (maintenanceRate < 180) {
      recommendations.push('維持率改善のため、追加証拠金の入金を検討してください。');
    }

    return recommendations;
  }

  /**
   * サーバー起動
   */
  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Brave Search HTTP Server started on port ${this.port}`);
      console.log(`📊 Health check: http://localhost:${this.port}/health`);
      console.log(`🔍 API endpoints:`);
      console.log(`   GET  /api/maintenance-rate`);
      console.log(`   POST /api/brave-search`);
      console.log(`   POST /api/search-news`);
    });
  }
}

// サーバー起動
if (require.main === module) {
  const server = new BraveSearchHTTPServer();
  server.start();
}

module.exports = BraveSearchHTTPServer;
