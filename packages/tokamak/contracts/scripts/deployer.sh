#!/bin/bash
set -e

# This is what deploys all the right TOKAMAK contracts
yarn run deploy

# service the deployed  addresses of Tokamak contracts
echo "Starting server."
python3 -m http.server \
    --bind "0.0.0.0" 8082 \
    --directory ./dist/dumps