import { Filter, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import products from "../data/products";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <section className="mb-12 relative rounded-2xl overflow-hidden border border-brand bg-white shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-transparent z-10 flex flex-col justify-center px-12">
            <h2 className="text-5xl font-black text-gray-900 tracking-tight mb-4 drop-shadow-sm">
              Nendoshop
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md font-medium">
              Descubre las mejores figuras coleccionables y Nendoroids con detalles increíbles.
            </p>
            <div>
              <button className="px-8 py-3 rounded-full border-2 border-brand text-brand font-bold hover:bg-brand hover:text-white transition-all duration-300 shadow-sm" 
              onClick={() => navigate("/catalog")}>
                Descubrir Mas
              </button>
            </div>
          </div>

          <div className="h-[400px] w-full flex justify-end bg-gray-50">
             <img 
              src="template-banner.jpg" 
              alt="Nendoroid Hero Banner" 
              className="h-full w-2/3 object-cover object-center"
            />
          </div>
        </section>

        <section className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 cursor-pointer group">
            <Filter className="h-5 w-5 text-brand group-hover:text-brand-dark transition-colors" />
            <span className="text-brand font-semibold group-hover:text-brand-dark transition-colors">
              Filtro
            </span>
          </div>

          <div className="relative">
            <select className="appearance-none bg-white border border-brand text-gray-700 py-2 pl-4 pr-10 rounded-full focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium cursor-pointer">
              <option>Mas vendidos</option>
              <option>Precio: Menor a Mayor</option>
              <option>Precio: Mayor a Menor</option>
              <option>Nuevos</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
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
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
                      {product.name}
                    </h3>
                    <p className="text-xl font-black text-brand mb-4">
                      S/. {product.price.toFixed(2)}
                    </p>
                  </div>
                  
                  <button className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg">
                    Comprar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}