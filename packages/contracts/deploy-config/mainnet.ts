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
  ovmSequencerAddress: '0x9766dEC9207b00098e9Ca5663135DD274EE3eBBf',
  ovmProposerAddress: '0xbC621f29F3cdcF7523DA538DD699b92f192a9Dfb',
  ovmBlockSignerAddress: '0xAAAA9f5D0336c3c27C689BFBcac68D6cfdB6C05A',
  ovmFeeWalletAddress: '0x6e1a64b7496DF60bF747085E89e1231A717fDd38',
  ovmAddressManagerOwner: '0xc2fa14904E9f610006958A2bd2614fE52B8D6BC1',
  ovmGasPriceOracleOwner: '0xe671AD9428980AE25d25A41BD57ec67930D6884a',
  ovmFastRelayer: '0xD576B38E793705bd3243736B48342110c2b939f7',
  ovmWhitelistOwner: '0x0000000000000000000000000000000000000000',
}

export default config
