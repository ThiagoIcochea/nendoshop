import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";
import ClaimModal from "./ClaimModal";
import { BACKEND_URL } from "../../utils/config";
import { readJsonResponse } from "../../utils/api";
import { promptMfaCode, promptMfaMethodSelection } from "../../utils/mfaFlow";

const isBusinessDay = (date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

const addBusinessDays = (startDate, days) => {
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return null;

  const result = new Date(start);
  result.setHours(0, 0, 0, 0);
  let remainingDays = Math.ceil(Number(days) || 0);

  while (remainingDays > 0) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result)) {
      remainingDays -= 1;
    }
  }

  return result;
};

export default function PedidoCard({ order, onReturnSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const payment = order.paymentId || {};
  const products = payment.productos || [];
  const statusHistory = Array.isArray(order.statusHistory) && order.statusHistory.length
    ? order.statusHistory
    : [{ status: order.status || "pending", timestamp: order.updatedAt || order.createdAt, note: "Pedido registrado" }];

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-PE", { year: "numeric", month: "long", day: "numeric" }).format(date);
  };

  const formatCurrency = (amount) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(amount);

  const formatOrderId = (id) => {
    if (!id) return "";
    return `#${id.substring(id.length - 6).toUpperCase()}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: "Pendiente", className: "bg-gray-100 text-gray-800 border-gray-200" },
      ready_for_pickup: { text: "Listo para recojo", className: "bg-amber-100 text-amber-800 border-amber-200" },
      shipped: { text: "Enviado", className: "bg-blue-100 text-blue-800 border-blue-200" },
      delivered: { text: "Entregado", className: "bg-green-100 text-green-800 border-green-200" },
      returned: { text: "Devuelto", className: "bg-purple-100 text-purple-800 border-purple-200" },
      cancelled: { text: "Cancelado", className: "bg-red-100 text-red-800 border-red-200" }
    };
    const config = statusMap[status] || { text: status || "Pendiente", className: "bg-gray-100 text-gray-800 border-gray-200" };
    return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}>{config.text}</span>;
  };

  const claimEligibility = useMemo(() => {
    const status = String(order.status || "").toLowerCase();
    const hasDeadline = Boolean(order.estimatedDate);
    const claimDeadline = hasDeadline ? addBusinessDays(order.estimatedDate, 2) : null;
    const deadlinePassed = Boolean(claimDeadline) && claimDeadline.getTime() <= Date.now();
    const allowedCategories = [];
    if (["pending", "ready_for_pickup", "shipped"].includes(status) && deadlinePassed) {
      allowedCategories.push("delay");
    }
    if (["delivered", "returned"].includes(status)) {
      allowedCategories.push("incomplete", "damaged");
    }
    if (status === "delivered") {
      allowedCategories.push("return");
    }
    if (status === "cancelled") {
      allowedCategories.push("cancellation");
    }
    const canClaim = allowedCategories.length > 0;
    return {
      canClaim,
      allowedCategories,
      message: canClaim
        ? "Puedes generar un reclamo para este pedido."
        : "Los reclamos se habilitan según el motivo: demora tras 2 días hábiles de la fecha máxima, pedido incompleto o dañado al entregarse, devolución con pedido entregado, o cancelación con pedido cancelado."
    };
  }, [order.estimatedDate, order.status]);

  const canCancel = ["pending", "ready_for_pickup"].includes(String(order.status || "").toLowerCase());

  const handleCancelWithMfa = async () => {
    if (!canCancel || isProcessing) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const mfaSelection = await promptMfaMethodSelection({
        title: "Confirmar cancelación",
        description: "Elige cómo recibir el código para confirmar la cancelación.",
        confirmButtonText: "Continuar",
        cancelButtonText: "Volver"
      });
      if (!mfaSelection?.value) return;

      const requestRes = await fetch(`${BACKEND_URL}/api/deliveries/my-orders/${order._id}/cancel/request`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ method: mfaSelection.value })
      });
      const requestData = await readJsonResponse(requestRes);
      if (!requestRes.ok) throw new Error(requestData?.message || "No se pudo iniciar la verificación MFA.");

      const codeResult = await promptMfaCode({
        title: "Confirmar cancelación",
        description: "Ingresa el código que recibiste para autorizar la cancelación.",
        confirmButtonText: "Cancelar pedido",
        cancelButtonText: "Volver"
      });
      const value = typeof codeResult?.value === "string" ? codeResult.value : codeResult?.value?.code || "";
      if (!value) return;

      const confirmRes = await fetch(`${BACKEND_URL}/api/deliveries/my-orders/${order._id}/cancel/confirm`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ tempToken: requestData.tempToken, code: value, method: mfaSelection.value })
      });
      const confirmData = await readJsonResponse(confirmRes);
      if (!confirmRes.ok) throw new Error(confirmData?.message || "No se pudo cancelar el pedido.");

      await Swal.fire("Pedido cancelado", "La cancelación fue confirmada con MFA.", "success");
      onReturnSuccess?.();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        <div>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">ID del Pedido</p>
              <p className="font-mono text-xs font-semibold text-purple-700 sm:text-sm">{formatOrderId(order._id)}</p>
            </div>
            <div className="flex-shrink-0">{getStatusBadge(order.status)}</div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Fecha de Compra</p>
            <p className="text-sm font-medium text-gray-700">{formatDate(payment.fecha || order.createdAt)}</p>
          </div>

          <div className="mb-4 border-y border-gray-100 py-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Productos</p>
            <ul className="space-y-2">
              {products.map((product, index) => (
                <li key={product._id || `prod-${index}`} className="flex items-center justify-between text-sm font-medium text-gray-700">
                  <span className="truncate pr-4" title={product.name}>{product.name}</span>
                  <span className="flex-shrink-0 font-mono text-gray-500">x{product.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500">Total Pagado:</span>
            <span className="text-lg font-black text-brand">{formatCurrency(payment.total || 0)}</span>
          </div>

          {order.estimatedDate && (
            <div className="mb-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <div className="font-semibold">Entrega máxima estimada</div>
              <div>{formatDate(order.estimatedDate)}</div>
            </div>
          )}

          <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            <div className="font-semibold">Tracking actual</div>
            <div className="mt-1">{statusHistory[statusHistory.length - 1]?.note || "Estado actualizado"}</div>
            {["ready_for_pickup", "shipped"].includes(String(order.status || "").toLowerCase()) && order.deliveryCode && (
              <div className="mt-2 rounded-lg border border-green-200 bg-green-50 px-2 py-2 font-semibold text-green-700">
                Código de confirmación: {order.deliveryCode}
              </div>
            )}
          </div>

          <button onClick={() => setShowDetail(true)} className="mb-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
            Ver Detalle
          </button>

          {canCancel && (
            <button onClick={handleCancelWithMfa} disabled={isProcessing} className="mb-3 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60">
              {isProcessing ? "Procesando..." : "Cancelar pedido con MFA"}
            </button>
          )}

          {claimEligibility.canClaim ? (
            <>
              <button onClick={() => setShowClaim((prev) => !prev)} className="mt-3 w-full rounded-xl border border-brand/20 bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white">
                {showClaim ? "Ocultar reclamo" : "Generar reclamo"}
              </button>
              {showClaim && <ClaimModal order={order} allowedCategories={claimEligibility.allowedCategories} onSubmitted={() => setShowClaim(false)} />}
            </>
          ) : (
            <p className="mt-3 text-center text-xs text-gray-500">{claimEligibility.message}</p>
          )}

          {order.status === "returned" && !claimEligibility.canClaim && (
            <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-2.5 text-center text-sm font-bold italic text-gray-400">
              Devolución Procesada
            </p>
          )}
        </div>
      </div>

      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Detalle del pedido {formatOrderId(order._id)}</h3>
                <p className="text-sm text-gray-500">Compra: {formatDate(payment.fecha || order.createdAt)}</p>
              </div>
              <button onClick={() => setShowDetail(false)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600">Cerrar</button>
            </div>

            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <h4 className="text-sm font-bold text-gray-800">Productos comprados</h4>
              <ul className="mt-3 space-y-2">
                {products.map((product, index) => (
                  <li key={product._id || `${product.name}-${index}`} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
                    <span className="font-medium text-gray-800">{product.name}</span>
                    <span className="text-gray-500">x{product.quantity} · {formatCurrency(product.price || 0)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <h4 className="text-sm font-bold text-blue-900">Estados del pedido</h4>
              <div className="mt-4 max-h-72 overflow-y-auto pr-2">
                <ol className="space-y-3">
                  {statusHistory.map((entry, index) => (
                    <li key={`${entry.status}-${entry.timestamp || index}`} className="flex gap-3">
                      <span className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-blue-600"></span>
                      <div>
                        <div>{getStatusBadge(entry.status)}</div>
                        <p className="mt-1 text-xs text-gray-600">{entry.note || "Estado actualizado"}</p>
                        <p className="text-xs text-gray-400">{formatDate(entry.timestamp)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
