import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import About from './components/About';
import Contact from './components/Contact';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css'; 
import Error from './components/Error';
import Cookies from 'js-cookie';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  

  useEffect(() => {
    const token = Cookies.get("jwt_token");
    console.log('Token:', token); 
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <div id="root">
      {isLoggedIn && <Header />}
      <main>
        <Routes>
          <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
          <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" />} />
          <Route path="/about" element={isLoggedIn ? <About /> : <Navigate to="/login" />} />
          <Route path="/contact" element={isLoggedIn ? <Contact /> : <Navigate to="/login" />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </main>
      {isLoggedIn && <Footer />}
    </div>
  );
};

export default App;
