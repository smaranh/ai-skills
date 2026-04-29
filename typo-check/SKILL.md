---
name: typo-check
description: Set up Typo check pre-commit hooks. Stop the commit if typo is found. Add commit with description of what changed.
---

# Setup Pre-Commit Hooks

## What This Sets Up

- **Typo check** Make sure that there are no typos in the files that are about to be committed.
- If Typo is found, stop the commit and inform the user of the typo.
- **Commit** Add commit with description of what changed in each file.

## Steps

### 1. Identify Files

Run `git status` to identify every new or updated file in the working tree (modified, added, untracked). Each of these files will be committed individually.

### 2. Typo Check

For each file, scan its contents (or diff for modified files) for typos. If a typo is found, stop and inform the user — do not proceed with the commit until the typo is resolved.

### 3. Commit

For each new or updated file from step 1, create a separate commit. Stage and commit each file one at a time so that each commit message references exactly one file.

The commit message MUST follow this exact two-part format: a single-line subject, a blank line, then a markdown bullet list of the individual changes in that file.

```
Changes in <file-name>: <one-line summary of change>

- <change 1>
- <change 2>
- <change 3>
```

Where:
- `<file-name>` is the path of the file as shown in `git status` (e.g. `Input.md`, `Report/Steps-2026-04-26.md`, `.claude/skills/typo-check/SKILL.md`).
- `<one-line summary of change>` is a concise high-level summary of what changed in that file (kept on the subject line so it renders cleanly in `git log --oneline` and the GitHub commits view).
- The bullet list below the blank line enumerates each discrete change in that file as its own `- ` bullet. One bullet per logical change. If only one logical change exists, still include a single bullet so the format is consistent.
- Do NOT mention typo fixes in the commit message. Typos should be fixed silently before committing — they are not tracked in the commit history.

Pass the message via a HEREDOC to preserve newlines and the bullet list, e.g.:

```
git commit -m "$(cat <<'EOF'
Changes in Input.md: refresh tomorrow's task list

- clear today's accomplishments
- add 'Prompting 101' video to Additional Items
EOF
)"
```

The result is one commit per changed file, each with a `Changes in <file-name>: ...` subject line followed by a bullet list of the specific changes — readable both in `git log` and on GitHub.
