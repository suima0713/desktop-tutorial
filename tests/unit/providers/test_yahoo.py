import pandas as pd
import pytest
from mypkg.providers.yahoo import YahooProvider


@pytest.mark.e2e
def test_aapl_price_positive():
    price = YahooProvider().fetch_price("AAPL")
    assert isinstance(price, float) and price > 0


def test_normalize_multiindex():
    raw = pd.DataFrame(
        {("Close", "AAPL"): [1, 2], ("Adj Close", "AAPL"): [1, 2]},
        index=pd.date_range("2025-01-01", periods=2),
    )
    provider = YahooProvider()
    out = provider._normalize(raw)  # ← 正しいメソッド名
    assert list(out.columns) == ["close", "adjclose"]


def test_fetch_price_keyerror(monkeypatch):
    """close 列が無い場合に KeyError が返る分岐をカバー"""
    provider = YahooProvider()
    # _fetch_history が close/adjclose を含まない DF を返すように差し替え
    empty = pd.DataFrame([{"open": 1, "high": 1, "low": 1}])
    monkeypatch.setattr(provider, "_fetch_history", lambda *a, **kw: empty)
    with pytest.raises(KeyError):
        provider.fetch_price("DUMMY")
