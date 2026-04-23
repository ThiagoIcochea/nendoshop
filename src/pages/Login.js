import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (user === "admin" && pass === "admin123") {
      localStorage.setItem("auth", "true");

      alert("Bienvenido, login correcto");

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
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
  className="text-white bg-blue-500 hover:bg-blue-600 text-sm px-4 py-2 rounded"
>
  Entrar
</button>
      </form>
    </div>
  );
}