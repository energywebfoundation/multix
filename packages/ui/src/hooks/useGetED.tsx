import { useMemo } from 'react'
import { useAnyApi } from './useAnyApi'

interface useGetEDProps {
  withPplApi?: boolean
}

export const useGetED = ({ withPplApi = false }: useGetEDProps) => {
  const { api, compatibilityToken, chainInfo } = useAnyApi({ withPplApi })
  const existentialDeposit = useMemo(() => {
    if (!api || !compatibilityToken) return

    const ed = api.constants.Balances.ExistentialDeposit(compatibilityToken)
    // #region agent log
    console.log('[DEBUG useGetED] Existential deposit fetched:', {
      existentialDeposit: ed?.toString(),
      hasCompatibilityToken: !!compatibilityToken,
      chainId: chainInfo?.chainId,
      withPplApi: withPplApi
    });
    // #endregion
    return ed
  }, [api, compatibilityToken, chainInfo, withPplApi])

  return { existentialDeposit }
}
