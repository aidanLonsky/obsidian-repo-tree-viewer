# Task 05 — GitHub API client

## Goal
Fetch a repo's file tree from the GitHub Trees API.

## Acceptance criteria
- `src/github-api.ts` exports:

\`\`\`ts
export async function fetchGithubTree(
  owner: string,
  repo: string,
  opts: { ref: string; token?: string }
): Promise<string[]>   // flat list of relative paths, same shape as buildLocalTree
\`\`\`

- Endpoint: `GET /repos/{owner}/{repo}/git/trees/{sha}?recursive=1`
- Resolves SHA by first calling
  `GET /repos/{owner}/{repo}/commits/{ref}` 
- Uses `Authorization: Bearer {token}` header when token provided
- On 403/429: throws `RepoTreeError` with
  `source: 'github', recoverable: true`
- On 404: throws `RepoTreeError` with
  `source: 'github', recoverable: false`
- Uses `requestUrl` from `obsidian` package (not fetch/axios)
  to respect Obsidian's network layer

## Do not
- Format paths into tree syntax
- Touch the cache
- Fall back to local walk (the block processor handles fallback order)