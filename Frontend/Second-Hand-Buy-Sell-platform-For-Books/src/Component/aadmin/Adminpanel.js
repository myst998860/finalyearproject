import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Adminpanel.css';
import { toast } from 'react-toastify';
import { addBook } from '../../services/api';
import { showLogoutConfirmation } from '../ConfirmationToast';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    bookTitle: '',
    author: '',
    category: '',
    condition: '',
    listingType: '',
    location: '',
    price: '',
    description: '',
    isbn: '',
    bookImage: null
  });

  useEffect(() => {
    // Check if user is logged in and is an organization
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = storedUser.userType?.toLowerCase();
    
    if (!storedUser.token || userType !== 'organization') {
      toast.error('Access denied. Organization login required.');
      navigate('/login');
      return;
    }
    
    setUser(storedUser);
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      bookImage: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    data.append('title', formData.bookTitle);
    data.append('author', formData.author);
    data.append('category', formData.category);
    data.append('condition', formData.condition);
    data.append('listingType', formData.listingType);
    data.append('location', formData.location);
    data.append('price', formData.price);
    data.append('description', formData.description);
    data.append('isbn', formData.isbn);
    if (formData.bookImage) {
      data.append('bookImage', formData.bookImage);
    }

    try {
      await addBook(data);
      toast.success('Product listed successfully! Your product is now available for purchase.');
      
      // Reset form
      setFormData({
        bookTitle: '',
        author: '',
        category: '',
        condition: '',
        listingType: '',
        location: '',
        price: '',
        description: '',
        isbn: '',
        bookImage: null,
      });
      
      // Stay on admin panel after successful submission
    } catch (err) {
      toast.error('Failed to add product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const performLogout = () => {
      localStorage.removeItem('user');
      navigate('/login');
    };
    showLogoutConfirmation(performLogout);
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="admin-panel-page">
      {/* Simple Header */}
      <header className="admin-panel-header">
        <div className="admin-header-content">
          <div className="admin-logo-section">
            <h1 className="admin-logo">Lunasu Crochet</h1>
            <span className="admin-badge">Organization Panel</span>
          </div>
          <div className="admin-header-actions">
            <button className="admin-orders-btn" onClick={() => navigate('/organization-products')}>
              View Products
            </button>
            <button className="admin-orders-btn" onClick={() => navigate('/organization-orders')}>
              View Orders
            </button>
            <button className="admin-orders-btn" onClick={() => navigate('/organization-analytics')}>
              Analytics
            </button>
            <span className="admin-user-name">{user.fullName || user.email}</span>
            <button className="admin-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-panel-main">
        <div className="admin-form-header">
          <div className="admin-form-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#E94E8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#E94E8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#E94E8B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Sell Your Product</h1>
          <p>List your product for sale and reach thousands of customers</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-book-form">
          <div className="admin-form-section">
            <h3>Product Information</h3>
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label htmlFor="bookTitle">Product Title *</label>
                <input
                  type="text"
                  id="bookTitle"
                  name="bookTitle"
                  value={formData.bookTitle}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter product title"
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="author">Author/Brand *</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter author name or brand"
                />
              </div>
            </div>

            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="SCIENCE">Science</option>
                  <option value="LITERATURE">Literature</option>
                  <option value="ENGINEERING">Engineering</option>
                  <option value="MATHEMATICS">Mathematics</option>
                  <option value="HISTORY">History</option>
                  <option value="PHILOSOPHY">Philosophy</option>
                  <option value="ARTS">Arts</option>
                  <option value="BUSINESS">Business</option>
                  <option value="TECHNOLOGY">Technology</option>
                  <option value="MEDICAL">Medical</option>
                  <option value="LAW">Law</option>
                  <option value="EDUCATION">Education</option>
                  <option value="FICTION">Fiction</option>
                  <option value="NON_FICTION">Nonfiction</option>
                  <option value="TEXTBOOK">Textbook</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label htmlFor="condition">Product Condition *</label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Condition</option>
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>
            </div>

            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label htmlFor="listingType">Listing Type *</label>
                <select
                  id="listingType"
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Listing Type</option>
                  <option value="SELL">Sell</option>
                  <option value="RENT">Rent</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter location (e.g., Kathmandu)"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="isbn">ISBN/Product Code (Optional)</label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
                placeholder="Enter ISBN or product code"
              />
            </div>
          </div>

          <div className="admin-form-section">
            <h3>Pricing & Details</h3>
            <div className="admin-form-group">
              <label htmlFor="price">Price (Rs.) *</label>
              <div className="admin-price-input-wrapper">
                <span className="admin-currency-symbol">₹</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                placeholder="Describe your product's condition, features, or special notes..."
              />
            </div>
          </div>

          <div className="admin-form-section">
            <h3>Product Images</h3>
            <div className="admin-form-group">
              <label htmlFor="bookImage">Upload Image *</label>
              <div className="admin-file-upload-area">
                <input
                  type="file"
                  id="bookImage"
                  name="bookImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="admin-file-input"
                  required
                />
                <div className="admin-upload-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#9CA3AF"/>
                  </svg>
                  <p>Click to upload image or drag and drop</p>
                  <span>Upload up to 1 image (front cover preferred)</span>
                </div>
                {formData.bookImage && (
                  <div className="admin-image-preview">
                    <img
                      src={URL.createObjectURL(formData.bookImage)}
                      alt="Preview"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="admin-form-actions">
            <button 
              type="submit" 
              className="admin-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="admin-animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Listing Product...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  List Product for Sale
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminPanel;

