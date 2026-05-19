import { Link } from "react-router-dom";
import E404 from "../components/Assets/E404.png";

export default function NotFound() {
  return (
    <div 
      className="min-h-screen bg-white relative overflow-hidden pt-12 lg:pt-24 bg-puntos bg-puntos-sm"
      style={{
        backgroundImage: 'radial-gradient(#b0b3b8 14%, transparent 18%)',
        backgroundSize: '10px 10px',
      }}
    >
        
      <main className="flex-grow relative z-10 flex flex-col lg:flex-row items-center justify-center px-4 gap-8 lg:gap-4">
        <div className="flex-shrink-0 w-full lg:w-1/2 flex items-center justify-center lg:justify-end">
          <img
            src={E404}
            alt="ERROR 404 - Item Not Found"
            className="w-full max-w-lg lg:max-w-2xl h-auto drop-shadow-lg hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl font-bold text-brand mb-4 tracking-tight">
              ¡ERROR 404!
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 font-medium leading-relaxed">
              Esta página está{" "}
              <span className="text-brand font-bold italic">
                "No Disponible"
              </span>{" "}
              en nuestro catálogo,
              <br className="hidden lg:block" />
              ¡parece que este Nendoroid se ha extraviado!
            </p>
          </div>

          <div className="mt-12 flex flex-col lg:flex-row gap-4 lg:gap-6 justify-center lg:justify-start">
            <Link
              to="/catalog"
              className="inline-block px-8 sm:px-12 py-4 border-2 border-brand text-brand font-bold text-lg rounded-lg hover:bg-brand hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              Volver al Catálogo
            </Link>

            <Link
              to="/"
              className="inline-block px-8 sm:px-12 py-4 text-brand hover:text-brand-dark font-medium transition-colors underline self-center lg:self-auto"
            >
              O regresa a inicio
            </Link>
          </div>
        </div>
      </main>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand opacity-5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
