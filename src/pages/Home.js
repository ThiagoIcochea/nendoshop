import { useEffect, useState } from "react";
import { Filter, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";


import Card from "../components/Card";
import ParticlesBackground from "../components/ParticlesBackground";

export default function Home() {

  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch("https://backendproyectodf.onrender.com/api/products", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : data.products || []);
      });
  }, []);

  const [sort, setSort] = useState("best");

  let filteredProducts = [...products];

  if (sort === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (sort === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  if (sort === "discount") {
    filteredProducts = filteredProducts.filter((p) => p.discount > 0);
  }

  if (sort === "stock") {
    filteredProducts.sort((a, b) => b.stock - a.stock);
  }

  return (

    <div className="relative min-h-screen pb-12 overflow-hidden bg-background">

      <ParticlesBackground />

      <div className="relative z-10">

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

          <section className="mb-12 relative rounded-2xl overflow-hidden border border-brand bg-white shadow-sm" style={{ backgroundColor: "#ffffff" }}>

            <div
              className="animate__animated animate__fadeInLeft absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent z-10 flex flex-col justify-center px-6 sm:px-12"
              style={{ background: "linear-gradient(to right, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 60%, transparent 100%)" }}
            >

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4" style={{ color: "#111827" }}>
                Nendoshop
              </h2>

              <p className="text-sm sm:text-lg mb-6 sm:mb-8 max-w-md font-medium" style={{ color: "#4b5563" }}>
                Descubre las mejores figuras coleccionables y Nendoroids con detalles increíbles.
              </p>

              <div>
                <button
                  className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-full border-2 border-brand text-brand font-bold hover:bg-brand hover:text-white transition"
                  onClick={() => navigate("/catalog")}
                >
                  Descubrir Más
                </button>
              </div>

            </div>

            <div
              className="h-[260px] sm:h-[420px] w-full flex justify-center sm:justify-end"
              style={{ backgroundColor: "#ffffff" }}
            >
              <img
                src="template-banner.png"
                alt="Nendoroid Hero Banner"
                className="h-full w-full sm:w-2/3 object-contain object-center animate__animated animate__fadeInRight"
              />
            </div>

          </section>

          <section className="flex flex-row justify-between items-center mb-6 bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-brand" style={{ backgroundColor: "#ffffff" }}>

            <div className="flex items-center gap-2 cursor-pointer group text-sm sm:text-base">
              <Filter className="h-5 w-5 text-brand group-hover:text-brand-dark transition-colors" />

              <span className="text-brand font-semibold group-hover:text-brand-dark transition-colors">
                Filtro
              </span>
            </div>

            <div className="relative">

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none w-full sm:w-auto bg-white border border-brand text-sm sm:text-base py-2 pl-3 sm:pl-4 pr-8 sm:pr-10 rounded-full focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand font-medium cursor-pointer"
                style={{ backgroundColor: "#ffffff", color: "#374151" }}
              >
                <option value="best" style={{ backgroundColor: "#ffffff", color: "#374151" }}>Mas vendidos</option>
                <option value="price-asc" style={{ backgroundColor: "#ffffff", color: "#374151" }}>Precio: Menor a Mayor</option>
                <option value="price-desc" style={{ backgroundColor: "#ffffff", color: "#374151" }}>Precio: Mayor a Menor</option>
                <option value="discount" style={{ backgroundColor: "#ffffff", color: "#374151" }}>Con descuento</option>
                <option value="stock" style={{ backgroundColor: "#ffffff", color: "#374151" }}>Mayor stock</option>
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand">
                <ChevronDown className="h-4 w-4" />
              </div>

            </div>

          </section>

          <section>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">

              {products.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} loading={true} />
                ))
                : filteredProducts.slice(0, 4).map((p, i) => (
                  <div
                    key={p._id}
                    className="animate__animated animate__fadeInUp"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <Card {...p} />
                  </div>
                ))
              }
            </div>

          </section>

        </main>

      </div>

    </div>
  );
}