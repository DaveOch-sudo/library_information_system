/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
