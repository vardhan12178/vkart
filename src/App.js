import { React, useEffect, useState, Provider, Navigate, Route, Routes, store, Compare, Login, Register, Home, About, Contact, Header, Footer, Error, Products, ProductCard, Cart, Profile } from './imports';
import { Blog, Careers, Terms, Privacy, License, ForgotPassword, ResetPassword, axios, BlogIndex, OrderStages, AdminLogin, AdminLayout, AdminSettings, AdminUsers, AdminDashboard, AdminProducts, AdminOrders, AdminOrderDetails, PostPage } from "./imports";

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
  // For admin routes, skip everything and mark ready
  if (isAdminRoute) {
    setAuthReady(true);
    return;
  }

  // Storefront is fully public → no profile check here
  setAuthReady(true);
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
       {/* ✅ Header behaves like Footer: always on non-admin routes */}
      {!isAdminRoute && (
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      )}
        <main>
          <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
          <Routes>
            {/* Public Storefront Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductCard />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:id" element={<PostPage />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/license" element={<License />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* User Auth Pages */}
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register />} />

            {/* Protected by Component-Level Guard (CartPreview / ProfilePreview) */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/orderstages" element={<OrderStages />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={isAdmin ? <Navigate to="/admin/dashboard" /> : <AdminLogin setIsAdmin={setIsAdmin} />} />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/admin/login" />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetails />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Error / 404 */}
            <Route path="*" element={<Error />} />

          </Routes>

        </main>
      {!isAdminRoute && <Footer />}
      </div>
    </Provider>
  );
};

export default App;
