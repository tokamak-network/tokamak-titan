# Boba_GasPriceOracle



> Boba_GasPriceOracle





## Methods

### MIN_WITHDRAWAL_AMOUNT

```solidity
function MIN_WITHDRAWAL_AMOUNT() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### bobaFeeTokenUsers

```solidity
function bobaFeeTokenUsers(address) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### feeWallet

```solidity
function feeWallet() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### gasPriceOracleAddress

```solidity
function gasPriceOracleAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### getL1BobaFee

```solidity
function getL1BobaFee(bytes _txData) external view returns (uint256)
```

Get L1 Boba fee for fee estimation



#### Parameters

| Name | Type | Description |
|---|---|---|
| _txData | bytes | the data payload

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### initialize

```solidity
function initialize(address payable _feeWallet, address _l2BobaAddress) external nonpayable
```

Initialize feeWallet and l2BobaAddress.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _feeWallet | address payable | undefined
| _l2BobaAddress | address | undefined

### l2BobaAddress

```solidity
function l2BobaAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### marketPriceRatio

```solidity
function marketPriceRatio() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### maxPriceRatio

```solidity
function maxPriceRatio() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### minPriceRatio

```solidity
function minPriceRatio() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### owner

```solidity
function owner() external view returns (address)
```

Returns the address of the current owner.




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### priceRatio

```solidity
function priceRatio() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### receivedETHAmount

```solidity
function receivedETHAmount() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### transferOwnership

```solidity
function transferOwnership(address _newOwner) external nonpayable
```

transfer ownership



#### Parameters

| Name | Type | Description |
|---|---|---|
| _newOwner | address | new owner address

### updateGasPriceOracleAddress

```solidity
function updateGasPriceOracleAddress(address _gasPriceOracleAddress) external nonpayable
```

Update the gas oracle address



#### Parameters

| Name | Type | Description |
|---|---|---|
| _gasPriceOracleAddress | address | gas oracle address

### updateMaxPriceRatio

```solidity
function updateMaxPriceRatio(uint256 _maxPriceRatio) external nonpayable
```

Update the maximum price ratio of ETH and BOBA



#### Parameters

| Name | Type | Description |
|---|---|---|
| _maxPriceRatio | uint256 | the maximum price ratio of ETH and BOBA

### updateMinPriceRatio

```solidity
function updateMinPriceRatio(uint256 _minPriceRatio) external nonpayable
```

Update the minimum price ratio of ETH and BOBA



#### Parameters

| Name | Type | Description |
|---|---|---|
| _minPriceRatio | uint256 | the minimum price ratio of ETH and BOBA

### updatePriceRatio

```solidity
function updatePriceRatio(uint256 _priceRatio, uint256 _marketPriceRatio) external nonpayable
```

Update the price ratio of ETH and BOBA



#### Parameters

| Name | Type | Description |
|---|---|---|
| _priceRatio | uint256 | the price ratio of ETH and BOBA
| _marketPriceRatio | uint256 | tha market price ratio of ETH and BOBA

### updateReceivedETHAmount

```solidity
function updateReceivedETHAmount(uint256 _receivedETHAmount) external nonpayable
```

Update the received ETH amount



#### Parameters

| Name | Type | Description |
|---|---|---|
| _receivedETHAmount | uint256 | the received ETH amount

### useBobaAsFeeToken

```solidity
function useBobaAsFeeToken() external nonpayable
```

Add the users that want to use BOBA as the fee token




### useETHAsFeeToken

```solidity
function useETHAsFeeToken() external nonpayable
```

Add the users that want to use ETH as the fee token




### withdrawBOBA

```solidity
function withdrawBOBA() external nonpayable
```

withdraw BOBA tokens to l1 fee wallet




### withdrawETH

```solidity
function withdrawETH() external nonpayable
```

withdraw ETH tokens to l2 fee wallet






## Events

### TransferOwnership

```solidity
event TransferOwnership(address, address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |
| _1  | address | undefined |

### UpdateGasPriceOracleAddress

```solidity
event UpdateGasPriceOracleAddress(address, address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |
| _1  | address | undefined |

### UpdateMaxPriceRatio

```solidity
event UpdateMaxPriceRatio(address, uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |
| _1  | uint256 | undefined |

### UpdateMinPriceRatio

```solidity
event UpdateMinPriceRatio(address, uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |
| _1  | uint256 | undefined |

### UpdatePriceRatio

```solidity
event UpdatePriceRatio(address, uint256, uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |
| _1  | uint256 | undefined |
| _2  | uint256 | undefined |

### UpdateReceivedETHAmount

```solidity
event UpdateReceivedETHAmount(address, uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |
| _1  | uint256 | undefined |

### UseBobaAsFeeToken

```solidity
event UseBobaAsFeeToken(address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |

### UseETHAsFeeToken

```solidity
event UseETHAsFeeToken(address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |

### WithdrawBOBA

```solidity
event WithdrawBOBA(address, address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |
| _1  | address | undefined |

### WithdrawETH

```solidity
event WithdrawETH(address, address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |
| _1  | address | undefined |



