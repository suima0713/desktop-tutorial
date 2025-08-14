import json
import duckdb
from datetime import datetime
from trade_analytics import TradeAnalytics

class ISPConnector:
    """ISP TradingとDuckDBを連携"""
    
    def __init__(self):
        self.ta = TradeAnalytics()
        self.watchlist = ["AAPL", "NVDA", "TSLA", "MSFT", "GOOGL"]
    
    def import_isp_data(self, json_path="../data/watchlist_data.json"):
        """ISPのウォッチリストデータを取り込み"""
        try:
            with open(json_path, 'r') as f:
                data = json.load(f)
            
            for symbol, values in data.items():
                self.ta.conn.execute("""
                    INSERT INTO watchlist_history (symbol, price, volume, change_percent)
                    VALUES (?, ?, ?, ?)
                """, [symbol, values.get('price'), values.get('volume'), values.get('change')])
            
            print(f"✅ ISPデータ取り込み完了: {len(data)}銘柄")
        except Exception as e:
            print(f"❌ エラー: {e}")
    
    def sync_with_isp(self):
        """ISP Tradingと同期"""
        print("🔄 ISP Tradingとの同期開始...")
        # ここにISPからのデータ取得ロジック
        self.import_isp_data()
        print("✅ 同期完了")

if __name__ == "__main__":
    connector = ISPConnector()
    connector.sync_with_isp()
