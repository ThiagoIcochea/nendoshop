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

              <Link to="/" className="text-gray-600 hover:text-brand font-medium">
                Inicio
              </Link>

              <Link to="/about" className="text-gray-600 hover:text-brand font-medium">
                Nosotros
              </Link>

              <Link to="/catalog" className="text-gray-600 hover:text-brand font-medium">
                Catálogo
              </Link>

              {auth && (
                <Link to="/chat" className="text-gray-600 hover:text-brand font-medium">
                  Chat
                </Link>
              )}

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
                    onClick={() => navigate("/dashboard")}
                    className="text-gray-600 hover:text-brand font-medium"
                  >
                    Dashboard
                  </button>

                  {adminMenu && (
                    <div className="absolute top-10 left-0 bg-white shadow-lg rounded-lg border w-48 py-2 z-50">

                      <Link to="/dashboard/payments" className="block px-4 py-2 hover:bg-gray-100">
                        Pagos
                      </Link>

                      <Link to="/dashboard/clients" className="block px-4 py-2 hover:bg-gray-100">
                        Clientes
                      </Link>

                      <Link to="/dashboard/products" className="block px-4 py-2 hover:bg-gray-100">
                        Productos
                      </Link>

                    </div>
                  )}

                </div>
              )}

            </nav>

          </div>

          <div className="flex items-center gap-3">

            {!auth ? (
              <Link to="/login" className="flex items-center gap-2 text-brand">
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
                  className="flex items-center gap-2 text-red-500"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}

            <button
              onClick={() => navigate("/cart")}
              className="relative text-brand"
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
                className="hidden md:flex items-center gap-2 text-gray-600"
              >
                <Settings className="h-5 w-5" />
              </Link>
            )}

          </div>

        </div>

      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />

          <div className="absolute top-0 left-0 w-72 h-full bg-white shadow-xl p-5">

            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl">Menú</h2>
              <button onClick={() => setMenuOpen(false)}>
                <X />
              </button>
            </div>

            <nav className="flex flex-col gap-4">

              <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)}>Nosotros</Link>
              <Link to="/catalog" onClick={() => setMenuOpen(false)}>Catálogo</Link>
              {auth && (
                <Link to="/chat" onClick={() => setMenuOpen(false)}>
                  Chat
                </Link>
              )}

              {auth && auth.role === "admin" && (
                <>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>

                  <Link to="/dashboard/payments" onClick={() => setMenuOpen(false)}>
                    Pagos
                  </Link>

                  <Link to="/dashboard/clients" onClick={() => setMenuOpen(false)}>
                    Clientes
                  </Link>

                  <Link to="/dashboard/products" onClick={() => setMenuOpen(false)}>
                    Productos
                  </Link>

                  <Link to="/api-comentarios" onClick={() => setMenuOpen(false)}>
                    Settings
                  </Link>
                </>
              )}

            </nav>

          </div>

        </div>
      )}

    </header>
  );
}