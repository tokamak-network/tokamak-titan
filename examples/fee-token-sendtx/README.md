# Example: Submit L2 Transaction

After the registering TOKAMAK or ETH as fee token in L2, the transaction fee is applied according to the register fee token. In this example, we excute the L2 transaction and verify that the transaction fee has been properly calculated and deducted from the balance by using TOKAMAK or ETH as a fee token.

* The user select TOKAMAK as fee token, send 0.01 ETH to anonymous (use `sendTransaction`)
* The use select ETH as fee token, send 1 TOKAMAK to anonymous (use `transfer`)

## Build

```bash
# clone the source
git clone https://github.com/Onther-Tech/tokamak-optimism-v2.git
cd tokamak-optimism-v2/examples/fee-token-sendtx

# clean and install dependencies
yarn clean
yarn

# set environment variables
cp .env.example .env
```

## Run
```bash
# use TOKAMAK as fee token, send 0.01 ETH
yarn use:tokamak

# use ETH as fee token, send 1 TOKAMAK
yarn use:eth
```

## Result example
```bash
# TOKAMAK
Balance ETH Before: 2.56409655989919085 ETH
Balance TOKAMAK Before: 9.999947071311944 TOKAMAK
txHash:  0x5dbedbd2c226b0f782971744b9b61a84d74bb32562c24b393d48f9dc556ee1eb
Balance ETH After: 2.55409655989919085 ETH
Balance TOKAMAK After: 9.99994707125843 TOKAMAK
ETHBalanceAfter - ETHBalanceBefore:  0.01
TokamakBalanceAfter - TokamakBalanceBefore:  0.000000000053514
L1TokamakFee:  0.000000000013314
L2TokamakFee:  0.000000000042

# ETH
Balance ETH Before: 2.55409655989919085 ETH
Balance TOKAMAK Before: 9.999947071186158 TOKAMAK
txHash:  0x858d9a1337db7b39fb52f3eb54525e89c2a1d2195fc37411edbf9b6d0b9a8844
Balance ETH After: 2.554096559899149804 ETH
Balance TOKAMAK After: 8.999947071186158 TOKAMAK
ETHBalanceAfter - ETHBalanceBefore:  0.000000000000041046
TokamakBalanceAfter - TokamakBalanceBefore:  1.0
L1Fee:  0.000000000000006705
L2Fee:  0.000000000000034341
```