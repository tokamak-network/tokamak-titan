const config = {
  numDeployConfirmations: 1,
  gasPrice: 5_000_000_000,
  l1BlockTimeSeconds: 15,
  l2BlockGasLimit: 15_000_000,
  l2ChainId: 151,
  ctcL2GasDiscountDivisor: 32,
  ctcEnqueueGasCost: 60_000,
  sccFaultProofWindowSeconds: 10,
  sccSequencerPublishWindowSeconds: 12592000,
  ovmSequencerAddress: '0xb1b4f3cae5bfdfd6344f5774d00bdde9f7e38477',
  ovmProposerAddress: '0x04aa6688ac305b2546714a50678223c58afed5a6',
  ovmBlockSignerAddress: '0x00000398232E2064F896018496b4b44b3D62751F',
  ovmFeeWalletAddress: '0x0a7af5f943d2fb006450644e21fd4329d6dd9bcb',
  ovmAddressManagerOwner: '0xe17f5602e60cb30820cf2983ff85efcde444a5ec',
  ovmGasPriceOracleOwner: '0xec0618b642d228e3a5ba15dba1bea79bf9c0f18e',
}

export default config
