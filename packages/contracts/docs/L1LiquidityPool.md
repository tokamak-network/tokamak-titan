# L1LiquidityPool







*An L1 LiquidityPool implementation*

## Methods

### L1StandardBridgeAddress

```solidity
function L1StandardBridgeAddress() external view returns (address payable)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address payable | undefined

### L2LiquidityPoolAddress

```solidity
function L2LiquidityPoolAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### SAFE_GAS_STIPEND

```solidity
function SAFE_GAS_STIPEND() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### SETTLEMENT_L2_GAS

```solidity
function SETTLEMENT_L2_GAS() external view returns (uint32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint32 | undefined

### addLiquidity

```solidity
function addLiquidity(uint256 _amount, address _tokenAddress) external payable
```

Liquididity providers add liquidity



#### Parameters

| Name | Type | Description |
|---|---|---|
| _amount | uint256 | liquidity amount that users want to deposit.
| _tokenAddress | address | address of the liquidity token.

### clientPayL1

```solidity
function clientPayL1(address payable _to, uint256 _amount, address _tokenAddress) external nonpayable
```

Move funds from L2 to L1, and pay out from the right liquidity pool part of the contract pause, if only this method needs pausing use pause on CDM_Fast



#### Parameters

| Name | Type | Description |
|---|---|---|
| _to | address payable | receiver to get the funds
| _amount | uint256 | amount to to be transferred.
| _tokenAddress | address | L1 token address

### configureFee

```solidity
function configureFee(uint256 _userRewardMinFeeRate, uint256 _userRewardMaxFeeRate, uint256 _ownerRewardFeeRate) external nonpayable
```



*Configure fee of this contract. called from L2Each fee rate is scaled by 10^3 for precision, eg- a fee rate of 50 would mean 5%*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _userRewardMinFeeRate | uint256 | minimum fee rate that users get
| _userRewardMaxFeeRate | uint256 | maximum fee rate that users get
| _ownerRewardFeeRate | uint256 | fee rate that contract owner gets

### configureGas

```solidity
function configureGas(uint32 _l2GasFee, uint256 _safeGas) external nonpayable
```



*Configure gas.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _l2GasFee | uint32 | default finalized deposit L2 Gas
| _safeGas | uint256 | safe gas stipened

### currentDepositInfoHash

```solidity
function currentDepositInfoHash() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined

### getUserRewardFeeRate

```solidity
function getUserRewardFeeRate(address _l1TokenAddress) external view returns (uint256 userRewardFeeRate)
```



*Return user reward fee rate.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _l1TokenAddress | address | L1 token address

#### Returns

| Name | Type | Description |
|---|---|---|
| userRewardFeeRate | uint256 | undefined

### initialize

```solidity
function initialize(address _l1CrossDomainMessenger, address _l1CrossDomainMessengerFast, address _L2LiquidityPoolAddress, address payable _L1StandardBridgeAddress) external nonpayable
```



*Initialize this contract.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _l1CrossDomainMessenger | address | L1 Messenger address being used for sending the cross-chain message.
| _l1CrossDomainMessengerFast | address | L1 Messenger address being used for relaying cross-chain messages quickly.
| _L2LiquidityPoolAddress | address | Address of the corresponding L2 LP deployed to the L2 chain
| _L1StandardBridgeAddress | address payable | Address of L1 StandardBridge

### l1CrossDomainMessenger

```solidity
function l1CrossDomainMessenger() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### lastHashUpdateBlock

```solidity
function lastHashUpdateBlock() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### owner

```solidity
function owner() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### ownerRewardFeeRate

```solidity
function ownerRewardFeeRate() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### pause

```solidity
function pause() external nonpayable
```

Pause contract




### paused

```solidity
function paused() external view returns (bool)
```



*Returns true if the contract is paused, and false otherwise.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined

### poolInfo

```solidity
function poolInfo(address) external view returns (address l1TokenAddress, address l2TokenAddress, uint256 userDepositAmount, uint256 lastAccUserReward, uint256 accUserReward, uint256 accUserRewardPerShare, uint256 accOwnerReward, uint256 startTime)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| l1TokenAddress | address | undefined
| l2TokenAddress | address | undefined
| userDepositAmount | uint256 | undefined
| lastAccUserReward | uint256 | undefined
| accUserReward | uint256 | undefined
| accUserRewardPerShare | uint256 | undefined
| accOwnerReward | uint256 | undefined
| startTime | uint256 | undefined

### priorDepositInfoHash

```solidity
function priorDepositInfoHash() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined

### rebalanceLP

```solidity
function rebalanceLP(uint256 _amount, address _tokenAddress) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _amount | uint256 | undefined
| _tokenAddress | address | undefined

### registerPool

```solidity
function registerPool(address _l1TokenAddress, address _l2TokenAddress) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _l1TokenAddress | address | undefined
| _l2TokenAddress | address | undefined

### relayerMessenger

```solidity
function relayerMessenger() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### senderMessenger

```solidity
function senderMessenger() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### transferOwnership

```solidity
function transferOwnership(address _newOwner) external nonpayable
```



*transfer ownership*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _newOwner | address | new owner of this contract

### unpause

```solidity
function unpause() external nonpayable
```

UnPause contract




### updateUserRewardPerShare

```solidity
function updateUserRewardPerShare(address _tokenAddress) external nonpayable
```

Update the user reward per share



#### Parameters

| Name | Type | Description |
|---|---|---|
| _tokenAddress | address | Address of the target token.

### userInfo

```solidity
function userInfo(address, address) external view returns (uint256 amount, uint256 rewardDebt, uint256 pendingReward)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined
| _1 | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| amount | uint256 | undefined
| rewardDebt | uint256 | undefined
| pendingReward | uint256 | undefined

### userRewardMaxFeeRate

```solidity
function userRewardMaxFeeRate() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### userRewardMinFeeRate

```solidity
function userRewardMinFeeRate() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### withdrawLiquidity

```solidity
function withdrawLiquidity(uint256 _amount, address _tokenAddress, address payable _to) external nonpayable
```

Users withdraw token from LP



#### Parameters

| Name | Type | Description |
|---|---|---|
| _amount | uint256 | amount to withdraw
| _tokenAddress | address | L1 token address
| _to | address payable | receiver to get the funds

### withdrawReward

```solidity
function withdrawReward(uint256 _amount, address _tokenAddress, address _to) external nonpayable
```

withdraw reward from ERC20



#### Parameters

| Name | Type | Description |
|---|---|---|
| _amount | uint256 | reward amount that liquidity providers want to withdraw
| _tokenAddress | address | L1 token address
| _to | address | receiver to get the reward



## Events

### AddLiquidity

```solidity
event AddLiquidity(address sender, uint256 amount, address tokenAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sender  | address | undefined |
| amount  | uint256 | undefined |
| tokenAddress  | address | undefined |

### ClientPayL1

```solidity
event ClientPayL1(address sender, uint256 amount, uint256 userRewardFee, uint256 ownerRewardFee, uint256 totalFee, address tokenAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sender  | address | undefined |
| amount  | uint256 | undefined |
| userRewardFee  | uint256 | undefined |
| ownerRewardFee  | uint256 | undefined |
| totalFee  | uint256 | undefined |
| tokenAddress  | address | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner  | address | undefined |

### Paused

```solidity
event Paused(address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |

### RebalanceLP

```solidity
event RebalanceLP(uint256 amount, address tokenAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| amount  | uint256 | undefined |
| tokenAddress  | address | undefined |

### Unpaused

```solidity
event Unpaused(address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account  | address | undefined |

### WithdrawLiquidity

```solidity
event WithdrawLiquidity(address sender, address receiver, uint256 amount, address tokenAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sender  | address | undefined |
| receiver  | address | undefined |
| amount  | uint256 | undefined |
| tokenAddress  | address | undefined |

### WithdrawReward

```solidity
event WithdrawReward(address sender, address receiver, uint256 amount, address tokenAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sender  | address | undefined |
| receiver  | address | undefined |
| amount  | uint256 | undefined |
| tokenAddress  | address | undefined |



