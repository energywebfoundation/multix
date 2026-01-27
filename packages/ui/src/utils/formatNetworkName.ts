/**
 * Formats a network name for display.
 * Special handling for 'energywebx' -> 'EnergyWebX'
 * Other networks get first letter capitalized.
 */
export const formatNetworkName = (network: string | undefined): string => {
  if (!network) return ''
  if (network === 'energywebx') return 'EnergyWebX'
  return network.charAt(0).toUpperCase() + network.slice(1)
}
