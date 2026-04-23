import { Link } from "react-router-dom";


export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between">
      <h1 className="font-bold">Nendoroid Store</h1>

      <div className="space-x-4">
        <Link to="/">Inicio</Link>
        <Link to="/about">Sobre Nosotros</Link>
        <Link to="/login">Login</Link>
        <Link to="/catalog">Catálogo</Link>
      </div>
    </nav>
  );
}