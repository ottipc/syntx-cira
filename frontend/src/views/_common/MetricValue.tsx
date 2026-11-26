import { RationalMetric, UndefinedSlot } from "../../semiontics";
import type { MetricVM } from "./model";

/** SEM-021 / SEM-022 for one server MetricResult; the decimal is the server's value (formatting only). */
export function MetricValue({ m }: { m: MetricVM }) {
  const r = m.result;
  if (r.status === "EVALUATED" && r.numerator && r.denominator && r.value !== null) {
    return <RationalMetric numerator={r.numerator} denominator={r.denominator} value={r.value} target={m.def?.target_value ?? null} />;
  }
  return <UndefinedSlot reason={r.undefined_reason ?? "INPUT_MISSING"} />;
}
