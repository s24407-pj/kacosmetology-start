#!/usr/bin/env bash
set -euo pipefail

if [[ $# != 1 || ! -s "$1" ]]; then
  echo 'Usage: start-scheduler.sh <scheduler.jar>' >&2
  exit 1
fi

log_file="${RUNNER_TEMP:?RUNNER_TEMP must be set}/scheduler-api.log"
java -jar "$1" > "$log_file" 2>&1 &
api_pid=$!
echo "$api_pid" > "$RUNNER_TEMP/scheduler-api.pid"

for ((attempt = 0; attempt < 90; attempt++)); do
  if ! kill -0 "$api_pid" 2>/dev/null; then
    echo 'Scheduler exited before becoming healthy' >&2
    exit 1
  fi
  if curl --silent --fail --connect-timeout 1 --max-time 2 "http://127.0.0.1:${SERVER_PORT:-8080}/actuator/health" > /dev/null; then
    exit 0
  fi
  sleep 2
done

echo 'Scheduler did not become healthy within 180 seconds' >&2
exit 1
