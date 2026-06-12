# Task 11 — Tests

## Goal
Cover the units most likely to break silently.

## Acceptance criteria
- Test runner: Jest (already in base repo)
- Tests live in `tests/` mirroring `src/` structure
- Required coverage:
  - `renderer.formatTree`: at least 4 cases — empty, flat,
    nested, deeply nested (verifies connector characters)
  - `cache`: get miss, get hit, get expired, set then get,
    corrupt adapter JSON handled gracefully
  - `block-processor`: parsing of valid blocks, mutual exclusion
    of path+github, unknown keys ignored
  - `github-api`: mock requestUrl — 200 happy path, 404, 429
- Obsidian API mocked via `__mocks__/obsidian.ts`
- `npm test` passes cleanly

## Do not
- Test the Obsidian settings tab UI (not worth the mock complexity)
- Integration test the full render pipeline