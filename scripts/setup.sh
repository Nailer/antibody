#!/usr/bin/env bash
set -euo pipefail
node -e 'if(Number(process.versions.node.split(".")[0])<24) { console.error("Node.js 24+ required"); process.exit(1) }'
npm ci
uv venv .venv
uv pip install --python .venv/bin/python 'semgrep==1.182.1'
