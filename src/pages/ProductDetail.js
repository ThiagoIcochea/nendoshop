import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ParticlesBackground from "../components/ParticlesBackground";
import CommentCard from "../components/CommentCard";
import Swal from "sweetalert2";

export default function ProductDetail() {

  const { _id } = useParams();

  const [, setProducts] = useState([]);
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
  const wsRef = useRef(null);

  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetch("https://backendproyectodf.onrender.com/api/products", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {

        const list = Array.isArray(data)
          ? data
          : data.products || [];

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

  useEffect(() => {
    const host = window.location.hostname === "localhost"
      ? "localhost:4000"
      : "backendproyectodf.onrender.com";
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${host}`;

    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.addEventListener("open", () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: "subscribe",
          productId: _id
        }));
      }
    });

    socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "comment-update" && data.productId === _id) {
          setComments(data.comments || []);
        }
      } catch (err) {
        console.error("WS parse error", err);
      }
    });

    return () => {
      socket.close();
    };
  }, [_id]);

  if (!loading && !product) {
    return <h1>Producto no encontrado</h1>;
  }

  const finalPrice =
    product?.discount > 0
      ? product.price * (1 - product?.discount)
      : product?.price || 0;

  const getInitial = () =>
    (auth?.name || "U").charAt(0).toUpperCase();

  const handleAddToCart = () => {

    const cart =
      JSON.parse(localStorage.getItem("cart")) || [];

    const exist = cart.find(
      p => p._id === product._id
    );

    if (exist) {

      exist.quantity += quantity;

    } else {

      cart.push({
        ...product,
        quantity
      });

    }

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );

    window.dispatchEvent(new Event("storage"));

   Swal.fire("Carrito"," Producto agregado al carrito","success");

  };

  const handleComment = async () => {

    if (!auth) {
      Swal.fire("Error 230","Debes iniciar sesión","error");
      return;
    }

    if (!comment.trim()) return;

    try {

      const saveRes = await fetch(
        `https://backendproyectodf.onrender.com/api/products/${_id}/comments`,
        {
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
        }
      );

      const saveData = await saveRes.json();

      if (!saveRes.ok) {
        const errorMessage = saveData?.message || "No se pudo agregar el comentario";
        return Swal.fire("Error", errorMessage, "error");
      }

      setComments(saveData.comments || []);
      setComment("");
      setRating(5);

      Swal.fire("Registro exitoso","Comentario publicado","success");

    } catch (error) {

      Swal.fire("Error 678", "Error conectando con el servidor","error");

    }
  };

  const totalPages = Math.ceil(
    comments.length / pageSize
  );

  const paginatedComments = comments.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (

    <div className="relative min-h-screen p-4 sm:p-6">

      <ParticlesBackground />

      <div className="relative z-10 max-w-7xl mx-auto bg-white rounded-xl shadow p-4 sm:p-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">

          <div className="flex gap-4 flex-col md:flex-row">

            <div className="flex flex-row md:flex-col gap-3">

              {[product?.image].map((img, i) => (

                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setSelectedImage(img)}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded cursor-pointer border hover:border-brand"
                />

              ))}

            </div>

            <div className="flex-1 overflow-hidden rounded-lg animate__animated animate__fadeIn">

              <img
                src={selectedImage || product?.image}
                alt=""
                className="w-full h-[300px] sm:h-[450px] object-contain hover:scale-110 transition duration-500"
              />

            </div>

          </div>

          <div className="animate__animated animate__fadeInRight">

            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {product?.name}
            </h1>

            <div className="mb-4">

              {product?.discount > 0 && (
                <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded mr-2">
                  -{product?.discount * 100}%
                </span>
              )}

              {product?.discount > 0 && (
                <span className="line-through text-gray-400 mr-2">
                  S/. {product?.price}
                </span>
              )}

              <span className="text-2xl font-bold text-brand">
                S/. {finalPrice.toFixed(2)}
              </span>

            </div>

            <p className="text-green-600 mb-4 font-medium">
              ● Últimas unidades disponibles
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">

              <div className="flex border rounded overflow-hidden">

                <button
                  className="px-4 py-2"
                  onClick={() =>
                    setQuantity(
                      Math.max(1, quantity - 1)
                    )
                  }
                >
                  -
                </button>

                <span className="px-4 flex items-center">
                  {quantity}
                </span>

                <button
                  className="px-4 py-2"
                  onClick={() =>
                    setQuantity(
                      Math.min(
                        product?.stock || 1,
                        quantity + 1
                      )
                    )
                  }
                >
                  +
                </button>

              </div>

              <button
                onClick={handleAddToCart}
                className="bg-brand text-white px-6 py-3 rounded-lg hover:bg-brand-dark transition"
              >
                Añadir al carrito
              </button>

            </div>

            <div className="border-b mb-4 flex gap-6 overflow-x-auto">

              <button
                onClick={() => setActiveTab("desc")}
                className={
                  activeTab === "desc"
                    ? "border-b-2 border-brand pb-2"
                    : ""
                }
              >
                Descripción
              </button>

              <button
                onClick={() => setActiveTab("specs")}
                className={
                  activeTab === "specs"
                    ? "border-b-2 border-brand pb-2"
                    : ""
                }
              >
                Información
              </button>

            </div>

            {activeTab === "desc" && (
              <p className="text-gray-600 leading-relaxed">
                {product?.description}
              </p>
            )}

            {activeTab === "specs" && (

              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">

                <table className="w-full text-sm">

                  <tbody>

                    {Object.entries(product?.specs || {}).map(
                      ([key, value], i) => (

                        <tr
                          key={key}
                          className={
                            i % 2 === 0
                              ? "bg-gray-50"
                              : "bg-white"
                          }
                        >

                          <td className="px-4 py-3 font-semibold text-gray-700 w-1/3">
                            {key}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {value}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

        <div className="mt-12">

          <h2 className="text-2xl font-bold mb-6">
            Opiniones
          </h2>

          {auth && (

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6 animate__animated animate__fadeInUp">

              <div className="flex items-start gap-3">

                <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold">
                  {getInitial()}
                </div>

                <div className="flex-1">

                  <textarea
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                    className="w-full resize-none border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand transition"
                    rows="3"
                  />

                  <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center mt-3">

                    <div className="flex gap-1">

                      {[1, 2, 3, 4, 5].map(star => (

                        <span
                          key={star}
                          onClick={() => setRating(star)}
                          className={`cursor-pointer text-xl ${
                            star <= rating
                              ? "text-yellow-400 scale-110"
                              : "text-gray-300"
                          }`}
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

            {loading

              ? Array.from({ length: 5 }).map((_, i) => (

                  <CommentCard
                    key={i}
                    loading={true}
                  />

                ))

              : paginatedComments.map((c, i) => (

                  <div
                    key={c._id || i}
                    className="animate__animated animate__fadeInUp"
                    style={{
                      animationDelay: `${i * 0.08}s`
                    }}
                  >

                    <CommentCard
                      comment={c}
                      loading={false}
                    />

                  </div>

                ))}

          </div>

          {totalPages > 1 && (

            <div className="flex justify-center gap-3 mt-6 flex-wrap">

              <button
                onClick={() =>
                  setPage(p => Math.max(1, p - 1))
                }
                className="px-4 py-2 border rounded"
              >
                Anterior
              </button>

              <span className="px-4 py-2">
                {page} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setPage(p => Math.min(totalPages, p + 1))
                }
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