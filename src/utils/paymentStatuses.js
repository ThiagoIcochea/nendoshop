const PAYMENT_STATUS_CONFIG = [
  { key: "pending", label: "Pendiente", aliases: ["pending", "pendiente", "in_process", "processing", "en_proceso", "por_pagar"] },
  { key: "authorized", label: "Autorizado", aliases: ["authorized", "autorizado"] },
  { key: "paid", label: "Pagado", aliases: ["paid", "pagado", "completed", "completado", "approved", "aprobado", "captured", "capturado", "successful", "success", "exitoso"] },
  { key: "failed", label: "Fallido", aliases: ["failed", "fallido", "error", "rejected", "rechazado", "declined", "denegado"] },
  { key: "cancelled", label: "Cancelado", aliases: ["cancelled", "cancelado", "voided", "anulado", "aborted"] },
  { key: "refunded", label: "Reembolsado", aliases: ["refunded", "refund", "reembolsado", "reembolso", "returned_refund"] },
  { key: "partial_refund", label: "Reembolso parcial", aliases: ["partial_refund", "partial refund", "reembolso parcial", "partially_refunded"] },
  { key: "chargeback", label: "Contracargo", aliases: ["chargeback", "charge_back", "contracargo", "disputed", "disputa"] },
  { key: "expired", label: "Expirado", aliases: ["expired", "expirado", "vencido"] },
  { key: "unknown", label: "Sin estado", aliases: ["unknown", "sin estado", "n/a", "na", "undefined", "null"] }
];

const normalizePaymentStatus = (status) => {
  const raw = String(status || "").trim().toLowerCase();
  if (!raw) return "unknown";

  const matched = PAYMENT_STATUS_CONFIG.find((item) => item.aliases.includes(raw));
  if (matched) return matched.key;

  if (raw.includes("refund")) return "refunded";
  if (raw.includes("paid") || raw.includes("pagad")) return "paid";
  if (raw.includes("cancel")) return "cancelled";
  if (raw.includes("fail") || raw.includes("reject") || raw.includes("declin")) return "failed";
  if (raw.includes("pend") || raw.includes("process") || raw.includes("proce")) return "pending";
  return raw;
};

const getPaymentStatusLabel = (status) => {
  const normalized = normalizePaymentStatus(status);
  return PAYMENT_STATUS_CONFIG.find((item) => item.key === normalized)?.label || String(status || "Sin estado");
};

const getPaymentStatusSeries = (payments = []) => {
  const stateMap = payments.reduce((acc, payment) => {
    const normalized = normalizePaymentStatus(payment?.estado);
    acc[normalized] = (acc[normalized] || 0) + 1;
    return acc;
  }, {});

  const orderedKeys = PAYMENT_STATUS_CONFIG.map((item) => item.key);
  const knownEntries = orderedKeys
    .filter((key) => stateMap[key])
    .map((key) => ({
      key,
      name: PAYMENT_STATUS_CONFIG.find((item) => item.key === key)?.label || key,
      count: stateMap[key]
    }));

  const unknownEntries = Object.entries(stateMap)
    .filter(([key]) => !orderedKeys.includes(key))
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, name: key, count }));

  return [...knownEntries, ...unknownEntries];
};

const getPaymentStatusOptions = (payments = []) => {
  const seen = new Set();
  const options = [];

  for (const payment of payments) {
    const raw = String(payment?.estado || "").trim();
    const key = normalizePaymentStatus(raw);
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({ value: key, label: getPaymentStatusLabel(raw) });
  }

  return PAYMENT_STATUS_CONFIG
    .filter((item) => seen.has(item.key))
    .map((item) => ({ value: item.key, label: item.label }))
    .concat(
      options.filter((option) => !PAYMENT_STATUS_CONFIG.some((item) => item.key === option.value))
    );
};

module.exports = {
  PAYMENT_STATUS_CONFIG,
  getPaymentStatusLabel,
  getPaymentStatusSeries,
  getPaymentStatusOptions,
  normalizePaymentStatus
};
