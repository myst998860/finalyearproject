import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { adminLogin, setAdminSession } from '../services/api.js';
import './Login.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Clear form fields on mount to prevent browser auto-fill
  useEffect(() => {
    setFormData({
      username: '',
      password: ''
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Pass credentials as an object with email and password
      const credentials = {
        email: formData.username,
        password: formData.password
      };
      
      const response = await adminLogin(credentials);
      
      // Check for successful login response
      if (response.message === 'Admin login successful' || response.admin) {
        // Store admin session in localStorage WITH TOKEN
        setAdminSession({
          email: formData.username,
          token: response.token, // Store JWT token
          loginTime: new Date().toISOString(),
          ...response.admin
        });
        
        console.log('Admin login successful:', response);
        toast.success('Login successful! Welcome to Admin Panel', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Redirect to admin dashboard
        setTimeout(() => {
          window.location.href = '/admin';
        }, 500);
      } else {
        setError('Invalid response from server');
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message.includes('403')) {
        errorMessage = 'Access denied. Please check your credentials.';
      } else if (error.message.includes('empty response')) {
        errorMessage = 'Server is not responding. Please try again later.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Invalid email or password.';
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  return (
    <div className="admin-login-container">
      {/* Navigation */}
      <nav className="admin-nav">
        <div className="nav-content">
          <div className="nav-left">
            <button
              onClick={handleBackToMain}
              className="back-button"
            >
              <ArrowLeft className="back-icon" />
              Back to Main Site
            </button>
          </div>
          <div className="nav-center">
            <h1 className="brand-name">BookBridge</h1>
          </div>
          <div className="nav-right">
            <div className="nav-spacer"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="login-content">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo-container">
              <Lock className="logo-icon" />
            </div>
            <h2 className="login-title">Admin Login</h2>
            <p className="login-subtitle">Sign in to your admin account</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-container">
              <AlertCircle className="error-icon" />
              <span className="error-text">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Email
              </label>
              <div className="input-container">
                <input
                  id="username"
                  name="username"
                  type="email"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-container">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="toggle-icon" />
                  ) : (
                    <Eye className="toggle-icon" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? (
                <div className="loading-content">
                  <div className="spinner"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="help-text">
            <p>Need help? Contact the system administrator</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="admin-footer">
        <div className="footer-content">
          <div className="footer-left">
            <p className="copyright">© 2024 BookBridge. All rights reserved.</p>
          </div>
          <div className="footer-right">
            <button type="button" className="footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Privacy Policy</button>
            <button type="button" className="footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Terms of Service</button>
            <button type="button" className="footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Support</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLogin; 
 