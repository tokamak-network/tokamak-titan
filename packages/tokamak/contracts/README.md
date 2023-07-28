# @tokamak-network/titan-contracts

`@tokamak-network/titan-contracts` contains the various Solidity smart contracts used within the Titan network.
Some of these contracts are [meant to be deployed to Ethereum ("Layer 1")](https://github.com/tokamak-network/tokamak-titan/tree/main/packages/tokamak/contracts/contracts/L1), while others are [meant to be deployed to Titan ("Layer 2")](https://github.com/tokamak-network/tokamak-titan/tree/main/packages/tokamak/contracts/contracts/L2).


## Usage (npm)

You can import `@tokamak-network/titan-contracts` to use the Titan contracts within your own codebase.
Install via `npm` or `yarn`:

```shell
npm install @tokamak-network/titan-contracts
```

Within your contracts:

```solidity
import { SomeContract } from "@tokamak-network/titan-contracts/path/to/SomeContract.sol";
```

Note that the `/path/to/SomeContract.sol` is the path to the target contract within the [contracts folder](https://github.com/tokamak-network/tokamak-titan/tree/main/packages/tokamak/contracts/contracts) inside of this package.
For example, the [L1CrossDomainMessenger](https://github.com/tokamak-network/tokamak-titan/tree/main/packages/tokamak/contracts/contracts/L1/messaging/L1CrossDomainMessenger.sol) contract is located at `packages/contracts/contracts/L1/messaging/L1CrossDomainMessenger.sol`, relative to this README.
You would therefore import the contract as:


```solidity
import { L1CrossDomainMessenger } from "@tokamak-network/titan-contracts/L1/messaging/L1CrossDomainMessenger.sol";
```

## Guide for Developers

### Setup

Install the following:
- [`Node.js` (16+)](https://nodejs.org/en/)
- [`npm`](https://www.npmjs.com/get-npm)
- [`yarn`](https://classic.yarnpkg.com/en/docs/install/)

Clone the repo:

```shell
git clone https://github.com/tokamak-network/tokamak-titan.git
cd packages/tokamak/contracts
```

Install `npm` packages:

```shell
yarn install
```

### Running Tests

Tests are executed via `yarn`:

```shell
yarn test
```

Run specific tests by giving a path to the file you want to run:

```shell
yarn test ./test/path/to/my/test.spec.ts
```

### Measuring test coverage:

```shell
yarn test:coverage
```

The output is most easily viewable by opening the html file in your browser:

```shell
open ./coverage/index.html
```

### Compiling and Building

Compile and build the various required with the `build` command:

```shell
yarn build
```

### Deploying the Contracts

#### Required environment variables

You must set several required environment variables before you can execute a deployment.
Duplicate the file [`.env.example`](./.env.example) and rename your duplicate to `.env`.
Fill out each of the environment variables before continuing.

#### Creating a deployment configuration

Before you can carry out a deployment, you must create a deployment configuration file inside of the [deploy-config](./deploy-config/) folder.
Deployment configuration files are TypeScript files that export an object that conforms to the `DeployConfig` type.
See [mainnet.ts](./deploy-config/mainnet.ts) for an example deployment configuration.
We recommend duplicating an existing deployment config and modifying it to satisfy your requirements.

#### Executing a deployment

Once you've created your deploy config, you can execute a deployment with the following command:

```
npx hardhat deploy --network <my network name>
```

Note that this only applies to fresh deployments.
If you want to upgrade an existing system (instead of deploying a new system from scratch), you must use the following command instead:

```
npx hardhat deploy --network <my network name> --tags upgrade
```

During the deployment process, you will be asked to transfer ownership of several contracts to a special contract address.
You will also be asked to verify various configuration values.
This is a safety mechanism to make sure that actions within an upgrade are performed atomically.
Ownership of these addresses will be automatically returned to the original owner address once the upgrade is complete.
The original owner can always recover ownership from the upgrade contract in an emergency.
Please read these instructions carefully, verify each of the presented configuration values, and carefully confirm that the contract you are giving ownership to has not been compromised (e.g., check the code on Etherscan).

After your deployment is complete, your new contracts will be written to an artifacts directory in `./deployments/<my network name>`.

