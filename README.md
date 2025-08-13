# 🚀 TradingSystem2025 - AI-Human Fusion Trading Platform

## 📋 概要

TradingSystem2025は、AIと人間の融合による次世代トレーディングシステムです。SystemVoice機能により、システムに「声」を与え、リアルタイムでの対話的なコミュニケーションを実現します。

## ✨ 主な機能

- 🤖 **SystemVoice機能**: システムに「声」を与える対話機能
- 🔍 **自動検索**: 5分間隔で日経平均関連情報を自動検索
- 🚨 **リアルタイムアラート**: 重要な情報を即座に通知
- 🔄 **n8n統合**: ワークフロー自動化による高度な処理
- 📊 **ヘルスモニタリング**: システム稼働状況の監視
- 🛡️ **エラーハンドリング**: 堅牢なエラー処理と復旧機能

## 🛠️ システム構成

```
TradingSystem2025/
├── index.html                 # Webインターフェース
├── system_voice.js           # SystemVoiceコアモジュール
├── integrate_system_voice.js # 統合スクリプト
├── test_system_voice.js      # テストスクリプト
├── mcp_server.js             # HTTPサーバー（ポート3001）
├── create_n8n_workflow.js    # n8nワークフロー自動作成
├── test_all_systems.js       # システム統合テスト
├── start_system.ps1          # 完全自動起動スクリプト
├── package.json              # 依存関係管理
├── .env                      # 環境変数設定
└── n8n_workflow.json        # n8nワークフロー設定
```

## 🚀 クイックスタート

### 1. SystemVoice機能のテスト

```bash
# Webインターフェースでテスト
start index.html

# Node.jsでテスト
node test_system_voice.js

# バッチファイルでテスト
test_system_voice.bat
```

### 2. 環境準備

```powershell
# PowerShell 7.x で実行
cd TradingSystem2025
.\start_system.ps1
```

### 3. 手動セットアップ

#### 依存関係インストール
```bash
npm install
```

#### 環境変数設定
`.env`ファイルを作成し、以下を設定：
```env
BRAVE_API_KEY=your_brave_api_key_here
PORT=3001
```

#### HTTPサーバー起動
```bash
node mcp_server.js
```

#### n8nワークフロー作成
```bash
node create_n8n_workflow.js
```

#### システムテスト
```bash
node test_all_systems.js
```

## 📊 API エンドポイント

### ヘルスチェック
```http
GET http://localhost:3001/health
```

### 検索API
```http
POST http://localhost:3001/search
Content-Type: application/json

{
  "query": "日経平均 マージンコール"
}
```

## 🎯 ISP Trading System v2.0

### Phase 1 - 基盤機能
- ✅ リアルタイム株価監視（5銘柄）
- ✅ 設定の永続化（エクスポート/インポート）
- ✅ エラー自動リトライ
- ✅ 統計ダッシュボード
- ✅ SystemVoice（対話機能）

### Phase 2 - インテリジェンス機能
- ✅ 価格トレンド分析（SMA20）
- ✅ リアルタイムトレンド判定
- ✅ 異常検知システム
- ✅ 価格アラート機能
- ✅ マーケットインサイトパネル

### 統合機能
- ✅ Google Analytics統合
- ✅ Cloudflare Worker（CORS回避）
- ✅ GitHub Pages自動デプロイ

### 技術スタック
- Frontend: Vanilla JS + HTML5 + CSS3
- Analytics: Google Analytics 4
- Hosting: GitHub Pages
- API: Polygon.io
- Proxy: Cloudflare Workers

### セットアップ
1. APIキーを取得（Polygon.io）
2. サイトにアクセス
3. APIキーを設定
4. 監視開始

### 使用方法
- 設定管理：左下の⚙️ボタン
- アラート設定：左下の🔔ボタン
- 統計確認：右上のダッシュボード

### 今後の展望
- Phase 3: 自動化拡張（GitHub Actions）
- Phase 4: AI予測統合

### テストAPI
```http
GET http://localhost:3001/test
```

## 🔧 詳細設定

### SystemVoice機能

SystemVoice機能は、システムに「声」を与える機能です：

```javascript
const { SystemVoice } = require('./system_voice.js');

// 基本的な使用
SystemVoice.speak('システムが起動しました', 'success');
SystemVoice.speak('API制限に近づいています', 'warning');
SystemVoice.speak('接続エラーが発生しました', 'error');

// ログレベル設定
SystemVoice.setLogLevel('warning');

// 統計情報取得
const stats = SystemVoice.getStats();
```

### n8nワークフロー設定

1. n8nをインストール：
```bash
npm install -g n8n
```

2. n8nを起動：
```bash
n8n start
```

3. ブラウザで http://localhost:5678 にアクセス

4. ワークフロー → インポート → `n8n_workflow.json` を選択

5. ワークフローを有効化

### カスタム検索クエリ

`create_n8n_workflow.js`を編集して検索クエリを変更：

```javascript
"value": "日経平均 マージンコール {{$now}}"
```

## 🧪 テスト実行

### 統合テスト
```bash
node test_all_systems.js
```

### 個別テスト

#### HTTPサーバーテスト
```bash
curl http://localhost:3001/health
```

#### Brave API テスト
```bash
curl -X POST http://localhost:3001/search \
  -H "Content-Type: application/json" \
  -d '{"query": "日経平均"}'
```

## 📈 パフォーマンス監視

### レスポンス時間
- 優秀: < 1000ms
- 良好: < 3000ms
- 改善必要: > 3000ms

### 稼働状況
- HTTPサーバー: http://localhost:3001/health
- n8n: http://localhost:5678

## 🔍 トラブルシューティング

### よくある問題

#### 1. ポート3001が使用中
```bash
# 既存プロセスを確認
netstat -ano | findstr :3001

# プロセスを終了
taskkill /PID <PID> /F
```

#### 2. Brave API キーエラー
```bash
# .envファイルを確認
cat .env

# APIキーを再設定
echo "BRAVE_API_KEY=your_new_key" > .env
```

#### 3. n8n接続エラー
```bash
# n8nを再起動
n8n start

# ポート5678が使用可能か確認
netstat -ano | findstr :5678
```

#### 4. 依存関係エラー
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### ログ確認

```bash
# HTTPサーバーログ
tail -f logs/server.log

# n8nログ
n8n start --log-level debug
```

## 🔒 セキュリティ

### 環境変数
- `.env`ファイルはGitにコミットしない
- APIキーは定期的に更新
- 本番環境ではHTTPSを使用

### アクセス制御
- ファイアウォールでポート制限
- n8nダッシュボードにパスワード設定
- API レート制限の実装

## 📝 開発者向け

### 開発モード
```bash
npm run dev
```

### テスト実行
```bash
npm test
```

### ワークフロー作成
```bash
npm run create-workflow
```

## 🤝 貢献

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🆘 サポート

### 問題報告
GitHub Issues で問題を報告してください

### ドキュメント
- [API ドキュメント](docs/api.md)
- [n8n設定ガイド](docs/n8n_setup.md)
- [トラブルシューティング](docs/troubleshooting.md)

---

## 🎯 最終確認チェックリスト

- [ ] HTTPサーバーがポート3001で正常稼働
- [ ] Brave Search APIが応答
- [ ] n8nワークフローが作成済み
- [ ] 自動ワークフローが5分間隔で実行
- [ ] システムテストが全て成功
- [ ] ログファイルが正常に生成
- [ ] 環境変数が適切に設定

**🎉 全てチェックが完了したら、システムは完全自動化モードで稼働しています！**
=======
# Desktop Tutorial

[![CI Tests](https://github.com/suima0713/desktop-tutorial/actions/workflows/ci-tests.yml/badge.svg)](https://github.com/suima0713/desktop-tutorial/actions/workflows/ci-tests.yml)
[![Static Analysis](https://github.com/suima0713/desktop-tutorial/actions/workflows/static-analysis.yml/badge.svg)](https://github.com/suima0713/desktop-tutorial/actions/workflows/static-analysis.yml)
[![License Check](https://github.com/suima0713/desktop-tutorial/actions/workflows/license-check.yml/badge.svg)](https://github.com/suima0713/desktop-tutorial/actions/workflows/license-check.yml)
[![Security Audit](https://github.com/suima0713/desktop-tutorial/actions/workflows/security-audit.yml/badge.svg)](https://github.com/suima0713/desktop-tutorial/actions/workflows/security-audit.yml)

## 🔒 Security Features

### Phase 3 完了 ✅
- Automated dependency updates (Dependabot)
- Security vulnerability scanning (Trivy)
- License compliance checks
- SBOM generation with digital signatures
- Branch protection policies

### Phase 4 実装中 🚧
- GitHub Actions usage monitoring
- Performance optimization
- Alert notifications

## Quick Start

```python
# Install dependencies
poetry install

# Run tests
poetry run pytest

# Run security scan
poetry run safety check
License
MIT

# GitHub Composite Actions

## ✅ 実装済みのComposite Actions

### 📦 setup-project
Python環境のセットアップを行うアクション

```yaml
- uses: ./.github/actions/setup-project
  with:
    python-version: '3.11'  # オプション、デフォルト: 3.11
>>>>>>> c70c10d9d8934f1bbc8429bb5f7c96770eacc697
