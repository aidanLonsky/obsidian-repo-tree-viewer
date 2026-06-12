import { RepoTreeCache } from '../src/cache';

function makeMockAdapter() {
	return {
		exists: jest.fn().mockResolvedValue(false),
		mkdir: jest.fn().mockResolvedValue(undefined),
		read: jest.fn().mockRejectedValue(new Error('not found')),
		write: jest.fn().mockResolvedValue(undefined),
		remove: jest.fn().mockResolvedValue(undefined),
		list: jest.fn().mockResolvedValue({ files: [], folders: [] }),
	};
}

const TTL = 60_000;

describe('RepoTreeCache', () => {
	it('returns null on cache miss (no adapter file)', async () => {
		const adapter = makeMockAdapter();
		const cache = new RepoTreeCache(adapter as never, TTL);
		expect(await cache.get('key')).toBeNull();
	});

	it('returns entry on memory hit after set', async () => {
		const adapter = makeMockAdapter();
		const cache = new RepoTreeCache(adapter as never, TTL);
		const entry = { paths: ['a.ts'], timestamp: Date.now(), source: 'local' as const };
		await cache.set('key', entry);
		expect(await cache.get('key')).toEqual(entry);
	});

	it('treats expired memory entries as a miss', async () => {
		const adapter = makeMockAdapter();
		// TTL of 1ms ensures any stored entry is immediately expired
		const cache = new RepoTreeCache(adapter as never, 1);
		const entry = { paths: ['a.ts'], timestamp: Date.now() - 1000, source: 'local' as const };
		// Bypass set() to plant an already-expired entry in memory
		(cache as unknown as { memory: Map<string, unknown> }).memory.set('key', entry);
		expect(await cache.get('key')).toBeNull();
	});

	it('falls back to adapter and returns fresh entry on memory miss', async () => {
		const adapter = makeMockAdapter();
		const entry = { paths: ['b.ts'], timestamp: Date.now(), source: 'github' as const };
		adapter.read.mockResolvedValue(JSON.stringify(entry));
		const cache = new RepoTreeCache(adapter as never, TTL);
		expect(await cache.get('key')).toEqual(entry);
	});

	it('treats corrupt adapter JSON as a miss without throwing', async () => {
		const adapter = makeMockAdapter();
		adapter.read.mockResolvedValue('not valid json {{{');
		const cache = new RepoTreeCache(adapter as never, TTL);
		await expect(cache.get('key')).resolves.toBeNull();
	});
});
