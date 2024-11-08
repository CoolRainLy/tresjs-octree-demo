import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {templateCompilerOptions} from "@tresjs/core";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      ...templateCompilerOptions
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 8080
  }
})
