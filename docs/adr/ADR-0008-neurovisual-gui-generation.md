# ADR-0008 — Neurovisuelle GUI-Generation (Architektur v2.0.3)

Status: ACCEPTED (Rahmen) · Einträge je Einheit U00–U30
Datum: 2026-11-27 · Branch `feature/semiontic-gui-v2` ab `ac5073b` · Klasse F2 (Gestaltung ohne Semantikwirkung, E-07)
Grundlage: `docs/architecture/gui-v2/…_v2.0.3.md` (eingefroren, Freigabe Owner, GPT, Gemini, Claude; Owner
Implementation Release DEP-V3-01 vom 2026-11-27). `main` bleibt auf `ac5073b`.

## Rahmen
- Keine Änderung an Backend, Verträgen, Schemas, Endpunkten, Anfragen, Metriken, eingefrorenen Bündeln,
  `demo.steps.json`, Produktfilm oder `main`. Sichtbarer Text nur aus `cira.terms.yaml`; „SYNTX“ bleibt gesperrt.
- Generierte Dateien nur über die Generatoren (E-10). Keine Ignore-Einträge (E-16), keine gelockerten Tests (E-09).
- Neue Zeichen (SEM-038) und Dekor (DEC-04…08) sind Registererweiterungen der Klasse F2 wie DEC-01–03 (ADR-0007).
- Alles, was Verträge, die G03.3-Matrix oder eingefrorene Bündel berühren würde, wird F3 → `docs/change-requests/`.

## Owner-Entscheidungen (eingefroren)
| OD | Entscheidung |
|---|---|
| OD-01 | keine chromatische Abschwächung (K1) |
| OD-02 | `surface.focus #141D27`, neues Zeichen SEM-038 „Mit Auswahl verknüpft“ |
| OD-03 | Nachweis über `make gate PHASE=05` auf dem Branch |
| OD-05/OD-11 | Korrekturen G3-14, G3-15, G3-29, G3-37 nur auf dem Branch |
| OD-06 | DEC-04 Emblem, DEC-05 Bögen, DEC-06 drei Emblemachsen, DEC-07 Vignette |
| OD-08 | Aufmerksamkeitsdämpfung (MOT19, R11 — ein Bit je Fokus-Zustand) |
| OD-09 | Emblemlicht DEC-08 und am Anker zentrierte Vignette |
| OD-10 | Tiefenschatten, vom Anker weg geworfen |
| OD-12 | Projektorkante `#546D86` |
| OD-13 | Q2-01, Q2-03–Q2-06 wie spezifiziert |
| OD-14 | Präsentationsskala `clamp(1, 1,25 × H/1080, 1,25)` |
| OD-15 | Kurzbühne 880 px, Schatten 0,55 / −6 px, gemeinsamer Atem von Emblem und Licht |
| OD-07 | Promotion nach `main` und neuer Film: offen (eigene Owner-Freigabe) |

## Einträge je Einheit
| Einheit | Datum | Inhalt | Nachweis |
|---|---|---|---|
| U00 | 2026-11-27 | Branch ab `ac5073b`, Architektur v2.0.3 abgelegt, ADR-Rahmen, NEXT/SESSION_LOG | `make verify` grün (Ausgangslage) |
| U01 | 2026-11-27 | Request- und Feld-Inventar je Sicht von `ac5073b` (`frontend/test/inventory/main-ac5073b.json`, geschrieben nur per `CIRA_WRITE_INVENTORY=1`, nie grün); Harness zeichnet API-Anfragen auf | V3T03/V2T01: 23 Tests grün |
| U02 | 2026-11-27 | Inspektionsläufe außerhalb von `verify`: `npm run inspect` (132er-Matrix 11 Sichten × 3 Viewports × EN/DE × 2 Modi), `npm run inspect:perf` (Frame-Intervalle, Long Tasks); Selbsttest der Matrix | Matrix-Selbsttest grün; Probelauf Sicht 01: 12 PNG |
| U03 | 2026-11-27 | `cira.semiontics.yaml` 1.1.0: abgeleitete Farben als Formeln (`derive`), Projektorprofil, Komponenten-, Dekor-, Kompositions- und Licht-Tokens, Bewegungs-Tokens, deklarierte Farbübergänge; Rundung abgeleiteter 8-bit-Werte: half to even | V3T01 |
| U04 | 2026-11-27 | Generator: `resolve()` (mix, lightest_on_path), `neuro_report()` (Fokusfläche, Pfadminima, Dekorbudgets, Grafik-Tinten, Projektorprofil), Ausgabe `--cmp-/--decor-/--comp-/--light-*`, Projektorblock, `COMPONENT/DECOR/COMP/LIGHT` in tokens.ts | V3T01: 10 Tests grün; Werte = Architektur (#141D27, #0B1922/#1A160E/#151424, #546D86) |
| U05 | 2026-11-27 | Rollenvariablen `--ink-1/2/3`, `--surface-block`, `--border-block`, `--tint-a/o/r` in `app.css`; Ruhewert = kanonischer Token; Ausnahmeset pinnt zurück | **CP1:** TX29 pixelgleich (11 Baselines unverändert), 517/517 grün |
| U06 | 2026-11-27 | Ausnahmeset in `semAttrs` (`data-attn="exempt"` für 006–009, 011–017, 019, 020, 022, 024, 028, 031, 035); Rollen-Lint | V3T04 grün |
| U07 | 2026-11-27 | Abwesenheitsträger (Zellen, UndefinedSlot) auf `surface.void`, ohne Übergang und Animation | V2T08-Teil grün; 4 Baselines nach Sichtprüfung ersetzt (`docs/gui/inspection/U07-U08.md`) |
| U08 | 2026-11-27 | LOADING ohne Text-Ausblendung (G3-14): Maske deckend, 2-px-Ladelinie; vorher Text bei 0,35 Deckkraft = 1,72 : 1 | V3T08 grün (Kontrast ≥ 4,5 bei verzögerter Antwort) |
| U09 | 2026-11-27 | SEM-038 „Linked to selection“ (Kanäle outline-offset-solid · ink.secondary, Sichten 1–11, Primitive `ResonanceMark`), Begriffe `focus.linked`, `focus.absent` (EN/DE) | TX22/TX24 grün (Sammellauf mit U10: 524/524) |
| U10 | 2026-11-27 | Tiefen-Tokens `depth.*` (Ordnung vom Generator geprüft), Zone C als eigener Stapelkontext (`isolation: isolate`), Quarantäne zuoberst | V3T09 grün; TX29 pixelgleich |
| U11–U13 | 2026-11-27 | `AmbientField` (ersetzt NeuralField; Netz, Drift, Pulse, zwei Budgets über Belegungsmasken, Governor mit Frame-Budget), `stageAnchor` (Anker, Achsen, Grenze, Schattenvektor, Fit, Bühnenklasse, Präsentationsskala), DEC-04…08 registriert, Licht und Schatten (Lichtmodell 05.18), R11-Dämpfung in CSS, deckender Plotgrund Sicht 02 (G3-15), Markenzeichen als hochaufgelöster Ausschnitt; in jsdom ohne Layout-Beobachter. Gemeinsamer Commit, weil Anker und Szene eine Komponente sind | V3T11 (Einheit), V3T19 (Fit), V2T04/V3T02 (10 Sichten), G3-31-Prüfung (10 Sichten); 6 Baselines nach Sichtprüfung ersetzt (`docs/gui/inspection/U11-U13.md`); 552/552 |
| U14 | 2026-11-27 | `FocusScope` (Kontext `state(id)` → focused/resonant/attenuated, Escape löst), `FocusHandle` (Schaltfläche, `aria-pressed`, `aria-current`), Abwesenheitshinweis `focus.absent` bei Fokus ohne Ziel, `setFocus` in der Session ersetzt die URL (`replaceState`, kein Verlaufseintrag) | V3T05: 5 Tests grün |
| U15 | 2026-11-27 | Pilot Ansicht 03: Resolver `resolveResonance` (reine Auswahl über `input_attribute_refs` der A/O/R-Auswertungen, keine Arithmetik), Zeilen mit `data-focus-state`, `FocusFrame` (2 px `ink.primary`, Retikel) und `ResonanceMark` (SEM-038) als eigene Rasterelemente über `grid-row: attr(data-row type(<integer>))`, Aufmerksamkeitsachse, Dämpfung über Rollen; Fokus- und Achsfarben als Zeichenrollen im Rollenblock (V3T04); `is-focused` nie auf Abwesenheitsträgern; SEM-038 als `inset`-Schatten (Chrome rastet Rahmenbreiten auf Gerätepixel); Zeilenabstand 8/10 px. U14 und U15 gemeinsam geprüft und committet | V2T19/V3T14/V2T18 (Ansicht 03) grün; 1 Baseline nach Sichtprüfung ersetzt (`docs/gui/inspection/U14-U15.md`); 560/560 |
