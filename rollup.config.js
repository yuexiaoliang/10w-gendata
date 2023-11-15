import esbuild from 'rollup-plugin-esbuild';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [{
  input: 'src/main.js',
  plugins: [commonjs(), nodeResolve(), esbuild()],
  output: {
    file: 'index.js',
    format: 'es'
  },
  external: [/node_modules/]
}]