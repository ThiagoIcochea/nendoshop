import { useEffect, useState } from "react";
import { Pencil, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

export default function Clients() {

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visiblePassword, setVisiblePassword] = useState(null);

  const itemsPerPage = 8;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{7,15}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

  useEffect(() => {
    const load = async () => {
      const res = await fetch("https://backendproyectodf.onrender.com/api/admin/clients", {
        credentials: "include"
      });

      const data = await res.json();

      if (res.ok) {
        const onlyUsers = Array.isArray(data)
          ? data.filter(c => c.role === "user")
          : [];

        setClients(onlyUsers);
      }
    };

    load();
  }, []);

  const showError = (text) => {
    Swal.fire({
      icon: "error",
      title: "Error 630",
      text
    });
  };

  const updateField = async (id, field, value) => {

    if (field === "email" && !emailRegex.test(value)) {
      showError("Correo inválido");
      return;
    }

    if (field === "phone" && !phoneRegex.test(value)) {
      showError("Teléfono inválido (solo números 7-15 dígitos)");
      return;
    }

    if (field === "city" && value.trim().length < 2) {
      showError("Ciudad inválida");
      return;
    }

    if (field === "password" && !passwordRegex.test(value)) {
      showError("Contraseña débil (mínimo 6 caracteres, letras y números)");
      return;
    }

    const res = await fetch(`https://backendproyectodf.onrender.com/api/admin/clients/${id}/${field}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ [field]: value })
    });

    if (!res.ok) {
      showError("No se pudo actualizar el campo");
      return;
    }

    setClients(prev =>
      prev.map(c => (c._id === id ? { ...c, [field]: value } : c))
    );
  };

  const filteredClients = clients.filter((c) => {
    const matchSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());

    const matchCity = city
      ? c.city?.toLowerCase() === city.toLowerCase()
      : true;

    return matchSearch && matchCity;
  });

  const totalClients = filteredClients.length;

  const topCity = (() => {
    const map = {};
    filteredClients.forEach(c => {
      map[c.city] = (map[c.city] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  })();

  const topGender = (() => {
    const map = {};
    filteredClients.forEach(c => {
      map[c.sex] = (map[c.sex] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  })();

  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentClients = filteredClients.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 animate__animated animate__fadeIn">

      <div className="mb-8 animate__animated animate__fadeInDown">
        <h1 className="text-3xl md:text-4xl font-bold text-purple-600">Clientes</h1>
        <p className="text-gray-500">Gestión de usuarios registrados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-purple-500">
          <p className="text-gray-500 text-sm">Total clientes</p>
          <h2 className="text-2xl md:text-3xl font-bold text-purple-600">{totalClients}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-blue-500">
          <p className="text-gray-500 text-sm">Región principal</p>
          <h2 className="text-xl md:text-2xl font-bold text-blue-600">{topCity}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-green-500">
          <p className="text-gray-500 text-sm">Sexo predominante</p>
          <h2 className="text-xl md:text-2xl font-bold text-green-600">{topGender.toUpperCase()}</h2>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Buscar cliente o email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />

          <input
            type="text"
            placeholder="Filtrar por ciudad..."
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />

        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-4">Nombre</th>
                 <th className="pb-4">Genero</th>
                <th className="pb-4">Email</th>
                <th className="pb-4">Teléfono</th>
                <th className="pb-4">Ciudad</th>
                <th className="pb-4">Password</th>
              </tr>
            </thead>

            <tbody>
              {currentClients.map((c) => (
                <tr key={c._id} className="border-b hover:bg-gray-50">

                  <td className="py-4">{c.name}</td>
                   <td className="py-4">{c.sex.toUpperCase()}</td>
                  <td className="py-4">
                    {c.email}
                    <Pencil size={16} className="ml-2 cursor-pointer"
                      onClick={() => {
                        const v = prompt("Nuevo email", c.email);
                        if (v) updateField(c._id, "email", v);
                      }}
                    />
                  </td>

                  <td className="py-4">
                    {c.phone}
                    <Pencil size={16} className="ml-2 cursor-pointer"
                      onClick={() => {
                        const v = prompt("Nuevo teléfono", c.phone);
                        if (v) updateField(c._id, "phone", v);
                      }}
                    />
                  </td>

                  <td className="py-4">
                    {c.city}
                    <Pencil size={16} className="ml-2 cursor-pointer"
                      onClick={() => {
                        const v = prompt("Nueva ciudad", c.city);
                        if (v) updateField(c._id, "city", v);
                      }}
                    />
                  </td>

                  <td className="py-4 flex items-center gap-2">

                    <span>
                      {visiblePassword === c._id ? c.password : "••••••••"}
                    </span>

                    {visiblePassword === c._id ? (
                      <EyeOff size={16} className="cursor-pointer"
                        onClick={() => setVisiblePassword(null)}
                      />
                    ) : (
                      <Eye size={16} className="cursor-pointer"
                        onClick={() => {
                          setVisiblePassword(c._id);
                          setTimeout(() => setVisiblePassword(null), 3000);
                        }}
                      />
                    )}

                    <Pencil size={16} className="cursor-pointer"
                      onClick={() => {
                        const v = prompt("Nueva contraseña");
                        if (v) updateField(c._id, "password", v);
                      }}
                    />

                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {currentClients.map((c) => (
            <div key={c._id} className="bg-gray-50 rounded-xl p-4">

              <div className="flex justify-between">
                <span className="font-bold">{c.name}</span>
              </div>

              <div className="text-sm flex justify-between">
                <span>{c.email}</span>
                <Pencil size={16} onClick={() => {
                  const v = prompt("Nuevo email", c.email);
                  if (v) updateField(c._id, "email", v);
                }} />
              </div>

              <div className="text-sm flex justify-between">
                <span>{c.phone}</span>
                <Pencil size={16} onClick={() => {
                  const v = prompt("Nuevo teléfono", c.phone);
                  if (v) updateField(c._id, "phone", v);
                }} />
              </div>

              <div className="text-sm flex justify-between">
                <span>{c.city}</span>
                <Pencil size={16} onClick={() => {
                  const v = prompt("Nueva ciudad", c.city);
                  if (v) updateField(c._id, "city", v);
                }} />
              </div>

              <div className="text-sm flex justify-between items-center">
                <span>{visiblePassword === c._id ? c.password : "••••••••"}</span>

                <div className="flex gap-2">
                  {visiblePassword === c._id ? (
                    <EyeOff size={16} onClick={() => setVisiblePassword(null)} />
                  ) : (
                    <Eye size={16} onClick={() => {
                      setVisiblePassword(c._id);
                      setTimeout(() => setVisiblePassword(null), 3000);
                    }} />
                  )}

                  <Pencil size={16} onClick={() => {
                    const v = prompt("Nueva contraseña");
                    if (v) updateField(c._id, "password", v);
                  }} />
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-6">

        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Anterior
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 rounded ${currentPage === i + 1 ? "bg-purple-600 text-white" : "bg-gray-200"}`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Siguiente
        </button>

      </div>

    </div>
  );
}