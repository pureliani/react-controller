import resolve from "@rollup/plugin-node-resolve"
import commongjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"
import dts from "rollup-plugin-dts"
import strip from '@rollup/plugin-strip';
import packageJSON from './package.json' assert { type: "json" }


export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: packageJSON.main,
                format: "cjs",
                sourcemap: true
            },
            {
                file: packageJSON.module,
                format: "esm",
                sourcemap: true
            }
        ],
        plugins: [
            resolve(),
            commongjs(),
            typescript({ tsconfig: "./tsconfig.json" }),
            strip()
        ],
        external: ['react', 'react-dom']
    }, 
    {
        input: 'dist/esm/types/index.d.ts',
        output: [{ file: 'dist/index.d.ts', format: 'esm' }],
        plugins: [dts()]
    }
]