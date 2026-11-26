import { DeltaMark, EpistemicChip, IdText, SpaceCell } from "../../semiontics";
import type { CellVM } from "./model";

export function SpaceColumnCell({ c, space, focused }: { c: CellVM; space: "A" | "O" | "R"; focused: boolean }) {
  return (
    <SpaceCell sem={c.sem} space={space} value={c.value} term={c.term} termParams={c.params} focused={focused}
      sub={<>
        {c.epi ? <EpistemicChip cls={c.epi} /> : null}
        {c.source ? <IdText>{c.source}</IdText> : null}
        {c.delta ? <DeltaMark before={c.delta.before} after={c.delta.after} space={space} /> : null}
      </>} />
  );
}
