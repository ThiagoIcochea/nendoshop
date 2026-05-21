import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Menu,
  X
} from "lucide-react";

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import logo from "./Assets/logo.png";

export default function Navbar() {

  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);

  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminMenu, setAdminMenu] = useState(false);
  const [adminTimeout, setAdminTimeout] = useState(null);

  const [search, setSearch] = useState(
    localStorage.getItem("productSearch") || ""
  );

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
    setAuth(null);
    localStorage.removeItem("auth");
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      localStorage.setItem("productSearch", search);
      navigate("/catalog");
      setMenuOpen(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-20">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden text-gray-700"
            >
              <Menu className="w-7 h-7" />
            </button>

            <Link to="/" className="flex items-center gap-3">

              <img
                src={logo}
                alt="Nendoshop Logo"
                className="h-12 w-12 object-contain rounded-full border border-gray-100 shadow-sm"
              />

              <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">
                Nendoshop
              </span>

            </Link>

            <nav className="hidden md:flex items-center gap-6 border-l border-gray-200 pl-6">

              <Link to="/" className="text-gray-600 hover:text-brand font-medium transition-colors">
                Inicio
              </Link>

              <Link to="/about" className="text-gray-600 hover:text-brand font-medium transition-colors">
                Nosotros
              </Link>

              <Link to="/catalog" className="text-gray-600 hover:text-brand font-medium transition-colors">
                Catálogo
              </Link>

              {auth && auth.role === "admin" && (

                <div
                  className="relative"
                  onMouseEnter={() => {
                    if (adminTimeout) clearTimeout(adminTimeout);
                    setAdminMenu(true);
                  }}
                  onMouseLeave={() => {
                    const t = setTimeout(() => setAdminMenu(false), 200);
                    setAdminTimeout(t);
                  }}
                >

                  <button
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setAdminMenu(v => !v);
                      } else {
                        navigate("/dashboard");
                      }
                    }}
                    className="text-gray-600 hover:text-brand font-medium transition-colors"
                  >
                    Dashboard
                  </button>

                  {adminMenu && (

                    <div className="absolute top-10 left-0 bg-white shadow-lg rounded-lg border w-48 py-2 z-50">

                      <Link
                        to="/dashboard/payments"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setAdminMenu(false)}
                      >
                        Pagos
                      </Link>

                      <Link
                        to="/dashboard/clients"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setAdminMenu(false)}
                      >
                        Clientes
                      </Link>

                      <Link
                        to="/dashboard/products"
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => setAdminMenu(false)}
                      >
                        Productos
                      </Link>

                    </div>

                  )}

                </div>

              )}

            </nav>

          </div>

          <div className="flex-1 max-w-lg mx-8 hidden sm:block">

            <div className="relative">

              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-brand" />
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-brand rounded-full"
                placeholder="Buscar productos..."
              />

            </div>

          </div>

          <div className="flex items-center gap-3">

            {!auth ? (

              <Link to="/login" className="flex items-center gap-2 text-brand hover:text-brand-dark font-medium">
                <User className="h-5 w-5" />
                <span className="hidden lg:inline">Login</span>
              </Link>

            ) : (

              <>

                <Link to="/profile">

                  <div className="w-10 h-10 rounded-full overflow-hidden bg-brand flex items-center justify-center text-white font-bold text-sm">

                    {auth.profileImg ? (
                      <img src={auth.profileImg} className="w-full h-full object-cover" />
                    ) : (
                      (auth.name?.[0] || "") + (auth.lastname?.[0] || "")
                    )}

                  </div>

                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden lg:inline">Logout</span>
                </button>

              </>

            )}

            <button
              onClick={() => navigate("/cart")}
              className="relative text-brand hover:text-brand-dark"
            >
              <ShoppingCart className="h-5 w-5" />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}

            </button>

            {auth && auth.role === "admin" && (

              <Link
                to="/api-comentarios"
                className="hidden md:flex items-center gap-2 text-gray-600 hover:text-brand"
              >
                <Settings className="h-5 w-5" />
                <span className="hidden lg:inline">Settings</span>
              </Link>

            )}

          </div>

        </div>

      </div>
    </header>
  );
}