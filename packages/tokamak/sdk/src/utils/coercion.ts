import { Provider } from '@ethersproject/abstract-provider'
import { ethers, BigNumber } from 'ethers'
import { ProviderLike, NumberLike } from '@eth-optimism/sdk'

/**
 * Converts a ProviderLike into a Provider. Assumes that if the input is a string then it is a
 * JSON-RPC url.
 *
 * @param provider ProviderLike to turn into a Provider.
 * @returns Input as a Provider.
 */
export const toProvider = (provider: ProviderLike): Provider => {
  if (typeof provider === 'string') {
    return new ethers.providers.JsonRpcProvider(provider)
  } else if (Provider.isProvider(provider)) {
    return provider
  } else {
    throw new Error('Invalid provider')
  }
}

/**
 * Converts a number-like into an ethers BigNumber.
 *
 * @param num Number-like to convert into a BigNumber.
 * @returns Number-like as a BigNumber.
 */
export const toBigNumber = (num: NumberLike): BigNumber => {
  return ethers.BigNumber.from(num)
}
