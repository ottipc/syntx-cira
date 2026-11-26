# CIRA — Architecture Freeze Record v1.0.2

| Field | Value |
|---|---|
| Frozen architecture | `SYNTX_CIRA_Consolidated_Architecture_Package_v1.0.2.md` (this folder) — single source of truth |
| Freeze status | FROZEN ARCHITECTURE v1.0.2 — OWNER APPROVAL: ACCEPTED |
| Approved by | Ottavio Braun (owner), order `inputs/orders/04_Freeze_and_Implementation_Release_v1.0.2.txt` |
| Date | 2026-11-26 |
| Execution contract | v1.0.2 (E-01 – E-19) ACTIVATED |
| Gate mode | AUTO_INTERNAL (RV-01) |
| Product identity | CIRA; SYNTX remains internal architectural foundation only |
| Environment | fully synthetic, abstract civilian software-service laboratory (REQ-080) |

## 1 — State transition of all review items (K-73)

All `[PROPOSED]` elements of v1.0.2 changed from `PROPOSED` to `ACCEPTED` by owner approval.

| Group | Items | Decision |
|---|---|---|
| Package review | RV-01 – RV-07 | ACCEPTED; RV-01: `gate_mode = AUTO_INTERNAL`; RV-02: code points per K-31 (Σ U+03A3, ∆ U+2206, ∑ U+2211, 13 symbols, NFC) |
| GUI review | RV-GUI-01 – RV-GUI-11 | ACCEPTED (details in section 2) |
| Corrections | K-58 – K-76 | ACCEPTED, **including K-66** (F3) |
| GUI corrections | GK-01 – GK-29 | ACCEPTED |
| Decisions | D-40 – D-49 | ACCEPTED |
| Deviation | A-14 | ACCEPTED |
| Extensions | X-28 – X-33 | ACCEPTED |
| Signs | SEM-031 – SEM-036 | ACCEPTED |

K-66 as accepted: `EventRecord.status = REJECTED` exclusively for `APPLY_APPROVAL` by a role without `permits`; structural errors lead to HTTP 422 (pre-validation) or experiment status FAILED.

## 2 — GUI decisions as accepted

| Item | Decision |
|---|---|
| RV-GUI-05 | English (`en`) default UI language; German (`de`) complete in `cira.terms.yaml` |
| RV-GUI-09 | only CIRA visible as product identity (INV-LANG-01, TX24); no SYNTX credit in the UI |
| RV-GUI-03 / -06 | threefold space separation; achromatic origin encoding (GK-01); token set v1.0.1 (GK-02, GK-03) |
| RV-GUI-04 | endpoint #21 (`POST /recovery-variants`) read-only in phase 04 with prepared, disabled dialog (D-49) |
| RV-GUI-07 | 3-minute demo script with 8 steps plus deep-dive paths V1–V5 (D-46, G05) |
| RV-GUI-08 | visual review cycle (VPZ, D-48); the initial visual baseline is taken from the first clean G15 run |
| RV-GUI-11 | monospace font bundled via `@fontsource/*` and verified by TX30 (DEP-GUI-01) |

## 3 — Remaining external dependencies (unchanged by the freeze)

| DEP | State |
|---|---|
| DEP-01 | R01–R18 / I01–I19 semantics and engine gap vocabulary: open, opaque in CIRA |
| DEP-02 | live engine interface: open; FixtureAdapter and ImportExportAdapter in use, Local/Api adapters are ENGINE_UNAVAILABLE stubs |
| DEP-07a | Docker daemon: not reachable in the Claude execution environment (measured); compose smoke test to be run externally |
| DEP-07b | browser runtime: Chrome for Testing available in the Claude execution environment (measured) |
| DEP-08 | Σ02–Σ29 labels: open; only Σ01 and Σ30 labelled |

## 4 — Repository record

- Open-source license file removed; proprietary notice in `COPYRIGHT.md` (All Rights Reserved).
- Architecture history kept in `docs/architecture/history/`, original inputs in `docs/architecture/inputs/`, PDF renderings in `docs/architecture/rendered/`.
