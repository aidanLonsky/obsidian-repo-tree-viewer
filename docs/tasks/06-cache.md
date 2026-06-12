# Task 06 — Caching layer

## Goal
Implement two-tier cache: in-memory Map for the session,
vault adapter for persistence across sessions.

## Acceptance criteria
- `src/cache.ts` exports:

\`\`\`ts
export interface CacheEntry {
  paths: string[];
  timestamp: number;
  source: 'local' | 'github';
}

export class RepoTreeCache {
  constructor(private adapter: DataAdapter, private ttlMs: number) {}
  async get(key: string): Promise<CacheEntry | null> {}
  async set(key: string, entry: CacheEntry): Promise<void> {}
  async invalidate(key: string): Promise<void> {}
}
\`\`\`

- Memory tier checked first; adapter tier checked on memory miss
- Adapter path: `.obsidian/plugins/repo-tree/cache/{key}.json`
  where key is base64url of the repo path or github slug
- On adapter read: catch JSON.parse errors, treat as cache miss,
  do not throw
- TTL checked on get: expired entries treated as miss but not
  proactively deleted (lazy eviction)
- `set` writes both memory and adapter tiers

## Do not
- Call the tree builders or GitHub API
- Reference plugin settings directly — accept TTL as constructor arg