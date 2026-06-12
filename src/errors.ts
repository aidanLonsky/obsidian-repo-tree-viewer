export type ErrorSource = 'local' | 'github' | 'cache' | 'renderer';

export class RepoTreeError extends Error {
	constructor(
		message: string,
		public readonly source: ErrorSource,
		public readonly recoverable: boolean,
	) {
		super(message);
		this.name = 'RepoTreeError';
	}
}
