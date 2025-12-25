import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import './NewCollection.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { fetchBooks, getImageUrl } from '../services/api';

const NewCollection = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1, infinite: true, dots: true } },
      { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 1, initialSlide: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } }
    ]
  };

  useEffect(() => {
    const getBooks = async () => {
      setLoading(true);
      try {
        const data = await fetchBooks();
        setBooks((data.content || data).slice(0, 6));
      } catch (error) {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    getBooks();
  }, []);

  return (
    <div className="new-collection-container">
      <h2 className="new-collection-title">New Collection</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
      <Slider {...settings}>
        {books.map((book, index) => (
          <div key={index} className="book-card-slider">
            <div className="book-card-slider-inner">
                <img src={getImageUrl(book.bookImage)} alt={book.title} className="book-card-slider-img" />
              <h3 className="book-card-slider-title">{book.title}</h3>
              <p className="book-card-slider-author">{book.author}</p>
                <p className="book-card-slider-price">Rs. {book.price}</p>
            </div>
          </div>
        ))}
      </Slider>
      )}
    </div>
  );
};

export default NewCollection; 