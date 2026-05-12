import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Pagos() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. El Guardián de la Ruta
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cart")) || [];
    if (data.length === 0) {
      navigate("/catalog"); 
    } else {
      setCart(data);
    }
  }, [navigate]);

  // Cálculo rápido del total
  const total = cart.reduce((acc, p) => {
    const price = p.discount > 0 ? p.price * (1 - p.discount) : p.price;
    return acc + price * p.quantity;
  }, 0);

  // 2. Simulador del Procesamiento
  const [paymentStatus, setPaymentStatus] = useState("inactivo");
  
  const handlePayment = (e) => {
    e.preventDefault(); 
    setPaymentStatus("procesando"); 
    
    setTimeout(() => {
      setPaymentStatus("exito");  
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("storage"));
      
      setTimeout(() => {
        navigate("/", { replace: true }); 
      }, 1500);  

    }, 2500);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 p-4 md:p-10 relative">
      
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
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
          
          <form 
            onSubmit={handlePayment} 
            className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-bold mb-6 border-b pb-2">Método de Pago</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en la tarjeta</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Debito BCP "
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand focus:border-brand p-3 border outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta</label>
                <input 
                  type="text" 
                  required
                  pattern="[0-9]{16}"
                  title="Debe contener 16 números sin espacios"
                  placeholder="0000 0000 0000 0000"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand focus:border-brand p-3 border outline-none invalid:border-red-500 invalid:text-red-600 focus:invalid:ring-red-500"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
                  <input 
                    type="text" 
                    required
                    pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                    title="Formato: MM/YY"
                    placeholder="MM/YY"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand p-3 border outline-none invalid:border-red-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input 
                    type="password" 
                    required
                    pattern="[0-9]{3,4}"
                    placeholder="123"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand p-3 border outline-none invalid:border-red-500"
                  />
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

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Resumen del Pedido</h2>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-6">
              {cart.map(product => {
                const price = product.discount > 0 ? product.price * (1 - product.discount) : product.price;
                return (
                  <div key={product.id} className="flex items-center gap-4 border-b pb-4">
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md bg-gray-100" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-gray-800 line-clamp-1">{product.name}</h3>
                      <p className="text-gray-500 text-xs">Cant: {product.quantity}</p>
                    </div>
                    <p className="font-bold text-sm">S/. {(price * product.quantity).toFixed(2)}</p>
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