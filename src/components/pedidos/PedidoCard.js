import React, { useState, useMemo } from "react";
import ClaimModal from "./ClaimModal";

/**
 * Componente PedidoCard
 * Representa de forma individual cada pedido del cliente final con soporte de acciones y formateos nativos.
 */
export default function PedidoCard({ order, onReturnSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClaim, setShowClaim] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  const formatOrderId = (id) => {
    if (!id) return "";
    const lastSix = id.substring(id.length - 6);
    return `#${lastSix.toUpperCase()}`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: "⏳ Pendiente", className: "bg-gray-100 text-gray-800 border-gray-200" },
      ready_for_pickup: { text: "🏪 Listo para Recojo", className: "bg-amber-100 text-amber-800 border-amber-200" },
      shipped: { text: "🚚 Enviado", className: "bg-blue-100 text-blue-800 border-blue-200" },
      delivered: { text: "✅ Entregado", className: "bg-green-100 text-green-800 border-green-200" },
      returned: { text: "🔄 Devuelto", className: "bg-purple-100 text-purple-800 border-purple-200" },
    };

    const config = statusMap[status] || { text: status, className: "bg-gray-100 text-gray-800 border-gray-200" };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const payment = order.paymentId || {};
  const products = payment.productos || [];

  const claimEligibility = useMemo(() => {
    const status = String(order.status || '').toLowerCase();
    const hasDeadline = Boolean(order.estimatedDate);
    const deadlinePassed = hasDeadline && new Date(order.estimatedDate).getTime() < Date.now();
    const isDeliveredOrReturned = ['delivered', 'returned'].includes(status);
    const isCancelled = status === 'cancelled';
    const isDelayEligible = ['pending', 'ready_for_pickup', 'shipped'].includes(status) && deadlinePassed;
    const canClaim = isDeliveredOrReturned || isCancelled || isDelayEligible;

    return {
      canClaim,
      message: canClaim
        ? 'Puedes generar un reclamo para este pedido.'
        : 'Los reclamos estarán disponibles cuando el pedido haya sido entregado, devuelto o cancelado, o cuando haya pasado la fecha estimada de entrega.'
    };
  }, [order.estimatedDate, order.status]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full animate__animated animate__fadeInUp">
      <div>
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              ID del Pedido
            </p>
            <p className="font-mono text-xs sm:text-sm text-purple-700 font-semibold">
              {formatOrderId(order._id)}
            </p>
          </div>
          <div className="flex-shrink-0">{getStatusBadge(order.status)}</div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
            Fecha de Compra
          </p>
          <p className="text-sm text-gray-700 font-medium">
            {formatDate(payment.fecha || order.createdAt)}
          </p>
        </div>

        <div className="border-t border-b border-gray-100 py-4 mb-4">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">
            Productos
          </p>
          <ul className="space-y-2">
            {products.map((product, index) => (
              <li
                key={product._id || `prod-${index}`}
                className="flex justify-between items-center text-sm text-gray-700 font-medium"
              >
                <span className="truncate pr-4" title={product.name}>
                  {product.name}
                </span>
                <span className="text-gray-500 font-mono flex-shrink-0">
                  x{product.quantity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-gray-500">Total Pagado:</span>
          <span className="text-lg font-black text-brand">
            {formatCurrency(payment.total || 0)}
          </span>
        </div>

        {order.estimatedDate && (
          <div className="mb-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <div className="font-semibold">Entrega máxima estimada</div>
            <div>{formatDate(order.estimatedDate)}</div>
          </div>
        )}

        <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          <div className="font-semibold">Historial de estados</div>
          <ul className="mt-2 space-y-1">
            <li>• Pedido registrado</li>
            <li>• {order.status === 'delivered' || order.status === 'returned' ? 'Entregado o devuelto' : order.status === 'cancelled' ? 'Cancelado' : 'En proceso'}</li>
            <li>• {order.status === 'delivered' ? 'Confirmado por el cliente' : order.status === 'returned' ? 'Devuelto' : 'Pendiente de cierre'}</li>
          </ul>
          {order.deliveryCode && (
            <div className="mt-2 font-semibold text-green-700">Código de confirmación: {order.deliveryCode}</div>
          )}
        </div>

        {order.status === "delivered" && (
          <button
            onClick={() => {
              setShowClaim(true);
              setTimeout(() => {
                const modal = document.querySelector('[data-claim-modal]');
                if (modal) modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 50);
            }}
            className="w-full bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all text-sm flex items-center justify-center gap-2"
          >
            Solicitar devolución
          </button>
        )}

        {order.status !== "returned" && (
          <>
            {claimEligibility.canClaim && (
              <button
                onClick={() => setShowClaim((prev) => !prev)}
                className="mt-3 w-full rounded-xl border border-brand/20 bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
              >
                {showClaim ? 'Ocultar reclamo' : 'Generar reclamo'}
              </button>
            )}
            {!claimEligibility.canClaim && (
              <p className="mt-3 text-center text-xs text-gray-500">{claimEligibility.message}</p>
            )}
            {showClaim && <ClaimModal order={order} onSubmitted={() => setShowClaim(false)} />}
          </>
        )}

        {order.status === "returned" && (
          <p className="text-center text-sm text-gray-400 font-bold italic py-2.5 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            Devolución Procesada
          </p>
        )}
      </div>
    </div>
  );
}
