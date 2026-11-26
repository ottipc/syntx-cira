import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The app talks only to its own API (INV-FUN-08). Base URL via VITE_CIRA_API (default http://127.0.0.1:8000).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { outDir: "dist", sourcemap: false, chunkSizeWarningLimit: 2000 },
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
});
