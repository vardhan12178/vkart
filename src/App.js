
import {React,useEffect,useState,Provider,Navigate,Route,Routes,Cookies,store,Login,Register,Home,About,Contact,Header,Footer,Error,Products,ProductCard,Cart} from './imports';

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
