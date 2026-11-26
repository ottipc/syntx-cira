// Data rendered verbatim in monospace (INV-LANG-03).
export function IdText({ children, title }: { children: string; title?: string }) {
  return <span className="mono-id" title={title} data-datum="id">{children}</span>;
}
