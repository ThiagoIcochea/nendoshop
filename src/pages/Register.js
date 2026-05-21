import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../components/ParticlesBackground";
import Swal from "sweetalert2";

export default function Register() {

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [sex, setSex] = useState("");

  const navigate = useNavigate();

  
  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,40}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^9\d{8}$/;
  const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  const handleRegister = async (e) => {
  e.preventDefault();

  const today = new Date();

  if (!nameRegex.test(name)) return Swal.fire("Error 630","Nombre inválido","error");
  if (!nameRegex.test(lastname)) return Swal.fire("Error 630","Apellido inválido","error");
  if (!emailRegex.test(email)) return Swal.fire("Error 630","Email inválido","error");
  if (!passRegex.test(pass)) return Swal.fire("Error 630","Password inválida","error");
  if (!phoneRegex.test(phone)) return Swal.fire("Error 630","Teléfono inválido","error");
  if (!address || !city) return Swal.fire("Error 630","Completa dirección y ciudad","error");
  if (!sex) return Swal.fire("Error 630","Selecciona tu sexo","error");
  if (!birthdate) return Swal.fire("Error 630","Selecciona tu fecha de nacimiento","error");

  const birth = new Date(birthdate);

  if (birth > today) {
    return Swal.fire("Error 630","Fecha inválida","error");
  }

  try {
    const res = await fetch("https://backendproyectodf.onrender.com/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        lastname,
        email,
        password: pass,
        phone,
        address,
        city,
        birthdate,
        sex
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return Swal.fire("Error 896",data.message,"error");
    }

    Swal.fire("Registro","Registro exitoso","success");
    navigate("/login");

  } catch (error) {
    console.error(error);
    Swal.fire("Error 631","Error en registro","error");
  }
};

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      <ParticlesBackground />

      <div className="relative z-10 animate__animated animate__fadeInUp">

        <form
          onSubmit={handleRegister}
          className="bg-white p-6 shadow-lg w-96 rounded-xl"
        >
          <h2 className="text-xl mb-4 font-bold text-center">
            Registro
          </h2>

          <input
            className="border p-2 w-full mb-3 rounded"
            placeholder="Nombre"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3 rounded"
            placeholder="Apellidos"
            onChange={(e) => setLastname(e.target.value)}
          />

          <input
            type="email"
            className="border p-2 w-full mb-3 rounded"
            placeholder="Correo electrónico"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="border p-2 w-full mb-3 rounded"
            placeholder="Contraseña"
            onChange={(e) => setPass(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3 rounded"
            placeholder="Teléfono"
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3 rounded"
            placeholder="Dirección"
            onChange={(e) => setAddress(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-3 rounded"
            placeholder="Ciudad"
            onChange={(e) => setCity(e.target.value)}
          />

          
          <input
            type="date"
            className="border p-2 w-full mb-3 rounded"
            placeholder="Ingresa tu fecha de nacimiento"
            onChange={(e) => setBirthdate(e.target.value)}
          />

          
          <select
            className="border p-2 w-full mb-3 rounded"
            onChange={(e) => setSex(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Selecciona sexo</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
          </select>

          <button
            type="submit"
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg transition"
          >
            Registrarse
          </button>

        </form>

      </div>
    </div>
  );
}