import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Shield, ScrollText } from "lucide-react";
import { buildSalesMetrics } from "../../utils/dashboardMetrics";

export default function AdminOverview() {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [paymentsRes, clientsRes, logsRes] = await Promise.all([
          fetch("https://backendproyectodf.onrender.com/api/admin/payments", { credentials: "include" }),
          fetch("https://backendproyectodf.onrender.com/api/admin/clients", { credentials: "include" }),
          fetch("https://backendproyectodf.onrender.com/api/admin/logs", { credentials: "include" })
        ]);

        const [paymentsData, clientsData, logsData] = await Promise.all([
          paymentsRes.json(),
          clientsRes.json(),
          logsRes.json()
        ]);

        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
        setClients(Array.isArray(clientsData) ? clientsData.filter((client) => client.role !== "admin") : []);
        setLogs(Array.isArray(logsData) ? logsData : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const metrics = useMemo(() => buildSalesMetrics(payments), [payments]);

  const stateSeries = Object.entries(metrics.stateMap).map(([name, count]) => ({ name, count }));
  const productSeries = Object.entries(metrics.productMap).map(([name, count]) => ({ name, count }));
  const blockedUsers = clients.filter((client) => client.chatBlockedUntil && new Date(client.chatBlockedUntil) > new Date());

  const recentLogs = logs.slice(0, 6);

  if (loading) {
    return <div className="rounded-2xl bg-white p-6 text-sm text-gray-500">Cargando resumen...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Ventas totales</p>
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-emerald-600">S/ {metrics.totals.sales.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Usuarios registrados</p>
            <Shield className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-blue-600">{clients.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Usuarios bloqueados</p>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-amber-600">{blockedUsers.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Estados de pagos</h3>
          <div className="h-48 rounded-2xl border border-gray-100 bg-gray-50 p-3">
            <svg viewBox="0 0 300 160" className="h-full w-full">
              {stateSeries.map((entry, index) => {
                const height = Math.max(18, (entry.count / Math.max(payments.length, 1)) * 120);
                const x = 30 + index * 70;
                const y = 140 - height;
                return (
                  <g key={entry.name}>
                    <rect x={x} y={y} width="36" height={height} rx="6" fill={index % 2 === 0 ? "#8b5cf6" : "#4f46e5"} />
                    <text x={x + 18} y="155" textAnchor="middle" fontSize="10" fill="#6b7280">{entry.name}</text>
                    <text x={x + 18} y={y - 6} textAnchor="middle" fontSize="10" fill="#111827">{entry.count}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Productos más frecuentes</h3>
          <div className="h-48 rounded-2xl border border-gray-100 bg-gray-50 p-3">
            <svg viewBox="0 0 300 160" className="h-full w-full">
              {productSeries.map((entry, index) => {
                const height = Math.max(18, (entry.count / Math.max(payments.length, 1)) * 120);
                const x = 30 + index * 70;
                const y = 140 - height;
                return (
                  <g key={entry.name}>
                    <rect x={x} y={y} width="36" height={height} rx="6" fill={index % 2 === 0 ? "#06b6d4" : "#0f766e"} />
                    <text x={x + 18} y="155" textAnchor="middle" fontSize="10" fill="#6b7280">{entry.name.slice(0, 7)}</text>
                    <text x={x + 18} y={y - 6} textAnchor="middle" fontSize="10" fill="#111827">{entry.count}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Últimos registros del sistema</h3>
        </div>
        <div className="space-y-3">
          {recentLogs.map((log) => (
            <div key={log._id} className="flex flex-col gap-1 rounded-xl border border-gray-100 p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">{log.descripcion}</p>
                <p className="text-xs text-gray-500">{log.usuario} · {log.metodo} {log.ruta}</p>
              </div>
              <div className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString("es-ES")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
