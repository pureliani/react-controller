import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import strip from '@rollup/plugin-strip'
import terser from '@rollup/plugin-terser'
import bundleSize from 'rollup-plugin-bundle-size'
import packageJSON from './package.json' assert { type: 'json' }
import { defineConfig } from 'rollup'

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJSON.main,
        format: 'cjs',
        sourcemap: true
      },
      {
        file: packageJSON.module,
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      strip(),
      terser(),
      resolve(),
      bundleSize()
    ],
    external: ['react', 'react-dom']
  }, 
  {
    input: 'dist/esm/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()]
  }
])
