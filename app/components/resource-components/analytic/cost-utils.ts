export function formatCost(value: string): string {
  const num = parseFloat(value)

  const abs = Math.abs(num)

  if (abs === 0) return '$0.00'

  if (abs >= 0.01) {
    // Normal range — 2 decimal
    return (
      '$' +
      num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    )
  }

  if (abs >= 0.0001) {
    // Small but readable — show significant figures (e.g. $0.000708)
    return '$' + num.toPrecision(3)
  }

  // Very small — scientific notation (e.g. $7.08e-6)
  return '$' + num.toExponential(2)
}
