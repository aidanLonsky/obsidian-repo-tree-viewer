import { DataAdapter } from 'obsidian';
import { RepoTreeError } from './errors';

export interface CacheEntry {
	paths: string[];
	timestamp: number;
	source: 'local' | 'github';
}

const CACHE_DIR = '.obsidian/plugins/repo-tree/cache';

function toKey(raw: string): string {
	return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export class RepoTreeCache {
	private memory = new Map<string, CacheEntry>();

	constructor(
		private adapter: DataAdapter,
		private ttlMs: number,
	) {}

	async get(key: string): Promise<CacheEntry | null> {
		const now = Date.now();

		const mem = this.memory.get(key);
		if (mem) {
			if (now - mem.timestamp < this.ttlMs) return mem;
			// expired — lazy eviction, fall through
		}

		const filePath = `${CACHE_DIR}/${toKey(key)}.json`;
		try {
			const raw = await this.adapter.read(filePath);
			const entry = JSON.parse(raw) as CacheEntry;
			if (now - entry.timestamp < this.ttlMs) {
				this.memory.set(key, entry);
				return entry;
			}
		} catch {
			// file missing, unreadable, or corrupt JSON — treat as miss
		}

		return null;
	}

	async set(key: string, entry: CacheEntry): Promise<void> {
		this.memory.set(key, entry);

		const filePath = `${CACHE_DIR}/${toKey(key)}.json`;
		try {
			const dir = CACHE_DIR;
			if (!(await this.adapter.exists(dir))) {
				await this.adapter.mkdir(dir);
			}
			await this.adapter.write(filePath, JSON.stringify(entry));
		} catch (err) {
			throw new RepoTreeError(
				`Failed to write cache: ${String(err)}`,
				'cache',
				true,
			);
		}
	}

	async invalidate(key: string): Promise<void> {
		this.memory.delete(key);

		const filePath = `${CACHE_DIR}/${toKey(key)}.json`;
		try {
			if (await this.adapter.exists(filePath)) {
				await this.adapter.remove(filePath);
			}
		} catch {
			// best-effort
		}
	}

	async clearAll(): Promise<void> {
		this.memory.clear();
		try {
			const listing = await this.adapter.list(CACHE_DIR);
			await Promise.all(listing.files.map((f) => this.adapter.remove(f)));
		} catch {
			// directory may not exist yet — nothing to clear
		}
	}
}
