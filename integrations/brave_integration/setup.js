#!/usr/bin/env node

/**
 * Brave Search MCP統合セットアップスクリプト
 * 必要なパッケージのインストールと設定を行います
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BraveSearchSetup {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.braveIntegrationPath = __dirname;
    this.setupLog = [];
  }

  /**
   * セットアップ実行
   */
  async runSetup() {
    console.log('🚀 Brave Search MCP統合セットアップ開始');
    
    try {
      await this.checkPrerequisites();
      await this.installDependencies();
      await this.setupEnvironment();
      await this.setupClaudeDesktop();
      await this.setupN8n();
      await this.runTests();
      await this.generateDocumentation();
      
      console.log('\n✅ セットアップ完了！');
      this.printSummary();
    } catch (error) {
      console.error('\n❌ セットアップエラー:', error.message);
      this.printTroubleshooting();
      process.exit(1);
    }
  }

  /**
   * 前提条件チェック
   */
  async checkPrerequisites() {
    console.log('\n📋 前提条件チェック...');
    
    const checks = [
      { name: 'Node.js', check: () => this.checkNodeVersion() },
      { name: 'npm', check: () => this.checkNpm() },
      { name: 'Git', check: () => this.checkGit() },
      { name: 'Python', check: () => this.checkPython() }
    ];

    for (const check of checks) {
      try {
        await check.check();
        this.log(`✅ ${check.name}: OK`);
      } catch (error) {
        this.log(`❌ ${check.name}: ${error.message}`);
        throw new Error(`${check.name}の確認に失敗しました`);
      }
    }
  }

  /**
   * Node.jsバージョンチェック
   */
  checkNodeVersion() {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
      throw new Error(`Node.js 16以上が必要です。現在: ${version}`);
    }
  }

  /**
   * npmチェック
   */
  checkNpm() {
    try {
      execSync('npm --version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('npmが見つかりません');
    }
  }

  /**
   * Gitチェック
   */
  checkGit() {
    try {
      execSync('git --version', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Gitが見つかりません');
    }
  }

  /**
   * Pythonチェック
   */
  checkPython() {
    try {
      execSync('python --version', { stdio: 'pipe' });
    } catch (error) {
      try {
        execSync('python3 --version', { stdio: 'pipe' });
      } catch (error2) {
        throw new Error('Pythonが見つかりません');
      }
    }
  }

  /**
   * 依存関係インストール
   */
  async installDependencies() {
    console.log('\n📦 依存関係インストール...');
    
    const packages = [
      'node-fetch',
      'dotenv',
      'winston',
      'axios'
    ];

    for (const pkg of packages) {
      try {
        this.log(`インストール中: ${pkg}`);
        execSync(`npm install ${pkg}`, { 
          cwd: this.projectRoot,
          stdio: 'pipe' 
        });
      } catch (error) {
        throw new Error(`${pkg}のインストールに失敗しました: ${error.message}`);
      }
    }
  }

  /**
   * 環境変数設定
   */
  async setupEnvironment() {
    console.log('\n🔧 環境変数設定...');
    
    const envExamplePath = path.join(this.braveIntegrationPath, 'env.example');
    const envPath = path.join(this.projectRoot, '.env');
    
    if (!fs.existsSync(envPath)) {
      try {
        fs.copyFileSync(envExamplePath, envPath);
        this.log('✅ .envファイルを作成しました');
        this.log('⚠️  .envファイルを編集してAPI Keyを設定してください');
      } catch (error) {
        throw new Error('.envファイルの作成に失敗しました');
      }
    } else {
      this.log('✅ .envファイルは既に存在します');
    }
  }

  /**
   * Claude Desktop設定
   */
  async setupClaudeDesktop() {
    console.log('\n🤖 Claude Desktop MCP設定...');
    
    // Windows対応のパス設定
    const homeDir = process.env.USERPROFILE || process.env.HOME;
    const configPath = path.join(homeDir, '.config', 'claude-desktop', 'claude_mcp_settings.json');
    const configDir = path.dirname(configPath);
    
    try {
      // 設定ディレクトリ作成
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      // 設定ファイル作成
      const config = {
        "mcpServers": {
          "brave-search": {
            "command": "node",
            "args": [path.join(this.braveIntegrationPath, "brave_search_mcp.js")],
            "env": {
              "BRAVE_API_KEY": "<実際のAPIキーを設定>"
            }
          }
        }
      };
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      this.log('✅ Claude Desktop MCP設定を作成しました');
      this.log('⚠️  API Keyを設定ファイルに設定してください');
    } catch (error) {
      throw new Error(`Claude Desktop設定に失敗しました: ${error.message}`);
    }
  }

  /**
   * n8n設定
   */
  async setupN8n() {
    console.log('\n🔄 n8n設定...');
    
    const workflowPath = path.join(this.braveIntegrationPath, 'n8n_workflow.json');
    const n8nWorkflowsPath = path.join(this.projectRoot, 'n8n_setup', 'workflows');
    
    try {
      // n8nワークフローディレクトリ作成
      if (!fs.existsSync(n8nWorkflowsPath)) {
        fs.mkdirSync(n8nWorkflowsPath, { recursive: true });
      }
      
      // ワークフローファイルコピー
      const workflowDest = path.join(n8nWorkflowsPath, 'brave_search_integration.json');
      fs.copyFileSync(workflowPath, workflowDest);
      
      this.log('✅ n8nワークフローを作成しました');
      this.log('📝 n8nでワークフローをインポートしてください');
    } catch (error) {
      throw new Error(`n8n設定に失敗しました: ${error.message}`);
    }
  }

  /**
   * テスト実行
   */
  async runTests() {
    console.log('\n🧪 テスト実行...');
    
    try {
      const testPath = path.join(this.braveIntegrationPath, 'test_integration.js');
      execSync(`node ${testPath}`, { 
        cwd: this.braveIntegrationPath,
        stdio: 'inherit' 
      });
      this.log('✅ テストが成功しました');
    } catch (error) {
      this.log('⚠️  テストに失敗しました（API Key未設定の可能性）');
      this.log('    API Keyを設定後に再実行してください');
    }
  }

  /**
   * ドキュメント生成
   */
  async generateDocumentation() {
    console.log('\n📚 ドキュメント生成...');
    
    const readmePath = path.join(this.braveIntegrationPath, 'README.md');
    const readmeContent = this.generateReadme();
    
    try {
      fs.writeFileSync(readmePath, readmeContent);
      this.log('✅ README.mdを生成しました');
    } catch (error) {
      throw new Error(`ドキュメント生成に失敗しました: ${error.message}`);
    }
  }

  /**
   * README生成
   */
  generateReadme() {
    return `# Brave Search MCP統合

## 概要
証券取引の維持率監視システムにBrave Search APIを統合し、リアルタイム市況分析機能を提供します。

## セットアップ完了項目
- ✅ Node.js依存関係インストール
- ✅ 環境変数設定
- ✅ Claude Desktop MCP設定
- ✅ n8nワークフロー作成
- ✅ テスト実行

## 次のステップ
1. \`.env\`ファイルでAPI Keyを設定
2. n8nでワークフローをインポート
3. Claude DesktopでMCP設定を確認
4. システムテスト実行

## 使用方法
\`\`\`bash
# テスト実行
node brave_integration/test_integration.js

# 統合テスト
node brave_integration/search_queries.js
\`\`\`

## トラブルシューティング
- API Keyが設定されていない場合、テストが失敗します
- n8nが起動していない場合、ワークフローが実行できません
- Claude Desktopの設定を確認してください

## サポート
問題が発生した場合は、ログファイルを確認してください。
`;
  }

  /**
   * ログ記録
   */
  log(message) {
    this.setupLog.push(`[${new Date().toISOString()}] ${message}`);
    console.log(message);
  }

  /**
   * サマリー出力
   */
  printSummary() {
    console.log('\n📊 セットアップサマリー');
    console.log('========================');
    
    this.setupLog.forEach(log => {
      console.log(log);
    });
    
    console.log('\n🎯 次のアクション:');
    console.log('1. .envファイルでBRAVE_API_KEYを設定');
    console.log('2. n8nを起動してワークフローをインポート');
    console.log('3. Claude DesktopでMCP設定を確認');
    console.log('4. システムテストを実行');
  }

  /**
   * トラブルシューティング情報
   */
  printTroubleshooting() {
    console.log('\n🔧 トラブルシューティング');
    console.log('========================');
    console.log('1. Node.js 16以上がインストールされているか確認');
    console.log('2. npmが利用可能か確認');
    console.log('3. インターネット接続を確認');
    console.log('4. 権限エラーの場合は管理者権限で実行');
    console.log('5. ログファイルで詳細を確認');
  }
}

// セットアップ実行
if (require.main === module) {
  const setup = new BraveSearchSetup();
  setup.runSetup();
}

module.exports = BraveSearchSetup;
