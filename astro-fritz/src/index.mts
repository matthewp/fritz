import type { AstroIntegration } from 'astro';

export default function(): AstroIntegration {
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
      }
    }
  };
}