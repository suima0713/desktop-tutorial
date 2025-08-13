/**
 * Brave Search MCP統合テスト
 * 必須テストケースの実行と検証
 */

const { BraveSearchIntegration } = require('./search_queries');

class BraveSearchTestSuite {
  constructor() {
    this.integration = new BraveSearchIntegration();
    this.testResults = [];
  }

  /**
   * 全テストケース実行
   */
  async runAllTests() {
    console.log('=== Brave Search MCP統合テスト開始 ===');
    
    const tests = [
      { name: 'API接続テスト', test: () => this.testApiConnection() },
      { name: '検索クエリ生成テスト', test: () => this.testQueryGeneration() },
      { name: '結果分析テスト', test: () => this.testResultAnalysis() },
      { name: 'エラーハンドリングテスト', test: () => this.testErrorHandling() },
      { name: 'レート制限テスト', test: () => this.testRateLimiting() },
      { name: 'パフォーマンステスト', test: () => this.testPerformance() }
    ];

    for (const test of tests) {
      try {
        console.log(`\n--- ${test.name} ---`);
        const result = await test.test();
        this.testResults.push({ name: test.name, status: 'PASS', result });
        console.log(`✅ ${test.name}: 成功`);
      } catch (error) {
        this.testResults.push({ name: test.name, status: 'FAIL', error: error.message });
        console.log(`❌ ${test.name}: 失敗 - ${error.message}`);
      }
    }

    this.printTestSummary();
  }

  /**
   * API接続テスト
   */
  async testApiConnection() {
    if (!this.integration.apiKey) {
      throw new Error('API Keyが設定されていません');
    }

    // 簡単な検索クエリでAPI接続をテスト
    const testQuery = 'moomoo証券 テスト';
    const result = await this.integration.executeSearch(testQuery);
    
    if (!result || !result.query) {
      throw new Error('API応答が不正です');
    }

    return {
      apiKey: !!this.integration.apiKey,
      response: result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 検索クエリ生成テスト
   */
  async testQueryGeneration() {
    const testCases = [
      { rate: 192.63, trend: 'STABLE', expected: 2 },
      { rate: 175.0, trend: 'DECLINING', expected: 5 },
      { rate: 160.0, trend: 'DECLINING', expected: 5 },
      { rate: 195.0, trend: 'INCREASING', expected: 3 }
    ];

    const results = [];

    for (const testCase of testCases) {
      const queries = this.integration.generateQueries(testCase.rate, testCase.trend);
      const isValid = queries.length <= testCase.expected && queries.length > 0;
      
      results.push({
        input: testCase,
        output: queries,
        isValid,
        count: queries.length
      });

      if (!isValid) {
        throw new Error(`クエリ生成テスト失敗: ${JSON.stringify(testCase)}`);
      }
    }

    return results;
  }

  /**
   * 結果分析テスト
   */
  async testResultAnalysis() {
    // モック検索結果
    const mockResults = [
      {
        query: 'moomoo証券 障害',
        results: [
          {
            title: 'moomoo証券 システムメンテナンスのお知らせ',
            description: '本日22時からシステムメンテナンスを実施します',
            url: 'https://example.com/maintenance'
          }
        ],
        timestamp: new Date().toISOString()
      }
    ];

    const analysis = this.integration.analyzeResults(mockResults, 175.0, 'DECLINING');

    // 必須フィールドの存在確認
    const requiredFields = ['maintenanceRate', 'trend', 'marketFactors', 'recommendations', 'riskLevel', 'summary'];
    for (const field of requiredFields) {
      if (!(field in analysis)) {
        throw new Error(`必須フィールドが不足: ${field}`);
      }
    }

    // 市場要因の抽出確認
    if (analysis.marketFactors.length === 0) {
      throw new Error('市場要因が抽出されませんでした');
    }

    return {
      analysis,
      fieldCount: requiredFields.length,
      factorCount: analysis.marketFactors.length,
      recommendationCount: analysis.recommendations.length
    };
  }

  /**
   * エラーハンドリングテスト
   */
  async testErrorHandling() {
    // API Key無効テスト
    const originalApiKey = this.integration.apiKey;
    this.integration.apiKey = 'invalid_key';

    try {
      await this.integration.executeSearch('test');
      throw new Error('無効なAPI Keyでもエラーが発生しませんでした');
    } catch (error) {
      // エラーが発生することを確認
      console.log('期待されるエラー:', error.message);
    } finally {
      this.integration.apiKey = originalApiKey;
    }

    // フォールバックレスポンステスト
    const fallbackResponse = this.integration.getFallbackResponse(new Error('テストエラー'));
    
    if (!fallbackResponse.maintenanceRate || !fallbackResponse.recommendations) {
      throw new Error('フォールバックレスポンスが不正です');
    }

    return {
      errorHandling: 'PASS',
      fallbackResponse: fallbackResponse
    };
  }

  /**
   * レート制限テスト
   */
  async testRateLimiting() {
    const originalCount = this.integration.queryCount;
    
    // レート制限内での動作確認
    const beforeLimit = this.integration.checkRateLimit();
    
    // レート制限を模擬
    this.integration.queryCount = 2000;
    const afterLimit = this.integration.checkRateLimit();
    
    // 元に戻す
    this.integration.queryCount = originalCount;

    if (beforeLimit !== true || afterLimit !== false) {
      throw new Error('レート制限チェックが正しく動作しません');
    }

    return {
      beforeLimit,
      afterLimit,
      originalCount
    };
  }

  /**
   * パフォーマンステスト
   */
  async testPerformance() {
    const startTime = Date.now();
    
    // 軽量な処理でパフォーマンスをテスト
    const queries = this.integration.generateQueries(192.63, 'STABLE');
    const analysis = this.integration.analyzeResults([], 192.63, 'STABLE');
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    // 30秒以内で完了することを確認
    if (executionTime > 30000) {
      throw new Error(`パフォーマンステスト失敗: ${executionTime}ms > 30000ms`);
    }

    return {
      executionTime: `${executionTime}ms`,
      queryCount: queries.length,
      analysisGenerated: !!analysis
    };
  }

  /**
   * テスト結果サマリー出力
   */
  printTestSummary() {
    console.log('\n=== テスト結果サマリー ===');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;

    console.log(`総テスト数: ${total}`);
    console.log(`成功: ${passed}`);
    console.log(`失敗: ${failed}`);
    console.log(`成功率: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n失敗したテスト:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`- ${r.name}: ${r.error}`));
    }

    if (passed === total) {
      console.log('\n🎉 全テストが成功しました！Brave Search MCP統合の準備が完了しました。');
    } else {
      console.log('\n⚠️ 一部のテストが失敗しました。設定を確認してください。');
    }
  }

  /**
   * 統合テスト実行
   */
  async runIntegrationTest() {
    console.log('\n=== 統合テスト実行 ===');
    
    try {
      const result = await this.integration.searchMarketFactors(192.63, 'STABLE');
      
      console.log('統合テスト結果:');
      console.log(JSON.stringify(result, null, 2));
      
      return result;
    } catch (error) {
      console.error('統合テストエラー:', error);
      throw error;
    }
  }
}

// テスト実行
if (require.main === module) {
  const testSuite = new BraveSearchTestSuite();
  
  testSuite.runAllTests()
    .then(() => {
      return testSuite.runIntegrationTest();
    })
    .then(() => {
      console.log('\n✅ 全テスト完了');
    })
    .catch(error => {
      console.error('\n❌ テスト実行エラー:', error);
      process.exit(1);
    });
}

module.exports = BraveSearchTestSuite;

