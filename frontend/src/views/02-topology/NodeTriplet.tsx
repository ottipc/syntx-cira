import { EXEMPT, FocusFrame, ResonanceMark, SEM, useFocusHandle, useFocusItem } from "../../semiontics";
import type { NodeBox } from "./layout";
import type { NodeVM } from "./model";

const KEYS = ["a", "o", "r"] as const;

/** One node: label + three separated slots (Ω_A, Ω_O, Ω_R). Geometry comes from layout() only (INV-STR-08). */
export function NodeTriplet({ box, vm, show, focused }: { box: NodeBox; vm: NodeVM | undefined; show: { a: boolean; o: boolean; r: boolean }; focused: boolean }) {
  const f = useFocusItem(box.id);
  const h = useFocusHandle(box.id);
  return (
    <g data-node={box.id} transform={`translate(${box.x} ${box.y})`} {...f.attrs} {...h}>
      <rect className={`node-box${vm?.outside ? " outside" : ""}${focused ? " focused" : ""}`} width={box.w} height={box.h}
        {...(focused ? { "data-sem": "SEM-034" } : {})} />
      <text className="node-label" x={box.labelAt.x} y={box.labelAt.y}>{box.id}</text>
      {KEYS.map((k) => {
        const s = vm?.[k];
        if (!s || !show[k]) return null;
        return (
          <g key={k} transform={`translate(${box.slots[k].x} ${box.slots[k].y})`} data-sem={s.sem} data-space={k.toUpperCase()}
            {...(EXEMPT.has(s.sem) ? { "data-attn": "exempt" } : {})}>
            <rect className={`slot-${k}`} width={box.slotBar.w} height={box.slotBar.h} />
            <text className="slot-text" x={box.textOffset.x} y={box.textOffset.y}>{s.value ?? SEM[s.sem].glyph ?? ""}</text>
          </g>
        );
      })}
      {vm?.differs ? <text className="slot-text" x={box.seamAt.x} y={box.seamAt.y} data-sem="SEM-035" data-attn="exempt">┆</text> : null}
      {vm && vm.gaps ? <text className="slot-text" x={box.gapAt.x} y={box.gapAt.y} data-sem="SEM-024" data-attn="exempt">◰</text> : null}
      {f.state === "focused" ? <FocusFrame shape="svg" w={box.w} h={box.h} /> : null}
      {f.state === "resonant" ? <ResonanceMark shape="svg" w={box.w} h={box.h} hostStroke={1} /> : null}
    </g>
  );
}
