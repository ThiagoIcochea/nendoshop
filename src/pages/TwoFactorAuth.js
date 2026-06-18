import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldAlert, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import ParticlesBackground from "../components/ParticlesBackground";
import Swal from "sweetalert2";

export default function TwoFactorAuth() {
  const [code, setCode] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  // Extract email and tempToken passed from the Login screen
  const email = location.state?.email || "";
  const tempToken = location.state?.tempToken || "";

  // Set up the resend cooldown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Focus the first input on initial render
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle single digit input
  const handleChange = (index, value) => {
    // Only allow single numeric digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Automatically focus next input if character is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle key navigation (Backspace)
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        // Clear previous field and move focus
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputRefs.current[index - 1].focus();
      } else {
        // Clear current field
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  // Handle pasting of full 6-digit code
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    
    // Check if pasted value is a 6-digit number
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split("");
      setCode(digits);
      // Focus the last input
      inputRefs.current[5].focus();
    } else {
      Swal.fire({
        icon: "warning",
        title: "Código inválido",
        text: "Por favor, pega un código numérico de 6 dígitos.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  // Resend code request
  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(60);

    try {
      const res = await fetch("https://backendproyectodf.onrender.com/api/auth/resend-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, tempToken }),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Código enviado",
          text: "Se ha enviado un nuevo código a tu correo.",
          confirmButtonColor: "#9333EA",
        });
      } else {
        const data = await res.json();
        Swal.fire("Error", data.message || "No se pudo reenviar el código", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Error al conectar con el servidor", "error");
    }
  };

  // Submit and verify code
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const fullCode = code.join("");

    if (fullCode.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Incompleto",
        text: "Por favor ingresa los 6 dígitos.",
        confirmButtonColor: "#9333EA",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://backendproyectodf.onrender.com/api/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          tempToken,
          code: fullCode,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        // Clear code fields on error to let user re-try
        setCode(Array(6).fill(""));
        inputRefs.current[0].focus();
        return Swal.fire("Error de verificación", data.message || "Código incorrecto", "error");
      }

      // Success! Update auth state and navigate to main page
      Swal.fire({
        icon: "success",
        title: "¡Verificación Exitosa!",
        text: "Iniciando sesión...",
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => {
        setAuth(data.user);
        navigate("/");
      }, 1500);

    } catch (error) {
      setLoading(false);
      console.error(error);
      Swal.fire("Error", "Error al procesar la verificación", "error");
    }
  };

  // Automatically trigger submit when the last digit is typed and all slots are filled
  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit();
    }
  }, [code]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50">
      {/* Background Particles */}
      <ParticlesBackground />

      <div className="relative z-10 w-full max-w-md px-4 animate__animated animate__fadeInUp">
        {/* Glassmorphism Card */}
        <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl border border-white/20 p-8">
          
          {/* Back Button */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center text-sm text-gray-500 hover:text-brand transition mb-6 group"
          >
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Volver al login
          </button>

          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-brand-light/10 text-brand mb-4 animate-bounce">
              <ShieldAlert size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Verificación de 2 Factores</h2>
            <p className="text-sm text-gray-600 mt-2">
              Ingresa el código de 6 dígitos enviado a tu correo registrado:
            </p>
            {email && (
              <span className="inline-block mt-1 font-semibold text-brand text-sm bg-brand/5 px-3 py-1 rounded-full">
                {email.replace(/(.{3})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + "*".repeat(gp3.length))}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Slots */}
            <div className="flex justify-between gap-2">
              {code.map((value, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-2xl font-bold text-gray-800 border-2 border-gray-200 rounded-xl focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all shadow-sm"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-brand hover:bg-brand-dark text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 group ${
                loading ? "opacity-75 cursor-not-allowed" : "hover:animate__animated hover:animate__pulse"
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Verificar Código</span>
                </>
              )}
            </button>

            {/* Resend Cooldown */}
            <div className="text-center pt-2">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className="inline-flex items-center text-sm font-semibold text-brand hover:text-brand-dark hover:underline gap-1 transition"
                >
                  <RefreshCw size={14} />
                  Reenviar código de seguridad
                </button>
              ) : (
                <p className="text-xs text-gray-500">
                  ¿No recibiste el código? Reenviar en{" "}
                  <span className="font-bold text-brand">{resendTimer}s</span>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
