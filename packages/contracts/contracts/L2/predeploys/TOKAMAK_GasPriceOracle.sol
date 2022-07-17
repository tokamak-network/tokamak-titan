// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/* Library Imports */
import { Lib_PredeployAddresses } from "../../libraries/constants/Lib_PredeployAddresses.sol";

/* Contract Imports */
import { L2StandardBridge } from "../messaging/L2StandardBridge.sol";
import { L2StandardERC20 } from "../../standards/L2StandardERC20.sol";
import { OVM_GasPriceOracle } from "./OVM_GasPriceOracle.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/* Contract Imports */
import { Address } from "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title Tokamak_GasPriceOracle
 */
contract Tokamak_GasPriceOracle {
    using SafeERC20 for IERC20;

    /*************
     * Constants *
     *************/

    // Minimum TOKAMAK balance that can be withdrawn in a single withdrawal.
    // 150 TOKAMAK
    uint256 public constant MIN_WITHDRAWAL_AMOUNT = 150e18;

    /*************
     * Variables *
     *************/

    // Owner address
    address private _owner;

    // Address that will hold the fees once withdrawn. Dynamically initialized within l2geth.
    address public feeWallet;

    // L2 Tokamak token address
    address public l2TokamakAddress;

    // The maximum price ratio value of ETH and TOKAMAK
    uint256 public maxPriceRatio = 5000;

    // The minimum price ratio value of ETH and TOKAMAK
    uint256 public minPriceRatio = 500;

    // The price ratio of ETH and TOKAMAK
    // This price ratio considers the saving percentage of using TOKAMAK as the fee token
    uint256 public priceRatio;

    // Gas price oracle address (OVM_GasPriceOracle)
    address public gasPriceOracleAddress = 0x420000000000000000000000000000000000000F;

    // Record the wallet address that wants to use tokamak as fee token
    mapping(address => bool) public tokamakFeeTokenUsers;

    // Price ratio without discount
    uint256 public marketPriceRatio;

    /*************
     *  Events   *
     *************/

    event TransferOwnership(address, address);
    event UseTokamakAsFeeToken(address);
    event UseETHAsFeeToken(address);
    event UpdatePriceRatio(address, uint256, uint256);
    event UpdateMaxPriceRatio(address, uint256);
    event UpdateMinPriceRatio(address, uint256);
    event UpdateGasPriceOracleAddress(address, address);
    event WithdrawTOKAMAK(address, address);
    event WithdrawETH(address, address);

    /**********************
     * Function Modifiers *
     **********************/

    modifier onlyNotInitialized() {
        require(address(feeWallet) == address(0), "Contract has been initialized");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "caller is not the owner");
        _;
    }

    /********************
     * Fall back Functions *
     ********************/

    /**
     * Receive ETH
     */
    receive() external payable {}

    /********************
     * Public Functions *
     ********************/

    /**
     * transfer ownership
     * @param _newOwner new owner address
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "Ownable: new owner is the zero address");
        address oldOwner = _owner;
        _owner = _newOwner;
        emit TransferOwnership(oldOwner, _newOwner);
    }

    /**
     * Returns the address of the current owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * Initialize feeWallet and l2TokamakAddress.
     */
    function initialize(address payable _feeWallet, address _l2TokamakAddress)
        public
        onlyNotInitialized
    {
        require(_feeWallet != address(0) && _l2TokamakAddress != address(0));
        feeWallet = _feeWallet;
        l2TokamakAddress = _l2TokamakAddress;

        // Initialize the parameters
        _owner = msg.sender;
        gasPriceOracleAddress = 0x420000000000000000000000000000000000000F;
        maxPriceRatio = 5000;
        priceRatio = 2000;
        minPriceRatio = 500;
        marketPriceRatio = 2000;
    }

    /**
     * Add the users that want to use BOBA as the fee token
     */
    function useTokamakAsFeeToken() public {
        require(!Address.isContract(msg.sender), "Account not EOA");
        // Users should have more than 3 TOKAMAK
        require(
            L2StandardERC20(l2TokamakAddress).balanceOf(msg.sender) >= 3e18,
            "Insufficient Tokamak balance"
        );
        tokamakFeeTokenUsers[msg.sender] = true;
        emit UseTokamakAsFeeToken(msg.sender);
    }

    /**
     * Add the users that want to use ETH as the fee token
     */
    function useETHAsFeeToken() public {
        require(!Address.isContract(msg.sender), "Account not EOA");
        // Users should have more than 0.002 ETH
        require(address(msg.sender).balance >= 2e15, "Insufficient ETH balance");
        tokamakFeeTokenUsers[msg.sender] = false;
        emit UseETHAsFeeToken(msg.sender);
    }

    /**
     * Update the price ratio of ETH and TOKAMAK
     * @param _priceRatio the price ratio of ETH and TOKAMAK
     * @param _marketPriceRatio tha market price ratio of ETH and TOKAMAK
     */
    function updatePriceRatio(uint256 _priceRatio, uint256 _marketPriceRatio) public onlyOwner {
        require(_priceRatio <= maxPriceRatio && _priceRatio >= minPriceRatio);
        require(_marketPriceRatio <= maxPriceRatio && _marketPriceRatio >= minPriceRatio);
        priceRatio = _priceRatio;
        marketPriceRatio = _marketPriceRatio;
        emit UpdatePriceRatio(owner(), _priceRatio, _marketPriceRatio);
    }

    /**
     * Update the maximum price ratio of ETH and TOKAMAK
     * @param _maxPriceRatio the maximum price ratio of ETH and TOKAMAK
     */
    function updateMaxPriceRatio(uint256 _maxPriceRatio) public onlyOwner {
        require(_maxPriceRatio >= minPriceRatio && _maxPriceRatio > 0);
        maxPriceRatio = _maxPriceRatio;
        emit UpdateMaxPriceRatio(owner(), _maxPriceRatio);
    }

    /**
     * Update the minimum price ratio of ETH and TOKAMAK
     * @param _minPriceRatio the minimum price ratio of ETH and TOKAMAK
     */
    function updateMinPriceRatio(uint256 _minPriceRatio) public onlyOwner {
        require(_minPriceRatio <= maxPriceRatio && _minPriceRatio > 0);
        minPriceRatio = _minPriceRatio;
        emit UpdateMinPriceRatio(owner(), _minPriceRatio);
    }

    /**
     * Update the gas oracle address
     * @param _gasPriceOracleAddress gas oracle address
     */
    function updateGasPriceOracleAddress(address _gasPriceOracleAddress) public onlyOwner {
        require(Address.isContract(_gasPriceOracleAddress), "Account is EOA");
        require(_gasPriceOracleAddress != address(0));
        gasPriceOracleAddress = _gasPriceOracleAddress;
        emit UpdateGasPriceOracleAddress(owner(), _gasPriceOracleAddress);
    }

    /**
     * Get L1 Tokamak fee for fee estimation
     * @param _txData the data payload
     */
    function getL1TokamakFee(bytes memory _txData) public view returns (uint256) {
        OVM_GasPriceOracle gasPriceOracleContract = OVM_GasPriceOracle(gasPriceOracleAddress);
        return gasPriceOracleContract.getL1Fee(_txData) * priceRatio;
    }

    /**
     * withdraw TOKAMAK tokens to l1 fee wallet
     */
    function withdrawTOKAMAK() public {
        require(
            L2StandardERC20(l2TokamakAddress).balanceOf(address(this)) >= MIN_WITHDRAWAL_AMOUNT,
            // solhint-disable-next-line max-line-length
            "Tokamak_GasPriceOracle: withdrawal amount must be greater than minimum withdrawal amount"
        );

        L2StandardBridge(Lib_PredeployAddresses.L2_STANDARD_BRIDGE).withdrawTo(
            l2TokamakAddress,
            feeWallet,
            L2StandardERC20(l2TokamakAddress).balanceOf(address(this)),
            0,
            bytes("")
        );
        emit WithdrawTOKAMAK(owner(), feeWallet);
    }

    /**
     * withdraw ETH tokens to l2 fee wallet
     */
    function withdrawETH() public onlyOwner {
        (bool sent, ) = feeWallet.call{ value: address(this).balance }("");
        require(sent, "Failed to send ETH to fee wallet");
        emit WithdrawETH(owner(), feeWallet);
    }
}
