import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../components/ParticlesBackground";

export default function Register() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    if (!user || !pass) {
      alert("Completa todos los campos");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.find((u) => u.user === user);
    if (exists) {
      alert("El usuario ya existe");
      return;
    }

    const newUser = { user, pass };
    users.push(newUser);

    localStorage.setItem("users", JSON.stringify(users));

    navigate("/login");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      
      <ParticlesBackground />

     
      <div className="relative z-10">

        <form
          onSubmit={handleRegister}
          className="bg-white p-6 shadow-lg w-80 rounded-xl"
        >
          <h2 className="text-xl mb-4 font-bold text-center">
            Registro
          </h2>

          <input
            className="border p-2 w-full mb-3 rounded"
            placeholder="Usuario"
            onChange={(e) => setUser(e.target.value)}
          />

          <input
            type="password"
            className="border p-2 w-full mb-3 rounded"
            placeholder="Contraseña"
            onChange={(e) => setPass(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg transition"
          >
            Registrarse
          </button>

          <p className="text-sm mt-4 text-center">
            ¿Ya tienes cuenta?{" "}
            <span
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Inicia sesión
            </span>
          </p>
        </form>

      </div>
    </div>
  );
}
