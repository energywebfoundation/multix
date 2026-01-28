import { useEffect, useState } from 'react'
import { Transaction } from 'polkadot-api'
import { useAnyApi } from './useAnyApi'

interface Props {
  threshold?: number | null
  signatories?: string[]
  call?: Transaction<any, any, any, any>
  withPplApi?: boolean
}

export const useMultisigProposalNeededFunds = ({
  threshold,
  signatories,
  call,
  withPplApi = false
}: Props) => {
  const { api, compatibilityToken, chainInfo } = useAnyApi({ withPplApi })
  const [min, setMin] = useState(0n)
  const [reserved, setReserved] = useState(0n)

  useEffect(() => {
    // #region agent log
    console.log('[DEBUG useMultisigProposalNeededFunds] Entry:', {
      hasApi: !!api,
      signatoriesLength: signatories?.length,
      hasCompatibilityToken: !!compatibilityToken,
      hasChainInfo: !!chainInfo,
      threshold: threshold,
      hasCall: !!call,
      chainId: chainInfo?.chainId
    });
    // #endregion
    if (!api || !signatories || signatories.length < 2 || !compatibilityToken) return

    if (!chainInfo?.tokenDecimals) return

    if (!threshold) return

    if (!call) return

    const multisigDepositBase = api.constants.Multisig.DepositBase(compatibilityToken)
    const multisigDepositFactor = api.constants.Multisig.DepositFactor(compatibilityToken)
    // #region agent log
    console.log('[DEBUG useMultisigProposalNeededFunds] Constants:', {
      multisigDepositBase: multisigDepositBase?.toString(),
      multisigDepositFactor: multisigDepositFactor?.toString(),
      threshold: threshold,
      chainId: chainInfo?.chainId
    });
    // #endregion

    if (!multisigDepositFactor || !multisigDepositBase) return

    call
      .getEstimatedFees('5CXQZrh1MSgnGGCdJu3tqvRfCv7t5iQXGGV9UKotrbfhkavs')
      .then((info) => {
        const reservedTemp = multisigDepositFactor * BigInt(threshold) + multisigDepositBase
        // #region agent log
        console.log('[DEBUG useMultisigProposalNeededFunds] Fee estimation:', {
          estimatedFee: info.toString(),
          reservedAmount: reservedTemp.toString(),
          totalMin: (reservedTemp + info).toString(),
          chainId: chainInfo?.chainId
        });
        // #endregion
        setMin(reservedTemp + info)
        setReserved(reservedTemp)
      })
      .catch(console.error)
  }, [api, call, chainInfo, compatibilityToken, signatories, threshold])

  return { multisigProposalNeededFunds: min, reserved }
}
