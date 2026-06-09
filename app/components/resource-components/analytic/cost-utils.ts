export function formatCost(value: string): string {
  const num = parseFloat(value)

  if (!Number.isFinite(num) || num === 0) {
    return '$0.00'
  }

  const abs = Math.abs(num)

  if (abs >= 0.01) {
    return (
      '$' +
      num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    )
  }

  // For small numbers, show enough decimals without scientific notation
  return (
    '$' +
    num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 12,
      useGrouping: false,
    })
  )
}
