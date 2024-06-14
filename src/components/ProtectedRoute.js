// components/ProtectedRoute.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // Import js-cookie

const ProtectedRoute = ({ element, path }) => {
  const isLoggedIn = !!Cookies.get('jwt');

  return isLoggedIn ? (
    <Route path={path} element={element} />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
