import { React, useEffect, useState, Provider, Navigate, Route, Routes, store, Compare, Login, Electronics, MenClothing, WomenClothing, Register, Home, About, Contact, Header, Footer, Error, Products, ProductCard, Cart, Profile } from './imports';
import Blog from "./components/Blog";
import Careers from "./components/Careers";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
import License from "./components/License";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import axios from "./components/axiosInstance";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
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
  }, []);

  if (!authReady) return null;

  return (
    <Provider store={store}>
      <div id="root">
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <main>
          <Routes>
            <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/license" element={<License />} />
            <Route path="/products" element={isLoggedIn ? <Products /> : <Navigate to="/login" />} />
            <Route path="/products/electronics" element={isLoggedIn ? <Electronics /> : <Navigate to="/login" />} />
            <Route path="/products/men" element={isLoggedIn ? <MenClothing /> : <Navigate to="/login" />} />
            <Route path="/products/women" element={isLoggedIn ? <WomenClothing /> : <Navigate to="/login" />} />
            <Route path="/product/:id" element={isLoggedIn ? <ProductCard /> : <Navigate to="/login" />} />
            <Route path="/about" element={isLoggedIn ? <About /> : <Navigate to="/login" />} />
            <Route path="/cart" element={isLoggedIn ? <Cart /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isLoggedIn ? <Profile setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/login" />} />
            <Route path="/contact" element={isLoggedIn ? <Contact /> : <Navigate to="/login" />} />
            <Route path="*" element={<Error />} />
          </Routes>
        </main>
        {isLoggedIn && <Footer />}
      </div>
    </Provider>
  );
};

export default App;
