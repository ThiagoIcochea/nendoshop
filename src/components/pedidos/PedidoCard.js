import React, { useState } from "react";
import Swal from "sweetalert2";
import { BACKEND_URL } from "../../utils/config";

/**
 * Componente PedidoCard
 * Representa de forma individual cada pedido del cliente final con soporte de acciones y formateos nativos.
 */
export default function PedidoCard({ order, onReturnSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleReturn = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro de solicitar la devolución de este pedido?",
      text: "Esta acción no se puede deshacer y repondrá el stock de los productos de forma automática.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, devolver",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${BACKEND_URL}/api/deliveries/my-orders/${order._id}/return`, {
        method: "PUT",
        headers,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "No se pudo procesar la devolución.");
      }

      await Swal.fire({
        title: "¡Devolución Procesada!",
        text: "La orden ha sido devuelta con éxito y el stock de los productos ha sido repuesto.",
        icon: "success",
        confirmButtonColor: "#7c3aed",
      });

      if (onReturnSuccess) {
        onReturnSuccess();
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.message,
        icon: "error",
        confirmButtonColor: "#7c3aed",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const payment = order.paymentId || {};
  const products = payment.productos || [];

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
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-semibold text-gray-500">Total Pagado:</span>
          <span className="text-lg font-black text-brand">
            {formatCurrency(payment.total || 0)}
          </span>
        </div>

        {order.status === "delivered" && (
          <button
            onClick={handleReturn}
            disabled={isProcessing}
            className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all text-sm flex items-center justify-center gap-2"
          >
            {isProcessing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {isProcessing ? "Procesando..." : "Devolver Pedido"}
          </button>
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
