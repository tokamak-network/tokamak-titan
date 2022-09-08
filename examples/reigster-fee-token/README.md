# Example: Register fee token

The user can use ETH or TON as a transaction fee in L2. To do this, you can call the `Ton_GasPriceOracle` contract to change which token the account uses as a transaction fee. (This is called a "register")

## Build

```bash
# clone the source
git clone https://github.com/Onther-Tech/tokamak-optimism-v2.git
cd tokamak-optimism-v2/examples/register-fee-token

# clean and install dependencies
yarn clean
yarn

# set environment variables
cp .env.example .env
```

## Run
```bash
# use TON as fee token
yarn use:ton

# use ETH as fee token
yarn use:eth
```