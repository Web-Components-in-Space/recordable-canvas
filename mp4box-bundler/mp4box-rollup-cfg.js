import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: './mp4box-bundler/mp4box.js',
    output: {
      dir: './',
      format: 'es',
    },
    plugins: [commonjs(), nodeResolve()],
  }
]