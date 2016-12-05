import babel from 'rollup-plugin-babel';

export default {
  format: 'iife',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
