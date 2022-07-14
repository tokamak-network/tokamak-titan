// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Tokamak Token (TOKAMAK)
 *
 */

contract TOKAMAK is Context, ERC20 {
    /// @notice Maximum possible number of tokens
    uint224 public constant maxSupply = 500000000e18; // 500 million TOKAMAK

    function _maxSupply() internal pure returns (uint224) {
        return maxSupply;
    }

    constructor() ERC20("Tokamak Token", "TOKAMAK") {
        //mint maxSupply at genesis, allocated to deployer
        _mint(_msgSender(), maxSupply);
    }

    function _mint(address _to, uint256 _amount) internal override(ERC20) {
        super._mint(_to, _amount);
    }

    function _burn(address _account, uint256 _amount) internal override(ERC20) {
        super._burn(_account, _amount);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20) {
        super._afterTokenTransfer(from, to, amount);
    }
}
