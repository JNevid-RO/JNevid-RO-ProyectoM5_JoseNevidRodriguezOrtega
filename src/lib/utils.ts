export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
