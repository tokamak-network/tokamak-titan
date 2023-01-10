export const getNextBlockNumber = async (provider: any): Promise<number> => {
  return (await provider.getBlock('latest')).number + 1
}
