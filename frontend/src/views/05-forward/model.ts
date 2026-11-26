// View 05 ViewModel: forward run only — no target-guided or merged values (GF-21).
import type { BlockForwardResult } from "../../contracts/generated/cira";

export function forwardOf(b: BlockForwardResult | null) {
  return b?.availability === "AVAILABLE" && b.content ? { run: b.content.sweep, out: b.content.output, origin: b.origin ?? "SYNTHETIC" } : null;
}
