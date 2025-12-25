import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './HomePage.css';
import { fetchBooks, getImageUrl } from '../services/api';
import { useCart } from './CartContext';
import { toast } from 'react-toastify';

const Shop = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(12); // Show 12 books per page
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const getBooks = async () => {
      setLoading(true);
      try {
        const data = await fetchBooks();
        setBooks(data.content || data);
      } catch (error) {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    getBooks();
  }, []);

  // Pagination logic
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(books.length / booksPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (book) => {
    const user = localStorage.getItem('user');
    if (!user) {
      toast.info('Please login or signup to add items to your cart.');
      navigate('/login');
      return;
    }

    // Check if user is trying to buy their own book
    const currentUser = JSON.parse(user);
    const isOwnBook = book.user && (book.user.id === currentUser.userId || book.userId === currentUser.userId);
    
    if (isOwnBook) {
      toast.warning('You cannot purchase your own book!');
      return;
    }

    addToCart(book);
    toast.success('Book added to cart!');
    navigate('/cart');
  };

  return (
    <div className="shop-page">
      <Navbar />
      <main>
  <div className="shop-header-center">
    <h1>Explore All Books Here</h1>
    <div className="filters">
      <label className="filter-option">
        <input type="checkbox" checked readOnly />
        <span>All</span>
      </label>
      <label className="filter-option">
        <input type="checkbox" readOnly />
        <span>Novel</span>
      </label>
      <label className="filter-option">
        <input type="checkbox" readOnly />
        <span>Translations</span>
      </label>
      <label className="filter-option">
        <input type="checkbox" readOnly />
        <span>Kids' Stories</span>
      </label>
    </div>
  </div>
        <div className="book-grid">
          {loading ? (
            <div>Loading books...</div>
          ) : books.length === 0 ? (
            <div>No books found.</div>
          ) : (
            currentBooks.map((book, idx) => {
              // Check if current user owns this book
              const user = localStorage.getItem('user');
              const currentUser = user ? JSON.parse(user) : null;
              const isOwnBook = currentUser && book.user && (book.user.id === currentUser.userId || book.userId === currentUser.userId);
              
              return (
                <div className="book-card" key={book.id || idx}>
                  <img
                    src={getImageUrl(book.bookImage)}
                    alt={book.title}
                    className="book-image"
                  />
                  <h3>{book.title}</h3>
                  <p className="author">{book.author}</p>
                  <p className="price">Rs. {book.price}/-</p>
                  
                  {/* Show warning if user owns the book */}
                  {isOwnBook && (
                    <div style={{
                      background: '#fff3cd',
                      color: '#856404',
                      padding: '5px',
                      borderRadius: '3px',
                      marginBottom: '8px',
                      fontSize: '12px',
                      textAlign: 'center'
                    }}>
                      Your book
                    </div>
                  )}
                  
                  <button 
                    className="add-to-cart"
                    onClick={() => handleAddToCart(book)}
                    disabled={isOwnBook}
                    style={{
                      opacity: isOwnBook ? 0.5 : 1,
                      cursor: isOwnBook ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span className="cart-icon">🛒</span> Add to Cart
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && books.length > 0 && totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            margin: '40px 0',
            padding: '20px'
          }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '10px 16px',
                border: '1px solid #d1d5db',
                background: currentPage === 1 ? '#f3f4f6' : 'white',
                color: currentPage === 1 ? '#9ca3af' : '#374151',
                borderRadius: '6px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Previous
            </button>

            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                const isCurrentPage = pageNumber === currentPage;
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    style={{
                      padding: '10px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: isCurrentPage ? '#2E8B57' : 'white',
                      color: isCurrentPage ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: isCurrentPage ? '600' : '400'
                    }}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '10px 16px',
                border: '1px solid #d1d5db',
                background: currentPage === totalPages ? '#f3f4f6' : 'white',
                color: currentPage === totalPages ? '#9ca3af' : '#374151',
                borderRadius: '6px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Next
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Shop;