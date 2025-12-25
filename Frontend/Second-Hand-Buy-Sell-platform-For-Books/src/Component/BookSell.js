import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './BookSell.css';
import { toast } from 'react-toastify';
import { addBook } from '../services/api';

const BookSell = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    bookImage: null // Will be updated with the file from input
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; // Take the first file for simplicity
    setFormData((prev) => ({
      ...prev,
      bookImage: file, // Update with the uploaded file
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
      data.append('bookImage', formData.bookImage); // Append the file
    }

    try {
      await addBook(data);
      toast.success('Book listed successfully! Your book is now available for purchase.');
      
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
      
      // Navigate to search page after successful submission
      navigate('/search');
    } catch (err) {
      toast.error('Failed to add book: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-form-page">
      <Navbar />
      
      <main className="book-form-main">
        <div className="form-header">
          <div className="form-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Sell Your Book</h1>
          <p>List your book for sale and reach thousands of readers</p>
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

              <div className="form-group">
                <label htmlFor="condition">Book Condition *</label>
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

            <div className="form-grid">
              <div className="form-group">
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

              <div className="form-group">
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
          </div>

          <div className="form-section">
            <h3>Pricing & Details</h3>
            <div className="form-group">
              <label htmlFor="price">Price (Rs.) *</label>
              <div className="price-input-wrapper">
                <span className="currency-symbol">₹</span>
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

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                placeholder="Describe your book's condition, any highlights, notes, or special features..."
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Book Images</h3>
            <div className="form-group">
              <label htmlFor="bookImage">Upload Image *</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="bookImage"
                  name="bookImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                  required
                />
                <div className="upload-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#9CA3AF"/>
                  </svg>
                  <p>Click to upload image or drag and drop</p>
                  <span>Upload up to 1 image (front cover preferred)</span>
                </div>
                {formData.bookImage && (
                  <div className="image-preview">
                    <img
                      src={URL.createObjectURL(formData.bookImage)}
                      alt="Preview"
                    />
                  </div>
                )}
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
                  Listing Book...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  List Book for Sale
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

export default BookSell; 