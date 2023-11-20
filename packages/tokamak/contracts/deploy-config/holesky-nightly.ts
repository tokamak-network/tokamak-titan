const config = {
  numDeployConfirmations: 1,
  l1BlockTimeSeconds: 15,
  l2BlockGasLimit: 15_000_000,
  l2ChainId: 4906,
  ctcL2GasDiscountDivisor: 32,
  ctcEnqueueGasCost: 60_000,
  sccFaultProofWindowSeconds: 10,
  sccSequencerPublishWindowSeconds: 12592000,
  ovmSequencerAddress: '0x7DF510Ec916D8099c8A6C9979878246Fd94247Aa',
  ovmProposerAddress: '0x2651a0f02d20Fa39301ef7f0D7B9917C0D2965B5',
  ovmBlockSignerAddress: '0xECbdEc727C5BdDC1787Ea68B0105CFE3773A71Dd',
  ovmFeeWalletAddress: '0x57A43A79De197891d0Bec8378fC7C043dc076610',
  ovmAddressManagerOwner: '0xa9Ad553018D38B895aBC3Ae2Ac08e07501270dDc',
  ovmGasPriceOracleOwner: '0x3a6377cae6d855eE4Acd452bbf1747cd7E182B20',
  ovmFastRelayer: '0x977a129A25A7467De48c210a0535ca540AA42DD7',
  ovmTONStakingManager: '0xeb411FB3653ce41F08022483fac5871C503cbA30',
}

export default config
