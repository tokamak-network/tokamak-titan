# @tokamak-network/titan-sdk

The `@tokamak-network/titan-sdk` package provides a set of tools for interacting with Titan.

## Installation

```
npm install @tokamak-network/titan-sdk
```

## Using the SDK

### BatchCrossChainMessenger

The [`BatchCrossChainMessenger`](https://github.com/tokamak-network/tokamak-titan/blob/main/packages/sdk/src/cross-chain-messenger.ts) class simplifies the process of moving assets and data between Ethereum and Titan.
You can use this class to, for example, initiate a withdrawal of ERC20 tokens from Titan back to Ethereum, accurately track when the withdrawal is ready to be finalized on Ethereum, and execute the finalization transaction after the challenge period has elapsed.
The `BatchCrossChainMessenger` can handle deposits and withdrawals of ETH and any ERC20-compatible token.
The `BatchCrossChainMessenger` automatically connects to all relevant contracts so complex configuration is not necessary.

### L2Provider and related utilities

The Titan SDK includes [various utilities](https://github.com/tokamak-network/tokamak-titan/blob/main/packages/sdk/src/l2-provider.ts) for handling Titan's [L2 Fee](https://tokamaknetwork.gitbook.io/home/02-service-guide/titan/user-guide/l2-fee).
For instance, `estimateTotalGasCost` will estimate the total cost (in wei) to send at transaction on Titan including both the L2 execution cost and the L1 data cost.
You can also use the `asL2Provider` function to wrap an ethers Provider object into an `L2Provider` which will have all of these helper functions attached.

### Other utilities

The SDK contains other useful helper functions and constants.
