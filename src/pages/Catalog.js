import { useState } from "react";
import products from "../data/products";

export default function Catalog() {

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;


  const indexLast = currentPage * productsPerPage;
  const indexFirst = indexLast - productsPerPage;
  const currentProducts = products.slice(indexFirst, indexLast);

  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Catálogo de Nendoroids
      </h1>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentProducts.map((product) => (
          <div 
            key={product.id} 
            className="bg-white rounded-xl overflow-hidden border border-brand flex flex-col hover:shadow-lg transition-shadow duration-300 group"
          >
            <div className="h-64 overflow-hidden bg-gray-50 relative p-4 flex items-center justify-center">
              <img 
                src={product.image} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between border-t border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-xl font-black text-brand mb-4">
                  S/. {product.price.toFixed(2)}
                </p>
              </div>

              <button className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-lg transition">
                Comprar
              </button>
            </div>
          </div>
        ))}
      </div>

     
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
  );
}