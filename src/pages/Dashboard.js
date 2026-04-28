import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const auth = localStorage.getItem("auth");

  const logout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold">
        Dashboard Admin
      </h1>

      <p className="mt-2 mb-6">
        Panel de administración
      </p>

      {auth === "admin" && (
        <div className="mb-6">

          <button
            onClick={() => navigate("/api-comentarios")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            API Comentarios
          </button>

        </div>
      )}

      <button
        onClick={logout}
        className="bg-red-500 text-white p-2 rounded"
      >
        Cerrar sesión
      </button>

    </div>
  );
}