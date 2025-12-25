import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './RequestBook.css';
import { toast } from 'react-toastify';

const RequestBook = () => {
  const [formData, setFormData] = useState({
    orgName: '',
    contactPerson: '',
    email: '',
    bookTypes: [],
    bookQuantity: '',
    requestReason: '',
    shippingAddress: '',
  });

  const bookGenres = [
    'Children Books', 'Textbooks (K-12)', 'University Textbooks', 'Fiction', 
    'Non-Fiction', 'Science & Technology', 'History', 'Biographies', 'Arts & Music'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const newBookTypes = checked 
        ? [...prev.bookTypes, value] 
        : prev.bookTypes.filter(type => type !== value);
      return { ...prev, bookTypes: newBookTypes };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Book Request Data:', formData);
    toast.success('Your book request has been submitted! We will get back to you soon.');
  };

  return (
    <div className="book-form-page">
      <Navbar />
      <main className="book-form-main">
        <div className="form-header">
          <div className="form-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6V12L16 14" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Request Book Donation</h1>
          <p>Let us know what books your organization needs to support your cause</p>
        </div>

        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-section">
            <h3>Requester Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="orgName">Registered Organization Name *</label>
                <input
                  type="text"
                  id="orgName"
                  name="orgName"
                  value={formData.orgName}
                  onChange={handleChange}
                  required
                  placeholder="Enter organization name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPerson">Contact Person *</label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  required
                  placeholder="Enter contact person name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Contact Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Donation Request Details</h3>
            <div className="form-group">
              <label>Types of Books Needed *</label>
              <div className="checkbox-grid">
                {bookGenres.map(genre => (
                  <label key={genre} className="checkbox-item">
                    <input
                      type="checkbox"
                      name="bookTypes"
                      value={genre}
                      onChange={handleCheckboxChange}
                      className="checkbox-input"
                    />
                    <span className="checkbox-label">{genre}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bookQuantity">Approximate Number of Books Needed *</label>
              <input
                type="number"
                id="bookQuantity"
                name="bookQuantity"
                value={formData.bookQuantity}
                onChange={handleChange}
                required
                min="1"
                placeholder="Enter number of books"
              />
            </div>

            <div className="form-group">
              <label htmlFor="requestReason">Reason for Request *</label>
              <textarea
                id="requestReason"
                name="requestReason"
                value={formData.requestReason}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Briefly explain how these books will be used and the impact they will have..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="shippingAddress">Shipping Address *</label>
              <textarea
                id="shippingAddress"
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Please provide the full address where the books should be sent..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Submit Request
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default RequestBook; 