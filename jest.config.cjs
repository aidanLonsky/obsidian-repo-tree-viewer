/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['<rootDir>/tests/**/*.test.ts'],
	moduleNameMapper: {
		'^obsidian$': '<rootDir>/__mocks__/obsidian.ts',
	},
	transform: {
		'^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
	},
};
