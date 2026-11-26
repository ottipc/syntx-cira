import { useT } from "../../language";
import { semAttrs } from "./_util";

/** SEM-022: undefined metric with its reason — never 0.00 or 0 %. */
export function UndefinedSlot({ reason }: { reason: string }) {
  const t = useT();
  const term = reason === "ZERO_DENOMINATOR" ? "msg.undefined.zero" : "msg.undefined.missing";
  return (
    <span className="undefined-slot" {...semAttrs("SEM-022", term)}>
      <span aria-hidden="true">∅</span> {t(term)}
    </span>
  );
}
