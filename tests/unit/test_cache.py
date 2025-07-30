import importlib
import pandas as pd
import pytest
from desktop_tutorial import cache


def _df():
    return pd.DataFrame({"x": [1, 2]}, index=pd.date_range("2025-01-01", periods=2))


# -------- round‑trip --------
def test_roundtrip_parquet(tmp_path, monkeypatch):
    monkeypatch.setenv("DESKTOP_TUTORIAL_CACHE_DIR", str(tmp_path))
    cache._CACHE_DIR = tmp_path  # ❶ キャッシュ先を上書き
    df = _df()
    fp = cache.write(df, symbol="TEST", start=None, end=None, freq="1d", fmt="parquet")
    assert fp.suffix == ".parquet"
    loaded = cache.read("TEST", start=None, end=None, freq="1d", fmt="parquet")
    pd.testing.assert_frame_equal(df, loaded)


def test_roundtrip_csv(tmp_path, monkeypatch):
    monkeypatch.setenv("DESKTOP_TUTORIAL_CACHE_DIR", str(tmp_path))
    cache._CACHE_DIR = tmp_path
    df = _df()
    fp = cache.write(df, symbol="CSV", start=None, end=None, freq="1d", fmt="csv")
    assert fp.suffix == ".csv"
    loaded = cache.read("CSV", start=None, end=None, freq="1d", fmt="csv")
    pd.testing.assert_frame_equal(df, loaded)


# -------- 異常系 --------
def test_cache_unsupported_fmt(tmp_path, monkeypatch):
    monkeypatch.setenv("DESKTOP_TUTORIAL_CACHE_DIR", str(tmp_path))
    cache._CACHE_DIR = tmp_path
    df = _df()
    with pytest.raises(ValueError, match="Unsupported fmt"):
        cache.write(df, symbol="ERR", start=None, end=None, freq="1d", fmt="xlsx")


# -------- 内部ヘルパー --------
def test_path_and_key(monkeypatch, tmp_path):
    monkeypatch.setenv("DESKTOP_TUTORIAL_CACHE_DIR", str(tmp_path))
    importlib.reload(cache)  # ❷ 環境変数を反映させる
    from desktop_tutorial.cache import _hash_key, _path

    key = _hash_key(symbol="ABC", start=None, end=None, freq="1d")
    fp = _path(key, fmt="csv")
    assert fp.parent == tmp_path
    assert fp.name.endswith(".csv")


@pytest.mark.parametrize("fmt", ["parquet", "csv"])
def test_write_read_both_fmt(tmp_path, monkeypatch, fmt):
    """write → read の両フォーマットを網羅 (分岐カバー)"""
    monkeypatch.setenv("DESKTOP_TUTORIAL_CACHE_DIR", str(tmp_path))
    cache._CACHE_DIR = tmp_path
    df = _df()
    fp = cache.write(df, symbol="BOTH", start=None, end=None, freq="1d", fmt=fmt)
    assert fp.exists()
    loaded = cache.read("BOTH", start=None, end=None, freq="1d", fmt=fmt)
    pd.testing.assert_frame_equal(df, loaded)
