# NEXT

Phase 05 (Kap. 15.1, AK) — Integration, Demo, Abnahme:
1. `backend/tests/integration/test_demo_flow.py` (T11, AK-11, REQ-076): Demo-Fluss Baseline → Recovery → Vergleich über
   die API, ohne erfundene Engine-Ergebnisse (FIXTURE), plus eingefrorene Regressions-Bundles (T11).
2. TX20 (AK-16b, AK-GUI-09/10/20): Headless-Chrome gegen **laufendes** uvicorn + Produktions-Build: Tickwechsel synchron
   in Sichten 2/3/4/11, Export mit `bundle_hash` vom Server, offline außer lokaler API.
3. TX31 (AK-GUI-18): Demo-Skript (8 Schritte, Pfade V1–V5) gegen laufendes Backend; jede Schritt-URL zeigt die erwarteten
   Zeichen; keine POSTs.
4. `docker-compose.yml` + `tools/smoke.sh` (AK-10): ohne Docker-Daemon → `DEP-07a / EXTERN_AUSZUFÜHREN`, nie simuliert.
5. README-Startanleitung, Gate 05, Abschlussbericht.
