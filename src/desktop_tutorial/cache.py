# src/desktop_tutorial/cache.py
from __future__ import annotations

# ファイル冒頭付近（既存の import 群とまとめる）
import datetime as _dt
import hashlib
import json
import os
from datetime import datetime
from pathlib import Path

import pandas as pd

# --------------------------------------------------
# 設定
# --------------------------------------------------
# 環境変数で上書き可能にしておくとテストが楽
_CACHEDIR = Path(os.getenv("DESKTOP_TUTORIAL_CACHE_DIR", ".cache"))


# --------------------------------------------------
# 内部ヘルパー
# --------------------------------------------------
def _build_path(symbol: str, start, end, freq: str, fmt: str) -> Path:
    """
    キャッシュファイルの保存パスを一意に組み立てる。
    例: .cache/TEST_20250101_20250131_1d.parquet
    """
    s = _fmt_date(start)
    e = _fmt_date(end)
    fname = f"{symbol}_{s}_{e}_{freq}.{fmt}"
    return _CACHEDIR / fname


def _fmt_date(ts) -> str:
    if ts is None:
        return "none"
    if isinstance(ts, (pd.Timestamp, datetime)):
        return ts.strftime("%Y%m%d")
    return str(ts)


# --------------------------------------------------
# write / read
# --------------------------------------------------
def write(
    df: pd.DataFrame,
    *,
    symbol: str,
    start,
    end,
    freq: str = "1d",
    fmt: str = "parquet",
) -> Path:
    """DataFrame をローカルキャッシュに保存し、パスを返す。"""
    if fmt not in {"parquet", "csv"}:
        raise ValueError(f"Unsupported fmt: {fmt}")

    path = _build_path(symbol, start, end, freq, fmt)
    path.parent.mkdir(parents=True, exist_ok=True)

    out = df.copy()
    out.index.freq = pd.tseries.frequencies.to_offset(freq)

    if fmt == "parquet":
        out.to_parquet(path)
    else:
        out.to_csv(path)

    return path


def read(
    symbol: str,
    *,
    start,
    end,
    freq: str = "1d",
    fmt: str = "parquet",
) -> pd.DataFrame:
    """キャッシュから DataFrame を読み込む。存在しない場合は FileNotFoundError"""
    path = _build_path(symbol, start, end, freq, fmt)

    if fmt == "parquet":
        df = pd.read_parquet(path)
    else:
        df = pd.read_csv(path, index_col=0, parse_dates=True)

    df.index.freq = pd.tseries.frequencies.to_offset(freq)
    return df


# src/desktop_tutorial/cache.py  の末尾


# --------------------------------------------------------------------
# Back‑compat helpers for old tests
# --------------------------------------------------------------------
def _hash_key(symbol: str, start, end, freq: str) -> str:
    """旧テスト用：キャッシュキーを MD5 ハッシュで返す"""

    def _iso(x):
        return x.isoformat() if isinstance(x, _dt.datetime) else str(x)

    blob = json.dumps([symbol, _iso(start), _iso(end), freq])
    return hashlib.md5(blob.encode()).hexdigest()[:8]


def _path(
    symbol_or_key: str,
    start=None,
    end=None,
    freq: str = "1d",
    fmt: str = "parquet",
) -> Path:
    """
    旧テスト互換のヘルパー。

    1. もし start/end が None なら、symbol_or_key は **すでにハッシュ化されたキー** とみなす
       → .cache/<key>.<fmt>
    2. それ以外は通常の build_path を呼び出す
    """
    if start is None and end is None:
        return _CACHEDIR / f"{symbol_or_key}.{fmt}"

    return _build_path(symbol_or_key, start, end, freq, fmt)
