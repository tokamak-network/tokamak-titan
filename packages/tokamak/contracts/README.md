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
TK_L1TON was newly deployed to 0x5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154
TK_L2TON was deployed to 0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0
Done in 39.40s.

```