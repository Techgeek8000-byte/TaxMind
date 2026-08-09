#!/bin/bash
cd /home/z/my-project

# Create a clean zip excluding sandbox/dev artifacts
zip -r /home/z/my-project/download/taxmind-pakistan.zip . \
  -x '.next/*' \
  -x 'node_modules/.cache/*' \
  -x '.zscripts/*' \
  -x 'Caddyfile' \
  -x 'dev.log' \
  -x 'server.log' \
  -x 'scripts/*' \
  -x 'tests/*' \
  -x 'examples/*' \
  -x '.DS_Store' \
  -x '*.log' \
  -x 'download/taxmind-pakistan.zip' \
  -x 'download/taxmind-preview.png' \
  -x 'download/README.md'

echo "Zip created successfully"
unzip -l /home/z/my-project/download/taxmind-pakistan.zip | tail -5
