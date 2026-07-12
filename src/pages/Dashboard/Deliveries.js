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
  const [isProcessing, setIsProcessing] = useState(false);
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [claimAction, setClaimAction] = useState({ status: 'resolved', resolution: 'approved', newDeliveryStatus: '', cancellationReason: '', deliveryCode: '' });

  const [formData, setFormData] = useState({
    paymentId: "",
    destinationAddress: "",
    reference: "",
    agency: "Olva Courier"
  });

  const loadClaims = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${BACKEND_URL}/api/claims`, { method: "GET", headers, credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setClaims(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

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

    let isMounted = true;

    const refreshData = async () => {
      if (!isMounted) return;
      await loadDeliveries();
      await loadClaims();
    };

    refreshData();

    const intervalId = window.setInterval(() => {
      refreshData();
    }, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [loadDeliveries, loadClaims, navigate]);

  const handleUpdateStatus = async (id, status, deliveryCode = '') => {
    setIsProcessing(true);
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
        body: JSON.stringify({ status, deliveryCode })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "No se pudo actualizar el estado de la entrega.");
      }

      Swal.fire("Éxito", `Estado de entrega actualizado a '${status}' con éxito.`, "success");
      await loadDeliveries();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveClaim = async (e) => {
    e.preventDefault();
    if (!selectedClaim) return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${BACKEND_URL}/api/claims/${selectedClaim._id}/resolve`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify(claimAction)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo resolver el reclamo.");
      Swal.fire("Éxito", "Reclamo actualizado correctamente.", "success");
      setSelectedClaim(null);
      setClaimAction({ status: 'resolved', resolution: 'approved', newDeliveryStatus: '', cancellationReason: '', deliveryCode: '' });
      loadClaims();
      loadDeliveries();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

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
      Swal.fire("Error", err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Control de Entregas Omnicanal</h2>
          <p className="text-sm text-gray-500">Administra los retiros en tienda (pickup) y los despachos a domicilio (shipping).</p>
        </div>
      </div>

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
                  <th className="p-4 pl-6">Pedido / Cliente</th>
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
                  
                  const isShippingInfoFilled = Boolean(
                    delivery.destinationAddress &&
                    delivery.destinationAddress !== "Pendiente de registro" &&
                    delivery.agency &&
                    delivery.agency !== "Pendiente de registro"
                  );

                  const rowBg = deliveryType === "pickup"
                    ? "bg-amber-50/40 hover:bg-amber-100/40"
                    : "bg-blue-50/10 hover:bg-blue-100/20";

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
                  } else if (delivery.status === "cancelled") {
                    statusBadgeClass = "bg-red-100 text-red-800";
                    statusText = "Cancelado";
                  }

                  const currentDraftStatus = statusDrafts[delivery._id] || delivery.status;

                  return (
                    <tr key={delivery._id} className={`${rowBg} transition-colors`}>
                      <td className="p-4 pl-6">
                        <div className="font-semibold text-gray-800">{clientName}</div>
                        <div className="font-mono text-xs text-purple-700 mt-0.5">Pedido: {delivery._id || '—'}</div>
                        <div className="font-mono text-[11px] text-gray-500 mt-0.5">Pago: {paymentId}</div>
                        <div className="text-[11px] text-gray-500 mt-1">ID de orden: {delivery._id || '—'}</div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          deliveryType === "pickup" ? "bg-amber-100 text-amber-900 border border-amber-200" : "bg-blue-100 text-blue-900 border border-blue-200"
                        }`}>
                          {deliveryType === "pickup" ? "🏪 Recojo" : "🚚 Envío"}
                        </span>
                      </td>

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

                      <td className="p-4 font-medium text-gray-700">
                        {deliveryType === "pickup" ? "—" : (delivery.agency || "No asignada")}
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass}`}>
                          {statusText}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <select
                            value={currentDraftStatus}
                            onChange={(e) => setStatusDrafts((prev) => ({ ...prev, [delivery._id]: e.target.value }))}
                            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 outline-none"
                          >
                            <option value="pending">Pendiente</option>
                            <option value="ready_for_pickup">Listo para recojo</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregado</option>
                            <option value="cancelled">Cancelado</option>
                            <option value="returned">Devuelto</option>
                          </select>
                          <button
                            onClick={() => {
                              const nextStatus = currentDraftStatus;
                              if (nextStatus === "delivered") {
                                const code = window.prompt("Ingresa el código de validación de entrega:");
                                if (code) handleUpdateStatus(delivery._id, nextStatus, code);
                                return;
                              }
                              handleUpdateStatus(delivery._id, nextStatus);
                            }}
                            disabled={isProcessing}
                            className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                          >
                            Aplicar
                          </button>
                          <button
                            onClick={() => setSelectedDelivery(delivery)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                          >
                            Detalle
                          </button>

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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Reclamos pendientes</h3>
            <p className="text-sm text-gray-500">Resuelve los reclamos y decide el siguiente estado del pedido.</p>
          </div>
        </div>
        <div className="space-y-3">
          {claims.length === 0 ? (
            <p className="text-sm text-gray-500">No hay reclamos registrados.</p>
          ) : claims.filter((claim) => claim.status === 'pending').map((claim) => (
            <div key={claim._id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800">{claim.category}</p>
                  <p className="text-sm text-gray-500">{claim.description}</p>
                </div>
                <button onClick={() => setSelectedClaim(claim)} className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white">Resolver</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800">Resolver reclamo</h3>
            <p className="mt-1 text-sm text-gray-500">Categoría: {selectedClaim.category}</p>
            <form onSubmit={handleResolveClaim} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Resolución</label>
                <select value={claimAction.status} onChange={(e) => setClaimAction({ ...claimAction, status: e.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2">
                  <option value="resolved">Aprobar</option>
                  <option value="rejected">Rechazar</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Observación</label>
                <input value={claimAction.resolution} onChange={(e) => setClaimAction({ ...claimAction, resolution: e.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="Ej. Se aprobó el reembolso" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Nuevo estado del pedido</label>
                <select value={claimAction.newDeliveryStatus} onChange={(e) => setClaimAction({ ...claimAction, newDeliveryStatus: e.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2">
                  <option value="">Sin cambio</option>
                  <option value="pending">Pendiente</option>
                  <option value="ready_for_pickup">Listo para recojo</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="returned">Devuelto</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Motivo de cancelación (si aplica)</label>
                <input value={claimAction.cancellationReason} onChange={(e) => setClaimAction({ ...claimAction, cancellationReason: e.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="Ej. Pedido cancelado por falta de stock" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Código de validación (si aplica)</label>
                <input value={claimAction.deliveryCode} onChange={(e) => setClaimAction({ ...claimAction, deliveryCode: e.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="Código de entrega" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSelectedClaim(null)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600">Cancelar</button>
                <button type="submit" disabled={isProcessing} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Detalle del pedido</h3>
                <p className="text-sm text-gray-500">Pedido: {selectedDelivery._id}</p>
              </div>
              <button onClick={() => setSelectedDelivery(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600">Cerrar</button>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
              <div><span className="font-semibold">Cliente:</span> {selectedDelivery.paymentId?.cliente || 'Cliente anónimo'}</div>
              <div><span className="font-semibold">Pago:</span> {selectedDelivery.paymentId?._id || selectedDelivery.paymentId || '—'}</div>
              <div><span className="font-semibold">Tipo:</span> {selectedDelivery.deliveryType === 'pickup' ? 'Recojo' : 'Envío'}</div>
              <div><span className="font-semibold">Estado:</span> {selectedDelivery.status}</div>
              <div><span className="font-semibold">Dirección:</span> {selectedDelivery.destinationAddress || '—'}</div>
              <div><span className="font-semibold">Referencia:</span> {selectedDelivery.reference || '—'}</div>
              <div><span className="font-semibold">Agencia:</span> {selectedDelivery.agency || '—'}</div>
              <div><span className="font-semibold">Código de confirmación:</span> {selectedDelivery.deliveryCode ? 'Privado y visible solo al confirmar la entrega' : '—'}</div>
              <div><span className="font-semibold">Código de seguimiento:</span> {selectedDelivery.trackingCode || '—'}</div>
              <div><span className="font-semibold">Fecha estimada:</span> {selectedDelivery.estimatedDate ? new Date(selectedDelivery.estimatedDate).toLocaleDateString('es-PE') : '—'}</div>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <h4 className="text-sm font-semibold text-gray-800">Productos del pedido</h4>
              <ul className="mt-3 space-y-2">
                {(selectedDelivery.paymentId?.productos || []).length === 0 ? (
                  <li className="text-sm text-gray-500">No hay productos registrados para este pedido.</li>
                ) : (selectedDelivery.paymentId?.productos || []).map((product, index) => (
                  <li key={`${product?.name || 'producto'}-${index}`} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                    <span>{product?.name || 'Producto sin nombre'}</span>
                    <span className="font-semibold text-gray-500">x{product?.quantity || 0}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

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
