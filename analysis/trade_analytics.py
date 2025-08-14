import duckdb
import pandas as pd
from datetime import datetime, timedelta
import json
import os

class TradeAnalytics:
    """DuckDBを使用したトレード分析システム"""
    
    def __init__(self, db_path="trade_analytics.db"):
        """データベース接続と初期化"""
        self.db_path = db_path
        self.conn = duckdb.connect(db_path)
        self.initialize_tables()
    
    def initialize_tables(self):
        """必要なテーブルを作成"""
        
        # トレード記録テーブル
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS trades (
                id INTEGER PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                symbol VARCHAR(10),
                action VARCHAR(10),  -- BUY/SELL
                price DECIMAL(10, 2),
                quantity INTEGER,
                pnl DECIMAL(10, 2),
                notes TEXT
            )
        """)
        
        # ウォッチリスト履歴
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS watchlist_history (
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                symbol VARCHAR(10),
                price DECIMAL(10, 2),
                volume BIGINT,
                change_percent DECIMAL(5, 2),
                rsi DECIMAL(5, 2),
                macd_signal VARCHAR(10)
            )
        """)
        
        # 日次サマリー
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS daily_summary (
                date DATE PRIMARY KEY,
                total_trades INTEGER,
                winning_trades INTEGER,
                losing_trades INTEGER,
                total_pnl DECIMAL(10, 2),
                win_rate DECIMAL(5, 2),
                best_trade VARCHAR(10),
                worst_trade VARCHAR(10)
            )
        """)
        
        print("✅ テーブル初期化完了")
    
    def add_trade(self, symbol, action, price, quantity, pnl=0, notes=""):
        """トレードを記録"""
        # IDを自動生成
        result = self.conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM trades").fetchone()
        trade_id = result[0]
        
        self.conn.execute("""
            INSERT INTO trades (id, symbol, action, price, quantity, pnl, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, [trade_id, symbol, action, price, quantity, pnl, notes])
        print(f"✅ トレード記録: {symbol} {action} @ ${price}")
    
    def import_from_csv(self, csv_path):
        """CSVからデータをインポート"""
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path)
            self.conn.execute("INSERT INTO trades SELECT * FROM df")
            print(f"✅ {len(df)}件のトレードをインポート")
    
    def get_performance_stats(self, days=30):
        """パフォーマンス統計を取得"""
        query = f"""
            SELECT 
                COUNT(*) as total_trades,
                SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN pnl < 0 THEN 1 ELSE 0 END) as losses,
                SUM(pnl) as total_pnl,
                AVG(pnl) as avg_pnl,
                MAX(pnl) as best_trade,
                MIN(pnl) as worst_trade
            FROM trades
            WHERE timestamp > CURRENT_TIMESTAMP - INTERVAL '{days} days'
        """
        
        result = self.conn.execute(query).fetchone()
        
        stats = {
            "期間": f"{days}日間",
            "総トレード数": result[0] or 0,
            "勝ちトレード": result[1] or 0,
            "負けトレード": result[2] or 0,
            "合計損益": f"${result[3] or 0:.2f}",
            "平均損益": f"${result[4] or 0:.2f}",
            "最高利益": f"${result[5] or 0:.2f}",
            "最大損失": f"${result[6] or 0:.2f}",
            "勝率": f"{(result[1]/result[0]*100 if result[0] else 0):.1f}%"
        }
        
        return stats
    
    def analyze_by_symbol(self):
        """銘柄別分析"""
        query = """
            SELECT 
                symbol,
                COUNT(*) as trades,
                SUM(pnl) as total_pnl,
                AVG(pnl) as avg_pnl,
                SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as win_rate
            FROM trades
            GROUP BY symbol
            ORDER BY total_pnl DESC
        """
        
        return pd.DataFrame(self.conn.execute(query).fetchall(),
                          columns=['Symbol', 'Trades', 'Total_PnL', 'Avg_PnL', 'Win_Rate'])
    
    def quick_report(self):
        """クイックレポート生成"""
        print("\n" + "="*50)
        print("📊 トレード分析レポート")
        print("="*50)
        
        # 30日間の統計
        stats = self.get_performance_stats(30)
        for key, value in stats.items():
            print(f"{key}: {value}")
        
        print("\n🏆 銘柄別パフォーマンス")
        print("-"*40)
        symbol_stats = self.analyze_by_symbol()
        if not symbol_stats.empty:
            print(symbol_stats.to_string(index=False))
        else:
            print("データがありません")
        
        print("="*50)
    
    def export_to_dendron(self):
        """Dendron用のマークダウンレポート生成"""
        stats = self.get_performance_stats(30)
        symbol_stats = self.analyze_by_symbol()
        
        report = f"""# トレード分析レポート - {datetime.now().strftime('%Y-%m-%d')}

## 📊 30日間のパフォーマンス

| 指標 | 値 |
|------|-----|
"""
        for key, value in stats.items():
            report += f"| {key} | {value} |\n"
        
        report += "\n## 🏆 銘柄別分析\n\n"
        if not symbol_stats.empty:
            report += symbol_stats.to_markdown(index=False)
        
        # Dendronに保存
        dendron_path = "C:/Users/user/Desktop/TradingSystem2025/analysis/reports/"
        os.makedirs(dendron_path, exist_ok=True)
        
        filename = f"{dendron_path}{datetime.now().strftime('%Y%m%d')}_report.md"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"✅ レポート保存: {filename}")
        return filename

# 使用例
if __name__ == "__main__":
    # 分析システム初期化
    ta = TradeAnalytics()
    
    # サンプルトレード追加（テスト用）
    ta.add_trade("NVDA", "BUY", 885.50, 10, 0, "エントリー")
    ta.add_trade("NVDA", "SELL", 892.30, 10, 68.00, "利確")
    ta.add_trade("TSLA", "BUY", 245.20, 5, 0, "エントリー")
    ta.add_trade("TSLA", "SELL", 243.10, 5, -10.50, "損切り")
    
    # レポート生成
    ta.quick_report()
