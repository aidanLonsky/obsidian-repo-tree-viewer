import { fetchGithubTree } from '../src/github-api';
import { requestUrl } from 'obsidian';

const mockRequestUrl = requestUrl as jest.MockedFunction<typeof requestUrl>;

beforeEach(() => jest.clearAllMocks());

describe('fetchGithubTree', () => {
	it('returns flat blob path list on 200', async () => {
		mockRequestUrl
			.mockResolvedValueOnce({ status: 200, json: { sha: 'abc123' } } as never)
			.mockResolvedValueOnce({
				status: 200,
				json: {
					tree: [
						{ path: 'src/main.ts', type: 'blob' },
						{ path: 'src', type: 'tree' },
						{ path: 'README.md', type: 'blob' },
					],
				},
			} as never);

		const result = await fetchGithubTree('owner', 'repo', { ref: 'main' });
		expect(result).toEqual(['src/main.ts', 'README.md']);
	});

	it('throws recoverable RepoTreeError on 429', async () => {
		mockRequestUrl.mockResolvedValueOnce({ status: 429, json: {} } as never);
		await expect(fetchGithubTree('owner', 'repo', { ref: 'main' })).rejects.toMatchObject({
			source: 'github',
			recoverable: true,
		});
	});

	it('throws non-recoverable RepoTreeError on 404', async () => {
		mockRequestUrl.mockResolvedValueOnce({ status: 404, json: {} } as never);
		await expect(fetchGithubTree('owner', 'repo', { ref: 'main' })).rejects.toMatchObject({
			source: 'github',
			recoverable: false,
		});
	});
});
