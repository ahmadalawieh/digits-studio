from pathlib import Path
import json

FRAGMENTS = json.loads((Path(__file__).resolve().parent / 'motion-fragments.json').read_text(encoding='utf8'))


def hero_markup(ar=False):
    return '<div data-motion-dee-journey>' + FRAGMENTS['deeJourney']['ar' if ar else 'en'] + '</div>'
