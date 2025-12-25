import React from 'react';
import './HomePage.css';

const Footer = () => (
  <footer className="custom-footer">
    <div className="footer-info">
      <img src={require('../Component/assests/footer image.png')} alt="Blue Books" className="footer-books-img" />
      <div className="footer-content">
        <h2 style={{ fontWeight: 700, fontSize: '2rem', margin: 0 }}>
          Your favorite <span style={{ color: '#10b981' }}>Reads</span><br />
          <span style={{ color: '#10b981' }}>Are Here!</span>
        </h2>
        <p style={{ margin: '16px 0 18px 0', fontSize: '1.08rem', color: '#222' }}>
          Buy your favorite books online with ease! Enjoy exclusive offers and discounts on selected titles. Dive into our collection and find special deals that make reading more affordable. 
          Shop now and unlock more savings with every purchase!
        </p>
        <div className="footer-stats">
          <div>
            <div className="footer-stat-number">800+</div>
            <div className="footer-stat-label">Book Listing</div>
          </div>
          <div>
            <div className="footer-stat-number">1K+</div>
            <div className="footer-stat-label">Registered Members</div>
          </div>
          <div>
            <div className="footer-stat-number">50+</div>
            <div className="footer-stat-label">Branch Count</div>
          </div>
        </div>
        <button className="footer-explore-btn">Explore</button>
      </div>
    </div>
    <div className="footer-bar">
      <span>© 2024 | <b>Book Bridge</b></span>
      <span className="footer-branch-msg">Visit our branches in Lalitpur, and register for our online platform to enjoy maximum benefits!</span>
      <a href="/admin/login" style={{ color: '#2196f3', textDecoration: 'none', fontSize: '0.9rem' }}>
        Admin Panel
      </a>
    </div>
  </footer>
);

export default Footer;