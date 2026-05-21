import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

export default function Profile() {

  const { setAuth } = useContext(AuthContext);

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
    const res = await fetch("https://backendproyectodf.onrender.com/api/users/profile", {
      method: "PUT",
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

    if (!res.ok) return Swal.fire("Error 896",data.message,"error");

    Swal.fire("Actualización de Registro" ,"Perfil actualizado correctamente","success");

  } catch (err) {
    console.log(err);
  }
};

  const getInitials = () => {
    return (form.name?.[0] || "") + (form.lastname?.[0] || "");
  };

  return (
   <div className="max-w-4xl mx-auto p-6 animate__animated animate__fadeIn">

     
      <div className="flex items-center gap-6 mb-6">

      
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

      <button
        onClick={saveProfile}
        className="mt-6 bg-brand text-white px-6 py-2 rounded"
      >
        Guardar cambios
      </button>

    </div>
  );
}