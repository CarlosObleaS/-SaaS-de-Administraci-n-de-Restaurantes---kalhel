/**
 * Formatea un precio en Soles (S/)
 */
export function formatPrice(price: number | string | null | undefined): string {
  const n = Number(price);
  if (Number.isFinite(n)) return `S/. ${n.toFixed(2)}`;
  return price != null ? String(price) : "";
}
