const config = {
  numDeployConfirmations: 4,
  gasPrice: 150_000_000_000,
  l1BlockTimeSeconds: 15,
  l2BlockGasLimit: 15_000_000,
  l2ChainId: 55004,
  ctcL2GasDiscountDivisor: 32,
  ctcEnqueueGasCost: 60_000,
  sccFaultProofWindowSeconds: 604800,
  sccSequencerPublishWindowSeconds: 12592000,
  ovmSequencerAddress: '0x3C1b2d1104cD03388e3203b76989C4A0310172BC',
  ovmProposerAddress: '0xDACDD2EF26b43cA1DBd40E7C5b93F8F69eea5e29',
  ovmBlockSignerAddress: '0xAAAA9f5D0336c3c27C689BFBcac68D6cfdB6C05A',
  ovmFeeWalletAddress: '0xbab08F1B06aa7a9a4eCA71A983730f84C419fcDa',
  ovmAddressManagerOwner: '0xCaD132F770cFBC2B3c512C0FF35c4d9fc37476c9',
  ovmGasPriceOracleOwner: '0xcd815a5BCea75aD4CAe46b4Cd1d4f6aA8e114e81',
  ovmWhitelistOwner: '0x0000000000000000000000000000000000000000',
}

export default config
