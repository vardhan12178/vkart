import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../ResetPassword';
import axios from '../axiosInstance';
import { HelmetProvider } from 'react-helmet-async';
import '@testing-library/jest-dom';

jest.mock('../axiosInstance');

// Mock useLocation
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: () => ({
        search: '?token=test-token-123',
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
    test('submits new password to /api/auth/reset', async () => {
        // Setup Mock
        const mockPost = axios.post.mockResolvedValue({ data: { message: 'Password reset successful.' } });

        render(
            <HelmetProvider>
                <BrowserRouter>
                    <ResetPassword />
                </BrowserRouter>
            </HelmetProvider>
        );

        // Fill Passwords
        const passwordInput = screen.getByPlaceholderText('At least 8 characters');
        const confirmInput = screen.getByPlaceholderText('Re-enter password');

        fireEvent.change(passwordInput, { target: { value: 'NewPass123!' } });
        fireEvent.change(confirmInput, { target: { value: 'NewPass123!' } });

        // Click Submit
        const submitBtn = screen.getByRole('button', { name: /update password/i });
        fireEvent.click(submitBtn);

        // Wait for API call
        await waitFor(() => {
            expect(mockPost).toHaveBeenCalledWith('/api/auth/reset', {
                token: 'test-token-123',
                password: 'NewPass123!',
                confirmPassword: 'NewPass123!'
            });
        });

        // Verify Success Message
        expect(await screen.findByText('Password reset successful.')).toBeInTheDocument();
    });
});
