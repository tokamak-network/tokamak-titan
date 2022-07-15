// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// access control
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
// have permission to mint (create) new tokens as they see fit.
// now it is not used.
import { ERC20Mintable } from "./ERC20Mintable.sol";

/**
 * @dev Current implementations is just for testing seigniorage manager.
 */
contract TOKAMAK is ERC20, Ownable, ERC20Mintable {
    constructor() ERC20("Tokamak Test Token", "TOKAMAK") {}
}
