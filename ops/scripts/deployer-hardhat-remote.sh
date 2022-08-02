#!/bin/bash
set -euo

# cp /root/hardhat-remote-addresses.latest.json ./genesis/addresses.json
# cp /root/hardhat-remote-state-dump.latest.json ./genesis/state-dump.latest.json

# service the addresses and dumps
echo "Starting server."
python3 -m http.server \
    --bind "0.0.0.0" 8081 \
    --directory ./genesis
