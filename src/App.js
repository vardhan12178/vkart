import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import Cookies from 'js-cookie';
import store from './redux/store';
import './App.css';
import Login from './components/Login';
import Electronics from './components/Electronics';
import { MenClothing, WomenClothing } from './components/Clothing';
import Register from './components/Register';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Header from './components/Header';
import Footer from './components/Footer';
import Error from './components/Error';
import Products from './components/Products';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import Profile from './components/Profile';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = Cookies.get("jwt_token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <Provider store={store}>
      <div id="root">
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <main>
          <Routes>
            <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register />} />
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
