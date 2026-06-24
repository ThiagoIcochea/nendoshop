import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../components/ParticlesBackground";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import logo from "../components/Assets/logo.png";

export default function AdminAccess() {

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const navigate = useNavigate();

  const { setAuth } = useContext(AuthContext);

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await fetch(
        "https://backendproyectodf.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            email: user,
            password: pass,
            loginContext: "admin"
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return Swal.fire("Error 503", data.message, "error");
      }

      if (data.twoFactorRequired) {
        return navigate("/verify-2fa", {
          state: {
            email: user,
            tempToken: data.tempToken,
            redirectTo: "/dashboard",
            requireAdmin: true
          }
        });
      }

      if (!data.user) {
        return Swal.fire("Error","No se recibió información de usuario","error");
      }

      if (data.user.role !== "admin") {
        return Swal.fire("Permisos Insuficientes","Acceso denegado","error");
      }

      setAuth(data.user);
      navigate("/dashboard");

    } catch (error) {

      console.error(error);

      alert("Error en login");

    }

  };

  return (

    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-100">

      <ParticlesBackground />

      <div className="relative z-10 animate__animated animate__fadeInDown">

        <form
          onSubmit={handleLogin}
          className="bg-white w-[92vw] sm:w-[420px] rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200"
        >

          <div className="flex flex-col items-center mb-6">

            <img
              src={logo}
              alt="Admin Logo"
              className="w-20 h-20 object-contain mb-3"
            />

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Admin Access
            </h1>

            <p className="text-gray-500 text-sm mt-2 text-center">
              Panel privado de administración
            </p>

          </div>

          <div className="space-y-4">

            <input
              type="email"
              placeholder="Correo administrador"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand"
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand"
            />

          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-xl transition animate__animated hover:animate__pulse"
          >
            Ingresar
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full mt-3 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
          >
            Volver al inicio
          </button>

        </form>

      </div>

    </div>

  );
}