#!/usr/bin/env python
# -*- coding: utf-8 -*-

from brave_search_trader import TradingIntelligence

def test_brave_search():
    """Brave Search API動作確認"""
    print("=" * 50)
    print("Brave Search API テスト開始")
    print("=" * 50)
    
    ti = TradingIntelligence()
    
    # APIキー確認
    if ti.brave_api_key:
        print(f"✅ APIキー設定済み: {ti.brave_api_key[:10]}...")
    else:
        print("❌ APIキーが設定されていません")
        return
    
    # テスト検索
    test_tickers = ["NVDA", "TSLA", "AAPL"]
    
    for ticker in test_tickers:
        print(f"\n🔍 {ticker} のテスト検索...")
        try:
            # センチメントテスト
            result = ti.quick_sentiment(ticker)
            if "エラー" not in result:
                print(f"✅ {ticker} センチメント取得成功")
            else:
                print(f"❌ {ticker} センチメント取得失敗: {result}")
        except Exception as e:
            print(f"❌ エラー: {e}")
    
    print("\n" + "=" * 50)
    print("テスト完了")
    print("=" * 50)

if __name__ == "__main__":
    test_brave_search()
