import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // @ts-expect-error Vitest extends Vite config at runtime.
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
