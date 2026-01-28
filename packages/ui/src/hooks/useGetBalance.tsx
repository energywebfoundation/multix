import { useEffect, useState } from 'react'
import { formatBigIntBalance } from '../utils/formatBnBalance'
import { bigIntMax } from '../utils/bnUtils'
import { useAnyApi } from './useAnyApi'
import { useGetED } from './useGetED'

interface useGetBalanceProps {
  address?: string
  numberAfterComma?: number
  withPplApi?: boolean
}

export const useGetBalance = ({
  address,
  numberAfterComma = 2,
  withPplApi = false
}: useGetBalanceProps) => {
  const { api, chainInfo } = useAnyApi({ withPplApi })
  const [balance, setBalance] = useState<bigint | null>(null)
  const [balanceFormatted, setFormattedBalance] = useState<string | null>(null)
  const { existentialDeposit } = useGetED({ withPplApi })

  useEffect(() => {
    if (!api || !address || existentialDeposit === undefined) return

    const unsub = api.query.System.Account.watchValue(address, 'best').subscribe({
      next: (accountInfo) => {
        const { free, frozen, reserved } = accountInfo?.data || { free: 0n, frozen: 0n, reserved: 0n }
        const res = free - bigIntMax(frozen - reserved, existentialDeposit)
        const transferable = res < 0n ? 0n : res
        // #region agent log
        console.log('[DEBUG useGetBalance] Balance calculated:', {
          address: address,
          free: free.toString(),
          frozen: frozen.toString(),
          reserved: reserved.toString(),
          existentialDeposit: existentialDeposit.toString(),
          resBeforeCheck: res.toString(),
          transferable: transferable.toString(),
          tokenSymbol: chainInfo?.tokenSymbol
        });
        // #endregion
        setBalance(transferable)
        setFormattedBalance(
          formatBigIntBalance(transferable, chainInfo?.tokenDecimals, {
            numberAfterComma,
            tokenSymbol: chainInfo?.tokenSymbol
          })
        )
      },
      error: (err) => {
        // #region agent log
        console.error('[DEBUG useGetBalance] Subscription error:', err);
        // #endregion
        // Set balance to 0 on error
        setBalance(0n)
        setFormattedBalance(
          formatBigIntBalance(0n, chainInfo?.tokenDecimals, {
            numberAfterComma,
            tokenSymbol: chainInfo?.tokenSymbol
          })
        )
      }
    })

    return () => unsub && unsub.unsubscribe()
  }, [address, api, chainInfo, existentialDeposit, numberAfterComma])

  return { balance, balanceFormatted }
}
