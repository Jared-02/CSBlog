# AGENTS.md

## Project Overview

Astro v5 static blog. Chinese-language content (competitive programming contest reviews). Deployed to GitHub Pages via GitHub Actions.

## Directory Layout

```
docs/                    # Blog content (markdown) — NOT src/content/
src/
  components/            # Astro components (Header, Footer, Sidebar, TOC, Search)
  layouts/BlogPost.astro # Blog post layout (3-column grid + client-side code block JS)
  pages/                 # File-based routing (index, about, blog/[...slug], rss.xml)
  plugins/               # Custom rehype plugins
  styles/global.css      # All styles, CSS variables, responsive breakpoints
  content.config.ts      # Content collection schema (loads from docs/)
  consts.ts              # SITE_TITLE, SITE_DESCRIPTION
astro.config.mjs         # Integrations, markdown pipeline, Shiki config
public/fonts/            # Atkinson font files
```

## Content System

- Content lives in **`docs/`**, not `src/content/`. Configured via `glob` loader in `content.config.ts`. Supports `.md` and `.mdx`.
- **Required frontmatter**: `title`, `description`, `pubDate`. **Optional**: `updatedDate`, `heroImage`, `tags`.

## Markdown Pipeline

Rendering chain in order:

1. **remark-math** — parses LaTeX math syntax
2. **Shiki** — syntax highlighting with dual themes (`github-light` / `github-dark`), outputs `<pre data-language="...">` elements
3. **rehype-katex** — renders math to KaTeX HTML
4. **rehype-external-links** — adds `target="_blank" rel="noopener noreferrer"` to external links
5. **rehype-code-group** (`src/plugins/rehype-code-group.mjs`) — groups consecutive code blocks into tabs (build-time AST transform)
6. **Client-side JS** (`BlogPost.astro` `<script>`) — wraps standalone `<pre>` in `.code-block` divs, adds copy buttons, enables tab switching for code groups

## Code Block Tab System

Consecutive fenced code blocks with **different** languages (no blank line between them) are automatically merged into a tabbed UI at build time.

**How it works:**
- `rehype-code-group.mjs` scans for adjacent `<pre>` elements, groups those with ≥2 different `data-language` values into a `.code-group` wrapper with `.code-tab-bar` and `.code-tab-panel` elements.
- Client JS in `BlogPost.astro` adds copy buttons and tab-switching event listeners.
- Standalone code blocks (not grouped) get wrapped in `.code-block` with a `.code-bar` (language label + copy button).

**Language map is duplicated** in both `rehype-code-group.mjs` and `BlogPost.astro`. Keep them in sync when adding new languages.

**Markdown example:**
````markdown
```py
print("hello")
```
```cpp
cout << "hello";
```
````
↑ No blank line between blocks — they will render as tabs.

## Styling

- All styles in `src/styles/global.css`. No CSS modules, no Tailwind.
- CSS variables use raw RGB values (e.g., `--gray: 96, 115, 159`) for alpha compositing via `rgb(var(--gray))`.
- Font stacks include Chinese fonts; code uses Cascadia Code / Fira Code / JetBrains Mono.
- Responsive breakpoints: `1024px` (sidebar collapse), `768px` (mobile). No dark mode (CSS is light-only).

## Deployment

- **Default target**: GitHub Pages at `https://jared-02.github.io/CSBlog`.
- **Environment variables** in `astro.config.mjs` compatibility with aliyun ESA Pages:
  - `SITE_URL` (default: `https://jared-02.github.io`)
  - `BASE_PATH` (default: `/CSBlog`)
- GitHub Actions workflow: `.github/workflows/deploy.yml` — triggers on push to `main`.

## Known Issues / Gotchas

1. **Content in `docs/`** — not the standard `src/content/` path. Handled by `glob` loader in `content.config.ts`.
2. **Search only works after build** — Pagefind index is generated at build time.
3. **RSS feed has hardcoded path** — `rss.xml.js` uses `/CSBlog/blog/` instead of `import.meta.env.BASE_URL`.
4. **Font paths in CSS** — `global.css` uses absolute `/fonts/...`, may break under non-default `BASE_PATH`.
5. **No 404 page** — `src/pages/404.astro` does not exist.
6. **`sharp` required** — image optimization depends on it; can be tricky to install on Windows.
