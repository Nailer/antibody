#!/bin/sh
set -eu
umask 077
ACCESS_TOKEN="${ACCESS_TOKEN:-}"
if [ "${#ACCESS_TOKEN}" -lt 24 ]; then
  echo 'Set ACCESS_TOKEN to a private password of at least 24 characters before starting the hosted workspace.' >&2
  exit 1
fi
if [ "${ANTIBODY_STORE:-sqlite}" = sqlite ]; then
  task_data="${ANTIBODY_DATA_DIR:-/app/.data}"
  mkdir -p "$task_data"
  if [ "$(id -u)" = 0 ]; then
    chown node:node "$task_data"
    chmod 700 "$task_data"
  fi
fi
if [ "$(id -u)" = 0 ]; then
  exec gosu node "$@"
fi
exec "$@"
