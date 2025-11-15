import { React, useEffect, useState, Provider, Navigate, Route, Routes, store, Compare, Login, Register, Home, About, Contact, Header, Footer, Error, Products, ProductCard, Cart, Profile } from './imports';
import Blog from "./components/Blog";
import Careers from "./components/Careers";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
import License from "./components/License";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import axios from "./components/axiosInstance";
import BlogIndex from "./components/blog/BlogIndex";
import OrderStages from "./components/OrderStages";
import AdminLogin from "./components/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminSettings from "./components/AdminSettings";
import AdminUsers from "./components/AdminUsers";
import AdminDashboard from "./components/AdminDashboard";
import AdminProducts from "./components/AdminProducts";
import AdminOrders from "./components/AdminOrders";
import AdminOrderDetails from "./components/AdminOrderDetails";
import PostPage from "./components/blog/PostPage";
import { Helmet } from "react-helmet-async";
import { Toaster } from "react-hot-toast";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const isAdminRoute = window.location.pathname.startsWith("/admin");

  // Restore admin session on refresh
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) setIsAdmin(true);
  }, []);

  useEffect(() => {
    // Skip profile check on admin routes
    if (isAdminRoute) {
      setAuthReady(true);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        await axios.get("/api/profile");
        if (mounted) setIsLoggedIn(true);
      } catch {
        if (mounted) setIsLoggedIn(false);
      } finally {
        if (mounted) setAuthReady(true);
      }
    })();

    return () => { mounted = false; };
  }, [isAdminRoute]);

  if (!authReady) return null;

  return (
    
    <Provider store={store}>
      <Helmet>
        <title>VKart — Curated Shopping, Fast Delivery</title>
        <meta
          name="description"
          content="VKart is a curated e-commerce experience for electronics, fashion and essentials. Fast delivery, secure payments, and handpicked deals."
        />
        <link rel="canonical" href="https://vkartshop.netlify.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="VKart" />
        <meta property="og:title" content="VKart — Curated Shopping, Fast Delivery" />
        <meta property="og:description" content="Explore handpicked products, great prices, and quick delivery. Shop smarter with VKart." />
        <meta property="og:url" content="https://vkartshop.netlify.app/" />
        <meta property="og:image" content="https://vkartshop.netlify.app/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VKart — Curated Shopping, Fast Delivery" />
        <meta name="twitter:description" content="Explore handpicked products, great prices, and quick delivery. Shop smarter with VKart." />
        <meta name="twitter:image" content="https://vkartshop.netlify.app/og-image.jpg" />
      </Helmet>
      
      <div id="root">
       {!isAdminRoute && (
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      )}
        <main>
          <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
          <Routes>
            
            <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
            <Route path="/admin/login" element={isAdmin ? <Navigate to="/admin/dashboard" /> : <AdminLogin setIsAdmin={setIsAdmin} />} />
            <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/admin/login" />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetails />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:id" element={<PostPage />} />     
            <Route path="/careers" element={<Careers />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/orderstages" element={<OrderStages />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/license" element={<License />} />
            <Route path="/products" element={isLoggedIn ? <Products /> : <Navigate to="/login" />} />
            <Route path="/product/:id" element={isLoggedIn ? <ProductCard /> : <Navigate to="/login" />} />
            <Route path="/about" element={isLoggedIn ? <About /> : <Navigate to="/login" />} />
            <Route path="/cart" element={isLoggedIn ? <Cart /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isLoggedIn ? <Profile setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/login" />} />
            <Route path="/contact" element={isLoggedIn ? <Contact /> : <Navigate to="/login" />} />
            <Route path="*" element={<Error />} />
          </Routes>
        </main>
       {isLoggedIn && !isAdminRoute && <Footer />}
      </div>
    </Provider>
  );
};

export default App;
