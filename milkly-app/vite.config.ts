import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  resolve: {
    dedupe: ["react", "react-dom", "zustand"],
    alias: {
      "@": resolve(__dirname, "./src"),
      "@mklyml/editor": resolve(__dirname, "../../workspace/milkly-mklyml/mkly-editor/src"),
      "@mklyml/core": resolve(__dirname, "../../workspace/milkly-mklyml/mkly/src"),
      "@mklyml/kits/newsletter": resolve(__dirname, "../../workspace/milkly-mklyml/mkly-kits/newsletter/src/index.ts"),
      "@mklyml/plugins/email": resolve(__dirname, "../../workspace/milkly-mklyml/mkly-plugins/email/src/index.ts"),
      "@mkly": resolve(__dirname, "../../workspace/milkly-mklyml/mkly/src"),
      "@mkly-kits": resolve(__dirname, "../../workspace/milkly-mklyml/mkly-kits"),
    },
  },
});
