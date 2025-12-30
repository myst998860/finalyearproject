import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Aboutus.css";

const AboutUs = () => {
  return (
    <div className="about-page">
      <Navbar />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-inner container">
          <div className="about-hero-text">
            <p className="eyebrow">Our Story of</p>
            <h1>
              <span className="hero-title-main">lunasu</span>
            </h1>
            <p className="hero-description">
              Founded in 2024, Lunasu began as a passion project in a small
              home studio. Today, we are a community of artisans dedicated to creating beautiful, handmade crochet items that bring joy families worldwide.
             
            </p>
            <button className="primary-btn">Shop Our Collection</button>
          </div>

          <div className="about-hero-card">
            <div className="hero-card-inner">
              <span className="hero-image-placeholder"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-heading">
            <h2>Our Values</h2>
            <p>
              Every exchange is guided by our core values of accessibility,
              sustainability, and community.
            </p>
          </div>

          <div className="values-row">
            <div className="value-card">
              <div className="value-icon">❤️</div>
              <h3>Made with Love</h3>
              <p>
                Every listing is carefully reviewed so that each book feels
                special for its next reader.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">⭐</div>
              <h3>Premium Quality</h3>
              <p>
                We encourage honest condition ratings so books arrive exactly as
                expected.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Community Focused</h3>
              <p>
                We connect readers, donors, and institutions through
                book-sharing initiatives and drives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-heading">
            <h2>Meet Our Team</h2>
            <p>The people working behind the scenes to keep BookBridge alive.</p>
          </div>

          <div className="team-row">
            <div className="team-card">
              <div className="team-avatar"></div>
              <h3>Sarah Johnson</h3>
              <p className="team-role">Founder &amp; Lead Designer</p>
              <p className="team-bio">
                Started BookBridge to make quality reading accessible to every
                student on campus.
              </p>
            </div>
            <div className="team-card">
              <div className="team-avatar"></div>
              <h3>Emily Chen</h3>
              <p className="team-role">Product Lead</p>
              <p className="team-bio">
                Crafts seamless user experiences so it&apos;s easy to buy, sell,
                or donate books.
              </p>
            </div>
            <div className="team-card">
              <div className="team-avatar"></div>
              <h3>Maria Rodriguez</h3>
              <p className="team-role">Community Specialist</p>
              <p className="team-bio">
                Builds partnerships with libraries, NGOs, and student
                communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section">
        <div className="container">
          <div className="section-heading">
            <h2>Our Process</h2>
            <p>
              From listing to delivery, every step is designed to be simple,
              transparent, and secure.
            </p>
          </div>

          <div className="process-row">
            <div className="process-step">
              <div className="process-icon">✏️</div>
              <h3>List</h3>
              <p>Upload your pre-loved books with clear photos and details.</p>
            </div>
            <div className="process-step">
              <div className="process-icon">📦</div>
              <h3>Match</h3>
              <p>
                Buyers discover the right book through search, filters, and
                smart suggestions.
              </p>
            </div>
            <div className="process-step">
              <div className="process-icon">✅</div>
              <h3>Quality Check</h3>
              <p>Conditions are verified to ensure what you see is what you get.</p>
            </div>
            <div className="process-step">
              <div className="process-icon">🚚</div>
              <h3>Deliver</h3>
              <p>
                Books are handed over or shipped with care so they reach safely
                and on time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <div className="about-cta-inner">
            <h2>Ready to Experience BookBridge?</h2>
            <p>
              Explore thousands of pre-loved books or give your own collection a
              second life.
            </p>
            <div className="cta-actions">
              <button className="primary-btn light">Shop Now</button>
              <button className="secondary-btn light">Contact Us</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;