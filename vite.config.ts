import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'; // oppure da 'vite' + import test config
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'Mandolin',
            formats: ['cjs', 'es'],
            fileName: (format) => `index.${format}.js`
        },
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
            external: ['fs', 'path', 'readline', '@virtual-registry/ts-utils']
        }
    },
    plugins: [
        dts({
            outDir: 'dist',
            insertTypesEntry: true
        })
    ],
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts']
    }
})
