import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../components/ParticlesBackground";

export default function Cart() {

  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(data);
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const increase = (id) => {
    const updated = cart.map(p =>
      p.id === id
        ? { ...p, quantity: Math.min(p.stock, p.quantity + 1) }
        : p
    );
    updateCart(updated);
  };

  const decrease = (id) => {
    const updated = cart.map(p =>
      p.id === id
        ? { ...p, quantity: Math.max(1, p.quantity - 1) }
        : p
    );
    updateCart(updated);
  };

  const removeItem = (id) => {
    const updated = cart.filter(p => p.id !== id);
    updateCart(updated);
  };

  const clearCart = () => {
    updateCart([]);
  };

  const total = cart.reduce((acc, p) => {
    const price = p.discount > 0 ? p.price * (1 - p.discount) : p.price;
    return acc + price * p.quantity;
  }, 0);

  return (
    <div className="relative min-h-screen p-6">

      <ParticlesBackground />

      <div className="relative z-10 max-w-6xl mx-auto bg-white p-6 rounded-xl shadow">

        <h1 className="text-3xl font-bold mb-6">Carrito</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
            <button
              onClick={() => navigate("/catalog")}
              className="bg-brand text-white px-6 py-2 rounded-lg"
            >
              Ir al catálogo
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">

              {cart.map(product => {

                const price = product.discount > 0
                  ? product.price * (1 - product.discount)
                  : product.price;

                return (
                  <div key={product.id} className="flex items-center gap-6 border-b pb-4">

                    <img
                      src={product.image}
                      className="w-24 h-24 object-contain rounded"
                    />

                    <div className="flex-1">

                      <h2 className="font-bold text-lg">{product.name}</h2>

                      <p className="text-brand font-bold">
                        S/. {price.toFixed(2)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">

                        <button
                          onClick={() => decrease(product.id)}
                          className="px-3 bg-gray-200 rounded"
                        >-</button>

                        <span>{product.quantity}</span>

                        <button
                          onClick={() => increase(product.id)}
                          className="px-3 bg-gray-200 rounded"
                        >+</button>

                      </div>

                    </div>

                    <div className="text-right">

                      <p className="font-bold mb-2">
                        S/. {(price * product.quantity).toFixed(2)}
                      </p>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-red-500 text-sm"
                      >
                        Eliminar
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>

            <div className="mt-10 border-t pt-6 flex justify-between items-center">

              <button
                onClick={clearCart}
                className="text-red-500"
              >
                Vaciar carrito
              </button>

              <div className="text-right">

                <p className="text-xl font-bold mb-2">
                  Total: S/. {total.toFixed(2)}
                </p>

                <div className="flex gap-3 justify-end">

                  <button
                    onClick={() => navigate("/catalog")}
                    className="px-4 py-2 border rounded"
                  >
                    Seguir comprando
                  </button>

                  <button
                    onClick={() => alert("Proceso de compra 🧾")}
                    className="bg-brand text-white px-6 py-2 rounded-lg"
                  >
                    Continuar compra
                  </button>

                </div>

              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}