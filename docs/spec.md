## Rendering pipeline
1. Code block processor fires on ```repo-tree blocks
2. Source resolved: local path → fs walk; github: param → API call
3. Cache checked (memory → vault adapter file)
4. Tree string formatted into ASCII tree syntax
5. Output injected as <pre> into the provided HTMLElement
6. Stale cache triggers background refresh, re-renders on completion

## Error states to handle explicitly
- Path doesn't exist or isn't a git repo
- GitHub API 404 / rate limit / auth failure
- Cache file corrupt (catch JSON.parse, fall through to live query)
- child_process unavailable (mobile) → fall through to GitHub path