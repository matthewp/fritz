//import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';

export default {
  format: 'umd',
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true
    }),
    replace({
      'process.env.NODE_ENV': process.env.NODE_ENV === 'production'
    })
  ]
};
