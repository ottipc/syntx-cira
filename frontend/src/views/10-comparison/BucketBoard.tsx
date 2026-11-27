import { useT } from "../../language";
import { FocusHandle, IdText, RuleDiamond } from "../../semiontics";
import { FocusBox } from "../_common";
import { type BucketVM, entryFocusId } from "./model";

export function BucketBoard({ bs }: { bs: BucketVM[] }) {
  const t = useT();
  return (
    <div className="grid-4">{bs.map((b) => (
      <div key={b.term} className="panel" data-bucket={b.term}>
        <h2 className="section-title"><RuleDiamond sem={b.sem} term={b.term} count={b.items.length} /> {t(b.term)}</h2>
        <ul className="stack">{b.items.map((i) => <FocusBox as="li" key={i} id={entryFocusId(i)}><FocusHandle id={entryFocusId(i)}><IdText>{i}</IdText></FocusHandle></FocusBox>)}</ul>
      </div>))}</div>
  );
}
