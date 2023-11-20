const config = {
  numDeployConfirmations: 1,
  l1BlockTimeSeconds: 15,
  l2BlockGasLimit: 15_000_000,
  l2ChainId: 7547,
  ctcL2GasDiscountDivisor: 32,
  ctcEnqueueGasCost: 60_000,
  sccFaultProofWindowSeconds: 10,
  sccSequencerPublishWindowSeconds: 12592000,
  ovmSequencerAddress: '0x7AF1673258A6C1f39606D23E80C6B6AB7f5aB2C5',
  ovmProposerAddress: '0xCe11B4661C1012ecf164045721d0046F3051F403',
  ovmBlockSignerAddress: '0xADF45067b1d3DFC43453240f149F9CD85c364799',
  ovmFeeWalletAddress: '0x6abD27DCcbC1850E90d27A9949ce91fD7c9fF244',
  ovmAddressManagerOwner: '0x6aA3584F7F2314271eb5A291a4e1c2042F584688',
  ovmGasPriceOracleOwner: '0xD82e5eeD2E8E4F588eF33fEd0C4F2aBbc622C18e',
  ovmFastRelayer: '0xfd0ddCdb34811Cb125d208D5FC329cB26067fDBE',
  ovmTONStakingManager: '0x5a516036EC35D368BEDd8127945C211CcA00e184',
}

export default config
