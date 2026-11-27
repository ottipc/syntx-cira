# ADR-0009 — Demo-Schritt 6: Fokus auf Accuracy und Kontextführung in Ansicht 09

Status: ACCEPTED · Datum: 2026-11-27 · Branch `feature/semiontic-gui-v2` · Klasse F2 (Gestaltung ohne Semantikwirkung, E-07)
Freigabe: Owner, Gemini, GPT (Variante B), Owner zusätzlich für die ansichtsspezifische Abweichung (IC-25)
Architektur: v2.0.3, Nachtrag **F04** (00.5; 03.6, 03.10, 03.11, 03.13.3, 03.13.4, 04.2, 05.8, 06.09, 08.3)

## Anlass
Der Produktfilm wird mit Play demo aufgenommen. Die Kopplungsarchitektur Film ↔ Präsentation v0.5 (FROZEN) verlangt
den harten Anker A5: „Coverage …“ (A5a) und „Accuracy …“ (A5b) werden nur gesprochen, solange Schritt 6 M05 Coverage und
M11 Accuracy zeigt (I10). In der semiotischen GUI v2 zeigte Schritt 6 nur das Band REFERENCE STATE · Ω_A. Der Film
semiotic v2 verletzte A5.

## Entscheidung
1. `demo.steps.json`, nur Schritt 6: `focus = metric:m11/a_r///` (M11, POOLED, A_R). Erwartung SEM-013, SEM-021,
   **SEM-038**. Ansicht, Tick, Aggregation, Narration und Sekunden je Schritt bleiben unverändert.
   M05 und M01 teilen den Referenzraum `space:attribute:pooled` mit M11 und werden resonant (04.4).
2. **Kontextführung R13:** Eine Ansicht kann eine Gruppe mit `data-carry-anchor` markieren. `FocusScope` führt dann
   zuerst den Gruppenkopf nach oben (`block: "start"`, Abstand `--space-16`). Bleibt das Ziel danach vollständig im Bild,
   gilt diese Lage, sonst wie bisher `nearest`. Nur Ansicht 09 markiert ihre Metrikbänder.
3. Damit stehen in Schritt 6 auf allen vier Bühnen (1920×1080, 1600×900, 1440×900, 1280×800, presentation) der Bandkopf
   RECONSTRUCTION, M05 und M11 vollständig im Bild, M06 liegt außerhalb.

## Abgrenzung
- Keine Änderung an Backend, Verträgen, Schemas, Anfragen, Metriken, Tokens, anderen Ansichten oder anderen Demo-Schritten.
- `FocusScope` liest das Attribut generisch und importiert nichts aus `views/` (G03.3 unverändert, 03.13.2).
- Die Führung bewegt nur den Scrollbereich von Zone C, einmal je bestätigtem Fokuswechsel und ohne Animation.
  Fokus-, Resonanz- und Abschwächungszustände bleiben unberührt.
- Hebt für Schritt 6 den Rahmensatz in ADR-0008 („keine Änderung an `demo.steps.json`“) auf.

## Nachweis
- V3T20 `frontend/test/browser/demo-a5.test.ts`: 4 Bühnen + Schrittdeklaration, grün
- `backend/tests/integration/test_demo_flow.py`: Fokusziel M11/A_R, M05 und M11 EVALUATED, gleicher `reference_space`
- e2e Demo-Durchlauf: SEM-038 in Schritt 6 vorhanden; Kontrast-Audit V2T25 unverändert grün
- `make verify`: 785/785 Frontend, Backend vollständig grün
- Film semiotic v2.1 (Neuaufnahme via Play demo): A5-Fenster Bühne 121,0–130,2 s, A5 erfüllt
  (`presentation/coupling/v2.1/` auf `main`)

## Rücknahme
Patch zurücknehmen. Schritt 6 zeigt dann wieder das Referenzband, und A5 ist im Film nicht erfüllt.
Der Film v2 und die Präsentationsfassungen mit v1-Film bleiben als Fallback erhalten.
