# @tokamak-optimism/message-relayer

`message-relayer` is a service that automatically finalizes ("relays") messages sent from Tokamak Network to Ethereum.
It buffers messages for a certain amount of time and relays them from layer 2 to layer 1 in batches when a certain amount of messages are gathered. We can expect to save the transaction costs and reduce the network load.
The message relayer uses L1CrossDomainMessenger to relay messages in batches.

## Installation

Clone, install, and build:

```
git clone https://github.com/tokamak-network/tokamak-optimism-v2.git
cd tokamak-optimism-v2
yarn install
yarn build
```

## Running the relayer (Docker)

**This is the same as running it in your local development environment.**

```
git clone https://github.com/tokamak-network/tokamak-optimism-v2.git
cd tokamak-optimism-v2/ops
make up
```

## Running the relayer (manual)

The `message-relayer` can also be run manually.
Copy `.env.example` into a new file named `.env`, then set the environment variables listed there.
Set MESSAGE_RELAYER__IS_FAST_RELAYER=true to enable the fast withdrawal.
(Note: fast withdrawal will be supported later.)
Once your environment variables have been set, run the relayer via:

```
yarn start
```
