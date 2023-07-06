// SPDX-License-Identifier: MIT
pragma solidity >0.5.0 <0.9.0;

/**
 * @title IL2ERC721Bridge
 */
interface IL2ERC721Bridge {
    /**
     * @notice Emitted when an ERC721 bridge to the other network is initiated.
     *
     * @param localToken  Address of the token on this domain.
     * @param remoteToken Address of the token on the remote domain.
     * @param from        Address that initiated bridging action.
     * @param to          Address to receive the token.
     * @param tokenId     ID of the specific token deposited.
     * @param extraData   Extra data for use on the client-side.
     */
    event ERC721BridgeInitiated(
        address indexed localToken,
        address indexed remoteToken,
        address indexed from,
        address to,
        uint256 tokenId,
        bytes extraData
    );

    /**
     * @notice Emitted when an ERC721 bridge from the other network is finalized.
     *
     * @param localToken  Address of the token on this domain.
     * @param remoteToken Address of the token on the remote domain.
     * @param from        Address that initiated bridging action.
     * @param to          Address to receive the token.
     * @param tokenId     ID of the specific token deposited.
     * @param extraData   Extra data for use on the client-side.
     */
    event ERC721BridgeFinalized(
        address indexed localToken,
        address indexed remoteToken,
        address indexed from,
        address to,
        uint256 tokenId,
        bytes extraData
    );
}
