const config = {
  numDeployConfirmations: 1,
  l1BlockTimeSeconds: 15,
  l2BlockGasLimit: 15_000_000,
  l2ChainId: 55008,
  ctcL2GasDiscountDivisor: 32,
  ctcEnqueueGasCost: 60_000,
  sccFaultProofWindowSeconds: 10,
  sccSequencerPublishWindowSeconds: 12592000,
  ovmSequencerAddress: '0x60F8A2680b67db4E2313762B100391051cB403E0',
  ovmProposerAddress: '0x1c7c7cC2ab971Be3E6a2c7Bddb7392DB3CE2e87b',
  ovmBlockSignerAddress: '0xa159967552001d881F01Da6E6E2e4754968e5905',
  ovmFeeWalletAddress: '0x11Bc07A192bf1E0B8D46458DFdEeDC02E021C990',
  ovmAddressManagerOwner: '0xff5123d22088ecbf74C8A56E1F538bECDcaCF544',
  ovmGasPriceOracleOwner: '0xff49D1cFBb66624bEb16d1a74F8ac46dA76aFcC7',
  ovmFastRelayer: '0x13cCddc28D684D2CdbCEDcb7c9F97877a843D8FA',
  ovmTONStakingManager: '0x1CE92fe36760F3054A7406Be4Ad34013aE89B6a4',
}

export default config
