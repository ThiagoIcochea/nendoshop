import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { BACKEND_URL } from "../../utils/config";
import { getPaymentStatusLabel, getPaymentStatusOptions, getPaymentStatusSeries, normalizePaymentStatus } from "../../utils/paymentStatuses";

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
        const authData = JSON.parse(localStorage.getItem("auth"));
        const token = authData?.token || localStorage.getItem("token");

        const headers = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${BACKEND_URL}/api/admin/payments`, {
          method: "GET",
          headers,
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

  

  const totalVentas = pagos.reduce(
    (acc, pago) => acc + (pago.total || 0),
    0
  );
  const paymentStateSeries = getPaymentStatusSeries(pagos);

  const exportToPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 36;
    const lineHeight = 16;

    const formatCurrency = (value) => `S/ ${Number(value || 0).toFixed(2)}`;
    const splitText = (text, maxWidth) => doc.splitTextToSize(text || "", maxWidth);
    doc.setFillColor(109, 40, 217);
    doc.rect(0, 0, pageWidth, 90, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Reporte de pagos", margin, 38);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generado el ${new Date().toLocaleString("es-ES")}`, margin, 58);
    doc.text(`Total de pagos: ${pagos.length}`, margin, 74);

    doc.setTextColor(30, 30, 30);
    doc.setFillColor(245, 242, 255);
    doc.roundedRect(margin, 108, pageWidth - margin * 2, 70, 10, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Resumen", margin + 16, 128);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Ventas totales: ${formatCurrency(totalVentas)}`, margin + 16, 148);
    doc.text(`Pagos registrados: ${pagos.length}`, margin + 16, 162);
    doc.text(`Estado principal: ${paymentStateSeries[0]?.name || "Sin pagos"}`, pageWidth / 2 + 8, 148);

    let y = 210;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(109, 40, 217);
    doc.text("Detalle", margin, y);
    doc.setDrawColor(225, 225, 225);
    doc.line(margin, y + 6, pageWidth - margin, y + 6);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("#", margin, y + 24);
    doc.text("Cliente", margin + 28, y + 24);
    doc.text("Producto", margin + 140, y + 24);
    doc.text("Estado", margin + 300, y + 24);
    doc.text("Total", pageWidth - 90, y + 24);
    doc.line(margin, y + 30, pageWidth - margin, y + 30);

    doc.setFont("helvetica", "normal");
    pagos.forEach((pago, index) => {
      if (y > pageHeight - 80) {
        doc.addPage();
        y = 40;
        doc.setDrawColor(225, 225, 225);
        doc.line(margin, y, pageWidth - margin, y);
      }

      const productText = pago.productos
        ? pago.productos.map((item) => item.name).join(", ")
        : pago.producto || "Sin producto";
      const lines = splitText(productText, 140);
      const rowHeight = Math.max(18, lines.length * 10 + 8);

      doc.text(String(index + 1), margin, y + 14);
      doc.text(splitText(pago.cliente || "Cliente", 90)[0] || "Cliente", margin + 28, y + 14);
      doc.text(lines[0] || "", margin + 140, y + 14);
      doc.text(getPaymentStatusLabel(pago.estado || "Sin estado"), margin + 300, y + 14);
      doc.text(formatCurrency(pago.total || 0), pageWidth - 90, y + 14);
      doc.line(margin, y + 20 + rowHeight - 8, pageWidth - margin, y + 20 + rowHeight - 8);
      y += rowHeight;
    });

    doc.save("reporte-pagos.pdf");
  };

  const pagosFiltrados = pagos.filter((pago) => {

    const matchCliente = pago.cliente
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchProducto = pago.productos
      ? pago.productos.some(p =>
        p.name.toLowerCase().includes(producto.toLowerCase())
      )
      : pago.producto?.toLowerCase().includes(producto.toLowerCase());

    const matchEstado = estado ? normalizePaymentStatus(pago.estado) === estado : true;

    return matchCliente && matchProducto && matchEstado;
  });

  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;

  const currentPagos = pagosFiltrados.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(pagosFiltrados.length / itemsPerPage);

  return (

    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 md:p-6 transition-colors">

      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center mb-8">

        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-purple-600">
            Dashboard Admin
          </h1>
          <p className="text-gray-500 mt-1">
            Panel de administración de pagos
          </p>
        </div>

        

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-green-500">
          <p className="text-gray-500 text-sm">Total Ventas</p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">
            S/ {totalVentas.toFixed(2)}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total Pagos</p>
          <h2 className="text-3xl font-bold mt-2">
            {pagos.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-indigo-500">
          <p className="text-gray-500 text-sm">Último Pago</p>
          <h2 className="text-2xl font-bold text-blue-500 mt-2">
            {pagos.length > 0
              ? new Date(pagos[pagos.length - 1].fecha).toLocaleDateString("es-ES")
              : "Sin pagos"}
          </h2>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-6">

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
            className="w-full px-4 py-2 border rounded-lg"
          />

          <input
            type="text"
            placeholder="Buscar producto..."
            value={producto}
            onChange={(e) => {
              setProducto(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Todos los estados</option>
            {getPaymentStatusOptions(pagos).map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>

        </div>

        <div className="flex flex-wrap gap-2 mb-6">

          <button
            onClick={() => {
              setSearch("");
              setProducto("");
              setEstado("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Limpiar filtros
          </button>

          <button
            onClick={exportToPdf}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
          >
            Exportar PDF
          </button>

        </div>

        <div className="hidden md:block overflow-x-auto">

          <table className="w-full min-w-[600px]">

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

                <tr key={pago._id || pago.id} className="border-b">

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
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      {getPaymentStatusLabel(pago.estado)}
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <div className="md:hidden space-y-4">
          {currentPagos.map((pago) => (
            <div key={pago._id || pago.id} className="bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-800">{pago.cliente}</span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {getPaymentStatusLabel(pago.estado)}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Productos: </span>
                {pago.productos
                  ? pago.productos.map(p => p.name).join(", ")
                  : pago.producto}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{new Date(pago.fecha).toLocaleDateString("es-ES")}</span>
                <span className="font-bold text-green-600 text-sm">S/ {pago.total}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6">

          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded disabled:opacity-50 transition-colors"
          >
            Anterior
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded transition-colors ${currentPage === i + 1 ? "bg-purple-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded disabled:opacity-50 transition-colors"
          >
            Siguiente
          </button>

        </div>

      </div>

    </div>
  );
}
