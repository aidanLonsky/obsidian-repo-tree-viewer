jest.mock('../src/renderer', () => ({
	formatTree: jest.fn().mockReturnValue('mock-tree'),
	renderTree: jest.fn(),
	renderError: jest.fn(),
	renderLoading: jest.fn(),
}));

import { parseSource, processRepoTreeBlock, RepoTreePlugin } from '../src/block-processor';
import { renderError } from '../src/renderer';
import { RepoTreeCache } from '../src/cache';
import { MarkdownPostProcessorContext } from 'obsidian';

function makePlugin(): RepoTreePlugin {
	return {
		settings: {
			defaultRepoPath: '',
			githubToken: '',
			cacheTTLMinutes: 5,
			maxDepth: 4,
			respectGitignore: true,
		},
		app: { vault: { adapter: {} } } as never,
		_repoTreeCache: {
			get: jest.fn().mockResolvedValue(null),
			set: jest.fn().mockResolvedValue(undefined),
			invalidate: jest.fn().mockResolvedValue(undefined),
			clearAll: jest.fn().mockResolvedValue(undefined),
		} as unknown as RepoTreeCache,
	};
}

const el = {} as HTMLElement;
const ctx = {} as MarkdownPostProcessorContext;

describe('parseSource', () => {
	it('parses a path key', () => {
		expect(parseSource('path: /my/repo')).toMatchObject({ path: '/my/repo' });
	});

	it('parses github and ref keys', () => {
		expect(parseSource('github: owner/repo\nref: dev')).toMatchObject({
			github: 'owner/repo',
			ref: 'dev',
		});
	});

	it('defaults ref to main when not specified', () => {
		expect(parseSource('github: owner/repo').ref).toBe('main');
	});

	it('ignores unknown keys', () => {
		const result = parseSource('path: /repo\nunknown: value\nfoo: bar');
		expect(result).toMatchObject({ path: '/repo' });
		expect(result).not.toHaveProperty('unknown');
		expect(result).not.toHaveProperty('foo');
	});
});

describe('processRepoTreeBlock — mutual exclusion', () => {
	beforeEach(() => jest.clearAllMocks());

	it('calls renderError when both path and github are present', async () => {
		const plugin = makePlugin();
		await processRepoTreeBlock('path: /repo\ngithub: owner/repo', el, ctx, plugin);
		expect(renderError).toHaveBeenCalledWith(
			el,
			expect.objectContaining({ source: 'renderer', recoverable: false }),
		);
	});

	it('calls renderError when neither path nor github is set and no default', async () => {
		const plugin = makePlugin();
		await processRepoTreeBlock('', el, ctx, plugin);
		expect(renderError).toHaveBeenCalledWith(
			el,
			expect.objectContaining({ source: 'renderer', recoverable: false }),
		);
	});
});
