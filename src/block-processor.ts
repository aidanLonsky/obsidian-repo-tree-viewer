import { App, MarkdownPostProcessorContext } from 'obsidian';
import { RepoTreeSettings } from './settings';
import { RepoTreeCache } from './cache';
import { RepoTreeError } from './errors';
import { buildLocalTree } from './tree-builder';
import { fetchGithubTree } from './github-api';
import { formatTree, renderError, renderLoading, renderTree } from './renderer';

export interface RepoTreePlugin {
	settings: RepoTreeSettings;
	app: App;
	_repoTreeCache?: RepoTreeCache;
	_lastRenderedTree?: string;
}

export interface BlockParams {
	path?: string;
	github?: string;
	ref: string;
	depth?: number;
}

export function parseSource(raw: string): BlockParams {
	const result: BlockParams = { ref: 'main' };
	for (const line of raw.split('\n')) {
		const m = line.match(/^(\w+)\s*:\s*(.+)$/);
		if (!m) continue;
		const key = m[1] ?? '';
		const v = (m[2] ?? '').trim();
		if (key === 'path') result.path = v;
		else if (key === 'github') result.github = v;
		else if (key === 'ref') result.ref = v;
		else if (key === 'depth') result.depth = parseInt(v, 10);
	}
	return result;
}

export function blockCacheKey(params: BlockParams): string {
	return params.github
		? `github:${params.github}@${params.ref}`
		: `local:${params.path ?? ''}`;
}

function getCache(plugin: RepoTreePlugin): RepoTreeCache {
	if (!plugin._repoTreeCache) {
		plugin._repoTreeCache = new RepoTreeCache(
			plugin.app.vault.adapter,
			plugin.settings.cacheTTLMinutes * 60 * 1000,
		);
	}
	return plugin._repoTreeCache;
}

async function fetchPaths(params: BlockParams, plugin: RepoTreePlugin): Promise<{ paths: string[]; source: 'local' | 'github' }> {
	const depth = params.depth ?? plugin.settings.maxDepth;
	if (params.github) {
		const parts = params.github.split('/');
		const owner = parts[0] ?? '';
		const repo = parts[1] ?? '';
		const paths = await fetchGithubTree(owner, repo, {
			ref: params.ref,
			token: plugin.settings.githubToken || undefined,
		});
		return { paths, source: 'github' };
	}
	const repoPath = params.path ?? '';
	const paths = await buildLocalTree(repoPath, {
		maxDepth: depth,
		respectGitignore: plugin.settings.respectGitignore,
	});
	return { paths, source: 'local' };
}

export async function processRepoTreeBlock(
	source: string,
	el: HTMLElement,
	_ctx: MarkdownPostProcessorContext,
	plugin: RepoTreePlugin,
): Promise<void> {
	const params = parseSource(source);

	if (params.path && params.github) {
		const err = new RepoTreeError(
			'`path` and `github` are mutually exclusive — use one or the other.',
			'renderer',
			false,
		);
		renderError(el, err);
		return;
	}

	if (!params.path && !params.github) {
		const defaultPath = plugin.settings.defaultRepoPath;
		if (defaultPath) {
			params.path = defaultPath;
		} else {
			const err = new RepoTreeError(
				'Specify `path` or `github` in the code block, or set a default repository path in settings.',
				'renderer',
				false,
			);
			renderError(el, err);
			return;
		}
	}

	const cacheKey = blockCacheKey(params);
	const cache = getCache(plugin);
	const cached = await cache.get(cacheKey);

	if (cached) {
		const tree = formatTree(cached.paths);
		plugin._lastRenderedTree = tree;
		renderTree(el, tree);
		return;
	}

	renderLoading(el);

	// Background refresh
	(async () => {
		try {
			const { paths, source: src } = await fetchPaths(params, plugin);
			const entry = { paths, timestamp: Date.now(), source: src };
			await cache.set(cacheKey, entry);
			const tree = formatTree(paths);
			plugin._lastRenderedTree = tree;
			renderTree(el, tree);
		} catch (err) {
			if (err instanceof RepoTreeError) {
				if (!err.recoverable) {
					renderError(el, err);
				}
				// recoverable: stale loading state stays — nothing better to show
			} else {
				renderError(
					el,
					new RepoTreeError(String(err), 'local', false),
				);
			}
		}
	})();
}
