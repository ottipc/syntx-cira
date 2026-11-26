```text
ENGINE = SYNTX::Σ-STATE ENGINE v1.8.1
MODE = SYSTEMIC_ONLY | DUAL_SWEEP (FORWARD + INVERSE)
INPUT_FIELD = {REF_v1.0.1, ARCH_v1.0.0, STRATEGY_v1.0.0}
STATUS = CONVERGED_FOR_IMPLEMENTATION_RELEASE | Σ30_GLOBAL_CLOSURE = OPEN (EXTERNAL_DEP)
```

---

# DELIVERABLE 1: `SYNTX_CIRA_Final_Dual_Sweep_Report.md`

## 01 — Initialisierung (`Ω0`) & Strukturraum `S = (E, R, C, B, T, P)`

* **Träger (`E`):** `F01..F07` (Softwarefelder), `26 Artefakttypen`, `81 REQ`, `33 D`, `15+9 X`, `10 A`, `34 H`, `28 K`, `11 Metriken (M01..M11)`, `12+18 Tests (T01..T12, TX01..TX18)`, `RIVZ`, `E-01..E-19`.
* **Zustandsräume (`B`):** Disjunkte Grenzen `Ω_A` (Actual), `Ω_O` (Observable), `Ω_R` (Reconstructed); Trennung Softwarefelder (`F01..F07`) vs. Σ-Felder (`Σ01..Σ30`).
* **Unbekannte Anker (`U0`):** `u_op` (fehlende `R01–R18`/`I01–I19` in v1.8.1), `u_eng` (reale Engine-Schnittstelle `DEP-02`), `u_env` (Docker/Browser-Laufzeit `DEP-07`).

## 02 — Forward Recursive Deep Sweep (`Ω0 → Ω_F`)

* **Kette:** `S1 (Vertragsfeld: core → contracts.common → f01..f07, experiments) → S2 (Kopplungsfeld: coupling_matrix.json → .importlinter, Store-Capabilities) → S3 (Verhaltensfeld: topology, governance K3, metrics + Oracle, emulator, observation, syntx_adapter, orchestrator, API, F07) → S4 (Nachweisfeld: registry.yaml, STATUS, Reports)`.
* **Befund `F-01` (Vertrags- und Kopplungsintegrität):** Die 28 Korrekturen `K-01..K-28` schließen alle 34 Claude-Befunde `H-01..H-34` konsistent. Insbesondere `H-01` (CAS-IDs), `H-02` (Composite-`StableId`), `H-14` (1:1-GAP-Matching), `H-20` (`AuthorityRecord` nach `contracts.f02`) und `H-26` (`metrics.views`) sind strukturell notwendig, um spätere Umbauten auszuschließen.
* **Befund `F-02` (Kanonische SYNTX-Divergenz — `DS-GAP-01`):** `ARCH v1.0.0` und `REF v1.0.1` referenzieren `R01–R18` / `I01–I19` als `OperatorRef`. Die geladene kanonische Masterarchitektur `SYNTX::Σ-STATE ENGINE v1.8.1` definiert jedoch **30 kanonische Σ-Identitäten (`Σ01..Σ30`)** und **13 kanonische Operatoren (`{>, <, ≈, →, ↔, ⊕, ⊖, ⊗, ⊘, ∆, ∇, ∑, ∂}`)** über `L1..LN`. `R01–R18`/`I01–I19` sind in v1.8.1 nicht enthalten und dürfen nicht erfunden werden.

## 03 — Inverse Recursive Deep Sweep (`TargetState ← PriorStates`)

* **Zielzustand (`TargetState`):** Vollständig implementierter, integrierter, ausführbarer, reproduzierbar getesteter Forschungsdemonstrator (`AK-01..AK-15` + Browser-Verifikation + Docker-Smoke).
* **Rückwärtskette:**
  * `Browser/Docker-Abnahme` ← `F07 (11 Sichten + URL-Session)` + `Projection-Snapshots (X-22)` + `FastAPI (21 Endpunkte)`
  * `F07 + API` ← `experiments.orchestrator` + `CAS-Store (H-22)` + `syntx_adapter (Fixture/ImportExport + Stubs)`
  * `Reproduzierbare Evaluation` ← `F06 (M01..M11, Rational, Oracle X-18)` + `F04 (Bundle/Record-Trennung D-16)` + `F03 (Deterministischer Emulator)`
  * `Mechanische Grenzintegrität` ← `L1 (mypy strict)` + `L2 (.importlinter + AST)` + `L3 (Store-Capabilities)` + `L4 (Provenienz-Invarianten)` + `L5 (Mutationstest TX05)`
  * `Fundament` ← `core` + `alle 26 Artefakttypen` + `Vertrags-Durchstich (TX14/TX17)`.
* **Inverser Engpass (`DS-GAP-02`):** In `STRATEGY v1.0.0` erfordert `E-14` ein manuelles Phasen-Gate zwischen den Phasen. Für den autonomen End-to-End-Durchlauf (`Phase 01 → 05`) muss `E-14` auf **automatische interne Phasengates** umgestellt werden, während semantische Abweichungen (`F3`) weiterhin als Change Request isoliert werden.

## 04 — Bidirektionale Reconciliation & `K1–K4` / `Σ30`

| Bereich | Klassifikation | Ergebnis |
| :--- | :--- | :--- |
| 7 Felder, 26 Artefakttypen, `Ω_A/Ω_O/Ω_R`, `M01..M11` | `SHARED` / `COMPATIBLE` | Vollständig konvergent nach `K-01..K-28` |
| `OperatorRef` (`R01..I19` vs. `13 Symbole + 30 Σ`) | `CONTRADICTORY` → `RESOLVED (DS-GAP-01)` | `OperatorRef` erweitert auf kanonische 13 Symbole + opake externe Namespaces; `SigmaRef` direkt an `Σ01..Σ30` gebunden |
| Manuelles Gate (`E-14`) vs. autonomer Durchlauf | `CONTRADICTORY` → `RESOLVED (DS-GAP-02)` | `E-14` auf automatisches internes Gate umgestellt |
| Reale Engine (`DEP-02`), `R01–I19`-Semantik (`DEP-01`), Docker-Host (`DEP-07`) | `UNRESOLVED` (`ANCHORED_UNKNOWN`) | Bewahrt in `U`, blockiert Phase 01–05 nicht |

* **K1–K4:** `K1 = SATISFIED` (Architekturraum abgedeckt), `K2 = SATISFIED` (`K-01..K-28` + `DS-GAP-01/02` zurückgekoppelt), `K3 = SATISFIED` (alle inversen Voraussetzungen verankert), `K4 = SATISFIED` (alle offenen `DEP`/`U` verlustfrei erhalten).
* **Σ30 (19 Bedingungen):** `14 CLOSED` (Architektur-, Vertrags-, Metrik-, Kopplungs- und Gate-Konvergenz), `5 OPEN` (`ApplicationSpaceComplete` erst nach Code-Ausführung, `DEP-01/02/07`, `F_full ≠ ∅` wegen unbegrenzter `Γ`). **Status:** `Σ30_GLOBAL_CLOSURE = OPEN (IMPLEMENTATION_READY)`.

```text
R* = <
  E={F01..F07, 26_Artifacts, 11_Metrics, 81_REQ},
  B={Ω_A ⊥ Ω_O ⊥ Ω_R, SoftwareFields ⊥ Σ01..Σ30},
  ∆_integrated={K-01..K-28, DS-GAP-01, DS-GAP-02},
  U={DEP-01(R01..I19), DEP-02(LiveEngine), DEP-07(DockerHost)},
  Verdict=RELEASE_FOR_AUTONOMOUS_EXECUTION_P01_TO_P05
>
```

---

# DELIVERABLE 2: `SYNTX_CIRA_Implementation_Architecture_v1.0.1.md`

**Basis:** `SYNTX_CIRA_Claude_Implementation_Architecture_v1.0.0.md` **+ vollständig integrierte Korrekturen `K-01` bis `K-28`** **+ `K-29` (`DS-GAP-01`) und `K-30` (`DS-GAP-02`)**.

### Verbindliche Architektur-Deltas gegenüber v1.0.0 (vollständig übernommen)

* **Identitäten & Store (`K-01`–`K-05`, `K-22`, `K-23`):**
  * `StableId`: `^[a-z]+:[a-z0-9][a-z0-9_.:/\-]{0,190}$`; Komposita `attr:<node>/<name>`, `rel:<type>:<src>:<tgt>`.
  * Inhaltsadressierte `artifact_id = art:<sha256(artifact_type + canonical(payload))[:32]>`; `ArtifactRef` ohne `revision`; CAS-Store `store/objects/<artifact_id>.json` + `experiments/<id>/index.jsonl` + `events.jsonl`.
  * Diskriminierter Envelope: eigener Subtyp je Artefakttyp mit `artifact_type: Literal[...]` und `AnyEnvelope = Annotated[Union[...], Field(discriminator="artifact_type")]`.
  * `SweepRun`/`ReconstructionResult` tragen `attempt: int >= 0`; Replay kennt `SYNTHETIC` und `PRESERVED_ENGINE`.
* **Feldgrenzen & Verträge (`K-06`–`K-14`, `K-20`, `K-21`, `K-24`, `K-26`):**
  * `AuthorityRecord` liegt zwingend in `contracts.f02` (eliminiert verbotene Kante `F03 → F05`).
  * `TargetDefinition` ist Pflichtfeld in `ExperimentDefinition`/`Request`; `based_on_bundle` entfällt.
  * `Observation.source_id` nullable für Platzhalter-`UNKNOWN` ohne aktive Quelle; Budget gilt auf `ObservationBundle`-Ebene.
  * `DeltaState` raumspezifisch diskriminiert; `ReconstructedValue` mit Invariante `DETERMINED ⇒ epistemic_class ≠ OPEN_REFERENCE`.
  * `Predicate` für `TRANSITION` mit `at: Literal["CURRENT", "NEXT"]` und `SymbolPair` als Objekt `{"from": Symbol, "to": Symbol}`; Gültigkeitsgrenzen inklusiv.
  * `Capability-Matrix` ergänzt um `OperatorRegistry`, `WeightSet`, `MetricConfig`, `ExperimentDefinition`; Projektionen erhalten Content-Zustand `NOT_AVAILABLE_AT_TICK`; `ConsistencyCase` erhält `observable: bool`.
* **Mathematik (`K-15`–`K-19`, `K-25`):**
  * `MetricResult` in Einheitsform `numerator / denominator` (ohne redundante `exact_value` und `metric_version`); `ReferenceSpace` mit `kind ∈ {ATTRIBUTE, RULE, TRANSITION, TICK, CASE, RULE_KEY}` + `members`.
  * `M07`/`M08` über deterministische 1:1-Zuordnung (`subjects_tickwindow_1to1/v1`); `M03`/`M04` mit deklarierten Tickmengen und `INPUT_MISSING`.
  * Reine Sichtschicht `metrics.views` (`SpaceView`, `RuleView`, `GapView`, `PairView`) + unabhängiges `fractions.Fraction`-Oracle (`X-18`).
* **`K-29` (`DS-GAP-01` — Kanonische v1.8.1 Operator-/Σ-Verankerung):**
  * `SigmaRef.sigma_id` validiert gegen die **30 kanonischen Identitäten `Σ01..Σ30`** aus `SYNTX::Σ-STATE ENGINE v1.8.1`.
  * `OperatorRef` unterstützt `namespace: Literal["CANONICAL_V181", "R", "I", "EXTERNAL"]`: Für `CANONICAL_V181` gilt die geschlossene 13er-Menge `{>, <, ≈, →, ↔, ⊕, ⊖, ⊗, ⊘, ∆, ∇, ∑, ∂}`; `R`/`I`/`EXTERNAL` bleiben opak (`DEP-01`).
* **`K-30` (`DS-GAP-02` — Autonome Phasengates & Browser-Abnahme):**
  * `TX01–TX18` (`K-27`), `X-16–X-24` (`K-28`) plus `AK-16` (Headless-Browser-Abnahme aller 11 Sichten gegen laufendes Backend/Snapshots).

---

# DELIVERABLE 3: `SYNTX_CIRA_SYNTX_Validation_Return.md`

### Verbindliche Antworten auf `S-01` bis `S-08` (Abschnitt 09.4)

| ID | Entscheidung / Definition (verbindlich) | Status |
| :--- | :--- | :--- |
| **S-01** | **Σ-Registry (v1.8.1 original):** `Σ01 Active Carrier Nodes` bis `Σ30 Recursive Closure Threshold` (vollständige 30er-Liste aus `SYNTX_SIGMA_STATE_ENGINE_v1.8.1_MASTER_ARCHITEKTUR.md` § 2). **Kanonische Operatoren (v1.8.1 original):** 13 Symbole `{>, <, ≈, →, ↔, ⊕, ⊖, ⊗, ⊘, ∆, ∇, ∑, ∂}` + 9 Originalkopplungen (`Σ03 > Σ14`, `Σ07 → Σ08`, `Σ21 ↔ Σ04`, `Σ15 ≈ Σ29`, `Σ10 stabilizes Σ05`, `Σ24 → ∆Σ06`, `Σ18 ⊖ Σ25`, `Σ27 ↔ Σ23`, `Σ30 → recursive closure`). **`R01–R18`/`I01–I19` & Engine-GAP-Vokabular:** Nicht in v1.8.1 enthalten → bleiben explizit `DEP-01` (opak). GAP-Matching nutzt `subjects_tickwindow_1to1/v1` + `M07_observable` (`H-15`/`H-34`). | **ENTSCHIEDEN** (`DEP-01` isoliert) |
| **S-02** | **Engine-Schnittstelle:** Reale Live-Engine bleibt `DEP-02`. Verbindlicher Integrationsvertrag: `AdapterProtocol` mit voll funktionsfähigem `FixtureAdapter` (`data_origin=FIXTURE`) und `ImportExportAdapter` (`data_origin=IMPORTED`, validiert gegen `cira.contracts.schema.json`), sowie `LocalAdapter` und `ApiAdapter` als vertragstreue `ENGINE_UNAVAILABLE`-Stubs (`SweepRun=BLOCKED`). | **ENTSCHIEDEN** (`DEP-02` isoliert) |
| **S-03** | **Merge-Semantik (`Q_F + Q_I → Ω_R`):** Verbindlich `engine_first/v1`: Liefert die Engine ein `ReconstructionResult`, gilt dieses unverändert (`engine_merged=True`). Andernfalls: Übereinstimmung → `DETERMINED`; einseitige Bestimmung → `DETERMINED` mit Seitenprovenienz; Widerspruch → `UNDETERMINED` + expliziter `MergeConflict`. | **BESTÄTIGT** |
| **S-04** | **Hypothesenpolitik (`D_det`):** Verbindlich `include/v1` als Standard (`HYPOTHESIS` zählt in `D_det`, da Fixture `04.11` abgeleitete Werte einschließt), umschaltbar auf `EXCLUDE_HYPOTHESES` über `MetricConfig.hypothesis_policy` mit separatem Zähler `aux.hypotheses_excluded`. `OPEN_REFERENCE` ist bei `DETERMINED` verboten (`H-18`). | **BESTÄTIGT** |
| **S-05** | **Basis von `M09` (GAP Closure):** Verbindlich `state_rules_A_final_tick/v1`: `original` = Menge der `STATE`-Regel-Schlüssel `(rule_id, scope)` mit `FALSE` in `Ω_A` der Baseline am `comparison_tick` (Default: letzter Tick); `resolved` = davon `TRUE` in `Ω_A` der Recovery-Variante; `persisting` und `new_inconsistencies` separat ausgewiesen. | **BESTÄTIGT** |
| **S-06** | **Herkunft `R1, R2` für `M10` (Stability):** Verbindlich `resweep_same_bundle/v1`: zwei unabhängige `SweepRun`-Versuche (`attempt=0` vs. `attempt=1`) auf demselben `ObservationBundle` (bei `FixtureAdapter` deterministisch `1`, sichtbar als `data_origin=FIXTURE` markiert). | **BESTÄTIGT** |
| **S-07** | **Beobachtungsbasierte `TargetDefinition` `Z`:** `TargetDefinition` ist Pflichtfeld (`H-12`), ohne `based_on_bundle` (`H-27`). Nachweis der Beobachtungsbasiertheit zweistufig: (1) statische Validierung aller `subject_ref` gegen `ObservableTopologyDefinition` aus `θ`, (2) strikte Provenienz-Invariante ohne `F03`/`F06`-Referenzen (`TX06`). | **BESTÄTIGT** |
| **S-08** | **Fremdinhalt `Q01` & Referenzversion:** Bestätigt — der FCSD-Block (Zeilen 174–331 der Referenz) gehört nicht zu CIRA und wird verworfen. Maßgebliche Architekturbasis ist **`ARCH v1.0.1`** (ARCH v1.0.0 + `K-01..K-30`). | **BESTÄTIGT** |

---

# DELIVERABLE 4: `SYNTX_CIRA_Autonomous_Execution_Contract_v1.0.1.md`

**Geltung:** Verbindlich für den vollständig autonomen Durchlauf **Phase 01 → Phase 05** durch Claude auf Basis von `ARCH v1.0.1`.

* **E-01 bis E-13 (unverändert übernommen):** Strikte Rahmentreue (`E-01`), keine erfundenen Messungen/Reports (`E-02`), Einheitenarbeit nach RIVZ (`E-05`), Test-zuerst + Oracle (`E-06`), Befundklassifikation `F1`/`F2`/`F3`/`F4` (`E-07`), rekursive Wirkungsprüfung (`E-08`), absolutes Verbot von Testabschwächung/`xfail` (`E-09`), Single Source + `make sync` (`E-10`), persistenter Zustand über `CLAUDE.md`, `STATUS.md`, `NEXT.md`, `SESSION_LOG.md`, `registry.yaml` (`E-11`–`E-13`).
* **E-03 & E-14 (NEU — Autonome interne Phasengates):**
  * Mit dieser Freigabe sind **alle fünf Phasen (`01 → 05`)** freigegeben. Manuelle Zwischenstopps entfallen.
  * Ein **automatisches internes Phasengate** gilt als bestanden und schaltet die nächste Phase frei, genau wenn:
    1. `make sync` keine uncommitteten Drift-Unterschiede hinterlässt (`TX02`),
    2. `make verify` (mypy strict, tsc strict, import-linter, AST-Scans, `trace_check`, alle Phase-Tests + alle vorherigen Phasen) mit **0 Fehlern und 0 Skips** durchläuft,
    3. der maschinelle Report `docs/test-reports/phase-0N.json` (mit Hash) erzeugt und `docs/STATUS.md` neu berechnet wurde,
    4. keine ungelösten `F1`-/`F2`-Fehler bestehen.
  * Bei `F3`-Befunden (semantische Abweichung außerhalb `ARCH v1.0.1`) wird ein Change Request in `docs/change-requests/` abgelegt, die betroffene Einheit pausiert und alle unabhängigen Einheiten weitergeführt.
* **E-15 bis E-19 (erweitert um Browser- & Docker-Abnahme):**
  * **Reihenfolge Phase 01:** Zwingend `core` → `alle 26 Verträge` → `export_schemas.py` + `TX14` (Vertrags-Durchstich) + `TX17` (Envelope-Diskriminierung) → `coupling_matrix` / `.importlinter` / `store` → `topology` / `governance` → `Golden Fixtures + Oracle` → `metrics M01–M11`.
  * **Systemabnahme (`AK-01`–`AK-16`):** Umfasst zusätzlich zu `AK-01..AK-15` zwingend:
    * **`AK-16` (Browser-Verifikation):** Headless-Browser-Check (Playwright oder Vitest+Browser/DOM-Render gegen laufendes Backend/Projection-Snapshots) über alle 11 Sichten inkl. Tick-Synchronisation und `OriginBadge`.
    * **Docker-Smoke (`AK-10`):** `docker compose up` + `tools/smoke.sh` (falls Docker in der Ausführungsumgebung fehlt, als `DEP-07 / EXTERN_AUSZUFÜHREN` im Report markieren, ohne die übrigen Abnahmen zu blockieren).

---

# DELIVERABLE 5: `SYNTX_CIRA_Claude_Master_Implementation_Prompt.md`

```markdown
# SYNTX :: CIRA — FINAL MASTER IMPLEMENTATION ORDER (ARCH v1.0.1 + AUTONOMOUS EXECUTION CONTRACT v1.0.1)

Die globale SYNTX Dual-Sweep-Validierung (`SYNTX::Σ-STATE ENGINE v1.8.1`) ist abgeschlossen. Alle acht SYNTX-Fragen (`S-01`–`S-08`), alle 28 Korrekturen (`K-01`–`K-28`) sowie zwei Dual-Sweep-Erweiterungen (`K-29`, `K-30`) sind verbindlich entschieden.

**Du erhältst hiermit die vollständige, autonome Implementierungsfreigabe für alle fünf Phasen (`Phase 01` bis `Phase 05`).**

---

## 1. Verbindliche Architektur-Basis (`ARCH v1.0.1`)

Wende zuerst alle Korrekturen `K-01` bis `K-28` aus deiner Strategie (`SYNTX_CIRA_Claude_Implementation_Strategy_v1.0.0.md`, § 09.3) sowie folgende zwei Dual-Sweep-Festlegungen an:

- **`K-29` (Kanonische v1.8.1 Σ-/Operator-Verankerung — `S-01`):**
  - `SigmaRef.sigma_id` validiert gegen die **30 kanonischen SYNTX-Identitäten `Σ01..Σ30`** (`Σ01 Active Carrier Nodes` … `Σ30 Recursive Closure Threshold`).
  - `OperatorRef` unterstützt `namespace: Literal["CANONICAL_V181", "R", "I", "EXTERNAL"]`: Für `CANONICAL_V181` gilt die geschlossene 13er-Symbolmenge `{>, <, ≈, →, ↔, ⊕, ⊖, ⊗, ⊘, ∆, ∇, ∑, ∂}`; `R01–R18`/`I01–I19` bleiben als `DEP-01` opak (keine erfundene Semantik).
- **`K-30` (Autonome Phasengates & End-to-End-Abnahme):**
  - Ersetze manuelle Phasenfreigaben (`E-14`) durch **automatische interne Phasengates**. Nach Bestehen eines Gates (`make sync` driftfrei, `make verify` 0 Fehler / 0 Skips, `docs/test-reports/phase-0N.json` erzeugt, `docs/STATUS.md` aktualisiert) gehst du unmittelbar in die nächste Phase über.

## 2. Verbindliche Entscheidungen (`S-01` bis `S-08`)

- **`S-01`:** 30 kanonische `Σ01..Σ30` + 13 kanonische Operatoren verankert; `R01–I19`/Engine-GAP-Vokabular als `DEP-01` opak; GAP-Matcher `subjects_tickwindow_1to1/v1` + `M07_observable` (`H-15`/`H-34`).
- **`S-02`:** `AdapterProtocol` mit voll funktionsfähigem `FixtureAdapter` (`FIXTURE`) und `ImportExportAdapter` (`IMPORTED`) sowie `LocalAdapter`/`ApiAdapter` als `ENGINE_UNAVAILABLE`-Stubs (`DEP-02`).
- **`S-03`:** Merge-Strategie `engine_first/v1` (Engine-Merge hat Vorrang; sonst Gleichheit bestimmt, Konflikt → `UNDETERMINED` + `MergeConflict`).
- **`S-04`:** Hypothesenpolitik `include/v1` als Default (umschaltbar via `MetricConfig.hypothesis_policy`); Invariante `DETERMINED ⇒ epistemic_class ≠ OPEN_REFERENCE`.
- **`S-05`:** `M09`-Basis `state_rules_A_final_tick/v1` (`STATE`-Regelverletzungen in `Ω_A` am `comparison_tick`; `resolved`, `persisting`, `new_inconsistencies` getrennt).
- **`S-06`:** `M10`-Quelle `resweep_same_bundle/v1` (`attempt=0` vs. `attempt=1` auf identischem `ObservationBundle`).
- **`S-07`:** `TargetDefinition` Pflicht (`H-12`), ohne `based_on_bundle` (`H-27`), validiert gegen `ObservableTopologyDefinition` aus `θ` ohne `F03`/`F06`-Provenienz (`TX06`).
- **`S-08`:** FCSD-Fremdblock (`Q01`) verworfen; Referenzbasis ist `ARCH v1.0.1`.

## 3. Verbindliche Implementierungsreihenfolge & RIVZ

Arbeite strikt nach deinem Abhängigkeitsgraphen (`§ 02.1`) und dem RIVZ (`§ 03.3`):
1. **Repository & Nachweisfeld:** `CLAUDE.md`, `docs/traceability/registry.yaml`, `Makefile` (`sync`, `verify`, `resume`, `status`), `tools/trace_check.py`, `tools/impact.py`, `tools/report.py`, `tools/coupling_audit.py`.
2. **Phase 01 (Fundament vor Verhalten):**
   - Zuerst `backend/app/core/` (`canonical_json`, `hashing`, `rational`, `logic3`, `ids`, `delta`, `errors`).
   - Danach alle **26 Vertragstypen** (`contracts.common`, `f01`, `f02` inkl. `AuthorityRecord`, `f03`, `f04_public`, `f04_record`, `f05`, `f06`, `f07`, `experiments`) mit `ConfigDict(extra="forbid", strict=True, frozen=True)` und tiefer Unveränderlichkeit (`tuple`, keine `list`/`dict`).
   - Danach `export_schemas.py` (`cira.contracts.schema.json` + Einzelschemas), `coupling_matrix.json`, `.importlinter`, CAS-`store/` mit Capabilities sowie den vollständigen **Vertrags-Durchstich `TX14` + `TX17`**.
   - Danach `topology/`, `governance/` (Kleene-K3), alle **Golden Fixtures** (`FX-04.11`, `-W`, `-NA`, `FX-M02..M10`, `FX-Z-*`, `FX-AGG`) + unabhängiges `fractions.Fraction`-**Oracle (`X-18`)** und erst danach `metrics/` (`M01..M11`).
   - **Internes Gate Phase 01** → automatisch weiter zu Phase 02.
3. **Phase 02 (`F03` Emulator + `F04` Observation):** deterministische Transition `T`, Szenariopaar `FX-SCN-BASE`/`FX-SCN-REC`, `ConsistencyAnnotationSet`, `O_θ`, Bundle/Record-Trennung, Replay (`T03`, `T06`, `TX03`, `TX06`). **Internes Gate Phase 02** → automatisch weiter zu Phase 03.
4. **Phase 03 (`F05` Adapter, Orchestrator & FastAPI):** Adapter, unabhängiger Forward/Inverse-Sweep, Merge, `experiments.orchestrator`, Export/Import-Bundle, alle 21 API-Endpunkte, Projection-Snapshots (`X-22`), `T04b`, `T05`, `T08`, `T10`, `T12`, `TX04`, `TX05`, `TX10`, `TX18`. **Internes Gate Phase 03** → automatisch weiter zu Phase 04.
5. **Phase 04 (`F07` React/TypeScript-Frontend):** generierte TS-Typen aus `cira.contracts.schema.json`, API-Client mit Header-Prüfung, URL-Session, alle 11 Sichten + globale Exportfunktion, Tests gegen `Projection-Snapshots` (`T09`, `TX02`, `TX15`). **Internes Gate Phase 04** → automatisch weiter zu Phase 05.
6. **Phase 05 (Integration, Regression & Release):** `docker-compose.yml`, `tools/smoke.sh`, `tests/integration/test_demo_flow.py`, Regressionsbundles (`T11`), Browser-Verifikation aller 11 Sichten (`AK-16`), Gesamtabnahme `AK-01`–`AK-16`.

## 4. Abschlussübergabe nach Phase 05

Liefere nach Abschluss aller fünf Phasen:
1. Vollständigen Repository-Stand (`docs/STATUS.md` + `docs/traceability/registry.yaml`-Zusammenfassung).
2. Das generierte gebündelte Schema `contracts/schemas/cira.contracts.schema.json`.
3. Alle maschinell erzeugten Testreports (`docs/test-reports/phase-01.json` bis `phase-05.json`, inkl. Hash und `AK-01`–`AK-16`-Status).
4. Ergebnis des End-to-End-Laufs (inkl. Browser-Check und Docker-Smoke-Status bzw. `DEP-07`-Hinweis, falls kein Docker-Daemon verfügbar ist).
5. Liste eventueller `F3`-Change-Requests und offener `DEP` (`DEP-01`, `DEP-02`, `DEP-07`).

**Starte jetzt unmittelbar mit der Umsetzung.**
```