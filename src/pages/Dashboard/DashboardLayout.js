import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/secureRoutes";

export default function DashboardLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));

    if (!auth) navigate(ROUTES.login);
    if (auth?.role !== "admin") navigate("/");
  }, []);

  const links = [
    { to: ROUTES.dashboardOverview, label: "Resumen" },
    { to: ROUTES.dashboardPayments, label: "Pagos" },
    { to: ROUTES.dashboardClients, label: "Clientes" },
    { to: ROUTES.dashboardProducts, label: "Productos" },
    { to: ROUTES.dashboardSecurity, label: "Seguridad y logs" },
    { to: ROUTES.dashboardDeliveries, label: "Entregas" },
    { to: ROUTES.dashboardClaims, label: "Reclamos" }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 px-4 py-4 shadow-sm backdrop-blur md:px-6 transition-colors">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-purple-700 dark:text-purple-400">Panel administrativo</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Estadísticas, moderación y auditoría en tiempo real.</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/40"}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <main className="p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
