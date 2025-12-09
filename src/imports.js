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
import AnnouncementBar from './components/AnnouncementBar';
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
import AdminLogin from "./components/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminSettings from "./components/admin/AdminSettings";
import AdminUsers from "./components/admin/AdminUsers";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminProducts from "./components/admin/AdminProducts";
import AdminOrders from "./components/admin/AdminOrders";
import AdminOrderDetails from "./components/admin/AdminOrderDetails";
import PostPage from "./components/blog/PostPage";
import ScrollToTop from "./components/ScrollToTop";




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
  AnnouncementBar,
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
  ScrollToTop,
};
