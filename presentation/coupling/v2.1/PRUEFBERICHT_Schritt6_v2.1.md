# Prüfbericht Schritt-6-Korrektur · Film semiotic v2.1

Grundlage: `docs/architecture/SYNTX_CIRA_Film_Presentation_Coupling_Architecture_v0.5_FROZEN.md` (A5a/A5b hart, I10), Freigabe Variante B (Owner, Gemini, GPT) mit den GPT-Präzisierungen. Datum: 2026-11-27.

## 1. GUI-Änderung (feature/semiontic-gui-v2, Basis 4e08ec7)

| Datei | Änderung |
|---|---|
| `frontend/src/demo/demo.steps.json` | Schritt 6: `"focus": "metric:m11/a_r///"`; Erwartung um SEM-038 (Resonanz) ergänzt |
| `frontend/src/views/09-metrics/MetricBand.tsx` | Band trägt `data-carry-anchor` |
| `frontend/src/semiontics/focus/FocusScope.tsx` | Opt-in-Kontextführung: hat das Fokusziel einen `data-carry-anchor`-Vorfahren, wird dessen Kopf nach oben geführt, sofern das Ziel danach vollständig im Bild bleibt; sonst unverändert `nearest` |
| `frontend/src/app.css` | `[data-carry-anchor] { scroll-margin-block-start: var(--space-16); }` |

**Abweichung von der Freigabe:** Freigegeben war „app.css nur für Ansicht 09“. Die reine CSS-Regel (`scroll-margin-block-end` auf der Metrikkarte) hielt die Komposition nur bei 1920 × 1080. Bei 1600 × 900 war der Bandkopf angeschnitten, bei 1440 × 900 und 1280 × 800 (collapsed) ragte M06 ins Bild. Die GPT-Präzisierung (Konsistenz über alle unterstützten Bildschirmgrößen und Präsentationsprofile) war so nicht erfüllt. Die Komposition wird deshalb über einen Opt-in-Anker gesetzt. Nur Ansicht 09 setzt den Anker; alle anderen Ansichten verhalten sich unverändert (Snapshots und Bestandstests grün).

Die Schrittzeile rendert „Exact fractions, no overall score“ (`cira.terms.yaml`, ohne Tippfehler).

## 2. Tests

| Test | Inhalt | Ergebnis |
|---|---|---|
| `backend/tests/integration/test_demo_flow.py::test_step6…` | Fokus = M11/A_R; M05 und M11 EVALUATED; gleicher `reference_space` | grün |
| `frontend/test/browser/demo-a5.test.ts` (neu) | Schritt 5 → Next → Schritt 6 auf 1920×1080, 1600×900, 1440×900, 1280×800 (presentation): M05 und M11 vollständig im Bild, Bandkopf sichtbar, M06 außerhalb, M05 resonant, Schrittzeile | 5/5 grün |
| `make verify` gesamt | Backend (Schemas, Import-Linter, Snapshots, mypy, pytest), Frontend (785 Tests inkl. Kontrast-Audit V2T25, e2e-Demo-Erwartungen), trace/operator/fixture lint, Ableitungsdiff | **grün**, 785/785 |

Gemessene Geometrie in Schritt 6 (px, Inhaltsbereich oben/unten):

| Bühne | Profil | Inhalt | Bandkopf | M05 | M11 | M06 |
|---|---|---|---|---|---|---|
| 1920 × 1080 | reserve | 48–971 | 63–85 | 335–599 | 619–864 | endet bei 48 |
| 1600 × 900 | reserve | 48–800 | 61–80 | 289–510 | 527–732 | endet bei 48 |
| 1440 × 900 | collapsed | 48–800 | 61–79 | 375–624 | 375–624 | endet bei 48 |
| 1280 × 800 | collapsed | 48–702 | 60–78 | 362–602 | 362–602 | endet bei 48 |

Belege: `stills/A5_stage_*.png`.

## 3. Neuaufnahme

| Größe | Wert |
|---|---|
| Quelle | Play demo, Branch-Stand mit Korrektur, Projektionssnapshots `exp:0c7da892f472-0`, presentation mode 1920 × 1080 |
| Erfassung | Chrome headless, CDP-Screencast je gemaltem Frame (JPEG q100), Start per DOM-Klick ohne Mauszeiger |
| Schnittpunkt | 0,25 s nach dem ersten Frame mit „Stop demo“ (342 ms nach dem Klick) |
| Kodierung | einmalig aus der Aufnahme: H.264 High, yuv420p, 30/1 CFR, 2400 Frames, 80,000 s; keine Umkodierung eines Vorgängerfilms |
| Datei | `video/CIRA_Product_Film_80s_semiotic_v2.1.mp4` |
| sha256 | 53e75f43…cc38 (vollständig im Manifest) |

## 4. Schritt-Ereignisse v2.1 (G1)

| Schritt | Beginn (Frame) | steht ab (Frame) | Fenster Bühne |
|---|---|---|---|
| 1 | 0 | 0 | 70,000–79,967 s |
| 2 | 299 | 315 | 80,500–90,000 s |
| 3 | 600 | 606 | 90,200–100,067 s |
| 4 | 902 | 909 | 100,300–110,133 s |
| 5 | 1204 | 1217 | 110,567–120,200 s |
| 6 | 1506 | 1515 | 120,500–130,200 s |
| 7 | 1806 | 1812 | 130,400–140,267 s |
| 8 | 2108 | 2117 | 140,567–150,000 s |

Die Ladephase je Schritt dauert im Headless-Renderer 0,2–0,5 s. In v2 waren es 0,0–0,3 s.

## 5. Vergleich Schritte 1–5, 7, 8

Semantisch und strukturell äquivalent: gleiche Ansicht, gleicher Tick, Filter und Fokus, gleiche Datenwerte, Herkunftsbadge und Schrittzeile, gleicher Zonenaufbau. Abweichend sind die Schriftrasterung mit den Zeilenumbrüchen und das Ambient-Linienfeld. Die Neuaufnahme rendert die gebündelte IBM Plex Sans, v2 kam aus einem anderen Renderer. Mittlere Grauwertdifferenz der Standbilder: 4,2–8,2.

## 6. Ankerprüfung (G2)

| Anker | Ergebnis |
|---|---|
| A1 Herkunftssatz | erfüllt |
| A2 „On the left is Ground Truth“ | erfüllt |
| A3 „combined result in violet“ | erfüllt |
| A4 „Some values may remain unknown“ | erfüllt |
| **A5a/A5b** | **erfüllt.** Das Fenster beginnt mit der stabilisierten Komposition bei Frame 1530 (Film 51,0 s) und endet mit Schritt 7 (60,2 s), auf der Bühne also **121,0–130,2 s (9,2 s)**. Zu sehen sind der Bandkopf RECONSTRUCTION, M05 53/60 und M11 48/53 vollständig, M11 fokussiert, M05 und M01 resonant; M06 liegt außerhalb. A5a und A5b brauchen im Probedurchlauf ≈ 6,9 s. |
| A6 „remains with the people responsible“ | erfüllt |

Das Binding ist nach I10 wieder gültig.

## 7. PowerPoint-Fassungen

| Datei | Folien | S04 | Wechsel | Gesamt | Prüfung |
|---|---|---|---|---|---|
| `CIRA_EDTH2026_MANUAL_v2.pptx` | 6 | v2.1-Film bitgleich | S04 per Klick, sonst Zeit | 180,000 s | Schema ok, Ablaufprüfung bestanden |
| `CIRA_EDTH2026_AUTO_180s_v2.pptx` | 6 | v2.1-Film bitgleich | alles Zeit, Klick gesperrt | 180,000 s | Schema ok, Ablaufprüfung bestanden |

Narration und Timeline sind unverändert, Folienwechsel und Zeiten identisch mit der v2-Fassung. Geändert ist nur der abgeleitete Hinweis in den S04-Notizen. Statt „Bühne 2:00,1–2:10,0“ steht dort jetzt das gemessene A5-Fenster **2:01,0–2:10,2**.

## 8. Hinweis für die Probe

„Coverage …“ erst ab 2:01 sprechen, wenn die Metriken stehen. Die Sprachprobe `CIRA_EDTH2026_Probe_180s_Stimme*.mp4` liegt auf dem v1-Timing; dort beginnt A5a bei 2:00,25. Synchronisiert ist das inzwischen in `CIRA_EDTH2026_Probe_180s_Stimme_v2.1.mp4` (A5a ab 2:01,2); siehe `INTEGRIERTE_PRUEFUNG_v2.1.md`.
