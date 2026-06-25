import { useEffect, useMemo, useState } from "react";
import { Filter, Search, ShieldAlert, Unlock, Download } from "lucide-react";
import Swal from "sweetalert2";

export default function SecurityLogs() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  const loadData = async () => {
    const [usersRes, logsRes] = await Promise.all([
      fetch("https://backendproyectodf.onrender.com/api/admin/clients", { credentials: "include" }),
      fetch("https://backendproyectodf.onrender.com/api/admin/logs", { credentials: "include" })
    ]);

    const [usersData, logsData] = await Promise.all([usersRes.json(), logsRes.json()]);
    setUsers(Array.isArray(usersData) ? usersData.filter((user) => user.role !== "admin") : []);
    setLogs(Array.isArray(logsData) ? logsData : []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = `${log.usuario || ""} ${log.descripcion || ""}`.toLowerCase().includes(search.toLowerCase());
      const matchesType = type === "all" ? true : log.tipo === type;
      return matchesSearch && matchesType;
    });
  }, [logs, search, type]);

  const toggleBlock = async (user) => {
    const blocked = !user.chatBlockedUntil || new Date(user.chatBlockedUntil) <= new Date();
    const result = await Swal.fire({
      title: blocked ? "Bloquear usuario" : "Desbloquear usuario",
      input: "text",
      inputLabel: "Motivo",
      inputValue: user.chatBlockReason || "",
      showCancelButton: true,
      confirmButtonText: blocked ? "Bloquear" : "Desbloquear"
    });

    if (result.isDismissed || result.isDenied) return;

    const reason = result.value ?? "Sin motivo";

    const res = await fetch(`https://backendproyectodf.onrender.com/api/admin/clients/${user._id}/block`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ blocked, reason })
    });

    if (res.ok) {
      await loadData();
      Swal.fire("Listo", blocked ? "Usuario bloqueado" : "Usuario desbloqueado", "success");
    } else {
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
  };

  const blockedUsers = users.filter((user) => user.chatBlockedUntil && new Date(user.chatBlockedUntil) > new Date());

  const exportLogs = () => {
    const content = filteredLogs.map((log) => {
      const ip = log.ip || log.ipAddress || "unknown";
      const ua = log.userAgent || log.user_agent || "unknown";
      return `[${new Date(log.createdAt).toLocaleString("es-ES")}] ${log.tipo} | ${log.usuario} | ${log.descripcion} | ${log.metodo} ${log.ruta} | IP: ${ip} | User-Agent: ${ua}`;
    }).join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "logs-seguridad.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Usuarios bloqueados</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">{blockedUsers.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total de registros</p>
          <p className="mt-2 text-3xl font-semibold text-purple-600">{logs.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Reportes acumulados</p>
          <p className="mt-2 text-3xl font-semibold text-red-600">{users.filter((user) => (user.chatReportCount || 0) >= 10).length}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Lista negra y logs</h2>
            <p className="text-sm text-gray-500">Gestiona bloqueos y revisa registros del sistema.</p>
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar usuario o acción" className="w-full bg-transparent outline-none" />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-transparent outline-none">
              <option value="all">Todos</option>
              <option value="AUTH">Autenticación</option>
              <option value="SISTEMA">Sistema</option>
              <option value="TRANSACCION">Transacción</option>
              <option value="ERROR">Errores</option>
            </select>
          </label>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button onClick={exportLogs} className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm text-white">
            <Download className="h-4 w-4" />
            Exportar logs .txt
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <div className="bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">Usuarios bloqueados</div>
            <div className="divide-y divide-gray-100">
              {blockedUsers.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No hay usuarios bloqueados.</div>
              ) : blockedUsers.map((user) => (
                <div key={user._id} className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{user.name || user.email}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-sm text-red-500">Motivo: {user.chatBlockReason || "Sin motivo"}</p>
                  </div>
                  <button onClick={() => toggleBlock(user)} className="flex items-center gap-2 rounded-lg border border-green-200 px-3 py-2 text-sm text-green-600">
                    <Unlock className="h-4 w-4" />
                    Desbloquear
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <div className="bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">Registros recientes</div>
            <div className="max-h-[420px] overflow-auto divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <div key={log._id} className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <ShieldAlert className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">{log.usuario}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase text-gray-500">{log.tipo}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{log.descripcion}</p>
                  <p className="mt-1 text-xs text-gray-400">{log.metodo} {log.ruta} · {new Date(log.createdAt).toLocaleString("es-ES")}</p>
                  <p className="mt-1 text-xs text-gray-400 break-all">IP: {log.ip || log.ipAddress || "unknown"}</p>
                  <p className="mt-1 text-xs text-gray-400 break-all">User-Agent: {log.userAgent || log.user_agent || "unknown"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
