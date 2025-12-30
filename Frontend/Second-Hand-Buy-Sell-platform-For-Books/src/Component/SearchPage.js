import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './SearchPage.css';
import './HomePage.css';
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
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [selectedPriceRange, setSelectedPriceRange] = useState([]);
  const [sortBy, setSortBy] = useState('Featured');
  const booksPerPage = 12;

  const categories = [
    'All Products',
    'Blankets',
    'Toys',
    'Accessories',
    'Home Decor',
    'Baby Items'
  ];

  const priceRanges = [
    { label: 'Under $20', value: 'under-20' },
    { label: '$20 - $40', value: '20-40' },
    { label: '$40 - $60', value: '40-60' },
    { label: 'Over $60', value: 'over-60' }
  ];

  const handlePriceRangeChange = (value) => {
    setSelectedPriceRange(prev => 
      prev.includes(value) 
        ? prev.filter(p => p !== value)
        : [...prev, value]
    );
  };

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
    <div className="search-page shop-page">
      <Navbar />
      <main className="shop-main-container">
        {/* Breadcrumbs */}
        <div className="shop-breadcrumbs">
          <span className="breadcrumb-icon">🏠</span>
          <span onClick={() => navigate('/')} className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator"> &gt; </span>
          <span className="breadcrumb-current">Shop</span>
        </div>

        {/* Page Title and Subtitle */}
        <div className="shop-page-header">
          <h1 className="shop-page-title">Our Collection</h1>
          <p className="shop-page-subtitle">Discover beautiful handcrafted crochet items</p>
        </div>

        {/* Main Content with Sidebar */}
        <div className="shop-content-wrapper">
          {/* Left Sidebar - Categories */}
          <aside className="shop-sidebar">
            <div className="sidebar-categories-card">
              <h2 className="sidebar-categories-title">Categories</h2>
              <ul className="sidebar-categories-list">
                {categories.map((category) => (
                  <li
                    key={category}
                    className={`sidebar-category-item ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range Filter */}
            <div className="sidebar-price-range-card">
              <h2 className="sidebar-categories-title">Price Range</h2>
              <ul className="sidebar-price-range-list">
                {priceRanges.map((range) => (
                  <li key={range.value} className="sidebar-price-range-item">
                    <label className="price-range-label">
                      <input
                        type="checkbox"
                        checked={selectedPriceRange.includes(range.value)}
                        onChange={() => handlePriceRangeChange(range.value)}
                        className="price-range-checkbox"
                      />
                      <span>{range.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Right Main Content */}
          <div className="shop-main-content">
            {/* Results Header with Sort */}
            <div className="shop-results-header">
              <span className="showing-products-text">
                Showing {filteredBooks.length} products
              </span>
              <div className="shop-sort-container">
                <span className="sort-label">Sort by:</span>
                <select 
                  className="sort-dropdown"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="Featured">Featured</option>
                  <option value="Price Low to High">Price Low to High</option>
                  <option value="Price High to Low">Price High to Low</option>
                  <option value="Newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Book Grid */}
            {loading ? (
              <div className="no-results"><h3>Loading...</h3></div>
            ) : filteredBooks.length === 0 ? (
              <div className="no-results">
                <h3>No match found</h3>
                <p>Try a different search or browse popular categories above.</p>
              </div>
            ) : (
              <>
                <div className="book-grid">
                  {paginatedBooks.map((book, idx) => (
                    <div className="book-card" key={book.id || idx}>
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
                      <button className="details-button" onClick={() => handleViewDetails(book)}>View Detail</button>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pagination-controls">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage; 