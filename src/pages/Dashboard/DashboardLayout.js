import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function DashboardLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));

    if (!auth) navigate("/login");
    if (auth?.role !== "admin") navigate("/");
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">

      <div className="py-6 pl-4">
        <aside className="w-64 bg-white border border-gray-200 shadow-md rounded-2xl h-[calc(100vh-3rem)] overflow-hidden flex flex-col">

          <div className="h-16 flex items-center px-5 font-bold text-purple-700 border-b border-gray-100">
            Admin Panel
          </div>

          <nav className="flex flex-col gap-2 p-3 flex-1 overflow-y-auto">
            <NavLink
              to="/dashboard/payments"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition ${
                  isActive ? "bg-purple-100 text-purple-700 font-medium" : ""
                }`
              }
            >
              Pagos
            </NavLink>

            <NavLink
              to="/dashboard/clients"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition ${
                  isActive ? "bg-purple-100 text-purple-700 font-medium" : ""
                }`
              }
            >
              Clientes
            </NavLink>

            <NavLink
              to="/dashboard/products"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition ${
                  isActive ? "bg-purple-100 text-purple-700 font-medium" : ""
                }`
              }
            >
              Productos
            </NavLink>
          </nav>

        </aside>
      </div>

      <div className="flex-1">
        <main className="p-6 min-h-[calc(100vh-120px)]">
          <Outlet />
        </main>
      </div>

    </div>
  );
}