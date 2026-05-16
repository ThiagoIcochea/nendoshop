import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../components/ParticlesBackground";

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

  // REGEX
  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,40}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^9\d{8}$/;
  const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  const handleRegister = (e) => {
    e.preventDefault();

    const today = new Date();

    if (!nameRegex.test(name)) return alert("Nombre inválido");
    if (!nameRegex.test(lastname)) return alert("Apellido inválido");
    if (!emailRegex.test(email)) return alert("Email inválido");
    if (!passRegex.test(pass)) return alert("Password inválida");
    if (!phoneRegex.test(phone)) return alert("Teléfono inválido");
    if (!address || !city) return alert("Completa dirección y ciudad");
    if (!sex) return alert("Selecciona tu sexo");
    if (!birthdate) return alert("Selecciona tu fecha de nacimiento");

    const birth = new Date(birthdate);

    
    if (birth > today) {
      return alert("Fecha de nacimiento inválida");
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.find((u) => u.email === email);
    if (exists) return alert("El email ya existe");

    const newUser = {
      name,
      lastname,
      email,
      password: pass,
      phone,
      address,
      city,
      birthdate,
      sex,
      role: "user"
    };

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

          {/* 📅 FECHA DE NACIMIENTO */}
          <input
            type="date"
            className="border p-2 w-full mb-3 rounded"
            onChange={(e) => setBirthdate(e.target.value)}
          />

          {/* ⚧ SEXO */}
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