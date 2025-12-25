import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './RegisterOrganization.css';
import { toast } from 'react-toastify';

const RegisterOrganization = () => {
  const [formData, setFormData] = useState({
    orgName: '',
    orgType: 'orphanage',
    regNumber: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    description: '',
    proof: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, proof: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Organization Registration Data:', formData);
    toast.success('Thank you for registering! Your application will be reviewed shortly.');
  };

  return (
    <div className="book-form-page">
      <Navbar />
      <main className="book-form-main">
        <div className="form-header">
          <div className="form-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21V19C19 17.9391 18.5786 16.9217 17.8284 16.1716C17.0783 15.4214 16.0609 15 15 15H9C7.93913 15 6.92172 15.4214 6.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>Register Your Organization</h1>
          <p>Join our network of organizations dedicated to spreading the joy of reading</p>
        </div>

        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-section">
            <h3>Organization Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="orgName">Organization Name *</label>
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
                <label htmlFor="orgType">Type of Organization *</label>
                <select
                  id="orgType"
                  name="orgType"
                  value={formData.orgType}
                  onChange={handleChange}
                  required
                >
                  <option value="orphanage">Orphanage</option>
                  <option value="school">School</option>
                  <option value="library">Library</option>
                  <option value="community_center">Community Center</option>
                  <option value="ngo">NGO</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="regNumber">Registration / License Number *</label>
              <input
                type="text"
                id="regNumber"
                name="regNumber"
                value={formData.regNumber}
                onChange={handleChange}
                required
                placeholder="Enter registration number"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-grid">
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

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
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

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Street Address *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Enter street address"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="Enter city"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State / Province *</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="Enter state/province"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="zip">Postal / ZIP Code *</label>
              <input
                type="text"
                id="zip"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                required
                placeholder="Enter postal/ZIP code"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-group">
              <label htmlFor="description">Brief Description of Organization *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Describe your organization's mission, activities, and how you plan to use donated books..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="proof">Proof of Registration (Optional)</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="proof"
                  name="proof"
                  onChange={handleFileChange}
                  className="file-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <div className="upload-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13H8" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17H8" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 9H9H8" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>Click to upload document or drag and drop</p>
                  <span>Upload registration certificate, license, or other proof (PDF, JPG, PNG)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Submit Application
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterOrganization; 