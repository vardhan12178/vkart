import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes, useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import store from './redux/store';
import './App.css';
import { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";

// Eager imports (Utilities & High Priority)
import axios from "./components/axiosInstance";
import ScrollToTop from "./components/ScrollToTop";

// Lazy Load Components
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Home = lazy(() => import('./components/Home'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const Header = lazy(() => import('./components/Header'));
const Footer = lazy(() => import('./components/Footer'));
const AnnouncementBar = lazy(() => import('./components/AnnouncementBar'));
const Error = lazy(() => import('./components/Error'));
const Products = lazy(() => import('./components/Products'));
const ProductCard = lazy(() => import('./components/ProductCard'));
const Cart = lazy(() => import('./components/Cart'));
const Profile = lazy(() => import('./components/Profile'));
const Compare = lazy(() => import("./components/Compare"));

const Blog = lazy(() => import("./components/Blog"));
const BlogIndex = lazy(() => import("./components/blog/BlogIndex"));
const PostPage = lazy(() => import("./components/blog/PostPage"));

const Careers = lazy(() => import("./components/Careers"));
const Terms = lazy(() => import("./components/Terms"));
const Privacy = lazy(() => import("./components/Privacy"));
const License = lazy(() => import("./components/License"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const OrderStages = lazy(() => import("./components/OrderStages"));

// Admin Components (Lazy)
const AdminLogin = lazy(() => import("./components/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminSettings = lazy(() => import("./components/admin/AdminSettings"));
const AdminUsers = lazy(() => import("./components/admin/AdminUsers"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./components/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./components/admin/AdminOrders"));
const AdminOrderDetails = lazy(() => import("./components/admin/AdminOrderDetails"));

// Additional Components requested to be moved
const CookieBanner = lazy(() => import('./components/CookieBanner'));
const AIChatAssistant = lazy(() => import("./components/AIChatAssistant"));

export {
  React,
  useEffect,
  useState,
  lazy,
  Suspense,
  Provider,
  useDispatch,
  useSelector,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  Link,
  useParams,
  Cookies,
  store,
  Toaster,
  Helmet,
  axios,
  ScrollToTop,

  // Components
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
  BlogIndex,
  PostPage,
  Careers,
  Terms,
  Privacy,
  License,
  ForgotPassword,
  ResetPassword,
  OrderStages,
  CookieBanner,
  AIChatAssistant,

  // Admin
  AdminLogin,
  AdminLayout,
  AdminSettings,
  AdminUsers,
  AdminDashboard,
  AdminProducts,
  AdminOrders,
  AdminOrderDetails,
};
