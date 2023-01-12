import { defineConfig } from 'astro/config';
import fritz from 'astro-fritz';

export default defineConfig({
  integrations: [
    fritz()
  ]
});