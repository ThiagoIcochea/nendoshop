import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { BACKEND_URL } from "../../utils/config";

const CLAIM_LABELS = {
  delay: "Demora",
  incomplete: "Pedido incompleto",
  damaged: "Producto dañado",
  return: "Devolución",
  cancellation: "Cancelación"
};

const STATUS_LABELS = {
  pending: "Pendiente",
  resolved: "Resuelto",
  rejected: "Rechazado"
};

export default function Claims() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [claimAction, setClaimAction] = useState({
    status: "resolved",
    resolution: "approved",
    newDeliveryStatus: "",
    cancellationReason: "",
    deliveryCode: ""
  });

  const loadClaims = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${BACKEND_URL}/api/claims`, { headers, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudieron cargar los reclamos.");
      setClaims(Array.isArray(data) ? data : []);
    } catch (error) {
      Swal.fire("Error", error.message, "error");
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
    loadClaims();
  }, [loadClaims, navigate]);

  const filteredClaims = useMemo(() => {
    if (filter === "all") return claims;
    return claims.filter((claim) => claim.status === filter);
  }, [claims, filter]);

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
      setClaimAction({ status: "resolved", resolution: "approved", newDeliveryStatus: "", cancellationReason: "", deliveryCode: "" });
      loadClaims();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Reclamos</h2>
          <p className="text-sm text-gray-500">Gestiona solicitudes de demora, devolución, daños, incompletos y cancelaciones.</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700">
          <option value="pending">Pendientes</option>
          <option value="resolved">Resueltos</option>
          <option value="rejected">Rechazados</option>
          <option value="all">Todos</option>
        </select>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500">Cargando reclamos...</div>
        ) : filteredClaims.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">No hay reclamos para este filtro.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredClaims.map((claim) => (
              <div key={claim._id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">{CLAIM_LABELS[claim.category] || claim.category}</span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{STATUS_LABELS[claim.status] || claim.status}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-800">{claim.description}</p>
                  <p className="mt-1 font-mono text-xs text-gray-500">Pedido: {claim.delivery?._id || claim.delivery || "—"}</p>
                </div>
                <button onClick={() => setSelectedClaim(claim)} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700">
                  Gestionar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl text-gray-800 dark:text-gray-200">
            <h3 className="text-lg font-bold">Resolver reclamo</h3>
            <p className="mt-1 text-sm text-gray-500">Categoría: {CLAIM_LABELS[selectedClaim.category] || selectedClaim.category}</p>
            <form onSubmit={handleResolveClaim} className="mt-4 space-y-4">
              <select value={claimAction.status} onChange={(e) => setClaimAction({ ...claimAction, status: e.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2">
                <option value="resolved">Aprobar</option>
                <option value="rejected">Rechazar</option>
              </select>
              <input value={claimAction.resolution} onChange={(e) => setClaimAction({ ...claimAction, resolution: e.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="Observación para el cliente" />
              <select value={claimAction.newDeliveryStatus} onChange={(e) => setClaimAction({ ...claimAction, newDeliveryStatus: e.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2">
                <option value="">Sin cambio de estado</option>
                <option value="pending">Pendiente</option>
                <option value="ready_for_pickup">Listo para recojo</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
                <option value="returned">Devuelto</option>
              </select>
              <input value={claimAction.cancellationReason} onChange={(e) => setClaimAction({ ...claimAction, cancellationReason: e.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="Motivo de cancelación, si aplica" />
              <input value={claimAction.deliveryCode} onChange={(e) => setClaimAction({ ...claimAction, deliveryCode: e.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2" placeholder="Código de entrega, si aplica" />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSelectedClaim(null)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600">Cerrar</button>
                <button type="submit" disabled={isProcessing} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
