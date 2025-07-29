from __future__ import annotations

import hashlib
import os
from pathlib import Path
from typing import Literal

import pandas as pd

# 既定キャッシュディレクトリ（環境変数で上書き可）
_CACHE_DIR = Path(os.getenv("MYPKG_CACHE_DIR", ".cache"))
_CACHE_DIR.mkdir(exist_ok=True)

_FileFmt = Literal["parquet", "csv"]


def _hash_key(*, symbol: str, start: str | None, end: str | None, freq: str) -> str:
    raw = f"{symbol}-{start}-{end}-{freq}"
    return hashlib.md5(raw.encode()).hexdigest()  # nosec B303


def _path(key: str, fmt: _FileFmt) -> Path:
    return _CACHE_DIR / f"{key}.{fmt}"


def read(
    symbol: str,
    *,
    start: str | None,
    end: str | None,
    freq: str,
    fmt: _FileFmt = "parquet",
) -> pd.DataFrame | None:
    """キャッシュがあれば DataFrame、なければ None を返す。"""
    key = _hash_key(symbol=symbol, start=start, end=end, freq=freq)
    fp = _path(key, fmt)
    if not fp.exists():
        return None

    if fmt == "parquet":
        return pd.read_parquet(fp)
    if fmt == "csv":
        return pd.read_csv(fp, index_col=0, parse_dates=True)
    raise ValueError("Unsupported fmt")


def write(
    df: pd.DataFrame,
    *,
    symbol: str,
    start: str | None,
    end: str | None,
    freq: str,
    fmt: _FileFmt = "parquet",
) -> Path:
    """DataFrame をキャッシュへ保存し、パスを返す。"""
    key = _hash_key(symbol=symbol, start=start, end=end, freq=freq)
    fp = _path(key, fmt)

    if fmt == "parquet":
        df.to_parquet(fp, engine="pyarrow", index=True, compression="zstd")
    else:
        df.to_csv(fp)
    return fp
