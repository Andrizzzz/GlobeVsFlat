import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({

  base: "/",

  plugins: [
    react(),
  ],

  root: path.resolve(__dirname, "client"),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },

  define: {
    CESIUM_BASE_URL: JSON.stringify("/cesium"),
  },

  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },

});
