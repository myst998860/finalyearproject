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
        <div className="overlay">
          <h1 className="fade-in">Welcome to Book Bridge</h1>
          <p className="fade-in delay-1">
            Connecting readers and book lovers across the world.
          </p>
          <div className="hero-actions fade-in delay-2">
            <input
              type="text"
              placeholder="Search a book..."
              className="hero-search"
            />
            <button className="join-button">Join Us</button>
          </div>
        </div>
      </section>
      <section className="best-picks fade-in delay-3">
        <h2>Our Best Picks</h2>
        <div className="book-grid">
          {loading ? (
            <div>Loading...</div>
          ) : books.map((book, idx) => (
            <div className="book-card" key={idx}>
              <img src={getImageUrl(book.bookImage)} alt={book.title} className="book-image" />
              <h3>{book.title}</h3>
              <p><strong>Author:</strong> {book.author}</p>
              <p>{book.description}</p>
              <p className="price">Rs. {book.price}</p>
              <button className="details-button" onClick={() => navigate('/view-details', { state: { book } })}>View Details</button>
            </div>
          ))}
        </div>
      </section>
      <NewCollection />
      <UsedBooksSection />
      <Footer />
    </div>
  );
};

export default HomePage;
