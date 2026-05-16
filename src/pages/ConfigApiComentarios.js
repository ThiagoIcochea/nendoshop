import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ApiComentarios() {

  const navigate = useNavigate();

  const auth = JSON.parse(localStorage.getItem("auth")) || null;

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

  }, [auth, navigate]);

  
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
        alert(data.message || "Error al guardar");
        return;
      }

      alert("API guardada correctamente ✅");

    } catch (err) {
      console.log(err);
      alert("Error de servidor");
    }

    if (!auth || auth.role !== "admin") {
      navigate("/dashboard");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        API de Comentarios
      </h1>

      <input
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