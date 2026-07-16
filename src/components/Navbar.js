import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  Menu,
  Mic,
  Search,
  ShoppingCart,
  Sun,
  Moon,
  User,
  X
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import logo from "./Assets/logo.png";
import { BACKEND_URL } from "../utils/config";
import { ROUTES } from "../utils/secureRoutes";

export default function Navbar() {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [search, setSearch] = useState(localStorage.getItem("productSearch") || "");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isAdmin = Boolean(auth?.role === "admin" || auth?.isAdmin || auth?.user?.role === "admin");

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
    localStorage.removeItem("token");
    navigate(ROUTES.login);
  };

  const submitSearch = async (value) => {
    const term = String(value || "").trim();
    if (!term) return;

    localStorage.setItem("productSearch", term);
    localStorage.removeItem("productSearchResults");

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/products/search?query=${encodeURIComponent(term)}`,
        { credentials: "include" }
      );
      const data = await res.json();
      const products = Array.isArray(data?.products) ? data.products : [];
      localStorage.setItem("productSearchResults", JSON.stringify(products));
      localStorage.setItem(
        "productSearchMeta",
        JSON.stringify({ query: data?.query || term, appliedBy: data?.appliedBy || "local" })
      );
    } catch (error) {
      localStorage.setItem("productSearchResults", JSON.stringify([]));
    }

    setSearch("");
    navigate({ pathname: ROUTES.catalog, search: `?search=${encodeURIComponent(term)}` });
    setMenuOpen(false);
  };

  const handleSearch = (event) => {
    if (event.key === "Enter") {
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

  const mobileMenu = menuOpen && typeof document !== "undefined"
    ? createPortal(
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/45" onClick={() => setMenuOpen(false)} />

          <div className="absolute inset-y-0 left-0 z-[101] flex w-80 max-w-[85vw] flex-col overflow-hidden border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl transition-colors">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">NendoShop</p>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Menú</h2>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-full p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-2 p-5 bg-white dark:bg-gray-900 transition-colors">
              <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-300">
                Inicio
              </Link>
              <Link to="/about" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-300">
                Nosotros
              </Link>
              <Link to="/catalog" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-300">
                Catálogo
              </Link>
              {auth && (
                <>
                  <Link to="/chat" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-300">
                    Chat
                  </Link>
                  <Link to="/pedidos" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-300">
                    Mis pedidos
                  </Link>
                </>
              )}

              {isAdmin && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/dashboard");
                  }}
                  className="rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  Dashboard
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/api-comentarios");
                  }}
                  className="rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  Configuraciones
                </button>
              )}

              <button
                onClick={toggleTheme}
                className="mt-4 flex w-full items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {theme === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-purple-600" />}
                  <span>Modo {theme === "dark" ? "Claro" : "Oscuro"}</span>
                </div>
              </button>
            </nav>

            <div className="border-t border-gray-200 dark:border-gray-800 p-5 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 transition-colors">
              {auth ? (
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 dark:text-red-400">
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <User className="h-4 w-4" />
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {mobileMenu}
      <header className="sticky top-0 z-40 overflow-x-hidden border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 shadow-sm backdrop-blur transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex min-h-[56px] items-center justify-between gap-2 py-2 sm:h-20 sm:min-h-0 sm:py-0">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <button
                onClick={() => setMenuOpen((value) => !value)}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm md:hidden transition-colors"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </button>

              <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
                <img
                  src={logo}
                  alt="Nendoshop Logo"
                  className="h-10 w-10 rounded-full border border-gray-100 dark:border-gray-800 object-contain shadow-sm sm:h-12 sm:w-12"
                />

                <span className="hidden text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:block sm:text-xl transition-colors">
                  Nendoshop
                </span>
              </Link>

              <nav className="hidden items-center gap-6 border-l border-gray-200 dark:border-gray-800 pl-6 md:flex">
                <Link to="/" className="font-medium text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition-colors">
                  Inicio
                </Link>
                <Link to="/about" className="font-medium text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition-colors">
                  Nosotros
                </Link>
                <Link to="/catalog" className="font-medium text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition-colors">
                  Catálogo
                </Link>

                {auth && (
                  <>
                    <Link to="/chat" className="font-medium text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition-colors">
                      Chat
                    </Link>
                    <Link to="/pedidos" className="font-medium text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition-colors">
                      Mis pedidos
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <button onClick={() => navigate("/dashboard")} className="font-medium text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition-colors">
                    Dashboard
                  </button>
                )}
              </nav>
            </div>

            <div className="flex flex-shrink-0 items-center justify-end gap-2 sm:gap-3">
              <div className="hidden flex-1 items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 shadow-sm md:flex md:max-w-xl transition-colors">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearch}
                  placeholder="Buscar figuras, precios o productos"
                  className="w-full border-0 bg-transparent py-1 text-sm text-gray-700 dark:text-gray-200 outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`rounded-full p-1.5 transition-colors ${isListening ? "bg-brand text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                  title="Buscar por voz"
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-full text-brand hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                aria-label="Cambiar tema"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 text-brand" />
                )}
              </button>

              {!auth ? (
                <Link to="/login" className="flex items-center gap-2 text-brand">
                  <User className="h-5 w-5" />
                  <span className="hidden lg:inline">Iniciar sesión</span>
                </Link>
              ) : (
                <>
                  <Link to="/profile" className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand text-sm font-bold text-white">
                      {auth.profileImg ? (
                        <img src={auth.profileImg} alt="Perfil" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-white" />
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
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-brand hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs text-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {isAdmin && (
                <Link
                  to="/api-comentarios"
                  className="flex items-center gap-2 rounded-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Configuraciones"
                  aria-label="Ir a configuraciones"
                >
                  <SettingsIcon />
                </Link>
              )}
            </div>
          </div>
        </div>

        {voiceError ? (
          <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-center text-sm text-red-600">
            {voiceError}
          </div>
        ) : null}
      </header>
    </>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" />
      <path d="M19.4 15a7.9 7.9 0 0 0 .1-1 7.9 7.9 0 0 0-.1-1l2-1.5-2-3.5-2.4.8a8 8 0 0 0-1.7-1l-.4-2.5h-4l-.4 2.5a8 8 0 0 0-1.7 1l-2.4-.8-2 3.5 2 1.5a7.9 7.9 0 0 0-.1 1 7.9 7.9 0 0 0 .1 1l-2 1.5 2 3.5 2.4-.8a8 8 0 0 0 1.7 1l.4 2.5h4l.4-2.5a8 8 0 0 0 1.7-1l2.4.8 2-3.5-2-1.5z" />
    </svg>
  );
}
