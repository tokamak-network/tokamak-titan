#!/bin/bash

set -e

RETRIES=${RETRIES:-60}

# make symlink @tokamak-optimism/sdk
cd ../sdk
echo `yarn link`
cd ../message-relayer
echo `yarn link "@tokamak-optimism/sdk"`

# wait for $URL
until $(curl --silent --fail --output /dev/null "$URL"); do
  sleep 10
  echo "Will wait $((RETRIES--)) more times for $URL to be up..."

  if [ "$RETRIES" -lt 0 ]; then
    echo "Timeout waiting for base addresses at $URL"
    exit 1
  fi
done
echo "Base addresses available at $URL"

RETRIES=60

# wait for $TOKAMAK_CONTRACTS_URL
until $(curl --fail --output /dev/null "$TOKAMAK_CONTRACTS_URL"); do
  sleep 10
  echo "Will wait $((RETRIES--)) more times for $TOKAMAK_CONTRACTS_URL to be up..."

  if [ "$RETRIES" -lt 0 ]; then
    echo "Timeout waiting for boba addresses at $TOKAMAK_CONTRACTS_URL"
    exit 1
  fi
done
echo "Tokamak addresses available at $TOKAMAK_CONTRACTS_URL"

# set the MESSAGE_RELAYER__ADDRESS_MANAGER_ADDRESS environment variable
if [[ ! -z "$URL" ]]; then
    # get the addrs from the URL provided
    ADDRESSES=$(curl --fail --show-error --silent --retry-connrefused --retry $RETRIES --retry-delay 5 $URL)
    # set the env
    export MESSAGE_RELAYER__ADDRESS_MANAGER_ADDRESS=$(echo $ADDRESSES | jq -r '.AddressManager')
    echo $MESSAGE_RELAYER__ADDRESS_MANAGER_ADDRESS
fi

# go
exec yarn start
