import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Pagos() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  
  // Estados del flujo
  const [paymentStatus, setPaymentStatus] = useState("inactivo");
  const [paso, setPaso] = useState(1); // 1 = Envío/Facturación, 2 = Tarjeta

  const [user, setUser] = useState(null);
  
  // EL NUEVO ESTADO CONSOLIDADO 
  const [envioDatos, setEnvioDatos] = useState({
    tipoComprobante: "boleta", // boleta o factura
    documento: "",             // DNI o RUC
    razonSocial: "",
    metodoEnvio: "delivery",   // delivery o presencial
    direccionEntrega: {
      calle: "",
      distrito: ""
    },
    referencia: ""
  });

  const [card, setCard] = useState({
  cardName: "",
  cardNumber: "",
  cardCVV: "",
  cardType: "visa"
});

  // Guardián del carrito
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cart")) || [];
    if (data.length === 0) {
      navigate("/catalog");
      return;
    }
    setCart(data);
  }, [navigate]);

  // Cargar usuario
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
      } catch (err) {
        console.log(err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {

  if (user?.paymentmethod) {

    setCard({
      cardName: user.paymentmethod.nombretarjeta || "",
      cardNumber: user.paymentmethod.numerotarjeta || "",
      cardCVV: user.paymentmethod.cvv || "",
      cardType: user.paymentmethod.tipo || "visa"
    });

  }

}, [user]);

  const total = cart.reduce((acc, p) => {
    const price = p.discount > 0 ? p.price * (1 - p.discount) : p.price;
    return acc + price * p.quantity;
  }, 0);

  // Manejador genérico para el estado anidado de dirección
  const handleDireccionChange = (e) => {
    setEnvioDatos({
      ...envioDatos,
      direccionEntrega: {
        ...envioDatos.direccionEntrega,
        [e.target.name]: e.target.value
      }
    });
  };

  //Validaciones del 1er Estado
  const avanzarPaso = (e) => {
    e.preventDefault();
    
    if (envioDatos.tipoComprobante === "boleta" && envioDatos.documento.length !== 8) {
      alert("⚠️ Error de Validación: El DNI debe tener exactamente 8 dígitos.");
      return; 
    }

    if (envioDatos.tipoComprobante === "factura") {
      if (envioDatos.documento.length !== 11) {
        alert("⚠️ Error de Validación: El RUC debe tener exactamente 11 dígitos.");
        return;
      }
      if (!envioDatos.razonSocial.trim()) {
        alert("⚠️ Error de Validación: La Razón Social es obligatoria para Facturas.");
        return;
      }
    }

    // 2. Validar Dirección (Solo si es Delivery)
    if (envioDatos.metodoEnvio === "delivery") {
      if (!envioDatos.direccionEntrega.calle.trim() || !envioDatos.direccionEntrega.distrito.trim()) {
        alert("⚠️ Error de Validación: Por favor, completa la calle y el distrito para el envío.");
        return;
      }
    }
    setPaso(2);
  };

  // EL FETCH PARA SERVIDOR DE RENDER
  const handlePayment = async (e) => {
    e.preventDefault();

    if (card.cardNumber.length < 16) {
      return alert("Por favor, completa los 16 dígitos de la tarjeta.");
    }
  
    if (card.cardCVV.length < 3) {
      alert("⚠️ Error de Facturación: El código CVV es inválido.");
      return;
    }

    setPaymentStatus("procesando");
    setTimeout(async () => {
      try {
      
        setPaymentStatus("procesando");
  
      const paymentData = {
        cliente: user ? `${user.name} ${user.lastname}` : "Cliente Anónimo",
        
        // Lógica de Comprobante
        tipo_comprobante: envioDatos.tipoComprobante,
        documento: envioDatos.documento,
        razon_social: envioDatos.tipoComprobante === "factura" ? envioDatos.razonSocial : undefined,
        
        // Lógica de Envío
        metodo_envio: envioDatos.metodoEnvio,
        direccion_entrega: envioDatos.metodoEnvio === "delivery" 
          ? `${envioDatos.direccionEntrega.calle}, ${envioDatos.direccionEntrega.distrito}` 
          : "Recojo en Tienda: Av. Arequipa 265, Lima - Perú",
        referencia: envioDatos.metodoEnvio === "delivery" ? envioDatos.referencia : undefined,
        
        envio: envioDatos.metodoEnvio === "delivery" ? 15.00 : 0, // Costo dinámico (opcional)
        productos: cart.map(p => ({
          name: p.name,
          quantity: p.quantity,
          price: p.price
        })),
        total: envioDatos.metodoEnvio === "delivery" ? total + 15 : total,
        estado: "Pagado"
      };

      const res = await fetch("https://backendproyectodf.onrender.com/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(paymentData)
      });

      if (!res.ok) throw new Error("Error en pago");

      setPaymentStatus("exito");
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("storage"));

      setTimeout(() => { navigate("/", { replace: true }); }, 1500);

    } catch (err) {
      console.log(err);
      alert("Error al procesar pago");
      setPaymentStatus("inactivo");
    }
  }, 2000);
};

  return (
    <div className="relative min-h-screen bg-gray-50 p-4 md:p-10">
      
      {/* MODAL DE CARGA */}
      {paymentStatus !== "inactivo" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center transform transition-all scale-105">
            {paymentStatus === "procesando" ? (
              <>
                <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-gray-800">Procesando pago...</h2>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">¡Pago Exitoso!</h2>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

          {/* COLUMNA IZQUIERDA: EL WIZARD */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            
            {/* PASO 1: FACTURACIÓN Y ENVÍO */}
            {paso === 1 && (
              <form onSubmit={avanzarPaso} className="animate__animated animate__fadeIn space-y-8">
                <div className="flex items-center gap-3 border-b pb-2">
                  <div className="bg-brand text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                  <h2 className="text-xl font-bold text-gray-800">Datos de Facturación y Envío</h2>
                </div>

                {/* BLOQUE A: COMPROBANTE DE PAGO */}
                <div>
                  <h3 className="text-md font-semibold text-gray-700 mb-3">Tipo de Comprobante</h3>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="comprobante" value="boleta" checked={envioDatos.tipoComprobante === "boleta"} onChange={(e) => setEnvioDatos({ ...envioDatos, tipoComprobante: e.target.value, documento: "", razonSocial: "" })} className="w-4 h-4 text-brand" />
                      <span>Boleta</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="comprobante" value="factura" checked={envioDatos.tipoComprobante === "factura"} onChange={(e) => setEnvioDatos({ ...envioDatos, tipoComprobante: e.target.value, documento: "" })} className="w-4 h-4 text-brand" />
                      <span>Factura</span>
                    </label>
                  </div>

                  {/* Renderizado dinámico según el comprobante */}
                  {envioDatos.tipoComprobante === "boleta" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label> 
                      <span className={`text-xs ${envioDatos.documento.length === 8 ? 'text-green-600 font-bold' : 'text-red-400'}`}>
                    {envioDatos.documento.length}/8
                  </span>
                      <input type="text" value={envioDatos.documento} onChange={(e) => setEnvioDatos({ ...envioDatos, documento: e.target.value.replace(/\D/g, '').slice(0, 8) })} required placeholder="Ej. 76543210" className="w-full border-gray-300 rounded-lg p-3 border outline-none focus:ring-brand" />
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>

                        <input type="text" value={envioDatos.documento} onChange={(e) => setEnvioDatos({ ...envioDatos, documento: e.target.value.replace(/\D/g, '').slice(0, 11) })} required placeholder="Ej. 20123456789" className="w-full border-gray-300 rounded-lg p-3 border outline-none focus:ring-brand" />
                      </div>
                      <span className={`text-xs ${envioDatos.documento.length === 11 ? 'text-green-600 font-bold' : 'text-red-400'}`}>
                    {envioDatos.documento.length}/11
                  </span>
                      <div className="flex-[2]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                        <input type="text" value={envioDatos.razonSocial} onChange={(e) => setEnvioDatos({ ...envioDatos, razonSocial: e.target.value })} required placeholder="Ej. Inversiones Nendo S.A.C." className="w-full border-gray-300 rounded-lg p-3 border outline-none focus:ring-brand" />
                      </div>
                    </div>
                  )}
                </div>

                {/* BLOQUE B: MÉTODO DE ENTREGA */}
                <div className="pt-4 border-t">
                  <h3 className="text-md font-semibold text-gray-700 mb-3">Método de Entrega</h3>
                  <select 
                    value={envioDatos.metodoEnvio} 
                    onChange={(e) => setEnvioDatos({ ...envioDatos, metodoEnvio: e.target.value, direccionEntrega: { calle: "", distrito: "" }, referencia: "" })} 
                    className="w-full mb-5 border-gray-300 rounded-lg p-3 border outline-none focus:ring-brand bg-white"
                  >
                    <option value="delivery">Envío a Domicilio</option>
                    <option value="presencial">Recojo en Tienda</option>
                  </select>

                  {/* Renderizado dinámico según el método de entrega */}
                  {envioDatos.metodoEnvio === "delivery" ? (
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-[2]">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Avenida / Calle y Número</label>
                          <input type="text" name="calle" value={envioDatos.direccionEntrega.calle} onChange={handleDireccionChange} required placeholder="Ej. Av. Los Postes 123" className="w-full border-gray-300 rounded-lg p-3 border outline-none focus:ring-brand" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
                          <input type="text" name="distrito" value={envioDatos.direccionEntrega.distrito} onChange={handleDireccionChange} required placeholder="Ej. SJL" className="w-full border-gray-300 rounded-lg p-3 border outline-none focus:ring-brand" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
                        <input type="text" value={envioDatos.referencia} onChange={(e) => setEnvioDatos({ ...envioDatos, referencia: e.target.value })} placeholder="Ej. Frente a la panadería" className="w-full border-gray-300 rounded-lg p-3 border outline-none focus:ring-brand" />
                      </div>
                    </div>
                  ) : (
                    // La Tarjeta Elegante con el Iframe
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-inner">
                      <div className="flex items-center gap-3 mb-2">
                        <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <h4 className="font-bold text-gray-800 text-lg">Tienda Principal NendoShop</h4>
                      </div>
                      <p className="text-gray-600 mb-4 ml-9">Av. Arequipa 265, Lima - Perú</p>
                      <div className="rounded-lg overflow-hidden border border-gray-300">
                        {/* Iframe de Google Maps incrustado */}
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.7828004149955!2d-77.03816652414346!3d-12.058455842245238!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8c6db20b335%3A0xcab528f44d5cf301!2sAv.%20Arequipa%20265%2C%20Lima%2015046!5e0!3m2!1ses-419!2spe!4v1715480000000!5m2!1ses-419!2spe" width="100%" height="200" style={{border:0}} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Mapa de la Tienda"></iframe>
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-gray-900 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-gray-800 transition-colors">
                  Siguiente: Método de Pago
                </button>
              </form>
            )}

            {/* PASO 2: TARJETA DE CRÉDITO */}
            {paso === 2 && (
              <form onSubmit={handlePayment} className="animate__animated animate__fadeIn">
                <div className="flex items-center justify-between mb-6 border-b pb-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                    <h2 className="text-xl font-bold text-gray-800">Método de Pago</h2>
                  </div>
                  <button type="button" onClick={() => setPaso(1)} className="text-sm text-brand hover:underline font-medium">← Volver a Envío</button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre en la tarjeta</label>
                    <input name="cardName" value={card.cardName} onChange={(e) => setCard({ ...card, cardName: e.target.value })} type="text" required placeholder="Ej. Débito" className="w-full border-gray-300 rounded-lg p-3 border outline-none focus:ring-brand" />
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <label className="block text-sm font-medium text-gray-700">Número de Tarjeta</label>
                      <span className={`text-xs ${card.cardNumber.length === 16 ? 'text-green-600 font-bold' : 'text-red-400'}`}>{card.cardNumber.length}/16</span>
                    </div>
                    <input name="cardNumber" value={card.cardNumber} onChange={(e) => setCard({ ...card, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })} type="text" required placeholder="0000 0000 0000 0000" className="w-full border-gray-300 rounded-lg p-3 border outline-none focus:ring-brand" />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <label className="block text-sm font-medium text-gray-700">CVV</label>
                        <span className={`text-xs ${card.cardCVV.length === 3 ? 'text-green-600 font-bold' : 'text-red-400'}`}>{card.cardCVV.length}/3</span>
                      </div>
                      <input name="cardCVV" value={card.cardCVV} onChange={(e) => setCard({ ...card, cardCVV: e.target.value.replace(/\D/g, '').slice(0, 3) })} type="password" required placeholder="123" className="w-full border-gray-300 rounded-lg p-3 border outline-none focus:ring-brand" />
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <select name="cardType" value={card.cardType} onChange={(e) => setCard({ ...card, cardType: e.target.value })} className="w-full border-gray-300 rounded-lg p-3 border outline-none focus:ring-brand bg-white">
                        <option value="visa">Visa</option>
                        <option value="mastercard">MasterCard</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full mt-8 bg-brand text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-brand/90 transition-colors">
                  Confirmar y Pagar
                </button>
              </form>
            )}
          </div>

          {/* COLUMNA DERECHA: RESUMEN */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-6">
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
                <span className="font-medium text-gray-900">{envioDatos.metodoEnvio === "delivery" ? "S/. 15.00" : <span className="text-green-600">Gratis (Recojo)</span>}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 mt-4 border-t pt-4">
                <span>Total</span>
                <span>S/. {envioDatos.metodoEnvio === "delivery" ? (total + 15).toFixed(2) : total.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}