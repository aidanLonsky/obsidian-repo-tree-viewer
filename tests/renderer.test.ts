import { formatTree } from '../src/renderer';

describe('formatTree', () => {
	it('returns (empty) for an empty path list', () => {
		expect(formatTree([])).toBe('(empty)');
	});

	it('flat list uses ├── and └── connectors', () => {
		const result = formatTree(['a.ts', 'b.ts', 'c.ts']);
		expect(result).toBe('├── a.ts\n├── b.ts\n└── c.ts');
	});

	it('nested paths group under directory with │ continuation', () => {
		const result = formatTree(['src/a.ts', 'src/b.ts', 'README.md']);
		// dirs sorted before files at root level
		expect(result).toContain('├── src/');
		expect(result).toContain('│   ├── a.ts');
		expect(result).toContain('│   └── b.ts');
		expect(result).toContain('└── README.md');
	});

	it('deeply nested paths carry │ bars through all ancestor levels', () => {
		// a/b/c.ts, a/b/d.ts, a/e.ts
		// └── a/
		//     ├── b/
		//     │   ├── c.ts
		//     │   └── d.ts
		//     └── e.ts
		const result = formatTree(['a/b/c.ts', 'a/b/d.ts', 'a/e.ts']);
		expect(result).toContain('└── a/');
		expect(result).toContain('    ├── b/');
		expect(result).toContain('    │   ├── c.ts');
		expect(result).toContain('    │   └── d.ts');
		expect(result).toContain('    └── e.ts');
	});
});
