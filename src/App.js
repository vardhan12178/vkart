import {
  React, useEffect, useState, Suspense,
  Provider, Navigate, Route, Routes, store,
  Helmet, Toaster,
  Login, Register, Home, About, Contact, Header, Footer,
  Error, Products, ProductCard, Cart, Profile, ScrollToTop,
  Blog, Careers, Terms, Privacy, License, ForgotPassword, ResetPassword,
  axios, BlogIndex, OrderStages, PostPage, Compare,
  AdminLogin, AdminLayout, AdminSettings, AdminUsers, AdminDashboard,
  AdminProducts, AdminOrders, AdminOrderDetails,
  CookieBanner, AIChatAssistant
} from './imports';

import { useDispatch } from "./imports"; // Moved useDispatch to imports based on user request (implied) or keep standard? imports.js has it.
import { setAuthState } from "./redux/authSlice";
import LoadingSpinner from "./components/LoadingSpinner";

const App = () => {
  const dispatch = useDispatch();
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const isAdminRoute = window.location.pathname.startsWith("/admin");

  // Restore session on refresh - now via API call (cookie-based)
  useEffect(() => {
    const checkAuth = async () => {
      // For admin routes, check admin auth separately
      if (isAdminRoute) {
        try {
          // Verify admin session via cookie
          const res = await axios.get("/api/admin/verify", { withCredentials: true });
          if (res.data?.valid) {
            setIsAdmin(true);
          }
        } catch (err) {
          // Admin not authenticated - will redirect to login
          setIsAdmin(false);
        }
        setAuthReady(true);
        return;
      }

      // For regular routes, check if user is logged in via cookie
      try {
        const res = await axios.get("/api/profile", { withCredentials: true });
        if (res.data) {
          dispatch(setAuthState({ isAuthenticated: true, user: res.data }));
        }
      } catch (err) {
        // 401 means not logged in, which is fine for public routes
        dispatch(setAuthState({ isAuthenticated: false }));
      } finally {
        setAuthReady(true);
      }
    };

    checkAuth();
  }, [dispatch, isAdminRoute]);


  if (!authReady) return <LoadingSpinner />;

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
          <Suspense fallback={<div className="h-20 bg-white" />}>
            <Header />
          </Suspense>
        )}

        <main>
          <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
          <Suspense fallback={<LoadingSpinner />}>
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
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
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
          </Suspense>
          <Suspense fallback={null}>
            <CookieBanner />
          </Suspense>
        </main>

        {!isAdminRoute && (
          <Suspense fallback={null}>
            <AIChatAssistant />
            <Footer />
          </Suspense>
        )}
      </div>
    </Provider>
  );
};

export default App;
