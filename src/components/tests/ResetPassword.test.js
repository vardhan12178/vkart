import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../ResetPassword';
import axios from '../axiosInstance';
import { HelmetProvider } from 'react-helmet-async';
import '@testing-library/jest-dom';

jest.mock('../axiosInstance');

const mockNavigate = jest.fn();
let mockSearch = '?token=test-token-123';
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useLocation: () => ({
        search: mockSearch,
        pathname: '/reset-password'
    })
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

describe('ResetPassword Component', () => {
    const renderReset = () =>
        render(
            <HelmetProvider>
                <BrowserRouter>
                    <ResetPassword />
                </BrowserRouter>
            </HelmetProvider>
        );

    beforeEach(() => {
        mockSearch = '?token=test-token-123';
        mockNavigate.mockClear();
        axios.post.mockClear();
    });

    test('submits new password to /api/auth/reset', async () => {
        const mockPost = axios.post.mockResolvedValue({ data: { message: 'Password reset successful.' } });

        renderReset();

        const passwordInput = screen.getByPlaceholderText('At least 8 characters');
        const confirmInput = screen.getByPlaceholderText('Re-enter password');

        fireEvent.change(passwordInput, { target: { value: 'NewPass123!' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPass123!' } });

        const submitBtn = screen.getByRole('button', { name: /update password/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith('/api/auth/reset', {
                token: 'test-token-123',
                password: 'NewPass123!',
                confirmPassword: 'NewPass123!'
            });
        });

        expect(await screen.findByText('Password reset successful.')).toBeInTheDocument();
    });

    test('navigates to login two seconds after a successful reset', async () => {
        axios.post.mockResolvedValueOnce({ data: { message: 'Password reset successful.' } });

        renderReset();
        fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'NewPass123!' } });
        fireEvent.change(screen.getByPlaceholderText('Re-enter password'), { target: { value: 'NewPass123!' } });
        fireEvent.click(screen.getByRole('button', { name: /update password/i }));

        expect(await screen.findByText('Password reset successful.')).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();

        await waitFor(
            () => {
                expect(mockNavigate).toHaveBeenCalledWith('/login');
            },
            { timeout: 3000 }
        );
    });

    test('blocks submit with missing token and never calls the API', async () => {
        mockSearch = '';
        renderReset();

        fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'NewPass123!' } });
        fireEvent.change(screen.getByPlaceholderText('Re-enter password'), { target: { value: 'NewPass123!' } });
        fireEvent.click(screen.getByRole('button', { name: /update password/i }));

        await waitFor(() => {
            expect(screen.getByText(/missing or invalid reset link/i)).toBeInTheDocument();
        });
        expect(axios.post).not.toHaveBeenCalled();
    });

    test('shows validation error for short password without calling the API', async () => {
        renderReset();
        fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'short' } });
        fireEvent.change(screen.getByPlaceholderText('Re-enter password'), { target: { value: 'short' } });
        fireEvent.click(screen.getByRole('button', { name: /update password/i }));

        await waitFor(() => {
            expect(screen.getByText(/use at least 8 characters/i)).toBeInTheDocument();
        });
        expect(axios.post).not.toHaveBeenCalled();
    });

    test('shows validation error when passwords do not match', async () => {
        renderReset();
        fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'NewPass123!' } });
        fireEvent.change(screen.getByPlaceholderText('Re-enter password'), { target: { value: 'Different123!' } });
        fireEvent.click(screen.getByRole('button', { name: /update password/i }));

        await waitFor(() => {
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        });
        expect(axios.post).not.toHaveBeenCalled();
    });

    test('shows server error message on failed reset', async () => {
        axios.post.mockRejectedValueOnce({
            response: { data: { message: 'Reset link expired' } }
        });

        renderReset();
        fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'NewPass123!' } });
        fireEvent.change(screen.getByPlaceholderText('Re-enter password'), { target: { value: 'NewPass123!' } });
        fireEvent.click(screen.getByRole('button', { name: /update password/i }));

        await waitFor(() => {
            expect(screen.getByText('Reset link expired')).toBeInTheDocument();
        });
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('toggles password visibility', () => {
        renderReset();
        const passwordInput = screen.getByPlaceholderText('At least 8 characters');
        expect(passwordInput).toHaveAttribute('type', 'password');

        const toggleButtons = screen.getAllByRole('button').filter((b) => !b.textContent);
        fireEvent.click(toggleButtons[0]);
        expect(passwordInput).toHaveAttribute('type', 'text');
    });
});
