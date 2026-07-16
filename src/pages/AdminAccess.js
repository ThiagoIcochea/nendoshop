import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../components/ParticlesBackground";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import logo from "../components/Assets/logo.png";
import { BACKEND_URL } from "../utils/config";
import { clearPending2FAFlow, savePending2FAFlow } from "../utils/twoFactorFlow";
import { ROUTES } from "../utils/secureRoutes";

export default function AdminAccess() {

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();

  const { setAuth } = useContext(AuthContext);

  const handleLogin = async (e) => {

    e.preventDefault();
    clearPending2FAFlow();

    try {

      const res = await fetch(
        `${BACKEND_URL}/api/auth/login`,
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
        savePending2FAFlow({
          email: user,
          tempToken: data.tempToken,
          redirectTo: ROUTES.dashboard,
          requireAdmin: true,
          loginFlow: true
        });
        return navigate(ROUTES.verify2fa, {
          state: {
            email: user,
            tempToken: data.tempToken,
            redirectTo: ROUTES.dashboard,
            requireAdmin: true,
            loginFlow: true
          }
        });
      }

      if (!data.user) {
        return Swal.fire("Error","No se recibió información de usuario","error");
      }

      if (data.user.role !== "admin") {
        return Swal.fire("Permisos Insuficientes","Acceso denegado","error");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setAuth(data.user);
      navigate(ROUTES.dashboard);

    } catch (error) {

      console.error(error);

      alert("Error en login");

    }

  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetPassword) {
      return Swal.fire("Completa los campos", "Ingresa el correo administrador y una nueva contrasena.", "warning");
    }

    setResetLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: resetEmail, newPassword: resetPassword })
      });
      const data = await res.json();
      setResetLoading(false);

      if (!res.ok) {
        return Swal.fire("Error", data.message || "No se pudo iniciar la recuperacion", "error");
      }

      savePending2FAFlow({
        email: resetEmail.trim().toLowerCase(),
        tempToken: data.tempToken,
        forgotPassword: true,
        loginFlow: true,
        newPassword: resetPassword,
        redirectTo: ROUTES.dashboard,
        requireAdmin: true,
        pendingPasswordChange: {
          email: resetEmail.trim().toLowerCase(),
          newPassword: resetPassword
        }
      });

      navigate(ROUTES.verify2fa, {
        state: {
          email: resetEmail.trim().toLowerCase(),
          tempToken: data.tempToken,
          forgotPassword: true,
          newPassword: resetPassword,
          redirectTo: ROUTES.dashboard,
          requireAdmin: true,
          pendingPasswordChange: {
            email: resetEmail.trim().toLowerCase(),
            newPassword: resetPassword
          }
        }
      });
    } catch (error) {
      setResetLoading(false);
      Swal.fire("Error", "No se pudo completar la recuperacion", "error");
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
            onClick={() => {
              setResetEmail(user);
              setShowResetModal(true);
            }}
            className="w-full mt-3 text-sm text-brand hover:underline"
          >
            Olvidaste tu contrasena de administrador?
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full mt-3 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
          >
            Volver al inicio
          </button>

        </form>

        {showResetModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900">Recuperar acceso admin</h3>
              <p className="mt-2 text-sm text-gray-500">Este flujo solo acepta cuentas administrador y envia verificacion en dos pasos.</p>
              <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
                <input className="w-full rounded-xl border border-gray-300 p-3" placeholder="Correo administrador" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                <input type="password" className="w-full rounded-xl border border-gray-300 p-3" placeholder="Nueva contrasena" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowResetModal(false)} className="rounded-lg border px-3 py-2 text-sm">Cancelar</button>
                  <button type="submit" className="rounded-lg bg-brand px-3 py-2 text-sm text-white" disabled={resetLoading}>
                    {resetLoading ? "Enviando..." : "Recuperar acceso"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

    </div>

  );
}
