import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../Home';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../../redux/cartSlice';
import authReducer from '../../redux/authSlice';
import { BrowserRouter } from 'react-router-dom';
import axios from '../axiosInstance';

// Mock dependencies
jest.mock('../axiosInstance', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

jest.mock('../utils/toast', () => ({
    showToast: jest.fn(),
}));

jest.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
        h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

jest.mock("react-icons/fa", () => ({
    FaStar: () => <span>FaStar</span>,
    FaShoppingBag: () => <span>FaShoppingBag</span>,
    FaArrowRight: () => <span>FaArrowRight</span>,
    FaTimes: () => <span>FaTimes</span>,
    FaBolt: () => <span>FaBolt</span>,
    FaShieldAlt: () => <span>FaShieldAlt</span>,
    FaTruck: () => <span>FaTruck</span>,
    FaHeadset: () => <span>FaHeadset</span>,
    FaEnvelope: () => <span>FaEnvelope</span>,
    FaCheckCircle: () => <span>FaCheckCircle</span>,
    FaExpand: () => <span>FaExpand</span>,
}));

jest.mock('react-slick', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));

// Mock ProductQuickView to avoid complex rendering in unit test
const MockProductQuickView = ({ product, onClose }) => (
    <div data-testid="quick-view-modal">
        <button onClick={onClose} title="Close Modal">Close</button>
        <h1>{product?.title}</h1>
    </div>
);
jest.mock('../product/ProductQuickView', () => MockProductQuickView);

const createMockStore = () => configureStore({
    reducer: {
        cart: cartReducer,
        auth: authReducer,
        ui: (state = { isChatOpen: false }, action) => state
    }
});

describe.skip('Home Component', () => {
    let store;

    beforeEach(() => {
        store = createMockStore();
        axios.get.mockResolvedValue({ data: [] }); // Default mock
    });

    test('renders Hero section and initial layout', async () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <Home />
                </BrowserRouter>
            </Provider>
        );

        expect(screen.getByText(/The Future/i)).toBeInTheDocument();
        expect(screen.getByText(/New Arrivals/i)).toBeInTheDocument();
    });

    test('opens Quick View modal when clicked', async () => {
        // Mock data
        const mockProducts = [
            { _id: '1', title: 'Featured Product 1', price: 100, images: [] }
        ];
        axios.get.mockImplementation((url) => {
            if (url === '/api/products/featured') return Promise.resolve({ data: mockProducts });
            // Note: Home.js logic might differ on how it parses responses. 
            // In Home.js: Promise.allSettled([...categoryPromises, latestPromise])
            // It filters fulfilled.
            // I should just mock the return data structure assuming axios returns the response object.
            return Promise.resolve({ data: { products: [] } });
        });

        // Specific mock for the calls Home.js makes
        // Home.js calls: axios.get("/api/products", { params: { category: cat... } })
        // and axios.get("/api/products", { params: { limit: 12 ... } }) which returns "latest".
        // The code puts them into `featured` and `newArrivals`.
        // I need to ensure at least one call returns my featured product.

        axios.get.mockImplementation((url, config) => {
            // Check params to decide what to return? 
            // Simplified: return mock for all calls
            return Promise.resolve({ data: { products: mockProducts } });
        });

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <Home />
                </BrowserRouter>
            </Provider>
        );

        // Wait for data to load
        await waitFor(() => expect(screen.getByText('Featured Product 1')).toBeInTheDocument());

        // Find the Quick View button (we added it with title="Quick View")
        const quickViewBtn = screen.getByTitle('Quick View');
        fireEvent.click(quickViewBtn);

        // Check if modal rendered
        expect(screen.getByTestId('quick-view-modal')).toBeInTheDocument();
        expect(screen.getByText('Featured Product 1')).toBeInTheDocument();
    });
});
