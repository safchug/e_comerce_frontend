export function formatPrice(cents: number | null | undefined, currency?: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(
      (cents || 0) / 100,
    )
  } catch {
    return `${((cents || 0) / 100).toFixed(2)} ${currency || ''}`.trim()
  }
}
