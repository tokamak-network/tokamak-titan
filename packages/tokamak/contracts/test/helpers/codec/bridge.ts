/* Imports: Internal */
import { getContractInterface } from '@eth-optimism/contracts'

export const encodeXDomainCalldata = (
  target: string,
  sender: string,
  message: string,
  messageNonce: number
): string => {
  // Returns the encoded data, which can be used as the data for a transaction for fragment (see Specifying Fragments) for the given values
  // ref. https://docs.ethers.io/v5/api/utils/abi/interface/
  return getContractInterface('L2CrossDomainMessenger').encodeFunctionData(
    //
    'relayMessage',
    [target, sender, message, messageNonce]
  )
}
