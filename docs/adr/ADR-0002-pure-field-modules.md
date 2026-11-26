# ADR-0002 — Reine Feldmodule, Persistenz im Auftrag durch den Orchestrator (F2)

Status: ACCEPTED
Datum: 2026-11-26 · Phase 01 · Klasse F2

## Kontext
09.1 erlaubt `emulator`, `observation` und `syntx_adapter` den Import von `store`. Der Store kennt über
`contracts.registry` alle 27 Typen. Die Importregeln werden transitiv geprüft (strengste Lesart von L2).
Ein Import von `store` aus diesen Feldern würde `contracts.f05` bzw. `contracts.f03` transitiv laden und damit
genau die Grenzen verletzen, die T04b und TX03 sichern.

## Entscheidung
F03, F04 und F05 sind reine Funktionen über Vertragsobjekten. Sie importieren `store` nicht.
Der Orchestrator (`app.experiments`, Kompositionswurzel) liest und schreibt **im Auftrag** des jeweiligen Feldes
über `FieldReader`/`FieldWriter` mit dessen Capability (K-48). Die Capability-Prüfung (L3) und das Zugriffsprotokoll
(TX18) bleiben unverändert wirksam. Die Importregeln in `contracts/coupling_matrix.json` verbieten `app.store` für diese
drei Felder ausdrücklich.

## Folgen
Strengere Grenze als die Mindestforderung; keine Änderung an Kopplung, Zugriffsmatrix oder Zustandsraumtrennung.
