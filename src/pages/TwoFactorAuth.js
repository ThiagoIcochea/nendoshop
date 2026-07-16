import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShieldAlert,
  ArrowLeft,
  Mail,
  Smartphone,
  Phone,
  MessageCircle
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import ParticlesBackground from "../components/ParticlesBackground";
import Swal from "sweetalert2";
import {
  clearPending2FAFlow,
  getTwoFactorSuccessTarget,
  readPending2FAFlow,
} from "../utils/twoFactorFlow";
import { BACKEND_URL } from "../utils/config";
import { ROUTES } from "../utils/secureRoutes";

export default function TwoFactorAuth() {
  const [code, setCode] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState("email");

  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  const email = location.state?.email || readPending2FAFlow()?.email || "";
  const tempToken = location.state?.tempToken || readPending2FAFlow()?.tempToken || "";
  const redirectTo = location.state?.redirectTo || readPending2FAFlow()?.redirectTo || "/";
  const requireAdmin = Boolean(location.state?.requireAdmin || readPending2FAFlow()?.requireAdmin || false);
  const pendingRegistration = location.state?.pendingRegistration || readPending2FAFlow()?.pendingRegistration || null;
  const pendingPasswordChange = location.state?.pendingPasswordChange || readPending2FAFlow()?.pendingPasswordChange || null;
  const forgotPassword = Boolean(location.state?.forgotPassword || readPending2FAFlow()?.forgotPassword || false);
  const newPassword = location.state?.newPassword || readPending2FAFlow()?.newPassword || "";
  const forceEmailOnly = Boolean(location.state?.forceEmailOnly || readPending2FAFlow()?.forceEmailOnly || false);
  const pendingProfileUpdate = location.state?.pendingProfileUpdate || readPending2FAFlow()?.pendingProfileUpdate || null;
  const loginFlow = Boolean(location.state?.loginFlow || readPending2FAFlow()?.loginFlow || false);

  useEffect(() => {
    if (!email || !tempToken) {
      navigate(ROUTES.login);
    }
  }, [email, tempToken, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (forceEmailOnly) {
      setVerificationMethod("email");
    }
  }, [forceEmailOnly]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputRefs.current[index - 1].focus();
      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(60);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/resend-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          tempToken,
          method: verificationMethod,
          pendingRegistration,
          pendingPasswordChange,
          pendingProfileUpdate,
          forgotPassword,
          newPassword,
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Código enviado",
          text: "Se ha enviado un nuevo código.",
        });
      } else {
        const data = await res.json();
        Swal.fire("Error", data.message || "No se pudo reenviar el código", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error al conectar con el servidor", "error");
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const fullCode = code.join("");

    if (fullCode.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Incompleto",
        text: "Ingresa los 6 dígitos.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          tempToken,
          code: fullCode,
          method: verificationMethod,
          pendingRegistration,
          forgotPassword,
          newPassword,
          pendingPasswordChange,
          pendingProfileUpdate
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setCode(Array(6).fill(""));
        inputRefs.current[0].focus();
        return Swal.fire("Error", data.message || "Código incorrecto", "error");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      clearPending2FAFlow();

      const isPasswordFlow = Boolean(pendingPasswordChange || forgotPassword);
      const isProfileFlow = Boolean(pendingProfileUpdate);
      const shouldAutoLogin = Boolean(loginFlow || pendingRegistration || forgotPassword);
      const targetPath = getTwoFactorSuccessTarget({
        redirectTo,
        pendingPasswordChange,
        forgotPassword,
        pendingProfileUpdate,
        user: data.user,
        requireAdmin,
      });

      Swal.fire({
        icon: "success",
        title: isPasswordFlow ? "Contraseña actualizada" : isProfileFlow ? "Perfil actualizado" : shouldAutoLogin ? "Inicio de sesión completado" : "Verificación Exitosa",
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => {
        if (data.user) {
          setAuth(data.user);
        }

        if (isPasswordFlow) {
          return navigate(targetPath);
        }

        if (requireAdmin && data.user?.role !== "admin") {
          Swal.fire("Permisos Insuficientes", "Acceso denegado", "error");
          return navigate(ROUTES.login);
        }

        navigate(targetPath);
      }, 1500);
    } catch (error) {
      setLoading(false);
      Swal.fire("Error", "Error al procesar la verificación", "error");
    }
  };

  useEffect(() => {
    if (code.every((d) => d !== "")) {
      handleSubmit();
    }
  }, [code]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 overflow-hidden transition-colors duration-300">
      <ParticlesBackground density={30} speed={0.3} />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-2xl rounded-2xl border border-purple-100 dark:border-gray-800 p-5 sm:p-8 text-gray-800 dark:text-gray-100 transition-colors duration-300">

          <button
            onClick={() => navigate(ROUTES.login)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-brand dark:hover:text-purple-400 transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Volver
          </button>

          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-brand text-white mb-4 shadow-md shadow-purple-200 dark:shadow-none">
              <ShieldAlert size={30} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verificación de 2 Factores</h2>

            {forceEmailOnly ? (
              <div className="mt-4 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50 dark:bg-purple-950/20 p-3 text-sm text-purple-700 dark:text-purple-300">
                <div className="flex items-center gap-2 font-medium">
                  <Mail size={16} /> Verificación por correo
                </div>
                <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">Este paso del registro solo admite el envío del código por correo electrónico.</p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVerificationMethod("email")}
                  className={`p-2 border rounded-xl flex items-center gap-2 transition-all ${
                    verificationMethod === "email"
                      ? "border-brand bg-purple-50 dark:bg-purple-950/40 text-brand dark:text-purple-300 font-semibold shadow-sm"
                      : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Mail size={16} /> Correo
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationMethod("sms")}
                  className={`p-2 border rounded-xl flex items-center gap-2 transition-all ${
                    verificationMethod === "sms"
                      ? "border-brand bg-purple-50 dark:bg-purple-950/40 text-brand dark:text-purple-300 font-semibold shadow-sm"
                      : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Smartphone size={16} /> SMS
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationMethod("call")}
                  className={`p-2 border rounded-xl flex items-center gap-2 transition-all ${
                    verificationMethod === "call"
                      ? "border-brand bg-purple-50 dark:bg-purple-950/40 text-brand dark:text-purple-300 font-semibold shadow-sm"
                      : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Phone size={16} /> Llamada
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationMethod("whatsapp")}
                  className={`p-2 border rounded-xl flex items-center gap-2 transition-all ${
                    verificationMethod === "whatsapp"
                      ? "border-brand bg-purple-50 dark:bg-purple-950/40 text-brand dark:text-purple-300 font-semibold shadow-sm"
                      : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <MessageCircle size={16} /> WhatsApp
                </button>
              </div>
            )}

            <p className="text-sm mt-3 text-gray-500 dark:text-gray-400">
              Código enviado por <span className="font-semibold text-brand dark:text-purple-400">{verificationMethod}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-1.5 sm:gap-2">
              {code.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  maxLength={1}
                  value={v}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-full max-w-[3rem] h-12 sm:h-14 text-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark dark:bg-purple-600 dark:hover:bg-purple-700 text-white p-3 rounded-xl font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Verificar"}
            </button>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-brand dark:text-purple-400 font-semibold hover:underline animate-pulse"
                >
                  Reenviar código
                </button>
              ) : (
                <span>Reenviar en <span className="font-semibold text-gray-800 dark:text-gray-200">{resendTimer}s</span></span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
