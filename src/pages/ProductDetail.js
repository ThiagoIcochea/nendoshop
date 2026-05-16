import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ParticlesBackground from "../components/ParticlesBackground";

export default function ProductDetail() {

  const { _id } = useParams();

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);

  const auth = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth"));
    } catch {
      return null;
    }
  })();

  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("desc");
  const [selectedImage, setSelectedImage] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState([]);

  
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetch("https://backendproyectodf.onrender.com/api/products", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list);

        const found = list.find(p => p._id === _id);
        setProduct(found || null);

        if (found) {
          setSelectedImage(found.image);
          setComments(found.comments || []);
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [_id]);

  if (loading) return <h1 className="p-6">Cargando producto...</h1>;
  if (!product) return <h1>Producto no encontrado</h1>;

  const finalPrice =
    product.discount > 0
      ? product.price * (1 - product.discount)
      : product.price;

  const getInitial = () => (auth?.name || "U").charAt(0).toUpperCase();

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const exist = cart.find(p => p._id === product._id);

    if (exist) {
      exist.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    alert("Agregado 🛒");
  };

  const handleComment = async () => {
    if (!auth) {
      alert("Debes iniciar sesión");
      return;
    }

    if (!comment.trim()) return;

    try {
      const configRes = await fetch("https://backendproyectodf.onrender.com/api/configs/apiComentarios", {
        method: "GET",
        credentials: "include"
      });

      const configData = await configRes.json();

      const api = configData?.value;

      if (!api) {
        alert("No se pudo conectar con el servicio de comentarios");
        return;
      }

      const apiUrl = configData?.value;

      if (!apiUrl) {
        alert("No hay API configurada");
        return;
      }

      const modRes = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          texto: comment,
          modo: "comentario"
        })
      });

      const modData = await modRes.json();
      console.log("MODERACIÓN:", modData);

      if (modData?.estado !== "OK") {
        alert("Comentario bloqueado 🚫");
        return;
      }

      const saveRes = await fetch(`https://backendproyectodf.onrender.com/api/products/${_id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          text: comment,
          rating,
          user: auth.name
        })
      });

      const saveData = await saveRes.json();

      setComments(saveData.comments || []);
      setComment("");
      setRating(5);

      alert("Comentario publicado ✅");

    } catch (error) {
      alert("Error conectando con el servidor ❌");
    }
  };

 
  const totalPages = Math.ceil(comments.length / pageSize);
  const paginatedComments = comments.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="relative min-h-screen p-6">

      <ParticlesBackground />

      <div className="relative z-10 max-w-7xl mx-auto bg-white rounded-xl shadow p-6">

        <div className="grid md:grid-cols-2 gap-10">

          <div className="flex gap-4">

            <div className="flex flex-col gap-3">
              {[product.image].map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setSelectedImage(img)}
                  className="w-20 h-20 object-cover rounded cursor-pointer border hover:border-brand"
                />
              ))}
            </div>

            <div className="flex-1 overflow-hidden rounded-lg">
              <img
                src={selectedImage}
                className="w-full h-full object-contain hover:scale-110 transition duration-500"
              />
            </div>

          </div>

          <div>

            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            <div className="mb-4">
              {product.discount > 0 && (
                <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded mr-2">
                  -{product.discount * 100}%
                </span>
              )}

              {product.discount > 0 && (
                <span className="line-through text-gray-400 mr-2">
                  S/. {product.price}
                </span>
              )}

              <span className="text-2xl font-bold text-brand">
                S/. {finalPrice.toFixed(2)}
              </span>
            </div>

            <p className="text-green-600 mb-4 font-medium">
              ● Últimas unidades disponibles
            </p>

            <div className="flex items-center gap-3 mb-6">

              <div className="flex border rounded overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="px-4 flex items-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
              </div>

              <button
                onClick={handleAddToCart}
                className="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand-dark"
              >
                Añadir al carrito
              </button>

              

            </div>

               <div className="border-b mb-4 flex gap-6">
              <button
                onClick={() => setActiveTab("desc")}
                className={activeTab === "desc" ? "border-b-2 border-brand pb-2" : ""}
              >
                Descripción
              </button>

              <button
                onClick={() => setActiveTab("specs")}
                className={activeTab === "specs" ? "border-b-2 border-brand pb-2" : ""}
              >
                Información
              </button>
            </div>

           {activeTab === "desc" && (
              <p className="text-gray-600">{product.description}</p>
            )}

            {activeTab === "specs" && (
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value], i) => (
                      <tr key={key} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="px-4 py-3 font-semibold text-gray-700 w-1/3">
                          {key}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}


          </div>
        </div>

        <div className="mt-12">

          <h2 className="text-2xl font-bold mb-6">Opiniones</h2>

          {auth && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">

              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold">
                  {getInitial()}
                </div>

                <div className="flex-1">

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full resize-none border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand transition"
                    rows="3"
                  />

                  <div className="flex justify-between items-center mt-3">

                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          onClick={() => setRating(star)}
                          className={`cursor-pointer text-xl ${star <= rating ? "text-yellow-400 scale-110" : "text-gray-300"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={handleComment}
                      className="bg-brand text-white px-5 py-2 rounded-lg hover:bg-brand-dark transition"
                    >
                      Publicar
                    </button>

                  </div>

                </div>
              </div>
            </div>
          )}

          {!auth && (
            <p className="text-red-500 mb-6">
              Inicia sesión para comentar
            </p>
          )}

          <div className="grid gap-4">

            {paginatedComments.map((c, i) => (
              <div key={i} className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition">

                <div className="flex items-center gap-3 mb-2">

                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                    {(c.user || "Usuario").charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <p className="font-semibold text-sm">
                      {c.user || "Usuario"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {c.date ? new Date(c.date).toLocaleDateString() : ""}
                    </p>
                  </div>

                </div>

                <div className="text-yellow-400 text-sm mb-2">
                  {"★".repeat(c.rating)}{"☆".repeat(5 - c.rating)}
                </div>

                <p className="text-gray-700 text-sm leading-relaxed">
                  {c.text}
                </p>

              </div>
            ))}

          </div>

          
          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border rounded"
              >
                Anterior
              </button>

              <span className="px-4 py-2">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 border rounded"
              >
                Siguiente
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}