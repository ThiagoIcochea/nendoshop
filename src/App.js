import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "animate.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import About from "./pages/About";
import Login from "./pages/Login";
import AdminAccess from "./pages/AdminAccess";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductDetail from "./pages/ProductDetail"
import Cart from "./pages/Cart";
import ApiComentarios from "./pages/ConfigApiComentarios";
import Pagos from "./pages/Pagos";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">

        <Navbar />

        

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-access-panel" element={<AdminAccess />} />
            <Route path="/register" element={<Register />} />

            <Route path="/product/:_id" element={<ProductDetail />} />
            <Route path="/api-comentarios" element={<ProtectedRoute><ApiComentarios /></ProtectedRoute>} />
            <Route path="/profile" element = {<Profile />} />

            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/api-comentarios" element={<ProtectedRoute><ApiComentarios /></ProtectedRoute>} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/pagos" element={<ProtectedRoute><Pagos/></ProtectedRoute>}/>
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />

      </div>
    </Router>
  );
}

export default App;