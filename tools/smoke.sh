#!/usr/bin/env bash
# CIRA smoke test (AK-10) against a running instance: health → baseline + recovery runs → projections → export/import
# → comparison → frontend entry. Only the public API is used. Exit 0 = all checks passed.
#   API_URL       default http://127.0.0.1:8000
#   FRONTEND_URL  optional, e.g. http://127.0.0.1:4173 (checked when set)
#   TIMEOUT_S     per experiment, default 180
set -euo pipefail
API="${API_URL:-http://127.0.0.1:8000}"
FE="${FRONTEND_URL:-}"
TIMEOUT="${TIMEOUT_S:-180}"
PASS=0
ok()   { PASS=$((PASS + 1)); printf 'ok   %s\n' "$1"; }
fail() { printf 'FAIL %s\n' "$1" >&2; exit 1; }
json() { python3 -c "import json,sys;d=json.load(sys.stdin);print(eval(sys.argv[1],{'d':d}))" "$1"; }
get()  { curl -fsS "$API$1"; }
post() { curl -sS -o /tmp/cira_smoke_body.json -w '%{http_code}' -H 'Content-Type: application/json' -X POST -d "$2" "$API$1"; }

[ "$(get /health | json "d['status']")" = "ok" ] || fail "health"
ok "health ($API)"

BASE='"scenario_id":"scn:fx_base","observation_config_id":"ocfg:fx_partial","target_definition_id":"tgt:fx"'
start() {
  local code; code=$(post /experiments "{$BASE$1}")
  [ "$code" = "202" ] || fail "POST /experiments $1 → $code $(cat /tmp/cira_smoke_body.json)"
  json "d['experiment_id']" < /tmp/cira_smoke_body.json
}
wait_done() {
  local e="$1" until=$((SECONDS + TIMEOUT)) st
  while :; do
    st=$(get "/experiments/$e" | json "d['experiment']['status']")
    case "$st" in COMPLETED|PARTIAL) echo "$st"; return 0;; FAILED|BLOCKED) fail "$e ended $st";; esac
    [ $SECONDS -lt $until ] || fail "$e not finished after ${TIMEOUT}s (status $st)"
    sleep 1
  done
}
B=$(start ',"label":"Smoke baseline"'); ok "baseline created $B"
R=$(start ',"scenario_id":"scn:fx_rec","label":"Smoke recovery"'); ok "recovery created $R"
[ "$(wait_done "$B")" = "COMPLETED" ] || fail "baseline not COMPLETED"; ok "baseline COMPLETED"
[ "$(wait_done "$R")" = "COMPLETED" ] || fail "recovery not COMPLETED"; ok "recovery COMPLETED"

for p in "states?tick=2" "observations?tick=2" "results?tick=2&attempt=0&direction=merged" "governance?tick=2&space=R" \
         "metrics?aggregation=POOLED" "metrics?aggregation=PER_TICK&tick=2" "events" "topology"; do
  hdr=$(get "/experiments/$B/$p" | json "d['header']['experiment_id']")
  [ "$hdr" = "$B" ] || fail "projection $p header experiment_id=$hdr"
done
ok "8 projections answer with a matching header"
[ "$(get "/experiments/$B/metrics?aggregation=POOLED" | json "d['report']['data_origin']")" = "FIXTURE" ] || fail "origin not FIXTURE"
ok "metrics marked FIXTURE (no engine, DEP-02)"

get "/experiments/$B/export" > /tmp/cira_smoke_bundle.json
H=$(json "d['bundle_hash']" < /tmp/cira_smoke_bundle.json)
[[ "$H" == sha256:* ]] || fail "bundle_hash $H"
code=$(curl -sS -o /tmp/cira_smoke_body.json -w '%{http_code}' -H 'Content-Type: application/json' -X POST \
       --data-binary @/tmp/cira_smoke_bundle.json "$API/experiments/import")
[ "$code" = "409" ] && [ "$(json "d['error']['code']" < /tmp/cira_smoke_body.json)" = "CONFLICT" ] \
  || fail "re-import of exported bundle → $code (expected 409 CONFLICT: valid contract and hash, experiment exists)"
ok "export $H; bundle valid on re-import"

code=$(post /comparisons "{\"baseline_experiment_id\":\"$B\",\"recovery_experiment_id\":\"$R\"}")
[[ "$code" == 20? ]] || fail "POST /comparisons → $code"
[ "$(json "d['comparison']['compatible']" < /tmp/cira_smoke_body.json)" = "True" ] || fail "comparison not compatible"
M09=$(json "[(r['numerator']['n'], r['denominator']['n']) for r in d['comparison']['results'] if r['metric_id']=='M09'][0]" < /tmp/cira_smoke_body.json)
ok "comparison compatible, M09 = $M09 (n, d)"

if [ -n "$FE" ]; then
  curl -fsS "$FE/" | grep -q 'name="cira-api"' || fail "frontend entry $FE"
  curl -fsS "$FE/exp/$B/TEMPORAL_STATE_EXPLORER?tick=2" | grep -q '<div id="root">' || fail "frontend deep link"
  ok "frontend serves entry and deep links ($FE)"
fi
printf 'smoke: %d checks passed\n' "$PASS"
