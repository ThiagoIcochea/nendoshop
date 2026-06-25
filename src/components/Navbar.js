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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">

        <div className="flex h-16 items-center justify-between gap-2 sm:h-20">

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
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-gray-600 hover:text-brand font-medium"
                >
                  Dashboard
                </button>
              )}

            </nav>

          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">

            <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl rounded-full border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm">
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

      <div className="px-3 pb-3 md:hidden">
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 shadow-sm">
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
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/dashboard");
                  }}
                  className="text-left"
                >
                  Dashboard
                </button>
              )}

            </nav>

          </div>

        </div>
      )}

    </header>
  );
}