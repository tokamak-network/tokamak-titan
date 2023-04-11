#!/bin/bash

set -e

RETRIES=${RETRIES:-60}

# make symlink @tokamak-optimism/sdk
cd ../sdk
echo `yarn link`
cd ../message-relayer
echo `yarn link "@tokamak-optimism/sdk"`

if [[ ! -z "$URL" ]]; then
    # get the addrs from the URL provided
    ADDRESSES=$(curl --fail --show-error --silent --retry-connrefused --retry $RETRIES --retry-delay 5 $URL)
    # set the env
    export MESSAGE_RELAYER__ADDRESS_MANAGER_ADDRESS=$(echo $ADDRESSES | jq -r '.AddressManager')
fi

# waits for l2geth to be up
curl \
    --fail \
    --show-error \
    --silent \
    --output /dev/null \
    --retry-connrefused \
    --retry $RETRIES \
    --retry-delay 1 \
    $MESSAGE_RELAYER__L2_RPC_PROVIDER

# go
exec yarn start
