# TradingView Webhook Receiver セットアップガイド

## 概要

このガイドでは、TradingViewからのWebhookを受信してGmailに通知するGoogle Apps Scriptの設定方法を説明します。

## 前提条件

- Googleアカウント
- TradingView Pro以上のアカウント（Webhook機能を使用するため）
- 基本的なプログラミング知識

## セットアップ手順

### 1. Google Apps Scriptプロジェクトの作成

1. [Google Apps Script](https://script.google.com/)にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を「TradingView Webhook Receiver」に変更
4. `Code.gs`ファイルの内容を`webhook_receiver.js`の内容で置き換え

### 2. 設定の更新

`webhook_receiver.js`の`CONFIG`セクションを以下のように更新してください：

```javascript
const CONFIG = {
  // HMAC認証用のシークレットキー（任意の文字列）
  HMAC_SECRET: 'your_super_secret_key_here_12345',
  
  // 通知設定
  EMAIL: {
    TO: 'your-email@gmail.com',        // 通知を受け取るメールアドレス
    FROM: 'your-email@gmail.com',      // 送信元メールアドレス
    SUBJECT_PREFIX: '[TradingView Alert]'
  },
  
  // 信用維持率監視設定
  MAINTENANCE_MONITOR: {
    ENABLED: true,
    CURRENT_RATE: 167.0,
    TARGET_RATE: 180.0,
    WARNING_THRESHOLD: 170.0,
    CRITICAL_THRESHOLD: 165.0,
    EMERGENCY_THRESHOLD: 160.0
  },
  
  // ログ設定
  LOGGING: {
    ENABLED: true,
    SPREADSHEET_ID: 'your_spreadsheet_id_here' // ログ用スプレッドシートのID
  }
};
```

### 3. ログ用スプレッドシートの作成（オプション）

1. Googleスプレッドシートを新規作成
2. スプレッドシートのURLからIDを取得
   - URL例: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
   - ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`
3. `CONFIG.LOGGING.SPREADSHEET_ID`にIDを設定

### 4. Webアプリとしてデプロイ

1. 「デプロイ」→「新しいデプロイ」をクリック
2. 「種類の選択」で「ウェブアプリ」を選択
3. 以下の設定を行う：
   - **説明**: TradingView Webhook Receiver
   - **次のユーザーとして実行**: 自分
   - **アクセスできるユーザー**: 全員
4. 「デプロイ」をクリック
5. 承認を求められたら「許可」をクリック
6. WebアプリのURLをコピー（例: `https://script.google.com/macros/s/AKfycbz.../exec`）

### 5. TradingViewアラートの設定

#### 5.1 アラートの作成

1. TradingViewでチャートを開く
2. アラートを設定したいインジケーターや条件を選択
3. アラートボタン（ベルアイコン）をクリック
4. 「条件」タブでアラート条件を設定

#### 5.2 Webhookの設定

1. 「アクション」タブをクリック
2. 「Webhook URL」にチェックを入れる
3. URL欄にGoogle Apps ScriptのWebアプリURLを入力
4. 「Webhookヘッダー」セクションで以下を設定：
   - **キー**: `x-signature`
   - **値**: `{{strategy.order.alert_message}}`

#### 5.3 アラートメッセージの設定

「アラートメッセージ」タブで以下のJSON形式のメッセージを設定：

```json
{
  "strategy": "{{strategy.order.alert_message}}",
  "action": "{{strategy.order.action}}",
  "symbol": "{{ticker}}",
  "price": "{{close}}",
  "quantity": "100",
  "stopLoss": "{{strategy.order.stop_loss}}",
  "takeProfit": "{{strategy.order.take_profit}}",
  "comment": "{{strategy.order.alert_message}}"
}
```

#### 5.4 HMAC署名の設定

TradingViewのアラート設定で、HMAC署名を追加する必要があります。以下のPine Scriptを使用してください：

```pinescript
//@version=5
strategy("Webhook Strategy", overlay=true)

// アラート条件（例：移動平均線のクロスオーバー）
fast_ma = ta.sma(close, 10)
slow_ma = ta.sma(close, 20)
crossover = ta.crossover(fast_ma, slow_ma)
crossunder = ta.crossunder(fast_ma, slow_ma)

// エントリー条件
if crossover
    strategy.entry("Long", strategy.long)
    strategy.exit("Exit Long", "Long", stop=close * 0.95, limit=close * 1.05)

if crossunder
    strategy.entry("Short", strategy.short)
    strategy.exit("Exit Short", "Short", stop=close * 1.05, limit=close * 0.95)

// アラート設定
alertcondition(crossover, title="Buy Signal", message="BUY {{ticker}} at {{close}}")
alertcondition(crossunder, title="Sell Signal", message="SELL {{ticker}} at {{close}}")
```

### 6. テスト

#### 6.1 設定のテスト

Google Apps Scriptエディタで`testConfiguration()`関数を実行して設定を確認：

```javascript
function testConfiguration() {
  // 設定テストを実行
}
```

#### 6.2 アラート処理のテスト

`testAlertProcessing()`関数を実行してアラート処理をテスト：

```javascript
function testAlertProcessing() {
  // テストアラートを処理
}
```

#### 6.3 Webhookのテスト

1. TradingViewでテストアラートを手動でトリガー
2. Gmailで通知メールを確認
3. ログスプレッドシートでログを確認

## セキュリティ設定

### HMAC認証

HMAC認証により、正当なTradingViewからのリクエストのみを処理します：

1. `CONFIG.HMAC_SECRET`に強力なシークレットキーを設定
2. TradingViewのアラート設定で同じキーを使用
3. 定期的にキーを更新

### アクセス制御

1. Google Apps Scriptのアクセス設定を「全員」に設定
2. 必要に応じてIPアドレス制限を追加
3. ログを定期的に確認

## トラブルシューティング

### よくある問題

#### 1. Webhookが受信されない

- **原因**: URLが間違っている、アクセス権限の問題
- **解決策**: 
  - WebアプリのURLを再確認
  - アクセス設定を「全員」に変更
  - ログでエラーを確認

#### 2. HMAC認証エラー

- **原因**: シークレットキーが一致しない
- **解決策**:
  - `CONFIG.HMAC_SECRET`を確認
  - TradingViewの設定を確認
  - テスト関数で検証

#### 3. メールが送信されない

- **原因**: Gmail設定の問題
- **解決策**:
  - Gmailアドレスを確認
  - スパムフォルダを確認
  - 送信制限を確認

#### 4. ログが記録されない

- **原因**: スプレッドシートIDが間違っている
- **解決策**:
  - スプレッドシートIDを確認
  - アクセス権限を確認
  - ログ機能を無効化してテスト

### デバッグ方法

1. **ログの確認**: Google Apps Scriptの実行ログを確認
2. **テスト関数の実行**: 各テスト関数を実行して問題を特定
3. **手動テスト**: アラートを手動でトリガーして動作確認

## カスタマイズ

### メールテンプレートの変更

`createEmailBody()`関数を編集してメールの形式を変更できます。

### アラート条件の追加

`validateAlertData()`関数で新しいフィールドの検証を追加できます。

### ログ形式の変更

`logAlert()`関数でログの形式を変更できます。

## メンテナンス

### 定期メンテナンス

1. **ログの確認**: 週次でログを確認
2. **設定の見直し**: 月次で設定を見直し
3. **セキュリティ更新**: 四半期でセキュリティ設定を更新

### バックアップ

1. **コードのバックアップ**: 定期的にコードをエクスポート
2. **設定のバックアップ**: 設定値を別途保存
3. **ログのバックアップ**: ログスプレッドシートを定期的にバックアップ

## サポート

問題が発生した場合は、以下を確認してください：

1. Google Apps Scriptの実行ログ
2. ログスプレッドシートのエラーログ
3. Gmailの送信ログ
4. TradingViewのアラート履歴

## 更新履歴

- **v1.0.0**: 初回リリース
  - 基本的なWebhook受信機能
  - HMAC認証
  - Gmail通知
  - 信用維持率監視
  - ログ機能





