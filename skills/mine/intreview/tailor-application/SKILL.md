---
name: tailor-application
description: Generate a resume and cover letter tailored to a specific job opening. Use when the user points to a company's job.md under "job openings/<Company>/", asks to tailor their application, or wants a role-specific resume/cover letter built from the base versions.
---

# Tailor Application

Produce a tailored resume + cover letter for one job opening — matching Smaran's existing design and staying strictly truthful.

## Inputs
1. Target `job openings/<Company>/job.md` (company overview + job description). If missing, ask the user to copy `job openings/_TEMPLATE/job.md` and fill it in.
2. Source of truth: `career-walkthru.md` (facts + verified metrics).
3. Base content (this folder): `resume-content.json` and `cover-content.json` — the canonical base resume/cover content, consumed by `build_resume.js` / `build_cover.js`.
4. Positioning/voice: `.claude/references/positioning.md`. Design/tone: `.claude/references/style-guide.md`.

## Steps
1. Read `job.md`. Extract: company, role title, location, top 5–8 requirements/keywords, domain, explicit must-haves, and the user's "why interested" note.
2. Read `career-walkthru.md` + both reference files. Map Smaran's real experience and metrics to the role's keywords. **Never invent facts.**
3. **Copy** the base JSON into the company folder, e.g. `job openings/<Company>/resume-content.json` and `cover-content.json`. Tailor those copies (leave the base files untouched):
   - Resume: reorder/reword skills lines and bullets to surface the most relevant *true* experience first; adjust the summary's emphasis to the role; mirror JD keywords only where genuinely true; keep every metric accurate.
   - Cover letter: fill the placeholder (`ph`) runs in block 1 (why this company/role, using the "why interested" note) and the final block (close tied to the role); keep the reusable middle paragraphs trimmed to one page; set `showHowToUse` to `false`; address it to the company.
4. Generate the files by running the generators against the tailored JSON, then convert to PDF. Save into `job openings/<Company>/`:
   - `Resume - Smaran Harihar - <Company>.docx` + `.pdf`
   - `Cover Letter - Smaran Harihar - <Company>.docx` + `.pdf`
5. Verify: render PDFs to images; confirm resume ≤ 2 pages, cover letter 1 page, **no leftover `[brackets]`** in the cover letter, no fabricated claims. Delete any `.tmp`/lock files.

## Running the generators (this sandbox)
`docx` often won't install from npm here; use the preinstalled global modules:
```
NODE_PATH=/usr/local/lib/node_modules_global/lib/node_modules \
  node build_resume.js "<path>/resume-content.json" "<out>.docx"
```
Convert to PDF with the docx skill's helper:
```
python3 <docx-skill>/scripts/office/soffice.py --headless --convert-to pdf "<out>.docx" --outdir "<dir>"
```

## Rules
- **Truth only** — facts and numbers come from `career-walkthru.md`.
- **"Agentic" = AI development harness/workflow**, not user-facing agents (see positioning.md).
- Keep the existing visual design (style-guide.md). Don't edit the base JSON here — that's the `update-resume` skill's job.
- Leave each company's folder clean (no `.tmp`/lock files).
