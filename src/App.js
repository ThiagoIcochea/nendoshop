import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "animate.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import About from "./pages/About";
import Login from "./pages/Login";
import AdminAccess from "./pages/AdminAccess";
import Register from "./pages/Register";
import Payments from "./pages/Dashboard/Payments";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import Clients from "./pages/Dashboard/Clients";
import Products from "./pages/Dashboard/Products";
import AdminOverview from "./pages/Dashboard/AdminOverview";
import SecurityLogs from "./pages/Dashboard/SecurityLogs";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductDetail from "./pages/ProductDetail"
import Cart from "./pages/Cart";
import ApiComentarios from "./pages/ConfigApiComentarios";
import Pagos from "./pages/Pagos";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import ChatPage from "./pages/ChatPage";
import PurchaseAlertModal from "./components/PurchaseAlertModal";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">

        <Navbar />

        

        <PurchaseAlertModal />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-2fa" element={<TwoFactorAuth />} />
            <Route path="/admin-access-panel" element={<AdminAccess />} />
            <Route path="/register" element={<Register />} />

            <Route path="/product/:_id" element={<ProductDetail />} />
            <Route path="/api-comentarios" element={<ProtectedRoute><ApiComentarios /></ProtectedRoute>} />
            <Route path="/profile" element = {<Profile />} />

      

            <Route path="/cart" element={<Cart />} />
            <Route path="/pagos" element={<ProtectedRoute><Pagos/></ProtectedRoute>}/>
            
          <Route
              path="/dashboard"
              element={<DashboardLayout />}
            >
              <Route index element={<AdminOverview />} />
              <Route path="overview" element={<AdminOverview />} />
              <Route path="payments" element={<Payments />} />
              <Route path="clients" element={<Clients />} />
              <Route path="products" element={<Products />} />
              <Route path="security" element={<SecurityLogs />} />
            </Route>
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />

      </div>
    </Router>
  );
}

export default App;