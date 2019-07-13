import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import nodeResolve from 'rollup-plugin-node-resolve';
import { string } from 'rollup-plugin-string';
import json from 'rollup-plugin-json';
import sucrase from 'rollup-plugin-sucrase';

const nodeExternals = [
  'url', 'http', 'util', 'https', 'zlib', 'stream', 'path',
  'crypto', 'buffer', 'string_decoder', 'querystring', 'punycode',
  'child_process', 'events'
];

export default {
  worker: {
    input: 'src/app/app.js',
    output: {
      dir: 'public',
      format: 'iife'
    },
    plugins: [
      string({
        include: `**/*.css`
      }),
      json(),
      nodeResolve({}),
      sucrase({
        exclude: ['node_modules/**'],
        transforms: ['jsx'],
        jsxPragma: 'h',
        jsxFragmentPragma: 'Fragment'
      }),
      commonjs({})
    ]
  },

  window: {
    input: 'src/app/main.js',
    output: {
      dir: 'public',
      format: 'es',
      chunkFileNames: '[name].js'
    },
    plugins: [
      string({
        include: `**/*.css`
      }),
      json(),
      nodeResolve({}),
      commonjs({})
    ]
  },

  server: {
    input: 'build/temp/server.js',
    external: Array.from(nodeExternals),
    output: {
      file: 'build/routes.js',
      format: 'cjs'
    },
    plugins: [
      string({
        include: `**/*.css`
      }),
      json(),
      nodeResolve({}),
      sucrase({
        exclude: ['node_modules/**'],
        transforms: ['jsx'],
        jsxPragma: 'h',
        jsxFragmentPragma: 'Fragment'
      }),
      commonjs({}),
      globals()
    ]
  }
};

