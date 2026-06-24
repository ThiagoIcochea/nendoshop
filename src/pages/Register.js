import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../components/ParticlesBackground";
import Swal from "sweetalert2";

const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,40}$/;
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const phoneRegex = /^(?:\+51\s?)?9\d{8}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const addressRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9#°.,\s-]{5,80}$/;
const cityRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,40}$/;

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

  const handleRegister = async (e) => {
  e.preventDefault();

  const today = new Date();

  if (!nameRegex.test(name.trim())) return Swal.fire("Error 630","Nombre inválido. Usa solo letras y espacios.","error");
  if (!nameRegex.test(lastname.trim())) return Swal.fire("Error 630","Apellido inválido. Usa solo letras y espacios.","error");
  if (!emailRegex.test(email.trim())) return Swal.fire("Error 630","Email inválido. Ejemplo: usuario@dominio.com","error");
  if (!passwordRegex.test(pass)) return Swal.fire("Error 630","Contraseña inválida. Mínimo 8 caracteres, una letra, un número y un símbolo.","error");
  if (!phoneRegex.test(phone.trim())) return Swal.fire("Error 630","Teléfono inválido. Ejemplo: 987654321 o +51 987654321","error");
  if (!addressRegex.test(address.trim())) return Swal.fire("Error 630","Dirección inválida. Debe tener entre 5 y 80 caracteres.","error");
  if (!cityRegex.test(city.trim())) return Swal.fire("Error 630","Ciudad inválida. Usa solo letras y espacios.","error");
  if (!sex) return Swal.fire("Error 630","Selecciona tu género","error");
  if (!birthdate) return Swal.fire("Error 630","Selecciona tu fecha de nacimiento","error");

  const birth = new Date(birthdate);

  if (birth > today) {
    return Swal.fire("Error 630","Fecha inválida","error");
  }

  try {
    const initialRes = await fetch("https://backendproyectodf.onrender.com/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: name.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
        password: pass,
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        birthdate,
        sex
      })
    });

    const initialData = await initialRes.json();

    if (!initialRes.ok) {
      return Swal.fire("Error 896", initialData.message || "No se pudo iniciar el registro", "error");
    }

    if (!initialData.twoFactorRequired) {
      return Swal.fire("Verificación requerida", "Debes completar la verificación en dos pasos para registrar la cuenta.", "info");
    }

    navigate("/verify-2fa", {
      state: {
        email: email.trim(),
        tempToken: initialData.tempToken,
        redirectTo: "/login",
        requireAdmin: false,
        pendingRegistration: {
          name: name.trim(),
          lastname: lastname.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          birthdate,
          sex
        }
      }
    });

  } catch (error) {
    console.error(error);
    Swal.fire("Error 631","Error en registro","error");
  }
};

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-3 py-6 sm:px-4">

      <ParticlesBackground />

      <div className="relative z-10 w-full max-w-2xl animate__animated animate__fadeInUp">

        <form
          onSubmit={handleRegister}
          className="bg-white/95 p-4 sm:p-6 shadow-2xl w-full rounded-2xl border border-gray-200"
        >
          <h2 className="text-xl mb-4 font-bold text-center">
            Registro
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              className="border p-2 w-full rounded"
              placeholder="Nombre"
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="border p-2 w-full rounded"
              placeholder="Apellidos"
              onChange={(e) => setLastname(e.target.value)}
            />

            <input
              type="email"
              className="border p-2 w-full rounded"
              placeholder="Correo electrónico"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="border p-2 w-full rounded"
              placeholder="Contraseña"
              onChange={(e) => setPass(e.target.value)}
            />

            <input
              className="border p-2 w-full rounded"
              placeholder="Teléfono"
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              className="border p-2 w-full rounded"
              placeholder="Ciudad"
              onChange={(e) => setCity(e.target.value)}
            />

            <input
              className="border p-2 w-full rounded"
              placeholder="Dirección"
              onChange={(e) => setAddress(e.target.value)}
            />

            <input
              type="date"
              className="border p-2 w-full rounded"
              onChange={(e) => setBirthdate(e.target.value)}
            />

            <select
              className="border p-2 w-full rounded"
              onChange={(e) => setSex(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Selecciona Género</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>

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