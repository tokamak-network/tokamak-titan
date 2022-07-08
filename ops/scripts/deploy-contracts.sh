#!/bin/bash

# get absolute path of script file
get_abs_filename() {
  echo "$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
}

if ! command -v jq &> /dev/null; then
    echo "jq could not be found"
    exit
fi

MYPATH="$(cd "$(dirname "$0")"; pwd -P)"

# absolut path for deploy env vars
ENVFILE=$(get_abs_filename $MYPATH/../.env)
[ -e $ENVFILE ] && export $(cat .env | sed 's/#.*//g' | xargs)

export CONTRACTS_RPC_URL=$L1_NODE_WEB3_URL

if [ -z "$CONTRACTS_RPC_URL" ]; then
    echo "Must specify \$CONTRACTS_RPC_URL."
    exit 1
fi

if [ -z "$CONTRACTS_TARGET_NETWORK" ]; then
    echo "Must specify \$CONTRACTS_TARGET_NETWORK."
    exit 1
fi

if [ -z "$CONTRACTS_DEPLOYER_KEY" ]; then
    echo "Must specify \$CONTRACTS_DEPLOYER_KEY."
    exit 1
fi

DATA_PATH=$(get_abs_filename $MYPATH/../data)
CONTRACTS_PATH=$(get_abs_filename $MYPATH/../../packages/contracts)
DEPLOYMENT_PATH=$CONTRACTS_PATH/deployments/$CONTRACTS_TARGET_NETWORK
[ -e $DEPLOYMENT_PATH ] && rm -rf $DEPLOYMENT_PATH

# deploy contracts

# push the direcory path(args) in the stack and move to args
pushd $CONTRACTS_PATH &> /dev/null

DEPLOY_CMD="npx hardhat deploy --verbose --show-stack-traces --network $CONTRACTS_TARGET_NETWORK"

echo "Deploying contracts. Deployment command:"
echo "$DEPLOY_CMD"

# use args to command
eval "$DEPLOY_CMD"
if [ $? -ne 0 ]; then
    echo "Error: failed to deploy contracts."
    exit 1
fi

# pop the current direcory path in the stack and move the top
popd &> /dev/null

[ -e $DATA_PATH/../data ] && sudo rm -rf $DATA_PATH
mkdir -p $DATA_PATH/contract_dumps

# generate addresses files

# pwd=packages/contracts/deployments/local
pushd $DEPLOYMENT_PATH &> /dev/null

# remove existing files (but /deployments/local is deleted before deploy contracts)
rm -f addresses.json addresses.txt filenames.txt

echo "Building addresses.json."
# get contract address of Lib_AddressManager
export ADDRESS_MANAGER_ADDRESS=$(cat "Lib_AddressManager.json" | jq -r .address)

# list of contract address
find "." -maxdepth 1 -name '*.json' | xargs cat | jq -r '.address' > addresses.txt
# list of contract name
find "." -maxdepth 1 -name '*.json' | sed -e "s/.\///g" | sed -e 's/.json//g' > filenames.txt

echo "{" >> addresses.json
# run ubuntu container (tmp)
docker run --rm -v $(pwd)/addresses.txt:/tmp/addresses.txt -v $(pwd)/filenames.txt:/tmp/filenames.txt ubuntu:latest /bin/bash -c 'paste /tmp/addresses.txt /tmp/filenames.txt | sed -e "s/^\([^ ]\+\)\s\+\([^ ]\+\)/\"\2\": \"\1\",/"' >> addresses.json

echo "\"AddressManager\": \"$ADDRESS_MANAGER_ADDRESS\"" >> addresses.json
echo "}" >> addresses.json

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

echo "Building dump file."
npx hardhat take-dump --network $CONTRACTS_TARGET_NETWORK
if [ $? -ne 0 ]; then
    echo "Error: failed to generate state dump files."
    exit 1
fi

DUMP_PATH=$(cd "../../genesis"; pwd -P)
mv addresses.json $DUMP_PATH
# echo "*** Use this files for L2 ***"
# ls -ld1 $DUMP_PATH/*.json
rm -f addresses.json addresses.txt filenames.txt

# copy addresses.json and state-dump.latest.json
cp $DUMP_PATH/addresses.json $DATA_PATH/contract_dumps/
cp $DUMP_PATH/$CONTRACTS_TARGET_NETWORK.json $DATA_PATH/contract_dumps/state-dump.latest.json

popd &> /dev/null

echo "Success deploying contracts."