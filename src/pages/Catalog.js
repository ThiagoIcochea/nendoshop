import { useState } from "react";
import products from "../data/products";
import Card from "../components/Card";
import ParticlesBackground from "../components/ParticlesBackground";

export default function Catalog() {

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const indexLast = currentPage * productsPerPage;
  const indexFirst = indexLast - productsPerPage;
  const currentProducts = products.slice(indexFirst, indexLast);

  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <div className="relative min-h-screen px-6 py-6 overflow-hidden bg-transparent">

      
      <ParticlesBackground />

      
      <div className="relative z-10">

        {/* TITULO */}
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Catálogo de Nendoroids
        </h1>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentProducts.map((p) => (
            <Card key={p.id} {...p} />
          ))}
        </div>

        {/* PAGINACIÓN */}
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