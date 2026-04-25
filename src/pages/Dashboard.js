
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();



  const logout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>

      <p className="mt-2">Panel de administración</p>

      <button
        onClick={logout}
        className="mt-4 bg-red-500 text-white p-2 rounded"
      >
        Cerrar sesión
      </button>
    </div>
  );
}