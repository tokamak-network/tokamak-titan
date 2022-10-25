# IL1LiquidityPool



> IL1LiquidityPool





## Methods

### clientPayL1

```solidity
function clientPayL1(address payable _to, uint256 _amount, address _tokenAddress) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _to | address payable | undefined
| _amount | uint256 | undefined
| _tokenAddress | address | undefined

### configureFee

```solidity
function configureFee(uint256 _userRewardMinFeeRate, uint256 _userRewardMaxFeeRate, uint256 _ownerRewardFeeRate) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _userRewardMinFeeRate | uint256 | undefined
| _userRewardMaxFeeRate | uint256 | undefined
| _ownerRewardFeeRate | uint256 | undefined



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



