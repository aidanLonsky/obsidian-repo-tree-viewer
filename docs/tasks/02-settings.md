# Task 02 — Settings

## Goal
Define the settings schema and implement the settings tab UI.

## Acceptance criteria
- `src/settings.ts` exports:
  - `RepoTreeSettings` interface
  - `DEFAULT_SETTINGS` constant
  - `RepoTreeSettingsTab` class extending `PluginSettingTab`
- Settings fields:
  - `defaultRepoPath: string`     — text input
  - `githubToken: string`         — text input, type=password
  - `cacheTTLMinutes: number`     — slider, range 1–60, default 5
  - `maxDepth: number`            — slider, range 1–10, default 4
  - `respectGitignore: boolean`   — toggle, default true
- Settings persisted via `this.plugin.loadData()` / `saveData()`
- Settings tab registered in main.ts `onload()`

## Do not
- Add any tree-building or cache logic here
- Read from the filesystem here