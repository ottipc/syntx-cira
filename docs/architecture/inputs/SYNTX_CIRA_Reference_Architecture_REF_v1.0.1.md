SYNTX :: CIRA

Structural Cognition and Resilience Engineering Architecture

Autor: Ottavio Braun — System Field Engineering / SYNTX
Version: 1.0.1 — konsolidierter Architekturentwurf
Kontext: European Defense Tech Hackathon, Berlin 2026
Domäne: Structural Intelligence / Civil Infrastructure Resilience
Umgebung: vollständig synthetisches, abstraktes Service-Labor

00 — Übergabeauftrag an Claude

Analysiere dieses gesamte Dokument als zusammenhängendes System. Entwickle daraus eine eigene implementierungsoptimierte System-Field-Architektur, mit der du die Software effizient und modular programmieren kannst. Erhalte die sieben Feldidentitäten, ihre Semantik, die Zustandsraumtrennung, mathematischen Definitionen und Schnittstellen. Du darfst interne Modulgrenzen, Bibliotheken und Implementierungsreihenfolgen vorschlagen; dokumentiere jede Abweichung und ihre strukturelle Wirkung. Liefere zunächst ausschließlich die Architektur, keinen Anwendungscode.

Dein Ergebnis enthält Feldverträge, Kopplungsmatrix, Zustandsmodelle, vollständige Schemaentwürfe, Modulbaum, API-Verträge, Testzuordnung, offene Abhängigkeiten, Implementierungsphasen und eine Zuordnung jeder Anforderung zu ihrer Realisierung. Kennzeichne offene Entscheidungen. Übergib das Ergebnis zur unabhängigen SYNTX-Validierung, bevor die Implementierung beginnt.

01 — Executive Architecture

CIRA verbindet deterministische synthetische Zustandserzeugung, Beobachtung, strukturelle Rekonstruktion, mathematische Evaluation und interaktive Darstellung. Forschungsgegenstand ist die Rekonstruktionsleistung der MASTER ENGINE auf einem kontrollierten Informationsraum. Die Messung betrifft Systemstrukturen und dokumentierte Informationsverarbeitung.

flowchart TD
 F1[F01 Topology] --> F3[F03 Emulator]
 F2[F02 Governance] --> F3
 F3 --> F4[F04 Observation]
 F4 --> F5[F05 SYNTX Dual Sweep]
 F3 --> F6[F06 Metrics]
 F4 --> F6
 F5 --> F6
 F6 --> F7[F07 Interface]
 F5 --> F7

Die experimentelle Umgebung verwendet generische Servicekomponenten und abstrakte Datenkonsistenzfälle. Sie enthält keine realen Standorte oder realen Infrastrukturmodelle.

02 — System Field Engineering Foundation

Originaler gemeinsamer SYNTX-Kern: S = C(J,R), wobei J zugängliche Ströme, R Relationen und C deren Konfiguration bezeichnet. CIRA erweitert die Darstellung um diskrete Zeit: S_t = C(J_t,R_t).

Strukturelle Unterscheidungen: Stream, Coupling, Interface, Weighting, Calibration, Coherence State, Delta und Recursion. Rekursion bezeichnet die Rückwirkung eines Ergebnisses auf nachfolgende Kopplungsbedingungen. Effektive Kopplung, bekannte Kopplungsmöglichkeit und unbekannte Offenheit bleiben getrennt. Quellenbeobachtung, Quellenaussage, strukturelle Ableitung, Hypothese und offene Referenz bleiben getrennt.

Die sieben Softwarefelder F01–F07 sind von den dynamisch aktivierten analytischen Σ-Feldern der MASTER ENGINE zu unterscheiden. Die ursprünglichen Operatoren R01–R18 und I01–I19 werden über einen Adapter integriert; ihre Semantik wird nicht durch CIRA neu definiert.

CIRA-Feldtupel (Entwurf): F_i = ⟨C_i,R_i,X_i,U_i,Y_i,B_i,I_i,T_i,K_i,P_i⟩. C: Träger; R: Relationen; X: Zustandsraum; U/Y: Eingabe/Ausgabe; B: Grenze; I: Invarianten; T: Transitionen; K: Kopplungen; P: Provenienz. Jeder Vertrag definiert Identität, Zweck, Attribute, Relationstypen, Richtung, Zeitgültigkeit, Lifecycle, Fehler- und Wiederherstellungszustände und Serialisierung.

03 — Seven-Field Specification

F01_DOMAIN_TOPOLOGY

Typisierter gerichteter Graph G=(V,E,τV,τE) abstrakter Servicekomponenten. Träger: Knoten und Relationen; Attribute: stabile ID, Typ, Version, deklarierte Zustandsattribute. Relationen: depends_on, reports_to, provides als generische semantische Referenzen. Eingabe TopologyDefinition, Ausgabe ImmutableTopology. Eindeutige IDs und auflösbare Referenzen; Topologie pro Run unveränderlich. Änderungen erzeugen neue Versionen. Fehler INVALID_TOPOLOGY; Wiederherstellung durch gültige Definition. JSON.

F02_GOVERNANCE

Träger: dokumentierte Regeln, Rollen, Sollbedingungen. Attribute: ID, Version, Scope, Zeitgültigkeit. Relationen applies_to, requires, permits. Regel g_j:X→{0,1,⊥}; ⊥ bedeutet nicht auswertbar. GovernanceDefinition und RuleEvaluation getrennt. Menschliche Freigaben als dokumentierte experimentelle Zustände. Eindeutige Regelreferenzen; versionierte Regeländerungen. Fehler INVALID_RULE; Rückkehr zu gültiger Version. JSON.

F03_EMULATOR

Träger: Experiment, Snapshot, Event. Eingabe ScenarioDefinition, Ausgabe ActualState und EventRecord. Diskrete Zeit, monotone Tick- und Sequenznummern, reproduzierbare Fortschreibung vorab definierter abstrakter Testzustände. Ω_A(t+1)=T(Ω_A(t),u_t). Baseline und Wiederherstellungsvariante verwenden vergleichbare synthetische Fixtures. Initialzustand, Konfiguration und Historie versionieren. Fehler INVALID_TRANSITION; Replay ab gültigem Initialzustand. JSON/JSONL. Keine Abhängigkeit von F04/F05.

F04_OBSERVATION

Träger: Observation und ContextBundle. Ω_O(t)=O_θ(Ω_A(t)); θ ist die versionierte Beobachtungskonfiguration. Eingabe ActualState, Ausgabe ObservationBundle. Attribute: Source-ID, Tick, Referenz, Status. Relationen observes, references, derived_from. Status KNOWN, UNKNOWN, NOT_APPLICABLE. UNKNOWN ist nicht gleich falsch oder abwesend. Quellenkontinuität, Kontextbudget, Beobachtungshistorie und Kontextversion erhalten. Fehler CONTEXT_INCOMPLETE; erneute Serialisierung. JSON.

F05_SYNTX_ENGINE

Eingabe ausschließlich ObservationBundle und beobachtungsbasierte TargetDefinition. Ausgabe ForwardResult und InverseResult mit unabhängigen Ausführungshistorien; anschließend ReconstructionResult. Ω_R(t)=R(Ω_O(0:t)). Träger: SweepRun, Reference, Trace. Attribute: Operator-ID, Σ-ID, Provenienz, Referenzstatus. Relationen derives_from, references, depends_on. Separate DeltaState und DeltaCoupling. GAPs mit Quellenbezug, offene Relationen, TerminationRecord. Kontinuierliche Beobachtung durch erneute Rekonstruktion versionierter Kontexte. Fehler ENGINE_UNAVAILABLE; erneuter Sweep oder Import eines tatsächlichen Ergebnisses. JSON. Keine direkte Kenntnis des Actual State.

Adaptervarianten: FixtureAdapter (explizit als Testdaten markiert), LocalAdapter und ApiAdapter (abhängig von real verfügbarer Schnittstelle), optional ImportExportAdapter. Keine erfundene Engine-Ausführung. Keine automatische Anwendung von Rekonstruktionsvorschlägen; abstrakte Wiederherstellungsvarianten werden als separate Experimente ausgewertet.

F06_METRICS

Träger: MetricDefinition, MetricResult, EvaluationReport. Eingabe ActualState, ObservationBundle, ReconstructionResult. Ausgabe versionierte EvaluationReport. Identischer Referenzraum je Auswertung, getrennte Metriken für Beobachtung, Rekonstruktion und synthetische Konsistenz. Fehler METRIC_UNDEFINED; Neuberechnung nach Vervollständigung. JSON.

F07_INTERFACE

Träger: View, ExperimentSession. Attribute: Run-ID, Tick, Ansicht. Eingabe API-Projektionen; Ausgabe Darstellungszustand und Experimentsteuerung. Gemeinsame Zeit- und Experimentreferenz. Fehler VIEW_DATA_UNAVAILABLE; erneuter Abruf. TypeScript/JSON. Elf Sichten: System Field Overview, Interactive Topology Graph, Temporal State Explorer, Observation Inspector, Forward Sweep Inspector, Inverse Sweep Inspector, Structural GAP Inspector, Architectural Closure Inspector, Structural Metrics Dashboard, Scenario Comparison, Event Timeline, Experiment Export (zwölf benannte Sichten; bei Bedarf gemeinsame Exportfunktion statt eigener Ansicht).

04 — Mathematical Model

Ω_A: synthetischer Referenzzustand; Ω_O: beobachtbarer Zustand; Ω_R: rekonstruierter Zustand. Q_F=R_F(O), Q_I=R_I(O,Z). Beide Ergebnisse unabhängig speichern. M_t=M(Ω_A(t),Ω_O(t),Ω_R(t)). Δ_S=D_S(S_t,S_{t+1}); Δ_K=D_K(K_t,K_{t+1}); K bezeichnet die Kopplung, nicht automatisch Delta.

D_ref: definierter anwendbarer Referenzattributraum; D_obs: beobachtete Attribute darin; D_det: bestimmte rekonstruierte Attribute darin. Gewichte w_i>0, versioniert, Standard im Fixture 1. δ(a,r)=0 bei Gleichheit, sonst 1. Unbestimmte Attribute separat zählen. NOT_APPLICABLE aus dem anwendbaren Raum ausschließen. Alle Quotienten mit Nenner null ergeben UNDEFINED und null. Alle folgenden Metriken sind CIRA-spezifische Entwürfe, keine Original-SYNTX-Operatoren.

|Nr.|Metrik                    |Definition                                                                                   |Ziel |
|---|--------------------------|---------------------------------------------------------------------------------------------|-----|
|1  |Reconstruction Distance   |Σ_{i∈D_det} w_i δ(a_i,r_i) / Σ_{i∈D_det} w_i                                                 |0    |
|2  |Relational Coherence      |erfüllte / auswertbare deklarierte Konsistenzbedingungen                                     |1    |
|3  |Temporal State Consistency|gültige / ausgewertete Übergänge                                                             |1    |
|4  |Functional Continuity     |Σ f(t)/N, f(t)∈{0,1} für abstrakte Servicefunktion                                           |1    |
|5  |Reconstruction Coverage   |                                                                                             |D_det|
|6  |Observation Completeness  |                                                                                             |D_obs|
|7  |GAP Detection Coverage    |TP/(TP+FN) für annotierte abstrakte Konsistenzfälle                                          |1    |
|8  |GAP Detection Precision   |TP/(TP+FP)                                                                                   |1    |
|9  |GAP Closure               |Anzahl aufgelöster ursprünglicher Konsistenzabweichungen / Anzahl ursprünglicher Abweichungen|1    |
|10 |Reconstruction Stability  |1−d(R1,R2) auf gemeinsamem bestimmten Attributraum                                           |1    |
|11 |Reconstruction Accuracy   |1−Reconstruction Distance                                                                    |1    |

Alle Werte in [0,1]. Bei Stability zusätzlich gemeinsame Coverage berichten. Bei Closure neu entstandene Inkonsistenzen separat berichten. Nicht auswertbare Regeln/Übergänge separat zählen. Zeitaggregation: Rohzähler und Nenner erhalten; gepoolte Quotienten aus Summen, zeitliche Mittel nur explizit gekennzeichnet. Kein Gesamtindex beschlossen. GAP-Matching und kanonische Relationsidentität sind noch zu spezifizieren.

MetricResult: value: float|null, status: EVALUATED|UNDEFINED, unit, version, reference_space. Ergänzungsvorschlag: numerator, denominator und tick für Nachvollziehbarkeit.

Referenz-Fixture 04.11

|Attribut|Actual    |Observed|Reconstructed|
|--------|----------|--------|-------------|
|01      |NOMINAL   |NOMINAL |NOMINAL      |
|02      |NOMINAL   |NOMINAL |NOMINAL      |
|03      |DEGRADED  |DEGRADED|DEGRADED     |
|04      |ACTIVE    |ACTIVE  |ACTIVE       |
|05      |CLOSED    |CLOSED  |CLOSED       |
|06      |NOMINAL   |NOMINAL |NOMINAL      |
|07      |STANDBY   |UNKNOWN |STANDBY      |
|08      |NOMINAL   |UNKNOWN |FAULTY       |
|09      |AUTHORIZED|UNKNOWN |undetermined |
|10      |CRITICAL  |UNKNOWN |undetermined |

Erwartet: C_obs=0.60, C_rec=0.80, A_R=0.875, d_R=0.125, undetermined_count=2. Dies sind rechnerische Fixture-Werte, keine Engine-Messung. Separate Fixtures für die sieben übrigen Metriken und alle Nullnennerfälle erstellen.

05 — Field Coupling and Access

|Quelle|Ziel       |Vertrag                                                               |
|------|-----------|----------------------------------------------------------------------|
|F01   |F03/F04/F07|TopologyDefinition / ObservableTopologyDefinition / TopologyProjection|
|F02   |F03/F04/F07|GovernanceDefinition / ObservableRules / GovernanceProjection         |
|F03   |F04/F06/F07|ActualState / ReferenceState / StateProjection                        |
|F04   |F05/F06/F07|ObservationBundle / ObservationRecord / ObservationProjection         |
|F05   |F06/F07    |ReconstructionResult / SweepTrace                                     |
|F06   |F07        |EvaluationReport                                                      |

Jede Kopplung enthält Run-ID, Schema-Version, Zeitreferenz und Provenienz. Steuerungsfluss: initialisieren → Definitionen laden → synthetische Zustände → Beobachtung → unabhängige Sweeps → Zusammenführung → Evaluation → Visualisierung → Export.

|Feld|Ω_A         |Ω_O         |Ω_R         |
|----|------------|------------|------------|
|F03 |erzeugt     |—           |—           |
|F04 |liest       |erzeugt     |—           |
|F05 |—           |liest       |erzeugt     |
|F06 |liest       |liest       |liest       |
|F07 |visualisiert|visualisiert|visualisiert|

F05 darf emulator und ActualState weder importieren noch referenzieren. Auch indirekte Übergabe über generische Payloads, UI oder Evaluationsberichte ist auszuschließen. Architekturtest CIRA-T04b ab Phase 03. Gemeinsame neutrale Vertragsmodule sind zulässig.

06 — Forward / Inverse Reconstruction and GAP Register

Bisherige Vorwärtsrekonstruktion: Felder → Träger/Relationen → Verträge → Provenienz/Versionierung → Experimentidentität → Evaluation/Reproduzierbarkeit → Selbstrekonstruktion.

Inverse Zielkonfiguration: ausführbar, reproduzierbar, evaluierbar, nachvollziehbar, visualisierbar. Voraussetzungen: implementierte Komponenten, versionierte Eingaben, deterministischer Emulator, getrennte Referenzräume, stabile IDs, serialisierbare Projektionen. Integrationsalternativen API, lokal, Import/Export bleiben offen.

|GAP                        |Felder |Entwurfsschließung                          |
|---------------------------|-------|--------------------------------------------|
|G01 Experimentidentität    |F03–F07|Run-ID                                      |
|G02 Zustandsreferenzen     |alle   |kanonische IDs                              |
|G03 Schema-Versionierung   |alle   |versionierte Verträge                       |
|G04 Zustandsraumvermischung|F03–F06|getrennte Typen und Zugriffsmatrix          |
|G05 Engine-Schnittstelle   |F04/F05|Adaptervertrag                              |
|G06 Sweep-Vermischung      |F05    |separate Result-Typen                       |
|G07 Nullnenner             |F06    |UNDEFINED                                   |
|G08 Kontextprovenienz      |F04/F05|Source-Reference-Register                   |
|G09 Replay                 |F03    |versionierte Experimentdefinition           |
|G10 Ergebnisversionierung  |F05/F06|unveränderliche Ergebnisartefakte           |
|G11 UI-Zeitreferenz        |F07    |gemeinsamer Tick-Selektor                   |
|G12 Export                 |F03–F07|ExperimentBundle                            |
|G13 Terminierung           |F05    |TerminationRecord                           |
|G14 Delta-Unterscheidung   |F05/F06|DeltaState und DeltaCoupling                |
|G15 Engine-Verfügbarkeit   |F05    |offene reale Schnittstelle, Adaptervarianten|

G01–G14 sind Entwurfsschließungen, keine implementierten oder getesteten Schließungen. G15 bleibt offen. Der ursprüngliche vollständige Original-Dual-Sweep wurde nicht abgeschlossen: Referenzrückgabe war abgeschnitten; vollständige Operator- und Σ-Zuordnung steht aus. Die obige Rekonstruktion ist die bisherige Architekturarbeit.

07 — Contracts and Repository

Single Source of Truth: Pydantic v2 → backend/scripts/export_schemas.py → contracts/*.schema.json → generierte TypeScript-Typen. Keine manuell gepflegten Doppel-Schemas. ConfigDict(extra=‘forbid’, strict=True, frozen=True); verschachtelte Strukturen ebenfalls unveränderlich gestalten. JSON-Roundtrip testen. JSON-Schemas mit $schema, type, properties, required und $defs soweit erforderlich.

ArtifactEnvelope: schema_version, experiment_id, artifact_id, artifact_type, revision, tick, provenance, payload. Provenienz: source_field, source_refs, producer_version. Typisierte Payloads statt beliebiger Dictionaries. Ergebnisstatus CREATED, RUNNING, COMPLETED, PARTIAL, FAILED, BLOCKED. Inhaltliche Offenheit separat vom Ausführungsstatus speichern.

syntx-cira/

  

  contracts/
  synthetic_fixtures/
  backend/
    app/{contracts,topology,governance,emulator,observation,syntx_adapter,metrics,experiments,api}/

    

    tests/
  frontend/src/{components,views,contracts,state,api}/
  experiments/

  

  # FCSD arXiv Submission Package
  
  ## Field Coherence Stress Diagnosis - LaTeX Source
  
  -----
  
  ## 📦 PACKAGE CONTENTS
  
  fcsd_latex/
  ├── main.tex              # Main LaTeX document
  ├── references.bib        # BibTeX references
  ├── README.txt           # This file
  └── figures/             # PUT YOUR 4 PNG FILES HERE
  ├── figure1.png      # Processing Layer Comparison
  ├── figure2.png      # Policy Distribution
  ├── figure3.png      # Stress vs Policy
  └── figure4.png      # Cross-Model Density
  
  -----
  
  ## ⚙️ COMPILATION INSTRUCTIONS
  
  ### Local Compilation (if you have LaTeX installed):
  
  1. Make sure all 4 figures are in the figures/ folder
  1. Run these commands:
     
     
  
     bibtex main
  
     
     
  
  ### Online Compilation (no LaTeX installation needed):
  
  1. Go to: <https://www.overleaf.com>
  1. Create free account
  1. Upload main.tex + references.bib
  1. Create figures/ folder
  1. Upload your 4 PNG files
  1. Click “Recompile”
  1. Download PDF
  
  -----
  
  ## 🚀 ARXIV SUBMISSION
  
  ### Option A: Submit PDF Only (QUICKEST)
  
  1. Compile main.tex to get main.pdf
  1. Go to: <https://arxiv.org/submit>
  1. Upload main.pdf
  1. Upload 4 figures as “additional files”
  1. Upload your 3 supplementary PDFs (GPT-5.2, GPT-5.3, Cross-Model)
  1. Submit
  
  ### Option B: Submit LaTeX Source (PROFESSIONAL)
  
  1. Create submission package:
  - Put main.tex + references.bib in a folder
  - Put all 4 figures in figures/ subfolder
  - Create .tar.gz:
    tar -czf fcsd_submission.tar.gz main.tex references.bib figures/
  1. Go to: <https://arxiv.org/submit>
  1. Upload fcsd_submission.tar.gz
  1. Upload your 3 supplementary PDFs separately
  1. Submit
  
  -----
  
  ## 📝 ARXIV METADATA
  
  When submitting, use:
  
  Title:
  Field Coherence Stress Diagnosis (FCSD): A Structural Evaluation
  Framework for Socio-Affective Drift in Large Language Models
  
  Author:
  Ottavio Braun
  
  Affiliation:
  SYNTX Research, Berlin, Germany
  
  Primary Category: cs.CL (Computation and Language)
  Secondary Category: cs.AI (Artificial Intelligence)
  
  Comments:
  13 pages, 4 figures, 5 appendices. Supplementary materials include
  full stress test results for GPT-5.2, GPT-5.3, and cross-model analysis.
  
  Abstract:
  [Copy from main.tex]
  
  -----
  
  ## ✅ PRE-SUBMISSION CHECKLIST
  
  □ All 4 figures present in figures/ folder
  □ Figures correctly named (figure1.png, figure2.png, etc.)
  □ main.tex compiles without errors
  □ PDF looks correct (check all figures appear)
  □ References appear in bibliography
  □ Appendices all present (A-E)
  □ Supplementary PDFs ready (GPT-5.2, GPT-5.3, Cross-Model)
  
  -----
  
  ## 🔧 TROUBLESHOOTING
  
  **Error: “File figure1.png not found”**
  → Make sure figures are in figures/ subfolder
  
  **Error: “Undefined references”**
  → Run bibtex, then pdflatex twice more
  
  **Figures not appearing in PDF**
  → Check file names match exactly (case-sensitive)
  
  **Bibliography empty**
  
  
  
  -----
  
  ## 📧 SUPPORT
  
  If you need help:
  
  - Check arXiv help: <https://info.arxiv.org/help/submit.html>
  - LaTeX questions: <https://tex.stackexchange.com>
  
  -----
  
  GOOD LUCK WITH YOUR SUBMISSION! 🚀
  
  -----
  
  Created: March 2026
  Author: Ottavio Braun
  SYNTX Research, Berlin

Stack: Python, FastAPI, Pydantic v2, React, TypeScript, Vite, Tailwind CSS, SVG, JSON/JSONL, Docker Compose, pytest, Vitest.

API: GET /health; GET /scenarios; POST /experiments; GET /experiments/{experiment_id}; GET /experiments/{experiment_id}/observations; GET /experiments/{experiment_id}/results; GET /experiments/{experiment_id}/metrics; GET /experiments/{experiment_id}/export. Claude soll vollständige Request/Response-Verträge und Fehlersemantik entwerfen.

08 — Testing and Implementation Phases

|Test|Akzeptanzbedingung                                  |
|----|----------------------------------------------------|
|T01 |gültige Topologie; ungültige Referenzen zurückweisen|
|T02 |verlustfreier JSON-Roundtrip und Schemaexport       |
|T03 |identische synthetische Replay-Ergebnisse           |
|T04 |getrennte Zustandsmodelle                           |
|T04b|F05 ohne ActualState-/Emulator-Abhängigkeit         |
|T05 |Adapter-Vertragstreue                               |
|T06 |auflösbare Quellenreferenzen                        |
|T07 |elf Metriken, Referenz-Fixtures, Nullnenner         |
|T08 |unabhängige Sweep-Artefakte                         |
|T09 |konsistente UI-Zeit- und Run-Referenzen             |
|T10 |vollständiger Experimentexport-Roundtrip            |
|T11 |dokumentierte Regressionen                          |
|T12 |dokumentierte Terminierung                          |

Alle Tests derzeit NOT_EXECUTED. Fixture-Ergebnisse sind keine Engine-Ergebnisse.

1. Phase 01: Contracts, Schemaexport, F01/F02-Modelle, F06 mit elf Metriken, abstrakte Fixtures, T01/T02/T04/T07. Kein Emulator, keine Engine-Anbindung, kein Frontend.
2. Phase 02: F03/F04, deterministischer Replay, Beobachtung, T03/T06.
3. Phase 03: F05-Adapter, Dual-Sweep-Integration, FastAPI, T04b/T05/T08/T10/T12.
4. Phase 04: F07 React-Frontend, synchronisierte Experiment- und Tick-Auswahl, T09.
5. Phase 05: Integration, Regression T11, Docker Compose, Jury-Release.

Jede Phase liefert Code, tatsächliche Testergebnisse und dokumentierte offene Abhängigkeiten zur SYNTX-Validierung. Erst danach folgt die nächste Phase.

09 — Experiment and Demonstration

ExperimentBundle enthält Topologie, Governance, Initialzustand, Szenarioversion, Beobachtungen, getrennte Sweep-Ergebnisse, Metriken und Provenienz. Replay reproduziert die synthetische Zustandserzeugung; externe Engine-Ausgaben werden als versionierte Artefakte erhalten. Die Jury-Demo zeigt Actual, Observable und Reconstructed State, Zeitnavigation, unabhängige Sweep-Traces, mathematische Evaluation und Export. Abstrakte Baseline- und Wiederherstellungs-Fixtures vergleichen. Illustrative UI-Werte und tatsächliche Messwerte eindeutig unterscheiden.

10 — Architecture Decision and Validation Handoff

Beschlossen bzw. im bisherigen Entwurf festgelegt: sieben Felder, drei Zustandsräume, elf Metriken, Pydantic-Vertragspipeline, Zugriffsmatrix, fünf Implementierungsphasen, lokaler Stack. Noch offen: vollständige Originaloperator-Zuordnung, externe Engine-Schnittstelle, vollständige Schemas, GAP-Matching, detaillierte Metrik-Fixtures, tatsächliche Tests. Die genaue Implementierungsarchitektur soll Claude jetzt selbst rekonstruieren.

Claude liefert ein separates Architekturartefakt mit Requirement-to-Component-Mapping, Entscheidungsregister, offenen Punkten und konkreter Implementierungsreihenfolge. SYNTX untersucht anschließend dieses Artefakt vorwärts und invers, vergleicht die Feldrelationen mit dieser Referenz und dokumentiert GAPs und deren Schließung. Keine Implementierungsfreigabe vor dieser gemeinsamen Validierung.