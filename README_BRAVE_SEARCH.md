# Brave Search Trading Intelligence Tool

## 🚀 クイックスタート

### 1. ワンクリック実行
```bash
cd TradingSystem2025
.\check_stock.bat
# Enter stock ticker (e.g., NVDA): NVDA
```

### 2. Pythonから直接使用
```python
from core.brave_search_trader import TradingIntelligence
ti = TradingIntelligence()

# 総合調査
ti.investigate("NVDA")

# 個別機能
ti.quick_sentiment("PLTR")
ti.after_hours_news("NIO")
```

## 📊 機能

- **センチメント分析**: 24時間以内の最新ニュース5件
- **時間外ニュース**: 時間外取引関連ニュース3件
- **総合調査**: センチメント + ニュースの統合レポート

## ⚠️ 制限事項

- **月間制限**: 2,000クエリ（無料）
- **レート制限**: 連続リクエストで429エラー
- **推奨使用**: 1日30銘柄程度まで

## 🎯 推奨銘柄

- **テクノロジー**: NVDA, TSLA, AAPL, MSFT
- **AI関連**: PLTR, NIO, AMD

## 📁 ファイル構成

```
TradingSystem2025/
├── core/brave_search_trader.py    # メインスクリプト
├── config/brave_config.json       # APIキー設定
├── check_stock.bat                # ワンクリック実行
└── BRAVE_SEARCH_SETUP.md          # 詳細ガイド
```

**APIキー設定済み・動作確認済み**
