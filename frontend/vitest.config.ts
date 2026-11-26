import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
    exclude: ["test/browser/**", "node_modules/**"],
    testTimeout: 30000,
    css: false,
    pool: "threads",
  },
});
