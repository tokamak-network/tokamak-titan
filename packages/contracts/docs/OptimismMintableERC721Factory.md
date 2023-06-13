# OptimismMintableERC721Factory



> OptimismMintableERC721Factory

Factory contract for creating OptimismMintableERC721 contracts.



## Methods

### bridge

```solidity
function bridge() external view returns (address)
```

Address of the ERC721 bridge on this network.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### createStandardOptimismMintableERC721

```solidity
function createStandardOptimismMintableERC721(address _remoteToken, string _name, string _symbol) external nonpayable
```

Creates an instance of the standard ERC721.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _remoteToken | address | Address of the corresponding token on the other domain.
| _name | string | ERC721 name.
| _symbol | string | ERC721 symbol.

### isStandardOptimismMintableERC721

```solidity
function isStandardOptimismMintableERC721(address) external view returns (bool)
```

Tracks addresses created by this factory.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### remoteChainId

```solidity
function remoteChainId() external view returns (uint256)
```

Chain ID for the remote network.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined



## Events

### OptimismMintableERC721Created

```solidity
event OptimismMintableERC721Created(address indexed localToken, address indexed remoteToken)
```

Emitted whenever a new OptimismMintableERC721 contract is created.



#### Parameters

| Name | Type | Description |
|---|---|---|
| localToken `indexed` | address | Address of the token on the this domain. |
| remoteToken `indexed` | address | Address of the token on the remote domain. |



