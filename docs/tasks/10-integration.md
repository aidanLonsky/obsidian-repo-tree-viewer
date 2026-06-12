# Task 10 — Wire everything in main.ts

## Goal
Connect all modules in the plugin's main.ts onload/onunload lifecycle.

## Acceptance criteria
- `onload()`:
  - Loads settings via `loadData()`
  - Instantiates `RepoTreeCache` with TTL from settings
  - Registers code block processor for `repo-tree` language string
  - Registers settings tab
  - Calls commands registration function
- `onunload()`:
  - No explicit teardown needed beyond what Obsidian handles,
    but add a comment explaining why
- Plugin class holds references to cache instance and settings
  as public properties so modules can access via plugin ref
- `npm run build` produces no TypeScript errors

## Do not
- Duplicate any logic already in other modules
- Add new features — integration only