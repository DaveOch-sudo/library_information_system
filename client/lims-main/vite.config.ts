import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    base: "/", // ← explicit absolute paths in built index.html

    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },

    build: {
      outDir: "dist", // ← explicit (matches your pom.xml which reads dist/)
      emptyOutDir: true, // ← clean old build before each new one
    },

    server: {
      hmr: process.env.DISABLE_HMR !== "true",
      proxy: {
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
