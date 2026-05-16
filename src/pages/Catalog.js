import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Card from "../components/Card";
import ParticlesBackground from "../components/ParticlesBackground";
import { FilterX } from "lucide-react";

export default function Catalog() {

  const [products, setProducts] = useState([]);

useEffect(() => {
  fetch("http://localhost:4000/api/products",{
    credentials: "include"
  })
    .then(res => res.json())
    .then(data => {
      setProducts(Array.isArray(data) ? data : data.products || []);
    });
}, []);

  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    stock: "",
    discount: "",
    sort: ""
  });

  const [search, setSearch] = useState("");

  const productsPerPage = 8;

  const clearFilters = () => {

   setFilters({
    category: "",
    brand: "",
    stock: "",
    discount: "",
    sort: ""
   })

    localStorage.removeItem("productSearch");

    setCurrentPage(1);
  };

  useEffect(() => {

    const updateSearch = () => {
      const savedSearch = localStorage.getItem("productSearch") || "";
      setSearch(savedSearch);
      setCurrentPage(1);
    };

    updateSearch();

    window.addEventListener("storage", updateSearch);

    return () => {
      window.removeEventListener("storage", updateSearch);
    };

  }, [location]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });

    setCurrentPage(1);
  };

  let filteredProducts = [...products];

  if (search.trim() !== "") {
    filteredProducts = filteredProducts.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (filters.category) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.specs.categoria.toLowerCase() ===
        filters.category.toLowerCase()
    );
  }

  if (filters.brand) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.specs.marca.toLowerCase() ===
        filters.brand.toLowerCase()
    );
  }

  if (filters.stock === "available") {
    filteredProducts = filteredProducts.filter((p) => p.stock > 0);
  }

  if (filters.discount === "discount") {
    filteredProducts = filteredProducts.filter((p) => p.discount > 0);
  }

  if (filters.sort === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (filters.sort === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  const indexLast = currentPage * productsPerPage;
  const indexFirst = indexLast - productsPerPage;

  const currentProducts = filteredProducts.slice(indexFirst, indexLast);

  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage
  );

  return (
    <div className="relative min-h-screen px-6 py-6 overflow-hidden bg-transparent">

      <ParticlesBackground />

      <div className="relative z-10">

        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Catálogo de Nendoroids
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="border p-3 rounded-lg"
          >
            <option value="">Todas las categorías</option>
            <option value="Nendoroid">Nendoroid</option>
          </select>

          <select
            name="brand"
            value={filters.brand}
            onChange={handleFilterChange}
            className="border p-3 rounded-lg"
          >
            <option value="">Todas las marcas</option>
            <option value="Good Smile Company">
              Good Smile Company
            </option>
          </select>

          <select
            name="stock"
            value={filters.stock}
            onChange={handleFilterChange}
            className="border p-3 rounded-lg"
          >
            <option value="">Stock</option>
            <option value="available">Disponible</option>
          </select>

          <select
            name="discount"
            value={filters.discount}
            onChange={handleFilterChange}
            className="border p-3 rounded-lg"
          >
            <option value="">Descuento</option>
            <option value="discount">Con descuento</option>
          </select>

          <select
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            className="border p-3 rounded-lg md:col-span-4"
          >
            <option value="">Ordenar</option>
            <option value="price-asc">
              Precio menor a mayor
            </option>
            <option value="price-desc">
              Precio mayor a menor
            </option>
          </select>

          <div className="flex justify-start mb-6">

  <button
    onClick={clearFilters}
      
    className="flex items-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
  >
    <FilterX className="w-5 h-5" />
    Limpiar filtros
  </button>

</div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentProducts.map((p) => (
            <Card key={p._id} {...p} />
          ))}
        </div>

        {currentProducts.length === 0 && (
          <div className="text-center mt-10 text-gray-500 text-lg">
            No se encontraron productos
          </div>
        )}

        <div className="flex justify-center mt-8 gap-2">

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
                currentPage === i + 1
                  ? "bg-brand text-white"
                  : "bg-gray-200"
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