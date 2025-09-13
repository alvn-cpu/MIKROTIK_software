import React from 'react';

// Placeholder components
export const RegisterPage = () => <div>Register Page - To be implemented</div>;
export const PaymentPage = () => <div>Payment Page - To be implemented</div>; 
export const DashboardPage = () => <div>Dashboard Page - To be implemented</div>;
export const AdminDashboard = () => <div>Admin Dashboard - To be implemented</div>;

// Context providers
export const AuthProvider = ({ children }) => children;
export const SocketProvider = ({ children }) => children;

// Components
export const ProtectedRoute = ({ children }) => children;
export const LoadingSpinner = () => <div>Loading...</div>;

// Export defaults
export { RegisterPage as default as RegisterPageDefault } from './RegisterPage';
