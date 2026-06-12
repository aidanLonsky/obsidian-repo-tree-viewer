import { RepoTreeError } from './errors';

const FALLBACK_IGNORE = new Set(['node_modules', '.git', 'dist', 'build']);

function walkDir(dir: string, base: string, depth: number, maxDepth: number): string[] {
	if (depth > maxDepth) return [];
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const fs = require('fs') as typeof import('fs');
	let entries: import('fs').Dirent[];
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return [];
	}
	const paths: string[] = [];
	for (const entry of entries) {
		if (FALLBACK_IGNORE.has(entry.name)) continue;
		const rel = base ? `${base}/${entry.name}` : entry.name;
		if (entry.isDirectory()) {
			paths.push(...walkDir(`${dir}/${entry.name}`, rel, depth + 1, maxDepth));
		} else {
			paths.push(rel);
		}
	}
	return paths;
}

export async function buildLocalTree(
	repoPath: string,
	opts: { maxDepth: number; respectGitignore: boolean },
): Promise<string[]> {
	// Primary: git ls-files (respects .gitignore automatically)
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const { execSync } = require('child_process') as typeof import('child_process');
		const output = execSync('git ls-files', { cwd: repoPath, encoding: 'utf8' });
		const paths = output.split('\n').filter(Boolean);
		if (opts.maxDepth < 10) {
			return paths.filter((p) => p.split('/').length <= opts.maxDepth);
		}
		return paths;
	} catch (primary) {
		// child_process unavailable (mobile) or not a git repo → fallback
		try {
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const fs = require('fs') as typeof import('fs');
			if (!fs.existsSync(repoPath)) {
				throw new RepoTreeError(
					`Path does not exist: ${repoPath}`,
					'local',
					false,
				);
			}
			return walkDir(repoPath, '', 1, opts.maxDepth);
		} catch (err) {
			if (err instanceof RepoTreeError) throw err;
			throw new RepoTreeError(
				`Failed to read directory: ${repoPath}`,
				'local',
				false,
			);
		}
	}
}
