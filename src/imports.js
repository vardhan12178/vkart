import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import Cookies from 'js-cookie';
import store from './redux/store';
import './App.css';
import Login from './components/Login';
import Electronics from './components/Electronics';
import { MenClothing } from './components/Clothing';
import { WomenClothing } from './components/Clothing';
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

export {
  React,
  useEffect,
  Electronics,
 MenClothing,
 WomenClothing,
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
  Profile
};
