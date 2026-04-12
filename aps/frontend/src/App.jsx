import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Navbar from './components/Navbar';
import { ProtectedRoute, AdminRoute, SuperAdminRoute } from './components/ProtectedRoute';

function AppContent() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

          {/* User Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              {isAdmin ? <Navigate to="/admin" /> : <UserDashboard />}
            </ProtectedRoute>
          } />

          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          } />

          <Route path="/payment-success" element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          } />

          <Route path="/payment-cancel" element={
            <ProtectedRoute>
              <PaymentCancel />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          <Route path="/super-admin" element={
            <SuperAdminRoute>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SearchProvider>
          <AppContent />
        </SearchProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
