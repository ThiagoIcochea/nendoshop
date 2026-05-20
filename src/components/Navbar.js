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

  const [search, setSearch] = useState(
    localStorage.getItem("productSearch") || ""
  );

  const updateCartCount = () => {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const total = cart.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    setCartCount(total);

  };

  useEffect(() => {

    updateCartCount();

    const handleStorage = () => updateCartCount();

    window.addEventListener("storage", handleStorage);

    return () =>
      window.removeEventListener("storage", handleStorage);

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

            <Link
              to="/"
              className="flex items-center gap-3"
            >

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

              <Link
                to="/"
                className="text-gray-600 hover:text-brand font-medium transition-colors"
              >
                Inicio
              </Link>

              <Link
                to="/about"
                className="text-gray-600 hover:text-brand font-medium transition-colors"
              >
                Nosotros
              </Link>

              <Link
                to="/catalog"
                className="text-gray-600 hover:text-brand font-medium transition-colors"
              >
                Catálogo
              </Link>

              {auth && auth.role === "admin" && (

                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-brand font-medium transition-colors"
                >
                  Dashboard
                </Link>

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
                className="block w-full pl-10 pr-3 py-2 border border-brand rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand sm:text-sm"
                placeholder="Buscar productos..."
              />

            </div>

          </div>

          <div className="flex items-center gap-3">

            {!auth ? (

              <Link
                to="/login"
                className="flex items-center gap-2 text-brand hover:text-brand-dark font-medium"
              >

                <User className="h-5 w-5" />

                <span className="hidden lg:inline">
                  Login
                </span>

              </Link>

            ) : (

              <>

                <Link to="/profile">

                  <div className="w-10 h-10 rounded-full overflow-hidden bg-brand flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-80 transition">

                    {auth.profileImg ? (

                      <img
                        src={auth.profileImg}
                        alt="avatar"
                        className="w-full h-full object-cover scale-90"
                      />

                    ) : (auth.name || auth.lastname) ? (

                      (auth.name?.[0] || "") +
                      (auth.lastname?.[0] || "")

                    ) : (
                      "U"
                    )}

                  </div>

                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium"
                >

                  <LogOut className="h-5 w-5" />

                  <span className="hidden lg:inline">
                    Logout
                  </span>

                </button>

              </>

            )}

            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-2 text-brand hover:text-brand-dark relative group"
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

            {auth && auth.role === "admin" && (

              <Link
                to="/api-comentarios"
                className="hidden md:flex items-center gap-2 text-gray-600 hover:text-brand font-medium transition-colors"
              >

                <Settings className="h-5 w-5" />

                <span className="hidden lg:inline">
                  Settings
                </span>

              </Link>

            )}

          </div>

        </div>

      </div>

      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          menuOpen
            ? "visible bg-black/40"
            : "invisible bg-black/0"
        }`}
      >

        <div
          className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl transition-transform duration-300 ${
            menuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >

          <div className="flex items-center justify-between p-5 border-b">

            <h2 className="font-bold text-xl">
              Menú
            </h2>

            <button
              onClick={() => setMenuOpen(false)}
            >

              <X className="w-6 h-6" />

            </button>

          </div>

          <div className="p-5">

            <div className="relative mb-6 sm:hidden">

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

            <nav className="flex flex-col gap-5">

              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 font-medium"
              >
                Inicio
              </Link>

              <Link
                to="/about"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 font-medium"
              >
                Nosotros
              </Link>

              <Link
                to="/catalog"
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 font-medium"
              >
                Catálogo
              </Link>

              {auth && auth.role === "admin" && (

                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="text-gray-700 font-medium"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/api-comentarios"
                    onClick={() => setMenuOpen(false)}
                    className="text-gray-700 font-medium"
                  >
                    Settings
                  </Link>
                </>

              )}

            </nav>

          </div>

        </div>

      </div>

    </header>

  );
}