// Inspection runs (architecture v2.0.3, 08.4/08.5/08.7): not part of `npm run verify`; started explicitly with
// `npm run inspect` (screenshot matrix) or `npm run inspect -- perf` and written to test-results/inspection/<run>/.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["test/inspection/**/*.inspect.ts"], testTimeout: 900000, hookTimeout: 300000, pool: "forks" },
});
