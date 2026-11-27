# SYNTX :: CIRA — Kopplungsarchitektur Produktfilm ↔ Bühnenpräsentation v0.5 (FROZEN)

| Kopf | Wert |
|---|---|
| Artefakt | `SYNTX_CIRA_Film_Presentation_Coupling_Architecture_v0.5_FROZEN.md` |
| Status | **FROZEN v0.5** — Vier-System-Gate bestanden, Implementierungsfreigabe durch den Owner erteilt |
| Datum | 2026-11-27 |
| Owner | Ottavio Braun (OB) — Freigabe 2026-11-27, 11:49 MEZ |
| Gate | GPT: Sign-off v0.4 + Korrekturen I5/I12 · Claude: Sign-off v0.5 · Gemini: Sign-off v0.5 · Owner: Freigabe |
| Methode | System Field Engineering: Felder, führende Artefakte, Relationen, Invarianten, Nachweis |
| Abgrenzung | eigenes Feld neben dem Systempaket v1.0.2 (FROZEN) und der GUI-Architektur v2.0.3 (FROZEN); ändert keines von beiden |

## 0 — Ziel und Grenze

Der Produktfilm ersetzt das Probe-Storyboard im Zustand S04 der Bühnenpräsentation. Präsentation, Film, Sprechtext und Herkunftsangaben bilden ein konsistentes System mit getrennten Zeitgrößen.

- Narration D04 bleibt wortgleich; einzig der Herkunftssatz in F1 wird über `originReplacement` auf `fixture` gebunden.
- Der Film wird nicht verändert (keine Neukodierung, kein Schnitt).
- Nicht im Umfang: Puzzle-Hook (eigenes Feld, E4), Neuaufnahme des Films, Engine-Anbindung, GUI v2.0.3, dynamische Freigabe-Schleife.

## 1 — Eingangsfeld

| Artefakt | Stand | Rolle |
|---|---|---|
| `video/CIRA_Product_Film_80s.mp4` | Commit ac5073b, 80,0 s, 8 × 10 s, Daten FIXTURE | Inhaltsquelle S04 |
| HTML-Bühne `cira-presentation` | v3, `config/timeline.json` v1.0.1 | primäres Bühnenartefakt |
| `presentation/CIRA_EDTH2026_SYNTX.pptx` | Commit d9ce6ed, 9 Folien | Fallback-Artefakt |
| `config/narration.json` | D04 v1.0.1 | Sprechtext, Herkunftsregel |
| `frontend/src/demo/demo.steps.json`, `frontend/semiontics/cira.terms.yaml` | main | Schritt → Ansicht → Untertitel |
| Handbuch v1.0.0, Stage Card v1.0.0, Mentor-Brief DE/EN | Commit c0be7ee | abgeleitet |

## 2 — Felder

| Feld | Aufgabe | führendes Artefakt / Ausgabe | liest |
|---|---|---|---|
| K1 Filmfeld | Film vermessen und versiegeln | **`film.manifest.json`** (führend), 8 Schritt-Standbilder | Film |
| K2 Segmentfeld | nur in Stufe B/C aktiv; in Stufe A leer | — | K1 |
| K3 Zeitfeld | kanonische Zeit 0–180 s | **`timeline.json` v1.0.2** (führend) | — |
| K4 Narrationsfeld | Wortlaut, Herkunftsvariante, Satz → Anker | **`narration.json`** (führend) | — |
| Kopplung | bindet K1 × K3 × K4 | **`s04.binding.json`**: Hash × Timeline-Version × Narration-Version, aufgelöste Anker, Ankerprüfung | K1, K3, K4 |
| K5 Herkunftsfeld | sichtbare Herkunft auf der Bühne | Badge-Zustand je Cue | K1 |
| K6 Präsentationsfeld | HTML-Bühne (primär), PowerPoint (Fallback), Presenter-Ansicht | Szenen, Folien, Notizen | Binding, K5 |
| K7 Ableitungsfeld | Dokumente entlang der Wirkungsmenge | Handbuch, Stage Card, PowerPoint-Notizen | Binding |
| K8 Nachweisfeld | Tests, Istmessung, Synchronitätsprotokoll, Laufprotokoll | Nachweisbericht | alle |

Kein Feld schreibt in ein fremdes führendes Artefakt. Ändert sich eines der drei führenden Artefakte, ist das Binding ungültig und wird neu aufgelöst und geprüft.

## 3 — Relationen

| Relation | Paar | Regel |
|---|---|---|
| R1 Zeit | Bühne ↔ Film | Filmstart beim Schnitt S03 → S04 (kanonisch 70,000 s), Ende kanonisch 150,000 s |
| R2 Struktur | Film ↔ F1–F4 | F1–F4 sind logische Narrationssegmente über einem durchgehenden Video |
| R3 Inhalt | Satz ↔ sichtbare Ansicht | über Satzanker (Abschnitt 5) |
| R4 Herkunft | Daten ↔ Satz ↔ Badge | FIXTURE ⇒ F1-Satz „This recording shows test results from a fixture.“; kein „Illustrative“ in S04 |
| R5 Zahl | Bildzahl ↔ Sprache | keine gesprochene Zahl ohne Bindung an einen Engine-Export |
| R6 Identität | CIRA ↔ SYNTX | Film SYNTX-frei (TX24); SYNTX-Logo nur im Präsentationsrahmen außerhalb S04; „Powered by“ in S06 |
| R7 Lesbarkeit | Film-UI ↔ Projektion | Mindestschrift lesbar; Vollbild in S04 |
| R8 Rahmen | Bühnen-Schiene ↔ Film-UI | Schiene pausiert in S04, kehrt in S05 zurück |
| R9 Ableitung | Quelle ↔ Dokumente | Dokumente tragen keine eigenen Zeiten; nur Wirkungsmenge wird aktualisiert |

## 4 — Grenzklassen

| Klasse | Inhalt | Quelle | verschiebbar |
|---|---|---|---|
| G1 Film-Cue-Grenzen | 8 Schrittwechsel, gemessen über Präsentationszeitstempel | `film.manifest.json` | nein |
| G2 Harte visuelle Satzanker | Satzbeginn und Satzende im Sichtbarkeitsfenster | Binding | nein; Fenster folgt G1 |
| G3 Flexible Narrationsgrenzen | Übergänge F1\|F2\|F3\|F4 | Narration + Probedurchlauf | ja, unter N1–N5 |

N1 Reihenfolge und Wortlaut unverändert · N2 keine Überlappung · N3 harte Anker vollständig im Fenster · N4 S04-Narration in [70,0 s; 149,0 s], nichts vor dem Schnitt · N5 weiche Anker bevorzugt im Fenster.

## 5 — Satzanker

Anker werden als **Schritt-Ereignisse** gespeichert und erst über das Manifest in Zeiten aufgelöst.

| Anker | Satz | Fenster | Klasse |
|---|---|---|---|
| A1 | „This recording shows test results from a fixture.“ | Schritte 1–8 | weich |
| A2 | „On the left is Ground Truth …“ | Schritte 1–2 | weich |
| A3 | „… shows the combined result in violet.“ | Schritte 2–4 | weich |
| A4 | „Some values may remain unknown. CIRA keeps those visible.“ | Schritte 3–5 | weich |
| A5a | „Coverage tells us how much was recovered.“ | Schritt 6 | **hart** |
| A5b | „Accuracy tells us how closely … Ground Truth.“ | Schritt 6 | **hart** |
| A6 | „… remains with the people responsible.“ | Schritt 7 | weich (bevorzugt) |

Tempozonen (E6): 70–120 s mit 93 Wörtern (≈ 2,2 W/s, ≈ 7,7 s Pausen); 120–149 s mit 72 Wörtern (≈ 2,48 W/s ohne Pausen).

## 6 — Zeit, Medium, Laufzeit

- **Kanonisch (K3):** S04 = 80,000 s; gesamt 180,000 s.
- **Gemessen (K1):** Mediendauer D_m aus Präsentationszeitstempeln: PTS(letzter Frame) + Frame-Dauer − PTS(erster Frame). Δ = D_m − 80,000 s; |Δ| ≤ 1 Frame akzeptiert, sonst explizite Änderung.
- **Startlatenz L:** Schnitt-Auslöser → erster angezeigter Frame; erster Frame vorab decodiert.
- **Taktgeber (E5):** In S04 führt die Videozeit; Bühnenuhr = 70 s + Videozeit.

Zustandsmaschine S04 (HTML-Bühne):

```text
READY ─(Schnitt 70 s, Start-Seek)→ PLAYING ⇄ STALLED
PLAYING ⇄ PAUSED
PLAYING | STALLED | PAUSED ─(Fehler)→ ABORTED
ABORTED ─(1 Wiederanlauf, letzter bestätigter Frame)→ PLAYING
ABORTED ─(Wiederanlauf scheitert)→ STILLS
PLAYING ─(letzter Frame)→ ENDED → S05
```

STALLED: Medium lebt und wartet. ABORTED: Medium nicht mehr abspielbar. STILLS: 8 Schritt-Standbilder aus dem Manifest, Narration folgt den Ankern manuell; das Storyboard bleibt ausgeschlossen (R4).

## 7 — Entscheidungen

| | Entscheidung | Stand |
|---|---|---|
| E1 | Vollbild in S04, Overlay-Menge leer | geschlossen |
| E2 | Stufe A: ein durchgehendes, bitgleiches Video; Stufenregel A → B (Keyframes) → C (Trim) → D (Neukodierung, wahrnehmungsgleich mit Schwelle) | geschlossen: A |
| E3 | Filmuntertitel und Schrittleiste erhalten | geschlossen |
| E4 | Puzzle-Hook eigenes Feld | geschlossen |
| E5 | Video ist Taktgeber in S04 | geschlossen |
| E6 | Tempozone 120–149 s: E6a Sprint proben; sonst E6c Textänderung als eigene Änderungsklasse | **offen bis Probedurchlauf** |
| E7 | HTML-Bühne primär; PowerPoint mit 6 Folien als Fallback, S04 manuell weiter, Notizen mit abgeleiteten Zeitmarken | geschlossen |
| E8a | Abspielrechner: eigenes ThinkPad per HDMI | geschlossen |
| E8b | Anzeigekette (Beamer-Auflösung, Seitenverhältnis, Skalierung, Spiegeln) | **offen, vor Ort** |

## 8 — Invarianten

- **I1** Narration D04 wortgleich; nur `originReplacement` = `fixture`.
- **I2** Identität je Format in deklarierter Klasse (bitgleich > decodiert gleich > wahrnehmungsgleich mit Schwelle); Stufe A = bitgleich.
- **I3** 180,000 s kanonisch; S04 = Filmdauer = 80,000 s (|Δ| ≤ 1 Frame).
- **I4** Kein „Illustrative“ in S04; Overlay-Menge in S04 leer.
- **I5a** HTML-Bühne: in PLAYING Differenz Bühnenuhr − Videozeit = 0 per Konstruktion; Startlatenz ≤ 2 Frames; Übergabe ENDED → S05 ≤ 1 Frame; außerhalb S04 Ist gegen Soll ± 1 Frame je Cue-Grenze; Unterbrechungen nach I11.
- **I5b** PowerPoint: keine Frame-Synchronität zwischen den Formaten; inhaltliche Äquivalenz (bitgleiches Medium, gleiche Ankerfolge, Zeitmarken aus demselben Binding); S04 → S05 manuell; Gesamtdauer gemessen, eigene Toleranzklasse.
- **I6** Offline, alle Medien lokal.
- **I7** Storyboard nur als dokumentierte Historie, nicht ausgeliefert, nicht Fallback.
- **I8** Binding gültig nur bei passendem Hash × Timeline × Narration.
- **I9** Abgeleitete Dokumente nur entlang der Wirkungsmenge geändert.
- **I10** A5a und A5b satzvollständig im gemessenen Fenster von Schritt 6.
- **I11** Kanonische und gemessene Dauer getrennt geführt; Δ, Startlatenz und Unterbrechungen protokolliert.
- **I12a** In PLAYING, STALLED, PAUSED kein Seek; genau ein Start-Seek; Drift wird nie durch Springen korrigiert.
- **I12b** Aus ABORTED genau ein Wiederanlauf auf den letzten bestätigt angezeigten Frame, protokolliert (Grund, Position, Ausfalldauer, Auslöser); scheitert er → STILLS.
- **I13** Kein zeitgesteuerter Folienwechsel in S04 der PowerPoint.

## 9 — Wirkungsmenge der Ableitung

| Dokument | betroffen | Änderung |
|---|---|---|
| Handbuch v1.0.0 | ja | Kap. 03, Kap. 04 F1–F4, Kap. 10.1/10.3, Anhang A.1 Punkt 1 |
| Stage Card v1.0.0 | ja | F-Karten, Zeitleiste, Tempo-Hinweis |
| PowerPoint-Notizen | ja | S04 mit Zeitmarken und Ankern |
| Presenter-Ansicht | ja | Cue-Umschaltung nach Videozeit aus dem Binding |
| Mentor-Brief DE/EN | nein | keine geänderte Relation |

## 10 — Implementierungsreihenfolge

1. K1: Film vermessen → `film.manifest.json`, Schritt-Standbilder
2. Gesprochener Probedurchlauf (OB) → Wort-Zeitstempel gegen Anker, je Tempozone
3. E6 entscheiden
4. Binding: `timeline.json` v1.0.2, Ankerzuordnung in `narration.json`, `s04.binding.json`
5. Rendern: HTML-Bühne (Vollbild, Video als Taktgeber), PowerPoint 6 Folien
6. Istmessung auf dem Abspielrechner, Synchronitätsprotokoll
7. Ableitung entlang der Wirkungsmenge
8. Nachweis: A01–A14 erneut; Tests für I2, I4, I5a/b, I7, I8, I10, I12a/b, I13; Austausch-Test (Dummy-Film anderer Dauer muss scheitern, gleicher Struktur muss neu binden); Bericht, Commit

## 11 — Austauschbarkeit

Ein neuer Film (z. B. aus der GUI v2.0.3) bedeutet: neues Manifest, Binding neu auflösen, Ankerprüfung und Istmessung wiederholen. Narration und Timeline bleiben unberührt, solange Schrittstruktur (8 Schritte, gleiche Ansichten) und Dauer (80 s) gleich sind. Abweichungen davon sind eine eigene Änderungsklasse.

## 12 — Kalibrierverlauf

| Version | Inhalt |
|---|---|
| v0.1 | Claude: Felder K1–K8, Relationen R1–R9, Invarianten I1–I7, E1–E4 |
| v0.2 | GPT-Kalibrierung: Vollbild ohne Overlay, ein Video mit Stufenregel, Soll/Ist getrennt, Ankerklassen, drei führende Artefakte + Binding, Wirkungsmenge, Austauschbarkeit |
| v0.3 | Gemini-Kalibrierung: E5 Video führt, E7 HTML primär + 6-Folien-Fallback; Tempo-Befund: Enge liegt nach A5 (72 Wörter / 29 s), zwei Tempozonen; E8 geteilt in a/b |
| v0.4 | GPT: Grenzklassen G1–G3, PTS-basierte Mediendauer, Unterbrechungsverhalten, I10–I13 |
| v0.5 | GPT-Korrekturen I5a/b, I12a/b (Zustand ABORTED, Wiederanlauf); Sign-off GPT, Claude, Gemini; Owner-Freigabe |
