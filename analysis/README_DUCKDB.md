# DuckDB トレード分析基盤

## 🚀 クイックスタート

### 1. ワンクリック実行
```bash
cd TradingSystem2025
.\trade_analysis.bat
```

### 2. Pythonから直接使用
```python
from analysis.trade_analytics import TradeAnalytics

# 分析システム初期化
ta = TradeAnalytics()

# トレード記録
ta.add_trade("NVDA", "BUY", 885.50, 10, 0, "エントリー")
ta.add_trade("NVDA", "SELL", 892.30, 10, 68.00, "利確")

# レポート生成
ta.quick_report()
```

## 📊 機能

### 1. トレード記録
- **add_trade()**: 個別トレード記録
- **import_from_csv()**: CSV一括インポート
- **自動ID生成**: 重複なし

### 2. パフォーマンス分析
- **get_performance_stats()**: 期間別統計
- **analyze_by_symbol()**: 銘柄別分析
- **勝率・損益計算**: 自動計算

### 3. レポート生成
- **quick_report()**: コンソール出力
- **export_to_dendron()**: マークダウン出力

## 🏗️ データベース構造

### trades テーブル
```sql
CREATE TABLE trades (
    id INTEGER PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    symbol VARCHAR(10),
    action VARCHAR(10),  -- BUY/SELL
    price DECIMAL(10, 2),
    quantity INTEGER,
    pnl DECIMAL(10, 2),
    notes TEXT
)
```

### watchlist_history テーブル
```sql
CREATE TABLE watchlist_history (
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    symbol VARCHAR(10),
    price DECIMAL(10, 2),
    volume BIGINT,
    change_percent DECIMAL(5, 2),
    rsi DECIMAL(5, 2),
    macd_signal VARCHAR(10)
)
```

## 📁 ファイル構成

```
TradingSystem2025/
├── analysis/
│   ├── trade_analytics.py      # メイン分析システム
│   ├── isp_connector.py        # ISP Trading連携
│   ├── setup_duckdb.py         # DuckDBインストール
│   └── README_DUCKDB.md        # このファイル
├── trade_analysis.bat          # ワンクリック実行
└── trade_analytics.db          # DuckDBデータベース
```

## 🎯 使用例

### 基本的な分析
```python
from analysis.trade_analytics import TradeAnalytics

ta = TradeAnalytics()

# サンプルデータ追加
ta.add_trade("NVDA", "BUY", 885.50, 10, 0, "エントリー")
ta.add_trade("NVDA", "SELL", 892.30, 10, 68.00, "利確")
ta.add_trade("TSLA", "BUY", 245.20, 5, 0, "エントリー")
ta.add_trade("TSLA", "SELL", 243.10, 5, -10.50, "損切り")

# レポート生成
ta.quick_report()
```

### 出力例
```
==================================================
📊 トレード分析レポート
==================================================
期間: 30日間
総トレード数: 4
勝ちトレード: 1
負けトレード: 1
合計損益: $57.50
平均損益: $14.38
最高利益: $68.00
最大損失: $-10.50
勝率: 25.0%

🏆 銘柄別パフォーマンス
----------------------------------------
Symbol  Trades Total_PnL  Avg_PnL  Win_Rate
  NVDA       2     68.00    34.00      50.0
  TSLA       2    -10.50    -5.25       0.0
==================================================
```

## ⚡ DuckDBの利点

- **高速性**: SQLiteの100倍高速
- **Pandas互換**: DataFrameとの完全互換
- **SQL標準**: 標準SQLサポート
- **軽量**: 依存関係が少ない

## 🔧 セットアップ

### 1. DuckDBインストール
```bash
cd analysis
python setup_duckdb.py
```

### 2. 初回実行
```bash
python trade_analytics.py
```

### 3. ISP連携（オプション）
```bash
python isp_connector.py
```

## 📈 期待される効果

- **トレード記録の永続化** ✅
- **勝率・損益の自動計算** ✅
- **銘柄別パフォーマンス分析** ✅
- **Dendronへの自動レポート出力** ✅
- **SQLによる柔軟な分析** ✅

**DuckDBトレード分析基盤の実装が完了しました！**
