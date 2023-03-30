# TOKAMAK Smart Contracts

This deploys the specific contracts needed for the Tokamak Network to work, makes the wallet work, and spins up the entire stack with everything you need to work on developing the wallet.

```bash

$ cd ops
$ docker-compose up -d

```

To get the contract addresses for the system contracts deployed L1, and the TOKAMAK-specific contracts:

```bash

curl http://127.0.0.1:8080/addresses.json | jq # system contracts (deployed by deployer)
curl http://127.0.0.1:8082/tokamak-addr.json | jq # Tokamak-specific contracts (deployed by tokamak-deployer)

```

You will now see the log in tokamak-deployer, if everything worked correctly:

```bash

yarn run v1.22.19
$ ts-node "./bin/pass-deploy-params.ts"
Starting TOKAMAK Contracts Deployment...
ADDRESS_MANAGER_ADDRESS was set to 0x5FbDB2315678afecb367f032d93F642f64180aa3
...
L1CrossDomainMessengerFast deployed to: 0x59b670e9fA9D0A427751Af201D676719a970857b
L1CrossDomainMessengerFast initialized: 0x6e409686ff5d869672b034be3e1f96865b76c438e28f592f875b2ee70e79d759
Registering address for Proxy__L1CrossDomainMessengerFast to 0x4A679253410272dd5232B3Ff7cF5dbB88f295319...
Waiting for registration to reflect on-chain...
✓ Registered address for Proxy__L1CrossDomainMessengerFast
Proxy__L1CrossDomainMessengerFast deployed to: 0x4A679253410272dd5232B3Ff7cF5dbB88f295319
Proxy Fast L1 Messenger initialized: 0x8de9a977c030369a07a97b72902279b86a74250ba611f9289009d7bd8b986d31
Registering address for L1TON to 0xc5a5C42992dECbae36851359345FE25997F5C42d...
Waiting for registration to reflect on-chain...
✓ Registered address for L1TON
L1TON was newly deployed to 0xc5a5C42992dECbae36851359345FE25997F5C42d
Registering address for L2TON to 0x5FbDB2315678afecb367f032d93F642f64180aa3...
Waiting for registration to reflect on-chain...
✓ Registered address for L2TON
L2TON was deployed to 0x5FbDB2315678afecb367f032d93F642f64180aa3
L1 Message deployed to: 0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690
Registering address for L1Message to 0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690...
Waiting for registration to reflect on-chain...
✓ Registered address for L1Message
L2 Message deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Registering address for L2Message to 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512...
Waiting for registration to reflect on-chain...
✓ Registered address for L2Message
L1 Message initialized: 0x18039d3893e1cc7003e2a00a15a29c0d2a01764ae73270397e1f294d44c602fd
L2 Message initialized: 0x261597399bc5049062c51c6c3aee3989bce02448fc618ea4cd95936645d05d51
...
Done in 7.80s.

```