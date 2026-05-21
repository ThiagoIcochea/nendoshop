import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function DashboardLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));

    if (!auth) navigate("/login");
    if (auth?.role !== "admin") navigate("/");
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}