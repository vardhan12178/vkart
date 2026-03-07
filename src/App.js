import {
  React, useEffect, useState, Suspense,
  Navigate, Route, Routes,
  Helmet, Toaster,
  Login, Register, Home, About, Contact, Header, Footer,
  Error, Products, ProductCard, Cart, Profile, ScrollToTop,
  Blog, Careers, Terms, Privacy, License, ForgotPassword, ResetPassword,
  axios, BlogIndex, OrderStages, Orders, OrderSuccess, PostPage, Compare, VerifyEmail,
  AdminLogin, AdminLayout, AdminSettings, AdminUsers, AdminDashboard,
  AdminProducts, AdminOrders, AdminOrderDetails,
  AdminReviews, AdminCoupons, AdminSales, AdminMembership,
  CookieBanner, AIChatAssistant, ClientSync,
  PrimeMembership, Wishlist, ErrorBoundary
} from './imports';

import { useDispatch, useLocation } from "./imports"; // Moved useDispatch to imports based on user request (implied) or keep standard? imports.js has it.
import { setAuthState } from "./redux/authSlice";
import LoadingSpinner from "./components/LoadingSpinner";
import NotificationSocket from "./components/NotificationSocket";
import RouteSeo from "./seo/RouteSeo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "./query/queryKeys";

const App = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const adminVerifyQuery = useQuery({
    queryKey: qk.auth.adminVerify,
    queryFn: async () => {
      const res = await axios.get("/api/admin/verify", { withCredentials: true });
      return res.data;
    },
    enabled: isAdminRoute,
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const sessionQuery = useQuery({
    queryKey: qk.auth.session,
    queryFn: async () => {
      const res = await axios.get("/api/auth/check", { withCredentials: true });
      return res.data;
    },
    enabled: !isAdminRoute,
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (!isAdminRoute) {
      setIsAdmin(false);
      return;
    }
    if (adminVerifyQuery.isError) {
      setIsAdmin(false);
      return;
    }
    setIsAdmin(Boolean(adminVerifyQuery.data?.valid));
  }, [isAdminRoute, adminVerifyQuery.data, adminVerifyQuery.isError]);

  useEffect(() => {
    if (isAdminRoute) return;
    if (sessionQuery.data?.authenticated && sessionQuery.data.user) {
      queryClient.setQueryData(qk.profile.root, sessionQuery.data.user);
      dispatch(setAuthState({ isAuthenticated: true, user: sessionQuery.data.user }));
      return;
    }
    if (sessionQuery.data?.authenticated === false || sessionQuery.isError) {
      queryClient.removeQueries({ queryKey: qk.profile.root });
      dispatch(setAuthState({ isAuthenticated: false, user: null }));
    }
  }, [dispatch, isAdminRoute, queryClient, sessionQuery.data, sessionQuery.isError]);

  const authLoading = isAdminRoute ? adminVerifyQuery.isLoading : sessionQuery.isLoading;

  if (authLoading) return <LoadingSpinner />;

  return (

    <>
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
        <RouteSeo />
        {/* Skip to main content — accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-gray-900 focus:shadow-lg focus:rounded-lg">
          Skip to main content
        </a>
        <ScrollToTop />
        <Suspense fallback={null}>
          <ClientSync />
        </Suspense>
        {/*  Header behaves like Footer: always on non-admin routes */}
        {!isAdminRoute && (
          <Suspense fallback={<div className="h-20 bg-white" />}>
            <Header />
          </Suspense>
        )}

        {/* Global notification socket for user-side real-time updates */}
        {!isAdminRoute && <NotificationSocket />}

        <main id="main-content" role="main">
          <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorBoundary>
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
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* User Auth Pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected by Component-Level Guard (CartPreview / ProfilePreview) */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:orderId" element={<Orders />} />
              <Route path="/order-success/:orderId" element={<OrderSuccess />} />
              <Route path="/orderstages" element={<OrderStages />} />
              <Route path="/prime" element={<PrimeMembership />} />
              <Route path="/wishlist" element={<Wishlist />} />

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
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="sales" element={<AdminSales />} />
                <Route path="membership" element={<AdminMembership />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Error / 404 */}
              <Route path="*" element={<Error />} />

            </Routes>
            </ErrorBoundary>
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
    </>
  );
};

export default App;
