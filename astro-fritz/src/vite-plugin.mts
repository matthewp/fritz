import type { Plugin as VitePlugin } from 'vite';

export default function pluginFritz(): VitePlugin {
  return {
    name: 'fritz:build',
    transform(code, id, opts) {
      if(id.endsWith('App.tsx') || id.endsWith('Another.tsx')) {
        // TODO only transform Fritz components.
        if(!opts?.ssr) {
          return `
import fritz from 'fritz/window';

const worker = new Worker(new URL('${id}?fritz-worker', import.meta.url), {
  type: 'module'
});

fritz.use(worker);
`.trim();
        }
      }
    }
  };
}