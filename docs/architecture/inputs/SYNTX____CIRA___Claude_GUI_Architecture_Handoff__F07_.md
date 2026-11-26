# SYNTX :: CIRA — Claude GUI Architecture Handoff (F07)

| Metadatum | Wert |
| :--- | :--- |
| Artefakt | `SYNTX_CIRA_GUI_Claude_Architecture_Handoff.md` |
| Zielmodell | Claude (Architektonische Rekonstruktion & spätere Überführung in Softwarearchitektur) |
| Zielsystemfeld | `F07_INTERFACE` (inkl. Projektionsschnittstelle zu `api/projections` und `contracts.f07`) |
| Status | `READY FOR CLAUDE ARCHITECTURAL RECONSTRUCTION` |
| Execution Boundary | `ARCHITECTURE ONLY — NO CODE — NO IMPLEMENTATION RELEASE` |
| Freigabestatus | Keine Implementierungsfreigabe enthalten; Programmierung beginnt erst nach separater Freigabe (`E-03`) |

---

## 00 — Übergabevertrag und Einordnung in CIRA v1.0.1

Dieses Dokument definiert die verbindliche Übergabestruktur, anhand derer Claude die systemische und semiontische GUI-Referenzarchitektur eigenständig rekonstruieren, mit dem konsolidierten CIRA-Architekturpaket v1.0.1 abgleichen und nach separater Implementierungsfreigabe in eine implementierungsoptimierte Frontend-Softwarearchitektur (Phase 04) sowie die vorgelagerten Projektionsverträge (Phase 01/03) überführen kann.

### Verbindliche Lesereihenfolge für die Rekonstruktion
1. `SYNTX_CIRA_Consolidated_Architecture_Package_v1.0.1.md` (führende System-, Vertrags- und Phasen-SSOT)
2. `SYNTX_CIRA_GUI_Dual_Deep_Sweep_Report.md` (Vorwärts-/Invers-Analyse, `GUI-GAP-01` bis `GUI-GAP-14`, `E-07`-Klassifikation)
3. `SYNTX_CIRA_Systemic_Semiontic_GUI_Reference_Architecture_v1.0.0.md` (Formensprache, Tokens, Semiontisches Register `SEM-001`–`SEM-030`, F07-Feldarchitektur, alle 11 Sichten + Wireframes)
4. Dieses Dokument (`SYNTX_CIRA_GUI_Claude_Architecture_Handoff.md`)

---

## 01 — Rekonstruktionsprotokoll für Claude (Architektur → Softwarearchitektur)

Bei der Überführung in die Implementierungsarchitektur muss Claude exakt folgende fünf Schritte ohne Abweichung von `P01`–`P13` und `E-01`–`E-19` ausführen:

1. **Vertrags- und Projektionsabgleich (Phase 01 / Phase 03):**
   - Übernehme die in `GUI-GAP-01` und `GUI-GAP-04` bis `GUI-GAP-08` identifizierten additiven Projektionsfelder (`F2`-Präzisierungen) in `backend/app/contracts/f07.py` bzw. `contracts.f04_record` / `contracts.f06` und dokumentiere sie über eine kleine ADR (`E-07`).
   - Stelle sicher, dass `make sync` alle Änderungen aus Pydantic über `contracts/schemas/cira.contracts.schema.json` nach `frontend/src/contracts/generated/` spiegelt (`TX02`). Keine manuell gepflegten Doppeltypen (`P12`, `E-10`).
2. **Design-Token- und Semiontik-Schicht (Phase 04 — Basis):**
   - Überführe alle Design Tokens aus Referenzarchitektur `01.1`–`01.9` in eine einzige zentrale Token-Quelle (Tailwind-Konfiguration / CSS-Variablen) und binde jede der 30 Register-Identitäten (`SEM-001`–`SEM-030`) an dedizierte, typsichere Präsentationskomponenten in `frontend/src/components/`.
3. **Session-, Header-Guard- und Provenienz-Schicht (Phase 04 — Kern):**
   - Implementiere `frontend/src/state/` strikt URL-getrieben (`react-router`, `D-20`) mit den Query-Parametern `tick`, `attempt`, `comparisonId`, `aggregation`, `toTick`, `focus`.
   - Implementiere den `ProjectionHeaderGuard` zentral im API-/Query-Layer (`TanStack Query`), sodass jede Antwort vor dem Rendering auf Übereinstimmung von `(experiment_id, tick)` geprüft wird. Bei Abweichung erzwingt der Guard sofort `VIEW_DATA_UNAVAILABLE` (`GUI-GAP-13`, `T09`).
4. **Sichten-Realisierung (Phase 04 — 11 Module + Globaler Export):**
   - Implementiere exakt 11 dedizierte View-Module unter `frontend/src/views/` (gemäß `ViewId`-Enum in `08.8`), die den textuellen Wireframes und Raumarchitekturen aus Kapitel 04 der GUI-Referenzarchitektur entsprechen.
   - Binde Sicht 2 (`TOPOLOGY_GRAPH`) an `elkjs` mit deterministischer Knoten-/Kantensortierung nach `StableId` (`D-31`), sodass identische Topologien zu identischen SVG-Koordinaten führen.
5. **Snapshot- und Browser-Verifikation (Phase 04 / Phase 05):**
   - Teste alle 11 Sichten ausschließlich gegen echte Backend-Integrations-Snapshots (`frontend/test/snapshots/`, `X-22`, `TX15`, `TX19`) und führe in Phase 05 den Headless-Browser-Durchlauf (`TX20`, `AK-16b`) gegen das laufende Backend aus (bzw. protokolliere `DEP-07`).

### Abbildung auf den CIRA-Repository-Baum (Kap. 09)

| Zielpfad (`frontend/`) | Architektonische Verantwortung | Gebundene Vorgaben |
| :--- | :--- | :--- |
| `src/contracts/generated/` | Generierte TypeScript-Typen aus gebündeltem JSON Schema | `TX02`, `P12`, `E-10` |
| `src/api/` | Typisierter HTTP-Client für die 21 API-Einträge + `ProjectionHeaderGuard` | `T09`, `GUI-GAP-13` |
| `src/state/` | URL-Session-Adapter (`ExperimentSession`), `ViewState`-Steuerung, Drawer-Zustand | `D-20`, `GUI-GAP-01`, `GUI-GAP-14` |
| `src/components/` | Semiontik-Bibliothek (`OriginBadge`, `SpaceCell`, `RuleDiamond`, `RationalMetric`, `TerminationSeal`, `ProvenanceDrawer`, `TickScrubber`, `ControlDrawer`, `ExportAction`) | `SEM-001`–`SEM-030`, `A-01`, `AK-09` |
| `src/views/` | Exakt 11 View-Module entsprechend `ViewId` (`08.8`) | `D-21`, `D-31`, `D-32` |
| `test/snapshots/` | Aus Backend-Integrationslauf erzeugte JSON-Projektions-Snapshots | `X-22`, `TX15` |
| `test/views/` | Vitest DOM-Render-Tests aller 11 Sichten inkl. Invarianten-Prüfung | `T09`, `TX19`, `AK-16a` |
| `test/e2e/` | Headless-Browser-Tests gegen laufenden Stack | `TX20`, `AK-16b`, `DEP-07` |

---

## 02 — Verbindliche Invarianten

Alle nachfolgenden Invarianten sind für die Rekonstruktion und spätere Implementierung **nicht verhandelbar**. Jede Abweichung mit Semantikwirkung erfordert einen `F3`-Change-Request (`E-07`, `E-19`).

### 02.1 Visuelle Invarianten (`INV-VIS`)
- `INV-VIS-01`: Dunkle, minimalistische Forschungsoberfläche auf Basis der definierten Oberflächen-Skala (`#090B0E` bis `#1D2530`); kein dekorativer Zierat.
- `INV-VIS-02`: $\Omega_A$, $\Omega_O$ und $\Omega_R$ sind stets dreifach unterscheidbar (Farbe + Geometrie + Spalten-/Slot-Position).
- `INV-VIS-03`: Die fünf Offenheitszustände (`UNKNOWN`, `UNDETERMINED`, `UNEVALUABLE`, `NOT_APPLICABLE`, `NOT_AVAILABLE_AT_TICK`) sind visuell paarweise unterscheidbar und tragen **niemals** die Verletzungs-/Fehlerfarbe (`col.eval.violation`).
- `INV-VIS-04`: `DataOrigin = FIXTURE` trägt stets das unverwechselbare gerahmte `FIXTURE`-Signet (`SEM-013`), klar abgesetzt von `ENGINE` und `SYNTHETIC`.
- `INV-VIS-05`: Alle IDs, Ticks, Hashes, Symbolwerte, rationalen Brüche und Operatoren nutzen Monospace mit `tabular-nums`.
- `INV-VIS-06`: Jede `EVALUATED`-Metrik zeigt den exakten rationalen Bruch `n/d` direkt neben dem Dezimalwert.
- `INV-VIS-07`: `prefers-reduced-motion` setzt alle Bewegungsdauern auf `0ms`.
- `INV-VIS-08`: Die Isolationsbarriere $\Omega_A \not\to \text{F05}$ (`SEM-019`) und das menschliche Autorisierungs-Gate (`SEM-020`) sind in Sicht 1 explizit sichtbar.

### 02.2 Semantische Invarianten (`INV-SEM`)
- `INV-SEM-01`: Es existiert **kein** Gesamtindex, kein Gesamt-Score und keine aggregierte Gesamtfarbe über `M01`–`M11` (`REQ-049`).
- `INV-SEM-02`: `UNDEFINED`-Metriken werden niemals als `0`, `0.00` oder `0%` gerendert, sondern stets mit `undefined_reason` (`ZERO_DENOMINATOR` oder `INPUT_MISSING`).
- `INV-SEM-03`: `OperatorRef` und `SigmaRef` werden niemals semantisch umgedeutet, übersetzt oder als generische UI-Icons zweckentfremdet (`TX11`).
- `INV-SEM-04`: Kanonische Unicode-Codepunkte (`K-31`, insbesondere `Σ` = `U+03A3`, `∆` = `U+2206`, `∑` = `U+2211`) werden unverändert gerendert.
- `INV-SEM-05`: Fehlende Bezeichnungen für $\Sigma02$–$\Sigma29$ (`DEP-08`) oder opake `R`/`I`-Codes (`DEP-01`) werden explizit als opak/unaufgelöst markiert (`SEM-027`), niemals erfunden.
- `INV-SEM-06`: `ExecutionStatus` (`COMPLETED`, `PARTIAL`, `BLOCKED`, `FAILED`) und `ContentOpenness` (`undetermined`, `unknown_observations`, etc.) werden stets getrennt ausgewiesen (`P07`).
- `INV-SEM-07`: `KNOWN (stale)` (`observed_at_tick < tick`) wird als verzögerter bekannter Wert ausgezeichnet (`SEM-005`), niemals als `UNKNOWN` oder fehlerhaft.
- `INV-SEM-08`: `NOT_AVAILABLE_AT_TICK` (`K-24`) wird als regulärer Inhaltsblock innerhalb von `ViewState = READY` dargestellt, niemals als `VIEW_DATA_UNAVAILABLE`.

### 02.3 Strukturelle Invarianten (`INV-STR`)
- `INV-STR-01`: Die URL (`/exp/:experimentId/:view?tick=...`) ist die einzige Quelle für die aktive `ExperimentSession` (`D-20`).
- `INV-STR-02`: `F07` enthält **null** Metrik-, Kleene-K3-, Delta- oder GAP-Matching-Berechnungen.
- `INV-STR-03`: `F07` besitzt keine direkte Kopplung zu `F05`-Interna und greift ausschließlich über die dokumentierten API-Endpunkte zu.
- `INV-STR-04`: Sämtliche Vertragstypen in `frontend/src/contracts/generated/` sind maschinell aus dem gebündelten JSON Schema generiert (`TX02`).
- `INV-STR-05`: Das Graph-Layout in Sicht 2 (`elkjs`) ist bei identischer Topologie 100 % deterministisch (`D-31`).
- `INV-STR-06`: Kein `RecoveryProposal` kann ohne expliziten menschlichen Autorisierungsschritt (`AuthorityRecord`, `P11`) in ein Szenario überführt werden.

### 02.4 Funktionale Invarianten (`INV-FUN`)
- `INV-FUN-01`: Jeder API-Abruf durchläuft den `ProjectionHeaderGuard`; jede Abweichung von `experiment_id` oder `tick` erzwingt sofort `VIEW_DATA_UNAVAILABLE` und maskiert veraltete Tick-Daten (`T09`, `GUI-GAP-13`).
- `INV-FUN-02`: Ein Tick-Wechsel in Zone D, Sicht 3 oder Sicht 11 synchronisiert unmittelbar die URL und alle zeitabhängigen Projektionen.
- `INV-FUN-03`: Die globale Export-Aktion (`A-01`) ist in jeder der 11 Sichten erreichbar und schützt vor `409 CONFLICT` während `RUNNING`.
- `INV-FUN-04`: Der `Provenance Inspector Drawer` (Zone E) kann von jedem Datenblock aus die `ProjectionHeader.source_refs` (`artifact_id`, `content_hash`, `data_origin`) anzeigen.
- `INV-FUN-05`: Bei `aggregation = POOLED` oder `TIME_MEAN_EXPLICIT` wird kein `tick`-Parameter an `/metrics` gesendet (`K-25`).
- `INV-FUN-06`: Alle 11 Sichten funktionieren vollständig offline gegen `FIXTURE`- und `IMPORTED`-Daten (`O-23`).

---

## 03 — Verbindliche Abnahmekriterien (Implementierung & Browserdarstellung)

Zusätzlich zu den bestehenden CIRA-Abnahmekriterien `AK-01` bis `AK-16b` gelten für `F07` folgende verbindliche Abnahmekriterien:

| Kriterium | Prüfgegenstand | Nachweismethode | Bezug |
| :--- | :--- | :--- | :--- |
| `AK-GUI-01` | Alle 11 Sichten rendern fehlerfrei gegen echte Backend-Projektions-Snapshots (0 Konsolenfehler, 0 fehlende Pflichtblöcke) | Vitest (`TX15`, `TX19`) | `AK-12`, `AK-16a` |
| `AK-GUI-02` | `ProjectionHeader`-Mismatch (injizierter falscher `tick` oder falsche `experiment_id`) führt deterministisch zu `VIEW_DATA_UNAVAILABLE` ohne sichtbare Alt-Daten | Vitest (`T09`) | `INV-FUN-01` |
| `AK-GUI-03` | `OriginBadge` ist in jeder Sicht an jedem Datenblock vorhanden und spiegelt `FIXTURE` / `SYNTHETIC` / `IMPORTED` / `ENGINE` / `ILLUSTRATIVE` korrekt | Vitest (`TX19`) + E2E (`TX20`) | `AK-09`, `INV-VIS-04` |
| `AK-GUI-04` | Alle fünf Offenheitszustände (`UNKNOWN`, `UNDETERMINED`, `UNEVALUABLE`, `NOT_APPLICABLE`, `NOT_AVAILABLE_AT_TICK`) rendern mit unterschiedlichen `data-semiontic-id`-Attributen (`SEM-006`–`SEM-012`) und ohne Verletzungsfarbe | Vitest (`TX19`) | `INV-VIS-03`, `INV-SEM-08` |
| `AK-GUI-05` | Sicht 3 zeigt an einem Nicht-Sweep-Tick regulär `NOT_AVAILABLE_AT_TICK` in Spalte $\Omega_R$, während $\Omega_A$ und $\Omega_O$ vollständig gerendert bleiben | Vitest (`TX19`) | `K-24`, `INV-SEM-08` |
| `AK-GUI-06` | Sicht 9 zeigt alle 11 Metriken mit exaktem `n/d`-Bruch, `UNDEFINED`-Gründen (`ZERO_DENOMINATOR`/`INPUT_MISSING`), `M07(ALL)` & `M07(OBSERVABLE_CASES)` und ohne Gesamtindex | Vitest (`TX19`) | `REQ-049`, `INV-VIS-06` |
| `AK-GUI-07` | Sicht 5 und Sicht 6 rendern kanonische Unicode-Codepunkte (`Σ01` `U+03A3`, `∆` `U+2206`, `∑` `U+2211`) unverfälscht und kennzeichnen fehlende $\Sigma02$–$\Sigma29$-Labels explizit als `DEP-08` | Vitest (`TX19`) | `K-31`, `INV-SEM-04`, `INV-SEM-05` |
| `AK-GUI-08` | Deterministisches Graph-Layout in Sicht 2: Zweimaliges Rendern derselben `TopologyProjection` erzeugt byte-identische SVG-Knotenkoordinaten | Vitest (`TX19`) | `D-31`, `INV-STR-05` |
| `AK-GUI-09` | Synchroner Tick-Wechsel im echten Headless-Browser (Playwright): Wechsel von `t=1` auf `t=3` in Zone D aktualisiert URL und alle sichtbaren Raumdaten über Sichten 2, 3, 4 und 11 hinweg | Playwright (`TX20`) | `AK-16b`, `INV-FUN-02` |
| `AK-GUI-10` | Globaler Export im Browser (Sicht 1 und Sicht 9): lädt valides `ExperimentBundle`-JSON herunter und zeigt den passenden `bundle_hash` | Playwright (`TX20`) | `A-01`, `INV-FUN-03` |
| `AK-GUI-11` | Zero-Frontend-Metric-Computation-Audit: Statischer Code-Scan bestätigt, dass `frontend/src/` keine eigenen Metrik-, K3- oder Matching-Formeln enthält | AST-/Lint-Check | `INV-STR-02` |
| `AK-GUI-12` | TS-Typ-Drift-Freiheit: `make sync` + `tsc --noEmit` laufen ohne Fehler und ohne Diff im Arbeitsbaum | `TX02`, `make verify` | `AK-01`, `INV-STR-04` |

Hinweis zu `AK-GUI-09` und `AK-GUI-10`: Fehlt in der Ausführungsumgebung die Browser-Laufzeit, greift exakt die in CIRA v1.0.1 (`AK-16b`, `DEP-07`) definierte Regelung (`DEP-07 / EXTERN_AUSZUFÜHREN`), ohne `AK-GUI-01` bis `AK-GUI-08` und `AK-GUI-11`/`AK-GUI-12` zu blockieren.

---

## 04 — Verbleibende offene Relationen, Abhängigkeiten und GUI-Review-Agenda

### 04.1 Externe Abhängigkeiten (aus CIRA v1.0.1 fortgeschrieben)
- `DEP-01`: Semantik & Registry für `R01`–`R18` / `I01`–`I19` und Engine-Gap-Vokabular (in F07 über `SEM-027` opak gekapselt).
- `DEP-02`: Reale `SYNTX MASTER ENGINE`-Schnittstelle (F07 arbeitet vollständig auf `FIXTURE` und `IMPORTED` und ist bereit für `ENGINE`).
- `DEP-07`: Docker-Daemon und Headless-Browser-Laufzeit für `AK-10` und `AK-16b`/`TX20`.
- `DEP-08`: Quelldokument `SYNTX_SIGMA_STATE_ENGINE_v1.8.1_MASTER_ARCHITEKTUR.md` für die wörtlichen Bezeichnungen von $\Sigma02$–$\Sigma29$ (in F07 über `SEM-027` als `LABEL_UNAVAILABLE [DEP-08]` gekapselt).

### 04.2 Ergänzende GUI-Review-Punkte (`RV-GUI-01` bis `RV-GUI-04`)

| RV-ID | Gegenstand | Bezug | Charakter |
| :--- | :--- | :--- | :--- |
| `RV-GUI-01` | Bestätigung der additiven `F2`-Projektionsfelder in `contracts.f07` (`budget_usage`/`serialization_profile` in `ObservationProjection`, serverseitige `DeltaStateA/O`- und `GapMatch`-Klassenprojektion) | `GUI-GAP-04` bis `GUI-GAP-08` | Bestätigung (`F2`, keine Semantikänderung) |
| `RV-GUI-02` | Bestätigung der erweiterten URL-Query-Parameter (`attempt`, `comparisonId`, `aggregation`, `toTick`, `focus`) unter `/exp/:experimentId/:view` | `GUI-GAP-01`, `D-20` | Bestätigung |
| `RV-GUI-03` | Bestätigung der Farb- und Geometrie-Zuordnung für $\Omega_A$ (Cyan / scharf), $\Omega_O$ (Amber / gefast) und $\Omega_R$ (Violett / oktogonal) sowie `FIXTURE`-Signet | Referenzarchitektur `01.1`–`01.2` | Gestaltungsabnahme |
| `RV-GUI-04` | Bestätigung, ob der optionale Endpunkt #21 (`POST /recovery-variants`) in Sicht 8 bereits in Phase 04 mit einem Autorisierungs-Dialog angebunden oder zunächst rein lesend dargestellt wird | `O-19`, Sicht 8 | Umfangsentscheidung |

---

## 05 — Übergabestatus

- **Architekturstatus:** Vollständig konsolidiert und rekursiv gegen CIRA v1.0.1 geprüft.
- **Nächster Schritt:** Gemeinsames Architecture Review (`RV-01`–`RV-07` + `RV-GUI-01`–`RV-GUI-04`) und anschließende Rekonstruktion durch Claude.
- **Execution Boundary:** `ARCHITECTURE ONLY — NO CODE — NO IMPLEMENTATION RELEASE`.

---

*Ende des Artefakts `SYNTX_CIRA_GUI_Claude_Architecture_Handoff.md`.*