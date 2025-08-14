import requests
import json
from datetime import datetime
import os

class TradingIntelligence:
    """時間外の銘柄調査に特化したBrave Search活用ツール"""
    
    def __init__(self):
        # APIキーは環境変数または設定ファイルから取得
        self.brave_api_key = self.load_api_key()
        self.base_url = "https://api.search.brave.com/res/v1/web/search"
    
    def load_api_key(self):
        """APIキーを設定ファイルから読み込み"""
        try:
            config_path = os.path.join(os.path.dirname(__file__), "..", "config", "brave_config.json")
            with open(config_path, "r") as f:
                config = json.load(f)
                api_key = config.get("api_key", "")
                # プレースホルダー値の場合は空文字列として扱う
                if api_key == "YOUR_BRAVE_API_KEY_HERE":
                    return ""
                return api_key
        except:
            print("⚠️ brave_config.json が見つかりません")
            return ""
    
    def quick_sentiment(self, ticker):
        """銘柄の最新センチメント（市場の雰囲気）を取得"""
        if not self.brave_api_key:
            return "❌ APIキーが設定されていません"
        
        query = f"{ticker} stock news latest sentiment analysis today"
        
        headers = {
            "X-Subscription-Token": self.brave_api_key,
            "Accept": "application/json"
        }
        
        params = {
            "q": query,
            "count": 5,  # 最新5件
            "freshness": "24h"  # 24時間以内の情報
        }
        
        try:
            response = requests.get(self.base_url, headers=headers, params=params)
            if response.status_code == 200:
                results = response.json()
                return self.format_sentiment(ticker, results)
            else:
                return f"❌ エラー: {response.status_code}"
        except Exception as e:
            return f"❌ エラー: {str(e)}"
    
    def after_hours_news(self, ticker):
        """時間外取引に影響する最新ニュース"""
        if not self.brave_api_key:
            return "❌ APIキーが設定されていません"
        
        query = f"{ticker} after hours trading news breaking"
        
        headers = {
            "X-Subscription-Token": self.brave_api_key,
            "Accept": "application/json"
        }
        
        params = {
            "q": query,
            "count": 3,
            "freshness": "24h"
        }
        
        try:
            response = requests.get(self.base_url, headers=headers, params=params)
            if response.status_code == 200:
                results = response.json()
                return self.format_news(ticker, results)
            else:
                return f"❌ エラー: {response.status_code}"
        except Exception as e:
            return f"❌ エラー: {str(e)}"
    
    def format_sentiment(self, ticker, results):
        """センチメント結果を見やすく整形"""
        output = f"\n📊 {ticker} 最新センチメント分析\n"
        output += f"{'='*40}\n"
        
        if 'web' in results and 'results' in results['web']:
            for i, item in enumerate(results['web']['results'][:5], 1):
                title = item.get('title', 'No title')
                description = item.get('description', '')[:100]
                output += f"\n{i}. {title}\n"
                output += f"   {description}...\n"
        else:
            output += "情報が見つかりませんでした\n"
        
        output += f"\n検索時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        return output
    
    def format_news(self, ticker, results):
        """ニュース結果を整形"""
        output = f"\n📰 {ticker} 時間外ニュース\n"
        output += f"{'='*40}\n"
        
        if 'web' in results and 'results' in results['web']:
            for i, item in enumerate(results['web']['results'][:3], 1):
                title = item.get('title', 'No title')
                url = item.get('url', '')
                output += f"\n{i}. {title}\n"
                output += f"   URL: {url}\n"
        else:
            output += "最新ニュースが見つかりませんでした\n"
        
        return output
    
    def investigate(self, ticker):
        """銘柄の総合調査（センチメント＋ニュース）"""
        print(f"\n🔍 {ticker} を調査中...\n")
        
        sentiment = self.quick_sentiment(ticker)
        news = self.after_hours_news(ticker)
        
        output = f"""
{'='*50}
 {ticker} 総合調査レポート
{'='*50}
{sentiment}
{news}
{'='*50}
"""
        return output

# 使用例とテスト
if __name__ == "__main__":
    ti = TradingIntelligence()
    
    # テストモード
    print("Brave Search Trading Intelligence")
    print("-" * 40)
    
    if not ti.brave_api_key:
        print("❌ APIキーが設定されていません")
        print("brave_config.json にAPIキーを設定してください")
        print("https://brave.com/search/api/ からAPIキーを取得できます")
    else:
        print("✅ APIキー設定済み")
        print("\n使用例:")
        print("  ti.quick_sentiment('NVDA')")
        print("  ti.after_hours_news('TSLA')")
        print("  ti.investigate('PLTR')")
