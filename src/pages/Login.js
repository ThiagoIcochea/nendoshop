import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 shadow w-80">
        <h2 className="text-xl mb-4 font-bold">Login</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Usuario"
          onChange={(e) => setUser(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          type="password"
          placeholder="Contraseña"
          onChange={(e) => setPass(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
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
  );
}