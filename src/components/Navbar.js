import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "./Assets/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const auth = localStorage.getItem("auth");

  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(total);
  };

  useEffect(() => {
    updateCartCount();

    const handleStorage = () => updateCartCount();
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          <div className="flex-shrink-0 flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Nendoshop Logo" className="h-12 w-12 object-contain rounded-full border border-gray-100 shadow-sm" />
              <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">Nendoshop</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 border-l border-gray-200 pl-6">
              <Link to="/" className="text-gray-600 hover:text-brand font-medium transition-colors">Inicio</Link>
              <Link to="/about" className="text-gray-600 hover:text-brand font-medium transition-colors">Nosotros</Link>
              <Link to="/catalog" className="text-gray-600 hover:text-brand font-medium transition-colors">Catálogo</Link>
            </nav>
          </div>

          <div className="flex-1 max-w-lg mx-4 lg:mx-8 hidden sm:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-brand" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-brand rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand sm:text-sm"
                placeholder="Buscar productos..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!auth ? (
              <Link to="/login" className="flex items-center gap-2 text-brand hover:text-brand-dark font-medium">
                <User className="h-5 w-5" />
                <span className="hidden lg:inline">Login</span>
              </Link>
            ) : (
              <>
                <Link to="/dashboard" className="flex items-center gap-2 text-brand hover:text-brand-dark font-medium">
                  <User className="h-5 w-5" />
                  <span className="hidden lg:inline">Dashboard</span>
                </Link>

                <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium">
                  <LogOut className="h-5 w-5" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            )}

            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-2 text-brand hover:text-brand-dark relative group ml-2"
            >
              <div className="p-2 bg-brand/10 rounded-full group-hover:bg-brand/20">
                <ShoppingCart className="h-5 w-5" />
              </div>

              {cartCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}