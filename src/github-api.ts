import { requestUrl } from 'obsidian';
import { RepoTreeError } from './errors';

const BASE = 'https://api.github.com';

function headers(token?: string): Record<string, string> {
	const h: Record<string, string> = { Accept: 'application/vnd.github+json' };
	if (token) h['Authorization'] = `Bearer ${token}`;
	return h;
}

async function resolveSha(
	owner: string,
	repo: string,
	ref: string,
	token?: string,
): Promise<string> {
	const url = `${BASE}/repos/${owner}/${repo}/commits/${ref}`;
	const res = await requestUrl({ url, headers: headers(token) });
	if (res.status === 404) {
		throw new RepoTreeError(`Repository or ref not found: ${owner}/${repo}@${ref}`, 'github', false);
	}
	if (res.status === 403 || res.status === 429) {
		throw new RepoTreeError(`GitHub API rate limit or auth failure (${res.status})`, 'github', true);
	}
	const sha: string = (res.json as { sha: string }).sha;
	return sha;
}

export async function fetchGithubTree(
	owner: string,
	repo: string,
	opts: { ref: string; token?: string },
): Promise<string[]> {
	const sha = await resolveSha(owner, repo, opts.ref, opts.token);
	const url = `${BASE}/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`;
	const res = await requestUrl({ url, headers: headers(opts.token) });

	if (res.status === 404) {
		throw new RepoTreeError(`Tree not found: ${owner}/${repo}@${sha}`, 'github', false);
	}
	if (res.status === 403 || res.status === 429) {
		throw new RepoTreeError(`GitHub API rate limit or auth failure (${res.status})`, 'github', true);
	}

	const body = res.json as { tree: { path: string; type: string }[] };
	return body.tree
		.filter((item) => item.type === 'blob')
		.map((item) => item.path);
}
