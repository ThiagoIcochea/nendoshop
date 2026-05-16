import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Pagos() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState("inactivo");

  // usuario
  const [user, setUser] = useState(null);

  // tarjeta editable
  const [card, setCard] = useState({
    cardName : "",
    cardNumber: "",
    cardCVV: "",
    cardType: "visa"
  });

  // 1. Guardián del carrito
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cart")) || [];

    if (data.length === 0) {
      navigate("/catalog");
      return;
    }

    setCart(data);
  }, [navigate]);

  // 2. cargar usuario con cookies
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("https://backendproyectodf.onrender.com/api/users/profile", {
          method: "GET",
          credentials: "include"
        });

        const data = await res.json();

        if (!res.ok) return;

        setUser(data);

        setCard({
          cardName: data.paymentmethod?.nombretarjeta || "",
          cardNumber: data.paymentmethod?.numerotarjeta || "",
          cardCVV: data.paymentmethod?.cvv || "",
          cardType: data.paymentmethod?.tipo || "visa"
        });

      } catch (err) {
        console.log(err);
      }
    };

    loadUser();
  }, []);

  // total
  const total = cart.reduce((acc, p) => {
    const price = p.discount > 0 ? p.price * (1 - p.discount) : p.price;
    return acc + price * p.quantity;
  }, 0);

  // cambio inputs tarjeta
  const handleCardChange = (e) => {
    setCard({
      ...card,
      [e.target.name]: e.target.value
    });
  };

  
  const saveCardToUser = async () => {
    try {
      const res = await fetch("https://backendproyectodf.onrender.com/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          paymentmethod: {
            nombretarjeta:card.cardName,
            numerotarjeta: card.cardNumber,
            cvv: card.cardCVV,
            tipo: card.cardType
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return false;
      }

      return true;

    } catch (err) {
      console.log(err);
      return false;
    }
  };

  // 3. pago completo
  const handlePayment = async (e) => {
    e.preventDefault();

    setPaymentStatus("procesando");

    setTimeout(async () => {

      try {

        // guardar tarjeta primero
        const ok = await saveCardToUser();

        if (!ok) {
          setPaymentStatus("inactivo");
          return;
        }

        // crear pago
        const paymentData = {
          cliente: user.name + " " + user.lastname,
          direccion: user.address,
          envio: 0,
          productos: cart.map(p => ({
            name: p.name,
            quantity: p.quantity,
            price: p.price
          })),
          total: total,
          estado: "Pagado"
        };

        const res = await fetch("https://backendproyectodf.onrender.com/api/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(paymentData)
        });

        if (!res.ok) throw new Error("Error en pago");

        setPaymentStatus("exito");

        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("storage"));

        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);

      } catch (err) {
        console.log(err);
        alert("Error al procesar pago");
        setPaymentStatus("inactivo");
      }

    }, 2000);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 p-4 md:p-10">

      {/* MODAL */}
      {paymentStatus !== "inactivo" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center transform transition-all scale-105">

            {paymentStatus === "procesando" ? (
              <>
                <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-gray-800">Procesando pago...</h2>
                <p className="text-sm text-gray-500 mt-2">No cierres esta ventana</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">¡Pago Exitoso!</h2>
                <p className="text-sm text-gray-500 mt-2">Redirigiendo a la tienda...</p>
              </>
            )}

          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
          Finalizar Compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

          {/* FORM */}
          <form
            onSubmit={handlePayment}
            className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-bold mb-6 border-b pb-2">
              Método de Pago
            </h2>

            <div className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre en la tarjeta
                </label>
                <input
                 name="cardName"
                  value={card.cardName}
                  onChange={handleCardChange}
                  type="text"
                  required
                  placeholder="Ej. Debito BCP"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand focus:border-brand p-3 border outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Tarjeta
                </label>
                <input
                  name="cardNumber"
                  value={card.cardNumber}
                  onChange={handleCardChange}
                  type="text"
                  required
                  placeholder="0000 0000 0000 0000"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand focus:border-brand p-3 border outline-none"
                />
              </div>

              <div className="flex gap-4">

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    name="cardCVV"
                    value={card.cardCVV}
                    onChange={handleCardChange}
                    type="password"
                    required
                    placeholder="123"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand p-3 border outline-none"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    name="cardType"
                    value={card.cardType}
                    onChange={handleCardChange}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand p-3 border outline-none"
                  >
                    <option value="visa">Visa</option>
                    <option value="mastercard">MasterCard</option>
                    <option value="amex">Amex</option>
                  </select>
                </div>

              </div>

            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-brand text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-brand/90 transition-colors"
            >
              Confirmar y Pagar S/. {total.toFixed(2)}
            </button>
          </form>

          {/* RESUMEN */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

            <h2 className="text-lg font-bold mb-4">
              Resumen del Pedido
            </h2>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6">

              {cart.map(product => {
                const price =
                  product.discount > 0
                    ? product.price * (1 - product.discount)
                    : product.price;

                return (
                  <div key={product.id} className="flex items-center gap-4 border-b pb-4">

                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md bg-gray-100"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-gray-800">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-xs">
                        Cant: {product.quantity}
                      </p>
                    </div>

                    <p className="font-bold text-sm">
                      S/. {(price * product.quantity).toFixed(2)}
                    </p>

                  </div>
                );
              })}

            </div>

            <div className="space-y-2 border-t pt-4">

              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>S/. {total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-900 mt-4 border-t pt-4">
                <span>Total</span>
                <span>S/. {total.toFixed(2)}</span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}