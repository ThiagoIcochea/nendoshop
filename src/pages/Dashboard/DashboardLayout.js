import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function DashboardLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));

    if (!auth) navigate("/login");
    if (auth?.role !== "admin") navigate("/");
  }, []);

  const links = [
    { to: "/dashboard/overview", label: "Resumen" },
    { to: "/dashboard/payments", label: "Pagos" },
    { to: "/dashboard/clients", label: "Clientes" },
    { to: "/dashboard/products", label: "Productos" },
    { to: "/dashboard/security", label: "Seguridad y logs" }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="border-b border-gray-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur md:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-purple-700">Panel administrativo</h1>
            <p className="text-sm text-gray-500">Estadísticas, moderación y auditoría en tiempo real.</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-purple-100"}`}
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