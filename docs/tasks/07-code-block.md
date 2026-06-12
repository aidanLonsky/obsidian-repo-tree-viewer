# Task 07 — Code block processor

## Goal
Parse the code block content, resolve the source (local vs GitHub),
and orchestrate cache + fetcher calls.

## Acceptance criteria
- `src/block-processor.ts` exports:

\`\`\`ts
export async function processRepoTreeBlock(
  source: string,           // raw code block content
  el: HTMLElement,
  ctx: MarkdownPostProcessorContext,
  plugin: RepoTreePlugin
): Promise<void>
\`\`\`

- Parses `source` as line-delimited `key: value` pairs
- Supported keys: `path`, `github`, `ref` (default `main`), `depth`
- Resolution order:
  1. Check cache — render immediately if fresh
  2. If stale or miss: render stale cache (if any) then
     kick off background refresh
  3. Background refresh calls `buildLocalTree` or `fetchGithubTree`
     based on which key is present
  4. On fresh result: update cache, re-render element
- On `RepoTreeError` with `recoverable: false`: render error state
- `path` and `github` are mutually exclusive — show config error
  if both present

## Do not
- Format the tree string (call renderer for that)
- Implement caching logic directly (use RepoTreeCache)
- Register the processor (that is main.ts)