/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider } from './context/AuthContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleGuard } from './components/RoleGuard';
import { UserRole } from './types';
import { MainLayout } from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import Loans from './pages/Loans';
import Fines from './pages/Fines';
import Users from './pages/Users';
import Reports from './pages/Reports';
import BookDiscovery from './pages/BookDiscovery';
import Authors from './pages/Authors';
import Categories from './pages/Categories';
import Shelves from './pages/Shelves';
import Reservations from './pages/Reservations';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Common Roles */}
              <Route path="/loans" element={<Loans />} />
              <Route path="/fines" element={<Fines />} />
              <Route path="/reservations" element={<Reservations />} />

              {/* Student specific */}
              <Route element={<RoleGuard allowedRoles={[UserRole.STUDENT]} />}>
                <Route path="/discovery" element={<BookDiscovery />} />
              </Route>

              {/* Admin & Librarian */}
              <Route element={<RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.LIBRARIAN]} />}>
                <Route path="/books" element={<Books />} />
                <Route path="/authors" element={<Authors />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/shelves" element={<Shelves />} />
                <Route path="/reports" element={<Reports />} />
              </Route>

              {/* Admin Only */}
              <Route element={<RoleGuard allowedRoles={[UserRole.ADMIN]} />}>
                <Route path="/users" element={<Users />} />
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
