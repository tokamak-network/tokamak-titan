#!/bin/bash

get_abs_filename() {
  echo "$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
}

MYPATH="$(
  cd "$(dirname "$0")"
  pwd -P
)"
ENVFILE=$(get_abs_filename $MYPATH/../.env)
[ -e $ENVFILE ] && export $(cat .env | sed 's/#.*//g' | xargs)

if [ -z "$CONTRACTS_TARGET_NETWORK" ]; then
  echo "Must specify \$CONTRACTS_TARGET_NETWORK."
  exit 1
fi

OUTPUT=$(get_abs_filename $MYPATH/../genesis/$CONTRACTS_TARGET_NETWORK)
OUTPUT_FILE=$OUTPUT.json
STATE_DUMP_FILE=$OUTPUT-state-dump.latest.json
npx hardhat take-dump --network $CONTRACTS_TARGET_NETWORK

mv $OUTPUT_FILE $STATE_DUMP_FILE

echo "Generated state dump file($STATE_DUMP_FILE)"
