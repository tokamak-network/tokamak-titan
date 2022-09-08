package ton

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

func TestNewStateTransactionForEth(t *testing.T) {

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

	evm := vm.NewEVM(context, statedb, params.MainnetChainConfig, vm.Config{})
	msg, err := tx.AsMessage(signer)
	if err != nil {
		t.Fatalf("failed to prepare transaction for tracing: %v", err)
	}

	// TEST 1: Eth balance is 0
	st := core.NewStateTransition(evm, msg, new(core.GasPool).AddGas(tx.Gas()))

	// Insufficient Eth balance
	// it should be occurred error in buyGas()
	if _, _, _, err := st.TransitionDb(); err == nil {
		t.Fatalf("shoul not execute transaction")
	}

	// Add suffficient funds for the test account
	addEthBalance := big.NewInt(500000000000000)
	statedb.AddBalance(msg.From(), addEthBalance)

	// TEST 2: Only l2 fee
	_, gasUsed, _, err := st.TransitionDb()
	if err != nil {
		t.Fatalf("failed to execute transaction: %v", err)
	}

	// Check the Eth balance of from account
	userEthBalance := statedb.GetBalance(msg.From())
	//  Eth balance of evm.Coinbase is equal to gasUsed * gasPrice
	vaultBalance := statedb.GetBalance(evm.Coinbase)
	// vaultBalance = gasUsed * msg.GasPrice
	if new(big.Int).Mul(big.NewInt(int64(gasUsed)), msg.GasPrice()).Cmp(vaultBalance) != 0 {
		t.Fatal("failed to calculate eth fee")
	}

	// addEthBalance - userEthBalance = vaultBalance
	if new(big.Int).Sub(addEthBalance, userEthBalance).Cmp(vaultBalance) != 0 {
		t.Fatal("failed to calculate eth fee")
	}

	// TEST 3: Add l1 security fee
	preUserEthBalance := statedb.GetBalance(msg.From())
	preVaultBalance := statedb.GetBalance(evm.Coinbase)

	statedb.SetState(rcfg.L2GasPriceOracleAddress, rcfg.L1GasPriceSlot, common.BigToHash(common.Big1))
	statedb.SetState(rcfg.L2GasPriceOracleAddress, rcfg.OverheadSlot, common.BigToHash(big.NewInt(2750)))
	statedb.SetState(rcfg.L2GasPriceOracleAddress, rcfg.ScalarSlot, common.BigToHash(big.NewInt(1)))
	statedb.SetState(rcfg.L2GasPriceOracleAddress, rcfg.L2GasPriceSlot, common.BigToHash(big.NewInt(1)))

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

	_, gasUsed, _, err = st.TransitionDb()
	if err != nil {
		t.Fatalf("failed to execute transaction: %v", err)
	}

	afterUserEthBalance := statedb.GetBalance(msg.From())
	afterVaultBalance := statedb.GetBalance(evm.Coinbase)

	// user pay L1 fee + L2 fee
	userPaidEthFee := new(big.Int).Sub(preUserEthBalance, afterUserEthBalance)
	vaultReceivedFee := new(big.Int).Sub(afterVaultBalance, preVaultBalance)
	// calculated l1 fee is 4126
	l1FeeEth := big.NewInt(3838)

	// userPaidEthFee = vaultReceivedFee + l1FeeEth
	// userPaidEthFee must be equal to vaultReceivedFee
	if userPaidEthFee.Cmp(vaultReceivedFee) != 0 {
		t.Fatal("failed to charge Eth fee")
	}
	// estimated cost = l1 fee + l2 fee = st.l1Fee + (gasUsed * l2 gasprice)
	estimatedL2fee := new(big.Int).Mul(big.NewInt(int64(gasUsed)), common.Big1)
	estimatedCost := new(big.Int).Add(l1FeeEth, estimatedL2fee)
	if userPaidEthFee.Cmp(estimatedCost) != 0 {
		t.Fatal("failed to charge l1 security fee")
	}

	if gasUsed > 5000000 {
		t.Fatal("tx.GasUsed() > tx.GasLimit()")
	}
}
