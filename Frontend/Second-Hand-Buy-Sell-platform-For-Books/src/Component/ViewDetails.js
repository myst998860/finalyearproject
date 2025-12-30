import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './ViewDetails.css';
import { useCart } from './CartContext';
import { toast } from 'react-toastify';
import { getImageUrl } from '../services/api';

const defaultBook = {
  title: 'In Custody',
  author: 'Anita Desai',
  bookImage: 'https://images.saymedia-content.com/.image/t_share/MTgxMzEyODAwMDQ2NDU3OTU5/multiple-journeys-taken-by-deven-in-anita-desais-in-custody.jpg',
  image: 'https://images.saymedia-content.com/.image/t_share/MTgxMzEyODAwMDQ2NDU3OTU5/multiple-journeys-taken-by-deven-in-anita-desais-in-custody.jpg',
  category: 'Novel',
  price: 700,
  offer: 'Offer Ends December 31, 2024',
  description: `Step into the world of In Custody, a powerful novel by acclaimed Indian author Anita Desai. Set in India, this thought-provoking story follows Deven Sharma, a humble Hindi lecturer, whose dream of connecting with a great Urdu poet leads him into a world of fading culture, broken ideals, and personal struggle. Rich in themes of language, identity, and disillusionment, In Custody offers a poignant look at the clash between tradition and modernity in a changing society.`
};

const recommendations = [
  {
    title: 'David Copperfield',
    author: 'Charles Dickens',
    image: 'https://images.saymedia-content.com/.image/t_share/MTc0NDEzMzQ2ODY1NDI0MDA2/david-copperfield-by-charles-dickens-a-book-review.jpg',
    action: 'Exchange',
  },
  {
    title: 'In Custody',
    author: 'Anita Desai',
    image: 'https://images.saymedia-content.com/.image/t_share/MTgxMzEyODAwMDQ2NDU3OTU5/multiple-journeys-taken-by-deven-in-anita-desais-in-custody.jpg',
    action: 'Sell',
  },
  {
    title: 'Moby-Dick',
    author: 'Herman Melville',
    image: 'https://m.media-amazon.com/images/I/41KM5Ox6nZL._SY445_SX342_.jpg',
    action: 'Donate',
  },
  {
    title: 'The Book Thief',
    author: 'Markus Zusak',
    image: 'https://www.bookishelf.com/wp-content/uploads/2020/01/Book-Review-The-Book-Thief-by-Markus-Zusak-scaled.jpg',
    action: 'Exchange',
  },
];

const ViewDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const book = location.state && location.state.book ? location.state.book : defaultBook;

  // Get current user
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  };

  // Check if current user owns this book
  const isOwnBook = () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !book.user) return false;
    
    // Check if the book's user ID matches current user's ID
    return book.user.id === currentUser.userId || book.userId === currentUser.userId;
  };

  const handleAddToCart = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      toast.info('Please login or signup to add items to your cart.');
      navigate('/login');
      return;
    }

    // Check if user is trying to buy their own book
    if (isOwnBook()) {
      toast.warning('You cannot purchase your own book!');
      return;
    }

    addToCart(book);
    navigate('/cart');
  };

  const handleBuyNow = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      toast.info('Please login or signup to purchase books.');
      navigate('/login');
      return;
    }

    // Check if user is trying to buy their own book
    if (isOwnBook()) {
      toast.warning('You cannot purchase your own book!');
      return;
    }

    // Proceed to purchase flow (replace with your checkout logic)
    toast.info('Proceeding to purchase...');
    // Example: navigate('/checkout', { state: { book } });
  };

  // Check if buttons should be disabled
  const isOwnBookFlag = isOwnBook();

  return (
    <div className="view-details-page">
      <Navbar />
      <div className="vd-main">
        <div className="vd-left">
          <div className="vd-title-author">
            <h1>{book.title}<br /><span>-{book.author}</span></h1>
          </div>
          <img src={getImageUrl(book.bookImage || book.image)} alt={book.title} className="vd-book-img" />
        </div>
        <div className="vd-right">
          <div className="vd-category">
            <span role="img" aria-label="category" style={{fontSize:'1.5rem',marginRight:8}}>📖</span>
            <b>Category: {book.category}</b>
          </div>
          <div className="vd-desc">{book.description}</div>
          <div className="vd-price-row">
            <span className="vd-price-icon" role="img" aria-label="price">💳</span>
            <span className="vd-price">Rs. {book.price}/=</span>
          </div>
          <div className="vd-offer">*{book.offer}</div>
          
          {/* Show warning if user owns the book */}
          {isOwnBookFlag && (
            <div style={{
              background: '#fff3cd',
              color: '#856404',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '15px',
              border: '1px solid #ffeaa7',
              fontSize: '14px'
            }}>
              {/* ⚠️ This is your own book. You cannot purchase it. */}
            </div>
          )}
          
          <div className="vd-btn-row">
            <button 
              className="vd-btn vd-cart-btn" 
              onClick={handleAddToCart}
              disabled={isOwnBookFlag}
              style={{
                opacity: isOwnBookFlag ? 0.5 : 1,
                cursor: isOwnBookFlag ? 'not-allowed' : 'pointer'
              }}
            >
              <span role="img" aria-label="cart">🛒</span> Add to Cart
            </button>
            <button 
              className="vd-btn vd-buy-btn" 
              onClick={handleBuyNow}
              disabled={isOwnBookFlag}
              style={{
                opacity: isOwnBookFlag ? 0.5 : 1,
                cursor: isOwnBookFlag ? 'not-allowed' : 'pointer'
              }}
            >
              Buy product
            </button>
          </div>
        </div>
      </div>
      <div className="vd-recommend">
        <h2>You might also like this</h2>
        <div className="vd-recommend-list">
          {recommendations.map((rec, idx) => (
            <div className="vd-recommend-card" key={idx}>
              <div className="vd-recommend-cart-icon">🛒</div>
              <img src={rec.image} alt={rec.title} className="vd-recommend-img" />
              <div className="vd-recommend-title">{rec.title}<br /><span>{rec.author}</span></div>
              <button className="vd-recommend-action">{rec.action}</button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ViewDetails; 