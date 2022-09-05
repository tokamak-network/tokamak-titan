# Ton_GasPriceOracle



> Ton_GasPriceOracle





## Methods

### MIN_WITHDRAWAL_AMOUNT

```solidity
function MIN_WITHDRAWAL_AMOUNT() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

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

### getL1TonFee

```solidity
function getL1TonFee(bytes _txData) external view returns (uint256)
```

Get L1 Ton fee for fee estimation



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
function initialize(address payable _feeWallet, address _l2TonAddress) external nonpayable
```

Initialize feeWallet and l2TonAddress.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _feeWallet | address payable | undefined
| _l2TonAddress | address | undefined

### l2TonAddress

```solidity
function l2TonAddress() external view returns (address)
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

### tonFeeTokenUsers

```solidity
function tonFeeTokenUsers(address) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

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

Update the maximum price ratio of ETH and TON



#### Parameters

| Name | Type | Description |
|---|---|---|
| _maxPriceRatio | uint256 | the maximum price ratio of ETH and TON

### updateMinPriceRatio

```solidity
function updateMinPriceRatio(uint256 _minPriceRatio) external nonpayable
```

Update the minimum price ratio of ETH and TON



#### Parameters

| Name | Type | Description |
|---|---|---|
| _minPriceRatio | uint256 | the minimum price ratio of ETH and TON

### updatePriceRatio

```solidity
function updatePriceRatio(uint256 _priceRatio, uint256 _marketPriceRatio) external nonpayable
```

Update the price ratio of ETH and TON



#### Parameters

| Name | Type | Description |
|---|---|---|
| _priceRatio | uint256 | the price ratio of ETH and TON
| _marketPriceRatio | uint256 | tha market price ratio of ETH and TON

### useETHAsFeeToken

```solidity
function useETHAsFeeToken() external nonpayable
```

Add the users that want to use ETH as the fee token




### useTonAsFeeToken

```solidity
function useTonAsFeeToken() external nonpayable
```

Add the users that want to use TON as the fee token




### withdrawTON

```solidity
function withdrawTON() external nonpayable
```

withdraw TON tokens to l1 fee wallet






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

### UseETHAsFeeToken

```solidity
event UseETHAsFeeToken(address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |

### UseTonAsFeeToken

```solidity
event UseTonAsFeeToken(address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |

### WithdrawETH

```solidity
event WithdrawETH(address, address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |
| _1  | address | undefined |

### WithdrawTON

```solidity
event WithdrawTON(address, address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0  | address | undefined |
| _1  | address | undefined |



