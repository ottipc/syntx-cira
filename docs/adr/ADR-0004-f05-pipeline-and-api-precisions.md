# ADR-0004 — Präzisierungen der F05-Pipeline, Bewertung und API (F2)

Status: ACCEPTED
Datum: 2026-11-26 · Phase 03 · Klasse F2 (ohne Semantikwirkung, E-07)

## Entscheidungen
1. **merge.policy engine_first/v1 (S-03).** Liefert der Adapter selbst ein zusammengeführtes Ergebnis
   (`capabilities.merge`), wird es unverändert übernommen (`engine_merged = true`, Konflikte ENGINE_RESOLVED).
   Sonst je Attribut: gleiche (Status, Wert) ⇒ Vorwärtseintrag; genau ein DETERMINED ⇒ dieser; beide DETERMINED mit
   verschiedenen Werten ⇒ UNDETERMINED (OPEN_REFERENCE, UNRESOLVED) plus MergeConflict UNDETERMINED. Relationen, Gaps und
   offene Relationen werden je Schlüssel vereinigt. Es wird kein Wert erfunden.
2. **Kein Bundle ⇒ kein SweepRun.** `SweepRun.input_bundle_ref` ist Pflicht. Ist für einen Sweep-Tick kein Bundle
   vorhanden (alle Profile erschöpft, CONTEXT_INCOMPLETE), steht die Blockade als StageEvent FORWARD/INVERSE BLOCKED mit
   ErrorRecord am Tick; ein SweepRun entsteht nicht.
3. **SweepRun-Endstatus** aus dem TerminationRecord (06.3): CONVERGED/ENGINE_REPORTED_STOP → COMPLETED,
   BUDGET_EXHAUSTED/TRUNCATED/CANCELLED → PARTIAL, ERROR → FAILED, ohne Ergebnis → BLOCKED.
4. **data_origin.** FIXTURE bei `is_fixture`, IMPORTED beim ImportExportAdapter, ENGINE bei realer Engine (DEP-02, hier nie).
   BLOCKED-SweepRuns der Stubs tragen SYNTHETIC: Sie sind ein Statusbeleg von CIRA, kein Engine-Ergebnis.
5. **Versuche und Revisionen.** Metriken M01/M05/M11/M07/M08 nutzen `attempt = 0` in der höchsten Revision (K-19, K-39).
   Ein Import für (t, a) schreibt eine neue Revision desselben logischen Schlüssels. Ein Re-Sweep erzeugt `attempt + 1`.
   Der Stabilitätslauf ist `attempt = 1` am Stabilitäts-Tick (K-44).
6. **Ω_O in F06.** F06 darf `observation` nicht importieren; ω wird in F06 nach derselben Regel K-09 aus dem Bundle
   bestimmt. Ein Test prüft die Gleichheit beider ω-Implementierungen.
7. **Kopplung F01 → F06** („über ReferenceState“, 05.1) ist in `coupling_matrix.json` ergänzt; `recovery_proposal` wird
   nach 05.3 von F06 und F07 gelesen (nicht F02). Die Entscheidung über einen Vorschlag läuft über die API (F07 → F02).
8. **Projektionslesungen (F07)** laufen mit der F07-Capability; ihr Zugriffsprotokoll liegt im Speicher des Stores und wird
   nicht in die Experimentindizes geschrieben, damit GET-Aufrufe Bundles und Replays nicht verändern (TX18 prüft beide).
9. **Projektionstypen** (Antworten der 21 Einträge, `ErrorResponse`) stehen in `contracts.f07` und damit im gebündelten
   Schema; sie sind keine Artefakte und berühren keine IDs (K-58).
10. **Vergleich (#19).** Unvergleichbare Paare ergeben HTTP 422 COMPARISON_INCOMPATIBLE mit den Gründen; es wird kein
    ComparisonReport geschrieben. Der Report liegt im Index des Recovery-Experiments (Schreiber F06).
11. **Export/Import (T10).** Der Import prüft Vertragsform, `bundle_hash`, Manifest, Schreiberfeld je Typ (L3) und die
    Inhaltsadresse jeder Revision; vorhandene `experiment_id` ⇒ 409. Export schreibt keine StageEvents (K-52).
12. **#21 recovery-variants** ist implementiert (O-19): AuthorityRecord (F02) und bei APPROVED eine RECOVERY-Variante
    (F03, `is_fixture = false`, `authority_ref`, Eingaben vom Menschen). Die Oberfläche zeigt den Dialog nur lesend (D-49).
