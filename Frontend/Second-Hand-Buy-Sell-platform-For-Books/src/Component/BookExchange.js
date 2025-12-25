import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './BookExchange.css';
import { toast } from 'react-toastify';

const BookExchange = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bookTitle: '',
    author: '',
    genre: '',
    condition: '',
    desiredGenre: '',
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
      toast.success('Exchange request submitted successfully!');
      setFormData({
        bookTitle: '',
        author: '',
        genre: '',
        condition: '',
        desiredGenre: '',
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
              <path d="M7 16L3 12L7 8M17 8L21 12L17 16M14 4L10 20" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Exchange Your Book</h1>
          <p>Swap your book for another one from our community</p>
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
            <h3>Exchange Preferences</h3>
            <div className="form-group">
              <label htmlFor="desiredGenre">Desired Genre</label>
              <select
                id="desiredGenre"
                name="desiredGenre"
                value={formData.desiredGenre}
                onChange={handleInputChange}
              >
                <option value="">Select preferred genre</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Mystery">Mystery</option>
                <option value="Romance">Romance</option>
                <option value="Sci-Fi">Science Fiction</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Biography">Biography</option>
                <option value="History">History</option>
                <option value="Science">Science</option>
                <option value="Self-Help">Self-Help</option>
                <option value="Any">Any Genre</option>
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
                placeholder="Describe your book's condition, what you're looking for in exchange, any specific preferences..."
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
                  Submitting Request...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 16L3 12L7 8M17 8L21 12L17 16M14 4L10 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Submit Exchange Request
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

export default BookExchange; 