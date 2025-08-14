# Brave Search Trading Intelligence Tool

## 📋 実装完了状況

✅ **ファイル作成完了**
- `core/brave_search_trader.py` - メインPythonスクリプト
- `config/brave_config.json` - 設定ファイル（APIキー設定済み）
- `check_stock.bat` - ワンクリック銘柄調査ツール
- `core/test_brave.py` - テストスクリプト

## ✅ APIテスト結果

**テスト実行日**: 2025-08-14 19:02:48
- ✅ APIキー設定済み: BSAgAF4UvJ...
- ✅ NVDA センチメント取得成功
- ✅ AAPL センチメント取得成功
- ⚠️ TSLA で429エラー（レート制限）

**実際の出力例**:
```
📊 NVDA 最新センチメント分析
========================================
1. NVDA Stock Quote Price and Forecast | CNN
2. NVIDIA Corporation (NVDA) Stock Price, News, Quote & History - Yahoo Finance
3. NVDA: NVIDIA Corp Latest Stock Price, Analysis, News and Trading Ideas
4. NVIDIA (NVDA) Stock Price, News & Analysis $NVDA
5. NVIDIA (NVDA) Stock Price & Overview
```

## 🔧 セットアップ手順

### ✅ APIキー設定完了
`config/brave_config.json` にAPIキーが設定済み：
```json
{
  "api_key": "BSAgAF4UvJOMgxX2ojofxEU47VveSsl",
  "description": "Brave Search API for trading intelligence",
  "created": "2024-08-12",
  "usage": "Time-sensitive stock research only",
  "account": "savannanohara@gmail.com",
  "limit": "月間2,000クエリ（無料）"
}
```

## 🚀 使用方法

### 1. ワンクリック実行（推奨）
```bash
# TradingSystem2025ディレクトリで実行
.\check_stock.bat
```

### 2. コマンドラインから
```bash
cd TradingSystem2025/core
python brave_search_trader.py
```

### 3. Pythonから直接使用
```python
from brave_search_trader import TradingIntelligence
ti = TradingIntelligence()

# 個別機能
ti.quick_sentiment("PLTR")  # センチメント分析
ti.after_hours_news("NIO")  # 時間外ニュース

# 総合調査
ti.investigate("NVDA")
```

### 4. テスト実行
```bash
cd TradingSystem2025/core
python test_brave.py
```

## 📊 機能

1. **quick_sentiment(ticker)** - 最新センチメント分析
2. **after_hours_news(ticker)** - 時間外ニュース
3. **investigate(ticker)** - 総合調査レポート

## ⚠️ 注意事項

- ✅ APIキー設定完了
- ⚠️ レート制限あり（429エラー対策が必要）
- 24時間以内の最新情報のみ取得
- ミニマム運用のため、必要最小限の機能のみ実装
- 月間2,000クエリ制限（1日約66クエリ）

## 💡 使用推奨

**時間外の重要な銘柄調査のみに使用**
- 1回の調査で2クエリ消費
- 1日30銘柄程度まで調査可能
- 重要な銘柄（NVDA, TSLA, AAPL等）を優先

### 推奨銘柄例
- **テクノロジー**: NVDA, TSLA, AAPL, MSFT
- **AI関連**: PLTR, NIO, AMD
- **その他**: 重要な時間外ニュースがある銘柄

## 🎯 ファイル構成

```
TradingSystem2025/
├── core/
│   ├── brave_search_trader.py    # メインスクリプト
│   └── test_brave.py             # テストスクリプト
├── config/
│   └── brave_config.json         # 設定ファイル
├── check_stock.bat               # ワンクリック実行ツール
└── BRAVE_SEARCH_SETUP.md         # このファイル
```

**実装完了！APIキー設定済みで動作確認済みです。**
