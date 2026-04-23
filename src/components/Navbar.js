import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const auth = localStorage.getItem("auth");

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between">
      <h1 className="font-bold">Nendoshop</h1>

      <div className="space-x-4">
        <Link to="/">Inicio</Link>
        <Link to="/about">Nosotros</Link>
        <Link to="/catalog">Catálogo</Link>

        {!auth ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registro</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={handleLogout} className="ml-2">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}