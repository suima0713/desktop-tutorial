# 📁 TradingSystem2025 プロジェクト構造

## 🎯 正しいファイル配置

```
TradingSystem2025/
├── 📄 mcp_server.js              # メインHTTPサーバー
├── 📄 package.json               # 依存関係管理
├── 📄 .env                       # 環境変数設定
├── 📄 env.example                # 環境変数テンプレート
├── 📄 start_system.ps1           # PowerShell起動スクリプト
├── 📄 start_system.bat           # Batch起動スクリプト
├── 📄 test_all_systems.js        # システム統合テスト
├── 📄 create_n8n_workflow.js     # n8nワークフロー作成
├── 📄 n8n_workflow.json         # 生成されたn8nワークフロー
├── 📄 README.md                  # プロジェクト説明
├── 📄 SETUP_GUIDE.md            # セットアップガイド
├── 📄 PROJECT_STRUCTURE.md      # このファイル
├── 📁 node_modules/              # 依存関係（自動生成）
├── 📁 logs/                      # ログファイル
├── 📁 docs/                      # ドキュメント
├── 📁 config/                    # 設定ファイル
├── 📁 integrations/              # 統合モジュール
└── 📁 core/                      # コアシステム
```

## ⚠️ 重要な注意事項

### 1. ファイル配置の原則
- **すべてのファイルは`TradingSystem2025`ディレクトリ内に配置**
- **`mcp_server.js`は必ずプロジェクトルートに配置**
- **`.env`ファイルはプロジェクトルートに配置**

### 2. 依存関係管理
- **`npm install`は必ず`TradingSystem2025`ディレクトリ内で実行**
- **`node_modules`はプロジェクトルートに生成される**
- **相対パスでのモジュール参照を推奨**

### 3. 実行コンテキスト
- **すべてのスクリプトは`TradingSystem2025`ディレクトリ内から実行**
- **環境変数は`.env`ファイルから読み込み**
- **絶対パスではなく相対パスを使用**

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. モジュールが見つからない
```bash
# 問題: Cannot find module 'cors'
# 解決: プロジェクトディレクトリ内でnpm installを実行
cd TradingSystem2025
npm install
```

#### 2. ファイルが見つからない
```bash
# 問題: Cannot find module 'mcp_server.js'
# 解決: ファイルが正しい場所にあるか確認
ls mcp_server.js
```

#### 3. 環境変数が読み込まれない
```bash
# 問題: BRAVE_API_KEY is undefined
# 解決: .envファイルが正しい場所にあるか確認
ls .env
```

## 📋 セットアップチェックリスト

### 初期セットアップ
- [ ] `TradingSystem2025`ディレクトリを作成
- [ ] すべてのファイルを正しい場所に配置
- [ ] `npm install`を実行
- [ ] `.env`ファイルを作成・設定
- [ ] `node mcp_server.js`でテスト実行

### 起動前確認
- [ ] 現在のディレクトリが`TradingSystem2025`であることを確認
- [ ] `mcp_server.js`が存在することを確認
- [ ] `package.json`が存在することを確認
- [ ] `.env`ファイルが設定されていることを確認

### 実行確認
- [ ] `.\start_system.ps1`で起動
- [ ] `http://localhost:3001/health`で稼働確認
- [ ] `node test_all_systems.js`でテスト実行

## 🚀 推奨実行手順

```bash
# 1. プロジェクトディレクトリに移動
cd TradingSystem2025

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp env.example .env
# .envファイルを編集してAPIキーを設定

# 4. システム起動
.\start_system.ps1

# 5. テスト実行
node test_all_systems.js
```

## 📝 開発者向けメモ

### ファイル追加時の注意
- 新しいファイルは必ず`TradingSystem2025`ディレクトリ内に配置
- 依存関係は`package.json`に追加
- 環境変数は`.env`ファイルに追加

### デバッグ時の注意
- 実行コンテキストを確認（現在のディレクトリ）
- ファイルパスが正しいか確認
- 依存関係がインストールされているか確認

---

**💡 この構造に従うことで、すべてのファイルが正しく配置され、システムが正常に動作します。**


