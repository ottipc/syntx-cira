# ADR-0007 — Marke und Dekor im Arbeitsbereich (DEC-01–DEC-03)

Status: ACCEPTED
Datum: 2026-11-26 · nach Gate 05 · Klasse F2 (Gestaltung ohne Semantikwirkung, E-07) · Auftrag OB: „semiotisch und
systemisch, mit meinem Logo, neuronale Netze“. Entscheidung OB: nur das Zeichen, kein Schriftzug (Produktidentität CIRA
bleibt; „SYNTX“ bleibt in der Oberfläche gesperrt).

## Entscheidungen
1. **Dekor ist ein eigener, leerer Zeichenraum.** Das Register erhält den Abschnitt `decorative` (DEC-01 Zeichen,
   DEC-02 neuronales Feld, DEC-03 Kettenglied). Dekor trägt keine Aussage, kein `data-sem`, ist für assistive Technik
   verborgen und verwendet keine Zeichenfarbe. Damit bleibt jede Bedeutung in den SEM-Zeichen (TX22).
2. **Markenfarbe `brand.core = #BFEFF4`** (Kern des Logo-Leuchtens). Gewählt so, dass ΔE00 ≥ 15 zu allen sechs
   Zeichenfarben gilt (min. 18,0 zu `eval.coherent`); das gesättigte Cyan des Logos läge zu nah an „kohärent“ und am
   Referenzblau. Glühen entsteht durch Transparenz, nicht durch eine zweite Farbe.
3. **Neuronales Feld.** Festes Knotennetz aus konstantem Seed hinter Zone C, unabhängig von jeder Projektion; eine Gruppe
   mit einer Deckkraft `opacity.network.max = 0,08`, sodass Überlagerungen nie stärker werden. Damit hält jeder Text über
   dem Netz ≥ 4,5 : 1 (schwächster Fall `eval.violation` 4,54). Pulse über `motion.network.pulse`, bei reduzierter
   Bewegung 0.
4. **Flächen** leicht ins Petrol des Logos verschoben (`surface.field #090D11` u. a.); alle Kontrastregeln neu berechnet.
5. **Übersicht als Kette.** Die sieben Felder als Kaskade 01 → 07; zwischen Beobachtung und Engine schneidet die Barriere
   (SEM-019) die Kette — nur Ω_O passiert. Feld-IDs bleiben unsichtbar (Produktsprache), sichtbar ist die Ordnungszahl.
6. **Prüfungen.** Generator und unabhängiger Test: Dekor-ΔE, Kontrast über dem Netz, keine SEM mit Dekorfarbe, Dekor ohne
   `data-sem`/mit `aria-hidden`, genau ein Schnitt zwischen F04 und F05. Die Austrittsprüfung in TX28 misst jetzt das
   sichtbare, durch Vorfahren beschnittene Rechteck (vorher ungeschnittene Box — falscher Befund am beschnittenen SVG).
