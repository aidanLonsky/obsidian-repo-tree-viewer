import { MarkdownView, Notice, Plugin } from 'obsidian';
import { RepoTreePlugin, parseSource, blockCacheKey } from './block-processor';

async function refreshCurrentNote(plugin: Plugin & RepoTreePlugin): Promise<void> {
	const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
	if (!view?.file) return;

	const cache = plugin._repoTreeCache;
	if (cache) {
		const content = await plugin.app.vault.read(view.file);
		const blockRegex = /```repo-tree\n([\s\S]*?)```/g;
		let m: RegExpExecArray | null;
		while ((m = blockRegex.exec(content)) !== null) {
			const params = parseSource(m[1] ?? '');
			await cache.invalidate(blockCacheKey(params));
		}
	}

	await view.leaf.openFile(view.file);
}

export function registerCommands(plugin: Plugin & RepoTreePlugin): void {
	plugin.addCommand({
		id: 'repo-tree-refresh-note',
		name: 'Refresh current note',
		checkCallback: (checking) => {
			const hasFile = !!plugin.app.workspace.getActiveViewOfType(MarkdownView)?.file;
			if (!hasFile) return false;
			if (!checking) void refreshCurrentNote(plugin);
			return true;
		},
	});

	plugin.addCommand({
		id: 'repo-tree-clear-cache',
		name: 'Clear all cache',
		callback: () => {
			void (async () => {
				if (plugin._repoTreeCache) {
					await plugin._repoTreeCache.clearAll();
				}
				new Notice('Repo Tree: cache cleared.');
			})();
		},
	});

	plugin.addCommand({
		id: 'repo-tree-copy-tree',
		name: 'Copy tree to clipboard',
		checkCallback: (checking) => {
			const hasFile = !!plugin.app.workspace.getActiveViewOfType(MarkdownView)?.file;
			const hasTree = !!plugin._lastRenderedTree;
			if (!hasFile || !hasTree) return false;
			if (!checking) {
				void navigator.clipboard.writeText(plugin._lastRenderedTree!);
				new Notice('Repo Tree: tree copied to clipboard.');
			}
			return true;
		},
	});

	plugin.addRibbonIcon('git-branch', 'Repo Tree: Refresh current note', () => {
		void refreshCurrentNote(plugin);
	});
}
