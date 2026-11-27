// ViewFrame (architecture v2.0.3, chapter 06, 05.17): the title row of a view (title, scope, origin, actions) and the
// view's composition class. `reserve`: the information space ends one gutter left of the emblem's left ring tangent
// while the fit holds; `plate`: full width on an opaque plot ground. The class is static per view; the fit state is
// set on Zone C by the stage function (N02) and never by data.
import type { ReactNode } from "react";
import { useT, type TermKey } from "../../language";

export type Composition = "reserve" | "plate";

export function ViewFrame({ id, title, composition, head, children }: { id: string; title: TermKey; composition: Composition; head?: ReactNode;
  children: ReactNode }) {
  const t = useT();
  return (
    <section aria-labelledby={id} data-composition={composition}>
      <div className="view-head"><h1 id={id} className="view-title">{t(title)}</h1>{head}</div>
      {children}
    </section>
  );
}
