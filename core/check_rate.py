import json
import os
from datetime import datetime

print("=" * 50)
print("維持率チェックツール")
print("=" * 50)

# ファイル確認
if os.path.exists('moomoo_data.json'):
    print("✅ moomoo_data.json が見つかりました")
    
    # データ読み込み
    with open('moomoo_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 最新データ表示
    if data:
        latest = data[-1]
        rate = latest.get('保証金率', 0)
        print(f"\n現在の維持率: {rate}%")
        
        if rate >= 180:
            print("状態: ✅ 安全")
        else:
            print("状態: ⚠️ 注意")
else:
    print("❌ moomoo_data.json が見つかりません")

print("=" * 50)