import { React, useEffect, useState, Provider, Navigate, Route, Routes, store, Compare, Login, Register, Home, About, Contact, Header, Footer, Error, Products, ProductCard, Cart, Profile, ScrollToTop } from './imports';
import { Blog, Careers, Terms, Privacy, License, ForgotPassword, ResetPassword, axios, BlogIndex, OrderStages, AdminLogin, AdminLayout, AdminSettings, AdminUsers, AdminDashboard, AdminProducts, AdminOrders, AdminOrderDetails, PostPage } from "./imports";

import { useDispatch } from "react-redux";
import { loginSuccess, adminLoginSuccess } from "./redux/authSlice";
import { Helmet } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import CookieBanner from './components/CookieBanner';
import AIChatAssistant from "./components/AIChatAssistant";

const App = () => {
  const dispatch = useDispatch();
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const isAdminRoute = window.location.pathname.startsWith("/admin");

  // Restore session on refresh
  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (adminToken) {
      setIsAdmin(true);
      dispatch(adminLoginSuccess());
    }

    // Check user auth
    const userToken = localStorage.getItem("auth_token");
    if (userToken) {
      dispatch(loginSuccess());
    }
  }, [dispatch]);

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
        <link rel="canonical" href="https://vkart.balavardhan.dev/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="VKart" />
        <meta property="og:title" content="VKart — Curated Shopping, Fast Delivery" />
        <meta property="og:description" content="Explore handpicked products, great prices, and quick delivery. Shop smarter with VKart." />
        <meta property="og:url" content="https://vkart.balavardhan.dev/" />
        <meta property="og:image" content="https://vkart.balavardhan.dev/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VKart — Curated Shopping, Fast Delivery" />
        <meta name="twitter:description" content="Explore handpicked products, great prices, and quick delivery. Shop smarter with VKart." />
        <meta name="twitter:image" content="https://vkart.balavardhan.dev/og-image.jpg" />
      </Helmet>

      <div id="root">
        <ScrollToTop />
        {/*  Header behaves like Footer: always on non-admin routes */}
        {!isAdminRoute && (
          <Header />
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected by Component-Level Guard (CartPreview / ProfilePreview) */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orderstages" element={<OrderStages />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={isAdmin ? <Navigate to="/admin/dashboard" /> : <AdminLogin setIsAdmin={setIsAdmin} />} />

            {/* Admin Protected Routes */}
            <Route path="/admin" element={isAdmin ? <AdminLayout setIsAdmin={setIsAdmin} /> : <Navigate to="/admin/login" />}>
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
          <CookieBanner />
        </main>
        {!isAdminRoute && <AIChatAssistant />}
        {!isAdminRoute && <Footer />}
      </div>
    </Provider>
  );
};

export default App;
