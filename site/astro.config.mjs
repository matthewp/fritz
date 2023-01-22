import { defineConfig } from 'astro/config';
import fritz from 'astro-fritz';
import rehypeHighlight from 'rehype-highlight';

export default defineConfig({
  base: '/fritz/',
  integrations: [
    fritz()
  ],
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [rehypeHighlight]
  }
});