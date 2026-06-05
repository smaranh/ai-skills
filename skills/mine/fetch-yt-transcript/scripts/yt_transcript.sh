#!/usr/bin/env bash
# Usage: ./yt_transcript.sh <youtube_url> [lang]
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <youtube_url> [lang]" >&2
  exit 1
fi

python3 -c "import youtube_transcript_api" 2>/dev/null || \
  pip install --quiet youtube-transcript-api

python3 "$(dirname "$0")/yt_transcript.py" "$@"
