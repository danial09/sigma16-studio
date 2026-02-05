/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { env } from "node:process";
import { fileURLToPath, URL } from "node:url";

const host = env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: true,
    alias: {
      "monaco-editor": fileURLToPath(new URL("./src/test/mocks/monaco-editor.ts", import.meta.url)),
      "s16-wasm": fileURLToPath(new URL("./src/test/mocks/s16-wasm.ts", import.meta.url)),
      "golden-layout": fileURLToPath(new URL("./src/test/mocks/golden-layout.ts", import.meta.url)),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },

  envPrefix: ["VITE_", "TAURI_"],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // "s16-wasm": fileURLToPath(new URL("./lib/sigma16-compiler/s16-wasm/pkg/s16_wasm.js", import.meta.url)),
    },
  },

  build: {
    target: "es2020",
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },

  optimizeDeps: {
    exclude: ["s16-wasm"],
  },
});
