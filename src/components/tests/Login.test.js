import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Login from '../Login';
import axios from '../axiosInstance';
import { HelmetProvider } from 'react-helmet-async';
import '@testing-library/jest-dom';

jest.mock('../axiosInstance');
jest.mock('../utils/toast', () => ({
    showToast: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => {
    const filterProps = (props) => {
        const { initial, animate, exit, variants, transition, whileHover, whileTap, custom, ...validProps } = props;
        return validProps;
    };

    return {
        motion: {
            div: ({ children, ...props }) => <div {...filterProps(props)}>{children}</div>,
            p: ({ children, ...props }) => <p {...filterProps(props)}>{children}</p>,
            form: ({ children, ...props }) => <form {...filterProps(props)}>{children}</form>,
            button: ({ children, ...props }) => <button {...filterProps(props)}>{children}</button>,
            h1: ({ children, ...props }) => <h1 {...filterProps(props)}>{children}</h1>,
            span: ({ children, ...props }) => <span {...filterProps(props)}>{children}</span>,
        },
        AnimatePresence: ({ children }) => <>{children}</>,
    };
});

const mockStore = configureStore([]);

describe('Login Component', () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            auth: { isAuthenticated: false, loading: false, error: null }
        });
        axios.post.mockClear();
    });

    test('submits login credentials to /api/login', async () => {
        axios.post.mockResolvedValueOnce({
            data: {
                user: { id: '123', name: 'Test User', role: 'customer' },
                token: 'fake-jwt-token'
            }
        });

        render(
            <Provider store={store}>
                <HelmetProvider>
                    <BrowserRouter>
                        <Login />
                    </BrowserRouter>
                </HelmetProvider>
            </Provider>
        );

        // Fill Form
        fireEvent.change(screen.getByPlaceholderText('admin@vkart.com'), { target: { value: 'user@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/login', expect.objectContaining({
                email: 'user@test.com',
                password: 'password123'
            }), expect.any(Object));
        });
    });
});
