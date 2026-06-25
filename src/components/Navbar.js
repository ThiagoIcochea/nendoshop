import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Menu,
  X,
  Mic
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
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");

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

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return undefined;
    }

    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
    navigate("/login");
  };

  const submitSearch = async (value) => {
    const term = String(value || "").trim();
    if (!term) return;

    localStorage.setItem("productSearch", term);
    localStorage.removeItem("productSearchResults");

    const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://backendproyectodf.onrender.com";

    try {
      const res = await fetch(`${backendUrl}/api/products/search?query=${encodeURIComponent(term)}`, {
        credentials: "include"
      });
      const data = await res.json();
      const products = Array.isArray(data?.products) ? data.products : [];
      localStorage.setItem("productSearchResults", JSON.stringify(products));
      localStorage.setItem("productSearchMeta", JSON.stringify({ query: data?.query || term, appliedBy: data?.appliedBy || "local" }));
    } catch (error) {
      console.error("Error al buscar productos", error);
      localStorage.setItem("productSearchResults", JSON.stringify([]));
    }

    navigate({ pathname: "/catalog", search: `?search=${encodeURIComponent(term)}` });
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      submitSearch(search);
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("El micrófono no está disponible en este navegador.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError("");
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceError("No se pudo escuchar tu pedido. Intenta de nuevo.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setSearch(transcript);
        await submitSearch(transcript);
      }
    };

    recognition.start();
  };

  return (
    <header className="sticky top-0 z-50 overflow-x-hidden border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">

        <div className="flex min-h-[56px] items-center justify-between gap-2 py-2 sm:h-20 sm:min-h-0 sm:py-0">

          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">

            <button
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm md:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">

              <img
                src={logo}
                alt="Nendoshop Logo"
                className="h-10 w-10 rounded-full border border-gray-100 object-contain shadow-sm sm:h-12 sm:w-12"
              />

              <span className="hidden text-lg font-bold tracking-tight text-gray-900 sm:block sm:text-xl">
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
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-gray-600 hover:text-brand font-medium"
                >
                  Dashboard
                </button>
              )}

            </nav>

          </div>

          <div className="flex flex-shrink-0 items-center justify-end gap-2 sm:gap-3">

            <div className="hidden flex-1 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm md:flex md:max-w-xl">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Buscar figuras, precios o productos"
                className="w-full border-0 bg-transparent py-1 text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`rounded-full p-1.5 ${isListening ? "bg-brand text-white" : "text-gray-500 hover:bg-gray-200"}`}
                title="Buscar por voz"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>

            {!auth ? (
              <Link to="/login" className="flex items-center gap-2 text-brand">
                <User className="h-5 w-5" />
                <span className="hidden lg:inline">Login</span>
              </Link>
            ) : (
              <>
                <Link to="/profile" className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand text-sm font-bold text-white">
                    {auth.profileImg ? (
                      <img src={auth.profileImg} alt="Perfil" className="h-full w-full object-cover" />
                    ) : (
                      (auth.name?.[0] || "") + (auth.lastname?.[0] || "")
                    )}
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-red-500 hover:bg-red-50"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}

            <button
              onClick={() => navigate("/cart")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-brand hover:bg-gray-100"
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

      <div className="px-3 pb-3 md:hidden">
        <div className="flex min-h-[44px] w-full items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Buscar figuras, precios o productos"
            className="w-full border-0 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`rounded-full p-1.5 ${isListening ? "bg-brand text-white" : "text-gray-500 hover:bg-gray-200"}`}
            title="Buscar por voz"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
        {voiceError && <p className="mt-2 text-xs text-red-500">{voiceError}</p>}
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setMenuOpen(false)}
          />

          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col overflow-hidden border-r border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out translate-x-0">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-purple-600">NendoShop</p>
                <h2 className="text-lg font-semibold text-gray-800">Menú</h2>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-2 p-5">
              <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                Inicio
              </Link>
              <Link to="/about" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                Nosotros
              </Link>
              <Link to="/catalog" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                Catálogo
              </Link>
              {auth && (
                <Link to="/chat" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700">
                  Chat
                </Link>
              )}

              {auth && auth.role === "admin" && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/dashboard");
                  }}
                  className="rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                >
                  Dashboard
                </button>
              )}
            </nav>

            <div className="border-t border-gray-200 p-5 text-sm text-gray-500">
              {auth ? (
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-500">
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-purple-600">
                  <User className="h-4 w-4" />
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

    </header>
  );
}