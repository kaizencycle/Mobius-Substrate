from app.models import RawItem
from app.scoring import score_impact


def test_scoring_medium_or_high_for_dual_sources():
    group = [
        RawItem(
            source="Reuters",
            title="NATO drill announced in Baltic region",
            url="https://www.reuters.com/example",
            topic="defense",
        ),
        RawItem(
            source="AP",
            title="NATO drill announced in Baltic region",
            url="https://apnews.com/example",
            topic="defense",
        ),
    ]

    impact = score_impact(group)
    assert impact in {"medium", "high"}
