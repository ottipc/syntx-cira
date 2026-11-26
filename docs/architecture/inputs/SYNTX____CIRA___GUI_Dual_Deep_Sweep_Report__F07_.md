# SYNTX :: CIRA — GUI Dual Deep Sweep Report (F07)

| Metadatum | Wert |
| :--- | :--- |
| Artefakt | `SYNTX_CIRA_GUI_Dual_Deep_Sweep_Report.md` |
| Zielsystemfeld | `F07 — SYSTEMIC & SEMIONTIC DEMONSTRATION INTERFACE` |
| Eingangsbasis | Konsolidiertes CIRA-Architekturpaket v1.0.1 (`Freeze Candidate`) |
| Modus | Full Recursive Deep Sweep (Vorwärts) + Full Inverse Recursive Deep Sweep (Rückwärts) |
| Status | `READY FOR CLAUDE ARCHITECTURAL RECONSTRUCTION` |
| Execution Boundary | `ARCHITECTURE ONLY — NO CODE — NO IMPLEMENTATION RELEASE` |
| Gestaltungsprinzip | `SYSTEMIC & SEMIONTIC` |
| Dokumenthygiene | Strikte Einhaltung von `K-53` (keine senkrechten Striche in Tabellenzellen) und `K-31` (kanonische Unicode-Codepunkte) |

---

## 00 — Ausführungsprotokoll, Referenzbasis und epistemische Grenzen

### 00.1 Epistemische Wahrhaftigkeit und dokumentierte Operatoren (`P08`, `E-02`, `DEP-01`, `DEP-02`, `DEP-08`)

Gemäß den CIRA-Grundprinzipien `P08` (Keine erfundene Engine) und `E-02` (Keine erfundenen Ergebnisse) wird ausdrücklich dokumentiert, welche analytischen Operatoren in diesem Durchlauf tatsächlich ausgeführt wurden und welche externen Engine-Strukturen weiterhin opak bleiben:

1. **Tatsächlich ausgeführte Architektur-Operatoren (synthetisch-strukturelle Rekonstruktion):**
   - `OP-FWD-01 (Systemfeld-Projektion)`: Vorwärtsabbildung der sieben Softwarefelder `F01` bis `F07`, ihrer Feldtupel und ihrer 27 Artefakttypen auf repräsentationsfähige visuelle Domänen.
   - `OP-FWD-02 (Zustandsraum-Separierung)`: Ableitung disjunkter visueller Kodierungsklassen für $\Omega_A$, $\Omega_O$ und $\Omega_R$ unter Erhalt von `P02` und `T04`.
   - `OP-FWD-03 (Kopplungs- und Stromanalyse)`: Rekonstruktion aller erlaubten und verbotenen Feldrelationen (`05.1`, `05.3`, `05.4`, `05.5`) sowie zeitlicher Ströme (`EventRecord`, `StageEvent`, `ObservationSource`).
   - `OP-FWD-04 (Metrik- und Offenheitsabbildung)`: Überführung der elf rationalen Metriken (`M01`–`M11`), der Kleene-K3-Logik ($\{0, 1, \perp\}$) und der Provenienz-/Offenheitszustände in nicht-reduktive visuelle Repräsentationsbedingungen.
   - `OP-INV-01 (Semiontische Rückwärtsprojektion)`: Rückwärtsrekonstruktion ab dem Zielzustand einer kohärenten, hochpräzisen SYNTX-Forschungsoberfläche hin zu fehlenden Projektionsfeldern, Synchronisationsbedingungen und Datenverträgen in `F07` und der API.
   - `OP-INV-02 (Mehrdeutigkeits- und Lückendetektion)`: Identifikation visueller Kollisionen (z. B. `UNKNOWN` vs. `UNDETERMINED` vs. `NOT_APPLICABLE` vs. `NOT_AVAILABLE_AT_TICK` vs. `FALSE`), fehlender Navigations- und Kontextanker sowie unvollständiger Kopplungen.
   - `OP-CONV-01 (Rekursive Konsolidierung)`: Zusammenführung beider Sweeps, Ableitung von `GUI-GAP-01` bis `GUI-GAP-14`, Klassifikation nach `E-07` (`F2` vs. `F3`) und rekursive Rückprüfung gegen alle CIRA-Invarianten.

2. **Nicht ausgeführte Original-Engine-Operatoren (offene Abhängigkeiten):**
   - Die reale `SYNTX MASTER ENGINE` (`DEP-02`) wurde nicht ausgeführt.
   - Die internen Operatoren `R01`–`R18` und `I01`–`I19` sowie das Engine-GAP-Vokabular bleiben gemäß `DEP-01` und `TX11` semantisch opak und werden visuell ausschließlich über wörtliche Registry-Bezeichnungen (`label_from_source`) dargestellt.
   - Für die $\Sigma$-Identitäten $\Sigma01$–$\Sigma30$ (`U+03A3`, `K-31`) sind gemäß `DEP-08` und `K-33` im Eingangspaket ausschließlich $\Sigma01$ (`Active Carrier Nodes`) und $\Sigma30$ (`Recursive Closure Threshold`) namentlich belegt. Bezeichnungen für $\Sigma02$–$\Sigma29$ werden weder ergänzt noch erschlossen.

### 00.2 Verwendete Originalreferenzen aus CIRA v1.0.1

Alle Rekonstruktionen dieses Berichts stützen sich ausschließlich auf das beigefügte Konsolidierte CIRA-Architekturpaket v1.0.1 (`SYNTX_CIRA_Consolidated_Architecture_Package_v1.0.1.md`, PDF-Stand 47 Seiten), insbesondere:

- Kap. `02`: Implementierungsprinzipien `P01`–`P13`
- Kap. `03`: System-Field-Grundlage ($S_t = C(J_t, R_t)$), geschlossene Enums (`03.3`), $\Sigma$-/Operator-Verankerung (`03.4`) und Unicode-Codepunkte (`03.5`, `K-31`)
- Kap. `04`: Feldverträge `F01`–`F07`
- Kap. `05`: Kopplungsmatrix (`05.1`), Zustandsraumzugriff (`05.2`), Capability-Matrix (`05.3`), 5 Grenzschichten (`05.4`), vermittelte Rekursionskopplung (`05.5`), Steuerungsfluss (`05.6`)
- Kap. `06`: Zustandsmodelle (`06.1`–`06.7`) inkl. `StageEvent`-Projektion (`K-35`) und `NOT_AVAILABLE_AT_TICK` (`K-24`)
- Kap. `07`: Mathematisches Modell (`M01`–`M11`, Einheitsform `K-15`, Tickmengen `K-19`, GAP-Matching `K-47`, M09 `K-43`, M10 `K-44`, Delta `07.8`, Kleene K3 `07.9`)
- Kap. `08`: Schemaentwürfe (`08.1`–`08.11`, 27 Artefakttypen `K-36`, `contracts.f07` `08.8`)
- Kap. `09`–`11`: Modulbaum, API-Verträge (21 Einträge / 23 Operationen `K-37`), F07-Sichtenarchitektur (11 Sichten + globaler Export `A-01`, `D-21`)
- Kap. `13`, `17`, `24`, `26`: Tests (`T01`–`T12`, `T04b`, `TX01`–`TX21`), Abnahmekriterien (`AK-01`–`AK-16b`), Abhängigkeiten (`DEP-01`–`DEP-08`), Review-Agenda (`RV-01`–`RV-07`)

---

## 01 — Full Recursive Deep Sweep (Vorwärtsrekonstruktion)

Die Vorwärtsrekonstruktion leitet aus der inneren Struktur von CIRA v1.0.1 ab, welche strukturellen Sachverhalte visuell, räumlich, relational und interaktiv in `F07` repräsentiert werden müssen, ohne die Systemgrenzen zu verfälschen.

### 01.1 Die sieben Systemfelder (`F01`–`F07`) und ihre visuelle Repräsentation

| Feld | Systemfunktion (v1.0.1) | Visuelle Kernrepräsentation in F07 | Primäre Sichten |
| :--- | :--- | :--- | :--- |
| `F01_DOMAIN_TOPOLOGY` | Typisierter gerichteter Graph $G = (V, E, \tau_V, \tau_E)$, unveränderlich je Run, generische Knoten | Deterministischer gerichteter Graph (`elkjs`, `D-31`), Kanten nach Relationstyp, Attribut-Domänenregister | Sicht 1, Sicht 2 |
| `F02_GOVERNANCE` | Versionierte `STATE`-, `TRANSITION`- und `FUNCTION`-Regeln, Rollen, `ApprovalRecord`, `AuthorityRecord` | Regelmatrix mit K3-Auswertung je Zustandsraum, Gültigkeitsfenster, Abhängigkeitskette (`requires`), Autorisierungsprotokoll | Sicht 1, Sicht 3, Sicht 8, Sicht 10 |
| `F03_EMULATOR` | Deterministische Fortschreibung $\Omega_A(t+1) = T(\Omega_A(t), u_t)$, `EventRecord`, `ConsistencyAnnotationSet` | Referenz-Spalte $\Omega_A$ im Triptychon, diskrete Tick-Zeitleiste, Ereignisspur (`APPLIED` / `REJECTED`), Baseline/Recovery-Linie | Sicht 1, Sicht 2, Sicht 3, Sicht 10, Sicht 11 |
| `F04_OBSERVATION` | Beobachtungsoperator $\Omega_O(t) = O_\Theta(\Omega_A(t))$, Quellen, `lag_ticks`, `BudgetUsage`, `SourceReferenceRegister` | Beobachtungs-Spalte $\Omega_O$, Quellenkontinuitäts-Matrix, Budget-Pegel (`items` / `bytes`), Profilwechsel-Revision, Veralterungsmarkierung (`stale`) | Sicht 1, Sicht 3, Sicht 4 |
| `F05_SYNTX_ENGINE` | Unabhängige Vorwärts- ($\Omega_F$) und Inversrekonstruktion ($\Omega_I$), Merge (`engine_first/v1`), GAPs, `RecoveryProposal`, `OperatorRegistry` | Getrennte Forward- und Inverse-Inspektoren, Rekonstruktions-Spalte $\Omega_R$, Konflikt- & Terminierungsanzeige, wörtliche $\Sigma$-/Operator-Spuren | Sicht 1, Sicht 3, Sicht 5, Sicht 6, Sicht 7, Sicht 8 |
| `F06_METRICS` | Exakte rationale Evaluation $M_t = M(\Omega_A(t), \Omega_O(t), \Omega_R(t))$, `ReferenceSpace`, `GapMatch`, `ComparisonReport` | Lineare Metrikkette $\Omega_A \to \Omega_O \to \Omega_R$ (`D-32`), exakte Brüche $n/d$ neben Dezimalwert, `aux`-Zähler, `UNDEFINED`-Gründe, Baseline-vs.-Recovery-Diff | Sicht 1, Sicht 7, Sicht 8, Sicht 9, Sicht 10 |
| `F07_INTERFACE` | Projektion, Zeit-/Experiment-Synchronisation, Provenienz-Transparenz, Experimentsteuerung, Export | Globale Shell (Kontextleiste, Sichten-Rail, Tick-Scrubber), `ViewState`-Rahmen, `OriginBadge`, globaler Export-Trigger | Alle 11 Sichten + Export |

### 01.2 Die drei Zustandsräume ($\Omega_A$, $\Omega_O$, $\Omega_R$)

Nach `P02` und `T04` sind $\Omega_A$, $\Omega_O$ und $\Omega_R$ disjunkte Typfamilien ohne gemeinsamen Obertyp. Visuell erzwingt dies eine **dreifache Trennung** (Farbe + Geometrie + Spalten-/Ebenenposition):

1. **$\Omega_A$ (Actual State / Synthetische Referenz):** Vollständig bestimmt (`APPLICABLE` mit Symbolwert oder statisch `NOT_APPLICABLE`). Visuelle Semantik: exakte, geschlossene, rechtwinklige Referenzgeometrie.
2. **$\Omega_O$ (Observed State / Beobachtungsraum):** Vermittelt über Projektion $\omega(i,t)$ (`K-09`) mit den Zuständen `KNOWN` (inkl. Kennzeichnung `stale` bei `observed_at_tick < tick`, `K-42`), `UNKNOWN` (Platzhalter `source_id = null`, ausdrücklich kein Fehler!) und `NOT_APPLICABLE`. Visuelle Semantik: gefaste Beobachtungsgeometrie mit Sichtbarkeits- und Frischeindikator.
3. **$\Omega_R$ (Reconstructed State / Rekonstruktionsraum):** Ergebnis aus `F05` mit `DETERMINED` (Wert + `EpistemicClass`, niemals `OPEN_REFERENCE` nach `K-14`), `UNDETERMINED` und `NOT_APPLICABLE`. An Ticks ohne Sweep gilt `ContentAvailability = NOT_AVAILABLE_AT_TICK` (`K-24`). Visuelle Semantik: oktogonale/doppelt gerahmte Rekonstruktionsgeometrie mit epistemischer Klassen- und Provenienzmarke.

### 01.3 Feldrelationen, Kopplungen und Grenzschichten (`05.1`–`05.5`)

Die visuelle Topologie des Gesamtsystems (insbesondere Sicht 1) muss vier strukturell verschiedene Beziehungsklassen unmissverständlich unterscheiden:
- **Gerichtete Datenkopplungen (`ArtifactEnvelope`):** z. B. `F01 → F03`, `F04 → F05 (ObservationBundle)`, `F03/F04/F05 → F06`.
- **Verbotene Grenzen (`B_i`, `05.4`):** Insbesondere die harte Isolationsbarriere zwischen `F03`/`F06`/`F07` und `F05` (`Ω_A ↛ F05`, `TX04`, `TX05`). Diese Grenze ist in Sicht 1 als explizite visuelle Isolationsmembran darzustellen.
- **Vermittelte Rekursionskopplung (`05.5`, `K-08`):** `F05 (RecoveryProposal) → F02 (AuthorityRecord durch menschliche Rolle) → F03 (neue RECOVERY ScenarioDefinition)`. Muss visuell als unterbrochene, durch ein menschliches Autorisierungs-Gate geführte Schleife erscheinen (`P11`).
- **Steuerungskopplung (`F07 → API → Orchestrator`):** Auslösung von Experimenten, Re-Sweeps, Importen, Replays und Vergleichen ohne direkten Datenzugriff auf `F05`-Interna.

### 01.4 Ströme und Zustandsübergänge (`06.1`–`06.7`)

- **Definitionen (`DRAFT → VALIDATED → SEALED` / `INVALID`):** In F07 primär als versiegelte Referenzen (`id@version`, `artifact_id`) mit Integritäts-Hash sichtbar.
- **Experiment-Projektion aus `StageEvent`s (`K-35`):** Neun diskrete Stufen (`DEFINITIONS`, `EMULATION`, `OBSERVATION`, `FORWARD`, `INVERSE`, `MERGE`, `STABILITY`, `EVALUATION`, `EXPORT`) mit abgeleitetem Status `FAILED > BLOCKED > PARTIAL > COMPLETED` (`D-24`). Visuell als lineare Stufen-Pipeline mit klarer Trennung zwischen Ausführungsstatus (`ExecutionStatus`) und inhaltlicher Offenheit (`ContentOpenness`, `P07`).
- **SweepRun (`COMPLETED`, `PARTIAL`, `FAILED`, `BLOCKED`):** Terminale Artefakte mit `attempt >= 0` (`K-22`) und verpflichtendem `TerminationRecord` bei nicht-`BLOCKED` Läufen (`T12`).
- **ViewState (`IDLE → LOADING → READY` / `VIEW_DATA_UNAVAILABLE`):** Strikt gekoppelt an `(experiment_id, tick)` und Header-Abgleich (`D-20`).

### 01.5 Rekursive und inverse Rekonstruktionsprozesse (`F05`)

- **Unabhängigkeit von Forward ($\Omega_F$) und Inverse ($\Omega_I$):** Getrennte `sweep_id`s, getrennte `SweepTrace`s, Forward strikt ohne `target_ref`, Inverse zwingend mit `target_ref` (`K-11`, `S-07`, `T08`). Daraus folgt die zwingende Trennung in Sicht 5 (`FORWARD_SWEEP_INSPECTOR`) und Sicht 6 (`INVERSE_SWEEP_INSPECTOR`).
- **Merge (`engine_first/v1`, `S-03`) und Konflikte (`MergeConflict`):** Abweichungen zwischen Forward und Inverse werden als `UNDETERMINED` oder `ENGINE_RESOLVED` dokumentiert und müssen im Kontext von $\Omega_R$ und Sicht 5/6/8 nachvollziehbar sein.
- **Kontinuität & Stabilität:** `SweepSchedule` (`FINAL`, `EVERY_TICK`, `EXPLICIT`) bestimmt, an welchen Ticks $\Omega_R$ verfügbar ist; `StabilityConfig` (`attempt = 1` auf identischem Bundle, `K-44`) erzeugt die Grundlage für `M10`.

### 01.6 Strukturelle Differenzen (`07.8`, `08.6`)

- **Raumspezifische `DeltaStateA`, `DeltaStateO`, `DeltaStateR` (`K-13`):** Zeigen Zustandsübergänge zwischen $t$ und $t+1$ innerhalb eines Raums.
- **`DeltaCoupling`:** Zeigt Änderungen von `CouplingStatus` (`EFFECTIVE`, `POSSIBLE`, `UNKNOWN_OPEN`, `ABSENT`) auf kanonischen Relationsschlüsseln `rel:<type>:<src>:<tgt>` (`K-01`).
- **`StructuralGap` & `OpenRelation`:** Strukturelle Lücken mit zwingendem Quellbezug (`source_refs >= 1`), Status `OPEN` oder `CLOSED_IN_RESULT` sowie `ReferenceStatus` (`RESOLVED`, `UNRESOLVED`, `TRUNCATED`, `EXTERNAL`).

### 01.7 Die elf mathematischen Metriken (`M01`–`M11`)

- **Einheitsform (`K-15`):** Jede Metrik besitzt exakte rationale `numerator` und `denominator` sowie den abgeleiteten `float`-Wert (`value`) im Intervall $[0, 1]$. Visuell muss immer der exakte Bruch $n/d$ neben dem Dezimalwert lesbar sein (`P05`).
- **Kein Gesamtindex (`REQ-049`):** F07 darf niemals eine aggregierte Gesamtpunktzahl oder Ampel-Gesamtnote über `M01`–`M11` bilden.
- **Kettenanordnung (`D-32`):** Visuelle Strukturierung entlang der Erkenntniskette:
  - Beobachtungs- & Basis-Ebene: `M06` (Observation Completeness, `A x O`, inkl. `stale_known`), `M02(A, O)`, `M03(A, O)`, `M04` (Functional Continuity, je Funktion + gepoolt).
  - Rekonstruktions-Ebene: `M05` (Reconstruction Coverage), `M01` (Reconstruction Distance, Ziel `0`), `M11` (Reconstruction Accuracy, Ziel `1`, exakt $1 - \text{M01}$), `M02(R)`, `M03(R)`.
  - GAP-, Stabilitäts- & Schließungs-Ebene: `M07` (GAP Coverage `ALL` und `OBSERVABLE_CASES`, `K-46`), `M08` (GAP Precision), `M10` (Stability + `shared_coverage`), `M09` (GAP Closure Baseline vs. Recovery inkl. `persisting`, `new_inconsistencies`, `unevaluable_in_recovery`, `K-43`).
- **Nullnenner und fehlende Eingaben (`UNDEFINED`):** Müssen visuell strikt nach `undefined_reason` (`ZERO_DENOMINATOR` vs. `INPUT_MISSING`) ausgezeichnet werden — niemals als `0` oder `0%`.

### 01.8 Zeitliche Relationen, Provenienz und Informationszustände

- **Zeit:** Diskrete Ticks $t \in [0, N-1]$, `observed_at_tick <= tick`, `lag_ticks`, inklusive Regelgültigkeit `[valid_from_tick, valid_until_tick]` (`K-07`), aufeinanderfolgende Paare `(t, t+1)` für `TRANSITION`-Regeln (`M03`).
- **Provenienz:** `DataOrigin` (`SYNTHETIC`, `FIXTURE`, `ENGINE`, `IMPORTED`, `ILLUSTRATIVE`) nach konservativer Propagation (`D-08`) muss an jedem angezeigten Wert sichtbar sein (`REQ-057`, `AK-09`). `ProjectionHeader` trägt `experiment_id`, `tick`, `schema_version`, `data_origin` und `source_refs`.
- **Offenheit vs. Fehler (`P06`, `P07`):** `UNKNOWN`, `UNDETERMINED`, $\perp$ (`UNEVALUABLE`), `UNDEFINED`, `OPEN` und `NOT_AVAILABLE_AT_TICK` sind reguläre, wissenschaftlich wertvolle Informationszustände — niemals UI-Fehlermeldungen.

---

## 02 — Full Inverse Recursive Deep Sweep (Rückwärtsrekonstruktion)

Ausgehend vom Zielzustand einer vollständig systemischen, semiontisch eindeutigen und hochpräzisen CIRA-Forschungsoberfläche werden rückwärts sämtliche architektonischen Voraussetzungen geprüft. Dabei identifiziert der Inverse Sweep **14 konkrete architektonische und repräsentationale Lücken (`GUI-GAP-01` bis `GUI-GAP-14`)** im Stand v1.0.1.

### 02.1 Rückwärtsanalyse nach Repräsentationsdimensionen

1. **Identitäts- und Session-Kohärenz:**
   - Eine Forschungsoberfläche erfordert, dass jede Ansicht exakt reproduzierbar adressiert werden kann. `D-20` definiert `/exp/:experimentId/:view?tick=n`.
   - **Befund (`GUI-GAP-01`):** Für `M10` (Stabilität, `attempt = 0` vs. `attempt = 1`) und Re-Sweeps (`K-22`) sowie für Sicht 10 (`SCENARIO_COMPARISON`, `comparison_id`) und Sicht 9 (`aggregation`, `to_tick`) fehlen im URL-Schema verbindliche optionale Query-Parameter (`attempt`, `comparisonId`, `aggregation`, `toTick`). Ohne diese Parameter ist ein Deep-Link auf einen Re-Sweep-Inspektor oder einen Vergleichsbericht nicht eindeutig.

2. **Zustandsraum- und Offenheits-Eindeutigkeit:**
   - Ein Betrachter muss auf einen Blick fünf strukturell verschiedene Formen von „kein regulärer Wert vorhanden“ unterscheiden können: `UNKNOWN` ($\Omega_O$), `UNDETERMINED` ($\Omega_R$), `NOT_APPLICABLE` (statische Deklaration), `NOT_AVAILABLE_AT_TICK` (kein Sweep an Tick $t$) und `UNEVALUABLE` ($\perp$ in K3).
   - **Befund (`GUI-GAP-02`):** In v1.0.1 fehlt eine verbindliche visuelle Differenzierungsregel zwischen diesen fünf Zuständen sowie zwischen `KNOWN (aktuell)` und `KNOWN (stale)` (`K-42`). Eine naive Darstellung (z. B. einheitliches „—“ oder Grau) würde die zentrale epistemische Aussage von CIRA zerstören.

3. **Vollständigkeit der Projektionsverträge (`contracts.f07` & API Kap. 10):**
   - **Befund (`GUI-GAP-03`):** Sicht 2 (`TOPOLOGY_GRAPH`) soll Knoten, Relationen, Zustände und Ergebnisse darstellen, aber `TopologyProjection` enthält in `08.2` keine explizite Sichtbarkeitsmaske aus `ObservationConfig` ($\Theta$: sichtbare vs. verdeckte Knoten/Relationen). Ohne diese Markierung bleibt im Graphen unsichtbar, welche Knoten außerhalb des Beobachtungsfensters liegen.
   - **Befund (`GUI-GAP-04`):** Sicht 3 (`TEMPORAL_STATE_EXPLORER`) zeigt das Triptychon $\Omega_A / \Omega_O / \Omega_R$, aber die raumspezifischen Differenzen `DeltaStateA`, `DeltaStateO`, `DeltaStateR` (`K-13`) und `DeltaCoupling` haben keinen explizit benannten Projektionsplatz in `StateProjection` oder `ObservationProjection` (nur `ReconstructionResult` trägt `delta_state` und `delta_coupling`).
   - **Befund (`GUI-GAP-05`):** Sicht 4 (`OBSERVATION_INSPECTOR`) soll laut Kap. 11 „Kontext, Budget, Register, veraltete Werte“ zeigen. `ObservationProjection` (`08.5`) enthält jedoch nur `header`, `context`, `projected` und `register` — die Felder `budget_usage`, `budget_limits` (`max_observations`, `max_bytes`), `serialization_profile` und `revision` aus `ObservationBundle` / `ObservationConfig` fehlen in der Projektionsdefinition.
   - **Befund (`GUI-GAP-06`):** Sicht 5/6 (`FORWARD_SWEEP_INSPECTOR` / `INVERSE_SWEEP_INSPECTOR`) und Sicht 8 (`ARCHITECTURAL_CLOSURE_INSPECTOR`) müssen `MergeRecord` (insbesondere `MergeConflict`s zwischen Forward und Inverse) sowie `RecoveryProposal`s und deren verknüpfte `AuthorityRecord`s (`05.5`) sichtbar machen. In Kap. 10 Endpunkt 6 (`/results`) werden `proposals` zurückgegeben, aber verknüpfte `AuthorityRecord`s aus `F02` sind dort nicht als Projektionsblock aufgeführt.
   - **Befund (`GUI-GAP-07`):** Sicht 7 (`STRUCTURAL_GAP_INSPECTOR`) benötigt die Äquivalenzklassen des Matchers (`07.4`, `K-47`: normalisierte Knotenmengen $N(x)$) sowie die Unterscheidung `ALL` vs. `OBSERVABLE_CASES` (`K-46`). `GapMatch` (`08.7`) speichert `tick`, `case_id`, `gap_id`, `verdict`, `observable`, `matcher`, aber nicht den normalisierten Klassenschlüssel `normalized_node_set`, sodass die Gruppenbildung in der UI sonst clientseitig neu berechnet werden müsste (Verstoß gegen das Prinzip „keine Metrik-/Matching-Logik im Frontend“).
   - **Befund (`GUI-GAP-08`):** Sicht 9 (`STRUCTURAL_METRICS`) muss neben den `MetricResult`s auch Metadaten der `MetricDefinition` (Name, Zielwert `0` oder `1`, Formelbeschreibung) sowie die aktiven `StrategyRef`s (`EvaluationReport.strategies`) und `ReferenceSpace`-Details anzeigen. Endpunkt 7 (`/metrics`) liefert `EvaluationReport`, aber die statischen `MetricDefinition`-Metadaten sind nicht explizit im Response-Vertrag verankert.
   - **Befund (`GUI-GAP-09`):** Sicht 1 (`SYSTEM_FIELD_OVERVIEW`) zeigt laut Kap. 11 die Feldkette `F01–F07` mit Stufenstatus (`StageEvent`) und `FieldConfigurationSnapshot` (`/fields`). Es fehlt eine explizite Zuordnungstabelle zwischen den 9 `StageName`s (`DEFINITIONS`..`EXPORT`) und den 7 Feldern (`F01`–`F07`), da `DEFINITIONS` z. B. `F01`, `F02` und `F04` betrifft und `FORWARD`/`INVERSE`/`MERGE`/`STABILITY` alle zu `F05` gehören.

4. **Interaktions-, Steuerungs- und Provenienz-Invarianten:**
   - **Befund (`GUI-GAP-10`):** Die globale Experimentsteuerung (Anlegen eines Experiments über `POST /experiments`, Auslösen eines Re-Sweeps `POST /experiments/{id}/sweeps`, Import `POST /experiments/{id}/results/import`, Replay `POST /experiments/{id}/replay`, Vergleich `POST /comparisons`, optional `POST /recovery-variants`) ist in Kap. 10 als API vorhanden, aber in Kap. 11 nicht räumlich und interaktiv in der F07-Shell verortet.
   - **Befund (`GUI-GAP-11`):** `DataOrigin` kann innerhalb einer Sicht heterogen sein (z. B. Sicht 3: $\Omega_A$ ist `SYNTHETIC`, $\Omega_O$ ist `SYNTHETIC`, $\Omega_R$ ist `FIXTURE` oder `IMPORTED`). Ein einzelnes `ProjectionHeader.data_origin` pro Request reicht nur bei getrennten Endpunkten; bei kombinierten Projektionen (wie Sicht 2, Sicht 3, Sicht 7, Sicht 8) muss jeder Teilblock sein eigenes `data_origin` tragen, um die konservative Vermischung transparent zu halten (`AK-09`).
   - **Befund (`GUI-GAP-12`):** Umgang mit `DEP-08` ($\Sigma02$–$\Sigma29$ ohne Bezeichnung) und `DEP-01` (`R01`–`R18` / `I01`–`I19` opak) in Sicht 5 und Sicht 6: Es fehlt eine verbindliche Fallback-Darstellungsregel, die opake Codes und fehlende Registry-Labels als solche kennzeichnet (`LABEL_UNAVAILABLE [DEP-08]`), statt leere Felder oder geratene Namen zu rendern.
   - **Befund (`GUI-GAP-13`):** Bei `VIEW_DATA_UNAVAILABLE` (z. B. Header-Abweichung zwischen angefordertem `(experiment_id, tick)` und `ProjectionHeader`) fehlt eine präzise visuelle Quarantäne-Regel: Veraltete Daten eines vorherigen Ticks dürfen niemals zusammen mit dem neuen Tick-Header stehen bleiben („No Stale Cross-Tick Bleed“).
   - **Befund (`GUI-GAP-14`):** `ProjectionHeader` in `08.8` führt `source_refs: tuple[ArtifactRef, ...]`, aber es fehlt eine einheitliche UI-Interaktion (Provenienz-Inspektor-Drawer), über die ein Nutzer an jedem Wert oder Block die vollständige Artefakt-Herkunft (`artifact_id`, `artifact_type`, `content_hash`, `revision`, `data_origin`) inspizieren kann.

---

## 03 — Konvergenzmatrix (Vorwärts- & Invers-Sweep)

| GUI-GAP | Ursprung | Betroffene CIRA-Struktur | Architektonische Schließung in F07 v1.0.0 | E-07 Klasse |
| :--- | :--- | :--- | :--- | :--- |
| `GUI-GAP-01` | Invers (Session) | `ExperimentSession` (`08.8`), `D-20` | Erweiterung der URL-Query-Syntax um optionale, typsichere Kontextparameter (`tick`, `attempt`, `comparisonId`, `aggregation`, `toTick`) bei unveränderter Hauptroute `/exp/:experimentId/:view` | `F2` (additiv) |
| `GUI-GAP-02` | Vorwärts + Invers | `ObservationStatus`, `ReconstructionStatus`, `RuleResult`, `ContentAvailability`, `K-42` | Einführung des 5+1-Zustands-Semiontik-Systems (eindeutige Form, Muster, Farbe, Glyph für `UNKNOWN`, `UNDETERMINED`, `NOT_APPLICABLE`, `NOT_AVAILABLE_AT_TICK`, `UNEVALUABLE` und `KNOWN:stale`) | `F2` (F07-intern) |
| `GUI-GAP-03` | Invers (Sicht 2) | `TopologyProjection` (`08.2`), `F04` | Optionale Projektionsüberlagerung `visibility_overlay` in Sicht 2 aus `/observations` (`observable_topology`), ohne Änderung an `F01`-Verträgen (`NodeView` bleibt rein `F01`, Overlay kommt aus `F04`-Projektion) | `F2` (Komposition in F07) |
| `GUI-GAP-04` | Vorwärts + Invers | `DeltaStateA/O/R` (`K-13`), `DeltaCoupling`, Sicht 3 | Ergänzung optionaler Delta-Projektionsfelder in `StateProjection` (aus `core.delta` serverseitig berechnet) und `ObservationProjection` oder dedizierte Projektionssektion in `/states` und `/observations` | `F2` (Projektions-Erweiterung) |
| `GUI-GAP-05` | Invers (Sicht 4) | `ObservationProjection` (`08.5`) | Aufnahme von `budget_usage`, `budget_limits`, `serialization_profile` und `bundle_revision` in `ObservationProjection` (bereits im Store vorhanden, reine Projektion) | `F2` (Projektions-Erweiterung) |
| `GUI-GAP-06` | Invers (Sicht 8) | `/results` (API #6), `AuthorityRecord` (`08.3`) | Verknüpfung von `RecoveryProposal` mit zugehörigen `AuthorityRecord`s über ein Projektionsfeld `authority_records` im Closure-Kontext (read-only Projektion aus `F02`) | `F2` (Projektions-Erweiterung) |
| `GUI-GAP-07` | Invers (Sicht 7) | `GapMatch` (`08.7`), `K-47` | Serverseitige Auslieferung der Matching-Klassen (`subject_class_nodes`) in der Projektion für Sicht 7, damit F07 keinerlei Normalisierungs- oder Matching-Logik implementiert | `F2` (Projektions-Erweiterung) |
| `GUI-GAP-08` | Invers (Sicht 9) | `/metrics` (API #7), `MetricDefinition` | Mitlieferung der statischen `MetricDefinition`-Registry im `/metrics`-Projektions-Envelope oder über `/fields` (statische Metadaten, keine neue Semantik) | `F2` (Projektions-Erweiterung) |
| `GUI-GAP-09` | Invers (Sicht 1) | `StageName` (`08.1`), `F01`–`F07` | Verbindliche Stage-to-Field-Projektionszuordnung in der F07-Spezifikation (`DEFINITIONS → F01/F02/F04`, `EMULATION → F03`, `OBSERVATION → F04`, `FORWARD/INVERSE/MERGE/STABILITY → F05`, `EVALUATION → F06`, `EXPORT → F07/Orch`) | `F2` (F07-intern) |
| `GUI-GAP-10` | Invers (Shell) | API #3, #15–#19, #21 | Verortung aller Steuerungsaktionen in einem klar getrennten `Control & Lifecycle Drawer` (Command Palette / Action Bar) mit expliziter Bestätigung und Statusrückmeldung (`202` + Polling) | `F2` (F07-intern) |
| `GUI-GAP-11` | Vorwärts + Invers | `DataOrigin`, `ProjectionHeader`, `AK-09` | Block-Granularität für `OriginBadge`: Jede Raumspalte und jeder Datenblock trägt ein eigenes `OriginBadge` aus seinem jeweiligen Quell-`ProjectionHeader` | `F2` (F07-intern) |
| `GUI-GAP-12` | Invers (Sicht 5/6) | `OperatorRegistry`, `DEP-01`, `DEP-08`, `K-31` | Verbindliche Opak-Darstellung für unaufgelöste $\Sigma$-/Operator-Codes mit explizitem `DEP`-Hinweis und strikter Codepunkt-Darstellung (`U+03A3`, `U+2206`, `U+2211`) | `F2` (F07-intern) |
| `GUI-GAP-13` | Invers (Sync) | `ViewState` (`06.7`), `T09` | Strikte Quarantäne-Sperre bei `VIEW_DATA_UNAVAILABLE` oder `LOADING` über Tick-Grenzen: Sofortige Maskierung veralteter Tick-Daten bis Header-Verifikation besteht | `F2` (F07-intern) |
| `GUI-GAP-14` | Invers (Provenienz) | `ProjectionHeader.source_refs` | Globaler `Provenance Inspector Drawer` (rechte Nebenebene), aufrufbar von jedem Block, Wert, Regel-Ergebnis oder Metrik-Eintrag | `F2` (F07-intern) |

---

## 04 — Rekursive Architekturkonsolidierung

### 04.1 Rückführung in das konsolidierte CIRA-Gesamtsystem v1.0.1

Jede in Abschnitt 03 abgeleitete Schließung (`GUI-GAP-01` bis `GUI-GAP-14`) wurde rekursiv gegen die bestehende Architektur v1.0.1 geprüft:

1. **Feldgrenzen und Kopplungsmatrix (`05.1`, `05.3`, `05.4`):**
   - **Geprüft:** Führt irgendeine Schließung zu einem neuen Schreibzugriff von `F07` oder einer direkten Kopplung `F07 → F05`?
   - **Ergebnis:** Nein. `F07` bleibt ausschließlich Konsument von API-Projektionen (`R`-Zugriff über `api/projections`) und Auslöser deklarativer Steuerungs-Endpunkte. Die fünf mechanischen Grenzschichten (`L1`–`L5`) sowie `T04b`, `TX04` und `TX05` bleiben vollständig unberührt.
2. **Zustandsraumtrennung (`P02`, `T04`):**
   - **Geprüft:** Vermischt eine kombinierte Sicht (insbesondere Sicht 2 oder Sicht 3) die Datenmodelle von $\Omega_A$, $\Omega_O$ und $\Omega_R$?
   - **Ergebnis:** Nein. Auch in Sicht 2 (Graph) und Sicht 3 (Triptychon) bleiben die Datenströme getrennte Projektionsobjekte (`TopologyProjection`, `StateProjection`, `ObservationProjection`, `Results`-Blöcke), die erst in der visuellen Ebene über den gemeinsamen Schlüssel `(node_id / attribute_id, tick)` räumlich ausgerichtet werden.
3. **Mathematische Integrität (`07`, `P05`, `REQ-049`):**
   - **Geprüft:** Berechnet `F07` eigene Metriken, Deltas oder GAP-Matching-Klassen?
   - **Ergebnis:** Nein. Durch `GUI-GAP-04`, `GUI-GAP-07` und `GUI-GAP-08` wird explizit sichergestellt, dass alle Deltas (`core.delta`), Matching-Klassen (`metrics.matching`) und Metrikdefinitionen (`metrics.registry`) serverseitig geliefert werden. `F07` führt **null** domänenspezifische Berechnungen aus.
4. **Kanonische Zeichen und Determinismus (`P04`, `K-31`, `K-52`):**
   - **Geprüft:** Bleiben Export-Hashes, Unicode-Codepunkte und deterministisches Layout erhalten?
   - **Ergebnis:** Ja. `F07` normalisiert oder transformiert keine Engine-Symbole, nutzt deterministisches `elkjs`-Layout mit stabiler ID-Sortierung (`D-31`) und lädt `ExperimentBundle` unverändert über `/export`.

### 04.2 Auswirkung auf Verträge, Tests und offene Abhängigkeiten

| Betroffener Bereich | Auswirkung der GUI-Konsolidierung | Handlungsbedarf bei Rekonstruktion durch Claude |
| :--- | :--- | :--- |
| `contracts.f07` (`08.8`) | Präzisierung von `ExperimentSession` (optionale Query-Felder), `ObservationProjection` (`budget_usage`, `serialization_profile`, `revision`), optionalen Delta- & Closure-Projektionsblöcken | Als `F2`-Präzisierung mit kleiner ADR in Phase 01/03 dokumentieren (`E-07`) und über `make sync` nach TS generieren |
| `api/projections` (Kap. 10) | Keine neuen Pflicht-Endpunkte erforderlich; bestehende 21 Einträge (23 Operationen) decken alle 11 Sichten ab | Projektions-Serializer in Phase 03 um die `F2`-Felder aus `GUI-GAP-04` bis `GUI-GAP-08` anreichern |
| Tests (`T09`, `TX02`, `TX15`, `TX19`, `TX20`) | Schärfung von `TX19` und `TX20` um semiontische Invarianten (5 Offenheitszustände, Block-`OriginBadge`, Tick-Quarantäne, Codepunkt-Rendering) | In Phase 04/05 in die Frontend-Testsuite aufnehmen |
| Externe Abhängigkeiten (`DEP-01`, `DEP-02`, `DEP-07`, `DEP-08`) | Unverändert offen; F07 besitzt nun deterministische, explizite Darstellungsregeln für alle vier Abhängigkeiten | In `STATUS.md` und in der UI selbst sichtbar halten (`E-18`) |
| Review-Agenda (`RV-01`–`RV-07`) | Ergänzt um 4 GUI-Review-Punkte (`RV-GUI-01` bis `RV-GUI-04`, dokumentiert im Handoff) | Gemeinsame Bestätigung vor Implementierungsfreigabe |

---

*Ende des Artefakts `SYNTX_CIRA_GUI_Dual_Deep_Sweep_Report.md` — Execution Boundary eingehalten (Architecture Only, No Code).*