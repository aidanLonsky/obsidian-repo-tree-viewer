# Task 09 — Commands and ribbon

## Goal
Register command palette entries and an optional ribbon button.

## Acceptance criteria
- Commands registered in `src/commands.ts`, called from main.ts:
  - "Repo Tree: Refresh current note" — invalidates cache for all
    repo-tree blocks in the active file and triggers re-render
  - "Repo Tree: Clear all cache" — calls `cache.invalidate` for
    all stored keys
  - "Repo Tree: Copy tree to clipboard" — copies last rendered
    tree string for the active block
- Ribbon icon (git-branch lucide icon) triggers
  "Refresh current note" command
- Commands that require an active file are disabled
  (via `checkCallback`) when no file is open

## Do not
- Implement cache or tree logic directly — call into existing modules