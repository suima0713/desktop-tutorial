#!/usr/bin/env node

/**
 * Brave Search MCP Server
 * Model Context Protocol準拠のBrave Search統合サーバー
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const axios = require('axios');
require('dotenv').config();

class BraveSearchMCPServer {
  constructor() {
    this.apiKey = process.env.BRAVE_API_KEY;
    this.server = new Server(
      {
        name: 'brave-search-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
  }

  /**
   * サーバー初期化
   */
  async initialize() {
    // ツール定義
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_market_factors':
            return await this.searchMarketFactors(args);
          case 'search_news':
            return await this.searchNews(args);
          case 'analyze_trend':
            return await this.analyzeTrend(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });

    // ツール定義
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'search_market_factors',
            description: '維持率変動に基づく市場要因を検索します',
            inputSchema: {
              type: 'object',
              properties: {
                maintenanceRate: {
                  type: 'number',
                  description: '現在の維持率',
                },
                trend: {
                  type: 'string',
                  enum: ['INCREASING', 'DECLINING', 'STABLE'],
                  description: '維持率のトレンド',
                },
              },
              required: ['maintenanceRate'],
            },
          },
          {
            name: 'search_news',
            description: '指定されたキーワードでニュースを検索します',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: '検索クエリ',
                },
                count: {
                  type: 'number',
                  description: '取得件数（デフォルト: 10）',
                  default: 10,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'analyze_trend',
            description: '市場トレンドを分析します',
            inputSchema: {
              type: 'object',
              properties: {
                keywords: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '分析対象のキーワード',
                },
              },
              required: ['keywords'],
            },
          },
        ],
      };
    });
  }

  /**
   * 市場要因検索
   */
  async searchMarketFactors(args) {
    const { maintenanceRate, trend = 'STABLE' } = args;
    
    const queries = this.generateMarketQueries(maintenanceRate, trend);
    const results = [];

    for (const query of queries) {
      try {
        const searchResult = await this.executeBraveSearch(query);
        results.push({
          query,
          results: searchResult.web?.results || [],
        });
      } catch (error) {
        console.error(`Search error for query "${query}":`, error.message);
      }
    }

    const analysis = this.analyzeMarketFactors(results, maintenanceRate, trend);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(analysis, null, 2),
        },
      ],
    };
  }

  /**
   * ニュース検索
   */
  async searchNews(args) {
    const { query, count = 10 } = args;
    
    try {
      const result = await this.executeBraveSearch(query, count);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              query,
              results: result.web?.results || [],
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`News search failed: ${error.message}`);
    }
  }

  /**
   * トレンド分析
   */
  async analyzeTrend(args) {
    const { keywords } = args;
    const analysis = [];

    for (const keyword of keywords) {
      try {
        const result = await this.executeBraveSearch(keyword, 5);
        const sentiment = this.analyzeSentiment(result.web?.results || []);
        
        analysis.push({
          keyword,
          sentiment,
          resultCount: result.web?.results?.length || 0,
        });
      } catch (error) {
        analysis.push({
          keyword,
          sentiment: 'UNKNOWN',
          error: error.message,
        });
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            analysis,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  /**
   * 市場クエリ生成
   */
  generateMarketQueries(maintenanceRate, trend) {
    const baseQueries = [
      'moomoo証券 最新ニュース',
      '米国株式市場 今日 動向',
    ];

    if (maintenanceRate < 180) {
      baseQueries.push(
        'moomoo証券 障害 メンテナンス 今日',
        '米国株 急落 原因 速報',
        'FRB 金利 発表 影響 株価',
      );
    }

    if (trend === 'DECLINING') {
      baseQueries.push(
        '株式市場 暴落 原因 今日',
        '証券会社 システム障害 今日',
      );
    }

    return baseQueries.slice(0, 5);
  }

  /**
   * Brave Search API実行
   */
  async executeBraveSearch(query, count = 10) {
    if (!this.apiKey) {
      throw new Error('BRAVE_API_KEYが設定されていません');
    }

    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': this.apiKey,
      },
      params: {
        q: query,
        count: count,
        search_lang: 'ja_JP',
      },
    });

    return response.data;
  }

  /**
   * 市場要因分析
   */
  analyzeMarketFactors(searchResults, maintenanceRate, trend) {
    const factors = [];
    const recommendations = [];

    searchResults.forEach(result => {
      result.results?.forEach(item => {
        const content = `${item.title} ${item.description}`.toLowerCase();
        
        if (content.includes('障害') || content.includes('メンテナンス')) {
          factors.push({
            type: 'SYSTEM_ISSUE',
            title: item.title,
            description: item.description,
            url: item.url,
            severity: 'HIGH',
          });
        }

        if (content.includes('急落') || content.includes('暴落')) {
          factors.push({
            type: 'MARKET_DECLINE',
            title: item.title,
            description: item.description,
            url: item.url,
            severity: 'HIGH',
          });
        }

        if (content.includes('金利') || content.includes('frb')) {
          factors.push({
            type: 'POLICY_CHANGE',
            title: item.title,
            description: item.description,
            url: item.url,
            severity: 'MEDIUM',
          });
        }
      });
    });

    // 推奨事項生成
    if (maintenanceRate < 170) {
      recommendations.push('リスク軽減のため、ポジション調整を検討してください。');
    }
    if (factors.length > 0) {
      recommendations.push(`${factors.length}件の市場要因を検出しました。詳細を確認してください。`);
    }

    return {
      maintenanceRate,
      trend,
      factors,
      recommendations,
      riskLevel: this.calculateRiskLevel(maintenanceRate, factors),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * センチメント分析
   */
  analyzeSentiment(results) {
    if (!results || results.length === 0) return 'NEUTRAL';

    const positiveKeywords = ['上昇', '好調', '改善', '成功', '利益'];
    const negativeKeywords = ['下落', '悪化', '損失', '問題', '障害'];

    let positiveCount = 0;
    let negativeCount = 0;

    results.forEach(result => {
      const content = `${result.title} ${result.description}`.toLowerCase();
      
      positiveKeywords.forEach(keyword => {
        if (content.includes(keyword)) positiveCount++;
      });
      
      negativeKeywords.forEach(keyword => {
        if (content.includes(keyword)) negativeCount++;
      });
    });

    if (positiveCount > negativeCount) return 'POSITIVE';
    if (negativeCount > positiveCount) return 'NEGATIVE';
    return 'NEUTRAL';
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
   * サーバー起動
   */
  async start() {
    await this.initialize();
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('Brave Search MCP Server started');
  }
}

// サーバー起動
if (require.main === module) {
  const server = new BraveSearchMCPServer();
  server.start().catch(error => {
    console.error('Server error:', error);
    process.exit(1);
  });
}

module.exports = BraveSearchMCPServer;

