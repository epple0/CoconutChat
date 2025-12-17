import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import url from "url";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "client", "src"),
      "@shared": path.resolve(dirname, "shared"),
      "@assets": path.resolve(dirname, "attached_assets"),
    },
  },
  root: path.resolve(dirname, "client"),
  build: {
    outDir: path.resolve(dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
