import { useT } from "../language";

/** Raw contract values appear only here (INV-LANG-04). */
export function TechnicalRecord({ raw }: { raw: unknown }) {
  const t = useT();
  return (
    <details className="technical" data-term="prov.technical">
      <summary>{t("prov.technical")}</summary>
      <pre className="raw" data-datum="raw">{JSON.stringify(raw, null, 1)}</pre>
    </details>
  );
}
