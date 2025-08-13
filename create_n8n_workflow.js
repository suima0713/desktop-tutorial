const fs = require('fs');
const path = require('path');

const workflow = {
    "name": "Trading Alert System",
    "nodes": [
        {
            "parameters": {
                "rule": {
                    "interval": [{"field": "minutes", "minutesInterval": 5}]
                }
            },
            "name": "Schedule Trigger",
            "type": "n8n-nodes-base.scheduleTrigger",
            "typeVersion": 1,
            "position": [250, 300],
            "webhookId": "schedule-trigger"
        },
        {
            "parameters": {
                "url": "http://localhost:3001/search",
                "method": "POST",
                "sendHeaders": true,
                "headerParameters": {
                    "parameters": [
                        {
                            "name": "Content-Type",
                            "value": "application/json"
                        }
                    ]
                },
                "sendBody": true,
                "bodyParameters": {
                    "parameters": [{
                        "name": "query",
                        "value": "日経平均 マージンコール {{$now}}"
                    }]
                },
                "options": {}
            },
            "name": "Brave Search",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.1,
            "position": [450, 300]
        },
        {
            "parameters": {
                "conditions": {
                    "options": {
                        "caseSensitive": true,
                        "leftValue": "",
                        "typeValidation": "strict"
                    },
                    "conditions": [
                        {
                            "id": "condition1",
                            "leftValue": "={{ $json.success }}",
                            "rightValue": true,
                            "operator": {
                                "type": "boolean",
                                "operation": "equal"
                            }
                        }
                    ],
                    "combinator": "and"
                },
                "options": {}
            },
            "name": "Check Success",
            "type": "n8n-nodes-base.if",
            "typeVersion": 2,
            "position": [650, 300]
        },
        {
            "parameters": {
                "message": "=🚨 トレーディングアラート\n\n検索クエリ: {{ $json.query }}\n結果数: {{ $json.results.length }}\n時刻: {{ $json.timestamp }}\n\n最新結果:\n{{ $json.results[0].title }}\n{{ $json.results[0].url }}",
                "additionalFields": {}
            },
            "name": "Send Alert",
            "type": "n8n-nodes-base.noOp",
            "typeVersion": 1,
            "position": [850, 200]
        },
        {
            "parameters": {
                "message": "=❌ 検索失敗\n\nエラー: {{ $json.error }}\n時刻: {{ $now }}",
                "additionalFields": {}
            },
            "name": "Error Alert",
            "type": "n8n-nodes-base.noOp",
            "typeVersion": 1,
            "position": [850, 400]
        }
    ],
    "connections": {
        "Schedule Trigger": {
            "main": [[{"node": "Brave Search", "type": "main", "index": 0}]]
        },
        "Brave Search": {
            "main": [[{"node": "Check Success", "type": "main", "index": 0}]]
        },
        "Check Success": {
            "main": [
                [{"node": "Send Alert", "type": "main", "index": 0}],
                [{"node": "Error Alert", "type": "main", "index": 0}]
            ]
        }
    },
    "active": true,
    "settings": {
        "executionOrder": "v1"
    },
    "versionId": "1",
    "meta": {
        "templateCredsSetupCompleted": true
    },
    "id": "trading-alert-system",
    "tags": ["trading", "alerts", "automation"]
};

// ワークフローファイルを保存
const workflowPath = path.join(__dirname, 'n8n_workflow.json');
fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2));

console.log('✅ n8nワークフロー作成完了');
console.log(`📁 保存場所: ${workflowPath}`);
console.log('\n📋 使用方法:');
console.log('1. n8nを起動: n8n start');
console.log('2. ブラウザで http://localhost:5678 にアクセス');
console.log('3. ワークフロー → インポート → このファイルを選択');
console.log('4. ワークフローを有効化して実行開始');
console.log('\n🎯 機能:');
console.log('- 5分間隔で自動検索実行');
console.log('- 日経平均とマージンコール関連情報を検索');
console.log('- 成功/失敗に応じたアラート生成');


