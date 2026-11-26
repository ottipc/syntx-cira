// jsdom defaults to 1024 × 768; the workspace requires ≥ 1280 × 720 (ViewportGuard, G03.10). DOM tests use 1920 × 1080.
// Browser tests run in the node environment (no window) and set their viewport through Chrome.
if (typeof window !== "undefined") {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1920 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 1080 });
}
