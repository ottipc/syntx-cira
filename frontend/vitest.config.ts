import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
    exclude: ["node_modules/**", "test/fixtures/**"],
    testTimeout: 30000,
    css: false,
    pool: "threads",
    setupFiles: ["test/setup.ts"],
  },
});
