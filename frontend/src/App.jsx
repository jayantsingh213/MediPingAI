import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';

// Page Imports
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PharmacyRegistration from './pages/PharmacyRegistration';
import UserDashboard from './pages/UserDashboard';
import SearchPage from './pages/SearchPage';
import PharmacyDetails from './pages/PharmacyDetails';
import ReservationDetails from './pages/ReservationDetails';
import ProfilePage from './pages/ProfilePage';
import PharmacyDashboard from './pages/PharmacyDashboard';
import PharmacyInventory from './pages/PharmacyInventory';
import PharmacyAnalytics from './pages/PharmacyAnalytics';
import AdminDashboard from './pages/AdminDashboard';
import AdminVerification from './pages/AdminVerification';
import AdminAnalytics from './pages/AdminAnalytics';

// Private Route Wrappers to guarantee auth safety
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="pt-32 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard if unauthorized
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'pharmacy') return <Navigate to="/pharmacy-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* General / Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register-pharmacy" element={<PharmacyRegistration />} />

        {/* User / Patient Routes */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute allowedRoles={['user']}>
              <UserDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/search" 
          element={
            <PrivateRoute allowedRoles={['user']}>
              <SearchPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/pharmacy/:id" 
          element={
            <PrivateRoute allowedRoles={['user']}>
              <PharmacyDetails />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/reservation/:id" 
          element={
            <PrivateRoute allowedRoles={['user']}>
              <ReservationDetails />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute allowedRoles={['user']}>
              <ProfilePage />
            </PrivateRoute>
          } 
        />

        {/* Pharmacy / Pharmacist Routes */}
        <Route 
          path="/pharmacy-dashboard" 
          element={
            <PrivateRoute allowedRoles={['pharmacy']}>
              <PharmacyDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/pharmacy-inventory" 
          element={
            <PrivateRoute allowedRoles={['pharmacy']}>
              <PharmacyInventory />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/pharmacy-analytics" 
          element={
            <PrivateRoute allowedRoles={['pharmacy']}>
              <PharmacyAnalytics />
            </PrivateRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin-verification" 
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminVerification />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin-analytics" 
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminAnalytics />
            </PrivateRoute>
          } 
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize React Query Client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <AppContent />
          </Router>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
