import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Payments() {

  const navigate = useNavigate();

  const [pagos, setPagos] = useState([]);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [producto, setProducto] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {

    const auth = JSON.parse(localStorage.getItem("auth"));

    if (!auth) {
      navigate("/login");
      return;
    }

    if (auth.role !== "admin") {
      navigate("/");
      return;
    }

  }, [navigate]);

  useEffect(() => {

    const loadPayments = async () => {
      try {

        const res = await fetch("https://backendproyectodf.onrender.com/api/admin/payments", {
          method: "GET",
          credentials: "include"
        });

        const data = await res.json();

        if (!res.ok) return;

        setPagos(data);

      } catch (err) {
        console.log(err);
      }
    };

    loadPayments();

  }, []);

  const logout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  const totalVentas = pagos.reduce(
    (acc, pago) => acc + (pago.total || 0),
    0
  );

  const pagosFiltrados = pagos.filter((pago) => {

    const matchCliente = pago.cliente
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchProducto = pago.productos
      ? pago.productos.some(p =>
          p.name.toLowerCase().includes(producto.toLowerCase())
        )
      : pago.producto?.toLowerCase().includes(producto.toLowerCase());

    const matchEstado = estado ? pago.estado === estado : true;

    return matchCliente && matchProducto && matchEstado;
  });

  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;

  const currentPagos = pagosFiltrados.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(pagosFiltrados.length / itemsPerPage);

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="flex justify-between items-center mb-8">

        <div className="animate__animated animate__fadeInDown">
          <h1 className="text-4xl font-bold text-purple-600">
            Dashboard Admin
          </h1>
          <p className="text-gray-500 mt-1">
            Panel de administración de pagos
          </p>
        </div>

        <button
          onClick={logout}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
        >
          Cerrar sesión
        </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-green-500 animate__animated animate__fadeInUp animate__faster">
          <p className="text-gray-500 text-sm">Total Ventas</p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">
            S/ {totalVentas.toFixed(2)}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-blue-500 animate__animated animate__fadeInUp animate__faster">
          <p className="text-gray-500 text-sm">Total Pagos</p>
          <h2 className="text-3xl font-bold mt-2">
            {pagos.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-indigo-500 animate__animated animate__fadeInUp animate__faster">
          <p className="text-gray-500 text-sm">Último Pago</p>
          <h2 className="text-2xl font-bold text-blue-500 mt-2">
            {pagos.length > 0
              ? new Date(pagos[pagos.length - 1].fecha).toLocaleDateString("es-ES")
              : "Sin pagos"}
          </h2>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 animate__animated animate__fadeInUp">

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Historial de pagos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            type="text"
            placeholder="Buscar producto..."
            value={producto}
            onChange={(e) => {
              setProducto(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Todos los estados</option>
            <option value="Pagado">Pagado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Cancelado">Cancelado</option>
          </select>

        </div>

        <div className="flex justify-start mb-6">

          <button
            onClick={() => {
              setSearch("");
              setProducto("");
              setEstado("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            Limpiar filtros
          </button>

        </div>

        {pagos.length === 0 ? (

          <div className="text-center py-10">
            <p className="text-gray-500">
              No hay pagos registrados
            </p>
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b text-left text-gray-500">
                  <th className="pb-4">Usuario</th>
                  <th className="pb-4">Producto</th>
                  <th className="pb-4">Fecha</th>
                  <th className="pb-4">Total</th>
                  <th className="pb-4">Estado</th>
                </tr>

              </thead>

              <tbody>

                {currentPagos.map((pago) => (

                  <tr
                    key={pago._id || pago.id}
                    className="border-b hover:bg-gray-50 transition animate__animated animate__fadeInUp"
                  >

                    <td className="py-4 font-medium">{pago.cliente}</td>

                    <td className="py-4">
                      {pago.productos
                        ? pago.productos.map(p => p.name).join(", ")
                        : pago.producto}
                    </td>

                    <td className="py-4">
                      {new Date(pago.fecha).toLocaleDateString("es-ES")}
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

        <div className="flex justify-center gap-2 mt-6">

          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Anterior
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === i + 1 ? "bg-purple-600 text-white" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Siguiente
          </button>

        </div>

      </div>

    </div>
  );
}