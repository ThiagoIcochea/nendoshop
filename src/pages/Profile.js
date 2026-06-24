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
        cardName:data.paymentmethod?.nombretarjeta || "",
        cardNumber: data.paymentmethod?.numerotarjeta || "",
        cardCVV: data.paymentmethod?.cvv || "",
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
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    let auth = JSON.parse(localStorage.getItem("auth"));
    auth.profileImg= e.target.value;
    setAuth(auth);
  };

 
  const handleImage = (e) => {
   
   console.log(e.target.value);
   
        setForm({
          ...form,
          avatar: e.target.value
        });
    let auth = JSON.parse(localStorage.getItem("auth"));
    auth.profileImg= e.target.value;
    setAuth(auth);
  };

 const saveProfile = async () => {
  try {
    if (!nameRegex.test((form.name || "").trim())) return Swal.fire("Error 630", "Nombre inválido. Usa solo letras y espacios.", "error");
    if (!nameRegex.test((form.lastname || "").trim())) return Swal.fire("Error 630", "Apellido inválido. Usa solo letras y espacios.", "error");
    if (!phoneRegex.test((form.phone || "").trim())) return Swal.fire("Error 630", "Teléfono inválido. Ejemplo: 987654321 o +51 987654321", "error");
    if (!addressRegex.test((form.address || "").trim())) return Swal.fire("Error 630", "Dirección inválida. Debe tener entre 5 y 80 caracteres.", "error");
    if (!cityRegex.test((form.city || "").trim())) return Swal.fire("Error 630", "Ciudad inválida. Usa solo letras y espacios.", "error");
    if (form.cardName && !cardNameRegex.test(form.cardName.trim())) return Swal.fire("Error 630", "Nombre de tarjeta inválido.", "error");
    if (form.cardNumber && !cardNumberRegex.test(form.cardNumber.replace(/\s/g, ""))) return Swal.fire("Error 630", "Número de tarjeta inválido.", "error");
    if (form.cardCVV && !cvvRegex.test(form.cardCVV)) return Swal.fire("Error 630", "CVV inválido.", "error");

    const res = await fetch("https://backendproyectodf.onrender.com/api/auth/profile-update-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        name: form.name,
        lastname: form.lastname,
        phone: form.phone,
        address: form.address,
        city: form.city,
        birthdate: form.birthdate,
        sex: form.sex,
        profileImg: form.avatar,
        paymentmethod: {
          nombretarjeta: form.cardName,
          numerotarjeta: form.cardNumber,
          cvv: form.cardCVV,
          tipo: form.cardType
        }
      })
    });

    const data = await res.json();

    if (!res.ok) return Swal.fire("Error 896", data.message || "No se pudo iniciar la actualización", "error");

    savePending2FAFlow({
      email: form.email,
      tempToken: data.tempToken,
      redirectTo: "/profile",
      pendingProfileUpdate: { email: form.email, payload: {
          name: form.name,
          lastname: form.lastname,
          phone: form.phone,
          address: form.address,
          city: form.city,
          birthdate: form.birthdate,
          sex: form.sex,
          profileImg: form.avatar,
          paymentmethod: {
            nombretarjeta: form.cardName,
            numerotarjeta: form.cardNumber,
            cvv: form.cardCVV,
            tipo: form.cardType
          }
        } }
    });

    navigate("/verify-2fa", {
      state: {
        email: form.email,
        tempToken: data.tempToken,
        redirectTo: "/profile",
        pendingProfileUpdate: { email: form.email, payload: {
          name: form.name,
          lastname: form.lastname,
          phone: form.phone,
          address: form.address,
          city: form.city,
          birthdate: form.birthdate,
          sex: form.sex,
          profileImg: form.avatar,
          paymentmethod: {
            nombretarjeta: form.cardName,
            numerotarjeta: form.cardNumber,
            cvv: form.cardCVV,
            tipo: form.cardType
          }
        } }
      }
    });

  } catch (err) {
    console.log(err);
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

        <input name="email" value={form.email} disabled className="border p-2 rounded bg-gray-100" />

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