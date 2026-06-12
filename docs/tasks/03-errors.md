# Task 03 — Error types

## Goal
Define shared typed error classes consumed by all other layers.

## Acceptance criteria
- `src/errors.ts` exports:

\`\`\`ts
export type ErrorSource = 'local' | 'github' | 'cache' | 'renderer';

export class RepoTreeError extends Error {
  constructor(
    message: string,
    public readonly source: ErrorSource,
    public readonly recoverable: boolean
  ) { super(message); this.name = 'RepoTreeError'; }
}
\`\`\`

- Each layer throws `RepoTreeError` with appropriate `source` and
  `recoverable` values — never raw `Error` or untyped throws
- `recoverable: true` means the renderer should show stale cache
  instead of an error state; `false` means show error UI

## Do not
- Import from any other src/ module (this is a leaf dependency)