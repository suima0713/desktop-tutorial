# Brave Search MCP統合

## 概要
証券取引の維持率監視システムにBrave Search APIを統合し、リアルタイム市況分析機能を提供します。

## セットアップ完了項目
- ✅ Node.js依存関係インストール
- ✅ 環境変数設定
- ✅ Claude Desktop MCP設定
- ✅ n8nワークフロー作成
- ✅ テスト実行

## 次のステップ
1. `.env`ファイルでAPI Keyを設定
2. n8nでワークフローをインポート
3. Claude DesktopでMCP設定を確認
4. システムテスト実行

## 使用方法
```bash
# テスト実行
node brave_integration/test_integration.js

# 統合テスト
node brave_integration/search_queries.js
```

## トラブルシューティング
- API Keyが設定されていない場合、テストが失敗します
- n8nが起動していない場合、ワークフローが実行できません
- Claude Desktopの設定を確認してください

## サポート
問題が発生した場合は、ログファイルを確認してください。
