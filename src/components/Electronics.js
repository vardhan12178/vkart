import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { FaCartPlus, FaEye, FaHeart, FaRegHeart } from 'react-icons/fa';
import { debounce } from 'lodash';
import InfiniteScroll from 'react-infinite-scroll-component';
import Sidebar from './Sidebar';
import Modal from 'react-modal';
import ProductModal from './ProductModal';

Modal.setAppElement('#root');

const Electronics = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const [category] = useState('electronics');
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

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products/category/electronics');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setAllProducts(data);
        setIsLoadingProducts(false);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...allProducts].filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    if (sortOption) {
      filtered.sort((a, b) => {
        let compareA = a[sortOption];
        let compareB = b[sortOption];
        if (sortOption === 'title') {
          compareA = compareA.toLowerCase();
          compareB = compareB.toLowerCase();
        } else if (sortOption === 'rating') {
          compareA = a.rating.rate;
          compareB = b.rating.rate;
        }
        return sortOrder === 'asc' ? (compareA < compareB ? -1 : 1) : (compareB < compareA ? -1 : 1);
      });
    }

    const paginated = filtered.slice(0, page * ITEMS_PER_PAGE);
    setProducts(paginated);
    setHasMore(paginated.length < filtered.length);
  }, [allProducts, searchTerm, sortOption, sortOrder, priceRange, page]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const debouncedSearch = debounce(() => {
    setPage(1);
  }, 300);

  const handleSearchChange = (event) => {
    handleSearch(event);
    debouncedSearch();
  };

  const clearSearch = () => {
    setSearchTerm('');
    setPage(1);
  };

  const handleSortChange = (option) => {
    setSortOption(option.value);
    setPage(1);
  };

  const handleCategoryChange = (option) => {};

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    setPage(1);
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, quantity: 1 }));
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

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
      <h1 className="text-5xl font-extrabold mb-6 text-center text-gray-900">Electronics</h1>

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
          disableCategory={true}
        />

        <div className="flex-1">
          <div className="max-w-lg w-full mb-8 relative">
            <input
              type="text"
              onChange={handleSearchChange}
              value={searchTerm}
              placeholder="Search electronics..."
              className="border border-gray-300 rounded-lg p-4 w-full shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>

          <InfiniteScroll
            dataLength={products.length}
            next={() => setPage((prev) => prev + 1)}
            hasMore={hasMore}
            loader={<div className="text-center py-4">Loading more products...</div>}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoadingProducts ? (
                [...Array(6)].map((_, index) => <ProductSkeleton key={index} />)
              ) : products.length === 0 ? (
                <div className="flex justify-center items-center col-span-3 h-64 text-gray-600">
                  No products found
                </div>
              ) : (
                products.map((product) => (
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
                      <h2 className="text-xl font-semibold mb-2 text-center text-gray-900">
                        {product.title}
                      </h2>
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
                ))
              )}
            </div>
          </InfiniteScroll>
        </div>
      </div>

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

export default Electronics;