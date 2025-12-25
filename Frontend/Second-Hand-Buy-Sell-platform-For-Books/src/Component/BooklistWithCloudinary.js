import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useCart } from './CartContext';
import './Booklist.css';
import { toast } from 'react-toastify';
import { fetchBooks } from '../services/api';
import CloudinaryImage from '../components/CloudinaryImage';

const genres = ['All', 'Classic', 'Sci-Fi', 'Fantasy', 'Romance', 'Mystery', 'Science', 'History', 'Biography'];

const BookListWithCloudinary = () => {
  const [activeGenre, setActiveGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const getBooks = async () => {
      setLoading(true);
      try {
        const data = await fetchBooks();
        setBooks(data.content || data); // handle paginated or array response
        setFilteredBooks(data.content || data);
      } catch (error) {
        toast.error('Failed to fetch books.');
      } finally {
        setLoading(false);
      }
    };
    getBooks();
  }, []);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
      filterBooks(search, activeGenre);
    } else {
      setSearchQuery('');
      filterBooks('', activeGenre);
    }
    // eslint-disable-next-line
  }, [searchParams, activeGenre, books]);

  const filterBooks = (search, genre) => {
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
    if (genre !== 'All') {
      filtered = filtered.filter(book => book.genre === genre);
    }
    setFilteredBooks(filtered);
  };

  const handleGenreChange = (genre) => {
    setActiveGenre(genre);
    filterBooks(searchQuery, genre);
  };

  const handlePurchase = (book) => {
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

  const clearSearch = () => {
    setSearchQuery('');
    setActiveGenre('All');
    setFilteredBooks(books);
    navigate('/book-list');
  };

  return (
    <div className="booklist-page">
      <Navbar />
      <main className="booklist-main">
        <h1 className="booklist-title">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Explore Our Books'}
        </h1>
        {(searchQuery || activeGenre !== 'All') && (
          <div className="search-info">
            <p>
              {searchQuery && `Searching for: "${searchQuery}"`}
              {searchQuery && activeGenre !== 'All' && ' 2022 '}
              {activeGenre !== 'All' && `Genre: ${activeGenre}`}
            </p>
            <button onClick={clearSearch} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        )}
        <div className="genre-filters">
          {genres.map(genre => (
            <button
              key={genre}
              className={`genre-btn ${activeGenre === genre ? 'active' : ''}`}
              onClick={() => handleGenreChange(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="no-results"><h3>Loading books...</h3></div>
        ) : filteredBooks.length === 0 ? (
          <div className="no-results">
            <h3>No books found</h3>
            <p>Try adjusting your search terms or genre filter</p>
            <button onClick={clearSearch} className="clear-filters-btn">
              Show All Books
            </button>
          </div>
        ) : (
          <div className="book-grid">
            {filteredBooks.map(book => (
              <div key={book.id} className="book-card-item">
                {/* Using CloudinaryImage component for optimized image display */}
                <CloudinaryImage 
                  src={book.bookImage} 
                  alt={book.title} 
                  className="book-card-image"
                  width={300}
                  height={400}
                  crop="fill"
                  quality={85}
                  fallbackSrc="/placeholder-book.jpg"
                />
                <div className="book-card-content">
                  <h3 className="book-card-title">{book.title}</h3>
                  <p className="book-card-author">{book.author}</p>
                  <p className="book-card-description">{book.description}</p>
                  <div className="book-card-footer">
                    <p className="book-card-price">Rs. {book.price}</p>
                    <button onClick={() => handlePurchase(book)} className="purchase-btn">Purchase</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BookListWithCloudinary; 