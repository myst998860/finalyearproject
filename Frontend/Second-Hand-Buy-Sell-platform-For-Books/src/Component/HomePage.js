import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import UsedBooksSection from './UsedBooksSection';
import NewCollection from './NewCollection';
import './HomePage.css';
import './UsedBooksSection.css';
import { fetchBooks, getImageUrl } from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getBooks = async () => {
      setLoading(true);
      try {
        const data = await fetchBooks();
        setBooks((data.content || data).slice(0, 4));
      } catch (error) {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    getBooks();
  }, []);

  return (
    <div className="homepage-container">
      <Navbar />
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="fade-in">
              Handcrafted with <span className="highlight-pink">Love</span>
            </h1>
            <p className="fade-in delay-1">
              Discover beautiful, handmade crochet items crafted with premium yarns and endless care. From cozy blankets to adorable amigurumi, each piece tells a story.
            </p>
            <div className="hero-actions fade-in delay-2">
              <button className="explore-button" onClick={() => navigate('/search')}>Explore Collection</button>
              <button className="story-button" onClick={() => navigate('/about')}>Our Story</button>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-image-placeholder">
              <div className="review-badge">
                <span className="star-icon">⭐</span>
                <span>4.5/5 from 200+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="features-section">
        <div className="feature-item">
          <div className="feature-icon pink-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 3H5L7.68 14.39C7.77 14.7 8.06 14.94 8.38 14.94H19V16.94H8.5C7.95 16.94 7.5 16.49 7.5 15.94C7.5 15.39 7.95 14.94 8.5 14.94H19.5L22.5 5.94H6.5L5.5 1.94H1V3.94Z" fill="white"/>
              <path d="M9 20.94C10.1046 20.94 11 20.0446 11 18.94C11 17.8354 10.1046 16.94 9 16.94C7.89543 16.94 7 17.8354 7 18.94C7 20.0446 7.89543 20.94 9 20.94Z" fill="white"/>
              <path d="M20 20.94C21.1046 20.94 22 20.0446 22 18.94C22 17.8354 21.1046 16.94 20 16.94C18.8954 16.94 18 17.8354 18 18.94C18 20.0446 18.8954 20.94 20 20.94Z" fill="white"/>
            </svg>
          </div>
          <h3>Free Shipping</h3>
          <p>Free Shipping on orders over 1k</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon pink-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Quality Guarantee</h3>
          <p>Free 30-day money back guarantee</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon pink-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="10" r="3" stroke="white" strokeWidth="2"/>
              <path d="M8 18C8 15.7909 9.79086 14 12 14C14.2091 14 16 15.7909 16 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 8L4 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18 8L20 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 2V4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3>Handmade Quality</h3>
          <p>Each item is carefully handcrafted</p>
        </div>
      </section>

      <section className="featured-products fade-in delay-3">
        <h2>Featured Products</h2>
        <p className="featured-subtitle">Discover our most popular handcrafted crochet items, loved by customers worldwide</p>
        <div className="book-grid">
          {loading ? (
            <div>Loading...</div>
          ) : books.slice(0, 3).map((book, idx) => (
            <div className="book-card" key={idx}>
              <div className="product-image-placeholder">
                <img src={getImageUrl(book.bookImage)} alt={book.title} className="book-image" />
              </div>
              <h3>{book.title}</h3>
              <div className="star-rating">
                <span className="star">⭐</span>
                <span className="star">⭐</span>
                <span className="star">⭐</span>
                <span className="star">⭐</span>
                <span className="star">⭐</span>
              </div>
              <p className="price">NRP. {book.price}/-</p>
              <button className="details-button" onClick={() => navigate('/view-details', { state: { book } })}>View Detail</button>
            </div>
          ))}
        </div>
        <button className="view-all-button" onClick={() => navigate('/search')}>View All Product</button>
      </section>

      <section className="newsletter-section">
        <h2>Stay Updated</h2>
        <p>Subscribe to our newsletter for new products, special offers, and crochet tips.</p>
        <div className="newsletter-form">
          <input
            type="email"
            placeholder="Enter your email"
            className="newsletter-input"
          />
          <button className="newsletter-button">Subscribe</button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
