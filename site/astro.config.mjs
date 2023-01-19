import { defineConfig } from 'astro/config';
import fritz from 'astro-fritz';

export default defineConfig({
  base: '/fritz/',
  integrations: [
    fritz()
  ],
  markdown: {
    syntaxHighlight: 'prism'
  }
});