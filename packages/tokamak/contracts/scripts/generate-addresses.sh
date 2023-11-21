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

DEPLOYMENT_PATH=$(get_abs_filename $MYPATH/..)/deployments/$CONTRACTS_TARGET_NETWORK

# generate addresses files
pushd $DEPLOYMENT_PATH &>/dev/null

echo "Building addresses.json."
export ADDRESS_MANAGER_ADDRESS=$(cat "Lib_AddressManager.json" | jq -r .address)

find "." -maxdepth 1 -name '*.json' | xargs cat | jq -r '.address' >addresses.txt
find "." -maxdepth 1 -name '*.json' | sed -e "s/.\///g" | sed -e 's/.json//g' >filenames.txt

echo "{" >>addresses.json
docker run --rm -v $(pwd)/addresses.txt:/tmp/addresses.txt -v $(pwd)/filenames.txt:/tmp/filenames.txt ubuntu:latest /bin/bash -c 'paste /tmp/addresses.txt /tmp/filenames.txt | sed -e "s/^\([^ ]\+\)\s\+\([^ ]\+\)/\"\2\": \"\1\",/"' >>addresses.json

echo "\"AddressManager\": \"$ADDRESS_MANAGER_ADDRESS\"" >>addresses.json
echo "}" >>addresses.json

echo "Built addresses.json. Content:"
jq . addresses.json
if [ $? -ne 0 ]; then
  echo "Error: failed to generate state dump files."
  exit 1
fi

echo "Env vars for the dump script:"
export L1_STANDARD_BRIDGE_ADDRESS=$(cat "./addresses.json" | jq -r .Proxy__OVM_L1StandardBridge)
export L1_CROSS_DOMAIN_MESSENGER_ADDRESS=$(cat "./addresses.json" | jq -r .Proxy__OVM_L1CrossDomainMessenger)
echo "ADDRESS_MANAGER_ADDRESS=$ADDRESS_MANAGER_ADDRESS"
echo "L1_STANDARD_BRIDGE_ADDRESS=$L1_STANDARD_BRIDGE_ADDRESS"
echo "L1_CROSS_DOMAIN_MESSENGER_ADDRESS=$L1_CROSS_DOMAIN_MESSENGER_ADDRESS"

DUMP_PATH=$(
  cd "../../genesis"
  pwd -P
)
OUTPUT=$DUMP_PATH/$CONTRACTS_TARGET_NETWORK-addresses.latest.json
mv addresses.json $OUTPUT
rm -f addresses.json addresses.txt filenames.txt

ls $OUTPUT

popd &>/dev/null
