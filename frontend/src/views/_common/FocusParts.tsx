// Focus field parts shared by the views (architecture v2.0.3, 04.2): a focusable table row and its handle cell.
import type { HTMLAttributes, ReactNode } from "react";
import { FocusHandle, FocusMarks, IdText, useFocusItem } from "../../semiontics";

type DataAttrs = { [k: `data-${string}`]: string | undefined };

/** A table row that is a focusable item: `data-focus-id` + state; it is the positioned host of its frame elements. */
export function FocusTr({ id, children, ...rest }: { id: string; children: ReactNode } & HTMLAttributes<HTMLTableRowElement> & DataAttrs) {
  const f = useFocusItem(id);
  return <tr {...rest} {...f.attrs}>{children}</tr>;
}

/** Row header cell: the item's focus handle (its StableId) and the frame elements of the row. */
export function FocusIdCell({ id, children }: { id: string; children?: ReactNode }) {
  return <td><FocusMarks id={id} /><FocusHandle id={id}>{children ?? <IdText>{id}</IdText>}</FocusHandle></td>;
}

/** A box-shaped focusable item (card, list entry): host element with frames inside. */
export function FocusBox({ id, as: As = "div", className, children, ...rest }: { id: string; as?: "div" | "li" | "article"; className?: string;
  children: ReactNode } & DataAttrs) {
  const f = useFocusItem(id);
  return <As className={className} {...rest} {...f.attrs}><FocusMarks id={id} />{children}</As>;
}
