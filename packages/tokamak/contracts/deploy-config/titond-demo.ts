const config = {
  numDeployConfirmations: 1,
  l1BlockTimeSeconds: 15,
  l2BlockGasLimit: 15_000_000,
  l2ChainId: 17,
  ctcL2GasDiscountDivisor: 32,
  ctcEnqueueGasCost: 60_000,
  sccFaultProofWindowSeconds: 0,
  sccSequencerPublishWindowSeconds: 12592000,
  ovmSequencerAddress: '0xcBE48D9B72e76e40786093F64924a140128E3263',
  ovmProposerAddress: '0xE89B1A89339E6824224b660Ed1c5AF3eB683b771',
  ovmBlockSignerAddress: '0x00000398232E2064F896018496b4b44b3D62751F',
  ovmFeeWalletAddress: '0xebcB3336262d6E05A5920F6a39B7Cc8dBda44bdB',
  ovmAddressManagerOwner: '0x36602DC3d18c37627366109FF80E527De1002CF8',
  ovmGasPriceOracleOwner: '0x9ed2E27310917ec6242D9F0cbA2C7217D82460c5',
  ovmFastRelayer: '0x4e19b098e96e82a073CBcfEB4491f008512FbcF1',
  ovmTONStakingManager: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
}

export default config
