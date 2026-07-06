import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { BACKEND_URL } from "../../utils/config";

export default function Deliveries() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    paymentId: "",
    destinationAddress: "",
    reference: "",
    agency: "Olva Courier"
  });

  // ¿CÓMO funciona?
  // Carga todas las órdenes de entrega llamando al endpoint protegido del backend con cabeceras de autorización.
  // ¿POR QUÉ esta estructura?
  // Asegura que el backend reconozca al operador autenticado enviando el JWT de sesión desde localStorage.
  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${BACKEND_URL}/api/deliveries`, {
        method: "GET",
        headers,
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error("No se pudo obtener el listado de entregas.");
      }

      const data = await res.json();
      setDeliveries(data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message || "Error al cargar entregas", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (!auth || auth.role !== "admin") {
      navigate("/");
      return;
    }
    loadDeliveries();

    // ¿CÓMO funciona?
    // Establece un intervalo recurrente (cada 10 segundos) para ejecutar la consulta de entregas al backend.
    // ¿POR QUÉ esta estructura?
    // Hace que el panel se actualice y renderice automáticamente los nuevos pedidos y despachos 
    // generados por compras en tiempo real, sin requerir refrescos manuales.
    const interval = setInterval(() => {
      loadDeliveries();
    }, 10000);

    return () => clearInterval(interval);
  }, [navigate, loadDeliveries]);

  // ¿CÓMO funciona?
  // Envía una petición PATCH rápida para cambiar únicamente el estado logístico del despacho.
  // ¿POR QUÉ esta estructura?
  // Permite un flujo de trabajo ágil para actualizar a 'ready_for_pickup', 'shipped' y 'delivered' sin alterar otros datos.
  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      const headers = {
        "Content-Type": "application/json"
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${BACKEND_URL}/api/deliveries/${id}/status`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ status })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "No se pudo actualizar el estado de la entrega.");
      }

      Swal.fire("Éxito", `Estado de entrega actualizado a '${status}' con éxito.`, "success");
      loadDeliveries();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    }
  };

  // ¿CÓMO funciona?
  // Envía el formulario de nueva entrega (solo para tipo shipping) al backend mediante POST.
  // ¿POR QUÉ esta estructura?
  // Protege la creación de nuevos envíos bajo el rol de administrador y valida los datos de entrega correspondientes.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.paymentId.trim()) {
      return Swal.fire("Validación", "El ID de Pago es obligatorio.", "warning");
    }
    if (!formData.destinationAddress.trim()) {
      return Swal.fire("Validación", "La dirección de destino es obligatoria.", "warning");
    }
    if (!formData.reference.trim()) {
      return Swal.fire("Validación", "La referencia es obligatoria.", "warning");
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const headers = {
        "Content-Type": "application/json"
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${BACKEND_URL}/api/deliveries`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al registrar la entrega");
      }

      Swal.fire("Éxito", "Entrega registrada correctamente.", "success");
      setModalOpen(false);
      setFormData({
        paymentId: "",
        destinationAddress: "",
        reference: "",
        agency: "Olva Courier"
      });
      loadDeliveries();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ¿CÓMO funciona?
  // Abre el Modal de registro para envíos a domicilio cargando dinámicamente los datos de entrega.
  // ¿POR QUÉ esta estructura?
  // Extrae y auto-rellena la dirección y referencia que el usuario configuró en el checkout
  // para evitar tener que digitarlos manualmente y acelerar el flujo de trabajo.
  const openRegisterModal = (delivery) => {
    const payment = delivery.paymentId;
    setFormData({
      paymentId: payment?._id || delivery.paymentId || "",
      destinationAddress: payment?.direccion_entrega || "",
      reference: payment?.referencia || "",
      agency: "Olva Courier"
    });
    setModalOpen(true);
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    const payment = delivery.paymentId;
    const clientName = payment?.cliente || "Cliente Anónimo";
    const paymentIdStr = payment?._id || delivery.paymentId || "";
    const agencyStr = delivery.agency || "";
    const addressStr = delivery.destinationAddress || "";

    return (
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paymentIdStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agencyStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addressStr.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Control de Entregas Omnicanal</h2>
          <p className="text-sm text-gray-500">Administra los retiros en tienda (pickup) y los despachos a domicilio (shipping).</p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por Cliente, ID Pago, Dirección o Agencia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-sm text-gray-700"
          />
        </div>
      </div>

      {/* Listado de Entregas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 text-sm">Cargando registros de logística...</p>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <p className="text-gray-500 font-medium">No se encontraron entregas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Cliente / ID Pago</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Destino / Retiro</th>
                  <th className="p-4">Agencia</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                {filteredDeliveries.map((delivery) => {
                  const payment = delivery.paymentId;
                  const clientName = payment?.cliente || "Cliente Anónimo";
                  const paymentId = payment?._id || delivery.paymentId || "—";
                  const deliveryType = payment?.deliveryType || "shipping";
                  
                  // ¿CÓMO funciona?
                  // Verifica si la información de despacho a domicilio ya ha sido registrada por el administrador.
                  // ¿POR QUÉ esta estructura?
                  // El backend reactivo inicializa estos campos como "Pendiente de registro" al recibir el pago.
                  // Considerar dicho string como no completado evita ocultar erróneamente el botón "Registrar Entrega".
                  const isShippingInfoFilled = Boolean(
                    delivery.destinationAddress &&
                    delivery.destinationAddress !== "Pendiente de registro" &&
                    delivery.agency &&
                    delivery.agency !== "Pendiente de registro"
                  );

                  // Renderizado Condicional de Fondo según Tipo
                  const rowBg = deliveryType === "pickup"
                    ? "bg-amber-50/40 hover:bg-amber-100/40"
                    : "bg-blue-50/10 hover:bg-blue-100/20";

                  // Estilos para Badge de Estado
                  let statusBadgeClass = "bg-gray-100 text-gray-800";
                  let statusText = "Pendiente";
                  if (delivery.status === "ready_for_pickup") {
                    statusBadgeClass = "bg-amber-100 text-amber-800";
                    statusText = "Listo para Recojo";
                  } else if (delivery.status === "shipped") {
                    statusBadgeClass = "bg-blue-100 text-blue-800";
                    statusText = "Enviado";
                  } else if (delivery.status === "delivered") {
                    statusBadgeClass = "bg-green-100 text-green-800";
                    statusText = "Entregado";
                  }

                  return (
                    <tr key={delivery._id} className={`${rowBg} transition-colors`}>
                      {/* Cliente e ID Pago */}
                      <td className="p-4 pl-6">
                        <div className="font-semibold text-gray-800">{clientName}</div>
                        <div className="font-mono text-xs text-purple-700 mt-0.5">{paymentId}</div>
                      </td>

                      {/* Tipo de Entrega */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          deliveryType === "pickup" ? "bg-amber-100 text-amber-900 border border-amber-200" : "bg-blue-100 text-blue-900 border border-blue-200"
                        }`}>
                          {deliveryType === "pickup" ? "🏪 Recojo" : "🚚 Envío"}
                        </span>
                      </td>

                      {/* Destino o Retiro */}
                      <td className="p-4">
                        {deliveryType === "pickup" ? (
                          <div className="text-gray-500 text-xs italic">Retiro presencial en tienda principal</div>
                        ) : (
                          <>
                            <div className="text-gray-800 font-medium max-w-xs truncate" title={delivery.destinationAddress}>
                              {delivery.destinationAddress || "No registrado"}
                            </div>
                            {delivery.reference && (
                              <div className="text-gray-400 text-xs italic max-w-xs truncate" title={delivery.reference}>
                                Ref: {delivery.reference}
                              </div>
                            )}
                          </>
                        )}
                      </td>

                      {/* Agencia */}
                      <td className="p-4 font-medium text-gray-700">
                        {deliveryType === "pickup" ? "—" : (delivery.agency || "No asignada")}
                      </td>

                      {/* Estado */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass}`}>
                          {statusText}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          
                          {/* Acciones para Pickup */}
                          {deliveryType === "pickup" && (
                            <>
                              {delivery.status === "pending" && (
                                <button
                                  onClick={() => handleUpdateStatus(delivery._id, "ready_for_pickup")}
                                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
                                >
                                  Listo para Recojo
                                </button>
                              )}
                              {delivery.status === "ready_for_pickup" && (
                                <button
                                  onClick={() => handleUpdateStatus(delivery._id, "delivered")}
                                  className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
                                >
                                  Entregado
                                </button>
                              )}
                            </>
                          )}

                          {/* Acciones para Shipping */}
                          {deliveryType === "shipping" && (
                            <>
                              {delivery.status === "pending" && !isShippingInfoFilled && (
                                <button
                                  onClick={() => openRegisterModal(delivery)}
                                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
                                >
                                  Registrar Entrega
                                </button>
                              )}
                              {delivery.status === "pending" && isShippingInfoFilled && (
                                <button
                                  onClick={() => handleUpdateStatus(delivery._id, "shipped")}
                                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
                                >
                                  Marcar Enviado
                                </button>
                              )}
                              {delivery.status === "shipped" && (
                                <button
                                  onClick={() => handleUpdateStatus(delivery._id, "delivered")}
                                  className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
                                >
                                  Entregado
                                </button>
                              )}
                            </>
                          )}

                          {/* Estado Final */}
                          {delivery.status === "delivered" && (
                            <span className="text-gray-400 text-xs font-semibold flex items-center gap-1">
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                              </svg>
                              Logística Finalizada
                            </span>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Registro (Solo Shipping) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate__animated animate__fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
            <div className="bg-purple-600 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">Registrar Envío a Domicilio</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">ID de Pago Relacionado</label>
                <input
                  type="text"
                  disabled
                  value={formData.paymentId}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Dirección de Destino</label>
                <input
                  type="text"
                  required
                  placeholder="Calle, Avenida, Número, Distrito y Ciudad"
                  value={formData.destinationAddress}
                  onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-50 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Referencia de Entrega</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cerca al parque central, portón verde"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-50 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Agencia de Envío</label>
                <select
                  value={formData.agency}
                  onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white transition-all"
                >
                  <option value="Olva Courier">Olva Courier</option>
                  <option value="Shalom">Shalom</option>
                  <option value="Scharff">Scharff</option>
                  <option value="DHL">DHL</option>
                  <option value="Otro">Otro (Manual)</option>
                </select>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md hover:shadow-lg text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Registrar Despacho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
