# Terminology (generated)

> Generated from `frontend/semiontics/cira.terms.yaml`. Do not edit.

| TERM | internal | EN | DE | meaning |
|---|---|---|---|---|
| `product.name` | SYNTX :: CIRA | CIRA | CIRA | product identity |
| `product.tagline` | Structural Cognition and Resilience Engineering Architecture | Structural reconstruction under controlled information | Strukturelle Rekonstruktion unter kontrollierter Information | research subject (REF 01) |
| `product.env` | synthetic service lab | Synthetic service lab — no real sites or infrastructure | Synthetisches Service-Labor — keine realen Standorte oder Infrastrukturen | REQ-080 |
| `layer.f01` | F01_DOMAIN_TOPOLOGY | Topology | Topologie | system layer |
| `layer.f02` | F02_GOVERNANCE | Rules & roles | Regeln & Rollen | system layer |
| `layer.f03` | F03_EMULATOR | Scenario emulator | Szenario-Emulator | system layer |
| `layer.f04` | F04_OBSERVATION | Observation | Beobachtung | system layer |
| `layer.f05` | F05_SYNTX_ENGINE | Reconstruction engine | Rekonstruktions-Engine | system layer |
| `layer.f06` | F06_METRICS | Evaluation | Auswertung | system layer |
| `layer.f07` | F07_INTERFACE | Workspace | Arbeitsoberfläche | system layer |
| `layer.generic` | system field | System layer | Systemschicht | replaces 'field' in the interface |
| `space.a` | Ω_A | Reference state · Ω_A | Referenzzustand · Ω_A | synthetic ground truth |
| `space.a.short` | Ω_A | Reference | Referenz | column heading |
| `space.a.hint` | — | Synthetic ground truth — never visible to the engine | Synthetische Grundwahrheit — für die Engine nie sichtbar | information barrier |
| `space.o` | Ω_O | Observed state · Ω_O | Beobachteter Zustand · Ω_O | mediated by θ |
| `space.o.short` | Ω_O | Observed | Beobachtet | column heading |
| `space.o.hint` | — | What the observation window reveals | Was das Beobachtungsfenster zeigt |  |
| `space.r` | Ω_R | Reconstructed state · Ω_R | Rekonstruierter Zustand · Ω_R | result of reconstruction |
| `space.r.short` | Ω_R | Reconstructed | Rekonstruiert | column heading |
| `space.r.hint` | — | Determined by the engine from observations only | Von der Engine nur aus Beobachtungen bestimmt | Ω_R(t) = R(Ω_O(0:t)) |
| `obs.known` | KNOWN | Observed | Beobachtet | value from an active source |
| `obs.known.stale` | KNOWN stale | Observed · delayed (t={k}) | Beobachtet · verzögert (t={k}) | known delayed value, not an error |
| `obs.unknown` | UNKNOWN | Not observed | Nicht beobachtet | no active source value; neither false nor absent |
| `obs.outside` | node outside θ | Outside observation window | Außerhalb des Beobachtungsfensters | not part of the observable topology |
| `app.applicable` | APPLICABLE | Applicable | Anwendbar | declared applicable |
| `app.na` | NOT_APPLICABLE | Not applicable | Nicht anwendbar | from declaration, not counted |
| `rec.determined` | DETERMINED | Reconstructed | Rekonstruiert | determined value with knowledge class |
| `rec.undetermined` | UNDETERMINED | Not determined | Nicht bestimmt | engine did not fix a value |
| `avail.available` | AVAILABLE | Available | Verfügbar | content present |
| `avail.none` | NOT_AVAILABLE_AT_TICK | No reconstruction at t={t} | Keine Rekonstruktion bei t={t} | no sweep at this tick, regular state |
| `dev.mismatch` | δ(a,r) = 1 | Differs from reference | Weicht vom Referenzwert ab | delivered by the server (K-63) |
| `rule.true` | TRUE | Satisfied | Erfüllt | g_j = 1 |
| `rule.false` | FALSE | Violated | Verletzt | g_j = 0 |
| `rule.unevaluable` | UNEVALUABLE | Not evaluable · ⊥ | Nicht auswertbar · ⊥ | g_j = ⊥, always with reason |
| `rule.reason.ok` | OK | evaluated | ausgewertet | EvalReason |
| `rule.reason.unknown_input` | UNKNOWN_INPUT | input not observed | Eingabe nicht beobachtet | EvalReason |
| `rule.reason.undetermined_input` | UNDETERMINED_INPUT | input not determined | Eingabe nicht bestimmt | EvalReason |
| `rule.reason.na_input` | NOT_APPLICABLE_INPUT | input not applicable | Eingabe nicht anwendbar | EvalReason |
| `rule.reason.requirement` | REQUIREMENT_NOT_MET | prerequisite rule not satisfied | Voraussetzungsregel nicht erfüllt | EvalReason |
| `rule.kind.state` | STATE | State rule | Zustandsregel | RuleKind |
| `rule.kind.transition` | TRANSITION | Transition rule | Übergangsregel | RuleKind |
| `rule.kind.function` | FUNCTION | Service function | Servicefunktion | RuleKind |
| `exec.created` | CREATED | Queued | Eingereiht | ExecutionStatus |
| `exec.running` | RUNNING | Running | Läuft | ExecutionStatus |
| `exec.completed` | COMPLETED | Completed | Abgeschlossen | ExecutionStatus |
| `exec.partial` | PARTIAL | Partially completed | Teilweise abgeschlossen | ExecutionStatus |
| `exec.failed` | FAILED | Failed | Fehlgeschlagen | ExecutionStatus |
| `exec.blocked` | BLOCKED | Blocked — dependency unavailable | Blockiert — Abhängigkeit nicht verfügbar | ExecutionStatus |
| `origin.synthetic` | SYNTHETIC | Synthetic | Synthetisch | emulator/observation |
| `origin.fixture` | FIXTURE | Test fixture — not an engine result | Testdaten — kein Engine-Ergebnis | P08 |
| `origin.engine` | ENGINE | Engine result | Engine-Ergebnis | real adapter only |
| `origin.imported` | IMPORTED | Imported result | Importiertes Ergebnis | schema-validated |
| `origin.illustrative` | ILLUSTRATIVE | Illustrative — not measured | Illustrativ — nicht gemessen | never as measurement |
| `origin.fixture.signet` | FIXTURE signet | TEST FIXTURE | TESTDATEN | achromatic signet text (INV-VIS-04) |
| `epi.src_obs` | SOURCE_OBSERVATION | From observation | Aus Beobachtung | EpistemicClass |
| `epi.src_stmt` | SOURCE_STATEMENT | From source statement | Aus Quellaussage | EpistemicClass |
| `epi.struct` | STRUCTURAL_DERIVATION | Structurally derived | Strukturell abgeleitet | EpistemicClass |
| `epi.hyp` | HYPOTHESIS | Hypothesis | Hypothese | EpistemicClass |
| `epi.open_ref` | OPEN_REFERENCE | Open reference | Offene Referenz | EpistemicClass |
| `cpl.effective` | EFFECTIVE | Active coupling | Wirksame Kopplung | CouplingStatus |
| `cpl.possible` | POSSIBLE | Possible coupling | Mögliche Kopplung | CouplingStatus |
| `cpl.unknown_open` | UNKNOWN_OPEN | Unknown — open | Unbekannt — offen | CouplingStatus |
| `cpl.absent` | ABSENT | No coupling | Keine Kopplung | CouplingStatus |
| `ref.resolved` | RESOLVED | Resolved | Aufgelöst | ReferenceStatus |
| `ref.unresolved` | UNRESOLVED | Unresolved | Nicht aufgelöst | ReferenceStatus |
| `ref.truncated` | TRUNCATED | Truncated | Abgeschnitten | ReferenceStatus |
| `ref.external` | EXTERNAL | External | Extern | ReferenceStatus |
| `run.reconstruction` | SweepRun | Reconstruction run | Rekonstruktionslauf |  |
| `run.forward` | FORWARD | Forward reconstruction | Vorwärtsrekonstruktion | without target |
| `run.inverse` | INVERSE | Target-guided reconstruction | Zielgeführte Rekonstruktion | with observation-based target |
| `run.merge` | MERGE | Combined reconstruction | Zusammengeführte Rekonstruktion | engine_first/v1 |
| `run.attempt` | attempt | Run {n} | Lauf {n} | attempt number |
| `run.stability` | STABILITY | Stability re-run | Stabilitäts-Wiederholung | same observation package |
| `run.no_target` | FORWARD target_ref = null | no target (by design) | kein Ziel (konstruktionsbedingt) | T08 |
| `run.adapter` | AdapterDescriptor | Adapter | Adapter |  |
| `run.context` | context_version | Context | Kontext |  |
| `run.steps` | steps_executed | {n} steps | {n} Schritte |  |
| `merge.conflict` | MergeConflict | Forward and target-guided results differ | Vorwärts- und zielgeführtes Ergebnis weichen ab |  |
| `merge.undetermined` | UNDETERMINED | left undetermined | nicht bestimmt belassen | MergeResolution |
| `merge.engine_resolved` | ENGINE_RESOLVED | Resolved by engine | Durch Engine aufgelöst | only with ENGINE or IMPORTED origin |
| `merge.engine_resolved.fixture` | ENGINE_RESOLVED + FIXTURE | Resolved in test fixture | In Testdaten aufgelöst | P08 (GK-20) |
| `term.converged` | CONVERGED | Converged | Konvergiert | TerminationReason |
| `term.engine_reported_stop` | ENGINE_REPORTED_STOP | Stopped by engine | Von Engine beendet | TerminationReason |
| `term.budget_exhausted` | BUDGET_EXHAUSTED | Budget exhausted | Budget erschöpft | TerminationReason |
| `term.truncated` | TRUNCATED | Output truncated | Ausgabe abgeschnitten | TerminationReason |
| `term.error` | ERROR | Error | Fehler | TerminationReason |
| `term.cancelled` | CANCELLED | Cancelled | Abgebrochen | TerminationReason |
| `term.label` | TerminationRecord | Termination | Terminierung |  |
| `target` | TargetDefinition | Reconstruction target | Rekonstruktionsziel | observation-based |
| `target.basis` | S-07 | based on observable structure only | nur auf beobachtbarer Struktur | S-07 |
| `target.met` | MET | Met | Erfüllt | TargetAssessment |
| `target.not_met` | NOT_MET | Not met | Nicht erfüllt | TargetAssessment |
| `target.undetermined` | UNDETERMINED | Not determined | Nicht bestimmt | TargetAssessment |
| `target.assessment` | target_assessment | Target assessment | Zielbewertung |  |
| `goal.rule_satisfied` | RULE_SATISFIED | rule satisfied | Regel erfüllt | GoalProperty |
| `goal.attribute_equals` | ATTRIBUTE_EQUALS | attribute equals | Attribut gleich | GoalProperty |
| `goal.gap_closed` | GAP_CLOSED | gap closed | Lücke geschlossen | GoalProperty |
| `gap.structural` | StructuralGap | Structural gap | Strukturelle Lücke | with source reference |
| `gap.open` | OPEN | Open | Offen |  |
| `gap.closed` | CLOSED_IN_RESULT | Closed in later result | In späterem Ergebnis geschlossen |  |
| `gap.open_relation` | OpenRelation | Open relation | Offene Relation |  |
| `gap.sources` | source_refs | sources | Quellen |  |
| `gap.subjects` | subject_refs | subjects | Subjekte |  |
| `gap.kind` | kind | engine kind | Engine-Art | engine label, datum |
| `match.tp` | TP | Matched | Zugeordnet |  |
| `match.fn` | FN | Missed case | Verfehlter Fall |  |
| `match.fp` | FP | Unmatched detection | Nicht zugeordnete Erkennung |  |
| `match.subset.all` | ALL | All cases | Alle Fälle |  |
| `match.subset.observable` | OBSERVABLE_CASES | Observable cases only | Nur beobachtbare Fälle |  |
| `match.by_group` | class_key | By node group | Nach Knotengruppe |  |
| `match.matcher` | gap_matcher | Matching | Zuordnung |  |
| `proposal` | RecoveryProposal | Recovery proposal | Wiederherstellungsvorschlag | never applied automatically |
| `proposal.status` | PROPOSED | proposed | vorgeschlagen |  |
| `authority` | AuthorityRecord | Authorization decision | Autorisierungsentscheidung | human as authority |
| `authority.approved` | APPROVED | Approved | Genehmigt |  |
| `authority.rejected` | REJECTED | Rejected | Abgelehnt |  |
| `loop.recovery` | mediated recursion | Recovery loop via human authorization | Wiederherstellungsschleife über menschliche Autorisierung | 05.5 |
| `barrier` | Ω_A ↛ F05 | Information barrier — the engine never sees the reference state | Informationsbarriere — die Engine sieht den Referenzzustand nie | core invariant |
| `engine.field` | SigmaRef | Engine analysis field | Engine-Analysefeld | frame for datum |
| `engine.operator` | OperatorRef | Engine operator | Engine-Operator | frame for symbol or code |
| `engine.label_source` | label_from_source | engine label | Engine-Bezeichnung |  |
| `engine.label_unavailable` | LABEL_UNAVAILABLE | Label not yet provided by the engine registry | Bezeichnung noch nicht von der Engine-Registry geliefert | DEP-08 |
| `engine.code_opaque` | R/I code | Engine code — meaning not provided | Engine-Code — Bedeutung nicht geliefert | DEP-01 |
| `engine.trace` | SweepTrace | Trace | Verlauf |  |
| `engine.trace.independent` | — | independent of forward run | unabhängig vom Vorwärtslauf |  |
| `obs.setup` | ObservationConfig θ | Observation setup | Beobachtungskonfiguration |  |
| `obs.source` | ObservationSource | Source | Quelle |  |
| `obs.sources` | sources | Sources | Quellen |  |
| `obs.context` | ContextBundle | Observation context | Beobachtungskontext |  |
| `obs.budget` | bundle_budget | Context budget | Kontextbudget | bundle level (K-12) |
| `obs.budget.items` | observations | items | Einträge |  |
| `obs.budget.bytes` | bytes | bytes | Bytes |  |
| `obs.profile` | serialization_profile | Serialization profile | Serialisierungsprofil |  |
| `obs.revision` | revision | revision | Revision |  |
| `obs.continuous` | CONTINUOUS | Continuous | Durchgehend |  |
| `obs.interrupted` | INTERRUPTED | Interrupted | Unterbrochen |  |
| `obs.continuity` | Continuity | Continuity | Kontinuität |  |
| `obs.lag` | lag_ticks | lag {n} | Verzögerung {n} |  |
| `obs.list` | observations | Observations | Beobachtungen |  |
| `obs.projected` | ω(i,t) | projected state at t={t} | projizierter Zustand bei t={t} |  |
| `obs.no_source` | source_id = null | no source | keine Quelle |  |
| `obs.visible_nodes` | visible_nodes | Visible components | Sichtbare Komponenten |  |
| `obs.gap_at` | gaps | gap | Lücke |  |
| `stage.definitions` | DEFINITIONS | Load definitions | Definitionen laden | StageName |
| `stage.emulation` | EMULATION | Emulate scenario | Szenario emulieren | StageName |
| `stage.observation` | OBSERVATION | Observe | Beobachten | StageName |
| `stage.forward` | FORWARD | Forward reconstruction | Vorwärtsrekonstruktion | StageName |
| `stage.inverse` | INVERSE | Target-guided reconstruction | Zielgeführte Rekonstruktion | StageName |
| `stage.merge` | MERGE | Combine results | Ergebnisse zusammenführen | StageName |
| `stage.stability` | STABILITY | Stability re-run | Stabilitäts-Wiederholung | StageName |
| `stage.evaluation` | EVALUATION | Evaluate | Auswerten | StageName |
| `stage.export` | EXPORT | Export | Exportieren | StageName |
| `stage.pipeline` | StageEvents | Pipeline | Ablauf |  |
| `openness` | ContentOpenness | Open information | Offene Information | separate from execution status |
| `openness.undetermined` | undetermined | not determined | nicht bestimmt | ContentOpenness |
| `openness.unknown_observations` | unknown_observations | not observed | nicht beobachtet | ContentOpenness |
| `openness.open_references` | open_references | open references | offene Referenzen | ContentOpenness |
| `openness.open_relations` | open_relations | open relations | offene Relationen | ContentOpenness |
| `openness.structural_gaps_open` | structural_gaps_open | structural gaps open | offene strukturelle Lücken | ContentOpenness |
| `openness.unevaluable_rules` | unevaluable_rules | rules not evaluable | nicht auswertbare Regeln | ContentOpenness |
| `event.applied` | APPLIED | Applied | Angewendet |  |
| `event.rejected` | REJECTED | Not applied | Nicht angewendet | K-66 |
| `event.set_attribute` | SET_ATTRIBUTE | set attribute | Attribut setzen |  |
| `event.apply_approval` | APPLY_APPROVAL | apply approval | Freigabe anwenden |  |
| `scenario.baseline` | BASELINE | Baseline | Ausgangsszenario |  |
| `scenario.recovery` | RECOVERY | Recovery variant | Wiederherstellungsvariante |  |
| `cmp.compatible` | compatible | Comparable | Vergleichbar |  |
| `cmp.incompatible` | COMPARISON_INCOMPATIBLE | Not comparable | Nicht vergleichbar | K-43 |
| `cmp.resolved` | resolved | Resolved | Aufgelöst |  |
| `cmp.persisting` | persisting | Persisting | Bestehend |  |
| `cmp.unevaluable` | unevaluable_in_recovery | Not evaluable in recovery | In Wiederherstellung nicht auswertbar |  |
| `cmp.new` | new | New violation | Neue Verletzung |  |
| `cmp.lineage` | fixture_lineage_id | lineage | Herkunftslinie |  |
| `cmp.tau` | comparison_tick | τ | τ | comparison tick |
| `cmp.select` | GET /comparisons | Select comparison | Vergleich wählen |  |
| `cmp.none` | — | No comparison selected | Kein Vergleich gewählt |  |
| `cmp.basis` | closure_basis | basis: state rules, reference state, final step | Basis: Zustandsregeln, Referenzzustand, letzter Schritt | S-05 |
| `action.export` | action | Export bundle | Paket exportieren | control |
| `action.new` | action | New experiment | Neues Experiment | control |
| `action.resweep` | action | Re-run reconstruction | Rekonstruktion erneut ausführen | control |
| `action.import_result` | action | Import result | Ergebnis importieren | control |
| `action.replay` | action | Replay experiment | Experiment wiederholen | control |
| `action.import_bundle` | action | Import bundle | Paket importieren | control |
| `action.compare` | action | Compare scenarios | Szenarien vergleichen | control |
| `action.authorize` | action | Record authorization decision | Autorisierungsentscheidung erfassen | control |
| `action.reload` | action | Reload | Neu laden | control |
| `action.confirm` | action | Confirm | Bestätigen | control |
| `action.cancel` | action | Cancel | Abbrechen | control |
| `action.control` | action | Control | Steuerung | control |
| `action.close` | action | Close | Schließen | control |
| `action.resume_demo` | action | Resume demo | Demo fortsetzen | control |
| `action.next` | action | Next | Weiter | control |
| `action.previous` | action | Previous | Zurück | control |
| `action.authorize.readonly` | D-49 | Read-only in this version | In dieser Version nur lesend | D-49 |
| `action.failed` | ui | Command not accepted | Befehl nicht angenommen | command rejected without a catalogued error code |
| `action.summary` | — | Summary | Zusammenfassung |  |
| `action.accepted` | 202 | Accepted — running | Angenommen — läuft |  |
| `export.hash` | bundle_hash | Bundle hash (from server) | Paket-Hash (vom Server) |  |
| `msg.unavailable` | VIEW_DATA_UNAVAILABLE | Data for this time step could not be verified. Reload. | Daten für diesen Zeitschritt konnten nicht verifiziert werden. Neu laden. | quarantine |
| `msg.requested` | requested | requested | angefragt |  |
| `msg.received` | received | received | erhalten |  |
| `msg.undefined.zero` | ZERO_DENOMINATOR | Undefined — nothing to measure (0 / 0) | Undefiniert — nichts zu messen (0 / 0) | never 0 |
| `msg.undefined.missing` | INPUT_MISSING | Undefined — input not available | Undefiniert — Eingabe nicht verfügbar | never 0 |
| `msg.no_composite` | REQ-049 | No overall score — each metric stands for itself | Kein Gesamtwert — jede Metrik steht für sich | REQ-049 |
| `msg.viewport` | min viewport | This workspace needs at least 1280 × 720. | Diese Arbeitsoberfläche benötigt mindestens 1280 × 720. |  |
| `msg.loading` | LOADING | Loading | Lädt |  |
| `msg.select_experiment` | #9 | Select an experiment | Experiment wählen |  |
| `msg.unknown_focus` | focus | Focused element is not part of this view | Fokussiertes Element ist nicht Teil dieser Sicht |  |
| `msg.no_data` | — | No entries | Keine Einträge |  |
| `msg.fixture_note` | DEP-02 | Measured on test fixtures — engine connection pending | Gemessen auf Testdaten — Engine-Anbindung ausstehend | G05.1 |
| `prov.drawer` | Provenance Drawer | Provenance | Herkunft |  |
| `prov.technical` | Raw Contract Fields | Technical record | Technischer Datensatz | raw values only here |
| `prov.header` | ProjectionHeader | Header | Kopf |  |
| `prov.sources` | source_refs | Sources | Quellen |  |
| `prov.strategies` | strategies | Strategies | Strategien |  |
| `prov.experiment` | experiment_id | experiment | Experiment |  |
| `prov.schema` | schema_version | schema | Schema |  |
| `prov.origin` | data_origin | origin | Herkunft |  |
| `prov.guard` | guard_class | guard | Prüfklasse |  |
| `view.01` | SYSTEM_FIELD_OVERVIEW | System overview | Systemübersicht | ViewId |
| `view.02` | TOPOLOGY_GRAPH | Topology | Topologie | ViewId |
| `view.03` | TEMPORAL_STATE_EXPLORER | State comparison | Zustandsvergleich | ViewId |
| `view.04` | OBSERVATION_INSPECTOR | Observation details | Beobachtungsdetails | ViewId |
| `view.05` | FORWARD_SWEEP_INSPECTOR | Forward reconstruction | Vorwärtsrekonstruktion | ViewId |
| `view.06` | INVERSE_SWEEP_INSPECTOR | Target-guided reconstruction | Zielgeführte Rekonstruktion | ViewId |
| `view.07` | STRUCTURAL_GAP_INSPECTOR | Structural gaps | Strukturelle Lücken | ViewId |
| `view.08` | ARCHITECTURAL_CLOSURE_INSPECTOR | Closure & recovery | Schließung & Wiederherstellung | ViewId |
| `view.09` | STRUCTURAL_METRICS | Metrics | Metriken | ViewId |
| `view.10` | SCENARIO_COMPARISON | Scenario comparison | Szenariovergleich | ViewId |
| `view.11` | EVENT_TIMELINE | Timeline | Zeitleiste | ViewId |
| `metric.m01` | M01 | Reconstruction distance | Rekonstruktionsdistanz | metric name |
| `metric.m01.explain` | M01 | Share of reconstructed attributes that differ from the reference (weighted). Target 0. | Anteil rekonstruierter Attribute, die vom Referenzwert abweichen (gewichtet). Ziel 0. | relation named exactly |
| `metric.m02` | M02 | Relational coherence | Relationale Kohärenz | metric name |
| `metric.m02.explain` | M02 | Share of evaluable state rules that are satisfied, per state. | Anteil auswertbarer Zustandsregeln, die erfüllt sind, je Zustand. | relation named exactly |
| `metric.m03` | M03 | Temporal state consistency | Zeitliche Zustandskonsistenz | metric name |
| `metric.m03.explain` | M03 | Share of evaluable transitions between consecutive steps that are valid. | Anteil auswertbarer Übergänge zwischen aufeinanderfolgenden Schritten, die gültig sind. | relation named exactly |
| `metric.m04` | M04 | Functional continuity | Funktionale Kontinuität | metric name |
| `metric.m04.explain` | M04 | Share of time steps in which a service function holds. | Anteil der Zeitschritte, in denen eine Servicefunktion gilt. | relation named exactly |
| `metric.m05` | M05 | Reconstruction coverage | Rekonstruktionsabdeckung | metric name |
| `metric.m05.explain` | M05 | Share of applicable attributes the engine determined. | Anteil anwendbarer Attribute, die die Engine bestimmt hat. | relation named exactly |
| `metric.m06` | M06 | Observation completeness | Beobachtungsvollständigkeit | metric name |
| `metric.m06.explain` | M06 | Share of applicable attributes that are observed. | Anteil anwendbarer Attribute, die beobachtet sind. | relation named exactly |
| `metric.m07` | M07 | Gap detection coverage | Lückenerkennungsabdeckung | metric name |
| `metric.m07.explain` | M07 | Share of annotated consistency cases the engine detected. | Anteil annotierter Konsistenzfälle, die die Engine erkannt hat. | relation named exactly |
| `metric.m08` | M08 | Gap detection precision | Lückenerkennungspräzision | metric name |
| `metric.m08.explain` | M08 | Share of detected gaps that match an annotated case. | Anteil erkannter Lücken, die einem annotierten Fall entsprechen. | relation named exactly |
| `metric.m09` | M09 | Gap closure | Lückenschließung | metric name |
| `metric.m09.explain` | M09 | Share of baseline violations resolved in the recovery variant. | Anteil der Verletzungen des Ausgangsszenarios, die in der Wiederherstellungsvariante aufgelöst sind. | relation named exactly |
| `metric.m10` | M10 | Reconstruction stability | Rekonstruktionsstabilität | metric name |
| `metric.m10.explain` | M10 | Agreement of two runs on the same observations. | Übereinstimmung zweier Läufe auf denselben Beobachtungen. | relation named exactly |
| `metric.m11` | M11 | Reconstruction accuracy | Rekonstruktionsgenauigkeit | metric name |
| `metric.m11.explain` | M11 | 1 − reconstruction distance. Target 1. | 1 − Rekonstruktionsdistanz. Ziel 1. | relation named exactly |
| `metric.target` | target_value | target {v} | Ziel {v} |  |
| `metric.value` | MetricResult | Exact value | Exakter Wert |  |
| `metric.undefined` | UNDEFINED | Undefined | Undefiniert |  |
| `metric.band.observation` | band 1 | Observation (reference vs observed) | Beobachtung (Referenz gegen Beobachtung) |  |
| `metric.band.reconstruction` | band 2 | Reconstruction (reference × reconstructed) | Rekonstruktion (Referenz × Rekonstruktion) |  |
| `metric.band.gaps` | band 3 | Gaps · stability · closure | Lücken · Stabilität · Schließung |  |
| `metric.m11_is` | — | M11 = 1 − M01 | M11 = 1 − M01 | explanatory text, not a computation |
| `metric.fixture_deterministic` | S-06 | fixture: deterministic | Testdaten: deterministisch | M10 with FixtureAdapter |
| `metric.closure_in_comparison` | M09 | Gap closure is measured in a scenario comparison | Die Lückenschließung wird im Szenariovergleich gemessen |  |
| `aux.undetermined_count` | undetermined_count | not determined | nicht bestimmt | MetricAux |
| `aux.hypotheses_excluded` | hypotheses_excluded | hypotheses excluded | ausgeschlossene Hypothesen | MetricAux |
| `aux.unevaluable_count` | unevaluable_count | not evaluable | nicht auswertbar | MetricAux |
| `aux.not_in_validity` | not_in_validity | not in validity | außerhalb der Gültigkeit | MetricAux |
| `aux.stale_known` | stale_known | delayed observations | verzögerte Beobachtungen | MetricAux |
| `aux.tp` | tp | matched | zugeordnet | MetricAux |
| `aux.fp` | fp | unmatched | nicht zugeordnet | MetricAux |
| `aux.fn` | fn | missed | verfehlt | MetricAux |
| `aux.observable_cases` | observable_cases | observable cases | beobachtbare Fälle | MetricAux |
| `aux.shared_coverage` | shared_coverage | shared coverage | gemeinsame Abdeckung | MetricAux |
| `aux.persisting` | persisting | persisting | bestehend | MetricAux |
| `aux.new_inconsistencies` | new_inconsistencies | new | neu | MetricAux |
| `aux.unevaluable_in_recovery` | unevaluable_in_recovery | not evaluable in recovery | in Wiederherstellung nicht auswertbar | MetricAux |
| `aux.ticks_excluded` | ticks_excluded | steps excluded | ausgeschlossene Schritte | MetricAux |
| `aux.ticks_included` | ticks_included | steps included | einbezogene Schritte | MetricAux |
| `aux.function_ref` | function_ref | service function | Servicefunktion | MetricAux |
| `agg.pooled` | POOLED | pooled | gepoolt | Aggregation |
| `agg.per_tick` | PER_TICK | per step | je Schritt | Aggregation |
| `agg.time_mean` | TIME_MEAN_EXPLICIT | explicit time mean | expliziter Zeitmittelwert | Aggregation |
| `agg.label` | aggregation | aggregation | Aggregation |  |
| `agg.up_to` | to_tick | up to t={t} | bis t={t} |  |
| `relation.a` | A | Reference | Referenz | EvaluatedRelation |
| `relation.o` | O | Observed | Beobachtet | EvaluatedRelation |
| `relation.r` | R | Reconstructed | Rekonstruiert | EvaluatedRelation |
| `relation.a_o` | A_O | Reference vs observed | Referenz gegen Beobachtung | EvaluatedRelation |
| `relation.a_r` | A_R | Reference × reconstructed | Referenz × Rekonstruktion | EvaluatedRelation |
| `relation.annotation_r` | ANNOTATION_R | Annotation × reconstructed | Annotation × Rekonstruktion | EvaluatedRelation |
| `relation.r1_r2` | R1_R2 | Run 0 × run 1 | Lauf 0 × Lauf 1 | EvaluatedRelation |
| `relation.baseline_recovery` | BASELINE_RECOVERY | Baseline × recovery | Ausgangsszenario × Wiederherstellung | EvaluatedRelation |
| `space_kind.attribute` | ATTRIBUTE | attributes | Attribute | ReferenceSpaceKind |
| `space_kind.rule` | RULE | rules | Regeln | ReferenceSpaceKind |
| `space_kind.transition` | TRANSITION | transitions | Übergänge | ReferenceSpaceKind |
| `space_kind.tick` | TICK | steps | Schritte | ReferenceSpaceKind |
| `space_kind.case` | CASE | cases | Fälle | ReferenceSpaceKind |
| `space_kind.rule_key` | RULE_KEY | rule keys | Regelschlüssel | ReferenceSpaceKind |
| `ui.attribute` | ui | Attribute | Attribut | interface label |
| `ui.rules` | ui | Rules | Regeln | interface label |
| `ui.tick` | ui | t = {t} | t = {t} | interface label |
| `ui.tick_of` | ui | t = {t}/{n} | t = {t}/{n} | interface label |
| `ui.filter` | ui | Filter | Filter | interface label |
| `ui.filter.all` | ui | All | Alle | interface label |
| `ui.filter.changed` | ui | Changed | Geändert | interface label |
| `ui.filter.open` | ui | Open | Offen | interface label |
| `ui.filter.differs` | ui | Differs | Abweichend | interface label |
| `ui.show` | ui | Show | Zeigen | interface label |
| `ui.legend` | ui | Legend | Legende | interface label |
| `ui.values` | ui | Values | Werte | interface label |
| `ui.relations` | ui | Relations | Relationen | interface label |
| `ui.gaps` | ui | Gaps | Lücken | interface label |
| `ui.open_relations` | ui | Open relations | Offene Relationen | interface label |
| `ui.output` | ui | Output | Ausgabe | interface label |
| `ui.events` | ui | events | Ereignisse | interface label |
| `ui.reconstruction_step` | ui | reconstruction step | Rekonstruktionsschritt | interface label |
| `ui.step` | ui | Step | Schritt | interface label |
| `ui.seq` | ui | Seq | Seq | interface label |
| `ui.track` | ui | Track | Spur | interface label |
| `ui.type` | ui | Type | Art | interface label |
| `ui.status` | ui | Status | Status | interface label |
| `ui.effect` | ui | Effect | Wirkung | interface label |
| `ui.track.scenario` | ui | scenario | Szenario | interface label |
| `ui.track.pipeline` | ui | pipeline | Ablauf | interface label |
| `ui.tracks` | ui | tracks | Spuren | interface label |
| `ui.range` | ui | range t = {a} … {b} | Bereich t = {a} … {b} | interface label |
| `ui.compare_hint` | ui | Compare with target-guided result in Closure & recovery | Mit zielgeführtem Ergebnis in Schließung & Wiederherstellung vergleichen | interface label |
| `ui.prev_sweep` | ui | previous reconstruction step | vorheriger Rekonstruktionsschritt | interface label |
| `ui.next_sweep` | ui | next reconstruction step | nächster Rekonstruktionsschritt | interface label |
| `ui.configuration` | ui | Configuration | Konfiguration | interface label |
| `ui.quadrant.gaps` | ui | Gaps & relations | Lücken & Relationen | interface label |
| `ui.quadrant.disagreements` | ui | Disagreements & termination | Abweichungen & Terminierung | interface label |
| `ui.quadrant.recovery` | ui | Recovery loop (human authorization) | Wiederherstellungsschleife (menschliche Autorisierung) | interface label |
| `ui.quadrant.closure` | ui | Gap closure (comparison) | Lückenschließung (Vergleich) | interface label |
| `ui.open_in_comparison` | ui | Open in scenario comparison | Im Szenariovergleich öffnen | interface label |
| `ui.metric` | ui | Metric | Metrik | interface label |
| `ui.baseline` | ui | Baseline | Ausgangsszenario | interface label |
| `ui.recovery` | ui | Recovery variant | Wiederherstellungsvariante | interface label |
| `ui.vs` | ui | vs | gegen | interface label |
| `ui.strategies` | ui | strategies | Strategien | interface label |
| `ui.within_budget` | ui | within budget | innerhalb des Budgets | interface label |
| `ui.experiment` | ui | Experiment | Experiment | interface label |
| `ui.language` | ui | Language | Sprache | interface label |
| `ui.mode.presentation` | ui | Presentation | Präsentation | interface label |
| `ui.mode.standard` | ui | Standard | Standard | interface label |
| `ui.demo_step` | ui | Step {n}/{m} | Schritt {n}/{m} | interface label |
| `ui.nodes` | ui | components | Komponenten | interface label |
| `ui.component` | ui | Component | Komponente | interface label |
| `ui.relation.depends_on` | ui | depends on | hängt ab von | interface label |
| `ui.relation.reports_to` | ui | reports to | berichtet an | interface label |
| `ui.relation.provides` | ui | provides | stellt bereit | interface label |
| `ui.id` | ui | ID | ID | interface label |
| `ui.value` | ui | Value | Wert | interface label |
| `ui.class` | ui | Class | Klasse | interface label |
| `ui.source` | ui | Source | Quelle | interface label |
| `ui.observed_at` | ui | delayed t={k} | verzögert t={k} | interface label |
| `ui.run` | ui | Run | Lauf | interface label |
| `ui.goal` | ui | Goal | Ziel | interface label |
| `ui.subject` | ui | Subject | Subjekt | interface label |
| `ui.property` | ui | Property | Eigenschaft | interface label |
| `ui.engine_label` | ui | engine label | Engine-Bezeichnung | interface label |
| `ui.coupling` | ui | Coupling | Kopplung | interface label |
| `ui.pipeline_status` | ui | Pipeline | Ablauf | interface label |
| `ui.none` | ui | none | keine | interface label |
| `ui.count` | ui | {n} | {n} | interface label |
| `ui.weight` | ui | weight | Gewicht | interface label |
| `ui.members` | ui | Reference space | Referenzraum | interface label |
| `ui.numerator` | ui | numerator | Zähler | interface label |
| `ui.denominator` | ui | denominator | Nenner | interface label |
| `ui.case` | ui | Case | Fall | interface label |
| `ui.gap` | ui | Gap | Lücke | interface label |
| `ui.verdict` | ui | Verdict | Urteil | interface label |
| `ui.observable` | ui | observable | beobachtbar | interface label |
| `ui.not_observable` | ui | not observable | nicht beobachtbar | interface label |
| `ui.reason` | ui | Reason | Grund | interface label |
| `ui.message` | ui | Message | Meldung | interface label |
| `ui.forward_short` | ui | forward | vorwärts | interface label |
| `ui.inverse_short` | ui | target-guided | zielgeführt | interface label |
| `ui.adapter_fixture` | ui | test fixture adapter | Testdaten-Adapter | interface label |
| `ui.adapter_import` | ui | import adapter | Import-Adapter | interface label |
| `ui.adapter_local` | ui | local engine adapter | lokaler Engine-Adapter | interface label |
| `ui.adapter_api` | ui | engine API adapter | Engine-API-Adapter | interface label |
| `ui.scenario` | ui | Scenario | Szenario | interface label |
| `ui.observation_setup` | ui | Observation setup | Beobachtungskonfiguration | interface label |
| `ui.target` | ui | Target | Ziel | interface label |
| `ui.adapter` | ui | Adapter | Adapter | interface label |
| `ui.schedule` | ui | Schedule | Zeitplan | interface label |
| `ui.ticks` | ui | steps | Schritte | interface label |
| `schedule.final` | FINAL | final step | letzter Schritt | ScheduleMode |
| `schedule.every_tick` | EVERY_TICK | every step | jeder Schritt | ScheduleMode |
| `schedule.explicit` | EXPLICIT | explicit steps | ausgewählte Schritte | ScheduleMode |
| `replay.synthetic` | SYNTHETIC | synthetic replay | synthetische Wiederholung | ReplayMode |
| `replay.preserved` | PRESERVED_ENGINE | replay with preserved engine results | Wiederholung mit erhaltenen Engine-Ergebnissen | ReplayMode |
| `replay.identical` | IDENTICAL | Identical | Identisch |  |
| `replay.divergent` | DIVERGENT | Divergent | Abweichend |  |
| `adapter.fixture` | FIXTURE | test fixture adapter | Testdaten-Adapter | AdapterKind |
| `adapter.local` | LOCAL | local engine adapter | lokaler Engine-Adapter | AdapterKind |
| `adapter.api` | API | engine API adapter | Engine-API-Adapter | AdapterKind |
| `adapter.import` | IMPORT | import adapter | Import-Adapter | AdapterKind |
| `error.invalid_topology` | INVALID_TOPOLOGY | Invalid topology | Ungültige Topologie | ErrorCode |
| `error.invalid_rule` | INVALID_RULE | Invalid rule | Ungültige Regel | ErrorCode |
| `error.invalid_transition` | INVALID_TRANSITION | Invalid transition | Ungültiger Übergang | ErrorCode |
| `error.context_incomplete` | CONTEXT_INCOMPLETE | Observation context incomplete | Beobachtungskontext unvollständig | ErrorCode |
| `error.engine_unavailable` | ENGINE_UNAVAILABLE | Engine unavailable | Engine nicht verfügbar | ErrorCode |
| `error.metric_undefined` | METRIC_UNDEFINED | Metric undefined | Metrik undefiniert | ErrorCode |
| `error.view_data_unavailable` | VIEW_DATA_UNAVAILABLE | View data unavailable | Sichtdaten nicht verfügbar | ErrorCode |
| `error.schema_violation` | SCHEMA_VIOLATION | Request does not match the contract | Anfrage entspricht nicht dem Vertrag | ErrorCode |
| `error.not_found` | NOT_FOUND | Not found | Nicht gefunden | ErrorCode |
| `error.conflict` | CONFLICT | Conflict | Konflikt | ErrorCode |
| `error.access_violation` | ACCESS_VIOLATION | Access violation | Zugriffsverletzung | ErrorCode |
| `error.import_invalid` | IMPORT_INVALID | Import invalid | Import ungültig | ErrorCode |
| `error.comparison_incompatible` | COMPARISON_INCOMPATIBLE | Not comparable | Nicht vergleichbar | ErrorCode |
| `recovery.submit_valid_definition` | SUBMIT_VALID_DEFINITION | submit a valid definition | gültige Definition einreichen | RecoveryAction |
| `recovery.revert_to_version` | REVERT_TO_VERSION | revert to the last valid version | zur letzten gültigen Version zurückkehren | RecoveryAction |
| `recovery.replay_from_initial` | REPLAY_FROM_INITIAL | replay from the initial state | ab dem Initialzustand wiederholen | RecoveryAction |
| `recovery.reserialize` | RESERIALIZE | use the next serialization profile | nächstes Serialisierungsprofil verwenden | RecoveryAction |
| `recovery.resweep` | RESWEEP | re-run reconstruction | Rekonstruktion erneut ausführen | RecoveryAction |
| `recovery.import_result` | IMPORT_RESULT | import a result | Ergebnis importieren | RecoveryAction |
| `recovery.recompute` | RECOMPUTE | recompute | neu berechnen | RecoveryAction |
| `recovery.refetch` | REFETCH | reload | neu laden | RecoveryAction |
| `lang.en` | en | English | Englisch | Lang |
| `lang.de` | de | German | Deutsch | Lang |
| `mode.standard` | standard | Standard | Standard | Mode |
| `mode.presentation` | presentation | Presentation | Präsentation | Mode |
| `mode.presentation.frame` | SEM-036 | Presentation mode | Präsentationsmodus |  |
| `guard.timed` | TIMED | timed | timed | GuardClass (technical) |
| `guard.timeless` | TIMELESS | timeless | timeless | GuardClass (technical) |
| `guard.range` | RANGE | range | range | GuardClass (technical) |
| `guard.comparison` | COMPARISON | comparison | comparison | GuardClass (technical) |
| `guard.global` | GLOBAL | global | global | GuardClass (technical) |
| `reltype.depends_on` | depends_on | depends on | hängt ab von | RelationType |
| `reltype.reports_to` | reports_to | reports to | berichtet an | RelationType |
| `reltype.provides` | provides | provides | stellt bereit | RelationType |
| `metric.mid` | MetricId | {id} | {id} | metric id datum |
| `dir.forward` | FORWARD | Forward | Vorwärts |  |
| `dir.inverse` | INVERSE | Target-guided | Zielgeführt |  |
| `view_status.idle` | IDLE | Idle | Bereit |  |
| `view_status.loading` | LOADING | Loading | Lädt |  |
| `view_status.ready` | READY | Ready | Bereit |  |
| `view_status.unavailable` | VIEW_DATA_UNAVAILABLE | Data could not be verified | Daten nicht verifiziert |  |
| `focus` | SEM-034 | Focus | Fokus |  |
| `delta` | SEM-023 | Change | Änderung |  |
| `exec` | SEM-032 | Execution status | Ausführungsstatus |  |
| `epi` | SEM-018 | Knowledge class | Wissensklasse |  |
| `term` | SEM-029 | Termination | Terminierung |  |
| `obs.continuity.sem` | SEM-030 | Source continuity | Quellenkontinuität |  |
| `cpl` | SEM-037 | Coupling | Kopplung |  |
| `demo` | SEM-033 | Demo | Demo |  |
| `demo.1` | DemoStep | Three states of one synthetic system, and a barrier between them | Drei Zustände eines synthetischen Systems und eine Barriere dazwischen | narration |
| `demo.2` | DemoStep | The reference changes; the observation window sees it | Der Referenzzustand ändert sich; das Beobachtungsfenster sieht es | narration |
| `demo.3` | DemoStep | What the observation cannot see stays honestly open | Was die Beobachtung nicht sieht, bleibt ehrlich offen | narration |
| `demo.4` | DemoStep | The engine fills gaps from observations alone, and we see where it differs | Die Engine füllt Lücken nur aus Beobachtungen, und wir sehen, wo sie abweicht | narration |
| `demo.5` | DemoStep | Two independent reconstruction paths, each with its own trace | Zwei unabhängige Rekonstruktionswege mit je eigenem Verlauf | narration |
| `demo.6` | DemoStep | Exact fractions, no overall score | Exakte Brüche, kein Gesamtwert | narration |
| `demo.7` | DemoStep | A recovery variant, approved by a human, measured against the baseline | Eine von einem Menschen freigegebene Wiederherstellungsvariante, gemessen am Ausgangsszenario | narration |
| `demo.8` | DemoStep | Everything is exportable and reproducible | Alles ist exportierbar und reproduzierbar | narration |
| `demo.v1` | deep path | How do you know the engine is blind? | Woher weiß man, dass die Engine blind ist? | deep-dive path |
| `demo.v2` | deep path | Are these real results? | Sind das echte Ergebnisse? | deep-dive path |
| `demo.v3` | deep path | How exact is the evaluation? | Wie exakt ist die Auswertung? | deep-dive path |
| `demo.v4` | deep path | What happens with recovery proposals? | Was passiert mit Wiederherstellungsvorschlägen? | deep-dive path |
| `demo.v5` | deep path | Where are the gaps? | Wo sind die Lücken? | deep-dive path |
| `authority.pending` | PENDING | Pending | Ausstehend | Decision3 |
