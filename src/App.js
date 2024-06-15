// App.js
import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Home from './components/Home';
import Login from './components/Login';
import About from './components/About';
import Contact from './components/Contact';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';
import Error from './components/Error';
import Products from './components/Products';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import Cookies from 'js-cookie';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = Cookies.get("jwt_token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <Provider store={store}>
      <div id="root">
        {isLoggedIn && <Header />}
        <main>
          <Routes>
            <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/products" element={isLoggedIn ? <Products /> : <Navigate to="/login" />} />
            <Route path="/product/:id" element={isLoggedIn ? <ProductCard /> : <Navigate to="/login" />} />
            <Route path="/about" element={isLoggedIn ? <About /> : <Navigate to="/login" />} />
            <Route path="/cart" element={isLoggedIn ? <Cart /> : <Navigate to="/login" />} />
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
