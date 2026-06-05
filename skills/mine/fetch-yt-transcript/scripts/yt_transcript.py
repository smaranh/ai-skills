#!/usr/bin/env python3
"""Fetch a YouTube video transcript. Usage: python yt_transcript.py <url|video_id> [lang]"""
import sys
import re
from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi


def extract_video_id(url_or_id: str) -> str:
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", url_or_id):
        return url_or_id
    u = urlparse(url_or_id)
    if u.hostname in ("youtu.be",):
        return u.path.lstrip("/")
    if u.hostname and "youtube.com" in u.hostname:
        if u.path == "/watch":
            return parse_qs(u.query)["v"][0]
        m = re.match(r"^/(embed|shorts|v)/([A-Za-z0-9_-]{11})", u.path)
        if m:
            return m.group(2)
    raise ValueError(f"Could not extract video ID from: {url_or_id}")


def main():
    if len(sys.argv) < 2:
        print("Usage: yt_transcript.py <url|video_id> [lang]", file=sys.stderr)
        sys.exit(1)

    video_id = extract_video_id(sys.argv[1])
    lang = sys.argv[2] if len(sys.argv) > 2 else "en"

    api = YouTubeTranscriptApi()
    try:
        fetched = api.fetch(video_id, languages=[lang])
    except Exception:
        tlist = api.list(video_id)
        fetched = next(iter(tlist)).fetch()
        print(f"[note] '{lang}' not found, using {fetched.language_code}", file=sys.stderr)

    for snip in fetched:
        print(snip.text)


if __name__ == "__main__":
    main()
