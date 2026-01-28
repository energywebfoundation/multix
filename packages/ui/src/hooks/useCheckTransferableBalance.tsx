import { useMemo } from 'react'
import { useGetBalance } from './useGetBalance'

export interface Props {
  min?: bigint
  address?: string
  withPplApi: boolean
}

export const useCheckTransferableBalance = ({ min, address, withPplApi }: Props) => {
  const { balance } = useGetBalance({ address, withPplApi })
  const hasEnoughFreeBalance = useMemo(() => {
    if (!address || !balance || min === undefined) {
      // #region agent log
      console.log('[DEBUG useCheckTransferableBalance] Early return - missing data:', {
        hasAddress: !!address,
        balance: balance?.toString(),
        min: min?.toString(),
        withPplApi: withPplApi
      });
      // #endregion
      return false
    }
    const result = balance > min
    // #region agent log
    console.log('[DEBUG useCheckTransferableBalance] Balance comparison:', {
      balance: balance.toString(),
      min: min.toString(),
      result: result,
      difference: (balance - min).toString(),
      withPplApi: withPplApi
    });
    // #endregion
    return result
  }, [address, min, balance, withPplApi])

  return { hasEnoughFreeBalance }
}
