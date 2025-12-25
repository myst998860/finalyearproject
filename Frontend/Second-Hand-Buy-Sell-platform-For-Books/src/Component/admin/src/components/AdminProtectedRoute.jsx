import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated } from '../services/api.js';

const AdminProtectedRoute = ({ children }) => {
  // Synchronous check from localStorage
  const isAuthenticated = isAdminAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute; 
 






