import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="custom-footer">
      {/* Newsletter Section - Pink Background */}
      <div className="footer-newsletter-section">
        <h2>Stay Updated</h2>
        <p>Subscribe to our newsletter for new products, special offers, and crochet tips.</p>
        <div className="footer-newsletter-form">
          <input
            type="email"
            placeholder="Enter your email"
            className="footer-newsletter-input"
          />
          <button className="footer-newsletter-button">Subscribe</button>
        </div>
      </div>

      {/* Footer Content - Black Background */}
      <div className="footer-black-section">
        <div className="footer-columns">
          {/* Column 1 - Brand Info */}
          <div className="footer-column">
            <h3 className="footer-brand-name">LunasuCrochet</h3>
            <p className="footer-brand-description">
              Handcrafted crochet items made with love and premium materials.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="footer-column">
            <h3 className="footer-column-title">Quick Links</h3>
            <ul className="footer-links">
              <li onClick={() => navigate('/search')}>Shop</li>
              <li onClick={() => navigate('/about')}>About</li>
              <li onClick={() => navigate('/contact')}>Contact</li>
            </ul>
          </div>

          {/* Column 3 - Customer Service */}
          <div className="footer-column">
            <h3 className="footer-column-title">Customer Service</h3>
            <ul className="footer-links">
              <li>Shipping Info</li>
              <li>Returns</li>
              <li>FAQ</li>
            </ul>
          </div>

          {/* Column 4 - Contact Info */}
          <div className="footer-column">
            <h3 className="footer-column-title">Contact Info</h3>
            <ul className="footer-contact-info">
              <li>Email: hello@lunasucrochet.com</li>
              <li>Phone: 98100534266</li>
            </ul>
          </div>
        </div>

        {/* Copyright and Admin */}
        <div className="footer-bottom">
          <span className="footer-copyright">© 2025 LunasuCrochet. All rights reserved.</span>
          <a href="/admin/login" className="footer-admin-link">
            Admin Panel
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;