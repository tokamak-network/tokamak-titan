# L2BillingContract









## Methods

### collectFee

```solidity
function collectFee() external nonpayable
```






### exitFee

```solidity
function exitFee() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### feeTokenAddress

```solidity
function feeTokenAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### initialize

```solidity
function initialize(address _feeTokenAddress, address _l2FeeWallet, uint256 _exitFee) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _feeTokenAddress | address | undefined
| _l2FeeWallet | address | undefined
| _exitFee | uint256 | undefined

### l2FeeWallet

```solidity
function l2FeeWallet() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### owner

```solidity
function owner() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### transferOwnership

```solidity
function transferOwnership(address _newOwner) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _newOwner | address | undefined

### updateExitFee

```solidity
function updateExitFee(uint256 _exitFee) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _exitFee | uint256 | undefined

### withdraw

```solidity
function withdraw() external nonpayable
```








## Events

### CollectFee

```solidity
event CollectFee(address, uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |
| _1  | uint256 | undefined |

### TransferOwnership

```solidity
event TransferOwnership(address, address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |
| _1  | address | undefined |

### UpdateExitFee

```solidity
event UpdateExitFee(uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | uint256 | undefined |

### Withdraw

```solidity
event Withdraw(address, uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |
| _1  | uint256 | undefined |



