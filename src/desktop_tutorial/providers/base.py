from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import date
from typing import Protocol, TypedDict, final


class PriceBar(TypedDict):
    date: date
    open: float
    high: float
    low: float
    close: float
    volume: int


class Provider(Protocol):
    @abstractmethod
    def fetch(
        self, symbol: str, *, start: date | None = None, end: date | None = None
    ) -> list[PriceBar]: ...


class BaseProvider(ABC):
    retry = 3  # 共通リトライ回数

    @final
    def _validate_dates(self, start: date | None, end: date | None) -> None:
        if start and end and start > end:
            raise ValueError("start must be <= end")

    @abstractmethod
    def fetch(
        self, symbol: str, *, start: date | None = None, end: date | None = None
    ) -> list[PriceBar]: ...
