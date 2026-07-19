import React, { useEffect, useState, Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Toaster } from "react-hot-toast";

import axios from "./components/axiosInstance";
import ScrollToTop from "./components/ScrollToTop";
import LoadingSpinner from "./components/LoadingSpinner";
import NotificationSocket from "./components/NotificationSocket";
import RouteSeo from "./seo/RouteSeo";
import { setAuthState } from "./redux/authSlice";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "./query/queryKeys";

// Lazy-loaded storefront route components
const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));
const Home = lazy(() => import("./components/Home"));
const About = lazy(() => import("./components/About"));
const Contact = lazy(() => import("./components/Contact"));
const Header = lazy(() => import("./components/Header"));
const Footer = lazy(() => import("./components/Footer"));
const Error = lazy(() => import("./components/Error"));
const Products = lazy(() => import("./components/Products"));
const ProductCard = lazy(() => import("./components/ProductCard"));
const Cart = lazy(() => import("./components/Cart"));
const Profile = lazy(() => import("./components/Profile"));
const Compare = lazy(() => import("./components/Compare"));
const BlogIndex = lazy(() => import("./components/blog/BlogIndex"));
const PostPage = lazy(() => import("./components/blog/PostPage"));
const Careers = lazy(() => import("./components/Careers"));
const Terms = lazy(() => import("./components/Terms"));
const Privacy = lazy(() => import("./components/Privacy"));
const License = lazy(() => import("./components/License"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const VerifyEmail = lazy(() => import("./components/VerifyEmail"));
const Orders = lazy(() => import("./components/Orders"));
const OrderSuccess = lazy(() => import("./components/OrderSuccess"));
const PrimeMembership = lazy(() => import("./components/PrimeMembership"));
const Wishlist = lazy(() => import("./components/Wishlist"));
const ErrorBoundary = lazy(() => import("./components/ErrorBoundary"));
const CookieBanner = lazy(() => import("./components/CookieBanner"));
const AIChatAssistant = lazy(() => import("./components/AIChatAssistant"));
const ClientSync = lazy(() => import("./components/ClientSync"));

// Lazy-loaded admin route components
const AdminLogin = lazy(() => import("./components/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminSettings = lazy(() => import("./components/admin/AdminSettings"));
const AdminUsers = lazy(() => import("./components/admin/AdminUsers"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./components/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./components/admin/AdminOrders"));
const AdminOrderDetails = lazy(() => import("./components/admin/AdminOrderDetails"));
const AdminReviews = lazy(() => import("./components/admin/AdminReviews"));
const AdminCoupons = lazy(() => import("./components/admin/AdminCoupons"));
const AdminSales = lazy(() => import("./components/admin/AdminSales"));
const AdminMembership = lazy(() => import("./components/admin/AdminMembership"));

const userScopedKeys = [
  qk.profile.root,
  qk.profile.orders,
  qk.profile.addresses,
  qk.profile.wallet,
  qk.profile.cart,
  qk.profile.wishlist,
  qk.membership.status,
  qk.recommendations.forYou,
];

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
      // Refresh recommendations so a freshly logged-in user gets personalised picks.
      queryClient.invalidateQueries({ queryKey: qk.recommendations.forYou });
      dispatch(setAuthState({ isAuthenticated: true, user: sessionQuery.data.user }));
      return;
    }
    if (sessionQuery.data?.authenticated === false) {
      queryClient.setQueryData(qk.auth.session, { authenticated: false, user: null });
      userScopedKeys.forEach((queryKey) => {
        queryClient.removeQueries({ queryKey });
      });
      dispatch(setAuthState({ isAuthenticated: false, user: null }));
    }
  }, [dispatch, isAdminRoute, queryClient, sessionQuery.data]);

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
          <Toaster
            position="top-right"
            gutter={10}
            containerClassName="premium-toast-region"
            toastOptions={{ duration: 2800 }}
          />
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
