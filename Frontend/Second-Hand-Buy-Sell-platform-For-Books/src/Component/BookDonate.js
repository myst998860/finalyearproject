import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './BookDonate.css';
import { toast } from 'react-toastify';

const BookDonate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bookTitle: '',
    author: '',
    genre: '',
    condition: '',
    targetAudience: '',
    description: '',
    images: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Book donation submitted successfully! Thank you for your generosity.');
      setFormData({
        bookTitle: '',
        author: '',
        genre: '',
        condition: '',
        targetAudience: '',
        description: '',
        images: []
      });
      setLoading(false);
      navigate('/search');
    }, 2000);
  };

  return (
    <div className="book-form-page">
      <Navbar />
      
      <main className="book-form-main">
        <div className="form-header">
          <div className="form-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 15L20 17L22 18L20 19L19 21L18 19L16 18L18 17L19 15Z" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 15L6 17L8 18L6 19L5 21L4 19L2 18L4 17L5 15Z" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Donate Your Book</h1>
          <p>Share the gift of knowledge with those who need it most</p>
        </div>

        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-section">
            <h3>Book Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="bookTitle">Book Title *</label>
                <input
                  type="text"
                  id="bookTitle"
                  name="bookTitle"
                  value={formData.bookTitle}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter book title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="author">Author *</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter author name"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="isbn">ISBN (Optional)</label>
                <input
                  type="text"
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  placeholder="Enter ISBN number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="condition">Book Condition *</label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Donation Details</h3>
            <div className="form-group">
              <label htmlFor="targetAudience">Target Audience</label>
              <select
                id="targetAudience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
              >
                <option value="">Select target audience</option>
                <option value="Children">Children (Ages 5-12)</option>
                <option value="Teenagers">Teenagers (Ages 13-18)</option>
                <option value="Young Adults">Young Adults (Ages 19-25)</option>
                <option value="Adults">Adults (Ages 26+)</option>
                <option value="All Ages">All Ages</option>
                <option value="Educational">Educational Institutions</option>
                <option value="Libraries">Libraries</option>
                <option value="Orphanages">Orphanages</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                placeholder="Describe your book's condition, content, why you're donating it, and any special notes..."
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Book Images</h3>
            <div className="form-group">
              <label htmlFor="images">Upload Images</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
                <div className="upload-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#9CA3AF"/>
                  </svg>
                  <p>Click to upload images or drag and drop</p>
                  <span>Upload up to 5 images (front cover, back cover, spine, etc.)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Donating Book...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 15L20 17L22 18L20 19L19 21L18 19L16 18L18 17L19 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 15L6 17L8 18L6 19L5 21L4 19L2 18L4 17L5 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Donate Book
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default BookDonate; 