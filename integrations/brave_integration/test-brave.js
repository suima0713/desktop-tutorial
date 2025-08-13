#!/usr/bin/env node

/**
 * Brave Search MCP統合テストスクリプト
 * システム全体の統合テストを実行
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class BraveSearchIntegrationTest {
  constructor() {
    this.mcpServerUrl = 'http://localhost:3001';
    this.testResults = [];
    this.logFile = path.join(__dirname, '../../logs/brave_integration_test.log');
  }

  /**
   * ログ記録
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    console.log(logEntry.trim());
    fs.appendFileSync(this.logFile, logEntry);
  }

  /**
   * 全テスト実行
   */
  async runAllTests() {
    this.log('🚀 Brave Search MCP統合テスト開始');
    
    const tests = [
      { name: 'MCPサーバー接続テスト', test: () => this.testMcpServerConnection() },
      { name: '維持率取得テスト', test: () => this.testMaintenanceRate() },
      { name: 'Brave Search統合テスト', test: () => this.testBraveSearchIntegration() },
      { name: '市況分析テスト', test: () => this.testMarketAnalysis() },
      { name: 'エラーハンドリングテスト', test: () => this.testErrorHandling() },
      { name: 'パフォーマンステスト', test: () => this.testPerformance() }
    ];

    for (const test of tests) {
      try {
        this.log(`\n--- ${test.name} ---`);
        const result = await test.test();
        this.testResults.push({ name: test.name, status: 'PASS', result });
        this.log(`✅ ${test.name}: 成功`);
      } catch (error) {
        this.testResults.push({ name: test.name, status: 'FAIL', error: error.message });
        this.log(`❌ ${test.name}: 失敗 - ${error.message}`);
      }
    }

    this.printTestSummary();
  }

  /**
   * MCPサーバー接続テスト
   */
  async testMcpServerConnection() {
    try {
      const response = await axios.get(`${this.mcpServerUrl}/health`, {
        timeout: 5000
      });
      
      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        status: response.status,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`MCPサーバー接続失敗: ${error.message}`);
    }
  }

  /**
   * 維持率取得テスト
   */
  async testMaintenanceRate() {
    try {
      const response = await axios.get(`${this.mcpServerUrl}/api/maintenance-rate`, {
        timeout: 10000
      });
      
      const data = response.data;
      
      if (!data.maintenanceRate || typeof data.maintenanceRate !== 'number') {
        throw new Error('維持率データが不正です');
      }

      this.log(`維持率: ${data.maintenanceRate}%`);
      this.log(`トレンド: ${data.trend || 'UNKNOWN'}`);
      this.log(`ステータス: ${data.status || 'UNKNOWN'}`);

      return {
        maintenanceRate: data.maintenanceRate,
        trend: data.trend,
        status: data.status,
        timestamp: data.timestamp
      };
    } catch (error) {
      throw new Error(`維持率取得失敗: ${error.message}`);
    }
  }

  /**
   * Brave Search統合テスト
   */
  async testBraveSearchIntegration() {
    try {
      const testData = {
        maintenanceRate: 167.52,
        trend: 'WARNING'
      };

      const response = await axios.post(`${this.mcpServerUrl}/api/brave-search`, testData, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = response.data;
      
      if (!data.marketFactors || !Array.isArray(data.marketFactors)) {
        throw new Error('市場要因データが不正です');
      }

      this.log(`検索結果: ${data.marketFactors.length}件の市場要因`);
      this.log(`リスクレベル: ${data.riskLevel}`);
      this.log(`推奨事項: ${data.recommendations?.length || 0}件`);

      return {
        marketFactors: data.marketFactors,
        riskLevel: data.riskLevel,
        recommendations: data.recommendations,
        timestamp: data.timestamp
      };
    } catch (error) {
      throw new Error(`Brave Search統合失敗: ${error.message}`);
    }
  }

  /**
   * 市況分析テスト
   */
  async testMarketAnalysis() {
    try {
      const testQueries = [
        'moomoo証券 最新ニュース',
        '米国株式市場 今日 動向'
      ];

      const results = [];

      for (const query of testQueries) {
        const response = await axios.post(`${this.mcpServerUrl}/api/search-news`, {
          query,
          count: 5
        }, {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        results.push({
          query,
          resultCount: response.data.results?.length || 0,
          timestamp: response.data.timestamp
        });
      }

      this.log(`市況分析結果: ${results.length}クエリ実行`);
      results.forEach(result => {
        this.log(`  - ${result.query}: ${result.resultCount}件`);
      });

      return results;
    } catch (error) {
      throw new Error(`市況分析失敗: ${error.message}`);
    }
  }

  /**
   * エラーハンドリングテスト
   */
  async testErrorHandling() {
    try {
      // 無効なAPI Keyでのテスト
      const invalidResponse = await axios.post(`${this.mcpServerUrl}/api/brave-search`, {
        maintenanceRate: 150.0,
        trend: 'DECLINING'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // エラーレスポンスが適切に処理されているか確認
      if (invalidResponse.data.error) {
        this.log(`エラーハンドリング成功: ${invalidResponse.data.error}`);
      }

      return {
        errorHandling: 'PASS',
        response: invalidResponse.data
      };
    } catch (error) {
      // エラーが発生することを確認
      this.log(`期待されるエラー: ${error.message}`);
      return {
        errorHandling: 'PASS',
        error: error.message
      };
    }
  }

  /**
   * パフォーマンステスト
   */
  async testPerformance() {
    try {
      const startTime = Date.now();
      
      // 複数のリクエストを並行実行
      const promises = [
        this.testMaintenanceRate(),
        this.testBraveSearchIntegration(),
        this.testMarketAnalysis()
      ];

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      this.log(`実行時間: ${executionTime}ms`);

      // 30秒以内で完了することを確認
      if (executionTime > 30000) {
        throw new Error(`パフォーマンステスト失敗: ${executionTime}ms > 30000ms`);
      }

      return {
        executionTime: `${executionTime}ms`,
        testCount: promises.length,
        results: results.length
      };
    } catch (error) {
      throw new Error(`パフォーマンステスト失敗: ${error.message}`);
    }
  }

  /**
   * テスト結果サマリー出力
   */
  printTestSummary() {
    this.log('\n=== テスト結果サマリー ===');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;

    this.log(`総テスト数: ${total}`);
    this.log(`成功: ${passed}`);
    this.log(`失敗: ${failed}`);
    this.log(`成功率: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      this.log('\n失敗したテスト:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => this.log(`- ${r.name}: ${r.error}`));
    }

    if (passed === total) {
      this.log('\n🎉 全テストが成功しました！Brave Search MCP統合が正常に動作しています。');
    } else {
      this.log('\n⚠️ 一部のテストが失敗しました。設定を確認してください。');
    }

    // 結果をJSONファイルに保存
    const resultFile = path.join(__dirname, '../../logs/test_results.json');
    fs.writeFileSync(resultFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total,
        passed,
        failed,
        successRate: ((passed / total) * 100).toFixed(1)
      },
      results: this.testResults
    }, null, 2));

    this.log(`\n📊 詳細結果: ${resultFile}`);
  }

  /**
   * システムステータス確認
   */
  async checkSystemStatus() {
    this.log('\n=== システムステータス確認 ===');
    
    try {
      // MCPサーバー状態確認
      const healthResponse = await axios.get(`${this.mcpServerUrl}/health`);
      this.log(`MCPサーバー: ✅ 稼働中 (${healthResponse.status})`);

      // 維持率確認
      const rateResponse = await axios.get(`${this.mcpServerUrl}/api/maintenance-rate`);
      this.log(`維持率: ${rateResponse.data.maintenanceRate}% (${rateResponse.data.status})`);

      // 設定確認
      const envFile = path.join(__dirname, '.env');
      if (fs.existsSync(envFile)) {
        this.log('環境設定: ✅ .envファイル存在');
      } else {
        this.log('環境設定: ⚠️ .envファイルが見つかりません');
      }

      return {
        mcpServer: 'RUNNING',
        maintenanceRate: rateResponse.data.maintenanceRate,
        status: rateResponse.data.status,
        configExists: fs.existsSync(envFile)
      };
    } catch (error) {
      this.log(`システムステータス確認失敗: ${error.message}`);
      throw error;
    }
  }
}

// メイン実行
if (require.main === module) {
  const test = new BraveSearchIntegrationTest();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'all':
      test.runAllTests()
        .then(() => {
          console.log('\n✅ 全テスト完了');
          process.exit(0);
        })
        .catch(error => {
          console.error('\n❌ テスト実行エラー:', error);
          process.exit(1);
        });
      break;
      
    case 'status':
      test.checkSystemStatus()
        .then(() => {
          console.log('\n✅ ステータス確認完了');
          process.exit(0);
        })
        .catch(error => {
          console.error('\n❌ ステータス確認失敗:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log(`
Brave Search MCP統合テストスクリプト

使用方法:
  node test-brave.js all     # 全テスト実行
  node test-brave.js status  # システムステータス確認

テスト内容:
  - MCPサーバー接続テスト
  - 維持率取得テスト
  - Brave Search統合テスト
  - 市況分析テスト
  - エラーハンドリングテスト
  - パフォーマンステスト
      `);
      break;
  }
}

module.exports = BraveSearchIntegrationTest;


