// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://linearly.space',
  trailingSlash: 'never',
  // One .html file per page, so Netlify serves /about at /about with no
  // trailing-slash redirect; canonical URLs and served URLs then agree.
  build: { format: 'file' },
  integrations: [mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      [
        rehypeKatex,
        {
          strict: false,
          macros: {
            '\\R': '\\mathbb{R}',
            '\\C': '\\mathbb{C}',
            '\\T': '^{\\mathsf{T}}',
            '\\norm': '\\lVert #1 \\rVert',
            '\\inner': '\\langle #1, #2 \\rangle',
            '\\rank': '\\operatorname{rank}',
            '\\vv': '\\mathbf{#1}',
          },
        },
      ],
    ],
    shikiConfig: {
      themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
      defaultColor: false,
    },
  },
  image: {
    responsiveStyles: true,
  },
});
