# ProxyAdmin



> ProxyAdmin

This is an auxiliary contract meant to be assigned as the admin of an ERC1967 Proxy,         based on the OpenZeppelin implementation. It has backwards compatibility logic to work         with the various types of proxies that have been deployed by Optimism in the past.



## Methods

### addressManager

```solidity
function addressManager() external view returns (contract Lib_AddressManager)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract Lib_AddressManager | undefined

### changeProxyAdmin

```solidity
function changeProxyAdmin(address payable _proxy, address _newAdmin) external nonpayable
```

Updates the admin of the given proxy address.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _proxy | address payable | Address of the proxy to update.
| _newAdmin | address | Address of the new proxy admin.

### getProxyAdmin

```solidity
function getProxyAdmin(address payable _proxy) external view returns (address)
```

Returns the admin of the given proxy address.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _proxy | address payable | Address of the proxy to get the admin of.

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of the admin of the proxy.

### getProxyImplementation

```solidity
function getProxyImplementation(address _proxy) external view returns (address)
```

Returns the implementation of the given proxy address.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _proxy | address | Address of the proxy to get the implementation of.

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of the implementation of the proxy.

### implementationName

```solidity
function implementationName(address) external view returns (string)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined

### isUpgrading

```solidity
function isUpgrading() external view returns (bool)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | Whether or not there is an upgrade going on. May not actually tell you whether an         upgrade is going on, since we don&#39;t currently plan to use this variable for anything         other than a legacy indicator to fix a UX bug in the ChugSplash proxy.

### owner

```solidity
function owner() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

### proxyType

```solidity
function proxyType(address) external view returns (enum ProxyAdmin.ProxyType)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | enum ProxyAdmin.ProxyType | undefined

### setAddress

```solidity
function setAddress(string _name, address _address) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _name | string | Name to set within the Lib_AddressManager.
| _address | address | Address to attach to the given name.

### setAddressManager

```solidity
function setAddressManager(contract Lib_AddressManager _address) external nonpayable
```

Set the address of the Lib_AddressManager. This is required to manage legacy         ResolvedDelegateProxy type proxy contracts.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _address | contract Lib_AddressManager | Address of the Lib_AddressManager.

### setImplementationName

```solidity
function setImplementationName(address _address, string _name) external nonpayable
```

Sets the implementation name for a given address. Only required for         ResolvedDelegateProxy type proxies that have an implementation name.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _address | address | Address of the ResolvedDelegateProxy.
| _name | string | Name of the implementation for the proxy.

### setOwner

```solidity
function setOwner(address newOwner) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined

### setProxyType

```solidity
function setProxyType(address _address, enum ProxyAdmin.ProxyType _type) external nonpayable
```

Sets the proxy type for a given address. Only required for non-standard (legacy)         proxy types.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _address | address | Address of the proxy.
| _type | enum ProxyAdmin.ProxyType | Type of the proxy.

### setUpgrading

```solidity
function setUpgrading(bool _upgrading) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _upgrading | bool | Whether or not the system is upgrading.

### upgrade

```solidity
function upgrade(address payable _proxy, address _implementation) external nonpayable
```

Changes a proxy&#39;s implementation contract.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _proxy | address payable | Address of the proxy to upgrade.
| _implementation | address | Address of the new implementation address.

### upgradeAndCall

```solidity
function upgradeAndCall(address payable _proxy, address _implementation, bytes _data) external payable
```

Changes a proxy&#39;s implementation contract and delegatecalls the new implementation         with some given data. Useful for atomic upgrade-and-initialize calls.



#### Parameters

| Name | Type | Description |
|---|---|---|
| _proxy | address payable | Address of the proxy to upgrade.
| _implementation | address | Address of the new implementation address.
| _data | bytes | Data to trigger the new implementation with.



## Events

### OwnerUpdated

```solidity
event OwnerUpdated(address indexed user, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| user `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |



