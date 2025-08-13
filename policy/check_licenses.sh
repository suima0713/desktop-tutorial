#!/bin/bash
echo "Checking licenses..."
pip install pip-licenses -q
pip-licenses --format=json > licenses.json
if grep -iE '"(GPL|AGPL|LGPL)"' licenses.json; then
  echo "Prohibited license found"
  exit 1
fi
echo "License check passed"
