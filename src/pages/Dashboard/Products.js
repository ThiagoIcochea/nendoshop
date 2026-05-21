import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import Swal from "sweetalert2";

export default function Products() {

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  useEffect(() => {
    const load = async () => {
      const res = await fetch("https://backendproyectodf.onrender.com/api/products");
      const data = await res.json();

      if (res.ok) {
        setProducts(Array.isArray(data) ? data : data.products || []);
      }
    };

    load();
  }, []);

  const validateField = (field, value) => {
    if (["price", "stock", "discount"].includes(field)) {
      const num = Number(value);
      if (value === "" || isNaN(num)) return null;
      if (num < 0) return null;
      return num;
    }
    return value;
  };

  const updateField = async (id, field, value) => {
    const validated = validateField(field, value);

    if (validated === null) {
      Swal.fire("Error 630", "Valor inválido", "Error");
      return;
    }

    await fetch(`https://backendproyectodf.onrender.com/api/admin/products/${id}/${field}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ [field]: validated })
    });

    setProducts(prev =>
      prev.map(p => (p._id === id ? { ...p, [field]: validated } : p))
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase());

    const matchCategory = category
      ? p.specs?.categoria?.toLowerCase() === category.toLowerCase()
      : true;

    return matchSearch && matchCategory;
  });

  let sortedProducts = [...filteredProducts];

  if (sort === "price-asc") {
    sortedProducts.sort((a, b) => a.price - b.price);
  }

  if (sort === "price-desc") {
    sortedProducts.sort((a, b) => b.price - a.price);
  }

  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 animate__animated animate__fadeIn">

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-purple-600">Productos</h1>
          <p className="text-gray-500 mt-1">Gestión de catálogo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-purple-500">
          <p className="text-gray-500 text-sm">Total productos</p>
          <h2 className="text-2xl md:text-3xl font-bold text-purple-600 mt-2">{products.length}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-green-500">
          <p className="text-gray-500 text-sm">Con descuento</p>
          <h2 className="text-2xl md:text-3xl font-bold text-green-600 mt-2">
            {products.filter(p => (p.discount || 0) > 0).length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-blue-500">
          <p className="text-gray-500 text-sm">Stock alto</p>
          <h2 className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">
            {products.filter(p => (p.stock || 0) >= 10).length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-red-500">
          <p className="text-gray-500 text-sm">Sin descuento</p>
          <h2 className="text-2xl md:text-3xl font-bold text-red-600 mt-2">
            {products.filter(p => !p.discount || p.discount === 0).length}
          </h2>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Todas las categorías</option>
            <option value="Nendoroid">Nendoroid</option>
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Ordenar</option>
            <option value="price-asc">Precio menor a mayor</option>
            <option value="price-desc">Precio mayor a menor</option>
          </select>

        </div>

        <div className="flex justify-start mt-4">
          <button
            onClick={() => {
              setSearch("");
              setCategory("");
              setSort("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            Limpiar filtros
          </button>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 animate__animated animate__fadeIn">

        
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-4">Nombre</th>
                <th className="pb-4">Precio</th>
                <th className="pb-4">Stock</th>
                <th className="pb-4">Descuento</th>
              </tr>
            </thead>

            <tbody>
              {currentProducts.map((p) => (
                <tr key={p._id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-4 font-medium">
                    {p.name}
                    <Pencil
                      size={16}
                      className="ml-2 inline text-gray-500 hover:text-purple-600 cursor-pointer"
                      onClick={() => {
                        const v = prompt("Nuevo nombre", p.name);
                        if (v) updateField(p._id, "name", v);
                      }}
                    />
                  </td>

                  <td className="py-4">
                    {p.price}
                    <Pencil
                      size={16}
                      className="ml-2 inline text-gray-500 hover:text-purple-600 cursor-pointer"
                      onClick={() => {
                        const v = prompt("Nuevo precio", p.price);
                        if (v) updateField(p._id, "price", v);
                      }}
                    />
                  </td>

                  <td className="py-4">
                    {p.stock}
                    <Pencil
                      size={16}
                      className="ml-2 inline text-gray-500 hover:text-purple-600 cursor-pointer"
                      onClick={() => {
                        const v = prompt("Nuevo stock", p.stock);
                        if (v) updateField(p._id, "stock", v);
                      }}
                    />
                  </td>

                  <td className="py-4">
                    {p.discount || 0}
                    <Pencil
                      size={16}
                      className="ml-2 inline text-gray-500 hover:text-purple-600 cursor-pointer"
                      onClick={() => {
                        const v = prompt("Nuevo descuento", p.discount || 0);
                        if (v) updateField(p._id, "discount", v);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden space-y-4">
          {currentProducts.map((p) => (
            <div key={p._id} className="bg-gray-50 rounded-xl p-4 shadow-sm">

              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">{p.name}</span>
                <Pencil
                  size={16}
                  className="text-gray-500"
                  onClick={() => {
                    const v = prompt("Nuevo nombre", p.name);
                    if (v) updateField(p._id, "name", v);
                  }}
                />
              </div>

              <div className="text-sm text-gray-600 flex justify-between">
                <span>Precio: {p.price}</span>
                <Pencil
                  size={16}
                  className="text-gray-500"
                  onClick={() => {
                    const v = prompt("Nuevo precio", p.price);
                    if (v) updateField(p._id, "price", v);
                  }}
                />
              </div>

              <div className="text-sm text-gray-600 flex justify-between">
                <span>Stock: {p.stock}</span>
                <Pencil
                  size={16}
                  className="text-gray-500"
                  onClick={() => {
                    const v = prompt("Nuevo stock", p.stock);
                    if (v) updateField(p._id, "stock", v);
                  }}
                />
              </div>

              <div className="text-sm text-gray-600 flex justify-between">
                <span>Descuento: {p.discount || 0}</span>
                <Pencil
                  size={16}
                  className="text-gray-500"
                  onClick={() => {
                    const v = prompt("Nuevo descuento", p.discount || 0);
                    if (v) updateField(p._id, "discount", v);
                  }}
                />
              </div>

            </div>
          ))}
        </div>

      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-6">

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
            className={`px-4 py-2 rounded ${currentPage === i + 1 ? "bg-purple-600 text-white" : "bg-gray-200"}`}
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
  );
}