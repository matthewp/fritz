import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import string from 'rollup-plugin-string';

export default {
  format: 'umd',
  plugins: [
    string({
      include: 'src/**/*.css'
    }),
    babel({
      exclude: 'node_modules/**/*'
    }),
    nodeResolve({
      jsnext: true,
      main: true
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    replace({
      'process.env.NODE_ENV': process.env.NODE_ENV === 'production'
    })
  ]
};
