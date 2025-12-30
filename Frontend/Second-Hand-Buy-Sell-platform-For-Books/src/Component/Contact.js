import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Contact.css";

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // For now we only prevent page reload – integrate with backend or email later.
  };

  return (
    <div className="contact-page">
      <Navbar />

      {/* Hero */}
      <section className="contact-hero">
        <div className="container">
          <h1>Get in Touch</h1>
          <p>
            We&apos;d love to hear from you! Whether you have questions about our
            products, need custom work, or just want to say hello, we&apos;re here to
            help.
          </p>
        </div>
      </section>

      {/* Main Contact Area */}
      <section className="contact-main">
        <div className="container contact-main-inner">
          {/* Contact Information Card */}
          <div className="contact-card">
            <h2 className="card-title">Contact Information</h2>
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <div>
                <h3>Email</h3>
                <p>support@lunasu-crochet.com</p>
                <p>hello@lunasu-crochet.com</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <div>
                <h3>Phone</h3>
                <p>9810063244</p>
                <p>Mon – Fri, 9:00 AM – 6:00 PM</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <div>
                <h3>Address</h3>
                <p>Lalitpur, Nepal</p>
                <p>Chapagaun</p>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">⏰</span>
              <div>
                <h3>Business Hours</h3>
                <p>Monday – Friday: 9:00 AM – 6:00 PM</p>
                <p>Saturday: 10:00 AM – 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="contact-card">
            <h2 className="card-title">Send us a Message</h2>
            <p className="card-subtitle">
              Fill out the form below and we&apos;ll get back to you within 24 hours.
            </p>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="inquiryType">What can we help you with?</label>
                <select id="inquiryType" name="inquiryType" defaultValue="general">
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Support</option>
                  <option value="custom">Custom Order</option>
                  <option value="wholesale">Wholesale Inquiry</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input id="name" type="text" placeholder="Enter your full name" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Brief description of your inquiry"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  rows="4"
                  placeholder="Please provide details about your inquiry..."
                ></textarea>
              </div>

              <button type="submit" className="submit-btn">
                Send Message
              </button>

              <p className="form-footnote">
                By submitting this form, you agree to our Privacy Policy and Terms
                of Service.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Quick Help + Follow Us */}
      <section className="contact-secondary">
        <div className="container contact-secondary-inner">
          <div className="contact-card">
            <h2 className="card-title">Quick Help</h2>
            <p className="card-subtitle">Frequently Asked Questions</p>
            <ul className="link-list">
              <li>Shipping &amp; Delivery</li>
              <li>Returns &amp; Exchanges</li>
              <li>Care Instructions</li>
              <li>Custom Orders</li>
            </ul>
          </div>

          <div className="contact-card">
            <h2 className="card-title">Follow Us</h2>
            <p className="card-subtitle">
              Stay connected for updates, behind-the-scenes content, and new product
              launches.
            </p>
            <div className="social-buttons">
              <button>Instagram</button>
              <button>Facebook</button>
              <button>Pinterest</button>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Orders & Wholesale */ }
      <section className="contact-secondary">
        <div className="container contact-secondary-inner">
          <div className="contact-card">
            <h2 className="card-title">Custom Orders</h2>
            <p className="card-subtitle">
              Looking for something special? We love creating custom crochet pieces
              tailored to your vision.
            </p>
            <ul className="bullet-list">
              <li>Custom colors and patterns</li>
              <li>Personalized gifts and baby sets</li>
              <li>Wedding and event decor</li>
              <li>Bulk orders for businesses</li>
            </ul>
            <button className="outline-btn">Learn More</button>
          </div>

          <div className="contact-card">
            <h2 className="card-title">Wholesale Inquiries</h2>
            <p className="card-subtitle">
              Interested in stocking our products in your store? We offer
              wholesale pricing for qualified retailers.
            </p>
            <ul className="bullet-list">
              <li>Competitive wholesale pricing</li>
              <li>Minimum order requirements</li>
              <li>Seasonal collections available</li>
              <li>Marketing support provided</li>
            </ul>
            <button className="outline-btn">Wholesale Info</button>
          </div>
        </div>
      </section>

      {/* Visit Our Studio */}
      <section className="contact-visit">
        <div className="container">
          <div className="contact-card visit-card">
            <h2 className="card-title">Visit Our Studio</h2>
            <p className="card-subtitle">
              Located in the heart of the Artisan District, our studio is open for
              visits by appointment.
            </p>
            <div className="map-placeholder">
              <span>Interactive Map</span>
              <p>123 Craft Street, Creative City, IN 123456</p>
            </div>
            <div className="visit-actions">
              <button className="outline-btn">Get Directions</button>
              <button className="outline-btn">Schedule Visit</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;



