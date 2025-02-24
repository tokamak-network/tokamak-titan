package predeploys

import "github.com/ethereum/go-ethereum/common"

const (
	L2ToL1MessagePasser          = "0x4200000000000000000000000000000000000016"
	DeployerWhitelist            = "0x4200000000000000000000000000000000000002"
	LegacyERC20ETH               = "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000"
	WETH9                        = "0x4200000000000000000000000000000000000006"
	L2CrossDomainMessenger       = "0x4200000000000000000000000000000000000007"
	L2StandardBridge             = "0x4200000000000000000000000000000000000010"
	SequencerFeeVault            = "0x4200000000000000000000000000000000000011"
	OptimismMintableERC20Factory = "0x4200000000000000000000000000000000000012"
	L1BlockNumber                = "0x4200000000000000000000000000000000000013"
	GasPriceOracle               = "0x420000000000000000000000000000000000000F"
	L1Block                      = "0x4200000000000000000000000000000000000015"
	GovernanceToken              = "0x4200000000000000000000000000000000000042"
	LegacyMessagePasser          = "0x4200000000000000000000000000000000000000"
)

var (
	L2ToL1MessagePasserAddr          = common.HexToAddress(L2ToL1MessagePasser)
	DeployerWhitelistAddr            = common.HexToAddress(DeployerWhitelist)
	LegacyERC20ETHAddr               = common.HexToAddress(LegacyERC20ETH)
	WETH9Addr                        = common.HexToAddress(WETH9)
	L2CrossDomainMessengerAddr       = common.HexToAddress(L2CrossDomainMessenger)
	L2StandardBridgeAddr             = common.HexToAddress(L2StandardBridge)
	SequencerFeeVaultAddr            = common.HexToAddress(SequencerFeeVault)
	OptimismMintableERC20FactoryAddr = common.HexToAddress(OptimismMintableERC20Factory)
	L1BlockNumberAddr                = common.HexToAddress(L1BlockNumber)
	GasPriceOracleAddr               = common.HexToAddress(GasPriceOracle)
	L1BlockAddr                      = common.HexToAddress(L1Block)
	GovernanceTokenAddr              = common.HexToAddress(GovernanceToken)
	LegacyMessagePasserAddr          = common.HexToAddress(LegacyMessagePasser)

	Predeploys = make(map[string]*common.Address)
)

func init() {
	Predeploys["L2ToL1MessagePasser"] = &L2ToL1MessagePasserAddr
	Predeploys["DeployerWhitelist"] = &DeployerWhitelistAddr
	Predeploys["LegacyERC20ETH"] = &LegacyERC20ETHAddr
	Predeploys["WETH9"] = &WETH9Addr
	Predeploys["L2CrossDomainMessenger"] = &L2CrossDomainMessengerAddr
	Predeploys["L2StandardBridge"] = &L2StandardBridgeAddr
	Predeploys["SequencerFeeVault"] = &SequencerFeeVaultAddr
	Predeploys["OptimismMintableERC20Factory"] = &OptimismMintableERC20FactoryAddr
	Predeploys["L1BlockNumber"] = &L1BlockNumberAddr
	Predeploys["GasPriceOracle"] = &GasPriceOracleAddr
	Predeploys["L1Block"] = &L1BlockAddr
	Predeploys["GovernanceToken"] = &GovernanceTokenAddr
	Predeploys["LegacyMessagePasser"] = &LegacyMessagePasserAddr
}
