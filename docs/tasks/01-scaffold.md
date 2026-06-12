# Task 01 — Scaffold

## Goal
Extend the base Obsidian sample plugin to establish the file structure
this plugin will use. No logic implemented yet — structure only.

## Acceptance criteria
- `src/` contains empty placeholder modules for each layer:
  settings.ts, errors.ts, tree-builder.ts, github-api.ts,
  cache.ts, block-processor.ts, renderer.ts, commands.ts
- Each placeholder exports a single comment: `// TODO: Task XX`
- main.ts imports from each module (no-ops for now)
- `npm run build` passes with no errors after scaffold

## Do not
- Implement any logic
- Modify manifest.json or styles.css yets