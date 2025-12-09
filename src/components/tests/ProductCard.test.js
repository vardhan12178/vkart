import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProductPage from '../ProductCard';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../../redux/cartSlice';
import authReducer from '../../redux/authSlice';
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

jest.mock("react-helmet-async", () => ({ Helmet: () => <></> }));

jest.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
        h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
        h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
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

const mockStore = configureStore({
    reducer: { cart: cartReducer, auth: authReducer },
});

describe('Product Details Page', () => {
    test('fetches and renders product details', async () => {
        const mockData = {
            _id: '123',
            title: 'Detailed Product',
            price: 500,
            images: ['img.jpg'],
            description: 'Desc',
            category: 'tech',
        };

        axios.get.mockImplementation((url) => {
            if (url.includes('/api/products/123')) return Promise.resolve({ data: mockData });
            // Mock related products call
            return Promise.resolve({ data: { products: [] } });
        });

        render(
            <Provider store={mockStore}>
                <MemoryRouter initialEntries={['/product/123']}>
                    <Routes>
                        <Route path="/product/:id" element={<ProductPage />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Detailed Product')).toBeInTheDocument();
            // Use regex for price as it might be formatted
            expect(screen.getByText(/500/)).toBeInTheDocument();
        });
    });
});
