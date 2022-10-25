# L2LiquidityPool







*An L2 LiquidityPool implementation*

## Methods

### DAO

```solidity
function DAO() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### DEFAULT_FINALIZE_WITHDRAWAL_L1_GAS

```solidity
function DEFAULT_FINALIZE_WITHDRAWAL_L1_GAS() external view returns (uint32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint32 | undefined

### L1LiquidityPoolAddress

```solidity
function L1LiquidityPoolAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

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

### billingContractAddress

```solidity
function billingContractAddress() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### clientDepositL2

```solidity
function clientDepositL2(uint256 _amount, address _tokenAddress) external payable
```

Client deposit ERC20 from their account to this contract, which then releases funds on the L1 side



#### Parameters

| Name | Type | Description |
|---|---|---|
| _amount | uint256 | amount that client wants to transfer.
| _tokenAddress | address | L2 token address

### clientPayL2Settlement

```solidity
function clientPayL2Settlement(address payable _to, uint256 _amount, address _tokenAddress) external nonpayable
```

Settlement pay when there&#39;s not enough funds on other side



#### Parameters

| Name | Type | Description |
|---|---|---|
| _to | address payable | receiver to get the funds
| _amount | uint256 | amount to to be transferred.
| _tokenAddress | address | L2 token address

### configureBillingContractAddress

```solidity
function configureBillingContractAddress(address _billingContractAddress) external nonpayable
```



*Configure billing contract address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _billingContractAddress | address | billing contract address

### configureFee

```solidity
function configureFee(uint256 _userRewardMinFeeRate, uint256 _userRewardMaxFeeRate, uint256 _ownerRewardFeeRate) external nonpayable
```



*Configure fee of this contract.Each fee rate is scaled by 10^3 for precision, eg- a fee rate of 50 would mean 5% 예시. fee rate가 50이면 5% (50 / 1000)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _userRewardMinFeeRate | uint256 | minimum fee rate that users get
| _userRewardMaxFeeRate | uint256 | maximum fee rate that users get
| _ownerRewardFeeRate | uint256 | fee rate that contract owner gets

### configureFeeExits

```solidity
function configureFeeExits(uint256 _userRewardMinFeeRate, uint256 _userRewardMaxFeeRate, uint256 _ownerRewardFeeRate) external nonpayable
```



*Configure fee of the L1LP contractEach fee rate is scaled by 10^3 for precision, eg- a fee rate of 50 would mean 5%*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _userRewardMinFeeRate | uint256 | minimum fee rate that users get
| _userRewardMaxFeeRate | uint256 | maximum fee rate that users get
| _ownerRewardFeeRate | uint256 | fee rate that contract owner gets

### configureGas

```solidity
function configureGas(uint32 _l1GasFee) external nonpayable
```



*Configure gas.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _l1GasFee | uint32 | default finalized withdraw L1 Gas

### extraGasRelay

```solidity
function extraGasRelay() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### getFinalizeDepositL1Gas

```solidity
function getFinalizeDepositL1Gas() external view returns (uint32)
```



*Overridable getter for the L1 gas limit of settling the deposit, in the case it may be dynamic, and the above public constant does not suffice.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint32 | undefined

### getUserRewardFeeRate

```solidity
function getUserRewardFeeRate(address _l2TokenAddress) external view returns (uint256 userRewardFeeRate)
```



*Return user reward fee rate.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _l2TokenAddress | address | L2 token address

#### Returns

| Name | Type | Description |
|---|---|---|
| userRewardFeeRate | uint256 | undefined

### initialize

```solidity
function initialize(address _l2CrossDomainMessenger, address _L1LiquidityPoolAddress) external nonpayable
```



*Initialize this contract.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _l2CrossDomainMessenger | address | L2 Messenger address being used for sending the cross-chain message.
| _L1LiquidityPoolAddress | address | Address of the corresponding L1 LP deployed to the main chain

### messenger

```solidity
function messenger() external view returns (address)
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

### transferDAORole

```solidity
function transferDAORole(address _newDAO) external nonpayable
```



*transfer priviledges to DAO*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _newDAO | address | new fee setter

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
| _tokenAddress | address | L2 token address
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
| _tokenAddress | address | L2 token address
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

### ClientDepositL2

```solidity
event ClientDepositL2(address sender, uint256 receivedAmount, address tokenAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sender  | address | undefined |
| receivedAmount  | uint256 | undefined |
| tokenAddress  | address | undefined |

### ClientPayL2Settlement

```solidity
event ClientPayL2Settlement(address sender, uint256 amount, uint256 userRewardFee, uint256 ownerRewardFee, uint256 totalFee, address tokenAddress)
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

### DaoRoleTransferred

```solidity
event DaoRoleTransferred(address newDao)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newDao  | address | undefined |

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



