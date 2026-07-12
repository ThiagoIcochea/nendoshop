import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import PedidoCard from "../components/pedidos/PedidoCard";
import ParticlesBackground from "../components/ParticlesBackground";
import { BACKEND_URL } from "../utils/config";

/**
 * Vista de Mis Pedidos del Cliente Final
 * Carga de forma segura y dinámica el listado logístico personal del usuario y gestiona la visualización de estados.
 */
export default function MisPedidos() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${BACKEND_URL}/api/deliveries/my-orders`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("No se pudo obtener el historial de tus pedidos.");
      }

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      // Error de red controlado de forma silenciosa
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="relative min-h-screen pb-12 overflow-hidden bg-background">
      <ParticlesBackground />

      <div className="relative z-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          
          <section className="mb-8 relative rounded-2xl overflow-hidden border border-brand bg-white shadow-sm p-6 sm:p-10">
            <div className="animate__animated animate__fadeInLeft relative z-10 flex flex-col justify-center">
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
                Mis Pedidos
              </h2>
              <p className="text-sm sm:text-lg text-gray-600 max-w-xl font-medium">
                Monitorea el estado logístico de tus compras, y gestiona devoluciones de manera ágil cuando tus paquetes hayan sido entregados.
              </p>
            </div>
          </section>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-brand rounded-2xl shadow-sm">
              <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-sm font-semibold">Cargando tus pedidos en tiempo real...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-brand p-12 text-center shadow-sm max-w-2xl mx-auto animate__animated animate__fadeIn">
              <div className="w-20 h-20 bg-purple-50 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes pedidos</h3>
              <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto font-medium">
                Explora nuestro catálogo completo de figuras y Nendoroids oficiales para realizar tu primera compra.
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-brand text-brand hover:bg-brand hover:text-white font-bold rounded-full transition duration-300 text-sm"
              >
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order, i) => (
                <div
                  key={order._id}
                  className="animate__animated animate__fadeInUp"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <PedidoCard order={order} onReturnSuccess={fetchOrders} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
