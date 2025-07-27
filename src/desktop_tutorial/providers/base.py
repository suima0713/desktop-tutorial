from abc import ABC, abstractmethod
from pathlib import Path
import json
import time

CACHE_DIR = Path.home() / ".cache" / "finance"
CACHE_DIR.mkdir(parents=True, exist_ok=True)
TTL = 24 * 3600  # 1 day


class BaseProvider(ABC):
    @abstractmethod
    def fetch_price(self, ticker: str) -> float: ...

    # 共通のシンプルキャッシュ
    def _cache_get(self, key: str):
        p = CACHE_DIR / f"{key}.json"
        if p.exists() and time.time() - p.stat().st_mtime < TTL:
            return json.loads(p.read_text())
        return None

    def _cache_set(self, key: str, data):
        (CACHE_DIR / f"{key}.json").write_text(json.dumps(data))
