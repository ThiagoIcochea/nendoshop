import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../components/ParticlesBackground";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate()
  const { setAuth } = useContext(AuthContext);

 const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("https://backendproyectodf.onrender.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        email: user,
        password: pass
      })
    });

    const data = await res.json();

    if (!res.ok) {
      
      return Swal.fire("Error 503",data.message,"error");
    }

    

    if (data.twoFactorRequired) {
      return navigate("/verify-2fa", { state: { email: user, tempToken: data.tempToken } });
    }

    if (data.user && data.user.role === "user") {
        setAuth(data.user);
        navigate("/");
    }
     

  } catch (error) {
    console.error(error);
    Swal.fire("Error 794","Error en login","error");
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
        </form>

      </div>
    </div>
  );
}