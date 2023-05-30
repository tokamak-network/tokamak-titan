const config = {
  numDeployConfirmations: 1,
  l1BlockTimeSeconds: 15,
  l2BlockGasLimit: 15_000_000,
  l2ChainId: 5050,
  ctcL2GasDiscountDivisor: 32,
  ctcEnqueueGasCost: 60_000,
  sccFaultProofWindowSeconds: 10,
  sccSequencerPublishWindowSeconds: 12592000,
  ovmSequencerAddress: '0x28bbaEE27683e1C252dDa05c4C43FF5E73A702be',
  ovmProposerAddress: '0x6Bcb3B9ee42BCbe3C67ad3e6D28Ca5a258677E98',
  ovmBlockSignerAddress: '0x85ffE3176131188E265Cc82869555cd78f394224',
  ovmFeeWalletAddress: '0x091C8a37384ED31a469Ff23Fe4A183D11f56B22b',
  ovmAddressManagerOwner: '0x37212a8F2abbb40000e974DA82D410DdbecFa956',
  ovmGasPriceOracleOwner: '0x8F3E9A5c4Ee4092E8CF3159dc65090CFD7e63D2e',
  ovmFastRelayer: '0xfd1265BA61e773c4e9DF206E57316ac7fAD38dD6',
}

export default config
