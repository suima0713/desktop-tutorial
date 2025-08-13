# 🛡️ TradingSystem2025 エラーハンドリングガイド

## 📋 今回発生した問題と対策

### 1. **モジュール解決エラー**
```
Error: Cannot find module 'cors'
```

#### 原因
- プロジェクト外から実行
- 依存関係がインストールされていない
- 実行コンテキストの不一致

#### 対策
```bash
# 1. プロジェクトディレクトリに移動
cd TradingSystem2025

# 2. 依存関係インストール
npm install

# 3. 正しいコンテキストで実行
node mcp_server.js
```

### 2. **ファイルパスエラー**
```
Error: Cannot find module 'mcp_server.js'
```

#### 原因
- ファイルが正しい場所にない
- 相対パスと絶対パスの混在
- 起動スクリプトのパス設定ミス

#### 対策
```bash
# 1. ファイル配置確認
ls mcp_server.js

# 2. 正しいディレクトリで実行
pwd
cd TradingSystem2025

# 3. 起動スクリプト修正
# 相対パスを使用、絶対パスを避ける
```

### 3. **環境変数エラー**
```
BRAVE_API_KEY is undefined
```

#### 原因
- `.env`ファイルが存在しない
- ファイルが正しい場所にない
- 環境変数読み込み設定ミス

#### 対策
```bash
# 1. .envファイル作成
cp env.example .env

# 2. APIキー設定
echo "BRAVE_API_KEY=your_actual_key" >> .env

# 3. ファイル配置確認
ls .env
```

## 🔧 予防的対策

### 1. **起動前チェックリスト**
```powershell
# PowerShell起動スクリプトに追加
function Test-Prerequisites {
    # ディレクトリ確認
    if (-not (Test-Path "mcp_server.js")) {
        Write-Error "mcp_server.jsが見つかりません"
        return $false
    }
    
    # package.json確認
    if (-not (Test-Path "package.json")) {
        Write-Error "package.jsonが見つかりません"
        return $false
    }
    
    # .env確認
    if (-not (Test-Path ".env")) {
        Write-Warning ".envファイルが見つかりません"
    }
    
    return $true
}
```

### 2. **依存関係自動修復**
```powershell
# 依存関係チェックと修復
function Repair-Dependencies {
    if (-not (Test-Path "node_modules")) {
        Write-Info "依存関係をインストール中..."
        npm install
    }
    
    # 必要なモジュール確認
    $requiredModules = @("express", "axios", "cors", "dotenv")
    foreach ($module in $requiredModules) {
        if (-not (Test-Path "node_modules/$module")) {
            Write-Warning "$moduleが見つかりません。再インストールします..."
            npm install
            break
        }
    }
}
```

### 3. **実行コンテキスト検証**
```powershell
# 実行コンテキスト確認
function Test-ExecutionContext {
    $currentDir = Get-Location
    $projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    
    if ($currentDir.Path -ne $projectDir) {
        Write-Warning "実行コンテキストが正しくありません"
        Write-Info "現在: $($currentDir.Path)"
        Write-Info "期待: $projectDir"
        Set-Location $projectDir
        return $false
    }
    
    return $true
}
```

## 🚨 エラー対応手順

### 緊急時対応
1. **プロセス停止**
   ```bash
   taskkill /F /IM node.exe
   ```

2. **環境リセット**
   ```bash
   cd TradingSystem2025
   rm -rf node_modules
   npm install
   ```

3. **設定確認**
   ```bash
   ls mcp_server.js
   ls package.json
   ls .env
   ```

4. **段階的起動**
   ```bash
   node mcp_server.js
   # 成功したら次のステップ
   node test_all_systems.js
   ```

### デバッグ手順
1. **ログ確認**
   ```bash
   tail -f logs/server.log
   ```

2. **環境変数確認**
   ```bash
   node -e "console.log(process.env.BRAVE_API_KEY)"
   ```

3. **ネットワーク確認**
   ```bash
   netstat -ano | findstr :3001
   ```

## 📊 エラー監視

### 監視項目
- [ ] HTTPサーバー稼働状況
- [ ] 依存関係の整合性
- [ ] 環境変数の設定状況
- [ ] ファイル配置の正確性
- [ ] ネットワーク接続状況

### 自動修復機能
```javascript
// mcp_server.jsに追加
process.on('uncaughtException', (err) => {
    console.error('未処理の例外:', err);
    // ログ記録
    // 管理者通知
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未処理のPromise拒否:', reason);
    // ログ記録
    // 管理者通知
});
```

## 🎯 根本的解決策

### 1. **プロジェクト構造の統一**
- すべてのファイルを`TradingSystem2025`ディレクトリ内に配置
- 相対パスの使用を徹底
- 絶対パスの使用を避ける

### 2. **起動スクリプトの改善**
- 事前チェック機能の追加
- エラー時の自動修復機能
- 詳細なログ出力

### 3. **依存関係管理の強化**
- `package.json`の正確な管理
- バージョン固定
- 依存関係の自動検証

### 4. **環境設定の標準化**
- `.env`ファイルのテンプレート化
- 設定値の検証機能
- デフォルト値の提供

---

**💡 このガイドに従うことで、エラーの発生を最小限に抑え、迅速な復旧が可能になります。**


