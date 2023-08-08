const config = {
  numDeployConfirmations: 1,
  gasPrice: 5_000_000_000,
  l1BlockTimeSeconds: 15,
  l2BlockGasLimit: 15_000_000,
  l2ChainId: 420,
  ctcL2GasDiscountDivisor: 32,
  ctcEnqueueGasCost: 60_000,
  sccFaultProofWindowSeconds: 10,
  sccSequencerPublishWindowSeconds: 12592000,
  ovmSequencerAddress: '0x6bA37Baef3b878C9208e841b18685d5de7066586',
  ovmProposerAddress: '0xd1C1baE96749CB57788C6595dF2A03AFEd003662',
  ovmBlockSignerAddress: '0x00000398232E2064F896018496b4b44b3D62751F',
  ovmFeeWalletAddress: '0xA700EF25Bd0D3Ab809Ec61fe5Bb9cEFA23C6b78d',
  ovmAddressManagerOwner: '0xb095A5158cCe260877906ADc80AB80b6Fd833fEa',
  ovmGasPriceOracleOwner: '0x2763EEd3607EFC1582786eBC9E0d74ff7115e0d3',
}

export default config
