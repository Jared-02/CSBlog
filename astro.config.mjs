// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: process.env.SITE_URL || 'https://jared-02.github.io',
	base: process.env.BASE_PATH || '/CSBlog',
	integrations: [mdx(), sitemap(), pagefind({ indexConfig: { forceLanguage: 'zh-CN' } })],
	markdown: {
		remarkPlugins: [remarkMath],
		rehypePlugins: [rehypeKatex, [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]],
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'github-dark',
			},
		},
	},
});
