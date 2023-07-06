# IL1ERC721Bridge



> IL1ERC721Bridge






## Events

### ERC721BridgeFinalized

```solidity
event ERC721BridgeFinalized(address indexed localToken, address indexed remoteToken, address indexed from, address to, uint256 tokenId, bytes extraData)
```

Emitted when an ERC721 bridge from the other network is finalized.



#### Parameters

| Name | Type | Description |
|---|---|---|
| localToken `indexed` | address | Address of the token on this domain. |
| remoteToken `indexed` | address | Address of the token on the remote domain. |
| from `indexed` | address | Address that initiated bridging action. |
| to  | address | Address to receive the token. |
| tokenId  | uint256 | ID of the specific token deposited. |
| extraData  | bytes | Extra data for use on the client-side. |

### ERC721BridgeInitiated

```solidity
event ERC721BridgeInitiated(address indexed localToken, address indexed remoteToken, address indexed from, address to, uint256 tokenId, bytes extraData)
```

Emitted when an ERC721 bridge to the other network is initiated.



#### Parameters

| Name | Type | Description |
|---|---|---|
| localToken `indexed` | address | Address of the token on this domain. |
| remoteToken `indexed` | address | Address of the token on the remote domain. |
| from `indexed` | address | Address that initiated bridging action. |
| to  | address | Address to receive the token. |
| tokenId  | uint256 | ID of the specific token deposited. |
| extraData  | bytes | Extra data for use on the client-side. |



