import pandas as pd
from mypkg import cache


def test_roundtrip_parquet(tmp_path, monkeypatch):
    monkeypatch.setenv("MYPKG_CACHE_DIR", str(tmp_path))
    df = pd.DataFrame({"x": [1, 2]})
    cache.write(df, symbol="TEST", start=None, end=None, freq="1d", fmt="parquet")
    loaded = cache.read("TEST", start=None, end=None, freq="1d", fmt="parquet")
    pd.testing.assert_frame_equal(df, loaded)


def test_roundtrip_csv(tmp_path, monkeypatch):
    monkeypatch.setenv("MYPKG_CACHE_DIR", str(tmp_path))
    df = pd.DataFrame(
        {"x": [3, 4]},
        index=pd.to_datetime(["2025-01-01", "2025-01-02"]),  # ← DateTimeIndex にする
    )
    cache.write(df, symbol="CSV", start=None, end=None, freq="1d", fmt="csv")
    loaded = cache.read("CSV", start=None, end=None, freq="1d", fmt="csv")
    pd.testing.assert_frame_equal(df, loaded)
