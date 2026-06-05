---
description: Fetch a YouTube transcript and save it to raw/articles/ with frontmatter.
argument-hint: the YouTube URL (or video ID)
---

Fetch the transcript for: **$ARGUMENTS**

## Procedure

1. **Validate the argument.** If `$ARGUMENTS` is empty, stop and ask the user for a YouTube URL. Accept any of: `https://www.youtube.com/watch?v=...`, `https://youtu.be/...`, `/shorts/...`, `/embed/...`, or a raw 11-character video ID.

2. **Ask the user for the video title.** Use `AskUserQuestion` with a free-text prompt — the user will provide the exact title. Do NOT attempt to auto-fetch the title from YouTube. The title is required; do not proceed without it.

3. **Derive the filename slug** from the title:
   - Lowercase
   - Replace spaces with `-`
   - Strip apostrophes, quotes, parentheses, and other punctuation
   - Collapse repeated `-`
   - Trim leading/trailing `-`
   - Final filename: `raw/articles/yt-<slug>-transcript.md`

4. **Run the fetch script** from the vault root:

   ```bash
   ./.claude/skills/fetch-yt-transcript/scripts/yt_transcript.sh "<url>" > raw/articles/yt-<slug>-transcript.md
   ```

   If the script fails (network error, no captions available, etc.), report the error to the user and stop. Do NOT leave a partial/empty file behind — delete it if the script wrote nothing useful.

5. **Prepend frontmatter** to the saved file using `Edit`. Match this template exactly (replace placeholders, keep field order):

   ```yaml
   ---
   title: <video title from step 2>
   source: youtube
   url: <full youtube URL>
   video_id: <11-char video ID>
   fetched: <today's date, YYYY-MM-DD>
   language: en
   ---

   ```

   The blank line between the closing `---` and the transcript body is required.

6. **Confirm to the user.** Report the saved path and line count in one or two lines. Do NOT auto-run `/ingest` — leave that as a separate user-initiated step.

## Notes

- The underlying script lives at `.claude/skills/fetch-yt-transcript/scripts/yt_transcript.sh` and depends on the Python package `youtube-transcript-api` (the shell wrapper auto-installs it on first run).
- Per project conventions, `raw/` is read-only except for *creating* new source files. This skill creates new files; it must never overwrite an existing transcript without the user's explicit OK.
- If the target filename already exists, ask the user whether to overwrite, pick a new name, or abort.
