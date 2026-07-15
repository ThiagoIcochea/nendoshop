import { getPaymentStatusSeries } from "./paymentStatuses";

export const buildSalesMetrics = (payments = []) => {
  const totals = payments.reduce(
    (acc, payment) => {
      acc.sales += Number(payment.total || 0);
      acc.count += 1;
      return acc;
    },
    { sales: 0, count: 0 }
  );

  const stateMap = getPaymentStatusSeries(payments).reduce((acc, entry) => {
    acc[entry.name] = entry.count;
    return acc;
  }, {});

  const productMap = payments.reduce((acc, payment) => {
    const productLabel = payment.productos?.[0]?.name || payment.producto || "Sin producto";
    acc[productLabel] = (acc[productLabel] || 0) + 1;
    return acc;
  }, {});

  const topState = getPaymentStatusSeries(payments)[0]?.name || "N/A";
  const topProduct = Object.entries(productMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return {
    totals,
    topState,
    topProduct,
    stateMap,
    productMap
  };
};
