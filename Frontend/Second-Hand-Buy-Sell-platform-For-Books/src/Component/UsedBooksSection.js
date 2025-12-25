import React from 'react';
import './UsedBooksSection.css';
import book1 from './assests/book1.jpeg';
import book2 from './assests/book2.jpg';
import book3 from './assests/book3.jpg';
import book4 from './assests/book4.jpg';
import book5 from './assests/book5.jpg';

const UsedBooksSection = () => {
  // URLs for the book covers, sourced to match the provided image
const books = [
  { id: 1, src: book1, alt: 'book1' },
  { id: 2, src: book2, alt: 'book2' },
  { id: 3, src: book3, alt: 'book3' },
  { id: 4, src: book4, alt: 'book4' },
  { id: 5, src: book5, alt: 'book5Re' },
];

  return (
    <section className="used-books-section">
      <div className="used-books-content">
        <h2 className="used-books-title">
          <span className="title-icon">✔</span>
          Used Books Starting at Just <br /> Rs. 150
        </h2>
        <p className="used-books-subtitle">
          Explore a Wide Range of Popular Used Books in Excellent Condition.
        </p>
        <button className="explore-books-btn">EXPLORE BOOKS</button>
      </div>
      <div className="bookshelf-container">
        <div className="books-on-shelf">
          {books.map(book => (
            <img key={book.id} src={book.src} alt={book.alt} className="book-on-shelf" />
          ))}
        </div>
        <div className="bookshelf"></div>
      </div>
    </section>
  );
};

export default UsedBooksSection; 