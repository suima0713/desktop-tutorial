from __future__ import annotations
from datetime import date

import yfinance as yf
import pandas as pd

from .base import BaseProvider


class YahooProvider(BaseProvider):
    """Yahoo Finance から株価データを取得する"""

    def _normalize_columns(self, df: "pd.DataFrame") -> "pd.DataFrame":
        """
        - MultiIndex(Price, Ticker) → Price 列だけ残して単層化
        - 列名を小文字にし空白を除去
        """
        if isinstance(df.columns, pd.MultiIndex):
            # 最初のレベル（Price）だけ残す
            df = df.copy()
            df.columns = df.columns.get_level_values(0)

        df.columns = (
            df.columns.astype(str).str.lower().str.replace(" ", "", regex=False)
        )
        return df

    def fetch(
        self,
        symbol: str,
        *,
        start: date | None = None,
        end: date | None = None,
    ) -> list[dict]:
        self._validate_dates(start, end)
        df = yf.download(symbol, start=start, end=end, progress=False)
        df = self._normalize_columns(df)
        df.reset_index(inplace=True)
        return df.to_dict("records")

    def fetch_price(self, symbol: str) -> float:
        latest = self.fetch(symbol)[-1]
        return latest.get("close") or latest["adjclose"]
