import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ApiComentarios() {
  const navigate = useNavigate();

  const auth = useMemo(() => {
    return JSON.parse(localStorage.getItem("auth")) || null;
  }, []);

  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!auth) {
      navigate("/login");
      return;
    }

    if (auth.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    const loadConfig = async () => {
      try {
        const res = await fetch(
          "https://backendproyectodf.onrender.com/api/configs/apiComentarios",
          {
            method: "GET",
            credentials: "include"
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.log("Error al cargar config");
          return;
        }

        if (data) {
          setUrl(data.value);
        }
      } catch (err) {
        console.log(err);
      }
    };

    loadConfig();
  }, [navigate, auth]);

  const save = async () => {
    try {
      const res = await fetch(
        "https://backendproyectodf.onrender.com/api/configs/apiComentarios",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            value: url,
            tipo: "string"
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Swal.fire("Error 896", data.message || "Error al guardar", "error");
        return;
      }

      Swal.fire("Registro exitoso", "API guardada correctamente", "success");
    } catch (err) {
      console.log(err);
      Swal.fire("Error 742", "Error de servidor", "error");
    }

    if (!auth || auth.role !== "admin") {
      navigate("/dashboard");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto animate__animated animate__fadeIn">
      <h1 className="text-2xl font-bold mb-6">API de Comentarios</h1>

      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://tu-ngrok/ia"
        className="w-full border border-gray-300 p-3 rounded mb-4 focus:ring-2 focus:ring-brand outline-none"
      />

      <div className="flex gap-3">
        <button
          onClick={save}
          className="bg-brand text-white px-6 py-2 rounded"
        >
          Guardar
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="border px-6 py-2 rounded"
        >
          Volver
        </button>
      </div>
    </div>
  );
}