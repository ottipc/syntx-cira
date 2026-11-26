// jsdom defaults to 1024 × 768; the workspace requires ≥ 1280 × 720 (ViewportGuard, G03.10). DOM tests use 1920 × 1080.
Object.defineProperty(window, "innerWidth", { configurable: true, value: 1920 });
Object.defineProperty(window, "innerHeight", { configurable: true, value: 1080 });
