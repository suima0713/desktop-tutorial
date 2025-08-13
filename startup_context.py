#!/usr/bin/env python3
"""
TradingSystem2025 - Startup Context Loader
自動的にシステムメモリを読み込み、新規セッションのコンテキストを設定
"""

import os
import sys
from datetime import datetime
from pathlib import Path

def load_context():
    """新規セッション開始時に必ず実行"""
    try:
        memory_file = Path('SYSTEM_MEMORY.md')
        if memory_file.exists():
            with open(memory_file, 'r', encoding='utf-8') as f:
                memory = f.read()
            
            print(f"""
=== TRADING SYSTEM 2025 CONTEXT LOADED ===
{memory}

TODAY'S PRIORITY:
1. Maintenance rate to 180%
2. Polygon.io integration ($29/month)
3. Never repeat LNTH incident (Brave Search failure)

CURRENT STATUS:
- Capital: ¥150,000,000
- Maintenance Rate: 167.52% (WARNING - Target: 180%)
- Largest Position: LNTH (880万円)
- Credit Exposure: 1400万円 (NVDA + LNTH)

IMMEDIATE ACTIONS:
1. Register for Polygon.io: https://polygon.io/dashboard/signup
2. Replace all Brave Search price checks
3. Implement real-time maintenance monitoring
==========================================
""")
        else:
            print("⚠️  SYSTEM_MEMORY.md not found. Creating default context...")
            create_default_memory()
            
    except Exception as e:
        print(f"❌ Error loading context: {e}")
        print("Continuing with basic context...")

def create_default_memory():
    """デフォルトのシステムメモリを作成"""
    default_memory = """# TradingSystem2025 Memory Bank

## Identity
- Capital: ¥150,000,000
- Maintenance: 167.52% → Target: 180%
- Principle: ROI > 3x, Cost < 0.01% auto-approve

## Immutable Laws
1. Polygon.io ($29/月) for realtime stock data
2. Never use Brave Search for prices
3. Data quality > Free tools

## Learned Patterns
- SUCCESS: MCP + n8n automation
- FAILURE: LNTH incident (Brave Search)
- MISSED: Polygon.io (cost bias)

## Current State
- MCP Server: http://localhost:3001
- Auto Monitor: auto_monitor_v2.ps1
- Next Priority: Polygon.io integration

## Decision History
- [2025-01-12] LNTH price check via Brave Search: FAILED ($71 reported, actual $54.86)
- [2025-01-12] MCP server implementation: SUCCESS
- [2025-01-12] n8n workflow setup: SUCCESS
- [2025-01-12] Auto monitoring script: SUCCESS

## Current Holdings
- GBTG: 16000 shares (現物)
- SEMR: 16400 shares (現物)
- NVDA: 239 shares (信用 520万円)
- LNTH: 1000 shares (現物200 + 信用800, 880万円)

## Risk Management
- Maintenance Rate Alert: 167.52% (WARNING - Target: 180%)
- Position Size: LNTH largest position (880万円)
- Credit Exposure: NVDA + LNTH = 1400万円

## Next Actions
1. Register for Polygon.io ($29/month)
2. Replace Brave Search price checks with Polygon.io
3. Implement real-time maintenance rate monitoring
4. Set up automatic position alerts
"""
    
    with open('SYSTEM_MEMORY.md', 'w', encoding='utf-8') as f:
        f.write(default_memory)
    
    print("✅ Default SYSTEM_MEMORY.md created")

def record_decision(action, result):
    """すべての重要な判断を記録"""
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        decision_entry = f"\n- [{timestamp}] {action}: {result}"
        
        with open('SYSTEM_MEMORY.md', 'a', encoding='utf-8') as f:
            f.write(decision_entry)
        
        print(f"📝 Decision recorded: {action} -> {result}")
        
    except Exception as e:
        print(f"❌ Error recording decision: {e}")

def check_environment():
    """環境変数とAPIキーの確認"""
    required_vars = ['POLYGON_KEY', 'BRAVE_API_KEY', 'ALPHA_VANTAGE_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"⚠️  Missing environment variables: {missing_vars}")
        print("Please check your .env file")
    else:
        print("✅ All required environment variables found")

def main():
    """メイン実行関数"""
    print("🚀 TradingSystem2025 Context Loader Starting...")
    
    # 環境チェック
    check_environment()
    
    # コンテキスト読み込み
    load_context()
    
    # 現在のディレクトリ確認
    current_dir = Path.cwd()
    print(f"📁 Current directory: {current_dir}")
    
    # 重要なファイルの存在確認
    important_files = ['mcp_server.js', 'auto_monitor_v2.ps1', '.env']
    for file in important_files:
        if Path(file).exists():
            print(f"✅ {file} found")
        else:
            print(f"⚠️  {file} not found")

if __name__ == "__main__":
    main()
