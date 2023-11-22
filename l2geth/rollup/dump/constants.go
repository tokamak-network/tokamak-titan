package dump

import (
	"github.com/ethereum-optimism/optimism/l2geth/common"
)

var OvmEthAddress = common.HexToAddress("0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000")
var OvmFeeWallet = common.HexToAddress("0x4200000000000000000000000000000000000011")
var OvmWhitelistAddress = common.HexToAddress("0x4200000000000000000000000000000000000002")

// TODO: unify after holesky testnet update
var titanTonAddress = common.HexToAddress("0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2")
var titanGoerliTonAddress = common.HexToAddress("0xFa956eB0c4b3E692aD5a6B2f08170aDE55999ACa")
var titanGoerliNightlyTonAddress = common.HexToAddress("0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2")
