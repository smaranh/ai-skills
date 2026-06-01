---
name: update-resume
description: Refresh the base resume, cover letter, and workspace docs from career-walkthru.md. Use when the user changes jobs, gets a promotion, has new metrics/skills/achievements, wants to fill [NEEDS INPUT] gaps, or says "update my resume" / "update career-walkthru".
---

# Update Resume — sync everything from career-walkthru.md

`career-walkthru.md` is the single source of truth. This skill detects what's missing or new, fills it with the user, writes it back into career-walkthru.md FIRST, then regenerates the downstream artifacts. Every run is logged.

## Golden rules
- **career-walkthru.md is the hub.** Write new facts there first, then regenerate. Never edit resume/cover content without updating career-walkthru.
- **Never fabricate.** Unanswered gaps stay `[NEEDS INPUT]`.
- **Never assume on structural changes** (dropping/condensing a role, length trade-offs) — always ASK.

## Step 1 — Scan career-walkthru.md
Report findings in three buckets:
1. **Incomplete sections** — thin or empty sections.
2. **Gaps** — every `[NEEDS INPUT]` marker.
3. **New / changed role** — compare the Snapshot "Current title/company" and the top timeline entry against the current base resume (`Resume Smaran Harihar - 2026`). Flag any new job, promotion, title, or date change.

## Step 2 — Interview (use the `grill-me` skill)
Invoke `grill-me`: ask **one question at a time**, each with a recommended answer **and** a "skip / leave as-is" option so it never blocks. Walk every gap and any detected role change. Stop when the user is done or all items are resolved/skipped.

## Step 3 — Update career-walkthru.md
Write answers in; update Snapshot, timeline, skills, metrics, recognition as needed; remove resolved `[NEEDS INPUT]`; bump `_Last updated_`.

## Step 4 — Choose regeneration scope (ASK every time)
Always ask the user to pick:
- (a) regenerate **both** resume + cover letter, or
- (b) regenerate **only the artifacts the change affects**.
Present both options every run; never decide alone.

## Step 5 — Propagate (data-driven)
Resume/cover content lives in JSON consumed by the generators in `.claude/skills/tailor-application/`:
- `resume-content.json` → `build_resume.js`
- `cover-content.json`  → `build_cover.js`

Edit the relevant JSON (summary, tagline, skills, a role's bullets, metrics, contact). For a **new role**, prepend an entry to `experience[]`. If adding it risks pushing the resume over 2 pages, **ASK** whether to drop/condense the oldest role — never decide. Then regenerate the base files into the Interview root:
- `Resume Smaran Harihar - 2026.docx` + `.pdf`
- `Cover Letter Smaran Harihar - Template 2026.docx` + `.pdf`

Map change-type → other files (only touch what the change affects):
- positioning / title / contact change → `CLAUDE.md` ("Who") + `.claude/references/positioning.md`
- metric / claim change → `.claude/references/positioning.md`
- design change → `.claude/references/style-guide.md` (rare)

## Step 6 — Verify
Render the regenerated PDFs to images. Confirm: resume ≤ 2 pages, cover letter 1 page, no `[NEEDS INPUT]` leaked into the resume, dates/metrics match career-walkthru. Delete any `.tmp`/lock files left by the PDF conversion.

## Step 7 — Log
Append one line to `.claude/logs/update-resume.log` (create if missing):
`YYYY-MM-DD HH:MM — <what changed> — files: <updated files> — gaps remaining: <n>`

## Running the generators (this sandbox)
`docx` often won't install from npm here; use the preinstalled global modules:
```
NODE_PATH=/usr/local/lib/node_modules_global/lib/node_modules \
  node build_resume.js resume-content.json "out.docx"
```
Convert to PDF with the docx skill's helper:
```
python3 <docx-skill>/scripts/office/soffice.py --headless --convert-to pdf "out.docx" --outdir "<dir>"
```
