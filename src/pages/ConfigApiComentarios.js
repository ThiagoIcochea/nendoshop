import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ApiComentarios() {

  const navigate = useNavigate();

  const [url, setUrl] = useState(
    localStorage.getItem("api_comentarios") || ""
  );

  const save = () => {
    localStorage.setItem("api_comentarios", url);
    alert("API guardada correctamente ✅");
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