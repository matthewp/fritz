import type { Plugin as VitePlugin } from 'vite';

export function pluginFritz(): VitePlugin {
  return {
    name: 'fritz:build',
    transform(code, id, opts) {
      if(id.endsWith('App.tsx') || id.endsWith('Another.tsx')) {
        if(!opts?.ssr) {
          return `
import fritz from 'fritz/window';
import { Worker } from 'astro-fritz/client';

let worker = new Worker(new URL('${id}', import.meta.url), {
  type: 'module'
});

export default {
  url: worker.url
};
`.trim();
        }
      }
    }
  };
}