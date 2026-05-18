# SFG Checkpoint Report Rules

## Purpose

Produce concise checkpoint summaries for SFG work without burning unnecessary tokens.

## Token Rules

- Prefer `git status`, `git diff --name-only`, and recent commit messages.
- Do not scan the full repo.
- Do not reread large files unless needed.
- Do not rerun build if a successful build was already reported in the same session.
- Keep summaries short, factual, and implementation-focused.

## Output Format

### Branch
- current:
- base:

### Changed Files
- `path`: purpose

### Completed
- ...

### Verified
- ...

### Not Done Yet
- ...

### Risks / Follow-ups
- ...

### Suggested Commit Message
`type(scope): summary`