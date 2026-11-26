# CIRA — make targets (Kap. 09, X-17, 15.6, 15.8, 15.12)
PY      ?= python3
PHASE   ?= $(shell $(PY) -c "import yaml;print(yaml.safe_load(open('docs/traceability/registry.yaml'))['current_phase'])")
BACKEND := backend
FRONTEND:= frontend

.PHONY: help sync verify verify-backend verify-frontend status resume docs gate impact smoke run clean

help:
	@echo "sync    regenerate every derived artifact (schemas, .importlinter, TX14 bundle, snapshots, semiontics, TS types, depcruise rules)"
	@echo "verify  all tests + mypy strict + import-linter + drift checks + trace_check + lints (0 errors, 0 skips)"
	@echo "gate    PHASE=0N: machine report docs/test-reports/phase-0N.json + recomputed STATUS.md"
	@echo "status  recompute docs/STATUS.md;  resume  re-entry per 15.8;  impact  impact set of changed files"
	@echo "run     start backend (uvicorn) and frontend preview;  smoke  tools/smoke.sh against a running backend"

sync:
	cd $(BACKEND) && $(PY) scripts/export_schemas.py
	cd $(BACKEND) && $(PY) scripts/gen_importlinter.py
	cd $(BACKEND) && $(PY) scripts/build_tx14_bundle.py
	cd $(BACKEND) && $(PY) scripts/gen_snapshots.py
	@if [ -f tools/gen_semiontics.py ]; then $(PY) tools/gen_semiontics.py; fi
	@if [ -f $(FRONTEND)/package.json ] && [ -d $(FRONTEND)/node_modules ]; then cd $(FRONTEND) && npm run -s gen:contracts && node scripts/gen-depcruise.mjs; fi

verify: verify-backend verify-frontend
	$(PY) tools/trace_check.py
	$(PY) tools/lint_operators.py
	$(PY) tools/fixture_lint.py
	@git diff --quiet -- contracts/schemas backend/.importlinter synthetic_fixtures/bundles frontend/test/snapshots \
	  frontend/src/contracts/generated frontend/src/semiontics/generated frontend/src/language/generated frontend/.dependency-cruiser.cjs || \
	  (echo "verify: derived artifacts differ from the committed state; run make sync and commit" && exit 1)

verify-backend:
	cd $(BACKEND) && $(PY) scripts/export_schemas.py --check
	cd $(BACKEND) && $(PY) scripts/gen_importlinter.py --check
	cd $(BACKEND) && $(PY) scripts/gen_snapshots.py --check
	cd $(BACKEND) && mypy
	cd $(BACKEND) && lint-imports --config .importlinter
	cd $(BACKEND) && $(PY) -m pytest -p no:cacheprovider -q

verify-frontend:
	$(PY) tools/gen_semiontics.py --check
	cd $(FRONTEND) && npm run -s verify

gate:
	$(PY) tools/report.py --phase $(PHASE)
	$(PY) tools/status.py

status:
	$(PY) tools/status.py

resume:
	$(PY) tools/resume.py

impact:
	$(PY) tools/impact.py

docs: status

smoke:
	bash tools/smoke.sh

run:
	cd $(BACKEND) && CIRA_DATA=../experiments $(PY) -m uvicorn --factory app.api.main:create_app --host 127.0.0.1 --port 8000

clean:
	rm -rf experiments $(FRONTEND)/dist
	find . -name __pycache__ -type d -prune -exec rm -rf {} +
