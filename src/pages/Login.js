import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../components/ParticlesBackground";

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (user === "admin" && pass === "admin123") {
      localStorage.setItem("auth", "admin");
      navigate("/dashboard");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const found = users.find(
      (u) => u.user === user && u.pass === pass
    );

    if (found) {
      localStorage.setItem("auth", user);
      navigate("/dashboard");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

    
      <ParticlesBackground />

      
      <div className="relative z-10">

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
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg transition"
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
        </form>

      </div>
    </div>
  );
}