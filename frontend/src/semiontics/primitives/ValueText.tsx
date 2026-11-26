export function ValueText({ children }: { children: string }) {
  return <span className="mono-value" data-datum="value">{children}</span>;
}
