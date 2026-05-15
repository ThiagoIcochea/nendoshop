import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Dashboard() {

 const navigate = useNavigate();

 // Se verifica autenticación y permisos del usuario
  useEffect(() => {

    //Obtener usuario autenticado desde localStorage
    const auth = JSON.parse(localStorage.getItem("auth"));

    if (!auth) {
      navigate("/login");
      return;
    }

    // Si el usuario no tiene rol de admin, redirigir al inicio

    if (auth.role !== "admin") {
      navigate("/");
      return;
    }

  }, [navigate]);

  const [pagos, setPagos] = useState([]);

  useEffect(() => {

    const pagosGuardados =
      JSON.parse(localStorage.getItem("pagos")) || [];

    setPagos(pagosGuardados);
  }, []);

  const logout = () => {
    //Eliminar usuario autenticado y redigir al login
    localStorage.removeItem("auth");
    navigate("/login");

  };

  // Calcular total de ventas sumando todos los pagos
  const totalVentas = pagos.reduce(
    (acc, pago) => acc + pago.total,
    0
  );

  return (

    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-purple-600">
            Dashboard Admin
          </h1>

          <p className="text-gray-500 mt-1">
            Panel de administración de pagos
          </p>

        </div>

        <button
          onClick={logout}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
          Cerrar sesión
        </button>

      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-green-500">
          <p className="text-gray-500 text-sm">
            Total Ventas
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            S/ {totalVentas.toFixed(2)}
          </h2>

        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-purple-500">

          <p className="text-gray-500 text-sm">
            Total Pagos
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {pagos.length}
          </h2>

        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-blue-500">
          <p className="text-gray-500 text-sm">
            Último Pago
          </p>

          <h2 className="text-2xl font-bold text-blue-500 mt-2">
            {pagos.length > 0 ? pagos[pagos.length - 1].fecha : "Sin pagos"}

          </h2>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Historial de pagos </h2>

        {pagos.length === 0 ? (

          <div className="text-center py-10">
            <p className="text-gray-500">
              No hay pagos registrados </p>

          </div>

        ) : (

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-4">Cliente</th>
                  <th className="pb-4">Producto</th>
                  <th className="pb-4">Fecha</th>
                  <th className="pb-4">Total</th>
                  <th className="pb-4">Estado</th>

                </tr>
              </thead>
              <tbody>

                {pagos.map((pago) => (

                  <tr
                    key={pago.id}
                    className="border-b hover:bg-gray-50 transition">

                    <td className="py-4 font-medium">
                      {pago.cliente}
                    </td>

                    <td className="py-4">
                      {pago.producto}
                    </td>

                    <td className="py-4">
                      {pago.fecha}
                    </td>

                    <td className="py-4 font-bold text-green-600">
                      S/ {pago.total}
                    </td>

                    <td className="py-4">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {pago.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}