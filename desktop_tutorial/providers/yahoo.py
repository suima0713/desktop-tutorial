import yfinance as yf
from .base import BaseProvider


class YahooProvider(BaseProvider):
    def fetch_price(self, ticker: str) -> float:
        key = f"yahoo-{ticker.lower()}"
        cached = self._cache_get(key)
        if cached is not None:
            return cached
        price = float(yf.Ticker(ticker).history(period="1d")["Close"].iloc[-1])
        self._cache_set(key, price)
        return price
