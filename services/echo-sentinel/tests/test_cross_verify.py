from app.ingest import cross_verify
from app.models import RawItem


def test_cross_verify_minimum_sources():
    items = [
        RawItem(
            source="Reuters",
            title="ECB holds rates as inflation cools",
            url="https://www.reuters.com/example",
            topic="economy",
        ),
        RawItem(
            source="AP",
            title="ECB holds rates as inflation cools",
            url="https://apnews.com/example",
            topic="economy",
        ),
    ]

    events = cross_verify(items, min_sources=2)
    assert len(events) == 1
    event = events[0]
    assert event.topic == "economy"
    assert len(event.items) == 2
