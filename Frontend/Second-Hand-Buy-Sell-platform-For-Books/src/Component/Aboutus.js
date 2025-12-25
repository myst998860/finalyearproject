import React from "react";
import Navbar from './Navbar';
import Footer from './Footer';
import "./Aboutus.css";

const AboutUs = () => {
  return (
    <div className="aboutus-container">
      <Navbar />

      {/* Hero Section */}
      <section className="aboutus-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Connecting Readers, 
            <span className="hero-highlight"> One Book at a Time</span>
          </h1>
          <p className="hero-subtitle">
            A community-driven platform where stories find new homes and knowledge flows freely
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Mission</h2>
            <p className="section-subtitle">
              We're on a mission to make books accessible, affordable, and sustainable for everyone
            </p>
          </div>
          
          <div className="mission-cards">
            <div className="mission-card">
              <div className="card-icon">📚</div>
              <h3>Accessibility</h3>
              <p>Making quality books available to everyone, regardless of their budget or location</p>
            </div>
            <div className="mission-card">
              <div className="card-icon">🌱</div>
              <h3>Sustainability</h3>
              <p>Promoting environmental consciousness through book reuse and recycling</p>
            </div>
            <div className="mission-card">
              <div className="card-icon">❤️</div>
              <h3>Community</h3>
              <p>Building a supportive network of readers, learners, and book enthusiasts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Story</h2>
              <p>
                Book Bridge was born from a simple observation: too many books were gathering dust on shelves while others struggled to find affordable reading material. We realized that every book has the potential to inspire, educate, and connect people across different walks of life.
              </p>
              <p>
                What started as a small community initiative has grown into a vibrant platform where students swap textbooks, families share children's books, and generous donors provide reading materials to those in need. Our community spans from individual readers to educational institutions, all united by a love for books and learning.
              </p>
              <div className="story-stats">
                <div className="stat-item">
                  <span className="stat-number">800+</span>
                  <span className="stat-label">Books Listed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">1K+</span>
                  <span className="stat-label">Active Members</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Partner Locations</span>
                </div>
              </div>
            </div>
            <div className="story-image">
              <img 
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Books and Community" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Values</h2>
            <p className="section-subtitle">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon">🤝</div>
              <h3>Trust</h3>
              <p>Building reliable connections between book owners and seekers</p>
            </div>
            <div className="value-item">
              <div className="value-icon">♻️</div>
              <h3>Sustainability</h3>
              <p>Reducing waste by giving books multiple lives</p>
            </div>
            <div className="value-item">
              <div className="value-icon">🎓</div>
              <h3>Education</h3>
              <p>Supporting lifelong learning and knowledge sharing</p>
            </div>
            <div className="value-item">
              <div className="value-icon">🌟</div>
              <h3>Inclusivity</h3>
              <p>Making reading accessible to everyone</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact-section">
        <div className="container">
          <div className="impact-content">
            <div className="impact-text">
              <h2>Our Impact</h2>
              <p>
                Since our launch, we've facilitated thousands of book exchanges, helping students save money on textbooks, families discover new stories, and communities build stronger connections through shared reading experiences.
              </p>
              <div className="impact-highlights">
                <div className="highlight-item">
                  <span className="highlight-number">5000+</span>
                  <span className="highlight-text">Books Exchanged</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-number">2000+</span>
                  <span className="highlight-text">Students Helped</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-number">100+</span>
                  <span className="highlight-text">Schools Supported</span>
                </div>
              </div>
            </div>
            <div className="impact-image">
              <img 
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Reading Impact" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Join Our Community</h2>
            <p>Be part of a movement that's making reading accessible to everyone</p>
            <div className="cta-buttons">
              <button className="cta-btn primary">Start Sharing Books</button>
              <button className="cta-btn secondary">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;