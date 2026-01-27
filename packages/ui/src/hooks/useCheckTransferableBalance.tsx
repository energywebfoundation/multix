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
    // If address or min is not provided, return false
    if (!address || min === undefined) {
      return false
    }
    // If balance is still loading (null), return true to avoid false errors
    // The balance subscription will update this once data is loaded
    if (balance === null) {
      return true
    }
    // Balance has loaded - check if it's sufficient
    return balance > min
  }, [address, min, balance])

  return { hasEnoughFreeBalance }
}
