/**
 * Rehype plugin to group consecutive code blocks with different languages
 * into a tabbed code group.
 *
 * In markdown, two or more consecutive fenced code blocks with different
 * language tags (no blank line between them) will be merged into a single
 * tabbed container at build time.
 */

/** @typedef {import('hast').Root} Root */
/** @typedef {import('hast').Element} Element */
/** @typedef {import('hast').RootContent} RootContent */

const langMap = {
	py: 'Python', python: 'Python',
	js: 'JavaScript', javascript: 'JavaScript',
	ts: 'TypeScript', typescript: 'TypeScript',
	jsx: 'JSX', tsx: 'TSX',
	html: 'HTML', css: 'CSS', scss: 'SCSS',
	json: 'JSON', yaml: 'YAML', yml: 'YAML',
	md: 'Markdown', mdx: 'MDX',
	sh: 'Shell', bash: 'Bash', zsh: 'Zsh',
	c: 'C', cpp: 'C++', 'c++': 'C++',
	java: 'Java', go: 'Go', rust: 'Rust', rs: 'Rust',
	rb: 'Ruby', ruby: 'Ruby', php: 'PHP',
	sql: 'SQL', graphql: 'GraphQL',
	xml: 'XML', svg: 'SVG',
	csharp: 'C#', cs: 'C#',
	swift: 'Swift', kotlin: 'Kotlin', kt: 'Kotlin',
	dart: 'Dart', lua: 'Lua', r: 'R',
	plaintext: 'Text', text: 'Text',
};

/**
 * @param {RootContent} node
 * @returns {node is Element}
 */
function isCodeBlock(node) {
	return node.type === 'element' && node.tagName === 'pre';
}

/** @param {RootContent} node */
function isWhitespaceText(node) {
	return node.type === 'text' && node.value.trim() === '';
}

/** @param {Element} pre */
function getLang(pre) {
	return String(pre.properties?.dataLanguage || '');
}

/** @param {string} raw */
function displayLang(raw) {
	return langMap[raw] ?? raw;
}

/**
 * Check if a group of code blocks should be merged:
 * they must have at least 2 blocks with different languages.
 * @param {Element[]} group
 */
function shouldGroup(group) {
	if (group.length < 2) return false;
	const langs = group.map(getLang);
	return new Set(langs).size > 1;
}

/**
 * Build the tabbed wrapper element.
 * @param {Element[]} group
 * @returns {Element}
 */
function buildTabGroup(group) {
	const tabs = group.map((pre, i) => {
		const raw = getLang(pre);
		const label = displayLang(raw);
		/** @type {Element} */
		const btn = {
			type: 'element',
			tagName: 'button',
			properties: {
				className: i === 0 ? ['code-tab', 'active'] : ['code-tab'],
				'data-tab-index': String(i),
				type: 'button',
			},
			children: [{ type: 'text', value: label || 'Code' }],
		};
		return btn;
	});

	const tabBar = {
		type: 'element',
		tagName: 'div',
		properties: { className: ['code-tab-bar'] },
		children: tabs,
	};

	const panels = group.map((pre, i) => {
		/** @type {Element} */
		const panel = {
			type: 'element',
			tagName: 'div',
			properties: {
				className: i === 0 ? ['code-tab-panel', 'active'] : ['code-tab-panel'],
				'data-panel-index': String(i),
			},
			children: [pre],
		};
		return panel;
	});

	const panelContainer = {
		type: 'element',
		tagName: 'div',
		properties: { className: ['code-tab-panels'] },
		children: panels,
	};

	/** @type {Element} */
	const wrapper = {
		type: 'element',
		tagName: 'div',
		properties: { className: ['code-group'] },
		children: [tabBar, panelContainer],
	};

	return wrapper;
}

/**
 * Process a parent node's children, grouping consecutive code blocks.
 * Iterates in reverse so splicing doesn't invalidate indices.
 * @param {{ children: RootContent[] }} parent
 */
function processChildren(parent) {
	const children = parent.children;
	let i = children.length - 1;

	while (i >= 0) {
		const node = children[i];

		// Recurse into element children
		if (node.type === 'element' && node.children) {
			processChildren(node);
		}

		if (!isCodeBlock(node)) {
			i--;
			continue;
		}

		// Found a code block; walk backwards to find the start of a
		// consecutive run, skipping whitespace-only text nodes.
		let start = i;
		let j = i - 1;
		while (j >= 0) {
			const prev = children[j];
			if (isCodeBlock(prev)) {
				start = j;
				j--;
			} else if (isWhitespaceText(prev)) {
				// peek further back
				j--;
			} else {
				break;
			}
		}

		// Collect only the <pre> nodes in [start..i]
		const group = [];
		for (let k = start; k <= i; k++) {
			if (isCodeBlock(children[k])) {
				group.push(children[k]);
			}
		}

		if (shouldGroup(group)) {
			const count = i - start + 1;
			const wrapper = buildTabGroup(group);
			children.splice(start, count, wrapper);
		}

		i = start - 1;
	}
}

/** @returns {(tree: Root) => void} */
export default function rehypeCodeGroup() {
	return (tree) => {
		processChildren(tree);
	};
}
