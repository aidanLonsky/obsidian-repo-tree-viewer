import { App, PluginSettingTab, Setting } from 'obsidian';
import type ObsidianRepoTreePlugin from './main';

export interface RepoTreeSettings {
	defaultRepoPath: string;
	githubToken: string;
	cacheTTLMinutes: number;
	maxDepth: number;
	respectGitignore: boolean;
}

export const DEFAULT_SETTINGS: RepoTreeSettings = {
	defaultRepoPath: '',
	githubToken: '',
	cacheTTLMinutes: 5,
	maxDepth: 4,
	respectGitignore: true,
};

export class RepoTreeSettingsTab extends PluginSettingTab {
	plugin: ObsidianRepoTreePlugin;

	constructor(app: App, plugin: ObsidianRepoTreePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Default repository path')
			.setDesc('Absolute path to a local git repository.')
			.addText((text) =>
				text
					.setPlaceholder('/path/to/repo')
					.setValue(this.plugin.settings.defaultRepoPath)
					.onChange(async (value) => {
						this.plugin.settings.defaultRepoPath = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('GitHub token')
			.setDesc('Personal access token for GitHub API requests.')
			.addText((text) => {
				text.inputEl.type = 'password';
				text
					.setPlaceholder('ghp_...')
					.setValue(this.plugin.settings.githubToken)
					.onChange(async (value) => {
						this.plugin.settings.githubToken = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Cache TTL (minutes)')
			.setDesc('How long to keep cached tree results (1–60 minutes).')
			.addSlider((slider) =>
				slider
					.setLimits(1, 60, 1)
					.setValue(this.plugin.settings.cacheTTLMinutes)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.cacheTTLMinutes = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Max depth')
			.setDesc('Maximum directory depth to display (1–10).')
			.addSlider((slider) =>
				slider
					.setLimits(1, 10, 1)
					.setValue(this.plugin.settings.maxDepth)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.maxDepth = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Respect .gitignore')
			.setDesc('Exclude files listed in .gitignore from the tree.')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.respectGitignore)
					.onChange(async (value) => {
						this.plugin.settings.respectGitignore = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
