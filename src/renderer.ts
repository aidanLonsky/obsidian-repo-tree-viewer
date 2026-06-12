import { RepoTreeError } from './errors';

interface TreeNode {
	children: Map<string, TreeNode>;
}

function buildTree(paths: string[]): Map<string, TreeNode> {
	const root = new Map<string, TreeNode>();
	for (const path of paths) {
		let current = root;
		for (const part of path.split('/')) {
			if (!part) continue;
			if (!current.has(part)) {
				current.set(part, { children: new Map() });
			}
			current = current.get(part)!.children;
		}
	}
	return root;
}

function renderNodes(map: Map<string, TreeNode>, prefix: string, lines: string[]): void {
	const entries = [...map.entries()].sort(([aName, aNode], [bName, bNode]) => {
		const aIsDir = aNode.children.size > 0;
		const bIsDir = bNode.children.size > 0;
		if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
		return aName.localeCompare(bName);
	});

	const last = entries.length - 1;
	entries.forEach(([name, node], i) => {
		const isLast = i === last;
		const isDir = node.children.size > 0;
		lines.push(`${prefix}${isLast ? '└── ' : '├── '}${name}${isDir ? '/' : ''}`);
		if (isDir) {
			renderNodes(node.children, prefix + (isLast ? '    ' : '│   '), lines);
		}
	});
}

export function formatTree(paths: string[]): string {
	if (paths.length === 0) return '(empty)';
	const lines: string[] = [];
	renderNodes(buildTree(paths), '', lines);
	return lines.join('\n');
}

export function renderTree(el: HTMLElement, tree: string): void {
	el.empty();
	const pre = el.createEl('pre');
	pre.addClass('repo-tree');
	pre.setText(tree);
}

export function renderError(el: HTMLElement, err: RepoTreeError): void {
	el.empty();
	const div = el.createEl('div');
	div.addClass('repo-tree-error');
	div.style.cssText = 'color: var(--text-error, #e05252); padding: 0.5em; border-left: 3px solid currentColor;';
	const label = el.doc.createElement('strong');
	label.textContent = `[repo-tree / ${err.source}] `;
	div.appendChild(label);
	div.appendChild(el.doc.createTextNode(err.message));
}

export function renderLoading(el: HTMLElement): void {
	el.empty();
	const div = el.createEl('div');
	div.addClass('repo-tree-loading');
	div.style.cssText = 'color: var(--text-muted); font-style: italic;';
	div.setText('Loading tree…');
}
