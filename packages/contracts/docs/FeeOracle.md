# FeeOracle









## Methods

### challengeFee

```solidity
function challengeFee(uint256 _blockNumber, iFeeOracle.L2MessageInclusionProof _proof) external nonpayable returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _blockNumber | uint256 | undefined
| _proof | iFeeOracle.L2MessageInclusionProof | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### feePercentage

```solidity
function feePercentage(uint256) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### libAddressManager

```solidity
function libAddressManager() external view returns (contract Lib_AddressManager)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract Lib_AddressManager | undefined

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### resolve

```solidity
function resolve(string _name) external view returns (address)
```

Resolves the address associated with a given name.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _name | string | Name to resolve an address for.

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address associated with the given name.

### setFeePercentage

```solidity
function setFeePercentage(uint256 _blockNumber, uint256 _feePercentage) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _blockNumber | uint256 | undefined
| _feePercentage | uint256 | undefined

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined



## Events

### FeePercentageUpdated

```solidity
event FeePercentageUpdated(uint256, uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | uint256 | undefined |
| _1  | uint256 | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |



