import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminAuthenticated } from '../services/api.js';

export const useAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await isAdminAuthenticated();
        if (!isAuthenticated) {
          console.log('User not authenticated, redirecting to login');
          navigate('/admin/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/admin/login');
      }
    };

    checkAuth();
  }, [navigate]);

  return null;
}; 