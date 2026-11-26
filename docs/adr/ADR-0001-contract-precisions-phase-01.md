# ADR-0001 — Vertragspräzisionen in Phase 01 (F2)

Status: ACCEPTED
Datum: 2026-11-26 · Phase 01 · Klasse F2 (Vertragslücke ohne Semantikwirkung, E-07)

## Kontext
Bei der Umsetzung der 27 Vertragstypen nach Kap. 08 traten Lücken auf, die weder Feldrelationen noch
Zustandsraumgrenzen, Metrikbedeutungen oder REF-Aussagen berühren.

## Entscheidung
1. `AdapterKind` liegt in `contracts.common` (vorher f03). Grund: 09.1 verbietet `contracts.f05 → contracts.f03`.
2. `ExperimentBundle` trägt `definitions` (ArtifactRefs, K-36) und `events` wie in 08.9.
3. `ObservationProjectionBody.register` heißt `source_register` (Namenskollision mit Pydantic).
4. NFC-Prüfungen in `contracts.f05` laufen über `core.unicode.is_nfc` statt über einen Attributvergleich (TX11).
5. `MetricResult` im Zustand UNDEFINED mit ZERO_DENOMINATOR trägt Zähler und Nenner (0/1) mit, damit die
   Einheitsform (K-15) auch im undefinierten Fall sichtbar bleibt.

## Folgen
Keine Semantikwirkung. Schemas regeneriert (`make sync`), T02/TX14/TX17 grün.
