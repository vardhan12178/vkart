import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../ForgotPassword';
import axios from '../axiosInstance';
import { HelmetProvider } from 'react-helmet-async';
import '@testing-library/jest-dom';

jest.mock('../axiosInstance');

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

describe('ForgotPassword Component', () => {
    test('submits email to /api/forgot endpoint', async () => {
        axios.post.mockResolvedValueOnce({ data: { message: 'Reset link sent' } });

        render(
            <HelmetProvider>
                <BrowserRouter>
                    <ForgotPassword />
                </BrowserRouter>
            </HelmetProvider>
        );

        const input = screen.getByPlaceholderText('you@example.com');
        // Button might be nested
        const button = screen.getByRole('button', { name: /send reset link/i });

        fireEvent.change(input, { target: { value: 'test@example.com' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/forgot', {
                emailOrUsername: 'test@example.com'
            });
        });

        // Wait for success message
        await waitFor(() => {
            expect(screen.getByText('Reset link sent')).toBeInTheDocument();
        });
    });

    test('shows error message on failure', async () => {
        axios.post.mockRejectedValueOnce({
            response: { data: { message: 'User not found' } }
        });

        render(
            <HelmetProvider>
                <BrowserRouter>
                    <ForgotPassword />
                </BrowserRouter>
            </HelmetProvider>
        );

        fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'wrong@user.com' } });
        fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

        await waitFor(() => {
            expect(screen.getByText('User not found')).toBeInTheDocument();
        });
    });
});
