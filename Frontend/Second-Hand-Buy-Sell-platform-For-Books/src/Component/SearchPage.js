import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './SearchPage.css';
import { fetchBooks, getImageUrl } from '../services/api';

const suggestions = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Romance',
  'Mystery',
  'Biography',
  'History',
  'Self-Help',
  'Children Books',
  'Academic'
];

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8;

  // Calculate paginated books
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const paginatedBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on new search/filter
  }, [filteredBooks]);

  useEffect(() => {
    const getBooks = async () => {
      setLoading(true);
      try {
        const data = await fetchBooks();
        setBooks(data.content || data);
        setFilteredBooks(data.content || data);
      } catch (error) {
        setBooks([]);
        setFilteredBooks([]);
      } finally {
        setLoading(false);
      }
    };
    getBooks();
  }, []);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      filterBooks(query);
    } else {
      setSearchQuery('');
      setFilteredBooks(books);
    }
    // eslint-disable-next-line
  }, [searchParams, books]);

  const filterBooks = (search) => {
    let filtered = books;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(book =>
        (book.title && book.title.toLowerCase().includes(searchLower)) ||
        (book.author && book.author.toLowerCase().includes(searchLower)) ||
        (book.genre && book.genre.toLowerCase().includes(searchLower)) ||
        (book.description && book.description.toLowerCase().includes(searchLower))
      );
    }
    setFilteredBooks(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      filterBooks(searchQuery.trim());
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    filterBooks(suggestion);
  };

  const handleViewDetails = (book) => {
    navigate('/view-details', { state: { book } });
  };

  return (
    <div className="search-page">
      <Navbar />
      <div className="search-content">
        <div className="search-hero">
          <h1>Find Your Perfect Book</h1>
          <p>Search for books by title, author, genre, or keyword. Discover a world of stories and knowledge!</p>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-container">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search for books, authors, or genres..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button className="search-button" type="submit" disabled={loading}>Search</button>
            </div>
          </form>
            <div className="search-suggestions">
              <h3>Popular Searches</h3>
              <div className="suggestion-tags">
              {suggestions.map(s => (
                <span key={s} onClick={() => handleSuggestionClick(s)}>{s}</span>
                ))}
              </div>
            </div>
        </div>
      </div>
      <main>
        {loading ? (
          <div className="no-results"><h3>Loading books...</h3></div>
        ) : filteredBooks.length === 0 ? (
          <div className="no-results">
            <h3>No books found</h3>
            <p>Try a different search or browse popular categories above.</p>
          </div>
        ) : (
          <>
          <div className="book-grid">
            {paginatedBooks.map(book => (
              <div key={book.id} className="book-card-item">
                <img src={getImageUrl(book.bookImage)} alt={book.title} className="book-card-image" />
                <div className="book-card-content">
                  <h3 className="book-card-title">{book.title}</h3>
                  <p className="book-card-author">{book.author}</p>
                  <p className="book-card-description">{book.description}</p>
                  <div className="book-card-footer">
                    <p className="book-card-price">Rs. {book.price}</p>
                    <button className="purchase-btn" onClick={() => handleViewDetails(book)}>View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={currentPage === i + 1 ? 'active' : ''}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage; 