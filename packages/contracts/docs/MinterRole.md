# MinterRole









## Methods

### addMinter

```solidity
function addMinter(address account) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined

### isMinter

```solidity
function isMinter(address account) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### renounceMinter

```solidity
function renounceMinter() external nonpayable
```








## Events

### MinterAdded

```solidity
event MinterAdded(address indexed account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account `indexed` | address | undefined |

### MinterRemoved

```solidity
event MinterRemoved(address indexed account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account `indexed` | address | undefined |



