import pytest
from desktop_tutorial.providers.yahoo import YahooProvider


@pytest.mark.e2e
def test_aapl_price_positive():
    price = YahooProvider().fetch_price("AAPL")
    assert isinstance(price, float) and price > 0
