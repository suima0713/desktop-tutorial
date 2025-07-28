from __future__ import annotations
from datetime import date
import yfinance as yf
from .base import BaseProvider


class YahooProvider(BaseProvider):
    """Yahoo Finance から株価データを取得する"""

    def fetch(
        self,
        symbol: str,
        *,
        start: date | None = None,
        end: date | None = None,
    ):
        self._validate_dates(start, end)
        df = yf.download(symbol, start=start, end=end, progress=False)

        # 列名を小文字＆空白除去で統一
        df.columns = df.columns.str.lower().str.replace(" ", "")
        df.reset_index(inplace=True)
        return df.to_dict("records")

    # テスト用ヘルパー
    def fetch_price(self, symbol: str) -> float:
        bars = self.fetch(symbol)
        latest = bars[-1]
        return latest.get("close") or latest["adjclose"]
