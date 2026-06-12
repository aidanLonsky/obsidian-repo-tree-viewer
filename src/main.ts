import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, RepoTreeSettings, RepoTreeSettingsTab } from './settings';
import { RepoTreeCache } from './cache';
import { processRepoTreeBlock } from './block-processor';
import { registerCommands } from './commands';

export default class ObsidianRepoTreePlugin extends Plugin {
	settings!: RepoTreeSettings;
	_repoTreeCache!: RepoTreeCache;
	_lastRenderedTree?: string;

	async onload() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<RepoTreeSettings>,
		);

		this._repoTreeCache = new RepoTreeCache(
			this.app.vault.adapter,
			this.settings.cacheTTLMinutes * 60 * 1000,
		);

		this.registerMarkdownCodeBlockProcessor('repo-tree', (source, el, ctx) => {
			void processRepoTreeBlock(source, el, ctx, this);
		});

		this.addSettingTab(new RepoTreeSettingsTab(this.app, this));
		registerCommands(this);
	}

	onunload() {
		// Obsidian automatically cleans up all listeners, DOM events, and intervals
		// registered via this.register*, so no explicit teardown is needed here.
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
