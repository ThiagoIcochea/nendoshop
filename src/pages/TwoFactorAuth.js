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
import { clearPending2FAFlow, readPending2FAFlow } from "../utils/twoFactorFlow";

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
      navigate("/login");
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
      const res = await fetch("https://backendproyectodf.onrender.com/api/auth/resend-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, tempToken, method: verificationMethod }),
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
      const res = await fetch("https://backendproyectodf.onrender.com/api/auth/verify-2fa", {
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

      clearPending2FAFlow();

      const isPasswordFlow = Boolean(pendingPasswordChange || forgotPassword);
      const isProfileFlow = Boolean(pendingProfileUpdate);
      const targetPath = redirectTo || (data.user?.role === "admin" ? "/admin-access-panel" : isPasswordFlow ? "/login" : isProfileFlow ? "/profile" : "/");

      Swal.fire({
        icon: "success",
        title: isPasswordFlow ? "Contraseña actualizada" : isProfileFlow ? "Perfil actualizado" : "Verificación Exitosa",
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => {
        if (isPasswordFlow) {
          return navigate(targetPath);
        }

        if (loginFlow && data.user) {
          setAuth(data.user);
          return navigate(targetPath);
        }

        setAuth(data.user);
        if (requireAdmin && data.user?.role !== "admin") {
          Swal.fire("Permisos Insuficientes", "Acceso denegado", "error");
          return navigate("/login");
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
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
      <ParticlesBackground density={30} speed={0.3} />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl border p-8">

          <button onClick={() => navigate("/login")} className="flex items-center text-sm mb-6">
            <ArrowLeft size={16} /> Volver
          </button>

          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-brand text-white mb-4">
              <ShieldAlert size={30} />
            </div>

            <h2 className="text-2xl font-bold">Verificación de 2 Factores</h2>

            {forceEmailOnly ? (
              <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50 p-3 text-sm text-purple-700">
                <div className="flex items-center gap-2 font-medium">
                  <Mail size={16} /> Verificación por correo
                </div>
                <p className="mt-1 text-xs text-purple-600">Este paso del registro solo admite el envío del código por correo electrónico.</p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button onClick={() => setVerificationMethod("email")} className="p-2 border rounded-xl flex items-center gap-2">
                  <Mail size={16} /> Correo
                </button>
                <button onClick={() => setVerificationMethod("sms")} className="p-2 border rounded-xl flex items-center gap-2">
                  <Smartphone size={16} /> SMS
                </button>
                <button onClick={() => setVerificationMethod("call")} className="p-2 border rounded-xl flex items-center gap-2">
                  <Phone size={16} /> Llamada
                </button>
                <button onClick={() => setVerificationMethod("whatsapp")} className="p-2 border rounded-xl flex items-center gap-2">
                  <MessageCircle size={16} /> WhatsApp
                </button>
              </div>
            )}

            <p className="text-sm mt-3 text-gray-600">
              Código enviado por {verificationMethod}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2">
              {code.map((v, i) => (
                <input key={i} ref={(el) => (inputRefs.current[i] = el)} maxLength={1} value={v}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center border rounded-xl" />
              ))}
            </div>

            <button type="submit" className="w-full bg-brand text-white p-3 rounded-xl">
              {loading ? "Cargando..." : "Verificar"}
            </button>

            <div className="text-center text-sm">
              {canResend ? (
                <button type="button" onClick={handleResend} className="text-brand">
                  Reenviar código
                </button>
              ) : (
                <span>Reenviar en {resendTimer}s</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
