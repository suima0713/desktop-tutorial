from __future__ import annotations
from importlib.metadata import version, PackageNotFoundError

try:
    __version__ = version(__name__.replace("_", "-"))  # pip/pypi はハイフン区切り
except PackageNotFoundError:  # dev 環境などメタデータが無い場合
    __version__ = "0.dev0"  # 好きなプレースホルダで OK

__all__ = [
    "__version__",
    # ここに公開 API を列挙
]
