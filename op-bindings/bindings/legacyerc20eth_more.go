// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package bindings

import (
	"encoding/json"

	"github.com/ethereum-optimism/optimism/op-bindings/solc"
)

const LegacyERC20ETHStorageLayoutJSON = "{\"storage\":[{\"astId\":27934,\"contract\":\"contracts/legacy/LegacyERC20ETH.sol:LegacyERC20ETH\",\"label\":\"_balances\",\"offset\":0,\"slot\":\"0\",\"type\":\"t_mapping(t_address,t_uint256)\"},{\"astId\":27940,\"contract\":\"contracts/legacy/LegacyERC20ETH.sol:LegacyERC20ETH\",\"label\":\"_allowances\",\"offset\":0,\"slot\":\"1\",\"type\":\"t_mapping(t_address,t_mapping(t_address,t_uint256))\"},{\"astId\":27942,\"contract\":\"contracts/legacy/LegacyERC20ETH.sol:LegacyERC20ETH\",\"label\":\"_totalSupply\",\"offset\":0,\"slot\":\"2\",\"type\":\"t_uint256\"},{\"astId\":27944,\"contract\":\"contracts/legacy/LegacyERC20ETH.sol:LegacyERC20ETH\",\"label\":\"_name\",\"offset\":0,\"slot\":\"3\",\"type\":\"t_string_storage\"},{\"astId\":27946,\"contract\":\"contracts/legacy/LegacyERC20ETH.sol:LegacyERC20ETH\",\"label\":\"_symbol\",\"offset\":0,\"slot\":\"4\",\"type\":\"t_string_storage\"},{\"astId\":25198,\"contract\":\"contracts/legacy/LegacyERC20ETH.sol:LegacyERC20ETH\",\"label\":\"remoteToken\",\"offset\":0,\"slot\":\"5\",\"type\":\"t_address\"},{\"astId\":25201,\"contract\":\"contracts/legacy/LegacyERC20ETH.sol:LegacyERC20ETH\",\"label\":\"bridge\",\"offset\":0,\"slot\":\"6\",\"type\":\"t_address\"}],\"types\":{\"t_address\":{\"encoding\":\"inplace\",\"label\":\"address\",\"numberOfBytes\":\"20\"},\"t_mapping(t_address,t_mapping(t_address,t_uint256))\":{\"encoding\":\"mapping\",\"label\":\"mapping(address =\u003e mapping(address =\u003e uint256))\",\"numberOfBytes\":\"32\",\"key\":\"t_address\",\"value\":\"t_mapping(t_address,t_uint256)\"},\"t_mapping(t_address,t_uint256)\":{\"encoding\":\"mapping\",\"label\":\"mapping(address =\u003e uint256)\",\"numberOfBytes\":\"32\",\"key\":\"t_address\",\"value\":\"t_uint256\"},\"t_string_storage\":{\"encoding\":\"bytes\",\"label\":\"string\",\"numberOfBytes\":\"32\"},\"t_uint256\":{\"encoding\":\"inplace\",\"label\":\"uint256\",\"numberOfBytes\":\"32\"}}}"

var LegacyERC20ETHStorageLayout = new(solc.StorageLayout)

var LegacyERC20ETHDeployedBin = "0x608060405234801561001057600080fd5b50600436106101365760003560e01c806395d89b41116100b2578063ae1f6aaf11610081578063d6c0b2c411610066578063d6c0b2c4146102bb578063dd62ed3e146102db578063e78cea921461032157600080fd5b8063ae1f6aaf1461025e578063c01e1bd61461029d57600080fd5b806395d89b411461021d5780639dc29fac14610225578063a457c2d714610238578063a9059cbb1461024b57600080fd5b806323b872dd1161010957806339509351116100ee57806339509351146101bf57806340c10f19146101d257806370a08231146101e757600080fd5b806323b872dd1461019d578063313ce567146101b057600080fd5b806301ffc9a71461013b57806306fdde0314610163578063095ea7b31461017857806318160ddd1461018b575b600080fd5b61014e610149366004610852565b610341565b60405190151581526020015b60405180910390f35b61016b610432565b60405161015a919061089b565b61014e610186366004610937565b6104c4565b6002545b60405190815260200161015a565b61014e6101ab366004610961565b610554565b6040516012815260200161015a565b61014e6101cd366004610937565b6105df565b6101e56101e0366004610937565b61066a565b005b61018f6101f536600461099d565b73ffffffffffffffffffffffffffffffffffffffff1660009081526020819052604090205490565b61016b6106cc565b6101e5610233366004610937565b6106db565b61014e610246366004610937565b61073d565b61014e610259366004610937565b6107c8565b60065473ffffffffffffffffffffffffffffffffffffffff165b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200161015a565b60055473ffffffffffffffffffffffffffffffffffffffff16610278565b6005546102789073ffffffffffffffffffffffffffffffffffffffff1681565b61018f6102e93660046109b8565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260016020908152604080832093909416825291909152205490565b6006546102789073ffffffffffffffffffffffffffffffffffffffff1681565b60007f01ffc9a7000000000000000000000000000000000000000000000000000000007f1d1d8b63000000000000000000000000000000000000000000000000000000007fec4fc8e3000000000000000000000000000000000000000000000000000000007fffffffff0000000000000000000000000000000000000000000000000000000085168314806103fa57507fffffffff00000000000000000000000000000000000000000000000000000000858116908316145b8061042957507fffffffff00000000000000000000000000000000000000000000000000000000858116908216145b95945050505050565b606060038054610441906109eb565b80601f016020809104026020016040519081016040528092919081815260200182805461046d906109eb565b80156104ba5780601f1061048f576101008083540402835291602001916104ba565b820191906000526020600020905b81548152906001019060200180831161049d57829003601f168201915b5050505050905090565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602360248201527f4c656761637945524332304554483a20617070726f766520697320646973616260448201527f6c6564000000000000000000000000000000000000000000000000000000000060648201526000906084015b60405180910390fd5b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602860248201527f4c656761637945524332304554483a207472616e7366657246726f6d2069732060448201527f64697361626c6564000000000000000000000000000000000000000000000000606482015260009060840161054b565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602d60248201527f4c656761637945524332304554483a20696e637265617365416c6c6f77616e6360448201527f652069732064697361626c656400000000000000000000000000000000000000606482015260009060840161054b565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4c656761637945524332304554483a206d696e742069732064697361626c6564604482015260640161054b565b606060048054610441906109eb565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4c656761637945524332304554483a206275726e2069732064697361626c6564604482015260640161054b565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602d60248201527f4c656761637945524332304554483a206465637265617365416c6c6f77616e6360448201527f652069732064697361626c656400000000000000000000000000000000000000606482015260009060840161054b565b6040517f08c379a0000000000000000000000000000000000000000000000000000000008152602060048201526024808201527f4c656761637945524332304554483a207472616e73666572206973206469736160448201527f626c656400000000000000000000000000000000000000000000000000000000606482015260009060840161054b565b60006020828403121561086457600080fd5b81357fffffffff000000000000000000000000000000000000000000000000000000008116811461089457600080fd5b9392505050565b600060208083528351808285015260005b818110156108c8578581018301518582016040015282016108ac565b818111156108da576000604083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016929092016040019392505050565b803573ffffffffffffffffffffffffffffffffffffffff8116811461093257600080fd5b919050565b6000806040838503121561094a57600080fd5b6109538361090e565b946020939093013593505050565b60008060006060848603121561097657600080fd5b61097f8461090e565b925061098d6020850161090e565b9150604084013590509250925092565b6000602082840312156109af57600080fd5b6108948261090e565b600080604083850312156109cb57600080fd5b6109d48361090e565b91506109e26020840161090e565b90509250929050565b600181811c908216806109ff57607f821691505b602082108103610a38577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b5091905056fea164736f6c634300080f000a"

func init() {
	if err := json.Unmarshal([]byte(LegacyERC20ETHStorageLayoutJSON), LegacyERC20ETHStorageLayout); err != nil {
		panic(err)
	}

	layouts["LegacyERC20ETH"] = LegacyERC20ETHStorageLayout
	deployedBytecodes["LegacyERC20ETH"] = LegacyERC20ETHDeployedBin
}