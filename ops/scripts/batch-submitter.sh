#!/bin/sh

set -e

RETRIES=${RETRIES:-40}

if [[ ! -z "$URL" ]]; then
    # get the addrs from the URL provided
    ADDRESSES=$(curl --fail --show-error --silent --retry-connrefused --retry $RETRIES --retry-delay 5 $URL)
    # set the env
    export CTC_ADDRESS=$(echo $ADDRESSES | jq -r '.CanonicalTransactionChain')
    export SCC_ADDRESS=$(echo $ADDRESSES | jq -r '.StateCommitmentChain')
fi


# waits for l2geth to be up
curl --fail \
    --show-error \
    --silent \
    --retry-connrefused \
    --retry $RETRIES \
    --retry-delay 1 \
    --output /dev/null \
    --header 'Content-Type: application/json' \
    --data '{
      "jsonrpc":"2.0",
      "method":"eth_blockNumber",
      "params":[],
      "id":83
    }' \
    $L2_ETH_RPC

# go
exec batch-submitter "$@"
