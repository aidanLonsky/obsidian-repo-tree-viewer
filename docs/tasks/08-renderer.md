# Task 08 — Tree formatter and HTML renderer

## Goal
Convert a flat path list into ASCII tree syntax and inject into the DOM.

## Acceptance criteria
- `src/renderer.ts` exports:

\`\`\`ts
export function formatTree(paths: string[]): string {}
export function renderTree(el: HTMLElement, tree: string): void {}
export function renderError(el: HTMLElement, err: RepoTreeError): void {}
export function renderLoading(el: HTMLElement): void {}
\`\`\`

- `formatTree` produces standard tree connector syntax:
\`\`\`
src/
├── main.ts
├── settings.ts
└── tree-builder.ts
\`\`\`
- Handles nested paths correctly by building an intermediate
  tree structure before rendering connectors
- `renderTree` clears `el` and appends a `<pre>` with the tree string
- `renderError` renders a styled div with the error message and source
- `renderLoading` renders a subtle spinner or "loading..." text
- No external dependencies — vanilla DOM only

## Do not
- Fetch data or call cache
- Write back to the vault