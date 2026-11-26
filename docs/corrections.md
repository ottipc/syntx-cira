# Korrekturregister der Implementierung (E-07)

Format: `| ID | Klasse | Zustand | Einheit | Befund | Korrektur | ADR |` — Klasse F1/F2/F3/F4 nach E-07.
F3-Befunde werden nicht selbst umgesetzt, sondern als Change Request in `docs/change-requests/` isoliert.

| ID | Klasse | Zustand | Einheit | Befund | Korrektur | ADR |
|---|---|---|---|---|---|---|
| IC-01 | F2 | CLOSED | contracts.f05 | `AdapterKind` lag in `contracts.f03`; `contracts.f05` hätte f03 importieren müssen (verboten nach 09.1) | `AdapterKind` nach `contracts.common` verschoben | ADR-0001 |
| IC-02 | F2 | CLOSED | contracts.registry | `ExperimentBundle` ohne `definitions` und `events` (08.9) | Felder ergänzt (`BundleDefinitions` mit ArtifactRefs, K-36) | ADR-0001 |
| IC-03 | F2 | CLOSED | contracts.f04_record | Feldname `register` überschattet ein Pydantic-Attribut | in `source_register` umbenannt | ADR-0001 |
| IC-04 | F2 | CLOSED | store / Felder | transitive Importprüfung: Feldmodule F03–F05 können `store` nicht importieren, ohne verbotene Vertragsmodule transitiv zu laden | Feldmodule rein; der Orchestrator persistiert über den FieldWriter des Feldes (K-48) | ADR-0002 |
| IC-05 | F2 | CLOSED | contracts.f05 | Operator-Lint (TX11) fand Vergleich auf `.sigma_id` im Validator | Prüfung über `core.unicode.is_nfc` ohne Attributvergleich | ADR-0001 |
| IC-06 | F2 | CLOSED | emulator / observation | Zeitbezug der Eingaben, Freigabe-Symbolik, ω-Kontext, Sichtbarkeit, Profile und Budgetverlauf nicht festgelegt | festgelegt | ADR-0003 |
| IC-07 | F2 | CLOSED | coupling_matrix | Kopplung F01 → F06 (05.1 „über ReferenceState“) fehlte; `recovery_proposal` las F02 statt F06/F07 (05.3) | an 05.1/05.3 angeglichen | ADR-0004 |
| IC-08 | F2 | CLOSED | syntx_adapter / experiments | Merge-Regel, SweepRun ohne Bundle, Endstatus, data_origin von Stubs, Versuche/Revisionen offen | festgelegt | ADR-0004 |
| IC-09 | F2 | CLOSED | contracts.f03 / f04_record | DeltaStateA / DeltaStateO (K-13, K-65) fehlten als Typen | ergänzt | ADR-0004 |
