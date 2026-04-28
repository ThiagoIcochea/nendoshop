import logo from "./Assets/logo.png";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-purple-700 text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">

        <div>
          <div className="mb-5">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <img src={logo} alt="NendoShop" className="w-14 h-14 object-contain" />
            </div>
          </div>

          <p className="mb-4">⌖ Av. Arequipa 265, Lima - Perú</p>
          <p className="mb-4">☏ +51 901 234 567</p>
          <p>✉ contacto@nendoshop.pe</p>
        </div>


        <div>
          <h3 className="text-xl font-bold mb-5 text-cyan-300">Información</h3>
          <ul className="space-y-3">
            <li>
              <Link to="/About" className="flex items-center gap-2 hover:text-cyan-300 transition">
              <span>⌂</span>
              <span className="underline underline-offset-4">
              Sobre NendoShop
             </span>
            </Link>

            </li>
            <li>
              <Link to="" className="flex items-center gap-2 hover:text-cyan-300 transition">
               <span>¤</span>
              <span className="underline underline-offset-4">
              Métodos de Pago
             </span>
             </Link>
            </li>
            <li>

              <Link to="" className="flex items-center gap-2 hover:text-cyan-300 transition">
               <span>★</span>
              <span className="underline underline-offset-4">
              Programa de recompensas Nendo Points
             </span>
            </Link>
       
            </li>
            <li>
              <Link to="" className="flex items-center gap-2 hover:text-cyan-300 transition">
              <span>✦</span>
              <span className="underline underline-offset-4">
              Acerca de las Pre-Ventas
              </span>
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-5 text-cyan-300">
            Ayuda
          </h3>
          <ul className="space-y-3">
            <li>
              <Link to="" className= "flex items-center gap-2 hover:text-cyan-300 transition">
              <span>⛨</span>
              <span className="underline underline-offset-4">
              Política de Privacidad de Datos
              </span>
              </Link>
            </li>
            <li>

              <Link to="" className="flex items-center gap-2 hover:text-cyan-300 transition">
              <span>↺</span>
              <span className="underline underline-offset-4">
              Políticas de Devolución y Reembolso
              </span>
              </Link>
            </li>
            <li>

              <Link to="" className="flex items-center gap-2 hover:text-cyan-300 transition">
              <span>➜</span>
              <span className="underline underline-offset-4">
              Políticas de Envíos
              </span>
              </Link>
            </li>
            <li>
              
              <Link to="" className="flex items-center gap-2 hover:text-cyan-300 transition"> 
              <span>⚑</span>
              <span className="underline underline-offset-4">
              Libro de Reclamaciones
             </span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20 py-4 text-center text-sm">
        © 2026 NendoShop - Todos los derechos reservados
      </div>
    </footer>
  );
}