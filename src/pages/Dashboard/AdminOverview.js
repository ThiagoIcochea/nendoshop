import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Shield, ScrollText, Sparkles } from "lucide-react";
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
  const aiInsights = useMemo(() => {
    const totalSales = Number(metrics.totals.sales || 0);
    const averageTicket = payments.length ? totalSales / payments.length : 0;
    const blockedUsers = clients.filter((client) => client.chatBlockedUntil && new Date(client.chatBlockedUntil) > new Date()).length;
    const errorCount = logs.filter((log) => log.tipo === "ERROR").length;
    const authEvents = logs.filter((log) => log.tipo === "AUTH").length;

    const recommendations = [
      {
        title: "Impulsa promociones de alto margen",
        text: averageTicket > 80 ? "El ticket promedio es sólido; aprovecha descuentos selectivos para subir conversiones." : "El ticket promedio está por debajo del ideal; prueba promociones de producto y bundles."
      },
      {
        title: "Revisa el flujo de pagos",
        text: errorCount > 0 ? `Hay ${errorCount} eventos de error recientes; prioriza el checkout para reducir abandono.` : "El checkout se ha mantenido estable; conserva la experiencia actual."
      },
      {
        title: "Fortalece seguridad",
        text: blockedUsers > 0 || authEvents > 4 ? "Los patrones de seguridad sugieren revisar accesos sospechosos y reforzar alertas." : "La actividad de seguridad se ve saludable; mantén el monitoreo activo."
      }
    ];

    const forecastSales = totalSales * (1 + (payments.length > 0 ? 0.08 : 0.03));
    const forecastLabel = forecastSales > totalSales ? "Alza esperada" : "Estabilidad";

    return {
      recommendations,
      forecastSales,
      forecastLabel,
      healthScore: Math.min(100, 70 + (averageTicket > 70 ? 12 : 0) + (errorCount === 0 ? 10 : 0) + (blockedUsers === 0 ? 8 : 0))
    };
  }, [clients, logs, metrics.totals.sales, payments.length]);

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

      <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-700 via-violet-700 to-indigo-700 p-5 text-white shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-purple-100">
              <Sparkles className="h-4 w-4" />
              Asistente IA para tu negocio
            </div>
            <h3 className="mt-2 text-xl font-semibold">Sugerencias y predicción accionable</h3>
            <p className="mt-2 max-w-2xl text-sm text-purple-100">Estas recomendaciones se construyen con tus ventas, actividad y registros del panel para ayudarte a priorizar acciones.</p>
          </div>
          <div className="rounded-2xl bg-white/15 px-3 py-2 text-sm backdrop-blur">
            Salud operativa: {aiInsights.healthScore}/100
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <h4 className="text-sm font-semibold">Acciones recomendadas</h4>
            <ul className="mt-3 space-y-2 text-sm text-purple-50">
              {aiInsights.recommendations.map((item) => (
                <li key={item.title} className="rounded-xl border border-white/10 bg-white/10 p-3">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-purple-100">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <h4 className="text-sm font-semibold">Pronóstico</h4>
            <p className="mt-3 text-3xl font-semibold">S/ {aiInsights.forecastSales.toFixed(2)}</p>
            <p className="mt-2 text-sm text-purple-100">Estimación de ventas para las próximas 4 semanas</p>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/10 p-3 text-sm text-purple-50">
              <p className="font-medium">{aiInsights.forecastLabel}</p>
              <p className="mt-1 text-xs text-purple-100">Basado en ventas actuales, ticket promedio y actividad de seguridad.</p>
            </div>
          </div>
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
