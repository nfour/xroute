import { defineConfig } from 'vite'
import reactPlugin from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    reactPlugin({
      jsxImportSource: '@emotion/react',
      include: ['**/*.tsx', '**/*.ts'],
    }),
  ],
})
