import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../components/ParticlesBackground";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import { clearPending2FAFlow, savePending2FAFlow } from "../utils/twoFactorFlow";

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const navigate = useNavigate()
  const { setAuth } = useContext(AuthContext);

 const handleLogin = async (e) => {
  e.preventDefault();
  clearPending2FAFlow();

  try {
    const res = await fetch("https://backendproyectodf.onrender.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        email: user,
        password: pass,
        loginContext: "user"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      if (data?.requiresPasswordReset) {
        setResetEmail(user.trim());
        setResetMode(true);
      }
      return Swal.fire("Error 503", data.message, "error");
    }

    if (data.twoFactorRequired) {
      savePending2FAFlow({ email: user, tempToken: data.tempToken, redirectTo: "/", requireAdmin: false, loginFlow: true });
      return navigate("/verify-2fa", { state: { email: user, tempToken: data.tempToken, redirectTo: "/", requireAdmin: false, loginFlow: true } });
    }

    if (!data.user) {
      return Swal.fire("Error","No se recibió información de usuario","error");
    }

    if (data.user.role === "user") {
      setAuth(data.user);
      navigate("/");
    } else if (data.user.role === "admin") {
      Swal.fire("Acceso restringido", "El acceso de administradores se realiza desde el panel dedicado.", "warning");
      navigate("/admin-access-panel");
    }
     

  } catch (error) {
    console.error(error);
    Swal.fire("Error 794","Error en login","error");
  }
};

 const handleForgotPassword = async (e) => {
  e.preventDefault();
  if (!resetEmail || !resetPassword) {
    return Swal.fire("Completa los campos", "Ingresa tu correo y una nueva contraseña.", "warning");
  }

  setResetLoading(true);

  try {
    const res = await fetch("https://backendproyectodf.onrender.com/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: resetEmail,
        newPassword: resetPassword
      })
    });

    const data = await res.json();
    setResetLoading(false);

    if (!res.ok) {
      return Swal.fire("Error", data.message || "No se pudo iniciar la recuperación", "error");
    }

    navigate("/verify-2fa", {
      state: {
        email: resetEmail,
        tempToken: data.tempToken,
        forgotPassword: true,
        newPassword: resetPassword,
        redirectTo: "/"
      }
    });
  } catch (error) {
    setResetLoading(false);
    Swal.fire("Error", "No se pudo completar la recuperación", "error");
  }
};

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

    
      <ParticlesBackground />

      
      <div className="relative z-10 animate__animated animate__zoomIn">

        <form
          onSubmit={handleLogin}
          className="bg-white p-6 shadow-lg w-80 rounded-xl"
        >
          <h2 className="text-xl mb-4 font-bold text-center">
            Login
          </h2>

          <input
            className="border p-2 w-full mb-3 rounded"
            placeholder="Usuario"
            onChange={(e) => setUser(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3 rounded"
            type="password"
            placeholder="Contraseña"
            onChange={(e) => setPass(e.target.value)}
          />

          <button
            type="submit"
           className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg transition hover:animate__animated hover:animate__pulse"
          >
            Entrar
          </button>

          <p className="text-sm mt-4 text-center">
            ¿No tienes una cuenta?{" "}
            <span
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => navigate("/register")}
            >
              Regístrate
            </span>
          </p>

          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-sm text-brand hover:underline"
              onClick={() => {
                setResetEmail(user);
                setShowResetModal(true);
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>

        {showResetModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900">Recuperar contraseña</h3>
              <p className="mt-2 text-sm text-gray-500">Ingresa tu correo y una nueva contraseña. Luego te pediremos la verificación en dos pasos.</p>
              <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
                <input
                  className="border p-2 w-full rounded"
                  placeholder="Correo para recuperar"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
                <input
                  type="password"
                  className="border p-2 w-full rounded"
                  placeholder="Nueva contraseña"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                />
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