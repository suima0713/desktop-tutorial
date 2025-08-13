# 🚀 TradingSystem2025 セットアップガイド

## 📋 実装完了項目

### ✅ 1. HTTPサーバーの修正（最優先）
- **ポート修正**: 3002 → 3001 に変更
- **CORS設定**: 追加済み
- **エラーハンドリング**: 実装済み
- **ヘルスチェックエンドポイント**: 追加済み

### ✅ 2. n8nワークフロー自動作成
- **自動生成スクリプト**: `create_n8n_workflow.js` 作成済み
- **5分間隔実行**: 設定済み
- **日経平均検索**: 実装済み
- **エラーハンドリング**: 実装済み

### ✅ 3. 統合テストスクリプト作成
- **システム統合テスト**: `test_all_systems.js` 作成済み
- **HTTPサーバーテスト**: 実装済み
- **Brave API テスト**: 実装済み
- **n8n テスト**: 実装済み
- **パフォーマンステスト**: 実装済み

### ✅ 4. 完全自動起動スクリプト
- **PowerShell版**: `start_system.ps1` 作成済み
- **Batch版**: `start_system.bat` 作成済み
- **環境チェック**: 実装済み
- **依存関係自動インストール**: 実装済み

## 🚀 実行順序

### 1. 環境準備
```bash
# TradingSystem2025ディレクトリに移動
cd TradingSystem2025

# 依存関係インストール
npm install
```

### 2. 環境変数設定
```bash
# .envファイルを作成
cp env.example .env

# .envファイルを編集してAPIキーを設定
# BRAVE_API_KEY=your_actual_api_key_here
```

### 3. システム起動
```powershell
# PowerShell版（推奨）
.\start_system.ps1

# または Batch版
.\start_system.bat
```

### 4. 手動起動（オプション）
```bash
# HTTPサーバー起動
node mcp_server.js

# 別のターミナルでテスト実行
node test_all_systems.js
```

## 🎯 最終確認チェックリスト

### システム稼働確認
- [ ] HTTPサーバーがポート3001で正常稼働
- [ ] Brave Search APIが応答
- [ ] n8nワークフローが作成済み
- [ ] 自動ワークフローが5分間隔で実行

### テスト実行
```bash
# 統合テスト実行
node test_all_systems.js

# 期待される出力
# ✅ HTTPサーバー: 稼働中
# ✅ Brave API: 接続成功
# ✅ n8n: 稼働中
# ✅ パフォーマンス: 優秀
```

## 📊 システムダッシュボード

### 稼働状況確認
- **HTTPサーバー**: http://localhost:3001/health
- **検索API**: http://localhost:3001/search
- **n8n**: http://localhost:5678

### API エンドポイント
```http
# ヘルスチェック
GET http://localhost:3001/health

# 検索実行
POST http://localhost:3001/search
Content-Type: application/json
{
  "query": "日経平均 マージンコール"
}

# テスト実行
GET http://localhost:3001/test
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

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
# n8nをインストール
npm install -g n8n

# n8nを起動
n8n start
```

#### 4. 依存関係エラー
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

## 📈 パフォーマンス監視

### レスポンス時間基準
- **優秀**: < 1000ms
- **良好**: < 3000ms
- **改善必要**: > 3000ms

### 稼働率目標
- **HTTPサーバー**: 99%以上
- **Brave API**: 95%以上
- **n8n**: 90%以上

## 🎉 完了確認

全てのチェックが完了したら、システムは完全自動化モードで稼働しています！

### 自動化機能
- ✅ 5分間隔での自動検索
- ✅ リアルタイムアラート生成
- ✅ エラー自動復旧
- ✅ パフォーマンス監視
- ✅ ログ自動生成

### 次のステップ
1. n8nダッシュボードでワークフローを確認
2. カスタム検索クエリの設定
3. 通知チャンネルの追加
4. パフォーマンス最適化

---

**🚀 TradingSystem2025 完全自動化システムが稼働中です！**


