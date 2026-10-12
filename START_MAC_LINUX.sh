#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if command -v node >/dev/null 2>&1; then
  echo 'Majenta Solutions: http://127.0.0.1:4173'
  node server.mjs
elif command -v python3 >/dev/null 2>&1; then
  echo 'Majenta Solutions: http://127.0.0.1:4173'
  python3 -m http.server 4173 --bind 127.0.0.1
else
  echo 'Install Node.js or Python to launch the local 3D model server.'
fi
