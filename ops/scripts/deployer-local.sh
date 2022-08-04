#!/bin/bash
set -euo

RETRIES=${RETRIES:-20}
JSON='{"jsonrpc":"2.0","id":0,"method":"net_version","params":[]}'

if [ -z "$CONTRACTS_RPC_URL" ]; then
    echo "Must specify \$CONTRACTS_RPC_URL."
    exit 1
fi

# wait for the base layer to be up
curl \
    --fail \
    --show-error \
    --silent \
    -H "Content-Type: application/json" \
    --retry-connrefused \
    --retry $RETRIES \
    --retry-delay 1 \
    -d $JSON \
    $CONTRACTS_RPC_URL > /dev/null

echo "Connected to L1."

cp ./genesis/local-addresses.latest.json ./genesis/addresses.json
cp ./genesis/local-state-dump.latest.json ./genesis/state-dump.latest.json

# service the addresses and dumps
echo "Starting server."
python3 -m http.server \
    --bind "0.0.0.0" 8081 \
    --directory ./genesis
