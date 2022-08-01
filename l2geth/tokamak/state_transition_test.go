package tokamak

import (
	"crypto/ecdsa"
	"crypto/rand"
	"math/big"
	"testing"

	"github.com/ethereum-optimism/optimism/l2geth/common"
	"github.com/ethereum-optimism/optimism/l2geth/common/hexutil"
	"github.com/ethereum-optimism/optimism/l2geth/core"
	"github.com/ethereum-optimism/optimism/l2geth/core/rawdb"
	"github.com/ethereum-optimism/optimism/l2geth/core/types"
	"github.com/ethereum-optimism/optimism/l2geth/core/vm"
	"github.com/ethereum-optimism/optimism/l2geth/crypto"
	"github.com/ethereum-optimism/optimism/l2geth/params"
	"github.com/ethereum-optimism/optimism/l2geth/rollup/rcfg"
	"github.com/ethereum-optimism/optimism/l2geth/tests"
)

func TestNewStateTransaction(t *testing.T) {

	// generates unsigned transactions
	unsignedTx := types.NewTransaction(1, common.HexToAddress("0x00000000000000000000000000000000deadbeef"), new(big.Int), 5000000, big.NewInt(1), []byte{})

	privateKeyECDSA, err := ecdsa.GenerateKey(crypto.S256(), rand.Reader)
	if err != nil {
		t.Fatalf("err %v", err)
	}
	signer := types.NewEIP155Signer(big.NewInt(1))
	// sign
	tx, err := types.SignTx(unsignedTx, signer, privateKeyECDSA)
	if err != nil {
		t.Fatalf("err %v", err)
	}
	// set sender and context
	origin, _ := signer.Sender(tx)
	context := vm.Context{
		CanTransfer: core.CanTransfer,
		Transfer:    core.Transfer,
		Origin:      origin,
		Coinbase:    common.Address{},
		BlockNumber: new(big.Int).SetUint64(8000000),
		Time:        new(big.Int).SetUint64(5),
		Difficulty:  big.NewInt(0x30000),
		GasLimit:    uint64(6000000),
		GasPrice:    big.NewInt(1),
	}
	// initialize genesis block state (map structure)
	alloc := core.GenesisAlloc{}

	// set GenesisAccount
	alloc[common.HexToAddress("0x00000000000000000000000000000000deadbeef")] = core.GenesisAccount{
		Nonce:   1,
		Code:    hexutil.MustDecode("0x63deadbeef60005263cafebabe6004601c6000F560005260206000F3"),
		Balance: big.NewInt(1),
	}
	alloc[origin] = core.GenesisAccount{
		Nonce:   1,
		Code:    []byte{},
		Balance: big.NewInt(500000000000000),
	}
	statedb := tests.MakePreState(rawdb.NewMemoryDatabase(), alloc)
	rcfg.UsingOVM = true
	rcfg.OvmTokamakGasPricOracle = common.HexToAddress("0x4200000000000000000000000000000000000024")

	evm := vm.NewEVM(context, statedb, params.MainnetChainConfig, vm.Config{})
	msg, err := tx.AsMessage(signer)
	if err != nil {
		t.Fatalf("failed to prepare transaction for tracing: %v", err)
	}

	// Set Tokamak as the fee token
	statedb.SetTokamakAsFeeToken(msg.From())
	statedb.SetTokamakPriceRatio(big.NewInt(1))

	st := core.NewStateTransition(evm, msg, new(core.GasPool).AddGas(tx.Gas()))

	// Insufficient Tokamak token
	if _, _, _, err := st.TransitionDb(); err == nil {
		t.Fatalf("shoul not execute transaction")
	}

	// Add suffficient funds for the test account
	addTokamakBalance := big.NewInt(500000000000000)
	statedb.AddTokamakBalance(msg.From(), addTokamakBalance)
	_, gasUsed, _, err := st.TransitionDb()
	if err != nil {
		t.Fatalf("failed to execute transaction: %v", err)
	}

	// Check the Tokamak balance of from account
	userTokamakBalance := statedb.GetTokamakBalance(msg.From())
	// Check the Tokamak balance of OvmTokamakGasPricOracle
	vaultBalance := statedb.GetTokamakBalance(rcfg.OvmTokamakGasPricOracle)
	// gasUsed * msg.GasPrice = vaultBalance
	if new(big.Int).Mul(big.NewInt(int64(gasUsed)), msg.GasPrice()).Cmp(vaultBalance) != 0 {
		t.Fatal("failed to calculate tokamak fee")
	}

	// addTokamakBalance - userTokamakBalance = vaultBalance
	if new(big.Int).Sub(addTokamakBalance, userTokamakBalance).Cmp(vaultBalance) != 0 {
		t.Fatal("failed to calculate tokamak fee")
	}

	preUserTokamakBalance := statedb.GetTokamakBalance(msg.From())
	preVaultBalance := statedb.GetTokamakBalance(rcfg.OvmTokamakGasPricOracle)

	statedb.SetState(rcfg.L2GasPriceOracleAddress, rcfg.L1GasPriceSlot, common.BigToHash(common.Big1))
	statedb.SetState(rcfg.L2GasPriceOracleAddress, rcfg.OverheadSlot, common.BigToHash(big.NewInt(2750)))
	statedb.SetState(rcfg.L2GasPriceOracleAddress, rcfg.ScalarSlot, common.BigToHash(big.NewInt(1)))
	statedb.SetState(rcfg.L2GasPriceOracleAddress, rcfg.L2GasPriceSlot, common.BigToHash(big.NewInt(1)))
	statedb.SetTokamakPriceRatio(big.NewInt(2000))

	unsignedTx = types.NewTransaction(2, common.HexToAddress("0x00000000000000000000000000000000deadbeef"), new(big.Int), 5000000, big.NewInt(1), []byte{})
	tx, err = types.SignTx(unsignedTx, signer, privateKeyECDSA)
	if err != nil {
		t.Fatalf("err %v", err)
	}
	msg, err = tx.AsMessage(signer)
	if err != nil {
		t.Fatalf("failed to prepare transaction for tracing: %v", err)
	}
	st = core.NewStateTransition(evm, msg, new(core.GasPool).AddGas(tx.Gas()))

	// Insufficient Tokamak blalance of from account
	_, gasUsed, _, err = st.TransitionDb()
	if err == nil {
		t.Fatalf("failed to execute transaction: %v", err)
	}

	afterUserTokamakBalance := statedb.GetTokamakBalance(msg.From())
	afterVaultBalance := statedb.GetTokamakBalance(rcfg.OvmTokamakGasPricOracle)

	userPaidTokamakFee := new(big.Int).Sub(preUserTokamakBalance, afterUserTokamakBalance)
	vaultReceivedFee := new(big.Int).Sub(afterVaultBalance, preVaultBalance)

	if userPaidTokamakFee.Cmp(vaultReceivedFee) != 0 {
		t.Fatal("failed to charge tokamak fee")
	}
	estimatedCost := new(big.Int).Mul(new(big.Int).Mul(big.NewInt(int64(gasUsed)), common.Big1), big.NewInt(2000))
	if userPaidTokamakFee.Cmp(estimatedCost) != 0 {
		t.Fatal("failed to charge l1 security fee")
	}

	if gasUsed > 5000000 {
		t.Fatal("tx.GasUsed() > tx.GasLimit()")
	}
}
