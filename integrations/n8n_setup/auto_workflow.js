#!/usr/bin/env node

/**
 * n8n自動ワークフロー統合スクリプト
 * 5分ごとの維持率監視とBrave Search統合
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../brave_integration/.env') });

class N8nAutoWorkflow {
  constructor() {
    this.n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    this.workflowId = null;
    this.isRunning = false;
    this.interval = null;
    this.logFile = path.join(__dirname, '../../logs/n8n_workflow.log');
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
   * n8nワークフロー作成
   */
  async createWorkflow() {
    try {
      this.log('n8nワークフロー作成開始...');
      
      const workflowData = {
        name: 'TradingSystem2025 Auto Workflow',
        active: true,
        nodes: [
          {
            parameters: {
              rule: {
                interval: [
                  {
                    field: 'minutes',
                    value: 5
                  }
                ]
              }
            },
            id: 'trigger',
            name: 'Trigger',
            type: 'n8n-nodes-base.cron',
            typeVersion: 1,
            position: [240, 300]
          },
          {
            parameters: {
              httpMethod: 'GET',
              url: 'http://localhost:3001/api/maintenance-rate',
              options: {}
            },
            id: 'get-maintenance-rate',
            name: 'Get Maintenance Rate',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 4.1,
            position: [460, 300]
          },
          {
            parameters: {
              conditions: {
                options: {
                  caseSensitive: true,
                  leftValue: '',
                  typeValidation: 'strict'
                },
                conditions: [
                  {
                    id: 'rate-check',
                    leftValue: '={{ $json.maintenanceRate }}',
                    rightValue: 180,
                    operator: {
                      type: 'number',
                      operation: 'lt'
                    }
                  }
                ],
                combinator: 'and'
              },
              options: {}
            },
            id: 'rate-condition',
            name: 'Rate Condition',
            type: 'n8n-nodes-base.if',
            typeVersion: 1,
            position: [680, 300]
          },
          {
            parameters: {
              httpMethod: 'POST',
              url: 'http://localhost:3001/api/brave-search',
              sendBody: true,
              bodyParameters: {
                parameters: [
                  {
                    name: 'maintenanceRate',
                    value: '={{ $json.maintenanceRate }}'
                  },
                  {
                    name: 'trend',
                    value: '={{ $json.trend || "STABLE" }}'
                  }
                ]
              },
              options: {}
            },
            id: 'brave-search',
            name: 'Brave Search',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 4.1,
            position: [900, 200]
          },
          {
            parameters: {
              jsCode: `
// アラート生成処理
const input = $input.first().json;
const searchResult = input.braveSearchResult;

// アラートレベル判定
let alertLevel = 'INFO';
let alertMessage = '';

if (input.maintenanceRate < 160) {
  alertLevel = 'EMERGENCY';
  alertMessage = '🚨 緊急対応が必要です！';
} else if (input.maintenanceRate < 170) {
  alertLevel = 'CRITICAL';
  alertMessage = '⚠️ 重要アラート：リスク軽減が必要です。';
} else if (input.maintenanceRate < 180) {
  alertLevel = 'WARNING';
  alertMessage = '⚠️ 警告：注意レベルです。';
}

// 市況要因がある場合は追加情報を付与
if (searchResult && searchResult.marketFactors && searchResult.marketFactors.length > 0) {
  alertMessage += \`\\n\\n🔍 検出された市場要因: \${searchResult.marketFactors.length}件\`;
  
  searchResult.marketFactors.forEach((factor, index) => {
    alertMessage += \`\\n\${index + 1}. \${factor.type}: \${factor.title}\`;
  });
}

// 推奨事項を追加
if (searchResult && searchResult.recommendations) {
  alertMessage += '\\n\\n💡 推奨事項:';
  searchResult.recommendations.forEach((rec, index) => {
    alertMessage += \`\\n\${index + 1}. \${rec}\`;
  });
}

return {
  json: {
    alertLevel,
    alertMessage,
    maintenanceRate: input.maintenanceRate,
    trend: input.trend,
    marketFactors: searchResult?.marketFactors || [],
    recommendations: searchResult?.recommendations || [],
    timestamp: new Date().toISOString()
  }
};`
            },
            id: 'alert-generator',
            name: 'Alert Generator',
            type: 'n8n-nodes-base.code',
            typeVersion: 2,
            position: [1120, 200]
          },
          {
            parameters: {
              conditions: {
                options: {
                  caseSensitive: true,
                  leftValue: '',
                  typeValidation: 'strict'
                },
                conditions: [
                  {
                    id: 'alert-check',
                    leftValue: '={{ $json.alertLevel }}',
                    rightValue: 'INFO',
                    operator: {
                      type: 'string',
                      operation: 'notEqual'
                    }
                  }
                ],
                combinator: 'and'
              },
              options: {}
            },
            id: 'alert-condition',
            name: 'Alert Condition',
            type: 'n8n-nodes-base.if',
            typeVersion: 1,
            position: [1340, 200]
          },
          {
            parameters: {
              jsCode: `
// 通知処理
const input = $input.first().json;

// コンソール出力（実際の実装ではSlack、メール等に変更）
console.log('🚨 アラート通知:', input.alertMessage);

// ログファイルに記録
const logEntry = {
  timestamp: new Date().toISOString(),
  alertLevel: input.alertLevel,
  maintenanceRate: input.maintenanceRate,
  message: input.alertMessage.substring(0, 100) + '...'
};

return {
  json: {
    ...input,
    notificationSent: true,
    logEntry
  }
};`
            },
            id: 'notification',
            name: 'Notification',
            type: 'n8n-nodes-base.code',
            typeVersion: 2,
            position: [1560, 100]
          }
        ],
        connections: {
          'Trigger': {
            main: [
              [
                {
                  node: 'Get Maintenance Rate',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          },
          'Get Maintenance Rate': {
            main: [
              [
                {
                  node: 'Rate Condition',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          },
          'Rate Condition': {
            main: [
              [
                {
                  node: 'Brave Search',
                  type: 'main',
                  index: 0
                }
              ],
              []
            ]
          },
          'Brave Search': {
            main: [
              [
                {
                  node: 'Alert Generator',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          },
          'Alert Generator': {
            main: [
              [
                {
                  node: 'Alert Condition',
                  type: 'main',
                  index: 0
                }
              ]
            ]
          },
          'Alert Condition': {
            main: [
              [
                {
                  node: 'Notification',
                  type: 'main',
                  index: 0
                }
              ],
              []
            ]
          }
        },
        settings: {
          executionOrder: 'v1'
        },
        staticData: null,
        tags: [
          {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            id: 'trading-system-2025',
            name: 'TradingSystem2025'
          }
        ],
        triggerCount: 0,
        updatedAt: new Date().toISOString(),
        versionId: '1'
      };

      const response = await axios.post(`${this.n8nBaseUrl}/rest/workflows`, workflowData, {
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': process.env.N8N_API_KEY || ''
        }
      });

      this.workflowId = response.data.id;
      this.log(`✅ ワークフロー作成成功: ID ${this.workflowId}`);
      
      return this.workflowId;
    } catch (error) {
      this.log(`❌ ワークフロー作成失敗: ${error.message}`);
      throw error;
    }
  }

  /**
   * ワークフロー有効化
   */
  async activateWorkflow() {
    try {
      if (!this.workflowId) {
        throw new Error('ワークフローIDが設定されていません');
      }

      this.log('ワークフロー有効化中...');
      
      await axios.patch(`${this.n8nBaseUrl}/rest/workflows/${this.workflowId}`, {
        active: true
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': process.env.N8N_API_KEY || ''
        }
      });

      this.log('✅ ワークフロー有効化成功');
    } catch (error) {
      this.log(`❌ ワークフロー有効化失敗: ${error.message}`);
      throw error;
    }
  }

  /**
   * 手動実行テスト
   */
  async testExecution() {
    try {
      this.log('手動実行テスト開始...');
      
      // 維持率取得テスト
      const maintenanceResponse = await axios.get('http://localhost:3001/api/maintenance-rate');
      this.log(`維持率: ${maintenanceResponse.data.maintenanceRate}%`);
      
      // Brave Search統合テスト
      const searchResponse = await axios.post('http://localhost:3001/api/brave-search', {
        maintenanceRate: maintenanceResponse.data.maintenanceRate,
        trend: maintenanceResponse.data.trend || 'STABLE'
      });
      
      this.log(`検索結果: ${searchResponse.data.marketFactors?.length || 0}件の市場要因`);
      this.log('✅ 手動実行テスト成功');
      
      return {
        maintenanceRate: maintenanceResponse.data.maintenanceRate,
        searchResult: searchResponse.data
      };
    } catch (error) {
      this.log(`❌ 手動実行テスト失敗: ${error.message}`);
      throw error;
    }
  }

  /**
   * 自動実行開始
   */
  startAutoExecution() {
    if (this.isRunning) {
      this.log('⚠️ 自動実行は既に開始されています');
      return;
    }

    this.log('🚀 自動実行開始（5分間隔）...');
    this.isRunning = true;

    // 初回実行
    this.testExecution().catch(error => {
      this.log(`初回実行エラー: ${error.message}`);
    });

    // 5分間隔で実行
    this.interval = setInterval(async () => {
      try {
        await this.testExecution();
      } catch (error) {
        this.log(`自動実行エラー: ${error.message}`);
      }
    }, 5 * 60 * 1000); // 5分
  }

  /**
   * 自動実行停止
   */
  stopAutoExecution() {
    if (!this.isRunning) {
      this.log('⚠️ 自動実行は開始されていません');
      return;
    }

    this.log('🛑 自動実行停止...');
    this.isRunning = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * ステータス確認
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      workflowId: this.workflowId,
      n8nBaseUrl: this.n8nBaseUrl,
      lastLog: fs.existsSync(this.logFile) ? 
        fs.readFileSync(this.logFile, 'utf8').split('\n').slice(-5).join('\n') : 
        'ログファイルが存在しません'
    };
  }
}

// メイン実行
if (require.main === module) {
  const workflow = new N8nAutoWorkflow();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
      workflow.createWorkflow()
        .then(() => workflow.activateWorkflow())
        .then(() => {
          console.log('🎉 n8nワークフロー設定完了');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ エラー:', error.message);
          process.exit(1);
        });
      break;
      
    case 'test':
      workflow.testExecution()
        .then(() => {
          console.log('✅ テスト完了');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ テスト失敗:', error.message);
          process.exit(1);
        });
      break;
      
    case 'start':
      workflow.startAutoExecution();
      console.log('🚀 自動実行開始（Ctrl+Cで停止）');
      break;
      
    case 'stop':
      workflow.stopAutoExecution();
      console.log('🛑 自動実行停止');
      process.exit(0);
      break;
      
    case 'status':
      const status = workflow.getStatus();
      console.log('📊 ステータス:', JSON.stringify(status, null, 2));
      break;
      
    default:
      console.log(`
n8n自動ワークフロー統合スクリプト

使用方法:
  node auto_workflow.js create  # ワークフロー作成
  node auto_workflow.js test    # テスト実行
  node auto_workflow.js start   # 自動実行開始
  node auto_workflow.js stop    # 自動実行停止
  node auto_workflow.js status  # ステータス確認
      `);
      break;
  }
}

module.exports = N8nAutoWorkflow;


