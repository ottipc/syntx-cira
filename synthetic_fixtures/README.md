# synthetic_fixtures — TEST DATA

Alles in diesem Verzeichnis ist synthetisch und als Testdaten gekennzeichnet (`is_fixture: true`,
`data_origin: FIXTURE` bzw. `SYNTHETIC`). **Nichts hier ist ein Ergebnis einer SYNTX-Engine.**
Die Rekonstruktionen unter `f05_reconstructions/` sind die einzige Quelle des FixtureAdapters (Pfad-Guard).

- Keine Geodaten, keine Realnamen, keine realen Infrastrukturmodelle (REQ-080, TX09 `tools/fixture_lint.py`).
- Knoten sind generisch (`type:component`, „Komponente NN“), Domänen abstrakt (Kap. 12.1).
- `f06_metric_fixtures/` sind die Golden Fixtures aus Kap. 12.2 (Hand-SSOT); `bundles/fx_bundle_tx14.json` wird von
  `backend/scripts/build_tx14_bundle.py` erzeugt (TX14) und nie von Hand bearbeitet.
