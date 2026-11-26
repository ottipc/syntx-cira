# SYNTX :: CIRA — Systemic & Semiontic GUI Reference Architecture v1.0.0

| Metadatum | Wert |
| :--- | :--- |
| Artefakt | `SYNTX_CIRA_Systemic_Semiontic_GUI_Reference_Architecture_v1.0.0.md` |
| Version | `1.0.0` (Referenzarchitektur für `F07_INTERFACE`) |
| Bezugsbasis | Konsolidiertes CIRA-Architekturpaket v1.0.1 + `SYNTX_CIRA_GUI_Dual_Deep_Sweep_Report.md` |
| Gestaltungsrichtung | Dunkle, minimalistische, hochpräzise Forschungsoberfläche mit eigenständiger visueller SYNTX-Identität |
| Status | `READY FOR CLAUDE ARCHITECTURAL RECONSTRUCTION` |
| Execution Boundary | `ARCHITECTURE ONLY — NO CODE — NO IMPLEMENTATION RELEASE` |

---

## 00 — Identität, Gestaltungsdoktrin und Grundsatzregeln

Die Benutzeroberfläche `F07` von **SYNTX :: CIRA** ist kein kommerzielles Monitoring-Dashboard und keine dekorative Datenvisualisierung. Sie ist ein **epistemisches Forschungsinstrument** zur präzisen Inspektion struktureller Kognition, Zustandsraumtrennung und Resilienz-Metriken in einem vollständig synthetischen Service-Labor (`REQ-080`).

### Leitprinzipien der visuellen SYNTX-Identität
1. **Semiontische Vollbindung:** Kein visuelles Element (Farbe, Form, Strichart, Symbol, Bewegung, Raumposition) ist dekorativ. Jedes Zeichen kodiert exakt eine strukturelle Funktion, Zustandsrelation und Domänengrenze.
2. **Epistemische Ehrlichkeit:** Offenheit (`UNKNOWN`, `UNDETERMINED`, $\perp$, `UNDEFINED`, `OPEN`, `NOT_AVAILABLE_AT_TICK`) wird niemals als Fehler (`FALSE` / `FAILED`) eingefärbt und niemals als Leerstelle verborgen.
3. **Dreifache Raumtrennung (`P02`):** $\Omega_A$, $\Omega_O$ und $\Omega_R$ sind stets gleichzeitig über **Farbkanal**, **Geometrie** und **Raumposition** unterscheidbar (barrierefreie, farbunabhängige Redundanz).
4. **Provenienz-Sichtbarkeit (`P08`, `AK-09`):** `DataOrigin` (`FIXTURE`, `SYNTHETIC`, `ENGINE`, `IMPORTED`, `ILLUSTRATIVE`) ist kein Fußnoten-Detail, sondern ein strukturelles Trägerelement an jedem Datenblock und Messwert.
5. **Mathematische Exaktheit (`P05`, `REQ-049`):** Jede Metrik zeigt stets den exakten rationalen Bruch $n/d$ zusammen mit dem Dezimalwert und ihren `aux`-Zählern. Es existiert kein Gesamtindex.

---

## 01 — Systemische und Semiontische Formensprache

### 01.1 Farbarchitektur

Die Farbarchitektur beruht auf einer tiefen, ermüdungsfreien, achromatischen Dunkel-Skala (Obsidian-Graphit), auf der ausschließlich **semantisch gebundene** chromatische Signale erscheinen.

#### A. Neutrale Raum- und Trägerebenen (Surface & Ink)
| Token-ID | Hex-Wert | Strukturelle Funktion | Geltungsbereich |
| :--- | :--- | :--- | :--- |
| `col.surface.void` | `#090B0E` | Tiefste Hintergrundebene (App-Canvas, Graph-Hintergrund) | Globale Shell, Sicht 2 |
| `col.surface.field` | `#10141A` | Primäre Arbeitsfläche / Systemfeld-Container | Alle 11 Sichten |
| `col.surface.panel` | `#161C24` | Erhöhte Inspektionskarten, Tabellenköpfe, Drawer | Panels, Inspector Drawer |
| `col.surface.elevated` | `#1D2530` | Aktive Auswahl, Hover-Fokus, modale Bestätigungsrahmen | Interaktive Zeilen, Dialoge |
| `col.border.hairline` | `#242E3B` | Strukturelle 1px-Trennlinien, Raster | Tabellen, Panel-Grenzen |
| `col.border.strong` | `#39475A` | Betonte Feldgrenzen, aktive Konturen | Aktive Sichten, Fokus |
| `col.ink.primary` | `#E6EDF5` | Primäre Werte, Bezeichner, aktive Symbole | Global |
| `col.ink.secondary` | `#9AA8B8` | Strukturelle Labels, Sekundärdaten, Achsen | Global |
| `col.ink.muted` | `#5F6E80` | Inaktive Elemente, `NOT_APPLICABLE`, `NOT_AVAILABLE_AT_TICK` | Global |

#### B. Disjunkte Zustandsraumfarben (`P02`, `T04`)
| Token-ID | Hex-Wert | Zustandsraum | Semantische Bindung | Ausschlussregel |
| :--- | :--- | :--- | :--- | :--- |
| `col.space.actual` | `#38BDF8` | $\Omega_A$ (Actual State) | Synthetische Grundwahrheit / Referenz (`F03`) | Nie für $\Omega_O$, $\Omega_R$ oder Erfolg verwenden |
| `col.space.observed` | `#F59E0B` | $\Omega_O$ (Observed State) | Vermitteltes Beobachtungsfenster (`F04`, $\Theta$) | Nie für Warnungen oder `FAILED` verwenden |
| `col.space.reconstructed` | `#A78BFA` | $\Omega_R$ (Reconstructed State) | Dual-Sweep-Rekonstruktion (`F05`) | Nie für $\Omega_A$ oder `F01`-Topologie verwenden |
| `col.space.actual.tint` | `#0D2533` | $\Omega_A$-Flächenhintergrund | Subtile Spalten-/Chip-Tönung für $\Omega_A$ | Nur im $\Omega_A$-Kontext |
| `col.space.observed.tint` | `#2C200B` | $\Omega_O$-Flächenhintergrund | Subtile Spalten-/Chip-Tönung für $\Omega_O$ | Nur im $\Omega_O$-Kontext |
| `col.space.reconstructed.tint` | `#211A36` | $\Omega_R$-Flächenhintergrund | Subtile Spalten-/Chip-Tönung für $\Omega_R$ | Nur im $\Omega_R$-Kontext |

#### C. Verifikations-, Offenheits- und Ausführungsfarben (`P06`, `P07`)
| Token-ID | Hex-Wert | Semantische Klasse | Gebundene CIRA-Zustände |
| :--- | :--- | :--- | :--- |
| `col.eval.coherent` | `#2DD4BF` | Kohärenz / Übereinstimmung | `TRUE`, `COMPLETED`, `CONVERGED`, `MET`, `IDENTICAL`, `RESOLVED`, `CLOSED_IN_RESULT`, `TP` |
| `col.eval.violation` | `#F43F5E` | Strukturelle Verletzung / Fehler | `FALSE`, `FAILED`, `NOT_MET`, `DIVERGENT`, `REJECTED`, `ERROR`, `FN`, `FP`, `INVALID_*` |
| `col.eval.blocked` | `#FB7185` | Harte Blockade / Grenze | `BLOCKED`, `ENGINE_UNAVAILABLE`, `ACCESS_VIOLATION`, Isolationsmembran `Ω_A ↛ F05` |
| `col.eval.partial` | `#EAB308` | Teilzustand / Degradiert | `PARTIAL`, `TRUNCATED`, `BUDGET_EXHAUSTED`, `KNOWN (stale)`, `POSSIBLE` |
| `col.open.epistemic` | `#94A3B8` | Epistemische Offenheit (neutral-kühl, schraffiert) | `UNKNOWN`, `UNDETERMINED`, `UNEVALUABLE` ($\perp$), `UNDEFINED`, `OPEN`, `UNKNOWN_OPEN` |
| `col.open.absent` | `#475569` | Strukturelle Nicht-Anwendbarkeit / Zeitlücke | `NOT_APPLICABLE`, `NOT_AVAILABLE_AT_TICK`, `ABSENT` |

#### D. Provenienz- und Herkunftsfarben (`DataOrigin`, `AK-09`)
| Token-ID | Hex-Wert | `DataOrigin` | Visuelle Ausprägung |
| :--- | :--- | :--- | :--- |
| `col.origin.synthetic` | `#38BDF8` | `SYNTHETIC` | Feine Kontur, transparenter Kern |
| `col.origin.fixture` | `#D97706` | `FIXTURE` | Deutlich gerahmtes Forschungs-Signet mit Diagonal-Markierung (unverwechselbar: kein Engine-Ergebnis!) |
| `col.origin.engine` | `#2DD4BF` | `ENGINE` | Solider Akzent-Punkt + Kontur (nur bei realer Engine `DEP-02`) |
| `col.origin.imported` | `#C084FC` | `IMPORTED` | Doppelter Rahmen + Import-Pfeil |
| `col.origin.illustrative` | `#64748B` | `ILLUSTRATIVE` | Gestrichelter Rahmen (nie als Messwert darstellbar) |

---

### 01.2 Geometrische Formensprache

Jede Entitätsklasse trägt eine unverwechselbare geometrische Grundkontur (Radius, Eckenform, Rahmentyp), die auch im Graustufenmodus eindeutig lesbar bleibt:

| Form-ID | Geometrie | Strukturelle Funktion | Gebundene Domäne |
| :--- | :--- | :--- | :--- |
| `geo.rect.sharp` | Rechteck, `0px` Eckenradius, `1px` solid | Deterministische, vollständig bestimmte Entität | $\Omega_A$-Werte, `F01`-Knoten (Standard), versiegelte Artefakte |
| `geo.rect.chamfer` | Rechteck mit abgeschrägter oberer rechter Ecke (`6px` Fase) | Vermittelte, fensterbegrenzte Beobachtung | $\Omega_O$-Werte, `ObservationSource`, `ContextBundle` |
| `geo.octa.double` | Oktogonale / doppelt gerahmte Kontur (`2px` Radius + Innenlinie) | Rekonstruierte Aussage mit epistemischer Klasse | $\Omega_R$-Werte, `SweepRun`, `ReconstructionResult` |
| `geo.diamond` | Raute (45° gedrehtes Quadrat) | Logisches Prädikat / Regel-Gate / Entscheidungspunkt | `Rule` (`F02`), K3-Auswertung, `AuthorityRecord`-Gate |
| `geo.dashed.open` | Gestrichelte Kontur (`4px 3px`) + 45°-Mikroschraffur im Hintergrund | Offener oder unbestimmter Informationszustand | `UNKNOWN`, `UNDETERMINED`, $\perp$, `StructuralGap (OPEN)`, `UNDEFINED` |
| `geo.dotted.void` | Punktierte Kontur (`1px 3px`), leerer Innenraum | Außerhalb des Geltungs- oder Sweep-Bereichs | `NOT_APPLICABLE`, `NOT_AVAILABLE_AT_TICK` |
| `geo.pill.badge` | Kompakter Kapsel-Tag (`2px` Radius, Monospace, Großbuchstaben) | Klassifikations- und Herkunftsmarke | `OriginBadge`, `EpistemicClass`, `ExecutionStatus` |

---

### 01.3 Symbolarchitektur

Die Symbolarchitektur trennt strikt zwischen **CIRA-UI-Glyphen** (Systemnavigation und Zustände) und **kanonischen Engine-/$\Sigma$-Zeichen** (`K-31`):

1. **Kanonische Engine-Zeichen (`K-31`, unveränderlich):**
   - $\Sigma$-Identitäten: ausschließlich `U+03A3` (`Σ01` bis `Σ30`). Doppelgänger (`U+2211`, `U+01A9`) werden im Backend abgewiesen (`TX21`) und im Frontend niemals substituiert.
   - 13 kanonische Operatoren (`CANONICAL_V181`): `>` (`U+003E`), `<` (`U+003C`), `≈` (`U+2248`), `→` (`U+2192`), `↔` (`U+2194`), `⊕` (`U+2295`), `⊖` (`U+2296`), `⊗` (`U+2297`), `⊘` (`U+2298`), `∆` (`U+2206`), `∇` (`U+2207`), `∑` (`U+2211`), `∂` (`U+2202`).
   - Diese Zeichen dürfen in `F07` **niemals** als generische UI-Icons (z. B. `→` für „Weiter“-Buttons oder `∆` für generische Warnungen) zweckentfremdet werden, um semantische Kollisionen auszuschließen.
2. **CIRA-Zustandsglyphen (14px-Vektorraster, 1.5px Strichstärke):**
   - `KNOWN`: ausgefüllter Kreis in gefastem Rahmen
   - `KNOWN (stale)`: halbgefüllter Kreis + kleiner Rückwärts-Tick-Indikator
   - `UNKNOWN`: leerer Kreis mit zentralem Fragepunkt (neutral-kühl)
   - `DETERMINED`: ausgefüllter oktogonaler Kern
   - `UNDETERMINED`: offener oktogonaler Rahmen mit Diagonalstrich
   - `UNEVALUABLE`: klassisches $\perp$-Symbol (Up-Tack `U+22A5`) in Monospace
   - `NOT_APPLICABLE`: diagonal durchstrichenes leeres Quadrat (`N/A`)
   - `NOT_AVAILABLE_AT_TICK`: unterbrochene Zeitlinie mit leerem Tick-Slot (`—@t`)
   - `ISOLATION_BARRIER`: doppelte vertikale Sperrlinie mit diagonalem Sperrsymbol (`Ω_A ↛ F05`)

---

### 01.4 Typografie

| Typo-Token | Schriftfamilie (Kategorie) | Größe / Zeilenhöhe | Gewicht / Merkmale | Verwendung |
| :--- | :--- | :--- | :--- | :--- |
| `type.display` | Geometrische Sans (`Inter` / `IBM Plex Sans`) | `18px / 24px` | `600`, Tracking `-0.01em` | Sichtentitel, Experiment-Label |
| `type.section` | Geometrische Sans | `13px / 18px` | `600`, Großbuchstaben, Tracking `+0.06em` | Panel-Köpfe, Systemfeld-Header |
| `type.body` | Geometrische Sans | `13px / 19px` | `400` | Regelbeschreibungen, Rationales, Fehlermeldungen |
| `type.mono.value` | Präzisions-Monospace (`JetBrains Mono` / `IBM Plex Mono`) | `13px / 18px` | `500`, `tabular-nums`, volle Unicode-Mathe-Abdeckung | Symbolwerte, rationale Brüche $n/d$, Dezimalwerte, Ticks |
| `type.mono.id` | Präzisions-Monospace | `11px / 16px` | `400`, `tabular-nums` | `StableId` (`attr:n01/state`), `artifact_id`, `content_hash`, `StrategyRef` |
| `type.mono.operator` | Präzisions-Monospace (mit strenger Unicode-Glyphenprüfung) | `14px / 18px` | `500` | `SigmaRef` (`Σ01`–`Σ30`), `OperatorRef` (13 Symbole, `R`/`I`-Codes) |
| `type.micro` | Geometrische Sans | `10px / 14px` | `600`, Großbuchstaben, Tracking `+0.08em` | Badges (`OriginBadge`, `ExecutionStatus`, `EpistemicClass`) |

---

### 01.5 Räumliche Anordnung und Visuelle Hierarchien

Die globale F07-Shell folgt einem strengen **4+1-Zonen-Forschungsraster** (`100vw x 100vh`, keine unnötigen Verschachtelungen):

    +---------------------------------------------------------------------------------------------------+
    | ZONE A: TOP CONTEXT & PROVENANCE BAR (48px)                                                       |
    | [SYNTX::CIRA] | Exp: exp:demo_base [COMPLETED] | Origin: [FIXTURE] | Tick: t=3/5 | [Controls][Exp]|
    +----------------+---------------------------------------------------------+------------------------+
    | ZONE B:        | ZONE C: PRIMARY RESEARCH WORKSPACE                      | ZONE E (optional):     |
    | FIELD & VIEW   | (Flexibel, 100% Höhe zwischen Zone A und Zone D)        | PROVENANCE & DETAIL    |
    | RAIL (220px)   |                                                         | INSPECTOR DRAWER       |
    |                | - ViewState-Rahmen (READY / LOADING / UNAVAILABLE)      | (360px, einblendbar)   |
    | [01] Overview  | - Sichtspezifische Raumarchitektur                      |                        |
    | [02] Topology  | - Strikte Spalten-/Ebenentrennung Ω_A / Ω_O / Ω_R       | - ProjectionHeader     |
    | [03] Temporal  |                                                         | - ArtifactRef + Hash   |
    | [04] Observ.   |                                                         | - StrategyRefs         |
    | [05] Forward   |                                                         | - Raw Contract Fields  |
    | [06] Inverse   |                                                         |                        |
    | [07] GAPs      |                                                         |                        |
    | [08] Closure   |                                                         |                        |
    | [09] Metrics   |                                                         |                        |
    | [10] Compare   |                                                         |                        |
    | [11] Timeline  |                                                         |                        |
    +----------------+---------------------------------------------------------+------------------------+
    | ZONE D: GLOBAL SYNCHRONIZED TICK & SWEEP SCRUBBER (52px)                                          |
    | [<] t=0 --- t=1 --- t=2 --- [t=3*] --- t=4 --- t=5 [>]  | Sweep-Ticks: ● | Events: ▾ | Attempt: 0 |
    +---------------------------------------------------------------------------------------------------+

**Visuelle Hierarchie (4 Ebenen):**
1. **Ebene 1 (Invarianter Rahmen):** Experiment-Identität, `ExecutionStatus`, `OriginBadge`, aktiver Tick `t`.
2. **Ebene 2 (Systemstruktur):** Zustandsraum-Spalten ($\Omega_A / \Omega_O / \Omega_R$), Graph-Knoten, Metrikkette.
3. **Ebene 3 (Epistemische Details):** Rationale Brüche, `aux`-Zähler, K3-Gründe, `TerminationRecord`, `Delta`.
4. **Ebene 4 (Tiefenprovenienz):** `artifact_id`, `content_hash`, `source_refs`, `StrategyRef` (im Drawer `Zone E`).

---

### 01.6 Verbindungslinien und Relationsdarstellungen

| Relationsklasse | Linienstil | Strichstärke | Farbe | Pfeilspitze / Marker |
| :--- | :--- | :--- | :--- | :--- |
| `depends_on` (`F01`) | Durchgezogen (`solid`) | `1.5px` | `col.ink.secondary` | Geschlossenes Dreieck am Ziel |
| `reports_to` (`F01`) | Gestrichelt (`6px 3px`) | `1.5px` | `col.space.observed` | Offener Winkel am Ziel |
| `provides` (`F01`) | Durchgezogen mit Anfangspunkt | `1.5px` | `col.eval.coherent` | Gefüllter Kreis an Quelle, Dreieck an Ziel |
| `CouplingStatus = EFFECTIVE` (`F05`) | Durchgezogen | `2.0px` | `col.space.reconstructed` | Geschlossenes Dreieck |
| `CouplingStatus = POSSIBLE` (`F05`) | Gestrichelt (`5px 4px`) | `1.5px` | `col.eval.partial` | Offener Winkel |
| `CouplingStatus = UNKNOWN_OPEN` (`F05`) | Punktiert (`2px 4px`) | `1.5px` | `col.open.epistemic` | Offener Kreis |
| Vermittelte Rekursion (`F05 → F02 → F03`) | Doppellinie, unterbrochen durch Raute (`AuthorityRecord`) | `1.5px` | `col.space.reconstructed` → `col.eval.coherent` | Rauten-Gate in der Mitte |
| Verbotene Grenze (`Ω_A ↛ F05`) | Durchgezogene doppelte Sperrlinie | `2.0px` | `col.eval.blocked` | Querstrich / Sperrsymbol |

---

### 01.7 Bewegungssemantik, Animationen und Visuelle Zustandsübergänge

Bewegung dient ausschließlich der **Kontinuitätswahrnehmung bei diskreten Zustandsübergängen** (niemals dekoratives Pulsieren oder endlose Effekte). Bei aktivem `prefers-reduced-motion` werden alle Dauern auf `0ms` gesetzt.

| Übergang | Bewegungssemantik | Dauer / Kurve | Zweck |
| :--- | :--- | :--- | :--- |
| Tick-Wechsel (`t → t+1`) | Kurzzeitiger Rahmen-Impuls auf geänderten Attributen (`DeltaState`), sonst harter, präziser Wertwechsel | `180ms` linear-out | Lenkt den Blick gezielt auf echte strukturelle Differenzen |
| `READY → LOADING` | Sofortige Abdunklung (`opacity: 0.35`) + dünner 2px-Fortschrittsbalken unter Zone A; **keine** Interaktion mit alten Tick-Daten | `100ms` | Verhindert „Stale Cross-Tick Bleed“ (`GUI-GAP-13`) |
| `LOADING → VIEW_DATA_UNAVAILABLE` | Sofortiges Ersetzen des Arbeitsraums durch Quarantäne-Overlay mit `ErrorRecord` und `REFETCH`-Aktion | `0ms` (sofort) | Garantiert Header-Integrität (`T09`) |
| Drawer-Öffnung (`Zone E`) | Horizontales Einschwenken ohne Layout-Sprung der Datenwerte | `160ms` ease-out | Erhält räumliche Orientierung |
| Polling-Update (`StageEvent` während `RUNNING`) | Diskreter Fortschritt der aktiven Stufe in Sicht 1 und Zone A | `200ms` | Sichtbarmachung des Hintergrundworkers (`D-23`) |

---

### 01.8 Interaktionssemantik

1. **Synchronisierte Zeitnavigation:** Jeder Klick auf einen Tick in Zone D, Sicht 3 oder Sicht 11 aktualisiert die URL (`/exp/:id/:view?tick=n`) und triggert einen synchronen Neuabruf aller sichtrelevanten Projektionen mit Header-Prüfung.
2. **Cross-View-Fokus (Deep Inspection):** Klick auf einen Knoten in Sicht 2 öffnet wahlweise den Provenienz-Drawer oder springt mit Beibehaltung von `tick` nach Sicht 3 (gefiltert auf den Knoten). Klick auf eine `StructuralGap` in Sicht 7 springt zur zugehörigen Regel/Relation in Sicht 2 oder Sicht 8.
3. **Explizite Steuerung (`P11`):** Alle zustandsverändernden Aktionen (Neues Experiment, Re-Sweep, Import, Replay, Vergleich, optional `AuthorityRecord`) erfordern einen expliziten, beschrifteten Bestätigungsschritt im `Control & Lifecycle Drawer`. Es gibt keinerlei automatische Anwendung von `RecoveryProposal`s.
4. **Globale Export-Aktion (`A-01`):** In Zone A permanent erreichbar. Prüft `ExecutionStatus != RUNNING` (verhindert `409 CONFLICT`), ruft `GET /experiments/{id}/export` auf und zeigt nach Download den `bundle_hash` als Verifikationsbestätigung.

---

### 01.9 Semiontische Design Tokens (Spezifikation)

| Token-Gruppe | Token-Name | Wert / Definition | Strukturelle Funktion | Zustandsrelation |
| :--- | :--- | :--- | :--- | :--- |
| Spacing | `space.unit` | `4px` (Basisraster: `4, 8, 12, 16, 24, 32`) | Präzise Ausrichtung von Spalten und Matrizen | Global |
| Border | `border.width.base` | `1px` | Standard-Strukturtrennung | Global |
| Border | `border.width.emphasis` | `2px` | Aktive Auswahl, Isolationsbarriere, `FIXTURE`-Rahmen | Fokus, `B_i`, `DataOrigin` |
| Radius | `radius.actual` | `0px` | Deterministische $\Omega_A$-Identität | `StateSpace = A` |
| Radius | `radius.observed` | `0px` + `clip-chamfer-6px` | Vermittelte $\Omega_O$-Identität | `StateSpace = O` |
| Radius | `radius.reconstructed` | `2px` + `outline-double` | Rekonstruierte $\Omega_R$-Identität | `StateSpace = R` |
| Pattern | `pattern.open.hatch` | 45° Diagonalraster `6px`, `col.open.epistemic` @ 12% | Nicht-fehlerhafte Offenheit | `UNKNOWN`, `UNDETERMINED`, $\perp$, `OPEN` |
| Pattern | `pattern.fixture.stripe` | 45° Randstreifen `4px`, `col.origin.fixture` @ 25% | Unverwechselbare Fixture-Markierung | `DataOrigin = FIXTURE` |
| Z-Index | `z.canvas / z.chrome / z.drawer / z.quarantine` | `10 / 20 / 30 / 40` | Strikte Schichtung inkl. Quarantäne-Vorrang | `ViewState` |

---

## 02 — Vollständiges Semiontisches Register

Jedes visuelle Zeichen in `F07` ist in diesem Register eindeutig definiert. Kein Zeichen darf außerhalb seines Geltungsbereichs oder entgegen seiner Ausschlussregel verwendet werden.

| ID | Visuelles Zeichen (Form / Farbe / Glyph) | Strukturelle Funktion | Bedeutung | Zustandsrelation (CIRA-Typ) | Geltungsbereich | Ausschlussregel |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SEM-001` | Scharfes Rechteck + `col.space.actual` | Raumanker $\Omega_A$ | Synthetischer Ist-Zustand (Ground Truth) | `StateSpace.A`, `ActualValue` | Sichten 1, 2, 3, 9, 10 | Nie für beobachtete oder rekonstruierte Werte |
| `SEM-002` | Gefastes Rechteck + `col.space.observed` | Raumanker $\Omega_O$ | Durch $\Theta$ vermittelte Beobachtung | `StateSpace.O`, `Observation` | Sichten 1, 2, 3, 4, 9 | Nie für $\Omega_A$ oder Systemfehler |
| `SEM-003` | Doppelrahmen-Oktogon + `col.space.reconstructed` | Raumanker $\Omega_R$ | Ergebnis der Dual-Sweep-Rekonstruktion | `StateSpace.R`, `ReconstructedValue` | Sichten 1, 2, 3, 5, 6, 7, 8, 9 | Nie als gesicherte Grundwahrheit darstellen |
| `SEM-004` | Gefüllter Punkt in `SEM-002` + Symbolwert | Beobachtungsstatus | Aktueller bekannter Wert (`observed_at_tick == tick`) | `ObservationStatus.KNOWN`, `stale=false` | Sichten 2, 3, 4 | Nie ohne `source_id` |
| `SEM-005` | Halbgefüllter Punkt + `col.eval.partial` + `lag`-Tag | Veralterungsindikator | Bekannter, aber verzögerter Wert (`observed_at_tick < tick`) | `ObservationStatus.KNOWN`, `stale=true` (`K-42`) | Sichten 3, 4, 9 (`stale_known`) | Nie als `UNKNOWN` oder `FALSE` darstellen |
| `SEM-006` | Gestrichelter Rahmen + Schraffur + `?`-Kreis (`col.open.epistemic`) | Epistemische Lücke ($\Omega_O$) | Kein aktiver Quellenwert am Tick | `ObservationStatus.UNKNOWN` | Sichten 2, 3, 4 | Niemals rot; niemals gleich `FALSE` oder `NOT_APPLICABLE` |
| `SEM-007` | Offenes Oktogon + Schraffur + Diagonalstrich (`col.open.epistemic`) | Epistemische Lücke ($\Omega_R$) | Attribut durch F05 nicht bestimmt | `ReconstructionStatus.UNDETERMINED` | Sichten 2, 3, 5, 6, 9 | Niemals gleich `UNKNOWN` oder `FALSE` |
| `SEM-008` | Punktiertes leeres Rechteck + `N/A` (`col.open.absent`) | Statische Nicht-Anwendbarkeit | Attribut für diesen Knoten/Run nicht anwendbar (`K-21`) | `Applicability.NOT_APPLICABLE` | Sichten 2, 3, 4 | Wird nicht als Lücke oder Fehler gezählt |
| `SEM-009` | Punktierte Zeitlücke + `—@t` (`col.open.absent`) | Fehlender Sweep-Tick | Kein Rekonstruktionsartefakt an Tick $t$ (`K-24`) | `ContentAvailability.NOT_AVAILABLE_AT_TICK` | Sichten 3, 5, 6, 7, 8 | Kein `VIEW_DATA_UNAVAILABLE`-Fehler! |
| `SEM-010` | Raute + `col.eval.coherent` + `1` | Regelkohärenz | Prädikat erfüllt | `RuleResult.TRUE` | Sichten 2, 3, 8, 9, 10 | Nie für bloße Ausführungs-Completion |
| `SEM-011` | Raute + `col.eval.violation` + `0` | Regelverletzung | Prädikat verletzt | `RuleResult.FALSE` | Sichten 2, 3, 8, 9, 10 | Nie für `UNEVALUABLE` ($\perp$) |
| `SEM-012` | Raute + Schraffur + $\perp$ (`col.open.epistemic`) | Kleene-K3-Offenheit | Prädikat nicht auswertbar (`EvalReason`) | `RuleResult.UNEVALUABLE` | Sichten 2, 3, 8, 9, 10 | Immer mit `EvalReason`; nie als `FALSE` |
| `SEM-013` | `FIXTURE`-Signet (`col.origin.fixture` + Randstreifen) | Herkunftsmarke | Synthetisches Test-Fixture, keine Engine | `DataOrigin.FIXTURE` | Global an jedem Fixture-Wert | Darf nie verdeckt oder entfernt werden (`AK-09`) |
| `SEM-014` | `SYNTHETIC`-Tag (`col.origin.synthetic`) | Herkunftsmarke | Deterministischer Emulator-/Beobachtungsdatenpunkt | `DataOrigin.SYNTHETIC` | Global | Nie für `F05`-Ausgaben |
| `SEM-015` | `ENGINE`-Tag (`col.origin.engine` + Solider Punkt) | Herkunftsmarke | Reale Engine-Ausgabe (`DEP-02`) | `DataOrigin.ENGINE` | Global | Nur zulässig bei realem Adapter (`is_fixture=false`) |
| `SEM-016` | `IMPORTED`-Tag (`col.origin.imported` + Doppelrahmen) | Herkunftsmarke | Schema-validierter externer Import | `DataOrigin.IMPORTED` | Global | Unterscheidbar von `FIXTURE` und `ENGINE` |
| `SEM-017` | `ILLUSTRATIVE`-Tag (gestrichelt, `col.origin.illustrative`) | Herkunftsmarke | Nicht gemessene, illustrative Angabe | `DataOrigin.ILLUSTRATIVE` | Global | Nie in Metrik-Ergebnissen als gemessen darstellen |
| `SEM-018` | Epistemik-Kapsel (`SRC_OBS`, `SRC_STMT`, `STRUCT_DERIV`, `HYPOTHESIS`, `OPEN_REF`) | Wissensklasse | Epistemischer Status einer $\Omega_R$-Aussage | `EpistemicClass` | Sichten 3, 5, 6, 7 | `OPEN_REFERENCE` nie an `DETERMINED` (`K-14`) |
| `SEM-019` | Doppelte rote Sperrlinie (`col.eval.blocked`) | Architektur-Isolation | Verbotener Informationsfluss $\Omega_A \not\to \text{F05}$ | `B_05`, `05.4` | Sicht 1 | Keine Durchgangs- oder Hover-Verbindung |
| `SEM-020` | Doppellinie + Rauten-Gate (`Mensch`) | Vermittelte Rekursion | `RecoveryProposal → AuthorityRecord → RECOVERY` | `05.5`, `K-08`, `P11` | Sichten 1, 8, 10 | Nie als geschlossener automatischer Regelkreis |
| `SEM-021` | Monospace-Bruch `n/d` + Dezimalwert + Zielmarker | Rationale Metrik | Exakter rationaler Metrikwert (`P05`, `K-15`) | `MetricResult (EVALUATED)` | Sichten 9, 10 | Nie ohne `n/d`; nie als Gesamtindex |
| `SEM-022` | Schraffierter Metrik-Slot + `UNDEFINED` + Grund-Tag | Nullnenner / Eingabelücke | `ZERO_DENOMINATOR` oder `INPUT_MISSING` | `MetricResult (UNDEFINED)` | Sichten 9, 10 | Niemals als `0.00` oder `0%` darstellen |
| `SEM-023` | Delta-Pfeil (`before ▸ after`) in Raumfarbe | Zustandsübergang | Änderung zwischen $t-1$ und $t$ im selben Raum | `DeltaStateA/O/R`, `DeltaCoupling` | Sichten 2, 3, 11 | Immer raumgebunden (`K-13`) |
| `SEM-024` | Offener Rahmen + Quellanker-Zähler (`col.open.epistemic`) | Strukturelle GAP | Unaufgelöste strukturelle Lücke | `StructuralGap (OPEN)` | Sichten 2, 7, 8 | Immer mit mindestens einer `source_ref` |
| `SEM-025` | Geschlossener Rahmen + Ergebnis-Link (`col.eval.coherent`) | Geschlossene GAP | GAP in späterem Ergebnis geschlossen | `StructuralGap (CLOSED_IN_RESULT)` | Sichten 7, 8 | Immer an Ziel-Artefakt gebunden (`06.6`) |
| `SEM-026` | Konflikt-Klammer (`FWD ≠ INV`) | Merge-Konflikt | Abweichung zwischen Vorwärts- und Invers-Sweep | `MergeConflict` | Sichten 3, 5, 6, 8 | Zeigt `UNDETERMINED` oder `ENGINE_RESOLVED` |
| `SEM-027` | Opaker Code-Block (`[DEP-01]` / `[DEP-08]`) | Externe Grenze | Unaufgelöste Operator- oder $\Sigma$-Bezeichnung | `OperatorRef`, `SigmaRef` | Sichten 5, 6 | Keine geratene Übersetzung (`K-33`) |
| `SEM-028` | Quarantäne-Rahmen (`VIEW_DATA_UNAVAILABLE`) | Synchronisationsschutz | Abruffehler oder `ProjectionHeader`-Abweichung | `ViewState.VIEW_DATA_UNAVAILABLE` | Global (Zone C) | Maskiert sofort veraltete Daten; bietet `REFETCH` |
| `SEM-029` | Terminierungs-Siegel (`CONVERGED`, `BUDGET_EXHAUSTED`, etc.) | Prozessabschluss | Dokumentierte Sweep-Terminierung (`T12`) | `TerminationRecord` | Sichten 5, 6, 8 | Fehlt nur bei `BLOCKED` |
| `SEM-030` | Kontinuitäts-Band (`CONTINUOUS` vs. `INTERRUPTED`) | Quellenverlauf | Zeitliche Aktivität und Lücken einer `ObservationSource` | `SourceReferenceRegister` | Sicht 4, Sicht 11 | Zeigt exakte `TickRange`-Lücken |

---

## 03 — Visuelle Systemfeldarchitektur F07

### 03.1 Formales Feldtupel `F07_INTERFACE`

| Komponente | Spezifikation für F07 v1.0.0 |
| :--- | :--- |
| `C_07` (Träger) | `View (11 Sichten)`, `ExperimentSession`, `ViewState`, `ProjectionHeader`, `Block<T>`, `SemionticTokenSet`, `ProvenanceDrawerState` |
| `R_07` (Relationen) | `projects_from` (API-Projektionen), `synchronizes_on` (`experiment_id`, `tick`, `attempt`), `triggers_via_api` (Experiment-/Vergleichs-/Export-Steuerung), `inspects_provenance` (`ArtifactRef`) |
| `X_07` (Zustandsraum) | `ViewState` (`IDLE`, `LOADING`, `READY`, `VIEW_DATA_UNAVAILABLE`) $\times$ `ContentAvailability` (`AVAILABLE`, `NOT_AVAILABLE_AT_TICK`) $\times$ `ExperimentSession` |
| `U_07` (Eingänge) | Ausschließlich typisierte JSON-Projektionen der 21 API-Einträge (generierte TypeScript-Verträge aus `cira.contracts.schema.json`, `TX02`) |
| `Y_07` (Ausgänge) | Gerenderte DOM-/SVG-Repräsentation der 11 Sichten, `ExperimentBundle`-Download, API-Steuerungsbefehle (`POST`) |
| `B_07` (Grenzen) | **Keine** ausgehende Kopplung zu `F05`; **keine** Metrik-, K3-, Delta- oder GAP-Matching-Berechnung im Frontend; **keine** automatische Anwendung von `RecoveryProposal`s |
| `I_07` (Invarianten) | URL ist einzige Session-Quelle (`D-20`); jede Projektion wird gegen `(experiment_id, tick)` im `ProjectionHeader` geprüft; Abweichung $\implies$ `VIEW_DATA_UNAVAILABLE`; jedes Element zeigt sein `DataOrigin` (`AK-09`) |
| `T_07` (Übergänge) | `navigate(view)`, `selectTick(t)`, `selectAttempt(a)`, `refetch()`, `inspectProvenance(ref)`, `triggerExport()`, `submitControlAction(cmd)` |
| `K_07` (Kopplungen) | Eingehend lesend aus `F01`, `F02`, `F03`, `F04`, `F05` (nur über API-Projektionen), `F06`; ausgehend steuernd nur über `API → experiments.orchestrator` |
| `P_07` (Provenienz) | Jede Ansicht spiegelt `ProjectionHeader.schema_version`, `data_origin` und `source_refs` in Zone A und Zone E |

### 03.2 Interne Teilstrukturen von F07

    +-----------------------------------------------------------------------------------+
    | F07_INTERFACE (Interne Architektur)                                               |
    |                                                                                   |
    |  [1. URL Session Controller]  <--->  Browser URL (/exp/:id/:view?tick=n&...)      |
    |              |                                                                    |
    |              v (session_key: experiment_id, tick, attempt, comparison_id, ...)    |
    |  [2. Projection Fetch & Header Guard]  <---  Typed API Client (TS generated)      |
    |              |                                                                    |
    |              +-- Header Mismatch / Network Error --> [Quarantine Gate: UNAVAIL]   |
    |              |                                                                    |
    |              v (verifizierte Projektion + Block<T>-Verfügbarkeit)                 |
    |  [3. Origin & Provenance Propagation Layer]  --->  [Zone E: Provenance Drawer]    |
    |              |                                                                    |
    |              v                                                                    |
    |  [4. Semiontic Component Library]  <---  Semiontic Design Tokens + Register       |
    |              |                                                                    |
    |              v                                                                    |
    |  [5. 11 View Modules]  +  [6. Global Tick Scrubber]  +  [7. Export & Control]     |
    +-----------------------------------------------------------------------------------+

### 03.3 URL-Session-Vertrag (`D-20`, `GUI-GAP-01`)

- **Kanonische Route:** `/exp/:experimentId/:view`
- **Verbindliche Query-Parameter:**
  - `tick`: ganze Zahl $\ge 0$ (global über alle zeitabhängigen Sichten synchronisiert)
  - `attempt`: ganze Zahl $\ge 0$ (optional, Default `0`; relevant für Sichten 3, 5, 6, 7, 8, 9 bei Re-Sweep/Stabilität)
  - `comparisonId`: `StableId` (optional; relevant für Sichten 8 und 10)
  - `aggregation`: `PER_TICK` / `POOLED` / `TIME_MEAN_EXPLICIT` (optional, Default `POOLED`; relevant für Sicht 9)
  - `toTick`: ganze Zahl $\ge 0$ (optional; relevant für Sicht 9 bei `POOLED`/`TIME_MEAN_EXPLICIT`, `K-25`)
  - `focus`: `StableId` (optional; hebt einen Knoten, ein Attribut, eine Regel oder eine GAP sichtenübergreifend hervor)

---

## 04 — Vollständige Spezifikation aller 11 Sichten + Globaler Export

Im Folgenden wird jede der 11 Sichten aus CIRA v1.0.1 Kap. 11 sowie die globale Exportfunktion vollständig spezifiziert und mit einem textuellen Wireframe versehen.

---

### Sicht 01 — `SYSTEM_FIELD_OVERVIEW` (Systemfeld-Übersicht)

- **Informationsarchitektur:** Gesamtsicht auf die 7 Systemfelder `F01`–`F07`, die 9 `StageEvent`-Stufen, die Kopplungsmatrix inkl. Isolationsbarriere $\Omega_A \not\to \text{F05}$, die `FieldConfigurationSnapshot`-Referenzen ($S_t = C(J_t, R_t)$) sowie die `ContentOpenness`-Bilanz des Experiments.
- **Raumarchitektur:** Oben horizontale Feldkette (`F01`–`F07`) mit gerichteten Kopplungspfaden und expliziter Isolationsmembran um `F05`; darunter zweispaltig links die 9-stufige `StageEvent`-Pipeline (`K-35`) und rechts der `FieldConfigurationSnapshot` + `ContentOpenness`-Zählerblock.
- **Visuelle Semantik:** `SEM-001`–`SEM-003` als Feld-Unterlagen für `F03/F04/F05`, `SEM-019` (Sperrlinie `Ω_A ↛ F05`), `SEM-020` (vermittelte Rekursion `F05 → F02 → F03`).
- **Interaktionsarchitektur:** Klick auf ein Systemfeld navigiert zur primären Sicht dieses Feldes; Klick auf eine Kopplungskante öffnet den zugehörigen Vertragstyp in Zone E; Klick auf `StageEvent`-Fehler fokussiert die betroffene Stufe.
- **Komponentenidentitäten:** `FieldChainCanvas`, `IsolationMembraneOverlay`, `StagePipelineMatrix`, `ConfigSnapshotCard`, `OpennessSummaryStrip`.
- **Zustandsrelationen:** `ExecutionStatus` (`FAILED > BLOCKED > PARTIAL > COMPLETED`) strikt getrennt von `ContentOpenness` (`undetermined`, `unknown_observations`, `open_references`, `open_relations`, `structural_gaps_open`, `unevaluable_rules`).
- **Datenverträge:** `GET /fields` (#20), `GET /experiments/{experiment_id}` (#4).
- **Synchronisationsbedingungen:** Spiegelt `experiment_id` und `tick` (für `FieldConfigurationSnapshot(t)`).

    +---------------------------------------------------------------------------------------+
    | [01] SYSTEM FIELD OVERVIEW :: S_t = C(J_t, R_t)        Status: COMPLETED | [FIXTURE]  |
    +---------------------------------------------------------------------------------------+
    |  +-------+     +-------+     +-------+     +-------+  ||  +-------+     +-------+     |
    |  |  F01  |---->|  F03  |---->|  F04  |---->|  F05  |  ||  |  F06  |---->|  F07  |     |
    |  | TOPO  |  +->| EMUL  |     | OBS   |     | SYNTX |  ||  | METR  |     |  GUI  |     |
    |  +-------+  |  | [Ω_A] |     | [Ω_O] |     | [Ω_R] |  ||  +-------+     +-------+     |
    |      |      |  +-------+     +-------+     +-------+  ||      ^                       |
    |      v      |      |             |             |      ||      |                       |
    |  +-------+  |      +-------------+-------------+--------------+                       |
    |  |  F02  |--+      [==== ISOLATIONSMEMBRAN: Ω_A -/-> F05 ====]                        |
    |  | GOV   | <===(RecoveryProposal)==<◊ AuthorityRecord>===(F05 -> F02 -> F03)          |
    |  +-------+                                                                            |
    +-------------------------------------------+-------------------------------------------+
    | STAGE PIPELINE (StageEvents)              | CONTENT OPENNESS & CONFIG SNAPSHOT (t=3)  |
    | 1 DEFINITIONS  [COMPLETED] (F01/F02/F04)  | undetermined:          2   [OPEN]         |
    | 2 EMULATION    [COMPLETED] (F03)          | unknown_observations:  4   [OPEN]         |
    | 3 OBSERVATION  [COMPLETED] (F04)          | open_references:       1   [OPEN]         |
    | 4 FORWARD      [COMPLETED] (F05)          | open_relations:        1   [OPEN]         |
    | 5 INVERSE      [COMPLETED] (F05)          | structural_gaps_open:  2   [OPEN]         |
    | 6 MERGE        [COMPLETED] (F05)          | unevaluable_rules:     2   [OPEN]         |
    | 7 STABILITY    [COMPLETED] (F05 a=1)      | ----------------------------------------- |
    | 8 EVALUATION   [COMPLETED] (F06)          | J_t: obs_bundle@t3 | R_t: topo@1.0, gov@1 |
    | 9 EXPORT       [READY]     (F07/Orch)     | C:   theta@1.0, ws@1.0, engine_first/v1   |
    +-------------------------------------------+-------------------------------------------+

---

### Sicht 02 — `TOPOLOGY_GRAPH` (Interaktiver Topologiegraph)

- **Informationsarchitektur:** Gerichteter typisierter Graph $G = (V, E, \tau_V, \tau_E)$ mit wählbaren Zustandsraum-Overlays ($\Omega_A$, $\Omega_O$, $\Omega_R$, Sichtbarkeitsmaske $\Theta$, aktive `StructuralGap`s).
- **Raumarchitektur:** Großflächiger SVG-Canvas mit deterministischem `elkjs`-Layout (`D-31`); oben schmale Layer-Kontrollleiste (umschaltbare Raum-Overlays ohne Vermischung); unten links kompakte Zeichenlegende.
- **Visuelle Semantik:** Knoten zeigen drei räumlich getrennte Mikro-Slots ($\Omega_A$ links scharf, $\Omega_O$ mittig gefast, $\Omega_R$ rechts oktogonal). Nicht sichtbare Knoten (außerhalb $\Theta$) erhalten eine gedimmte Maskierungs-Kontur (`GUI-GAP-03`). Kanten folgen `01.6` (`depends_on`, `reports_to`, `provides`, `CouplingStatus`).
- **Interaktionsarchitektur:** Zoom/Pan (mit `Reset Layout`), Klick auf Knoten/Kante öffnet Provenienz & Attributdetails in Zone E; Doppelklick auf Knoten springt zu Sicht 3 (`?focus=node:n03`).
- **Komponentenidentitäten:** `TopologySvgCanvas`, `DeterministicElkLayoutAdapter`, `SpaceOverlayToolbar`, `NodeTripletCard`, `RelationEdgePath`, `GraphLegend`.
- **Zustandsrelationen:** Wenn an Tick $t$ kein Sweep existiert, zeigen die $\Omega_R$-Mikro-Slots `SEM-009` (`—@t`, `NOT_AVAILABLE_AT_TICK`).
- **Datenverträge:** `GET /experiments/{id}/topology` (#10), optional synchron kombiniert mit `/states?tick=t` (#12), `/observations?tick=t` (#5), `/results?tick=t` (#6).
- **Synchronisationsbedingungen:** Jeder Overlay-Request wird einzeln über `ProjectionHeader` auf `(experiment_id, tick)` geprüft; jeder Overlay-Toggle zeigt sein eigenes `OriginBadge`.

    +---------------------------------------------------------------------------------------+
    | [02] TOPOLOGY GRAPH   Overlays: [x] Ω_A [SYN]  [x] Ω_O [SYN]  [x] Ω_R [FIX]  [x] Θ    |
    +---------------------------------------------------------------------------------------+
    |                                                                                       |
    |    +---------------------+      depends_on       +---------------------+              |
    |    | node:n01  Komp. 01  |---------------------->| node:n03  Komp. 03  |              |
    |    | [A:NOM][O:NOM][R:NOM]|                      | [A:DEG][O:DEG][R:DEG]|             |
    |    +---------------------+                       +---------------------+              |
    |               |                                             |                         |
    |               | provides                                    | reports_to (--->)       |
    |               v                                             v                         |
    |    +---------------------+                       +---------------------+ (verdeckt Θ) |
    |    | node:n07  Komp. 07  | - - - UNKNOWN_OPEN -> | node:n08  Komp. 08  | [GAP:OPEN]   |
    |    | [A:STB][O: ? ][R:STB]|                      | [A:NOM][O: ? ][R:DEG]| (Abw. A≠R)  |
    |    +---------------------+                       +---------------------+              |
    |                                                                                       |
    |  [Legende: ─── depends_on | - - reports_to | ●── provides | [?] UNKNOWN | [◊] GAP]    |
    +---------------------------------------------------------------------------------------+

---

### Sicht 03 — `TEMPORAL_STATE_EXPLORER` (Zustandsraum-Triptychon)

- **Informationsarchitektur:** Synchronisierte Gegenüberstellung aller deklarierten Attribute über die drei disjunkten Zustandsräume $\Omega_A$, $\Omega_O$ und $\Omega_R$ am aktiven Tick $t$, inklusive raumspezifischer Deltas (`t-1 → t`, `K-13`) und Abweichungsindikator (`a ≠ r`).
- **Raumarchitektur:** Dreispaltiges Triptychon mit fester Attribut-Leitspalte links; jede Raumspalte trägt ihren eigenen Kopf mit Raumfarbe, Form-Signet, `OriginBadge` und `ContentAvailability`-Status. Darunter optional ein klappbarer Regel-Auswertungsstreifen (`GovernanceProjection` nach Raum getrennt).
- **Visuelle Semantik:** Strikte Anwendung von `SEM-001` bis `SEM-009`, `SEM-018` (`EpistemicClass` in $\Omega_R$), `SEM-023` (`DeltaStateA/O/R`). Abweichungen zwischen $\Omega_A$ und $\Omega_R$ (bei `DETERMINED`) werden über eine schmale Vergleichsnaht zwischen Spalte 1 und 3 markiert, ohne die Spalten zu verschmelzen.
- **Interaktionsarchitektur:** Filter nach Knoten, Domäne, Status (`nur Abweichungen`, `nur Offenheit`, `nur Deltas`); Klick auf jede Zelle öffnet Provenienz & Historie in Zone E.
- **Komponentenidentitäten:** `StateTriptychGrid`, `ActualStateColumn`, `ObservedStateColumn`, `ReconstructedStateColumn`, `DeltaBadge`, `RuleSpaceRibbon`.
- **Zustandsrelationen:** Ist $\Omega_R$ am Tick $t$ nicht verfügbar, rendert die gesamte Spalte 3 den regulären `NOT_AVAILABLE_AT_TICK`-Zustand (`SEM-009`) mit Direktlinks zum vorherigen/nächsten Sweep-Tick.
- **Datenverträge:** `GET /experiments/{id}/states?tick=t` (#12), `GET /experiments/{id}/observations?tick=t` (#5), `GET /experiments/{id}/results?tick=t&attempt=a` (#6), optional `GET /experiments/{id}/governance?tick=t` (#11).
- **Synchronisationsbedingungen:** Alle drei Spalten müssen identische `(experiment_id, tick)`-Header aufweisen; weicht eine ab, geht nur der betroffene Block bzw. die Sicht in Quarantäne (`T09`).

    +---------------------------------------------------------------------------------------+
    | [03] TEMPORAL STATE EXPLORER (t=3, attempt=0)  Filter: [Alle] [Δ] [Offen] [A≠R]       |
    +-------------------+---------------------+---------------------+-----------------------+
    | ATTRIBUT (F01)    | Ω_A ACTUAL [SYN]    | Ω_O OBSERVED [SYN]  | Ω_R RECONSTRUCT [FIX] |
    |                   | [■] deterministisch | [◩] projiziert ω    | [⬡] merged (a=0)      |
    +-------------------+---------------------+---------------------+-----------------------+
    | attr:n01/state    | NOMINAL             | NOMINAL (src:s01)   | NOMINAL [SRC_OBS]     |
    | attr:n03/state    | DEGRADED [Δ NOM▸DEG]| DEGRADED (src:s01)  | DEGRADED [SRC_OBS]    |
    | attr:n06/state    | NOMINAL             | NOMINAL [STALE t=2] | NOMINAL [STRUCT_DER]  |
    | attr:n07/state    | STANDBY             | [? UNKNOWN]         | STANDBY [HYPOTHESIS]  |
    | attr:n08/state    | NOMINAL             | [? UNKNOWN]         | DEGRADED [STRUCT_DER] | <-- A≠R
    | attr:n09/state    | AUTHORIZED          | [? UNKNOWN]         | [⬡ UNDETERMINED]      |
    | attr:n10/state    | [N/A]               | [N/A]               | [N/A]                 |
    +-------------------+---------------------+---------------------+-----------------------+
    | REGELN (K3)       | A: 4 TRUE 1 FALSE 0⊥| O: 2 TRUE 0 FALSE 3⊥| R: 3 TRUE 1 FALSE 1⊥  |
    +---------------------------------------------------------------------------------------+

---

### Sicht 04 — `OBSERVATION_INSPECTOR` (Beobachtungs- & Kontext-Inspektor)

- **Informationsarchitektur:** Vollständige Transparenz über `F04_OBSERVATION`: aktiver `ContextBundle` (`ctx:<seq>`, `previous_context_ref`), `BudgetUsage` vs. `bundle_budget` (`items`, `bytes`, `K-12`), `serialization_profile` & `revision` (`K-39`), `SourceReferenceRegister` (Kontinuität & Lücken) sowie die Liste der Roh-Beobachtungen vs. Projektion $\omega(i,t)$ (`K-09`, `stale`-Markierung).
- **Raumarchitektur:** Oben 3 kompakte Telemetriekarten (Kontext-Kette, Budget-Auslastung mit Profil-Status, Quellen-Kontinuitätsmatrix); unten zweigeteilte Tabelle (links `SourceReferenceRegister`, rechts `Observation`-Liste mit Frische- und Quellen-Indikator).
- **Visuelle Semantik:** `SEM-002`, `SEM-004`, `SEM-005` (`stale`), `SEM-006` (`UNKNOWN` mit `source_id = null`), `SEM-030` (`CONTINUOUS` vs. `INTERRUPTED`). Bei `CONTEXT_INCOMPLETE` deutliche Markierung des Profilwechsels (`revision + 1`).
- **Interaktionsarchitektur:** Umschalten zwischen `revision`en eines Ticks (falls Profilwechsel stattfand); Klick auf Quelle filtert Beobachtungen; Klick auf `Observation` zeigt `references` in Zone E.
- **Komponentenidentitäten:** `ContextChainBanner`, `BundleBudgetGauge`, `SourceContinuityMatrix`, `ObservationTable`, `ProjectionResolutionInspector`.
- **Zustandsrelationen:** `stale = (observed_at_tick < tick)` wird explizit ausgewiesen; `UNKNOWN`-Platzhalter zeigen ausdrücklich `source_id: null (keine aktive Quelle)`.
- **Datenverträge:** `GET /experiments/{id}/observations?tick=t&revision=r` (#5, erweitert um `GUI-GAP-05`).
- **Synchronisationsbedingungen:** Bindung an `(experiment_id, tick, revision)`.

    +---------------------------------------------------------------------------------------+
    | [04] OBSERVATION INSPECTOR (t=3, rev=0)                            Origin: [SYNTHETIC]|
    +---------------------------+---------------------------+-------------------------------+
    | CONTEXT BUNDLE            | BUNDLE BUDGET (items/B)   | SERIALIZATION PROFILE         |
    | version: ctx:0003         | obs:   18 / 500  [ 3.6% ] | profile: compact_v1           |
    | prev:    ctx:0002         | bytes: 4.2 KB / 64 KB     | status:  WITHIN_BUDGET        |
    +---------------------------+---------------------------+-------------------------------+
    | SOURCE REFERENCE REGISTER (Kontinuität)   | OBSERVATIONS & PROJECTION ω(i, t=3)       |
    | src:s01 [CONTINUOUS]  t=0..5  lag=0       | obs:s01:n01/state:t3  KNOWN   NOMINAL     |
    | src:s02 [INTERRUPTED] t=0..2, t=4..5 lag=1| obs:s02:n06/state:t2  KNOWN*  NOMINAL(t=2)|
    |   └─ Lücke: [t=3..3]                      | obs:none:n07/state:t3 UNKNOWN null        |
    |                                           | obs:none:n08/state:t3 UNKNOWN null        |
    +-------------------------------------------+-------------------------------------------+

---

### Sicht 05 — `FORWARD_SWEEP_INSPECTOR` (Vorwärts-Rekonstruktions-Inspektor)

- **Informationsarchitektur:** Dedizierte, von Inverse isolierte Inspektion von `ForwardResult` ($\Omega_F = R_F(\Omega_O)$): `SweepRun`-Metadaten (`sweep_id`, `attempt`, `adapter`, `input_bundle_ref`, `target_ref = null`), `TerminationRecord` (`T12`), chronologische `SweepTrace`-Schritte mit wörtlichen `OperatorRegistry`-Bezeichnungen (`K-33`) sowie das erzeugte `SweepOutput` (Werte, Relationen, GAPs, offene Relationen).
- **Raumarchitektur:** Oben `SweepRun`- & `TerminationRecord`-Header (inkl. expliziter Bestätigung `target_ref: null`); darunter zweispaltig links der schrittweise `SweepTrace` (`step_seq`) und rechts das zugehörige `SweepOutput` mit Tab-Umschaltung (`Values`, `Relations`, `GAPs`, `Open Relations`).
- **Visuelle Semantik:** `SEM-003`, `SEM-013`/`SEM-015`/`SEM-016` (`DataOrigin` aus `AdapterDescriptor`), `SEM-018` (`EpistemicClass`), `SEM-027` (opake Codes mit `[DEP-01]`/`[DEP-08]`), `SEM-029` (`TerminationRecord`).
- **Interaktionsarchitektur:** Auswahl von `attempt` (`0`, `1`, ...); Klick auf einen `TraceStep` hebt dessen `input_refs` und `output_refs` im rechten Panel hervor; bei `BLOCKED` (`ENGINE_UNAVAILABLE`) direkter Link zur Re-Sweep-/Import-Aktion.
- **Komponentenidentitäten:** `SweepRunHeaderCard`, `TerminationSeal`, `SweepTraceTimeline`, `OperatorSigmaToken`, `SweepOutputTabs`.
- **Zustandsrelationen:** `NOT_AVAILABLE_AT_TICK` an Nicht-Sweep-Ticks; bei `BLOCKED` kein `TerminationRecord`, sondern `ErrorRecord` mit `RecoveryAction` (`RESWEEP` / `IMPORT_RESULT`).
- **Datenverträge:** `GET /experiments/{id}/results?tick=t&direction=forward&attempt=a` (#6), `GET /experiments/{id}/results/{sweep_id}/trace` (#14).
- **Synchronisationsbedingungen:** Strikt gebunden an `(experiment_id, tick, attempt)`; niemals Mischung mit `InverseResult`-Daten (`T08`).

    +---------------------------------------------------------------------------------------+
    | [05] FORWARD SWEEP INSPECTOR   sweep:fwd:t3:a0   [COMPLETED]   Origin: [FIXTURE]      |
    +---------------------------------------------------------------------------------------+
    | Adapter: fixture_v1 (is_fixture=true) | target_ref: NULL (Forward-Invariante)         |
    | Termination: [CONVERGED] steps=6 | RefStatus: RESOLVED | Context: ctx:0003            |
    +-------------------------------------------+-------------------------------------------+
    | SWEEP TRACE (step_seq)                    | FORWARD OUTPUT [Values|Rel|GAPs|OpenRel]  |
    | #01 [Σ01 Active Carrier Nodes]  op: →     | attr:n01/state  DET   NOMINAL  [SRC_OBS]  |
    |     in: obs:s01:n01..n06  out: n01..n06   | attr:n07/state  DET   STANDBY  [HYPOTH.]  |
    | #02 [Σ14 LABEL_UNAVAIL DEP-08]  op: ∆     | attr:n08/state  DET   DEGRADED [STRUCT]   |
    |     in: ctx:0003          out: gap:g01    | attr:n09/state  UNDET null     [OPEN_REF] |
    | #03 [Σ30 Recursive Closure Thr] op: ≈     | ----------------------------------------- |
    |     class: STRUCTURAL_DERIVATION          | Merge-Hinweis: 1 Konflikt bei attr:n08    |
    +-------------------------------------------+-------------------------------------------+

---

### Sicht 06 — `INVERSE_SWEEP_INSPECTOR` (Invers-Rekonstruktions-Inspektor)

- **Informationsarchitektur:** Dedizierte Inspektion von `InverseResult` ($\Omega_I = R_I(\Omega_O, Z)$): `SweepRun`-Metadaten mit verpflichtendem `target_ref` (`K-11`, `S-07`), `TargetAssessment`-Matrix (Bewertung jedes `TargetGoal`: `MET`, `NOT_MET`, `UNDETERMINED` inkl. `derived_from`), unabhängiger `SweepTrace` (strikt ohne Forward-Referenzen, `T08`) sowie das `SweepOutput`.
- **Raumarchitektur:** Oben `SweepRun`- & `TerminationRecord`-Header mit hervorgehobener `TargetDefinition`-Bindung; darunter als zentrales oberes Band das `TargetAssessment`-Board; unten zweispaltig links `SweepTrace` und rechts `SweepOutput` (analog Sicht 5 für kognitive Konsistenz).
- **Visuelle Semantik:** `SEM-003`, `SEM-010` (`MET`), `SEM-011` (`NOT_MET`), `SEM-007` (`UNDETERMINED`), `SEM-027` (`[DEP-01]`/`[DEP-08]`), `SEM-029`.
- **Interaktionsarchitektur:** Klick auf ein `TargetGoal` hebt die zugehörigen `derived_from`-Schritte im Trace hervor; direkter Vergleichs-Sprung zu Sicht 5 (`attempt` und `tick` bleiben synchron).
- **Komponentenidentitäten:** `InverseSweepHeaderCard`, `TargetAssessmentMatrix`, `SweepTraceTimeline`, `SweepOutputTabs`.
- **Zustandsrelationen:** `NOT_AVAILABLE_AT_TICK` an Nicht-Sweep-Ticks; `BLOCKED`-Handling identisch zu Sicht 5.
- **Datenverträge:** `GET /experiments/{id}/results?tick=t&direction=inverse&attempt=a` (#6), `GET /experiments/{id}/results/{sweep_id}/trace` (#14).
- **Synchronisationsbedingungen:** `(experiment_id, tick, attempt)`, strikte Trennung von `ForwardResult`.

    +---------------------------------------------------------------------------------------+
    | [06] INVERSE SWEEP INSPECTOR   sweep:inv:t3:a0   [COMPLETED]   Origin: [FIXTURE]      |
    +---------------------------------------------------------------------------------------+
    | Target: tgt:resilience_v1 (beobachtungsbasiert) | Termination: [CONVERGED] steps=5    |
    +---------------------------------------------------------------------------------------+
    | TARGET ASSESSMENT (Zielprüfung Z gegen Ω_O)                                           |
    | goal:g1 | subject: node:n03 | RULE_SATISFIED (rule:r01)    | [NOT_MET]  (derived: #03)|
    | goal:g2 | subject: node:n07 | ATTRIBUTE_EQUALS (STANDBY)   | [MET]      (derived: #04)|
    | goal:g3 | subject: node:n09 | GAP_CLOSED                   | [UNDETERMINED] (#05)     |
    +-------------------------------------------+-------------------------------------------+
    | INVERSE SWEEP TRACE (ohne Forward-Bezug)  | INVERSE OUTPUT [Values|Rel|GAPs|OpenRel]  |
    | #01 [Σ30 Recursive Closure Thr] op: ∇     | attr:n07/state  DET   STANDBY  [HYPOTH.]  |
    | #02 [op: I04 OPAQUE DEP-01]     op: ⊖     | attr:n08/state  DET   NOMINAL  [STRUCT]   |
    | #03 [Σ01 Active Carrier Nodes]  op: ↔     | gap:g02         OPEN  node:n03 [STRUCT]   |
    +-------------------------------------------+-------------------------------------------+

---

### Sicht 07 — `STRUCTURAL_GAP_INSPECTOR` (Struktureller GAP- & Matching-Inspektor)

- **Informationsarchitektur:** Gegenüberstellung der durch `F05` gemeldeten `StructuralGap`s (mit `source_refs`, `subject_refs`, `epistemic_class`, `status`) und der `GapMatch`-Paarungen aus `F06` (`subjects_tickwindow_1to1/v1`, `K-47`), gruppiert nach normalisierten Knotenklassen $N(x)$ und filterbar nach `CaseSubset` (`ALL` vs. `OBSERVABLE_CASES`, `K-46`).
- **Raumarchitektur:** Oben Filter- & Bilanzleiste (`TP`, `FP`, `FN`, Umschalter `ALL` / `OBSERVABLE_CASES`, `matcher: StrategyRef`); darunter zweigeteilter Hauptbereich: links die Liste der normalisierten Äquivalenzklassen $K(t)$ mit 1:1-Paarung (`Case ↔ Gap`), rechts der Detailinspektor der gewählten GAP inkl. Quellreferenzen (`source_refs`).
- **Visuelle Semantik:** `SEM-024` (`OPEN`), `SEM-025` (`CLOSED_IN_RESULT`), `SEM-010` (`TP`), `SEM-011` (`FN`, `FP`), Kennzeichnung nicht beobachtbarer Fälle (`observable = false` unter $\Theta$, `K-57`).
- **Interaktionsarchitektur:** Umschalten `ALL` vs. `OBSERVABLE_CASES` aktualisiert die hervorgehobenen Fälle ohne Neurechnung im Frontend (reine Filterung der `GapMatch`-Einträge); Klick auf `source_ref` öffnet Zone E.
- **Komponentenidentitäten:** `GapMatchSummaryBar`, `CaseSubsetToggle`, `NormalizedClassAccordion`, `GapDetailCard`, `SourceRefAnchorList`.
- **Zustandsrelationen:** `NOT_AVAILABLE_AT_TICK` wenn am Tick kein Sweep vorliegt; bei fehlenden Annotationen werden die `StructuralGap`s dennoch vollständig ohne `GapMatch`-Spalte angezeigt.
- **Datenverträge:** `GET /experiments/{id}/results?tick=t` (#6), `GET /experiments/{id}/metrics?aggregation=PER_TICK&tick=t` (#7, inkl. `GapMatch` & `GUI-GAP-07`).
- **Synchronisationsbedingungen:** Synchronisiert auf `(experiment_id, tick, attempt)`.

    +---------------------------------------------------------------------------------------+
    | [07] STRUCTURAL GAP INSPECTOR (t=3)   Subset: (●) ALL  ( ) OBSERVABLE_CASES   [FIX]   |
    +---------------------------------------------------------------------------------------+
    | Matcher: subjects_tickwindow_1to1/v1  |  TP: 3  |  FN: 1 (1 nicht sichtbar) |  FP: 1  |
    +-------------------------------------------+-------------------------------------------+
    | NORMALISIERTE KLASSEN N(x) -> 1:1 PAARUNG | GAP-DETAILS & QUELLBEZÜGE                 |
    | Klasse {node:n03}                         | gap:g01  [OPEN]  class: STRUCTURAL_DERIV  |
    |   case:c01 <===[TP]===> gap:g01           | kind (Engine): "state_rule_divergence"    |
    | Klasse {node:n08}                         | subjects: [attr:n08/state, node:n08]      |
    |   case:c02 <===[TP]===> gap:g02           | source_refs (Pflicht ≥1):                 |
    |   (kein Fall)  [FP]     gap:g03           |   • obs:none:n08/state:t3                 |
    | Klasse {node:n10} [nicht sichtbar Θ]      |   • rule:r02@1.0.0                        |
    |   case:c04     [FN]     (keine Gap)       | Verdict: TP (gepaart mit case:c02)        |
    +-------------------------------------------+-------------------------------------------+

---

### Sicht 08 — `ARCHITECTURAL_CLOSURE_INSPECTOR` (Schließungs-, Konflikt- & Rekursions-Inspektor)

- **Informationsarchitektur:** Realisiert `D-22` (`ui.closure_view: gaps_relations_termination_m09/v1`): vereint den Schließungszustand von `StructuralGap`s (`OPEN` vs. `CLOSED_IN_RESULT`), offene Relationen (`OpenRelation` inkl. `ReferenceStatus`), `MergeRecord`/`MergeConflict`s, `TerminationRecord`s, `RecoveryProposal`s samt zugehörigen menschlichen `AuthorityRecord`s (`05.5`) sowie die `M09`-Schließungsbilanz (sofern `comparisonId` aktiv).
- **Raumarchitektur:** Vier klar abgegrenzte Quadranten: (1) GAP- & Relations-Schließung, (2) Merge-Konflikte & Terminierung, (3) Vermittelte Rekursion (`RecoveryProposal → AuthorityRecord`), (4) `M09`-Closure-Zusammenfassung (mit Sprung zu Sicht 10).
- **Visuelle Semantik:** `SEM-020` (Mensch-Gate), `SEM-024`/`SEM-025`, `SEM-026` (`MergeConflict`), `SEM-029` (`TerminationRecord`).
- **Interaktionsarchitektur:** Klick auf ein `RecoveryProposal` zeigt dessen `subject_refs` und verknüpften `AuthorityRecord` (`APPROVED`/`REJECTED` + `rationale`); bei aktiviertem optionalen Endpunkt #21 (`POST /recovery-variants`) öffnet ein expliziter Button den Autorisierungs-Dialog (keine Auto-Anwendung, `P11`).
- **Komponentenidentitäten:** `ClosureQuadrantGrid`, `OpenRelationTable`, `MergeConflictPanel`, `TerminationSummaryCard`, `RecoveryAuthorityBridge`, `M09ClosureCard`.
- **Zustandsrelationen:** Fehlt ein `ComparisonReport`, zeigt Quadrant 4 einen expliziten Hinweis (`Kein Vergleich verknüpft — Vergleich in Sicht 10 wählen`) statt leerer Zahlen.
- **Datenverträge:** `GET /experiments/{id}/results?tick=t` (#6, inkl. `GUI-GAP-06`), optional `GET /comparisons/{comparison_id}` (#19).
- **Synchronisationsbedingungen:** Synchronisiert auf `(experiment_id, tick, attempt, comparisonId?)`.

    +---------------------------------------------------------------------------------------+
    | [08] ARCHITECTURAL CLOSURE INSPECTOR (t=3)      Strategie: gaps_relations_term_m09/v1 |
    +-------------------------------------------+-------------------------------------------+
    | 1. GAP- & RELATIONS-SCHLIESSUNG           | 2. MERGE-KONFLIKTE & TERMINIERUNG         |
    | StructuralGaps:  2 OPEN | 1 CLOSED_IN_RES | MergePolicy: merge.policy:engine_first/v1 |
    | OpenRelations:   1 (rel:dep:n07:n08)      | engine_merged: true | Konflikte: 1        |
    |   status: UNRESOLVED | ref: TRUNCATED     |  • attr:n08/state: FWD=DEG vs INV=NOM     |
    |                                           |    Resolution: [ENGINE_RESOLVED]          |
    |                                           | Termination: FWD=CONVERGED, INV=CONVERGED |
    +-------------------------------------------+-------------------------------------------+
    | 3. VERMITTELTE REKURSION (F05 -> F02 -> F3)| 4. M09 GAP CLOSURE (Comparison)           |
    | prop:p01 [PROPOSED]                       | Comparison: cmp:base_vs_rec (τ=5)         |
    |   "Isoliere degradierte Kante n03->n08"   | M09 = 3/5 (0.600) [Ziel: 1]               |
    |   ──> ◊ AuthorityRecord auth:d01          | resolved: 3 | persisting: 2 | new: 1      |
    |       role: role:operator | [APPROVED]    | unevaluable_in_recovery: 0                |
    |       -> scn:recovery_v1 (RECOVERY)       | [Öffne Detailvergleich in Sicht 10 ->]    |
    +-------------------------------------------+-------------------------------------------+

---

### Sicht 09 — `STRUCTURAL_METRICS` (Strukturelle Metrikkette M01–M11)

- **Informationsarchitektur:** Darstellung aller 11 Metriken `M01`–`M11` in linearer Erkenntniskette (`D-32`: $\Omega_A \to \Omega_O \to \Omega_R \to \text{GAP/Stability/Closure}$), stets mit exaktem Bruch $n/d$, abgeleitetem Dezimalwert, Zielwert (`0` oder `1`), `ReferenceSpace`-Hash, `MetricAux`-Zählern und aktiven `StrategyRef`s. **Strikt ohne Gesamtindex (`REQ-049`).**
- **Raumarchitektur:** Oben Aggregations- und Strategieleiste (`POOLED`, `PER_TICK`, `TIME_MEAN_EXPLICIT` mit Warn-Tag bei explizitem Mittelwert; `to_tick` bei `POOLED`/`TIME_MEAN`, `K-25`; Liste der `StrategyRef`s); darunter drei vertikal geordnete Kettenbänder (Band 1: Basis & Beobachtung; Band 2: Rekonstruktion & Kohärenz; Band 3: GAP, Stabilität & Closure).
- **Visuelle Semantik:** `SEM-021` (exakter Bruch + Balken zum Zielwert), `SEM-022` (`UNDEFINED` mit `ZERO_DENOMINATOR` oder `INPUT_MISSING`), raumgebundene Unter-Chips für `M02(A, O, R)` und `M03(A, O, R)`, explizite Anzeige von `M04` je Servicefunktion + gepoolt (`K-19`) sowie `M07(ALL)` neben `M07(OBSERVABLE_CASES)` (`K-46`).
- **Interaktionsarchitektur:** Wechsel der Aggregation aktualisiert URL und ruft `/metrics` neu ab; Klick auf eine Metrikkarte öffnet `ReferenceSpace`-Mitglieder (`space_hash`) und vollständige `MetricAux`-Felder in Zone E.
- **Komponentenidentitäten:** `MetricAggregationBar`, `StrategyRefStrip`, `MetricChainBand`, `RationalMetricCard`, `UndefinedMetricSlot`, `ReferenceSpaceDrawerContent`.
- **Zustandsrelationen:** `M01` und `M11` zeigen visuell gekoppelt die Identität $\text{M11} = 1 - \text{M01}$ (`K-15`); `M10` zeigt neben dem Hauptwert stets `shared_coverage` und den Hinweis `FIXTURE`-Determinismus (`H-33`), falls `data_origin == FIXTURE`.
- **Datenverträge:** `GET /experiments/{id}/metrics?aggregation=...&tick=...&to_tick=...` (#7, inkl. `GUI-GAP-08`).
- **Synchronisationsbedingungen:** Bei `aggregation=PER_TICK` wird der globale `tick` verwendet; bei `POOLED`/`TIME_MEAN_EXPLICIT` darf `tick` nicht gesendet werden (`422`-Vermeidung nach `K-25`).

    +---------------------------------------------------------------------------------------+
    | [09] STRUCTURAL METRICS   Agg: [●POOLED] [PER_TICK] [TIME_MEAN]  to_tick: 5  [FIX]    |
    | Strategien: hypothesis=include/v1 | weighting=weighted/v1 | matcher=subjects_1to1/v1  |
    +---------------------------------------------------------------------------------------+
    | BAND 1 :: BASIS & BEOBACHTUNG (Ω_A -> Ω_O)                                            |
    | [M06 Obs. Completeness]  6/10  (0.600) -> 1 | aux: stale_known=1                      |
    | [M02 Rel. Coherence]     A: 4/5 (0.80) | O: 2/2 (1.00, 3⊥) | R: 3/4 (0.75, 1⊥)        |
    | [M03 Temp. Consistency]  A: 3/4 (0.75) | O: 2/3 (0.67, 1⊥) | R: [UNDEFINED: INPUT_MIS]|
    | [M04 Func. Continuity]   gepoolt: 9/11 (0.818) | f1: 3/5 (1 excl) | f2: 6/6           |
    +---------------------------------------------------------------------------------------+
    | BAND 2 :: REKONSTRUKTION (Ω_A x Ω_R)                                                  |
    | [M05 Rec. Coverage]      8/10  (0.800) -> 1 | aux: undetermined=2                     |
    | [M01 Rec. Distance]      1/8   (0.125) -> 0 | aux: hyp_excl=0  <-- exakt 1-M11 -->    |
    | [M11 Rec. Accuracy]      7/8   (0.875) -> 1 | space_hash: sha256:9f2a...              |
    +---------------------------------------------------------------------------------------+
    | BAND 3 :: GAP, STABILITÄT & CLOSURE (kein Gesamtindex — REQ-049)                      |
    | [M07 GAP Coverage]       ALL: 3/4 (0.750) | OBSERVABLE: 3/3 (1.000)                   |
    | [M08 GAP Precision]      3/4   (0.750) -> 1 | aux: tp=3, fp=1                         |
    | [M10 Stability (a0xa1)]  5/6   (0.833) -> 1 | shared_cov: 3/5 | [FIXTURE-Hinweis]     |
    | [M09 GAP Closure]        3/5   (0.600) -> 1 | persist=2, new=1, uneval_rec=0          |
    +---------------------------------------------------------------------------------------+

---

### Sicht 10 — `SCENARIO_COMPARISON` (Baseline vs. Recovery Vergleich)

- **Informationsarchitektur:** Gegenüberstellung zweier vergleichbarer Experimente (`BASELINE` vs. `RECOVERY`, gemeinsame `fixture_lineage_id`, identische Topologie- und Governance-Version, `K-43`) am `comparison_tick` $\tau$, inklusive vollständiger Ausweisung der fünf `M09`-Mengen (`original`, `resolved`, `persisting`, `unevaluable_in_recovery`, `new`) und aller Vergleichs-Metriken.
- **Raumarchitektur:** Oben Vergleichs-Selektor (Baseline-ID, Recovery-ID, `comparison_tick` $\tau$, Button „Neuen Vergleich erstellen“ → `POST /comparisons`); darunter Kompatibilitäts-Banner (`compatible: true` oder `COMPARISON_INCOMPATIBLE` mit Grundliste); darunter 4-Spalten-Statusboard (`Resolved`, `Persisting`, `Unevaluable in Recovery`, `New Inconsistencies`) und Metrik-Delta-Tabelle.
- **Visuelle Semantik:** `SEM-010` (`resolved`), `SEM-011` (`persisting`, `new`), `SEM-012` (`unevaluable_in_recovery`), `SEM-020` (Verweis auf `AuthorityRecord`, aus dem die `RECOVERY`-Variante entstand).
- **Interaktionsarchitektur:** Auswahl bestehender `ComparisonReport`s oder Anlage eines neuen Vergleichs; Klick auf einen Regel-Schlüssel `(rule_id, scope)` öffnet die Regelauswertung beider Experimente in Zone E.
- **Komponentenidentitäten:** `ComparisonSelectorBar`, `CompatibilityGuardBanner`, `ClosureBucketBoard`, `ComparisonMetricTable`.
- **Zustandsrelationen:** Bei `compatible == false` werden keinerlei M09-Werte angezeigt, sondern ausschließlich die exakte `incompatibility`-Liste (`K-43`).
- **Datenverträge:** `POST /comparisons`, `GET /comparisons/{comparison_id}` (#19), `GET /experiments` (#9).
- **Synchronisationsbedingungen:** Synchronisiert über `comparisonId` in der URL; zeigt `comparison_tick` $\tau$ explizit an.

    +---------------------------------------------------------------------------------------+
    | [10] SCENARIO COMPARISON   Baseline: exp:base_01  vs  Recovery: exp:rec_01  (τ=5)     |
    +---------------------------------------------------------------------------------------+
    | Kompatibilität: [COMPATIBLE] lineage: lin:fx0411 | topo@1.0.0 | gov@1.0.0 | M09: 3/5  |
    +--------------------+--------------------+--------------------+------------------------+
    | RESOLVED (3)       | PERSISTING (2)     | UNEVALUABLE (0)    | NEW INCONSISTENCY (1)  |
    | [✓] rule:r01 (n03) | [✕] rule:r02 (n08) | (keine)            | [!] rule:r05 (n07)     |
    | [✓] rule:r03 (n05) | [✕] rule:r04 (n09) |                    |                        |
    | [✓] rule:r06 (n06) |                    |                    |                        |
    +--------------------+--------------------+--------------------+------------------------+
    | METRIK-GEGENÜBERSTELLUNG (am Tick τ=5)                                                |
    | M09 GAP Closure      |  3/5 (0.600) | basis: state_rules_A_final_tick/v1              |
    | M02 Coherence (Ω_A)  |  Base: 2/7   | Rec: 4/7 (+2/7)                                 |
    | M04 Continuity (Ω_A) |  Base: 3/5   | Rec: 5/5 (+2/5)                                 |
    +---------------------------------------------------------------------------------------+

---

### Sicht 11 — `EVENT_TIMELINE` (Ereignis- & Stufen-Zeitleiste)

- **Informationsarchitektur:** Chronologischer, streng monotoner Strom aller `EventRecord`s aus `F03` (`SET_ATTRIBUTE`, `APPLY_APPROVAL`, Status `APPLIED`/`REJECTED`, `effects: AttributeChange[]`) und aller `StageEvent`s des Experiments (`DEFINITIONS`..`EXPORT`), direkt gekoppelt an den globalen `TickSelector` (Zone D).
- **Raumarchitektur:** Oben Filterleiste (Spur-Toggle `F03 Events` / `StageEvents`, Statusfilter `APPLIED`/`REJECTED`/`ERROR`, Tick-Bereich `from..to`); darunter chronologische Zwei-Spur-Tabelle mit klarer visueller Tick-Gruppierung (`t=0`, `t=1`, ...) und Hervorhebung des aktuell in Zone D gewählten Ticks.
- **Visuelle Semantik:** `SEM-001` für `F03 EventRecord`s, `SEM-023` für `AttributeChange (before ▸ after)`, `SEM-010`/`SEM-011` für `APPLIED`/`REJECTED`, `ErrorRecord`-Badge bei `INVALID_TRANSITION` oder `BLOCKED`.
- **Interaktionsarchitektur:** Klick auf eine Tick-Zeile setzt den globalen `tick` in der URL (synchronisiert Zone D und alle anderen Sichten); Klick auf einen Eintrag öffnet `event_ref` und `effects` in Zone E.
- **Komponentenidentitäten:** `TimelineFilterBar`, `DualTrackEventList`, `TickGroupHeader`, `AttributeEffectRow`, `StageEventRow`.
- **Zustandsrelationen:** Zeigt `StageEvent.recorded_at` (falls im Live-Index vorhanden) nur als diagnostische Nebeninformation mit Hinweis „nicht Teil des deterministischen Exports (`K-52`)“.
- **Datenverträge:** `GET /experiments/{id}/events?from=f&to=t` (#13).
- **Synchronisationsbedingungen:** Gekoppelt an den globalen `tick`; Scroll-Fokus folgt bei externem Tick-Wechsel automatisch dem aktiven Tick.

    +---------------------------------------------------------------------------------------+
    | [11] EVENT TIMELINE   Spuren: [x] F03 Events  [x] StageEvents   Bereich: t=0..5       |
    +---------------------------------------------------------------------------------------+
    | TICK | SEQ | QUELLE  | TYP / STUFE     | STATUS    | EFFEKT / DETAIL                  |
    +------+-----+---------+-----------------+-----------+----------------------------------+
    | t=0  | 001 | STAGE   | EMULATION       | RUNNING   | Start F03 Szenario fx_scn_base   |
    | t=1  | 002 | F03     | SET_ATTRIBUTE   | APPLIED   | attr:n03/state: NOMINAL ▸ DEGRAD |
    | t=2  | 003 | F03     | APPLY_APPROVAL  | APPLIED   | approval:ap01 (APPROVED)         |
    |>>t=3 | 004 | F03     | SET_ATTRIBUTE   | REJECTED  | attr:n10/state (NOT_APPLICABLE)  |
    |>>t=3 | 005 | STAGE   | FORWARD (t=3)   | COMPLETED | sweep:fwd:t3:a0 (FIXTURE)        |
    |>>t=3 | 006 | STAGE   | INVERSE (t=3)   | COMPLETED | sweep:inv:t3:a0 (FIXTURE)        |
    |>>t=3 | 007 | STAGE   | MERGE   (t=3)   | COMPLETED | recon:t3:a0 (1 Konflikt)         |
    +---------------------------------------------------------------------------------------+

---

### Globale Funktion — `EXPORT_ACTION` & `CONTROL_LIFECYCLE_DRAWER` (`A-01`, `GUI-GAP-10`)

- **Export (`A-01`):** Permanent in Zone A verfügbar (`GET /experiments/{id}/export?format=json`, #8). Deaktiviert mit Tooltip während `ExecutionStatus == RUNNING` (`409 CONFLICT`-Schutz). Nach erfolgreichem Abruf wird eine nicht-blockierende Verifikationszeile mit `bundle_version`, Artefaktanzahl und `bundle_hash` angezeigt.
- **Control & Lifecycle Drawer (`GUI-GAP-10`):** Über Zone A erreichbar für:
  1. Neues Experiment anlegen (`POST /experiments`, #3 — Szenario, `ObservationConfig`, Pflicht-`TargetDefinition` `K-11`, Adapter, `SweepSchedule`, `StabilityConfig`).
  2. Re-Sweep auslösen (`POST /experiments/{id}/sweeps`, #15 — erzeugt `attempt + 1`).
  3. Externe F05-Ergebnisse importieren (`POST /experiments/{id}/results/import`, #16 — `IMPORTED`).
  4. Deterministisches Replay starten & prüfen (`POST /experiments/{id}/replay`, `GET /experiments/{id}/replay-report`, #17 — `SYNTHETIC` oder `PRESERVED_ENGINE`, `K-23`).
  5. Experiment-Bundle importieren (`POST /experiments/import`, #18 — `T10`).

---

*Ende des Artefakts `SYNTX_CIRA_Systemic_Semiontic_GUI_Reference_Architecture_v1.0.0.md` — Execution Boundary eingehalten (Architecture Only, No Code).*