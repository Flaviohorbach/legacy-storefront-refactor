// Prices are kept in cents everywhere: 0.1 + 0.2 is not 0.3 in floating point,
// and a cart that sums 3 × $29.99 must show $89.97, not $89.97000000000001.
export const toCents = (dollars: number) => Math.round(dollars * 100);

const format = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const formatCents = (cents: number) => format.format(cents / 100);
