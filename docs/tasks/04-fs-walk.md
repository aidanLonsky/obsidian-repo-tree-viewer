# Task 04 — Local filesystem tree builder

## Goal
Implement local directory traversal returning a raw file path list.

## Acceptance criteria
- `src/tree-builder.ts` exports:

\`\`\`ts
export async function buildLocalTree(
  repoPath: string,
  opts: { maxDepth: number; respectGitignore: boolean }
): Promise<string[]>   // flat list of relative paths, not yet formatted
\`\`\`

- Primary strategy: `git ls-files` via `child_process.execSync`
  with `cwd: repoPath` — respects .gitignore automatically
- Fallback strategy: recursive `fs.readdirSync` walk when
  `child_process` is unavailable (mobile) or path is not a git repo
- Fallback manually filters common ignore patterns:
  `node_modules`, `.git`, `dist`, `build`
- Detects mobile by catching the require('child_process') error,
  not by platform sniffing
- Throws `RepoTreeError` with `source: 'local'` on failure

## Do not
- Format the paths into tree syntax (that is task 08)
- Touch the cache (that is task 06)
- Call any Obsidian API