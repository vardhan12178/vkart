import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import Cookies from 'js-cookie';
import store from './redux/store';
import './App.css';
import Login from './components/Login';

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
import Compare from "./components/Compare";


import Blog from "./components/Blog";
import Careers from "./components/Careers";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
import License from "./components/License";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import axios from "./components/axiosInstance";
import BlogIndex from "./components/blog/BlogIndex";
import OrderStages from "./components/OrderStages";
import AdminLogin from "./components/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminSettings from "./components/AdminSettings";
import AdminUsers from "./components/AdminUsers";
import AdminDashboard from "./components/AdminDashboard";
import AdminProducts from "./components/AdminProducts";
import AdminOrders from "./components/AdminOrders";
import AdminOrderDetails from "./components/AdminOrderDetails";
import PostPage from "./components/blog/PostPage";




export {
  React,
  useEffect,
  useState,
  Provider,
  Navigate,
  Route,
  Routes,
  Cookies,
  store,
  Login,
  Register,
  Home,
  About,
  Contact,
  Header,
  Footer,
  Error,
  Products,
  ProductCard,
  Cart,
  Compare,
  Profile,
   Blog,
  Careers,
  Terms,
  Privacy,
  License,
  ForgotPassword,
  ResetPassword,
  axios,
  BlogIndex,
  OrderStages,
  AdminLogin,
  AdminLayout,
  AdminSettings,
  AdminUsers,
  AdminDashboard,
  AdminProducts,
  AdminOrders,
  AdminOrderDetails,
  PostPage,
};
