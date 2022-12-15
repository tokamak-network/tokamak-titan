# TOKAMAK Smart Contracts

This spins up the entire stack, with all contracts deployed, all the right things needed for the wallet to function, and for development work on the wallet.

```bash

$ cd ops
$ docker-compose up -d

```

To get the contract addresses for the system contracts deployed L1, and the TOKAMAK-specific contracts:

```bash

curl http://127.0.0.1:8080/addresses.json | jq # system contracts
curl http://127.0.0.1:8082/tokamak-addr.json | jq # Tokamak-specific contracts

```

You will now see the log in tokamak-deployer, if everything worked correctly:

```bash

yarn run v1.22.19
$ ts-node "./bin/pass-deploy-params.ts"
Starting TOKAMAK Contracts Deployment...
ADDRESS_MANAGER_ADDRESS was set to 0x5FbDB2315678afecb367f032d93F642f64180aa3
...
L1CrossDomainMessengerFast deployed to: 0x59b670e9fA9D0A427751Af201D676719a970857b
L1CrossDomainMessengerFast initialized: 0x8f4735396b771db77f0ad02fe72fce76bd878eae40690f7b5ae00283d580b3c0
Proxy__L1CrossDomainMessengerFast deployed to: 0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f
Proxy Fast L1 Messenger initialized: 0x17d79ddad18f22a48191f6765e76208e5430e7321ab040a806749277679b6dab
L1LiquidityPool deployed to: 0x09635F643e140090A9A8Dcd712eD6285858ceBef
L2LiquidityPool deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Proxy__L1LiquidityPool deployed to: 0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E
Proxy__L2LiquidityPool deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Proxy__L1LiquidityPool initialized: 0x5e10d805ee735eaa678e74917c02aaf749d9ec430539408ef55530c4e2236169
Proxy__L2LiquidityPool initialized: 0xcf8224e178e383045303b2a957d8ff4b0be260b8335a795749a1eb80040057d7
TK_L1WETH was newly deployed to 0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8
TK_L2WETH was deployed to 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
WETH Token was registered in LPs
TK_L1USDT was newly deployed to 0x998abeb3E57409262aE5b751f60747921B33613E
TK_L2USDT was deployed to 0x0165878A594ca255338adfa4d48449f69242Eb8F
Tether USD was registered in LPs
TK_L1DAI was newly deployed to 0x0E801D84Fa97b50751Dbf25036d067dCf18858bF
TK_L2DAI was deployed to 0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6
Dai was registered in LPs
TK_L1USDC was newly deployed to 0x36C02dA8a0983159322a80FFE9F24b1acfF8B570
TK_L2USDC was deployed to 0x610178dA211FEF7D417bC0e6FeD39F05609AD788
USD Coin was registered in LPs
TK_L1TON was newly deployed to 0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154
TK_L2TON was deployed to 0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0
Tokamak Network was registered in LPs
TK_L1TOS was newly deployed to 0x2bdCC0de6bE1f7D2ee689a0342D76F52E8EFABa3
TK_L2TOS was deployed to 0x9A676e781A523b5d0C0e43731313A708CB607508
TONStarter was registered in LPs
TokamakBillingContract deployed to: 0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1
Proxy__TokamakBillingContract deployed to: 0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE
Done in 39.40s.

```