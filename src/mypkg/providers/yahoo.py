"""
Yahoo Finance provider
======================

* yfinance で時系列データを取得
* Parquet / CSV キャッシュを透過的に利用
* 最新終値を float で返す ``fetch_price`` と
  履歴 DataFrame を返す ``fetch`` を公開
"""

from __future__ import annotations

import pandas as pd
import yfinance as yf

from mypkg.providers.base import BaseProvider
from mypkg import cache


# --------------------------------------------------------------------------- #
# Helpers                                                                     #
# --------------------------------------------------------------------------- #
def _normalize(df: pd.DataFrame) -> pd.DataFrame:
    """MultiIndex を flatten し、列名を小文字・空白除去に統一して返す。"""
    if isinstance(df.columns, pd.MultiIndex):
        # ('Adj Close', 'AAPL') -> 'adjcloseaapl'
        df.columns = [
            "".join(map(str, col)).replace(" ", "").lower() for col in df.columns
        ]
    else:
        df.columns = [c.replace(" ", "").lower() for c in df.columns]

    df.index = pd.to_datetime(df.index, utc=False)
    df.sort_index(inplace=True)
    return df


# --------------------------------------------------------------------------- #
# Provider                                                                    #
# --------------------------------------------------------------------------- #
class YahooProvider(BaseProvider):
    """Price provider backed by Yahoo Finance (via *yfinance*)."""

    provider_name = "yahoo"

    # ---- BaseProvider interface ------------------------------------------- #
    def fetch(
        self,
        symbol: str,
        start: str | None = None,
        end: str | None = None,
        freq: str = "1d",
    ) -> pd.DataFrame:
        """履歴 OHLCV を DataFrame で返す。"""
        return self._fetch_history(symbol, start, end, freq)

    # ---- Public convenience API ------------------------------------------- #
    def fetch_price(self, symbol: str) -> float:
        """最新の終値（なければ調整後終値）を float で返す。"""
        df = self._fetch_history(symbol)
        latest = df.iloc[-1]

        ticker = symbol.lower()
        for key in (
            "close",
            "adjclose",
            f"close_{ticker}",
            f"adjclose_{ticker}",
            f"close{ticker}",
            f"adjclose{ticker}",
        ):
            if key in latest:
                return float(latest[key])

        raise KeyError(
            f"close/adjclose column not found for {symbol}: {list(latest.index)}"
        )

    # 互換エイリアス
    fetch_latest_close = fetch_price

    # ---- Internal implementation ----------------------------------------- #
    def _fetch_history(
        self,
        symbol: str,
        start: str | None = None,
        end: str | None = None,
        freq: str = "1d",
    ) -> pd.DataFrame:
        """キャッシュ付きで履歴 DataFrame を取得する内部ヘルパー。"""
        # ① キャッシュ
        cached = cache.read(symbol=symbol, start=start, end=end, freq=freq)
        if cached is not None:
            return cached

        # ② Yahoo Finance 取得
        raw = yf.download(symbol, start=start, end=end, interval=freq, progress=False)
        df = _normalize(raw)

        # ③ キャッシュ保存（失敗しても処理継続）
        try:
            cache.write(df, symbol=symbol, start=start, end=end, freq=freq)
        except Exception:  # pragma: no cover
            pass

        return df
