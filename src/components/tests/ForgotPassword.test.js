import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../ForgotPassword';
import axios from '../axiosInstance';
import { HelmetProvider } from 'react-helmet-async';
import '@testing-library/jest-dom';

jest.mock('../axiosInstance');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
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

describe('ForgotPassword Component', () => {
    const renderForgot = () =>
        render(
            <HelmetProvider>
                <BrowserRouter>
                    <ForgotPassword />
                </BrowserRouter>
            </HelmetProvider>
        );

    beforeEach(() => {
        mockNavigate.mockClear();
        axios.post.mockClear();
    });

    test('blocks submit and shows validation error when field is empty', async () => {
        renderForgot();
        fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

        await waitFor(() => {
            expect(screen.getByText(/please enter your email or username/i)).toBeInTheDocument();
        });
        expect(axios.post).not.toHaveBeenCalled();
    });

    test('submits trimmed email to /api/forgot endpoint', async () => {
        axios.post.mockResolvedValueOnce({ data: { message: 'Reset link sent' } });

        renderForgot();

        const input = screen.getByPlaceholderText('you@example.com');
        const button = screen.getByRole('button', { name: /send reset link/i });

        fireEvent.change(input, { target: { value: '  test@example.com  ' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/forgot', {
                emailOrUsername: 'test@example.com'
            });
        });

        await waitFor(() => {
            expect(screen.getByText('Reset link sent')).toBeInTheDocument();
        });
    });

    test('shows error message on failure', async () => {
        axios.post.mockRejectedValueOnce({
            response: { data: { message: 'User not found' } }
        });

        renderForgot();

        fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'wrong@user.com' } });
        fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

        await waitFor(() => {
            expect(screen.getByText('User not found')).toBeInTheDocument();
        });
    });

    test('shows generic error message when server sends no message', async () => {
        axios.post.mockRejectedValueOnce(new Error('network down'));

        renderForgot();
        fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

        await waitFor(() => {
            expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
        });
    });

    test('navigates back to login when link is clicked', () => {
        renderForgot();
        fireEvent.click(screen.getByRole('button', { name: /back to sign in/i }));
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('navigates to register when create account is clicked', () => {
        renderForgot();
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));
        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
});
