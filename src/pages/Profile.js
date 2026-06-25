import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import { savePending2FAFlow } from "../utils/twoFactorFlow";

const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,40}$/;
const phoneRegex = /^(?:\+51\s?)?9\d{8}$/;
const addressRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9#°.,\s-]{5,80}$/;
const cityRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,40}$/;
const cardNameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,40}$/;
const cardNumberRegex = /^(?:\d{4}[-\s]?){3}\d{4}$/;
const cvvRegex = /^\d{3,4}$/;

const normalizeTextValue = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

export default function Profile() {

  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    birthdate: "",
    sex: "",
    cardName: "",
    cardNumber: "",
    cardCVV: "",
    cardType: "visa",
    avatar: ""
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

 useEffect(() => {
  const loadUser = async () => {
    try {
      const res = await fetch("https://backendproyectodf.onrender.com/api/users/profile", {
        method: "GET",
        credentials: "include"
      });

      const data = await res.json();

      if (!res.ok) return;

      

      setForm({
        name: data.name || "",
        lastname: data.lastname || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        birthdate: data.birthdate ? data.birthdate.split("T")[0] : "",
        sex: data.sex || "",
        cardName: normalizeTextValue(data.paymentmethod?.nombretarjeta),
        cardNumber: normalizeTextValue(data.paymentmethod?.numerotarjeta),
        cardCVV: normalizeTextValue(data.paymentmethod?.cvv),
        cardType: data.paymentmethod?.tipo || "visa",
        avatar: data.profileImg || ""
      });

    } catch (err) {
      console.log(err);
    }
  };

  loadUser();
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "avatar") {
      const savedAuth = JSON.parse(localStorage.getItem("auth") || "null");
      if (savedAuth) {
        savedAuth.profileImg = value;
        setAuth(savedAuth);
      }
    }
  };

 
  const handleImage = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, avatar: value }));

    const savedAuth = JSON.parse(localStorage.getItem("auth") || "null");
    if (savedAuth) {
      savedAuth.profileImg = value;
      setAuth(savedAuth);
    }
  };

 const saveProfile = async () => {
  try {
    if (!nameRegex.test((form.name || "").trim())) return Swal.fire("Error 630", "Nombre inválido. Usa 2 a 40 letras y espacios.", "error");
    if (!nameRegex.test((form.lastname || "").trim())) return Swal.fire("Error 630", "Apellido inválido. Usa 2 a 40 letras y espacios.", "error");
    if (!phoneRegex.test((form.phone || "").trim())) return Swal.fire("Error 630", "Teléfono inválido. Ejemplo: 987654321 o +51 987654321.", "error");
    if (!addressRegex.test((form.address || "").trim())) return Swal.fire("Error 630", "Dirección inválida. Usa entre 5 y 80 caracteres con letras, números y signos básicos.", "error");
    if (!cityRegex.test((form.city || "").trim())) return Swal.fire("Error 630", "Ciudad inválida. Usa solo letras y espacios.", "error");

    const normalizedCardName = normalizeTextValue(form.cardName);
    const normalizedCardNumber = normalizeTextValue(form.cardNumber).replace(/\s/g, "");
    const normalizedCardCVV = normalizeTextValue(form.cardCVV);

    if (normalizedCardName && !cardNameRegex.test(normalizedCardName)) return Swal.fire("Error 630", "Nombre de tarjeta inválido. Usa solo letras y espacios.", "error");
    if (normalizedCardNumber && !cardNumberRegex.test(normalizedCardNumber)) return Swal.fire("Error 630", "Número de tarjeta inválido. Usa 16 dígitos con espacios o guiones.", "error");
    if (normalizedCardCVV && !cvvRegex.test(normalizedCardCVV)) return Swal.fire("Error 630", "CVV inválido. Usa 3 o 4 dígitos.", "error");

    const payload = {
      name: form.name,
      lastname: form.lastname,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      birthdate: form.birthdate,
      sex: form.sex,
      profileImg: form.avatar,
      paymentmethod: {
        nombretarjeta: normalizedCardName,
        numerotarjeta: normalizedCardNumber,
        cvv: normalizedCardCVV,
        tipo: form.cardType
      }
    };

    console.info("[PROFILE] intentando actualizar perfil", payload);

    const res = await fetch("https://backendproyectodf.onrender.com/api/users/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      return Swal.fire("Error 896", data.message || "No se pudo actualizar el perfil", "error");
    }

    const updatedUser = data.user || data;
    const savedAuth = JSON.parse(localStorage.getItem("auth") || "null");
    const nextAuth = savedAuth
      ? { ...savedAuth, ...updatedUser, profileImg: updatedUser.profileImg || savedAuth.profileImg }
      : updatedUser;

    localStorage.setItem("auth", JSON.stringify(nextAuth));
    setAuth(nextAuth);
    setForm((prev) => ({ ...prev, avatar: updatedUser.profileImg || prev.avatar }));

    console.info("[PROFILE] perfil actualizado", updatedUser);
    Swal.fire("Éxito", "Perfil actualizado correctamente", "success");
  } catch (err) {
    console.error("[PROFILE] error al guardar", err);
    Swal.fire("Error", "No se pudo actualizar el perfil", "error");
  }
};

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      return Swal.fire("Completa los campos", "Ingresa tu contraseña actual y la nueva.", "warning");
    }

    setPasswordLoading(true);

    try {
      const res = await fetch("https://backendproyectodf.onrender.com/api/auth/change-password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      setPasswordLoading(false);

      if (!res.ok) {
        return Swal.fire("Error", data.message || "No se pudo iniciar el cambio", "error");
      }

      setShowPasswordModal(false);
      savePending2FAFlow({
        email: form.email,
        tempToken: data.tempToken,
        redirectTo: "/profile",
        pendingPasswordChange: { email: form.email, newPassword },
        changePassword: true
      });
      navigate("/verify-2fa", {
        state: {
          email: form.email,
          tempToken: data.tempToken,
          redirectTo: "/profile",
          pendingPasswordChange: { email: form.email, newPassword },
          changePassword: true
        }
      });
    } catch (error) {
      setPasswordLoading(false);
      Swal.fire("Error", "No se pudo cambiar la contraseña", "error");
    }
  };

  const getInitials = () => {
    return (form.name?.[0] || "") + (form.lastname?.[0] || "");
  };

  return (
   <div className="max-w-4xl mx-auto p-4 sm:p-6 animate__animated animate__fadeIn">

     
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 mb-6">

      
        <div className="w-20 h-20 rounded-full overflow-hidden bg-brand flex items-center justify-center text-white font-bold text-xl">
          {form.avatar ? (
            <img
              src={form.avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials() || "U"
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold">
            {form.name} {form.lastname}
          </h2>
          <p className="text-gray-500">{form.email}</p>
        </div>

      </div>

     
      <div className="mb-6 rounded-xl border border-purple-100 bg-purple-50/50 p-3 text-sm text-purple-700">
        <p className="font-semibold">Guía de datos</p>
        <p className="mt-1">Nombre y apellido: solo letras y espacios. Teléfono: 987654321 o +51 987654321. Dirección: entre 5 y 80 caracteres. Ciudad: solo letras. Si cambias el correo, debe ser único en la plataforma.</p>
      </div>

      <div className="mb-6">
        <input
        name="avatar"
          type="text"
          value={form.avatar}
          placeholder="Ingresa la URL de la imagen"
          onChange={handleImage}
          className="border  p-2 rounded w-full"
        />
      </div>

    
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <input name="name" value={form.name} onChange={handleChange} placeholder="Nombre" className="border p-2 rounded" />

        <input name="lastname" value={form.lastname} onChange={handleChange} placeholder="Apellidos" className="border p-2 rounded" />

        <input name="email" value={form.email} onChange={handleChange} placeholder="Correo electrónico" className="border p-2 rounded" />

        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" className="border p-2 rounded" />

        <input name="address" value={form.address} onChange={handleChange} placeholder="Dirección" className="border p-2 rounded" />

        <input name="city" value={form.city} onChange={handleChange} placeholder="Ciudad" className="border p-2 rounded" />

        <input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} className="border p-2 rounded" />

        <select name="sex" value={form.sex} onChange={handleChange} className="border p-2 rounded">
          <option value="">Sexo</option>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="otro">Otro</option>
        </select>

      <input name="cardName" value={form.cardName} onChange={handleChange} placeholder="Nombre de la tarjeta" className="border p-2 rounded" />
        <input name="cardNumber" value={form.cardNumber} onChange={handleChange} placeholder="Número de tarjeta" className="border p-2 rounded" />

        <input name="cardCVV" value={form.cardCVV} onChange={handleChange} placeholder="CVV" className="border p-2 rounded" />

        <select name="cardType" value={form.cardType} onChange={handleChange} className="border p-2 rounded">
          <option value="visa">Visa</option>
          <option value="mastercard">MasterCard</option>
          <option value="amex">Amex</option>
        </select>

      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={saveProfile}
          className="w-full sm:w-auto bg-brand text-white px-6 py-2 rounded"
        >
          Guardar cambios
        </button>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full sm:w-auto bg-gray-800 text-white px-6 py-2 rounded"
        >
          Cambiar contraseña
        </button>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-purple-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">Cambiar contraseña</h3>
            <p className="mt-2 text-sm text-gray-500">Confirma tu contraseña actual y escribe la nueva. Después se pedirá verificación en dos pasos.</p>
            <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-purple-400" placeholder="Contraseña actual" />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-purple-400" placeholder="Nueva contraseña" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600">Cancelar</button>
                <button type="submit" className="rounded-lg bg-brand px-3 py-2 text-sm text-white" disabled={passwordLoading}>
                  {passwordLoading ? "Procesando..." : "Confirmar cambio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}