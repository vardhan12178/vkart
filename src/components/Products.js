import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { FaCartPlus, FaEye, FaHeart, FaRegHeart } from 'react-icons/fa';
import { debounce } from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import Sidebar from './Sidebar';
import Modal from 'react-modal';
import ProductModal from './ProductModal';

Modal.setAppElement('#root'); // Required for accessibility

const Products = () => {
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();

  const fetchProducts = useCallback(async () => {
    let url = `https://fakestoreapi.com/products?limit=10&page=${page}`;
    if (category) {
      url += `/category/${category}`;
    }
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();

      let sortedData = [...data];
      if (sortOption) {
        sortedData.sort((a, b) => {
          let compareA = a[sortOption];
          let compareB = b[sortOption];
          if (sortOption === 'title') {
            compareA = compareA.toLowerCase();
            compareB = compareB.toLowerCase();
          } else if (sortOption === 'rating') {
            compareA = a.rating.rate;
            compareB = b.rating.rate;
          }

          if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
          if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }
      setProducts((prev) => (page === 1 ? sortedData : [...prev, ...sortedData]));
      setIsLoadingProducts(false);
      setHasMore(data.length > 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, [sortOption, category, sortOrder, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = debounce((event) => {
    setSearchTerm(event.target.value);
  }, 300);

  const handleSortChange = (option) => {
    setSortOption(option.value);
    setPage(1);
  };

  const handleCategoryChange = (option) => {
    setCategory(option.value);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    setPage(1);
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, quantity: 1 }));
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category ? product.category === category : true;
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, index) => (
          <span key={index} className="text-yellow-500 text-lg">★</span>
        ))}
        {halfStar === 1 && <span className="text-yellow-500 text-lg">☆</span>}
        {[...Array(emptyStars)].map((_, index) => (
          <span key={index} className="text-gray-300 text-lg">★</span>
        ))}
      </div>
    );
  };

  const ProductSkeleton = () => (
    <div className="border border-gray-300 bg-white p-4 rounded-lg shadow-lg animate-pulse">
      <div className="bg-gray-200 h-48 w-full mb-4 rounded-lg"></div>
      <div className="bg-gray-200 h-6 w-3/4 mb-2 mx-auto rounded"></div>
      <div className="bg-gray-200 h-4 w-1/2 mx-auto rounded"></div>
      <div className="bg-gray-200 h-4 w-1/4 mx-auto mt-2 rounded"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 mt-12">
      <h1 className="text-5xl font-extrabold mb-6 text-center text-gray-900">Products</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <Sidebar
          sortOption={sortOption}
          handleSortChange={handleSortChange}
          category={category}
          handleCategoryChange={handleCategoryChange}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          toggleSortOrder={toggleSortOrder}
          sortOrder={sortOrder}
        />

        <div className="flex-1">
          <div className="max-w-lg w-full mb-8">
            <input
              type="text"
              onChange={handleSearch}
              placeholder="Search products..."
              className="border border-gray-300 rounded-lg p-4 w-full shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <InfiniteScroll
            dataLength={filteredProducts.length}
            next={() => setPage((prev) => prev + 1)}
            hasMore={hasMore}
            loader={<div className="text-center py-4">Loading more products...</div>}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoadingProducts
                ? [...Array(6)].map((_, index) => <ProductSkeleton key={index} />)
                : filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border border-gray-300 bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 relative flex flex-col"
                    >
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-2 left-2 text-red-500 hover:text-red-600"
                      >
                        {wishlist.includes(product.id) ? <FaHeart /> : <FaRegHeart />}
                      </button>
                      <Link to={`/product/${product.id}`} className="block flex-grow">
                        <div className="flex justify-center items-center mb-4 h-48">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="max-h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-center text-gray-900">{product.title}</h2>
                        <p className="text-gray-600 text-center">₹{(product.price * 75).toFixed(2)}</p>
                        <div className="flex justify-center">{renderStars(product.rating.rate)}</div>
                      </Link>
                      <div className="flex justify-center mt-4 gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
                        >
                          <FaCartPlus /> Add to Cart
                        </button>
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors"
                        >
                          <FaEye /> View
                        </button>
                      </div>
                    </div>
                  ))}
            </div>
          </InfiniteScroll>
        </div>
      </div>

      {/* Modal for View Product */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Product Details"
        className="modal"
        overlayClassName="modal-overlay"
        style={{
          overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          },
          content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '900px',
            height: '80%',
            maxHeight: '700px',
            border: '1px solid #ccc',
            background: '#fff',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '8px',
            outline: 'none',
            padding: '20px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          },
        }}
      >
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setIsModalOpen(false)}
            onAddToCart={(product) => handleAddToCart(product)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Products;