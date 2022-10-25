# IL2LiquidityPool



> IL2LiquidityPool





## Methods

### clientPayL2Settlement

```solidity
function clientPayL2Settlement(address payable _to, uint256 _amount, address _tokenAddress) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _to | address payable | undefined
| _amount | uint256 | undefined
| _tokenAddress | address | undefined



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



