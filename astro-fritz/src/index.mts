import type { AstroIntegration } from 'astro';
import { pluginFritz } from './vite-plugin.mjs';

export type Options = {
  tailwind?: boolean;
};

export default function(options?: Options): AstroIntegration {
  return {
    name: 'astro-fritz',
    hooks: {
      'astro:config:setup'({ addRenderer, updateConfig }) {
        addRenderer({
          name: 'astro-fritz',
          clientEntrypoint: 'astro-fritz/client',
          serverEntrypoint: 'astro-fritz/server',
          jsxImportSource: 'fritz',
          jsxTransformOptions: async () => {
            const {
              default: { default: jsx }
              // @ts-ignore
            } = await import('@babel/plugin-transform-react-jsx');
            return {
              plugins: [jsx({}, { runtime: 'automatic', importSource: 'fritz' })]
            }
          }
        });

        updateConfig({
          vite: {
            plugins: [pluginFritz({ tailwind: options?.tailwind || false })],
            optimizeDeps: {
              include: ['astro-fritz/client', ...(options?.tailwind ? ['astro-fritz/tailwind'] : [])]
            },
            worker: {
              format: 'es',
              rollupOptions: {
                output: {
                  manualChunks: {
                    fritz: ['fritz']
                  }
                }
              }
            }
          }
        });
      }
    }
  };
}