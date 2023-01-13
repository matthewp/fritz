import type { Plugin as VitePlugin } from 'vite';

export function pluginFritz(): VitePlugin {
  return {
    name: 'fritz:build',
    transform(_code, id, opts) {
      if(/\.(t|j)sx$/.test(id)) {
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